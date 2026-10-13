import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Icon, Logo, StatusPill } from './components/ui.jsx';
import { AdminDashboard } from './admin/Dashboard.jsx';
import { api, DEMO_MODE, SYNC_EVENT_NAME } from './api.js';
import { useAdminData } from './lib/useAdminData.js';
import { normalizeProducts, readStored, STORAGE_KEYS } from './lib/store.js';
import './styles.css';
import './admin/admin.css';

// Customer-facing contact and location. The address comes from the shared Google listing;
// do not replace it with a guessed street address.
const STORE_ADDRESS = 'Jl. Kali Buaran, RT.10/RW.7, Penggilingan, Kec. Cakung, Kota Jakarta Timur, DKI Jakarta 13940';
const STORE_MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Bibit+Lele+pak+abi%2C+Jl.+Kali+Buaran%2C+Penggilingan%2C+Cakung%2C+Jakarta+Timur';
const STORE_WA_URL = 'https://wa.me/6282123040643';
const WA_CHAT_URL = STORE_WA_URL;

const DEMO_PASSWORD = 'lelepakabi';
const ADMIN_SESSION_KEY = 'lelepakabi-admin-session';
const ADMIN_ROUTE_SEGMENT = '/adminlele';

const formatPrice = (value) => new Intl.NumberFormat('id-ID').format(Number(value) || 0);

// The storefront only shows what the admin set in the catalog. Stock counts stay in the admin.
const shopStatus = (product) => {
  if (product.status === 'Pre-order') return 'Pre-order';
  if (product.status === 'Tersedia') return 'Tersedia';
  return 'Tidak tersedia';
};

function Header() {
  const [open, setOpen] = useState(false);
  const goTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return <header className="site-header">
    <div className="container header-inner">
      <button className="brand-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Kembali ke atas"><Logo /></button>
      <nav className={`main-nav ${open ? 'open' : ''}`} aria-label="Navigasi utama">
        <button onClick={() => goTo('produk')}>Katalog</button>
        <button onClick={() => goTo('cara-pesan')}>Cara pesan</button>
        <button onClick={() => goTo('lokasi')}>Lokasi</button>
      </nav>
      <div className="header-actions">
        <a className="header-cta" href={WA_CHAT_URL} target="_blank" rel="noreferrer">Chat WhatsApp <Icon name="arrow" size={15} /></a>
      </div>
      <button className="menu-button" aria-label={open ? 'Tutup menu' : 'Buka menu'} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} size={23} /></button>
    </div>
  </header>;
}

function PriceList({ products, status }) {
  return <aside className="price-card" aria-label="Daftar harga bibit">
    <div className="price-card-head"><span>Ukuran</span><span>Harga / kantong</span></div>
    {status === 'ready' && products.map((product) => <div className="price-row" key={product.id}>
      <div><b>{product.size}</b><small>{product.note || 'Bibit lele'}</small></div>
      <div className="price-row-end"><strong>Rp {formatPrice(product.price)}</strong><StatusPill status={shopStatus(product)} small /></div>
    </div>)}
    {status === 'loading' && <div className="price-card-empty">Memuat harga…</div>}
    {status === 'error' && <div className="price-card-empty">Harga belum bisa dimuat. Silakan cek lewat WhatsApp.</div>}
    <a className="price-card-foot" href={WA_CHAT_URL} target="_blank" rel="noreferrer">Tanya stok lewat WhatsApp <Icon name="arrow" size={14} /></a>
  </aside>;
}

function Hero({ products, status }) {
  return <section className="hero">
    <div className="container hero-grid">
      <div className="hero-copy">
        <p className="hero-kicker">Penjualan bibit lele · Cakung, Jakarta Timur</p>
        <h1>Bibit lele per kantong, dipesan lewat WhatsApp.</h1>
        <p className="hero-text">Pilih ukuran yang sesuai dengan kolam Anda. Admin akan mengonfirmasi stok, total harga, dan pengiriman di chat.</p>
        <div className="hero-buttons">
          <a className="button button-primary" href="#produk">Pilih ukuran <Icon name="arrow" size={16} /></a>
          <a className="button button-ghost" href={WA_CHAT_URL} target="_blank" rel="noreferrer"><Icon name="message" size={16} /> Tanya dulu</a>
        </div>
      </div>
      <PriceList products={products} status={status} />
    </div>
  </section>;
}

