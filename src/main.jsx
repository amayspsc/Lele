import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './api';
import './styles.css';

const STORE_ADDRESS = 'Jl. Kali Buaran, RT.10/RW.7, Penggilingan, Kec. Cakung, Kota Jakarta Timur, DKI Jakarta 13940';
const STORE_MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Bibit+Lele+pak+abi%2C+Jl.+Kali+Buaran%2C+Penggilingan%2C+Cakung%2C+Jakarta+Timur';
const STORE_WA_URL = 'https://wa.me/6282123040643';
const WA_CHAT_URL = STORE_WA_URL;
// Demo mode is used for the static GitHub Pages build only. The Cloudflare build talks to /api.
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const DEMO_PASSWORD = 'lelepakabi';
const LOW_STOCK_THRESHOLD = 10;
const STOCK_STATUSES = ['Tersedia', 'Stok menipis', 'Pre-order', 'Tidak tersedia'];
const DEFAULT_STOCK_CATEGORIES = ['Bibit kecil', 'Bibit favorit', 'Bibit pembesaran', 'Bibit ukuran besar'];

const DEFAULT_PRODUCTS = [
  { id: 1, size: '3–4 cm', category: 'Bibit kecil', price: 180000, status: 'Tersedia', stock: 120, note: 'Cocok untuk pemula', accent: 'mint', sold: '1.000 ekor' },
  { id: 2, size: '4–5 cm', category: 'Bibit favorit', price: 215000, status: 'Tersedia', stock: 86, note: 'Paling banyak dipesan', accent: 'orange', sold: '1.000 ekor', popular: true },
  { id: 3, size: '5–6 cm', category: 'Bibit pembesaran', price: 260000, status: 'Pre-order', stock: 34, note: 'Lebih cepat dibesarkan', accent: 'blue', sold: '1.000 ekor' },
  { id: 4, size: '7–8 cm', category: 'Bibit ukuran besar', price: 340000, status: 'Tidak tersedia', stock: 0, note: 'Stok sedang kosong', accent: 'violet', sold: '1.000 ekor' },
];

const formatPrice = (value) => new Intl.NumberFormat('id-ID').format(Number(value) || 0);
const formatShortPrice = (value) => {
  const number = Number(value) || 0;
  return number >= 1000000 ? `${(number / 1000000).toFixed(1).replace('.', ',')} jt` : `${Math.round(number / 1000)} rb`;
};
const getStockStatus = (product) => {
  const savedStatus = product.status === 'Habis' ? 'Tidak tersedia' : product.status;
  const quantity = Number(product.stock) || 0;
  if (savedStatus === 'Tersedia') return quantity <= 0 ? 'Tidak tersedia' : quantity <= LOW_STOCK_THRESHOLD ? 'Stok menipis' : 'Tersedia';
  if (savedStatus === 'Stok menipis') return quantity <= 0 ? 'Tidak tersedia' : quantity > LOW_STOCK_THRESHOLD ? 'Tersedia' : 'Stok menipis';
  return STOCK_STATUSES.includes(savedStatus) ? savedStatus : 'Tersedia';
};
const stockStatusClass = (status) => status === 'Tersedia' ? 'available' : status === 'Pre-order' ? 'preorder' : status === 'Stok menipis' ? 'lowstock' : 'soldout';


