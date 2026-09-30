import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const DEFAULT_PRODUCTS = [
  { id: 1, size: '3–4 cm', price: 180000, status: 'Tersedia', note: 'Cocok untuk pemula', accent: 'mint', sold: '1.000 ekor' },
  { id: 2, size: '4–5 cm', price: 215000, status: 'Tersedia', note: 'Paling banyak dipesan', accent: 'orange', sold: '1.000 ekor', popular: true },
  { id: 3, size: '5–6 cm', price: 260000, status: 'Pre-order', note: 'Lebih cepat dibesarkan', accent: 'blue', sold: '1.000 ekor' },
  { id: 4, size: '7–8 cm', price: 340000, status: 'Habis', note: 'Stok masuk 04 Okt 2026', accent: 'violet', sold: '1.000 ekor' },
];

const ORDER_ROWS = [
  { initials: 'AR', name: 'Andi Rahman', detail: 'Bibit 4–5 cm · 3.000 ekor', total: 'Rp 645.000', status: 'Menunggu konfirmasi', color: 'lime' },
  { initials: 'DS', name: 'Dewi Sari', detail: 'Bibit 3–4 cm · 2.000 ekor', total: 'Rp 360.000', status: 'Siap dikirim', color: 'blue' },
  { initials: 'BY', name: 'Bambang Y.', detail: 'Bibit 5–6 cm · 5.000 ekor', total: 'Rp 1.300.000', status: 'Selesai', color: 'purple' },
];

const formatPrice = (value) => new Intl.NumberFormat('id-ID').format(Number(value) || 0);
const formatShortPrice = (value) => {
  const number = Number(value) || 0;
  return number >= 1000000 ? `${(number / 1000000).toFixed(1).replace('.', ',')} jt` : `${Math.round(number / 1000)} rb`;
};

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
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 8.7 8.7 0 0 1-4-.9L3 21l1.8-4.2A8.3 8.3 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></>,
    package: <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></>,
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
  const className = status === 'Tersedia' ? 'available' : status === 'Pre-order' ? 'preorder' : 'soldout';
  return <span className={`status-pill ${className} ${small ? 'small' : ''}`}><i></i>{status}</span>;
}

function Header({ onAdmin }) {
  const [open, setOpen] = useState(false);
  const goTo = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return <header className="site-header">
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
  </header>;
}

function FishIllustration() {
  return <div className="fish-art" aria-hidden="true">
    <div className="art-glow"></div>
    <div className="water-line line-one"></div><div className="water-line line-two"></div><div className="water-line line-three"></div>
    <svg className="fish-svg" viewBox="0 0 620 380" fill="none">
      <defs>
        <linearGradient id="fishGradient" x1="180" y1="100" x2="500" y2="310" gradientUnits="userSpaceOnUse"><stop stopColor="#e1f9a5"/><stop offset="1" stopColor="#75bd4d"/></linearGradient>
        <linearGradient id="finGradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#96d760"/><stop offset="1" stopColor="#3d8e57"/></linearGradient>
        <filter id="fishShadow" x="-20%" y="-30%" width="150%" height="180%"><feDropShadow dx="0" dy="20" stdDeviation="13" floodColor="#000" floodOpacity=".22"/></filter>
      </defs>
      <g filter="url(#fishShadow)" transform="rotate(-7 310 190)">
        <path d="M181 188C220 112 326 88 417 124c45 18 85 52 108 93-26 40-66 75-112 93-92 36-193 11-232-67-10-20-10-35 0-55Z" fill="url(#fishGradient)"/>
        <path d="M182 190 87 118c-18-13-41 5-34 26l26 71-26 72c-7 21 16 39 34 26l95-70c20-15 20-38 0-53Z" fill="url(#finGradient)"/>
        <path d="M230 145c29-34 57-48 91-54l-11 58c-27 3-53 12-76 30l-4-34Z" fill="#85c957"/>
        <path d="M233 246c26 19 54 30 82 34l8 57c-39-10-69-28-96-58l6-33Z" fill="#62a84d"/>
        <path d="M441 130c32 17 60 43 83 73-21 31-46 55-75 72 16-35 20-105-8-145Z" fill="#559d56"/>
        <ellipse cx="456" cy="181" rx="15" ry="20" fill="#173e3a"/><circle cx="460" cy="176" r="5" fill="#f5ffd0"/>
        <path d="M383 230c-23 10-47 12-72 5" stroke="#377b4c" strokeWidth="7" strokeLinecap="round"/>
        <path d="M178 194c51 12 93 22 141 22 59 0 109-18 154-47" stroke="#f0ffba" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round"/>
        <path d="M205 177c8-13 16-23 27-33M199 211c9 14 19 24 30 33" stroke="#4b9a51" strokeWidth="4" strokeLinecap="round"/>
      </g>
    </svg>
    <div className="art-caption"><span>01</span><span>Budidaya terkontrol</span></div>
  </div>;
}