function FactsStrip() {
  const facts = [
    ['Harga per kantong', 'Ukuran 3–8 cm, isi ± 1.000 ekor'],
    ['Stok dikonfirmasi', 'Admin cek sebelum pesanan dibuat'],
    ['Buka setiap hari', '07.00–23.00 WIB'],
    ['Datang langsung', 'Penggilingan, Cakung, Jakarta Timur'],
  ];
  return <div className="facts-strip"><div className="container facts-grid">
    {facts.map(([title, text]) => <div key={title}><b>{title}</b><span>{text}</span></div>)}
  </div></div>;
}

function ProductCard({ product, onOrder }) {
  const status = shopStatus(product);
  const unavailable = status === 'Tidak tersedia';
  const label = unavailable ? 'Tidak tersedia' : status === 'Pre-order' ? 'Tanya pre-order' : 'Pesan ukuran ini';
  return <article className={`product-card accent-${product.accent || 'mint'} ${unavailable ? 'is-unavailable' : ''}`}>
    <div className="product-head">
      <div><span className="product-category">{product.note || 'Bibit lele'}</span><h3>{product.size}</h3></div>
      <StatusPill status={status} small />
    </div>
    <div className="product-price"><span>Rp</span><strong>{formatPrice(product.price)}</strong><small>per kantong</small></div>
    <button disabled={unavailable} onClick={() => onOrder(product)} className="product-button">{label} <Icon name="arrow" size={15} /></button>
  </article>;
}

function Catalog({ products, status, onOrder }) {
  const available = products.filter((product) => shopStatus(product) === 'Tersedia').length;
  return <section className="catalog-section" id="produk">
    <div className="container">
      <div className="section-heading">
        <div>
          <h2>Pilih ukuran bibit</h2>
          <p>Harga per kantong. Stok bisa berubah sewaktu-waktu, jadi konfirmasi terakhir dilakukan lewat WhatsApp.</p>
        </div>
        {status === 'ready' && products.length > 0 && <span className="stock-summary">{available} dari {products.length} ukuran tersedia</span>}
      </div>
      {status === 'loading' && <div className="catalog-message">Memuat katalog…</div>}
      {status === 'error' && <div className="catalog-message is-error">Katalog belum bisa dimuat. Hubungi kami lewat WhatsApp untuk cek stok.</div>}
      {status === 'ready' && products.length === 0 && <div className="catalog-message">Katalog sedang disiapkan. Hubungi kami lewat WhatsApp untuk info ukuran dan harga.</div>}
      {status === 'ready' && products.length > 0 && <div className="products-grid">{products.map((product) => <ProductCard key={product.id} product={product} onOrder={onOrder} />)}</div>}
      <div className="catalog-bottom">
        <p>Butuh jumlah besar atau ukuran khusus?</p>
        <a href={`${WA_CHAT_URL}?text=${encodeURIComponent('Halo, saya ingin konsultasi pembelian dalam jumlah besar.')}`} target="_blank" rel="noreferrer">Bicarakan dengan kami <Icon name="arrow" size={15} /></a>
      </div>
    </div>
  </section>;
}

function LocationSection() {
  return <section className="location-section" id="lokasi">
    <div className="container location-grid">
      <div>
        <h2>Datang langsung ke lokasi kami</h2>
        <p>Sebaiknya chat dulu sebelum berkunjung agar kami bisa menyiapkan bibit dan pesanan Anda.</p>
      </div>
      <div className="location-card">
        <div className="location-row"><Icon name="mapPin" size={18} /><div><small>Alamat</small><b>{STORE_ADDRESS}</b></div></div>
        <div className="location-row"><Icon name="clock" size={18} /><div><small>Jam buka</small><b>Setiap hari, 07.00–23.00 WIB</b></div></div>
        <div className="location-actions">
          <a className="button button-dark" href={STORE_MAP_URL} target="_blank" rel="noreferrer">Buka di Google Maps <Icon name="external" size={15} /></a>
          <a className="button button-outline" href={`${WA_CHAT_URL}?text=${encodeURIComponent('Halo, saya mau tanya lokasi dan ketersediaan bibit lele.')}`} target="_blank" rel="noreferrer">Chat sebelum datang</a>
        </div>
      </div>
    </div>
  </section>;
}