function Icon({ name, size = 20, stroke = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    arrow: <><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></>,
    arrowUp: <><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
    chevron: <path d="m6 9 6 6 6-6"/>,
    close: <><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    external: <><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.2 1-1.8 1.4-1.8 2.7"/><path d="M12 17h.01"/></>,
    leaf: <><path d="M20.5 3.5C13.8 3.3 5 6.3 5 13.1A5.9 5.9 0 0 0 10.9 19c6.8 0 9.8-8.8 9.6-15.5Z"/><path d="M4 21c2.5-5.2 6.1-8.3 11-10.5"/></>,
    list: <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/></>,
    menu: <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>,
    mapPin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 8.7 8.7 0 0 1-4-.9L3 21l1.8-4.2A8.3 8.3 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></>,
    package: <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></>,
    receipt: <><path d="M4 3h16v18l-4-2-4 2-4-2-4 2V3Z"/><path d="M8 8h8M8 12h8M8 16h4"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m8 14 4-4 4 3 5-7"/></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.6h-.1a1.7 1.7 0 0 0-1.1 1.4Z"/></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>,
    truck: <><path d="M3 6h11v11H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h16v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"/><path d="M16 14h.01"/></>,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

function Logo({ light = false, compact = false }) {
  return <div className={`logo ${light ? 'logo-light' : ''} ${compact ? 'logo-compact' : ''}`}>
    <span className="logo-mark"><span></span><span></span></span>
    <span>lele<span>pakabi</span></span>
  </div>;
}

function StatusPill({ status, small = false }) {
  return <span className={`status-pill ${stockStatusClass(status)} ${small ? 'small' : ''}`}><i></i>{status}</span>;
}

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
      <div><b>{product.size}</b><small>{product.category || 'Bibit lele'}</small></div>
      <div className="price-row-end"><strong>Rp {formatPrice(product.price)}</strong><StatusPill status={getStockStatus(product)} small /></div>
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
  const status = getStockStatus(product);
  const unavailable = status === 'Tidak tersedia';
  const label = unavailable ? 'Tidak tersedia' : status === 'Pre-order' ? 'Tanya pre-order' : status === 'Stok menipis' ? 'Pesan sebelum habis' : 'Pesan ukuran ini';
  return <article className={`product-card accent-${product.accent || 'mint'} ${unavailable ? 'is-unavailable' : ''}`}>
    <div className="product-head">
      <div><span className="product-category">{product.category || 'Bibit lele'}</span><h3>{product.size}</h3></div>
      <StatusPill status={status} small />
    </div>
    <p className="product-note">{product.note}</p>
    <div className="product-price"><span>Rp</span><strong>{formatPrice(product.price)}</strong><small>per kantong</small></div>
    <button disabled={unavailable} onClick={() => onOrder(product)} className="product-button">{label} <Icon name="arrow" size={15} /></button>
  </article>;
}

function Catalog({ products, status, onOrder }) {
  const available = products.filter((product) => ['Tersedia', 'Stok menipis'].includes(getStockStatus(product))).length;
  return <section className="catalog-section" id="produk">
    <div className="container">
      <div className="section-heading">
        <div>
          <h2>Pilih ukuran bibit</h2>
          <p>Harga per kantong. Stok bisa berubah sewaktu-waktu, jadi konfirmasi terakhir dilakukan lewat WhatsApp.</p>
        </div>
        {status === 'ready' && <span className="stock-summary">{available} dari {products.length} ukuran tersedia</span>}
      </div>
      {status === 'loading' && <div className="catalog-message">Memuat katalog…</div>}
      {status === 'error' && <div className="catalog-message is-error">Katalog belum bisa dimuat. Hubungi kami lewat WhatsApp untuk cek stok.</div>}
      {status === 'ready' && <div className="products-grid">{products.map((product) => <ProductCard key={product.id} product={product} onOrder={onOrder} />)}</div>}
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
        <button className="button button-dark full-button" type="submit" disabled={busy || !password}>{busy ? 'Memeriksa…' : 'Masuk'} {!busy && <Icon name="arrow" size={16} />}</button>
      </form>
      {DEMO_MODE && <p className="demo-hint">Mode demo lokal. Kata sandi: <code>{DEMO_PASSWORD}</code></p>}
      <button className="login-back-link" onClick={onBack}>Kembali ke halaman toko</button>
    </div>
  </main>;
}

const TRANSACTION_STATUSES = ['Menunggu pembayaran', 'Dibayar', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
const DEFAULT_TRANSACTIONS = [
  { id: 'trx-1001', invoice: 'INV/LP/2026/001', date: '2026-09-29', customer: 'Andi Rahman', phone: '0812-3456-7890', size: '4–5 cm', category: 'Bibit favorit', quantity: 3, unitPrice: 215000, status: 'Menunggu pembayaran', payment: 'Transfer bank' },
  { id: 'trx-1002', invoice: 'INV/LP/2026/002', date: '2026-09-28', customer: 'Dewi Sari', phone: '0813-4567-8901', size: '3–4 cm', category: 'Bibit kecil', quantity: 2, unitPrice: 180000, status: 'Dikirim', payment: 'QRIS' },
  { id: 'trx-1003', invoice: 'INV/LP/2026/003', date: '2026-09-27', customer: 'Bambang Yulianto', phone: '0815-6789-0123', size: '5–6 cm', category: 'Bibit pembesaran', quantity: 5, unitPrice: 260000, status: 'Selesai', payment: 'Transfer bank' },
];
const DEFAULT_EXPENSES = [
  { id: 'exp-1', date: '2026-09-29', description: 'Pakan dan vitamin bibit', category: 'Operasional', amount: 425000 },
  { id: 'exp-2', date: '2026-09-26', description: 'Ongkos kirim pesanan', category: 'Pengiriman', amount: 180000 },
  { id: 'exp-3', date: '2026-09-24', description: 'Perawatan kolam', category: 'Perawatan', amount: 350000 },
];
const orderSubtotal = (order) => Number(order.subtotal ?? (Number(order.quantity) || 0) * (Number(order.unitPrice) || 0));
const orderDiscount = (order) => Math.max(0, Number(order.discount) || 0);
const orderTotal = (order) => order.total !== undefined && order.total !== null && Number.isFinite(Number(order.total)) ? Number(order.total) : Math.max(0, orderSubtotal(order) - orderDiscount(order) + (Number(order.shippingFee) || 0));
const isRevenueOrder = (order) => ['Dibayar', 'Diproses', 'Dikirim', 'Selesai'].includes(order.status);
const formatDate = (value) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));

function AdminSidebar({ active, setActive, onLogout, onGoStore, pendingCount }) {
  const items = [
    ['overview', 'Ringkasan', 'dashboard'], ['transactions', 'Transaksi', 'list'], ['invoices', 'Invoice', 'receipt'],
    ['finance', 'Keuangan', 'wallet'], ['expenses', 'Pengeluaran', 'chart'], ['stock', 'Stok & katalog', 'package'], ['store', 'Toko', 'external'],
  ];
  return <aside className="admin-sidebar"><div className="admin-brand"><Logo light /><span className="admin-tag">ADMIN</span></div>
    <div className="admin-profile"><div className="profile-avatar">LP</div><div><b>Admin lelepakabi</b><span>Administrator</span></div><Icon name="chevron" size={15} /></div>
    <div className="sidebar-section"><span className="sidebar-label">Workspace</span>{items.map(([key, label, icon]) => <button key={key} className={`${active === key ? 'active' : ''} ${key === 'store' ? 'mobile-store-link' : ''}`} onClick={() => key === 'store' ? onGoStore() : setActive(key)} aria-label={key === 'store' ? 'Kembali ke toko' : label}><Icon name={icon} size={17} /> {label}{key === 'transactions' && pendingCount > 0 && <span className="nav-count alert">{pendingCount}</span>}</button>)}</div>
    <div className="sidebar-section sidebar-bottom"><span className="sidebar-label">Toko</span><button onClick={onGoStore}><Icon name="external" size={17} /> Lihat toko</button></div>
    <button className="logout-button" onClick={onLogout}><Icon name="logout" size={17} /> Keluar dari dashboard</button>
  </aside>;
}