function Hero({ onAdmin }) {
  return <>
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
    <div className="trust-strip"><div className="container trust-grid">
      <div className="trust-item"><span className="trust-icon"><Icon name="checkCircle" size={21} /></span><div><b>Sehat & seragam</b><small>Sortir sebelum kirim</small></div></div>
      <div className="trust-item"><span className="trust-icon"><Icon name="truck" size={21} /></span><div><b>Pengiriman aman</b><small>Ke Jabodetabek & sekitarnya</small></div></div>
      <div className="trust-item"><span className="trust-icon"><Icon name="message" size={21} /></span><div><b>Respons cepat</b><small>Konsultasi via WhatsApp</small></div></div>
      <div className="trust-note"><span>✓</span> Garansi hidup sampai kolam</div>
    </div></div>
  </>;
}

function ProductCard({ product, onOrder }) {
  return <article className={`product-card ${product.popular ? 'is-popular' : ''} ${product.status === 'Habis' ? 'is-soldout' : ''}`}>
    {product.popular && <div className="popular-ribbon"><Icon name="star" size={12} /> Pilihan pembudidaya</div>}
    <div className={`product-top ${product.accent}`}><div className="product-orb orb-one"></div><div className="product-orb orb-two"></div><span className="size-badge">Ukuran</span><strong>{product.size}</strong><span className="fish-count">× 1.000 ekor</span></div>
    <div className="product-body">
      <div className="product-status"><StatusPill status={product.status} /><span className="note">{product.note}</span></div>
      <div className="price-line"><span className="currency">Rp</span><strong>{formatPrice(product.price)}</strong></div>
      <div className="price-unit">per kantong <span>·</span> isi ± 1.000 ekor</div>
      <button disabled={product.status === 'Habis'} onClick={() => onOrder(product)} className="product-button">{product.status === 'Habis' ? 'Stok habis' : product.status === 'Pre-order' ? 'Tanya pre-order' : 'Pesan ukuran ini'} <Icon name="arrow" size={16} /></button>
    </div>
  </article>;
}

function Catalog({ products, onOrder }) {
  const available = products.filter((p) => p.status !== 'Habis').length;
  return <section className="catalog-section" id="produk">
    <div className="container">
      <div className="section-heading catalog-heading"><div><div className="section-kicker">Katalog bibit <span></span></div><h2>Ukuran yang pas,<br /><em>hasil yang jelas.</em></h2></div><div className="heading-side"><p>Semua bibit dihitung per 1.000 ekor dan sudah melalui proses sortir agar lebih seragam saat ditebar.</p><div className="stock-summary"><span className="stock-live"></span> {available} ukuran tersedia hari ini</div></div></div>
      <div className="products-grid">{products.map((product) => <ProductCard key={product.id} product={product} onOrder={onOrder} />)}</div>
      <div className="catalog-bottom"><div className="mini-rule"></div><p>Butuh jumlah besar atau ukuran khusus?</p><a href="https://wa.me/6281234567890?text=Halo%20lelepakabi%2C%20saya%20ingin%20konsultasi%20jumlah%20besar." target="_blank" rel="noreferrer">Bicarakan dengan kami <Icon name="arrow" size={15} /></a></div>
    </div>
  </section>;
}