function HowToOrder() {
  const steps = [
    ['Pilih ukuran', 'Sesuaikan ukuran bibit dengan target dan kondisi kolam Anda.'],
    ['Kirim pesan', 'Tombol pesan membuka WhatsApp dengan ukuran yang Anda pilih.'],
    ['Konfirmasi', 'Admin mengecek stok dan menghitung total, termasuk diskon dan ongkir bila ada.'],
  ];
  return <section className="how-section" id="cara-pesan">
    <div className="container">
      <h2>Cara pesan</h2>
      <ol className="steps-grid">
        {steps.map(([title, text], index) => <li className="step" key={title}><span className="step-number">{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}
      </ol>
    </div>
  </section>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="container footer-inner">
      <div><Logo light /><p>Penjualan bibit lele per kantong di Cakung, Jakarta Timur.</p></div>
      <div className="footer-col"><b>Kontak</b><a href={WA_CHAT_URL} target="_blank" rel="noreferrer">WhatsApp +62 821-2304-0643</a><a href={STORE_MAP_URL} target="_blank" rel="noreferrer">Alamat di Google Maps</a></div>
      <div className="footer-col"><b>Jam buka</b><span>Setiap hari, 07.00–23.00 WIB</span></div>
    </div>
    <div className="container footer-bottom"><span>© 2026 lelepakabi</span></div>
  </footer>;
}

function AdminLoginPage({ onLogin, onBack }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError('');
    try {
      await onLogin(password);
    } catch (loginError) {
      setError(loginError.message || 'Gagal masuk. Coba lagi.');
      setBusy(false);
    }
  };
  return <main className="admin-login-page">
    <div className="admin-login-card">
      <button className="brand-button admin-login-brand" onClick={onBack} aria-label="Kembali ke toko"><Logo /></button>
      <h1>Masuk ke dashboard</h1>
      <p>Khusus admin lelepakabi. Sesi tetap aktif di perangkat ini sampai Anda keluar.</p>
      <form onSubmit={submit} className="admin-login-form">
        <label>Kata sandi<input type="password" autoFocus value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} autoComplete="current-password" /></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button button-dark full-button" type="submit" disabled={busy || !password}>{busy ? 'Memeriksa…' : 'Masuk ke dashboard'} {!busy && <Icon name="arrow" size={16} />}</button>
      </form>
      {DEMO_MODE && <p className="demo-hint">Mode demo lokal. Kata sandi: <code>{DEMO_PASSWORD}</code></p>}
      <button className="login-back-link" onClick={onBack}>Kembali ke halaman toko</button>
    </div>
  </main>;
}

// Wires the dashboard to either the Worker (remoteSeed = collections from the server) or the
// browser (remoteSeed = null, demo mode).
function AdminApp({ remoteSeed, onLogout, onViewStore }) {
  const data = useAdminData(remoteSeed);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    const handleSync = (event) => setSyncError(event.detail.ok ? '' : event.detail.message || 'Gagal menyimpan.');
    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    return () => window.removeEventListener(SYNC_EVENT_NAME, handleSync);
  }, []);

  return <>
    {syncError && <div className="sync-banner" role="alert">Perubahan belum tersimpan ke server: {syncError} Periksa koneksi lalu ulangi.</div>}
    <AdminDashboard data={data} onLogout={onLogout} onViewStore={onViewStore} />
  </>;
}

const getSiteBase = (pathname) => {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  if (cleanPath.endsWith(ADMIN_ROUTE_SEGMENT)) return cleanPath.slice(0, -ADMIN_ROUTE_SEGMENT.length);
  return cleanPath === '/' ? '' : cleanPath;
};