function MetricCard({ icon, label, value, trend, accent }) {
  return <div className={`metric-card ${accent}`}><div className="metric-top"><span className="metric-icon"><Icon name={icon} size={18} /></span>{trend && <span className="trend"><Icon name="arrowUp" size={12} /> {trend}</span>}</div><span className="metric-label">{label}</span><strong>{value}</strong></div>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><span className="page-overline">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function TransactionTable({ transactions, onStatusChange, onInvoice }) {
  return <div className="dashboard-panel data-panel"><div className="table-scroll"><table className="admin-data-table transaction-table"><thead><tr><th>PELANGGAN</th><th>TANGGAL / INVOICE</th><th>ITEM</th><th>TOTAL</th><th>STATUS</th><th></th></tr></thead><tbody>{transactions.map((order) => <tr key={order.id}>
    <td><b>{order.customer}</b><small>{order.phone}</small></td><td><b>{formatDate(order.date)}</b><small>{order.invoice}</small></td><td><b>{order.category || 'Bibit lele'} · {order.size}</b><small>{order.quantity} kantong · {order.payment}</small>{(orderDiscount(order) > 0 || Number(order.shippingFee) > 0) && <small>Diskon Rp {formatPrice(orderDiscount(order))} · Ongkir Rp {formatPrice(order.shippingFee || 0)}</small>}</td><td><b>Rp {formatPrice(orderTotal(order))}</b></td>
    <td>{onStatusChange ? <select aria-label={`Status ${order.invoice}`} className={`order-status-select status-${order.status.toLowerCase().replaceAll(' ', '-')}`} value={order.status} onChange={(e) => onStatusChange(order.id, e.target.value)}>{TRANSACTION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select> : <span className={`invoice-status status-${order.status.toLowerCase().replaceAll(' ', '-')}`}>{order.status}</span>}</td><td><button className="small-action" onClick={() => onInvoice(order)}>Invoice</button></td>
  </tr>)}</tbody></table>{transactions.length === 0 && <div className="empty-state">Tidak ada transaksi yang cocok.</div>}</div></div>;
}

function StockTable({ products, draftProducts, setDraftProducts, onSave }) {
  const [categoryFilter, setCategoryFilter] = useState('Semua kategori');
  const [statusFilter, setStatusFilter] = useState('Semua status');
  const categories = [...new Set([...DEFAULT_STOCK_CATEGORIES, ...draftProducts.map((product) => product.category || 'Bibit lele')])];
  const statusCounts = STOCK_STATUSES.reduce((counts, status) => ({ ...counts, [status]: draftProducts.filter((product) => getStockStatus(product) === status).length }), {});
  const filteredProducts = draftProducts.filter((product) => (categoryFilter === 'Semua kategori' || (product.category || 'Bibit lele') === categoryFilter) && (statusFilter === 'Semua status' || getStockStatus(product) === statusFilter));
  const update = (id, key, value) => setDraftProducts((previous) => previous.map((product) => {
    if (product.id !== id) return product;
    const quantity = Number(product.stock) || 0;
    if (key === 'price') return { ...product, price: Math.max(0, Number(value) || 0) };
    if (key === 'category') return { ...product, category: value };
    if (key === 'status') {
      let status = value;
      if (status === 'Tersedia' && quantity <= LOW_STOCK_THRESHOLD) status = quantity <= 0 ? 'Tidak tersedia' : 'Stok menipis';
      if (status === 'Stok menipis' && quantity <= 0) status = 'Tidak tersedia';
      return { ...product, status };
    }
    if (key === 'stock') {
      const nextQuantity = Math.max(0, Number(value) || 0);
      const savedStatus = product.status === 'Habis' ? 'Tidak tersedia' : product.status;
      let status = savedStatus;
      if (['Tersedia', 'Stok menipis'].includes(savedStatus) || (savedStatus === 'Tidak tersedia' && quantity === 0)) {
        status = nextQuantity <= 0 ? 'Tidak tersedia' : nextQuantity <= LOW_STOCK_THRESHOLD ? 'Stok menipis' : 'Tersedia';
      }
      return { ...product, stock: nextQuantity, status };
    }
    return product;
  }));
  const chooseStatus = (status) => setStatusFilter(statusFilter === status ? 'Semua status' : status);
  return <div className="dashboard-panel stock-panel">
    <div className="panel-head"><div><h3>Inventaris bibit</h3><p>Kategorikan produk, pantau stok, dan atur status katalog.</p></div><span className="last-updated"><span className="green-dot"></span> Tersimpan setelah dikonfirmasi</span></div>
    <div className="stock-status-cards">{STOCK_STATUSES.map((status) => <button key={status} className={`stock-status-card ${stockStatusClass(status)} ${statusFilter === status ? 'selected' : ''}`} onClick={() => chooseStatus(status)}><span>{status}</span><b>{statusCounts[status]}</b></button>)}</div>
    <div className="stock-filter-row"><label>Kategori<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>Semua kategori</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Semua status</option>{STOCK_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label><span>{filteredProducts.length} produk</span><button className="text-button" onClick={() => { setCategoryFilter('Semua kategori'); setStatusFilter('Semua status'); }}>Reset filter</button></div><datalist id="stock-category-options">{categories.map((category) => <option key={category} value={category} />)}</datalist>
    <div className="table-scroll"><table className="stock-table"><thead><tr><th>PRODUK / UKURAN</th><th>KATEGORI</th><th>HARGA / 1.000 EKOR</th><th>STOK KANTONG</th><th>STATUS INVENTARIS</th></tr></thead><tbody>{filteredProducts.map((product) => {
      const status = getStockStatus(product);
      return <tr key={product.id}><td><div className="table-product"><div className={`table-thumb ${product.accent}`}><span>{product.size.split('–')[0]}</span></div><div><b>Bibit lele {product.size}</b><small>{product.note}</small></div></div></td><td><input className="category-input" list="stock-category-options" aria-label={`Kategori bibit ${product.size}`} value={product.category || 'Bibit lele'} onChange={(event) => update(product.id, 'category', event.target.value)} /></td><td><div className="price-input"><span>Rp</span><input aria-label={`Harga bibit ${product.size}`} type="number" min="0" step="5000" value={product.price} onChange={(event) => update(product.id, 'price', event.target.value)} /></div></td><td><div className="stock-quantity-control"><input className="stock-number-input" aria-label={`Stok bibit ${product.size}`} type="number" min="0" value={product.stock ?? 0} onChange={(event) => update(product.id, 'stock', event.target.value)} /><small>kantong</small></div></td><td><select className={`status-select ${stockStatusClass(status)}`} value={status} onChange={(event) => update(product.id, 'status', event.target.value)}>{STOCK_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></td></tr>;
    })}</tbody></table>{filteredProducts.length === 0 && <div className="empty-state">Tidak ada produk untuk filter ini.</div>}</div>
    <div className="panel-footer"><span><Icon name="help" size={16} /> Stok 1–{LOW_STOCK_THRESHOLD} kantong otomatis ditandai menipis.</span><button className="button button-dark save-button" onClick={onSave}>Simpan inventaris <Icon name="arrow" size={15} /></button></div>
  </div>;
}

function OrderModal({ products, onClose, onSave }) {
  const [form, setForm] = useState({ customer: '', phone: '', size: products[0]?.size || '', quantity: 1, status: 'Menunggu pembayaran', payment: 'Transfer bank', discountType: 'Nominal', discountValue: 0, shippingFee: 0, note: '' });
  const selected = products.find((product) => product.size === form.size) || products[0];
  const quantity = Math.max(1, Number(form.quantity) || 1);
  const unitPrice = Number(selected?.price) || 0;
  const subtotal = quantity * unitPrice;
  const discountInput = Math.max(0, Number(form.discountValue) || 0);
  const normalizedDiscountInput = form.discountType === 'Persen' ? Math.min(100, discountInput) : discountInput;
  const discount = Math.min(subtotal, form.discountType === 'Persen' ? Math.round(subtotal * normalizedDiscountInput / 100) : normalizedDiscountInput);
  const shippingFee = Math.max(0, Number(form.shippingFee) || 0);
  const total = subtotal - discount + shippingFee;
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    if (saving || !form.customer.trim() || !form.phone.trim() || !selected || Number(form.quantity) < 1) return;
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSaving(true);
    setSaveError('');
    try {
      await onSave({ id: `trx-${Date.now()}`, invoice: `INV/LP/${today.getFullYear()}/${String(Date.now()).slice(-5)}`, date, customer: form.customer.trim(), phone: form.phone.trim(), size: selected.size, category: selected.category || 'Bibit lele', quantity, unitPrice, subtotal, discount, discountType: form.discountType, discountValue: normalizedDiscountInput, shippingFee, total, note: form.note.trim(), status: form.status, payment: form.payment });
    } catch (error) {
      setSaveError(error.message || 'Penjualan belum tersimpan. Coba lagi.');
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="admin-dialog sale-dialog" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button><span className="page-overline">PENJUALAN WHATSAPP / MANUAL</span><h2>Catat penjualan bibit</h2><p>Input pesanan yang sudah dikonfirmasi admin. Harga produk terisi otomatis; inventaris tidak berubah dari transaksi ini.</p>
    <form className="admin-form" onSubmit={submit}>
      <label>Nama pelanggan<input required value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} placeholder="Nama lengkap" /></label>
      <label>Nomor WhatsApp<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="08xx xxxx xxxx" /></label>
      <div className="form-row"><label>Kategori / ukuran<select value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })}>{products.map((product) => <option key={product.id} value={product.size}>{product.category || 'Bibit lele'} · {product.size}</option>)}</select></label><label>Jumlah kantong<input required type="number" min="1" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label></div>
      <div className="form-row"><label>Diskon<select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value })}><option>Nominal</option><option>Persen</option></select><input aria-label="Nilai diskon" type="number" min="0" max={form.discountType === 'Persen' ? 100 : undefined} step={form.discountType === 'Persen' ? 1 : 1000} value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: event.target.value })} /></label><label>Ongkos kirim (Rp)<input type="number" min="0" step="1000" value={form.shippingFee} onChange={(event) => setForm({ ...form, shippingFee: event.target.value })} /></label></div>
      <div className="form-row"><label>Status pembayaran<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{TRANSACTION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label><label>Metode pembayaran<select value={form.payment} onChange={(event) => setForm({ ...form, payment: event.target.value })}><option>Transfer bank</option><option>QRIS</option><option>Tunai</option></select></label></div>
      <label>Catatan penjualan / keuangan<textarea rows="2" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Contoh: uang muka, alamat kirim, kesepakatan harga…" /></label>
      <div className="sale-calculation"><div><span>{quantity} × Rp {formatPrice(unitPrice)} · {selected?.category || 'Bibit lele'} {selected?.size}</span><b>Rp {formatPrice(subtotal)}</b></div><div><span>Diskon {form.discountType === 'Persen' ? `(${normalizedDiscountInput}%)` : ''}</span><b>− Rp {formatPrice(discount)}</b></div><div><span>Ongkos kirim</span><b>Rp {formatPrice(shippingFee)}</b></div><div className="sale-grand-total"><span>Total tagihan</span><b>Rp {formatPrice(total)}</b></div></div>
      {saveError && <div className="form-error" role="alert">{saveError}</div>}<button className="button button-dark full-button" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan & buat invoice'} {!saving && <Icon name="arrow" size={15} />}</button>
    </form></div></div>;
}

