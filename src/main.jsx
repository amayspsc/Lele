import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './admin/admin.css';
import { Icon, Logo, StatusPill } from './components/ui.jsx';
import { AdminDashboard } from './admin/Dashboard.jsx';
import { useAdminData } from './lib/useAdminData.js';
import { formatPrice, formatQty } from './lib/format.js';

function Header({ onAdmin }) {
  const [open, setOpen] = useState(false);
  const goTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <header className="site-header">
      <div className="container header-inner">
        <button className="brand-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Logo /></button>
        <nav className={`main-nav ${open ? 'open' : ''}`}>
          <button onClick={() => goTo('produk')}>Katalog bibit</button>
          <button onClick={() => goTo('cerita')}>Tentang kami</button>
          <button onClick={() => goTo('cara-pesan')}>Cara pesan</button>
        </nav>
        <div className="header-actions">
          <button className="admin-link" onClick={onAdmin}><Icon name="settings" size={16} /> <span>Admin</span></button>
          <a className="header-cta" href="https://wa.me/6281234567890?text=Halo%20lelepakabi%2C%20saya%20ingin%20pesan%20bibit%20lele." target="_blank" rel="noreferrer">Pesan bibit <Icon name="arrow" size={16} /></a>
        </div>
        <button className="menu-button" aria-label="Buka menu" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} size={23} /></button>
      </div>
    </header>
  );
}

function FishIllustration() {
  return (
    <div className="fish-art" aria-hidden="true">
      <div className="art-glow"></div>
      <div className="water-line line-one"></div><div className="water-line line-two"></div><div className="water-line line-three"></div>
      <svg className="fish-svg" viewBox="0 0 620 380" fill="none">
        <defs>
          <linearGradient id="fishGradient" x1="180" y1="100" x2="500" y2="310" gradientUnits="userSpaceOnUse"><stop stopColor="#e1f9a5" /><stop offset="1" stopColor="#75bd4d" /></linearGradient>
          <linearGradient id="finGradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#96d760" /><stop offset="1" stopColor="#3d8e57" /></linearGradient>
          <filter id="fishShadow" x="-20%" y="-30%" width="150%" height="180%"><feDropShadow dx="0" dy="20" stdDeviation="13" floodColor="#000" floodOpacity=".22" /></filter>
        </defs>
        <g filter="url(#fishShadow)" transform="rotate(-7 310 190)">
          <path d="M181 188C220 112 326 88 417 124c45 18 85 52 108 93-26 40-66 75-112 93-92 36-193 11-232-67-10-20-10-35 0-55Z" fill="url(#fishGradient)" />
          <path d="M182 190 87 118c-18-13-41 5-34 26l26 71-26 72c-7 21 16 39 34 26l95-70c20-15 20-38 0-53Z" fill="url(#finGradient)" />
          <path d="M230 145c29-34 57-48 91-54l-11 58c-27 3-53 12-76 30l-4-34Z" fill="#85c957" />
          <path d="M233 246c26 19 54 30 82 34l8 57c-39-10-69-28-96-58l6-33Z" fill="#62a84d" />
          <path d="M441 130c32 17 60 43 83 73-21 31-46 55-75 72 16-35 20-105-8-145Z" fill="#559d56" />
          <ellipse cx="456" cy="181" rx="15" ry="20" fill="#173e3a" /><circle cx="460" cy="176" r="5" fill="#f5ffd0" />
          <path d="M383 230c-23 10-47 12-72 5" stroke="#377b4c" strokeWidth="7" strokeLinecap="round" />
          <path d="M178 194c51 12 93 22 141 22 59 0 109-18 154-47" stroke="#f0ffba" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
          <path d="M205 177c8-13 16-23 27-33M199 211c9 14 19 24 30 33" stroke="#4b9a51" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
      <div className="art-caption"><span>01</span><span>Budidaya terkontrol</span></div>
    </div>
  );
}