function getInitialRoute() {
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get('adminlele') === '1') {
    const base = getSiteBase(currentUrl.pathname);
    const adminPath = `${base}${ADMIN_ROUTE_SEGMENT}`;
    window.history.replaceState({}, '', adminPath);
    return adminPath;
  }
  return currentUrl.pathname;
}

export function App() {
  const [routePath, setRoutePath] = useState(getInitialRoute);
  const [adminSession, setAdminSession] = useState(() => (DEMO_MODE ? localStorage.getItem(ADMIN_SESSION_KEY) === 'active' : false));
  const [sessionChecked, setSessionChecked] = useState(DEMO_MODE);
  const [remoteCatalog, setRemoteCatalog] = useState({ status: DEMO_MODE ? 'ready' : 'loading', products: [] });
  const [remoteSeed, setRemoteSeed] = useState(null);

  useEffect(() => {
    if (DEMO_MODE) return;
    api.catalog()
      .then((list) => setRemoteCatalog({ status: 'ready', products: Array.isArray(list) ? list : [] }))
      .catch(() => setRemoteCatalog({ status: 'error', products: [] }));
    api.session()
      .then((data) => setAdminSession(Boolean(data.authenticated)))
      .catch(() => setAdminSession(false))
      .finally(() => setSessionChecked(true));
  }, []);

  // Load the admin collections once a session exists. The dashboard renders only after this.
  useEffect(() => {
    if (DEMO_MODE || !adminSession) return;
    api.adminData()
      .then((data) => setRemoteSeed(data))
      .catch((error) => { if (error.status === 401) setAdminSession(false); });
  }, [adminSession]);

  useEffect(() => {
    const handlePopState = () => setRoutePath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const siteBase = getSiteBase(routePath);
  const isAdminRoute = routePath.replace(/\/+$/, '').endsWith(ADMIN_ROUTE_SEGMENT);
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoutePath(window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goToStore = () => navigate(siteBase ? `${siteBase}/` : '/');

  const login = async (password) => {
    if (DEMO_MODE) {
      if (password !== DEMO_PASSWORD) throw new Error('Kata sandi belum tepat. Coba lagi.');
      localStorage.setItem(ADMIN_SESSION_KEY, 'active');
    } else {
      await api.login(password);
    }
    setAdminSession(true);
  };

  const logout = async () => {
    if (DEMO_MODE) localStorage.removeItem(ADMIN_SESSION_KEY);
    else await api.logout().catch(() => {});
    setRemoteSeed(null);
    setAdminSession(false);
    goToStore();
  };

  const order = (product) => window.open(`${STORE_WA_URL}?text=${encodeURIComponent(`Halo lelepakabi, saya ingin pesan bibit lele ukuran ${product.size}. Mohon info ketersediaan dan pengirimannya ya.`)}`, '_blank', 'noopener,noreferrer');

  if (isAdminRoute) {
    if (!sessionChecked) return <div className="admin-loading">Memeriksa sesi…</div>;
    if (!adminSession) return <AdminLoginPage onLogin={login} onBack={goToStore} />;
    if (!DEMO_MODE && !remoteSeed) return <div className="admin-loading">Memuat data…</div>;
    return <AdminApp key={DEMO_MODE ? 'demo' : 'remote'} remoteSeed={DEMO_MODE ? null : remoteSeed} onLogout={logout} onViewStore={goToStore} />;
  }

  // Demo mode reads the catalog the admin saved in this browser; otherwise it comes from the Worker.
  const products = DEMO_MODE
    ? normalizeProducts(readStored(STORAGE_KEYS.products, null))
    : remoteCatalog.products;
  const catalogStatus = DEMO_MODE ? 'ready' : remoteCatalog.status;

  return <div className="storefront"><Header /><main><Hero products={products} status={catalogStatus} /><FactsStrip /><Catalog products={products} status={catalogStatus} onOrder={order} /><HowToOrder /><LocationSection /></main><Footer /></div>;
}

// Only mount when this file runs as the app entry, so tests can import App directly.
if (typeof document !== 'undefined' && document.getElementById('root')) {
  createRoot(document.getElementById('root')).render(<App />);
}