function ExpenseModal({ onClose, onSave }) {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [form, setForm] = useState({ description: '', category: 'Operasional', amount: '', date });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    if (saving || !form.description.trim() || Number(form.amount) <= 0) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave({ ...form, id: `exp-${Date.now()}`, amount: Number(form.amount), description: form.description.trim() });
    } catch (error) {
      setSaveError(error.message || 'Pengeluaran belum tersimpan. Coba lagi.');
      setSaving(false);
    }
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="admin-dialog" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button><span className="page-overline">PENCATATAN BIAYA</span><h2>Tambah pengeluaran</h2><p>Catat biaya operasional agar laporan keuangan selalu akurat.</p><form className="admin-form" onSubmit={submit}><label>Deskripsi<input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contoh: pakan bibit" /></label><div className="form-row"><label>Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Operasional</option><option>Pengiriman</option><option>Perawatan</option><option>Perlengkapan</option><option>Lainnya</option></select></label><label>Tanggal<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label></div><label>Jumlah (Rp)<input required min="1" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></label>{saveError && <div className="form-error" role="alert">{saveError}</div>}<button className="button button-dark full-button" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan pengeluaran'} {!saving && <Icon name="arrow" size={15} />}</button></form></div></div>;
}

function InvoiceModal({ order, onClose }) {
  if (!order) return null;
  const shippingFee = Number(order.shippingFee) || 0;
  return <div className="modal-backdrop invoice-backdrop" onMouseDown={onClose}><div className="invoice-modal" onMouseDown={(event) => event.stopPropagation()}><div className="invoice-modal-actions"><span>Pratinjau invoice</span><div><button className="button button-outline" onClick={() => window.print()}>Cetak / Simpan PDF</button><button className="modal-close inline-close" onClick={onClose}><Icon name="close" size={18} /></button></div></div><article className="invoice-paper"><div className="invoice-brand"><Logo /><span>INVOICE</span></div><div className="invoice-seller-details">Bibit lele sehat · Cakung, Jakarta Timur · WhatsApp +62 821-2304-0643</div><div className="invoice-meta"><div><small>DITAGIHKAN KEPADA</small><b>{order.customer}</b><span>{order.phone}</span></div><div><small>NOMOR INVOICE</small><b>{order.invoice}</b><span>Tanggal {formatDate(order.date)}</span></div></div><div className="invoice-divider"></div><table><thead><tr><th>DESKRIPSI</th><th>QTY</th><th>HARGA</th><th>JUMLAH</th></tr></thead><tbody><tr><td>{order.category || 'Bibit lele'} · ukuran {order.size}<small>1 kantong berisi ± 1.000 ekor</small></td><td>{order.quantity}</td><td>Rp {formatPrice(order.unitPrice)}</td><td>Rp {formatPrice(orderSubtotal(order))}</td></tr></tbody></table><div className="invoice-summary"><div><span>Subtotal produk</span><b>Rp {formatPrice(orderSubtotal(order))}</b></div>{orderDiscount(order) > 0 && <div><span>Diskon {order.discountType === 'Persen' ? `(${order.discountValue}%)` : ''}</span><b>− Rp {formatPrice(orderDiscount(order))}</b></div>}<div><span>Ongkos kirim</span><b>Rp {formatPrice(shippingFee)}</b></div><div className="invoice-total"><span>Total tagihan</span><b>Rp {formatPrice(orderTotal(order))}</b></div></div><div className="invoice-payment"><div><small>METODE PEMBAYARAN</small><b>{order.payment}</b></div><div><small>STATUS PEMBAYARAN</small><b>{order.status}</b></div></div>{order.note && <p className="invoice-note"><b>Catatan:</b> {order.note}</p>}<p className="invoice-thanks">Terima kasih telah memilih lelepakabi.<br />Bibit sehat untuk panen yang lebih dekat.</p></article></div></div>;
}