function Hero() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot"></span> Bibit siap kirim hari ini</div>
            <h1>Mulai dari bibit,<br /><em>panen lebih dekat.</em></h1>
            <p className="hero-text">Bibit lele sehat, seragam, dan terawat untuk bantu usaha budidaya kamu tumbuh lebih pasti.</p>
            <div className="hero-buttons">
              <a className="button button-primary" href="#produk">Lihat katalog <Icon name="arrow" size={17} /></a>
              <a className="button button-ghost" href="https://wa.me/6281234567890?text=Halo%20lelepakabi%2C%20boleh%20konsultasi%20tentang%20bibit%20lele%3F" target="_blank" rel="noreferrer"><Icon name="message" size={17} /> Konsultasi gratis</a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack"><span className="av av-one">AR</span><span className="av av-two">DS</span><span className="av av-three">BY</span><span className="av-count">+</span></div>
              <div><div className="stars">★★★★★ <strong>4.9</strong></div><p>Dipercaya 500+ pembudidaya</p></div>
            </div>
          </div>
          <FishIllustration />
        </div>
      </section>
      <div className="trust-strip">
        <div className="container trust-grid">
          <div className="trust-item"><span className="trust-icon"><Icon name="checkCircle" size={21} /></span><div><b>Sehat & seragam</b><small>Sortir sebelum kirim</small></div></div>
          <div className="trust-item"><span className="trust-icon"><Icon name="truck" size={21} /></span><div><b>Pengiriman aman</b><small>Ke Jabodetabek & sekitarnya</small></div></div>
          <div className="trust-item"><span className="trust-icon"><Icon name="message" size={21} /></span><div><b>Respons cepat</b><small>Konsultasi via WhatsApp</small></div></div>
          <div className="trust-note"><span>✓</span> Garansi hidup sampai kolam</div>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product, available, onOrder }) {
  const soldOut = product.status === 'Habis';
  return (
    <article className={`product-card ${product.popular ? 'is-popular' : ''} ${soldOut ? 'is-soldout' : ''}`}>
      {product.popular && <div className="popular-ribbon"><Icon name="star" size={12} /> Pilihan pembudidaya</div>}
      <div className={`product-top ${product.accent}`}>
        <div className="product-orb orb-one"></div><div className="product-orb orb-two"></div>
        <span className="size-badge">Ukuran</span><strong>{product.size}</strong><span className="fish-count">× 1.000 ekor</span>
      </div>
      <div className="product-body">
        <div className="product-status"><StatusPill status={product.status} /><span className="note">{product.note}</span></div>
        <div className="price-line"><span className="currency">Rp</span><strong>{formatPrice(product.price)}</strong></div>
        <div className="price-unit">per kantong <span>·</span> isi ± 1.000 ekor</div>
        <div className={`stock-hint ${soldOut || available <= 0 ? 'empty' : available <= 10 ? 'tight' : 'plenty'}`}>
          <i></i>{soldOut || available <= 0 ? 'Menunggu stok masuk' : available <= 10 ? `Sisa ${formatQty(available)} kantong` : `Siap kirim · ${formatQty(available)} kantong`}
        </div>
        <button disabled={soldOut} onClick={() => onOrder(product)} className="product-button">
          {soldOut ? 'Stok habis' : product.status === 'Pre-order' ? 'Tanya pre-order' : 'Pesan ukuran ini'} <Icon name="arrow" size={16} />
        </button>
      </div>
    </article>
  );
}

function Catalog({ products, stock, onOrder }) {
  const available = products.filter((p) => p.status !== 'Habis').length;
  const stockOf = (id) => stock.find((row) => row.id === id)?.available ?? 0;
  return (
    <section className="catalog-section" id="produk">
      <div className="container">
        <div className="section-heading catalog-heading">
          <div><div className="section-kicker">Katalog bibit <span></span></div><h2>Ukuran yang pas,<br /><em>hasil yang jelas.</em></h2></div>
          <div className="heading-side">
            <p>Semua bibit dihitung per 1.000 ekor dan sudah melalui proses sortir agar lebih seragam saat ditebar.</p>
            <div className="stock-summary"><span className="stock-live"></span> {available} ukuran tersedia hari ini</div>
          </div>
        </div>
        <div className="products-grid">{products.map((product) => <ProductCard key={product.id} product={product} available={stockOf(product.id)} onOrder={onOrder} />)}</div>
        <div className="catalog-bottom">
          <div className="mini-rule"></div><p>Butuh jumlah besar atau ukuran khusus?</p>
          <a href="https://wa.me/6281234567890?text=Halo%20lelepakabi%2C%20saya%20ingin%20konsultasi%20jumlah%20besar." target="_blank" rel="noreferrer">Bicarakan dengan kami <Icon name="arrow" size={15} /></a>
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="story-section" id="cerita">
      <div className="container story-grid">
        <div className="story-visual">
          <div className="story-image"><div className="image-noise"></div><div className="pond-shape shape-one"></div><div className="pond-shape shape-two"></div><div className="pond-fish">🐟</div><span className="image-label">DESA · BOGOR<br /><small>EST. 2018</small></span></div>
          <div className="experience-card"><strong>8</strong><span>tahun merawat<br />bibit lele</span></div>
        </div>
        <div className="story-copy">
          <div className="section-kicker">Kenapa lelepakabi <span></span></div>
          <h2>Bukan cuma jual bibit.<br /><em>Kami ikut tumbuh.</em></h2>
          <p>Berawal dari kolam kecil di Bogor, kami percaya budidaya yang baik selalu dimulai dari bibit yang diperlakukan dengan baik.</p>
          <p>Setiap bibit melewati pemantauan air, pakan, dan sortir harian. Karena kami ingin kamu menerima lebih dari sekadar ikan—tapi awal yang baik untuk panenmu.</p>
          <div className="story-signature"><span className="signature-mark">lp</span><div><b>Tim lelepakabi</b><small>Dirawat dengan hati, dikirim dengan pasti.</small></div></div>
        </div>
      </div>
    </section>
  );
}