function Story() {
  return <section className="story-section" id="cerita"><div className="container story-grid">
    <div className="story-visual"><div className="story-image"><div className="image-noise"></div><div className="pond-shape shape-one"></div><div className="pond-shape shape-two"></div><div className="pond-fish">🐟</div><span className="image-label">DESA · BOGOR<br /><small>EST. 2018</small></span></div><div className="experience-card"><strong>8</strong><span>tahun merawat<br />bibit lele</span></div></div>
    <div className="story-copy"><div className="section-kicker">Kenapa lelepakabi <span></span></div><h2>Bukan cuma jual bibit.<br /><em>Kami ikut tumbuh.</em></h2><p>Berawal dari kolam kecil di Bogor, kami percaya budidaya yang baik selalu dimulai dari bibit yang diperlakukan dengan baik.</p><p>Setiap bibit melewati pemantauan air, pakan, dan sortir harian. Karena kami ingin kamu menerima lebih dari sekadar ikan—tapi awal yang baik untuk panenmu.</p><div className="story-signature"><span className="signature-mark">lp</span><div><b>Tim lelepakabi</b><small>Dirawat dengan hati, dikirim dengan pasti.</small></div></div></div>
  </div></section>;
}

function HowToOrder() {
  const steps = [{ no: '01', title: 'Pilih ukuran', text: 'Sesuaikan ukuran bibit dengan target dan kolam kamu.' }, { no: '02', title: 'Chat kami', text: 'Klik pesan, lalu ceritakan kebutuhan budidayamu.' }, { no: '03', title: 'Bibit berangkat', text: 'Kami sortir dan kemas aman sebelum dikirim.' }];
  return <section className="how-section" id="cara-pesan"><div className="container"><div className="how-head"><div><div className="section-kicker">Semudah itu <span></span></div><h2>Dari chat ke kolam,<br /><em>tanpa ribet.</em></h2></div><a className="button button-dark" href="https://wa.me/6281234567890?text=Halo%20lelepakabi%2C%20saya%20mau%20pesan%20bibit%20lele." target="_blank" rel="noreferrer">Mulai pesan <Icon name="arrow" size={16} /></a></div><div className="steps-grid">{steps.map((step, i) => <div className="step" key={step.no}><div className="step-top"><span>{step.no}</span>{i < 2 && <div className="step-line"></div>}</div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></div></section>;
}

function Footer({ onAdmin }) {
  return <footer className="site-footer"><div className="container"><div className="footer-main"><div><Logo light /><p>Bibit sehat untuk<br />panen yang lebih dekat.</p></div><div className="footer-links"><div><b>Jelajahi</b><button onClick={() => document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth' })}>Katalog bibit</button><button onClick={() => document.getElementById('cerita')?.scrollIntoView({ behavior: 'smooth' })}>Tentang kami</button></div><div><b>Hubungi</b><a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">WhatsApp</a><a href="mailto:halo@lelepakabi.id">halo@lelepakabi.id</a></div><div><b>Lokasi</b><span>Bogor, Jawa Barat</span><span>Senin–Sabtu · 08.00–17.00</span></div></div></div><div className="footer-bottom"><span>© 2026 lelepakabi. Dibuat untuk pembudidaya.</span><button onClick={onAdmin}><Icon name="lock" size={13} /> Area admin</button><span>Instagram · TikTok</span></div></div></footer>;
}

function LoginModal({ onClose, onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const submit = (e) => { e.preventDefault(); if (password === 'lelepakabi') onLogin(); else setError(true); };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="login-modal" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button><div className="login-icon"><Icon name="lock" size={21} /></div><div className="section-kicker">Area terbatas <span></span></div><h2>Selamat datang,<br /><em>admin.</em></h2><p>Masuk untuk mengatur ketersediaan dan harga bibit di katalog.</p><form onSubmit={submit}><label>Email admin<input value="admin@lelepakabi.id" readOnly /></label><label>Kata sandi<div className="password-field"><input type="password" autoFocus value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }} placeholder="Masukkan kata sandi" /><Icon name="lock" size={15} /></div></label>{error && <div className="login-error">Kata sandi belum tepat. Coba lagi.</div>}<button className="button button-dark full-button" type="submit">Masuk ke dashboard <Icon name="arrow" size={16} /></button></form><small className="demo-hint">Demo password: <b>lelepakabi</b></small></div></div>;
}

function AdminSidebar({ active, setActive, onLogout }) {
  return <aside className="admin-sidebar"><div className="admin-brand"><Logo light /><span className="admin-tag">ADMIN</span></div><div className="admin-profile"><div className="profile-avatar">LP</div><div><b>Admin lelepakabi</b><span>Administrator</span></div><Icon name="chevron" size={15} /></div><div className="sidebar-section"><span className="sidebar-label">Workspace</span><button className={active === 'overview' ? 'active' : ''} onClick={() => setActive('overview')}><Icon name="dashboard" size={17} /> Ringkasan</button><button className={active === 'catalog' ? 'active' : ''} onClick={() => setActive('catalog')}><Icon name="package" size={17} /> Katalog bibit <span className="nav-count">4</span></button><button className={active === 'orders' ? 'active' : ''} onClick={() => setActive('orders')}><Icon name="list" size={17} /> Pesanan <span className="nav-count alert">3</span></button></div><div className="sidebar-section sidebar-bottom"><span className="sidebar-label">Lainnya</span><button><Icon name="settings" size={17} /> Pengaturan</button><button><Icon name="help" size={17} /> Bantuan</button></div><button className="logout-button" onClick={onLogout}><Icon name="logout" size={17} /> Keluar dari dashboard</button><div className="sidebar-version">lelepakabi v1.0 <span>•</span> Bogor</div></aside>;
}

function MetricCard({ icon, label, value, trend, accent }) {
  return <div className={`metric-card ${accent}`}><div className="metric-top"><span className="metric-icon"><Icon name={icon} size={18} /></span><span className="trend"><Icon name="arrowUp" size={12} /> {trend}</span></div><span className="metric-label">{label}</span><strong>{value}</strong><div className="metric-spark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>;
}

function StockTable({ products, draftProducts, setDraftProducts, onSave }) {
  const update = (id, key, value) => setDraftProducts(draftProducts.map((p) => p.id === id ? { ...p, [key]: key === 'price' ? Number(value) : value } : p));
  return <div className="dashboard-panel stock-panel"><div className="panel-head"><div><h3>Harga & ketersediaan</h3><p>Atur katalog yang tampil di halaman utama.</p></div><span className="last-updated"><span className="green-dot"></span> Tersimpan otomatis</span></div><div className="table-scroll"><table className="stock-table"><thead><tr><th>UKURAN BIBIT</th><th>HARGA / 1.000 EKOR</th><th>STATUS STOK</th><th>TERAKHIR DIUBAH</th><th></th></tr></thead><tbody>{draftProducts.map((product) => <tr key={product.id}><td><div className="table-product"><div className={`table-thumb ${product.accent}`}><span>{product.size.split('–')[0]}</span></div><div><b>Bibit lele {product.size}</b><small>{product.note}</small></div></div></td><td><div className="price-input"><span>Rp</span><input type="number" min="0" step="5000" value={product.price} onChange={(e) => update(product.id, 'price', e.target.value)} /></div></td><td><select className={`status-select ${product.status === 'Tersedia' ? 'green' : product.status === 'Pre-order' ? 'yellow' : 'red'}`} value={product.status} onChange={(e) => update(product.id, 'status', e.target.value)}><option>Tersedia</option><option>Pre-order</option><option>Habis</option></select></td><td><span className="changed-time">Hari ini, 09:24</span></td><td><button className="row-edit" onClick={() => document.querySelector('.stock-panel')?.scrollIntoView({ behavior: 'smooth' })}><Icon name="edit" size={15} /></button></td></tr>)}</tbody></table></div><div className="panel-footer"><span><Icon name="checkCircle" size={16} /> Perubahan akan langsung terlihat di katalog publik.</span><button className="button button-dark save-button" onClick={onSave}>Simpan perubahan <Icon name="arrow" size={15} /></button></div></div>;
}

function OrderTable() {
  return <div className="dashboard-panel orders-panel"><div className="panel-head"><div><h3>Pesanan terbaru</h3><p>Aktivitas pesanan masuk minggu ini.</p></div><button className="text-button">Lihat semua <Icon name="arrow" size={14} /></button></div><div className="orders-list">{ORDER_ROWS.map((order) => <div className="order-row" key={order.name}><span className={`order-avatar ${order.color}`}>{order.initials}</span><div className="order-customer"><b>{order.name}</b><span>{order.detail}</span></div><strong className="order-total">{order.total}</strong><span className={`order-status ${order.color}`}>{order.status}</span><button className="more-button">•••</button></div>)}</div></div>;
}

function AdminDashboard({ products, onUpdate, onLogout }) {
  const [active, setActive] = useState('overview');
  const [draftProducts, setDraftProducts] = useState(products);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraftProducts(products), [products]);
  const save = () => { onUpdate(draftProducts); setSaved(true); window.setTimeout(() => setSaved(false), 3000); };
  const available = products.filter((p) => p.status === 'Tersedia').length;
  return <div className="admin-layout"><AdminSidebar active={active} setActive={setActive} onLogout={onLogout} /><main className="admin-main"><div className="admin-topbar"><div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={13} /><b>{active === 'overview' ? 'Ringkasan' : active === 'catalog' ? 'Katalog bibit' : 'Pesanan'}</b></div><div className="admin-top-actions"><span className="public-status"><i></i> Toko online</span><button className="view-store" onClick={onLogout}><Icon name="external" size={15} /> Lihat toko</button><div className="top-avatar">LP</div></div></div><div className="admin-content">{active === 'orders' ? <><div className="page-heading"><div><span className="page-overline">AKTIVITAS</span><h1>Pesanan</h1><p>Kelola dan pantau pesanan masuk dari pelanggan.</p></div><button className="button button-dark"><Icon name="plus" size={16} /> Pesanan baru</button></div><OrderTable /></> : <><div className="page-heading"><div><span className="page-overline">RABU, 30 SEPTEMBER 2026</span><h1>Selamat pagi, admin.</h1><p>Ini ringkasan toko lelepakabi hari ini.</p></div><div className="date-chip"><Icon name="dashboard" size={15} /> 30 Sep 2026</div></div><div className="metrics-grid"><MetricCard icon="wallet" label="Penjualan bulan ini" value="Rp 18,4 jt" trend="12,8%" accent="lime" /><MetricCard icon="package" label="Bibit terjual" value="84.500" trend="8,2%" accent="blue" /><MetricCard icon="user" label="Pelanggan baru" value="126" trend="16,4%" accent="purple" /><MetricCard icon="message" label="Pesan masuk" value="38" trend="4,6%" accent="orange" /></div>{active === 'catalog' ? <div className="catalog-admin-heading"><div><h2>Kelola katalog bibit</h2><p>Perbarui harga dan status stok kapan saja.</p></div><button className="button button-outline" onClick={() => setDraftProducts(products)}><Icon name="arrow" size={14} /> Sinkronkan data</button></div> : <div className="overview-grid"><div className="dashboard-panel chart-panel"><div className="panel-head"><div><h3>Performa penjualan</h3><p>Ringkasan pendapatan 30 hari terakhir</p></div><select><option>30 hari terakhir</option><option>7 hari terakhir</option></select></div><div className="chart-wrap"><div className="chart-y"><span>8 jt</span><span>6 jt</span><span>4 jt</span><span>2 jt</span><span>0</span></div><div className="chart-area"><div className="chart-grid-lines"><i></i><i></i><i></i><i></i><i></i></div><svg viewBox="0 0 620 180" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8d85f" stopOpacity=".3"/><stop offset="1" stopColor="#a8d85f" stopOpacity="0"/></linearGradient></defs><path d="M0 151 C30 145 36 118 72 128 S105 133 130 109 S166 116 190 101 S217 63 249 77 S286 106 310 95 S342 91 365 107 S391 108 412 80 S456 55 477 72 S502 62 530 41 S573 55 620 17 V180 H0Z" fill="url(#chartFill)"/><path d="M0 151 C30 145 36 118 72 128 S105 133 130 109 S166 116 190 101 S217 63 249 77 S286 106 310 95 S342 91 365 107 S391 108 412 80 S456 55 477 72 S502 62 530 41 S573 55 620 17" fill="none" stroke="#7daf45" strokeWidth="3" vectorEffect="non-scaling-stroke"/><circle cx="530" cy="41" r="5" fill="#fff" stroke="#7daf45" strokeWidth="3"/></svg><div className="chart-x"><span>01 Sep</span><span>08 Sep</span><span>15 Sep</span><span>22 Sep</span><span>30 Sep</span></div></div></div></div><div className="dashboard-panel quick-panel"><div className="panel-head"><div><h3>Kondisi stok</h3><p>Status bibit saat ini</p></div><button className="mini-icon-button" onClick={() => setActive('catalog')}><Icon name="arrow" size={15} /></button></div><div className="stock-donut"><div className="donut"><div><strong>{available}</strong><span>aktif</span></div></div><div className="donut-legend"><span><i className="dot-green"></i>Tersedia <b>{available}</b></span><span><i className="dot-yellow"></i>Pre-order <b>{products.filter((p) => p.status === 'Pre-order').length}</b></span><span><i className="dot-red"></i>Habis <b>{products.filter((p) => p.status === 'Habis').length}</b></span></div></div><button className="quick-link" onClick={() => setActive('catalog')}>Kelola ketersediaan <Icon name="arrow" size={14} /></button></div></div>}{active === 'overview' && <div className="overview-orders"><OrderTable /><div className="tips-card"><div className="tips-icon"><Icon name="star" size={17} /></div><span className="page-overline">TIP HARI INI</span><h3>Ukuran 4–5 cm paling diminati</h3><p>Jaga stok ukuran favorit agar tidak kehilangan momentum pesanan.</p><button onClick={() => setActive('catalog')}>Cek katalog <Icon name="arrow" size={14} /></button></div></div>}{active === 'catalog' && <StockTable products={products} draftProducts={draftProducts} setDraftProducts={setDraftProducts} onSave={save} />}</>}</div>{saved && <div className="save-toast"><Icon name="checkCircle" size={18} /> Perubahan katalog berhasil disimpan</div>}</main></div>;
}

function App() {
  const [view, setView] = useState('store');
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState(() => { try { return JSON.parse(localStorage.getItem('lelepakabi-products')) || DEFAULT_PRODUCTS; } catch { return DEFAULT_PRODUCTS; } });
  useEffect(() => { localStorage.setItem('lelepakabi-products', JSON.stringify(products)); }, [products]);
  const openAdmin = () => setShowLogin(true);
  const order = (product) => window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo lelepakabi, saya ingin pesan bibit lele ukuran ${product.size}. Mohon info ketersediaan dan pengirimannya ya.`)}`, '_blank', 'noopener,noreferrer');
  return view === 'admin' ? <AdminDashboard products={products} onUpdate={setProducts} onLogout={() => setView('store')} /> : <div className="storefront"><Header onAdmin={openAdmin} /><main><Hero /><Catalog products={products} onOrder={order} /><Story /><HowToOrder /></main><Footer onAdmin={openAdmin} />{showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={() => { setShowLogin(false); setView('admin'); }} />}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