function TransactionsPage({ transactions, onStatusChange, onInvoice, onNew }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua status');
  const [categoryFilter, setCategoryFilter] = useState('Semua kategori');
  const categories = [...new Set(transactions.map((order) => order.category || 'Bibit lele'))];
  const filtered = transactions.filter((order) => `${order.customer} ${order.invoice} ${order.phone} ${order.size} ${order.category || 'Bibit lele'}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'Semua status' || order.status === filter) && (categoryFilter === 'Semua kategori' || (order.category || 'Bibit lele') === categoryFilter));
  return <><PageHeading eyebrow="PENJUALAN" title="Transaksi penjualan" description="Catat penjualan bibit, pantau pembayarannya, dan terbitkan invoice." action={<button className="button button-dark" onClick={onNew}><Icon name="plus" size={16} /> Catat penjualan</button>} /><div className="filter-bar"><label className="search-box"><Icon name="search" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pelanggan, invoice, atau ukuran" /></label><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option>Semua kategori</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>Semua status</option>{TRANSACTION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select><span>{filtered.length} transaksi</span></div><TransactionTable transactions={filtered} onStatusChange={onStatusChange} onInvoice={onInvoice} /></>;
}

function InvoicesPage({ transactions, onInvoice }) {
  return <><PageHeading eyebrow="DOKUMEN PENJUALAN" title="Invoice" description="Pilih transaksi untuk pratinjau, cetak, atau simpan invoice sebagai PDF." /><div className="invoice-card-grid">{transactions.map((order) => <article className="invoice-list-card" key={order.id}><div className="invoice-card-top"><span className="invoice-card-icon"><Icon name="receipt" size={19} /></span><span className={`invoice-status status-${order.status.toLowerCase().replaceAll(' ', '-')}`}>{order.status}</span></div><small>{order.invoice}</small><h3>{order.customer}</h3><p>{formatDate(order.date)} <span>·</span> {order.category || 'Bibit lele'} {order.size}, {order.quantity} kantong</p><div><b>Rp {formatPrice(orderTotal(order))}</b><button className="small-action" onClick={() => onInvoice(order)}>Buka invoice <Icon name="arrow" size={13} /></button></div></article>)}</div>{transactions.length === 0 && <div className="empty-state">Invoice akan muncul setelah transaksi dicatat.</div>}</>;
}

function FinancePage({ transactions, expenses }) {
  const income = transactions.filter(isRevenueOrder).reduce((sum, order) => sum + orderTotal(order), 0);
  const costs = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const profit = income - costs;
  const completeCount = transactions.filter((order) => order.status === 'Selesai').length;
  return <><PageHeading eyebrow="LAPORAN USAHA" title="Keuangan" description="Pantau pemasukan, pengeluaran, dan estimasi laba dari data transaksi." /><div className="metrics-grid finance-metrics"><MetricCard icon="arrowUp" label="Total pemasukan" value={`Rp ${formatShortPrice(income)}`} accent="lime" /><MetricCard icon="package" label="Total pengeluaran" value={`Rp ${formatShortPrice(costs)}`} accent="orange" /><MetricCard icon="wallet" label="Estimasi laba" value={`Rp ${formatShortPrice(profit)}`} accent="blue" /><MetricCard icon="checkCircle" label="Transaksi selesai" value={String(completeCount)} accent="purple" /></div><div className="finance-layout"><section className="dashboard-panel finance-summary"><div className="panel-head"><div><h3>Ringkasan arus kas</h3><p>Akumulasi seluruh catatan transaksi dan biaya.</p></div></div><div className="cashflow-row"><span><i className="cash-in-dot"></i>Pemasukan transaksi</span><b>Rp {formatPrice(income)}</b></div><div className="cashflow-row"><span><i className="cash-out-dot"></i>Pengeluaran tercatat</span><b>− Rp {formatPrice(costs)}</b></div><div className="cashflow-total"><span>Estimasi laba bersih</span><b>Rp {formatPrice(profit)}</b></div></section><section className="finance-note"><span className="tips-icon"><Icon name="help" size={17} /></span><span className="page-overline">CATATAN</span><h3>Angka mengikuti data yang dicatat</h3><p>Pemasukan dihitung dari transaksi yang sudah dibayar; transaksi menunggu pembayaran dan yang dibatalkan tidak dihitung. Catat pengeluaran secara rutin untuk mendapat estimasi laba yang lebih akurat.</p></section></div><p className="data-disclaimer">Data keuangan demo tersimpan secara lokal di browser ini.</p></>;
}

function ExpensesPage({ expenses, onNew, onDelete }) {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  return <><PageHeading eyebrow="BIAYA USAHA" title="Pengeluaran" description="Catat biaya operasional budidaya dan pengiriman." action={<button className="button button-dark" onClick={onNew}><Icon name="plus" size={16} /> Tambah biaya</button>} /><div className="expense-total-card"><span>Total pengeluaran tercatat</span><b>Rp {formatPrice(total)}</b><small>{expenses.length} catatan biaya</small></div><div className="dashboard-panel data-panel expense-panel"><div className="table-scroll"><table className="admin-data-table"><thead><tr><th>TANGGAL</th><th>DESKRIPSI</th><th>KATEGORI</th><th>JUMLAH</th><th></th></tr></thead><tbody>{[...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((expense) => <tr key={expense.id}><td><b>{formatDate(expense.date)}</b></td><td><b>{expense.description}</b></td><td><span className="category-pill">{expense.category}</span></td><td><b>Rp {formatPrice(expense.amount)}</b></td><td><button className="delete-action" aria-label={`Hapus ${expense.description}`} onClick={() => onDelete(expense.id)}>Hapus</button></td></tr>)}</tbody></table>{expenses.length === 0 && <div className="empty-state">Belum ada pengeluaran yang dicatat.</div>}</div></div></>;
}

function InventoryAttention({ products, onManage }) {
  const attention = products.filter((product) => ['Stok menipis', 'Tidak tersedia'].includes(getStockStatus(product)));
  return <section className="inventory-attention"><div className="inventory-attention-heading"><div><span className="page-overline">INVENTARIS</span><h3>Perlu perhatian</h3><p>{attention.length ? `${attention.length} ukuran perlu dicek atau di-restock.` : 'Semua kategori stok dalam kondisi aman.'}</p></div><button className="text-button" onClick={onManage}>Kelola stok <Icon name="arrow" size={14} /></button></div>{attention.length ? <div className="inventory-attention-list">{attention.map((product) => <div className="inventory-attention-item" key={product.id}><span className={`table-thumb ${product.accent}`}>{product.size.split('–')[0]}</span><div><b>{product.category || 'Bibit lele'} · {product.size}</b><small>{product.stock} kantong tersisa</small></div><span className={`invoice-status ${stockStatusClass(getStockStatus(product))}`}>{getStockStatus(product)}</span></div>)}</div> : <div className="inventory-all-good"><Icon name="checkCircle" size={17} /> Tidak ada stok menipis atau kosong.</div>}</section>;
}

function OverviewPage({ transactions, expenses, products, setActive, onInvoice, onNewTransaction }) {
  const revenue = transactions.filter(isRevenueOrder).reduce((sum, order) => sum + orderTotal(order), 0);
  const pending = transactions.filter((order) => ['Menunggu pembayaran', 'Dibayar'].includes(order.status)).length;
  const unitsSold = transactions.filter((order) => order.status !== 'Dibatalkan').reduce((sum, order) => sum + Number(order.quantity || 0) * 1000, 0);
  const activeStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const today = new Date();
  const todayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(today);
  const shortToday = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(today);
  return <><PageHeading eyebrow={todayLabel} title="Ringkasan" description="Kondisi penjualan, pembayaran, dan stok bibit hari ini." action={<div className="overview-heading-actions"><button className="button button-dark" onClick={onNewTransaction}><Icon name="plus" size={16} /> Catat penjualan</button><span className="date-chip"><Icon name="dashboard" size={15} /> {shortToday}</span></div>} /><div className="metrics-grid"><MetricCard icon="wallet" label="Pemasukan tercatat" value={`Rp ${formatShortPrice(revenue)}`} trend={`${transactions.length} transaksi`} accent="lime" /><MetricCard icon="package" label="Bibit dalam pesanan" value={formatPrice(unitsSold)} trend="ekor" accent="blue" /><MetricCard icon="list" label="Perlu ditindaklanjuti" value={String(pending)} trend="pesanan" accent="purple" /><MetricCard icon="chart" label="Pengeluaran" value={`Rp ${formatShortPrice(expenses.reduce((sum, item) => sum + Number(item.amount), 0))}`} trend={`${activeStock} kantong`} accent="orange" /></div><div className="overview-grid admin-overview-grid"><div className="dashboard-panel overview-panel"><div className="panel-head"><div><h3>Transaksi terbaru</h3><p>Pilih invoice untuk meninjau detail transaksi.</p></div><button className="text-button" onClick={() => setActive('transactions')}>Lihat semua <Icon name="arrow" size={14} /></button></div><TransactionTable transactions={transactions.slice(0, 3)} onStatusChange={null} onInvoice={onInvoice} /></div><div className="quick-admin-actions"><button onClick={() => setActive('stock')}><Icon name="package" size={19} /><span><b>Kelola stok</b><small>Atur jumlah dan status bibit</small></span><Icon name="arrow" size={15} /></button><button onClick={() => setActive('finance')}><Icon name="wallet" size={19} /><span><b>Lihat keuangan</b><small>Pemasukan dan estimasi laba</small></span><Icon name="arrow" size={15} /></button><button onClick={() => setActive('expenses')}><Icon name="chart" size={19} /><span><b>Catat pengeluaran</b><small>Perbarui biaya operasional</small></span><Icon name="arrow" size={15} /></button></div></div><InventoryAttention products={products} onManage={() => setActive('stock')} /></>;
}

function AdminDashboard({ products, onSaveProducts, transactions, onCreateSale, onUpdateSaleStatus, expenses, onCreateExpense, onDeleteExpense, onLogout, onGoStore }) {
  const [active, setActive] = useState('overview');
  const [pageHistory, setPageHistory] = useState([]);
  const navigate = (next) => { if (next === active) return; setPageHistory((history) => [...history, active]); setActive(next); };
  const goBack = () => { const previous = pageHistory[pageHistory.length - 1] || 'overview'; setPageHistory((history) => history.slice(0, -1)); setActive(previous); };
  const [draftProducts, setDraftProducts] = useState(products);
  const [showOrder, setShowOrder] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [toast, setToast] = useState('');
  useEffect(() => setDraftProducts(products), [products]);
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const saveProducts = async () => {
    try {
      await onSaveProducts(draftProducts);
      notify('Data stok dan katalog berhasil disimpan');
    } catch (error) {
      notify(`Gagal menyimpan: ${error.message}`);
    }
  };
  // Errors are re-thrown so the open form can show them and stay open for correction.
  const addTransaction = async (order) => {
    await onCreateSale(order);
    setShowOrder(false);
    notify('Penjualan dicatat dan invoice siap diterbitkan');
  };
  const updateStatus = async (id, status) => {
    try {
      await onUpdateSaleStatus(id, status);
      notify('Status transaksi diperbarui; stok tetap dikelola manual');
    } catch (error) {
      notify(`Gagal memperbarui status: ${error.message}`);
    }
  };
  const addExpense = async (expense) => {
    await onCreateExpense(expense);
    setShowExpense(false);
    notify('Pengeluaran berhasil dicatat');
  };
  const removeExpense = async (id) => {
    const expense = expenses.find((item) => item.id === id);
    if (!expense || !window.confirm(`Hapus catatan pengeluaran “${expense.description}”?`)) return;
    try {
      await onDeleteExpense(id);
      notify('Pengeluaran dihapus');
    } catch (error) {
      notify(`Gagal menghapus: ${error.message}`);
    }
  };
  const pageNames = { overview: 'Ringkasan', transactions: 'Transaksi', invoices: 'Invoice', finance: 'Keuangan', expenses: 'Pengeluaran', stock: 'Stok & katalog' };
  const pendingCount = transactions.filter((order) => ['Menunggu pembayaran', 'Dibayar'].includes(order.status)).length;
  return <div className="admin-layout"><AdminSidebar active={active} setActive={navigate} onLogout={onLogout} onGoStore={onGoStore} pendingCount={pendingCount} /><main className="admin-main"><div className="admin-topbar"><div className="breadcrumb"><button className="breadcrumb-back" onClick={goBack} aria-label="Kembali ke menu sebelumnya"><Icon name="arrow" size={14} /><span>Kembali</span></button><Icon name="chevron" size={13} /><b>{pageNames[active]}</b></div><div className="admin-top-actions"><button className="view-store" onClick={onGoStore}><Icon name="external" size={15} /> Lihat toko</button><div className="top-avatar">LP</div></div></div><div className="admin-content">
    {active === 'overview' && <OverviewPage transactions={transactions} expenses={expenses} products={products} setActive={navigate} onInvoice={setInvoiceOrder} onNewTransaction={() => setShowOrder(true)} />}
    {active === 'transactions' && <TransactionsPage transactions={transactions} onStatusChange={updateStatus} onInvoice={setInvoiceOrder} onNew={() => setShowOrder(true)} />}
    {active === 'invoices' && <InvoicesPage transactions={transactions} onInvoice={setInvoiceOrder} />}
    {active === 'finance' && <FinancePage transactions={transactions} expenses={expenses} />}
    {active === 'expenses' && <ExpensesPage expenses={expenses} onNew={() => setShowExpense(true)} onDelete={removeExpense} />}
    {active === 'stock' && <><div className="stock-page-heading"><PageHeading eyebrow="INVENTARIS" title="Stok & katalog" description="Pantau stok bibit dan atur harga atau status yang tampil di toko." /><button className="button button-outline" onClick={() => setDraftProducts(products)}><Icon name="arrow" size={14} /> Batalkan perubahan</button></div><StockTable products={products} draftProducts={draftProducts} setDraftProducts={setDraftProducts} onSave={saveProducts} /><div className="stock-hint"><Icon name="help" size={15} /> Stok tidak berubah otomatis dari transaksi; sesuaikan manual di inventaris setelah pesanan WA terkonfirmasi.</div></>}
  </div>{toast && <div className="save-toast"><Icon name="checkCircle" size={18} /> {toast}</div>}
    {showOrder && <OrderModal products={products} onClose={() => setShowOrder(false)} onSave={addTransaction} />}{showExpense && <ExpenseModal onClose={() => setShowExpense(false)} onSave={addExpense} />}{invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
  </main></div>;
}

function readStored(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

const ADMIN_SESSION_KEY = 'lelepakabi-admin-session';
const ADMIN_ROUTE_SEGMENT = '/adminlele';

function getSiteBase(pathname) {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  if (cleanPath.endsWith(ADMIN_ROUTE_SEGMENT)) return cleanPath.slice(0, -ADMIN_ROUTE_SEGMENT.length);
  return cleanPath === '/' ? '' : cleanPath;
}

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

function normalizeDemoProduct(product, index) {
  const merged = { ...DEFAULT_PRODUCTS[index], ...product, stock: Number(product.stock ?? DEFAULT_PRODUCTS[index]?.stock ?? 0) };
  return { ...merged, category: merged.category || DEFAULT_PRODUCTS[index]?.category || 'Bibit lele', status: merged.status === 'Habis' ? 'Tidak tersedia' : merged.status };
}

function App() {
  const [routePath, setRoutePath] = useState(getInitialRoute);
  const [adminSession, setAdminSession] = useState(() => (DEMO_MODE ? localStorage.getItem(ADMIN_SESSION_KEY) === 'active' : false));
  const [sessionChecked, setSessionChecked] = useState(DEMO_MODE);
  const [catalogStatus, setCatalogStatus] = useState(DEMO_MODE ? 'ready' : 'loading');
  const [products, setProducts] = useState(() => (DEMO_MODE ? readStored('lelepakabi-products', DEFAULT_PRODUCTS).map(normalizeDemoProduct) : []));
  const [transactions, setTransactions] = useState(() => (DEMO_MODE ? readStored('lelepakabi-transactions', DEFAULT_TRANSACTIONS) : []));
  const [expenses, setExpenses] = useState(() => (DEMO_MODE ? readStored('lelepakabi-expenses', DEFAULT_EXPENSES) : []));

  // Demo mode (GitHub Pages) keeps everything in this browser. Otherwise the Cloudflare API is the source of truth.
  useEffect(() => { if (DEMO_MODE) localStorage.setItem('lelepakabi-products', JSON.stringify(products)); }, [products]);
  useEffect(() => { if (DEMO_MODE) localStorage.setItem('lelepakabi-transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { if (DEMO_MODE) localStorage.setItem('lelepakabi-expenses', JSON.stringify(expenses)); }, [expenses]);

  useEffect(() => {
    if (DEMO_MODE) return;
    api.catalog()
      .then((list) => { setProducts(list); setCatalogStatus('ready'); })
      .catch(() => setCatalogStatus('error'));
    api.session()
      .then((data) => setAdminSession(Boolean(data.authenticated)))
      .catch(() => setAdminSession(false))
      .finally(() => setSessionChecked(true));
  }, []);

  useEffect(() => {
    if (DEMO_MODE || !adminSession) return;
    api.adminData()
      .then((data) => {
        setProducts(data.products);
        setTransactions(data.transactions);
        setExpenses(data.expenses);
        setCatalogStatus('ready');
      })
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
    setAdminSession(false);
    setTransactions(DEMO_MODE ? transactions : []);
    setExpenses(DEMO_MODE ? expenses : []);
    goToStore();
  };

  // Mutations. Each resolves only after the server confirms (or immediately in demo mode).
  // Sales are never written to inventory: the products table is only changed by saveProducts.
  const saveProducts = async (draft) => {
    if (DEMO_MODE) { setProducts(draft); return; }
    setProducts(await api.saveProducts(draft));
  };
  const createSale = async (order) => {
    if (DEMO_MODE) { setTransactions((previous) => [order, ...previous]); return; }
    const saved = await api.createSale(order);
    setTransactions((previous) => [saved, ...previous]);
  };
  const updateSaleStatus = async (id, status) => {
    if (!DEMO_MODE) await api.updateSaleStatus(id, status);
    setTransactions((previous) => previous.map((item) => (item.id === id ? { ...item, status } : item)));
  };
  const createExpense = async (expense) => {
    if (DEMO_MODE) { setExpenses((previous) => [expense, ...previous]); return; }
    const saved = await api.createExpense(expense);
    setExpenses((previous) => [saved, ...previous]);
  };
  const deleteExpense = async (id) => {
    if (!DEMO_MODE) await api.deleteExpense(id);
    setExpenses((previous) => previous.filter((item) => item.id !== id));
  };

  const order = (product) => window.open(`${STORE_WA_URL}?text=${encodeURIComponent(`Halo lelepakabi, saya ingin pesan bibit lele ukuran ${product.size}. Mohon info ketersediaan dan pengirimannya ya.`)}`, '_blank', 'noopener,noreferrer');

  if (isAdminRoute) {
    if (!sessionChecked) return <div className="admin-loading">Memeriksa sesi…</div>;
    return adminSession
      ? <AdminDashboard products={products} onSaveProducts={saveProducts} transactions={transactions} onCreateSale={createSale} onUpdateSaleStatus={updateSaleStatus} expenses={expenses} onCreateExpense={createExpense} onDeleteExpense={deleteExpense} onLogout={logout} onGoStore={goToStore} />
      : <AdminLoginPage onLogin={login} onBack={goToStore} />;
  }

  return <div className="storefront"><Header /><main><Hero products={products} status={catalogStatus} /><FactsStrip /><Catalog products={products} status={catalogStatus} onOrder={order} /><HowToOrder /><LocationSection /></main><Footer /></div>;
}

createRoot(document.getElementById('root')).render(<App />);