function HowToOrder() {
  const steps = [
    { no: '01', title: 'Pilih ukuran', text: 'Sesuaikan ukuran bibit dengan target dan kolam kamu.' },
    { no: '02', title: 'Chat kami', text: 'Klik pesan, lalu ceritakan kebutuhan budidayamu.' },
    { no: '03', title: 'Bibit berangkat', text: 'Kami sortir dan kemas aman sebelum dikirim.' },
  ];
  return (
    <section className="how-section" id="cara-pesan">
      <div className="container">
        <div className="how-head">
          <div><div className="section-kicker">Semudah itu <span></span></div><h2>Dari chat ke kolam,<br /><em>tanpa ribet.</em></h2></div>
          <a className="button button-dark" href="https://wa.me/6281234567890?text=Halo%20lelepakabi%2C%20saya%20mau%20pesan%20bibit%20lele." target="_blank" rel="noreferrer">Mulai pesan <Icon name="arrow" size={16} /></a>
        </div>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div className="step" key={step.no}>
              <div className="step-top"><span>{step.no}</span>{i < 2 && <div className="step-line"></div>}</div>
              <h3>{step.title}</h3><p>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ onAdmin }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div><Logo light /><p>Bibit sehat untuk<br />panen yang lebih dekat.</p></div>
          <div className="footer-links">
            <div><b>Jelajahi</b><button onClick={() => document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth' })}>Katalog bibit</button><button onClick={() => document.getElementById('cerita')?.scrollIntoView({ behavior: 'smooth' })}>Tentang kami</button></div>
            <div><b>Hubungi</b><a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">WhatsApp</a><a href="mailto:halo@lelepakabi.id">halo@lelepakabi.id</a></div>
            <div><b>Lokasi</b><span>Bogor, Jawa Barat</span><span>Senin–Sabtu · 08.00–17.00</span></div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 lelepakabi. Dibuat untuk pembudidaya.</span>
          <button onClick={onAdmin}><Icon name="lock" size={13} /> Area admin</button>
          <span>Instagram · TikTok</span>
        </div>
      </div>
    </footer>
  );
}

function LoginModal({ onClose, onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (password === 'lelepakabi') onLogin();
    else setError(true);
  };
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="login-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button>
        <div className="login-icon"><Icon name="lock" size={21} /></div>
        <div className="section-kicker">Area terbatas <span></span></div>
        <h2>Selamat datang,<br /><em>admin.</em></h2>
        <p>Masuk untuk mengelola transaksi, invoice, keuangan, pengeluaran, dan stok bibit.</p>
        <form onSubmit={submit}>
          <label>Email admin<input value="admin@lelepakabi.id" readOnly /></label>
          <label>Kata sandi
            <div className="password-field">
              <input type="password" autoFocus value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }} placeholder="Masukkan kata sandi" />
              <Icon name="lock" size={15} />
            </div>
          </label>
          {error && <div className="login-error">Kata sandi belum tepat. Coba lagi.</div>}
          <button className="button button-dark full-button" type="submit">Masuk ke dashboard <Icon name="arrow" size={16} /></button>
        </form>
        <small className="demo-hint">Demo password: <b>lelepakabi</b></small>
      </div>
    </div>
  );
}

export function App() {
  const [view, setView] = useState('store');
  const [showLogin, setShowLogin] = useState(false);
  const data = useAdminData();
  const { products, stock } = data;

  const order = (product) =>
    window.open(
      `https://wa.me/6281234567890?text=${encodeURIComponent(`Halo lelepakabi, saya ingin pesan bibit lele ukuran ${product.size}. Mohon info ketersediaan dan pengirimannya ya.`)}`,
      '_blank',
      'noopener,noreferrer',
    );

  if (view === 'admin') return <AdminDashboard data={data} onLogout={() => setView('store')} />;

  return (
    <div className="storefront">
      <Header onAdmin={() => setShowLogin(true)} />
      <main>
        <Hero />
        <Catalog products={products} stock={stock} onOrder={order} />
        <Story />
        <HowToOrder />
      </main>
      <Footer onAdmin={() => setShowLogin(true)} />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={() => { setShowLogin(false); setView('admin'); }} />}
    </div>
  );
}

const container = document.getElementById('root');
if (container) createRoot(container).render(<App />);
