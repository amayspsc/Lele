import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const DEFAULT_PRODUCTS = [
  { id: 1, size: '3–4 cm', price: 180000, status: 'Tersedia', stock: 120, note: 'Cocok untuk pemula', accent: 'mint', sold: '1.000 ekor' },
  { id: 2, size: '4–5 cm', price: 215000, status: 'Tersedia', stock: 86, note: 'Paling banyak dipesan', accent: 'orange', sold: '1.000 ekor', popular: true },
  { id: 3, size: '5–6 cm', price: 260000, status: 'Pre-order', stock: 34, note: 'Lebih cepat dibesarkan', accent: 'blue', sold: '1.000 ekor' },
  { id: 4, size: '7–8 cm', price: 340000, status: 'Habis', stock: 0, note: 'Stok masuk 04 Okt 2026', accent: 'violet', sold: '1.000 ekor' },
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

const TRANSACTION_STATUSES = ['Menunggu pembayaran', 'Dibayar', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
const DEFAULT_TRANSACTIONS = [
  { id: 'trx-1001', invoice: 'INV/LP/2026/001', date: '2026-09-29', customer: 'Andi Rahman', phone: '0812-3456-7890', size: '4–5 cm', quantity: 3, unitPrice: 215000, status: 'Menunggu pembayaran', payment: 'Transfer bank', stockDeducted: false },
  { id: 'trx-1002', invoice: 'INV/LP/2026/002', date: '2026-09-28', customer: 'Dewi Sari', phone: '0813-4567-8901', size: '3–4 cm', quantity: 2, unitPrice: 180000, status: 'Dikirim', payment: 'QRIS', stockDeducted: false },
  { id: 'trx-1003', invoice: 'INV/LP/2026/003', date: '2026-09-27', customer: 'Bambang Yulianto', phone: '0815-6789-0123', size: '5–6 cm', quantity: 5, unitPrice: 260000, status: 'Selesai', payment: 'Transfer bank', stockDeducted: true },
];
const DEFAULT_EXPENSES = [
  { id: 'exp-1', date: '2026-09-29', description: 'Pakan dan vitamin bibit', category: 'Operasional', amount: 425000 },
  { id: 'exp-2', date: '2026-09-26', description: 'Ongkos kirim pesanan', category: 'Pengiriman', amount: 180000 },
  { id: 'exp-3', date: '2026-09-24', description: 'Perawatan kolam', category: 'Perawatan', amount: 350000 },
];
const orderTotal = (order) => (Number(order.quantity) || 0) * (Number(order.unitPrice) || 0);
const isRevenueOrder = (order) => ['Dibayar', 'Diproses', 'Dikirim', 'Selesai'].includes(order.status);
const formatDate = (value) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));

function AdminSidebar({ active, setActive, onLogout, pendingCount }) {
  const items = [
    ['overview', 'Ringkasan', 'dashboard'], ['transactions', 'Transaksi', 'list'], ['invoices', 'Invoice', 'receipt'],
    ['finance', 'Keuangan', 'wallet'], ['expenses', 'Pengeluaran', 'chart'], ['stock', 'Stok & katalog', 'package'], ['store', 'Toko', 'external'],
  ];
  return <aside className="admin-sidebar"><div className="admin-brand"><Logo light /><span className="admin-tag">ADMIN</span></div>
    <div className="admin-profile"><div className="profile-avatar">LP</div><div><b>Admin lelepakabi</b><span>Administrator</span></div><Icon name="chevron" size={15} /></div>
    <div className="sidebar-section"><span className="sidebar-label">Workspace</span>{items.map(([key, label, icon]) => <button key={key} className={`${active === key ? 'active' : ''} ${key === 'store' ? 'mobile-store-link' : ''}`} onClick={() => key === 'store' ? onLogout() : setActive(key)} aria-label={key === 'store' ? 'Kembali ke toko' : label}><Icon name={icon} size={17} /> {label}{key === 'transactions' && pendingCount > 0 && <span className="nav-count alert">{pendingCount}</span>}</button>)}</div>
    <div className="sidebar-section sidebar-bottom"><span className="sidebar-label">Toko</span><button onClick={onLogout}><Icon name="external" size={17} /> Lihat toko</button></div>
    <button className="logout-button" onClick={onLogout}><Icon name="logout" size={17} /> Keluar dari dashboard</button><div className="sidebar-version">lelepakabi v1.0 <span>•</span> Bogor</div>
  </aside>;
}

function MetricCard({ icon, label, value, trend, accent }) {
  return <div className={`metric-card ${accent}`}><div className="metric-top"><span className="metric-icon"><Icon name={icon} size={18} /></span>{trend && <span className="trend"><Icon name="arrowUp" size={12} /> {trend}</span>}</div><span className="metric-label">{label}</span><strong>{value}</strong><div className="metric-spark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><span className="page-overline">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function TransactionTable({ transactions, onStatusChange, onInvoice }) {
  return <div className="dashboard-panel data-panel"><div className="table-scroll"><table className="admin-data-table transaction-table"><thead><tr><th>PELANGGAN</th><th>TANGGAL / INVOICE</th><th>ITEM</th><th>TOTAL</th><th>STATUS</th><th></th></tr></thead><tbody>{transactions.map((order) => <tr key={order.id}>
    <td><b>{order.customer}</b><small>{order.phone}</small></td><td><b>{formatDate(order.date)}</b><small>{order.invoice}</small></td><td><b>Bibit {order.size}</b><small>{order.quantity} kantong · {order.payment}</small></td><td><b>Rp {formatPrice(orderTotal(order))}</b></td>
    <td>{onStatusChange ? <select aria-label={`Status ${order.invoice}`} className={`order-status-select status-${order.status.toLowerCase().replaceAll(' ', '-')}`} value={order.status} onChange={(e) => onStatusChange(order.id, e.target.value)}>{TRANSACTION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select> : <span className={`invoice-status status-${order.status.toLowerCase().replaceAll(' ', '-')}`}>{order.status}</span>}</td><td><button className="small-action" onClick={() => onInvoice(order)}>Invoice</button></td>
  </tr>)}</tbody></table>{transactions.length === 0 && <div className="empty-state">Tidak ada transaksi yang cocok.</div>}</div></div>;
}

function StockTable({ products, draftProducts, setDraftProducts, onSave }) {
  const update = (id, key, value) => setDraftProducts(draftProducts.map((product) => product.id === id ? { ...product, [key]: key === 'price' || key === 'stock' ? Math.max(0, Number(value) || 0) : value } : product));
  return <div className="dashboard-panel stock-panel"><div className="panel-head"><div><h3>Harga & ketersediaan</h3><p>Kelola jumlah stok kantong, harga, dan status pada katalog publik.</p></div><span className="last-updated"><span className="green-dot"></span> Data tersimpan di perangkat ini</span></div><div className="table-scroll"><table className="stock-table"><thead><tr><th>UKURAN BIBIT</th><th>HARGA / 1.000 EKOR</th><th>STOK (KANTONG)</th><th>STATUS KATALOG</th></tr></thead><tbody>{draftProducts.map((product) => <tr key={product.id}><td><div className="table-product"><div className={`table-thumb ${product.accent}`}><span>{product.size.split('–')[0]}</span></div><div><b>Bibit lele {product.size}</b><small>{product.note}</small></div></div></td><td><div className="price-input"><span>Rp</span><input aria-label={`Harga bibit ${product.size}`} type="number" min="0" step="5000" value={product.price} onChange={(e) => update(product.id, 'price', e.target.value)} /></div></td><td><input className="stock-number-input" aria-label={`Stok bibit ${product.size}`} type="number" min="0" value={product.stock ?? 0} onChange={(e) => update(product.id, 'stock', e.target.value)} /></td><td><select className={`status-select ${product.status === 'Tersedia' ? 'green' : product.status === 'Pre-order' ? 'yellow' : 'red'}`} value={product.status} onChange={(e) => update(product.id, 'status', e.target.value)}><option>Tersedia</option><option>Pre-order</option><option>Habis</option></select></td></tr>)}</tbody></table></div><div className="panel-footer"><span><Icon name="checkCircle" size={16} /> Stok dan katalog publik diperbarui setelah disimpan.</span><button className="button button-dark save-button" onClick={onSave}>Simpan perubahan <Icon name="arrow" size={15} /></button></div></div>;
}

function OrderModal({ products, onClose, onSave }) {
  const [form, setForm] = useState({ customer: '', phone: '', size: products[0]?.size || '', quantity: 1, status: 'Menunggu pembayaran', payment: 'Transfer bank' });
  const selected = products.find((product) => product.size === form.size) || products[0];
  const submit = (event) => {
    event.preventDefault();
    if (!form.customer.trim() || !form.phone.trim() || !selected || Number(form.quantity) < 1) return;
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const id = `trx-${Date.now()}`;
    onSave({ id, invoice: `INV/LP/${today.getFullYear()}/${String(Date.now()).slice(-5)}`, date, customer: form.customer.trim(), phone: form.phone.trim(), size: selected.size, quantity: Number(form.quantity), unitPrice: selected.price, status: form.status, payment: form.payment, stockDeducted: false });
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="admin-dialog" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button><span className="page-overline">TRANSAKSI BARU</span><h2>Catat pesanan</h2><p>Masukkan detail transaksi pelanggan.</p><form className="admin-form" onSubmit={submit}><label>Nama pelanggan<input required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Nama lengkap" /></label><label>Nomor WhatsApp<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xx xxxx xxxx" /></label><div className="form-row"><label>Ukuran bibit<select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>{products.map((product) => <option key={product.id}>{product.size}</option>)}</select></label><label>Jumlah kantong<input required type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label></div><div className="form-row"><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{TRANSACTION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label><label>Metode pembayaran<select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}><option>Transfer bank</option><option>QRIS</option><option>Tunai</option></select></label></div><div className="form-total"><span>Harga per kantong</span><b>Rp {formatPrice(selected?.price)}</b></div><button className="button button-dark full-button" type="submit">Simpan transaksi <Icon name="arrow" size={15} /></button></form></div></div>;
}

function ExpenseModal({ onClose, onSave }) {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [form, setForm] = useState({ description: '', category: 'Operasional', amount: '', date });
  const submit = (event) => { event.preventDefault(); if (!form.description.trim() || Number(form.amount) <= 0) return; onSave({ ...form, id: `exp-${Date.now()}`, amount: Number(form.amount), description: form.description.trim() }); };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="admin-dialog" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button><span className="page-overline">PENCATATAN BIAYA</span><h2>Tambah pengeluaran</h2><p>Catat biaya operasional agar laporan keuangan selalu akurat.</p><form className="admin-form" onSubmit={submit}><label>Deskripsi<input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contoh: pakan bibit" /></label><div className="form-row"><label>Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Operasional</option><option>Pengiriman</option><option>Perawatan</option><option>Perlengkapan</option><option>Lainnya</option></select></label><label>Tanggal<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label></div><label>Jumlah (Rp)<input required min="1" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></label><button className="button button-dark full-button" type="submit">Simpan pengeluaran <Icon name="arrow" size={15} /></button></form></div></div>;
}

function InvoiceModal({ order, onClose }) {
  if (!order) return null;
  return <div className="modal-backdrop invoice-backdrop" onMouseDown={onClose}><div className="invoice-modal" onMouseDown={(event) => event.stopPropagation()}><div className="invoice-modal-actions"><span>Pratinjau invoice</span><div><button className="button button-outline" onClick={() => window.print()}>Cetak / Simpan PDF</button><button className="modal-close inline-close" onClick={onClose}><Icon name="close" size={18} /></button></div></div><article className="invoice-paper"><div className="invoice-brand"><Logo /><span>INVOICE</span></div><div className="invoice-meta"><div><small>DITAGIHKAN KEPADA</small><b>{order.customer}</b><span>{order.phone}</span></div><div><small>NOMOR INVOICE</small><b>{order.invoice}</b><span>Tanggal {formatDate(order.date)}</span></div></div><div className="invoice-divider"></div><table><thead><tr><th>DESKRIPSI</th><th>QTY</th><th>HARGA</th><th>JUMLAH</th></tr></thead><tbody><tr><td>Bibit lele ukuran {order.size}<small>1 kantong berisi ± 1.000 ekor</small></td><td>{order.quantity}</td><td>Rp {formatPrice(order.unitPrice)}</td><td>Rp {formatPrice(orderTotal(order))}</td></tr></tbody></table><div className="invoice-total"><span>Total pembayaran</span><b>Rp {formatPrice(orderTotal(order))}</b></div><div className="invoice-payment"><div><small>METODE PEMBAYARAN</small><b>{order.payment}</b></div><div><small>STATUS</small><b>{order.status}</b></div></div><p className="invoice-thanks">Terima kasih telah memilih lelepakabi.<br />Bibit sehat untuk panen yang lebih dekat.</p></article></div></div>;
}

function TransactionsPage({ transactions, onStatusChange, onInvoice, onNew }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua status');
  const filtered = transactions.filter((order) => `${order.customer} ${order.invoice} ${order.phone}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'Semua status' || order.status === filter));
  return <><PageHeading eyebrow="PENJUALAN" title="Transaksi" description="Catat pesanan, perbarui status, dan lihat detail pembelian." action={<button className="button button-dark" onClick={onNew}><Icon name="plus" size={16} /> Transaksi baru</button>} /><div className="filter-bar"><label className="search-box"><Icon name="search" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pelanggan atau invoice" /></label><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>Semua status</option>{TRANSACTION_STATUSES.map((status) => <option key={status}>{status}</option>)}</select><span>{filtered.length} transaksi</span></div><TransactionTable transactions={filtered} onStatusChange={onStatusChange} onInvoice={onInvoice} /></>;
}

function InvoicesPage({ transactions, onInvoice }) {
  return <><PageHeading eyebrow="DOKUMEN PENJUALAN" title="Invoice" description="Pilih transaksi untuk pratinjau, cetak, atau simpan invoice sebagai PDF." /><div className="invoice-card-grid">{transactions.map((order) => <article className="invoice-list-card" key={order.id}><div className="invoice-card-top"><span className="invoice-card-icon"><Icon name="receipt" size={19} /></span><span className={`invoice-status status-${order.status.toLowerCase().replaceAll(' ', '-')}`}>{order.status}</span></div><small>{order.invoice}</small><h3>{order.customer}</h3><p>{formatDate(order.date)} <span>·</span> Bibit {order.size}, {order.quantity} kantong</p><div><b>Rp {formatPrice(orderTotal(order))}</b><button className="small-action" onClick={() => onInvoice(order)}>Buka invoice <Icon name="arrow" size={13} /></button></div></article>)}</div>{transactions.length === 0 && <div className="empty-state">Invoice akan muncul setelah transaksi dicatat.</div>}</>;
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

function OverviewPage({ transactions, expenses, products, setActive, onInvoice }) {
  const revenue = transactions.filter(isRevenueOrder).reduce((sum, order) => sum + orderTotal(order), 0);
  const pending = transactions.filter((order) => ['Menunggu pembayaran', 'Dibayar'].includes(order.status)).length;
  const unitsSold = transactions.filter((order) => order.status !== 'Dibatalkan').reduce((sum, order) => sum + Number(order.quantity || 0) * 1000, 0);
  const activeStock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const today = new Date();
  const todayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(today);
  const shortToday = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(today);
  return <><PageHeading eyebrow={todayLabel} title="Selamat pagi, admin." description="Ringkasan usaha lelepakabi hari ini." action={<span className="date-chip"><Icon name="dashboard" size={15} /> {shortToday}</span>} /><div className="metrics-grid"><MetricCard icon="wallet" label="Pemasukan tercatat" value={`Rp ${formatShortPrice(revenue)}`} trend={`${transactions.length} transaksi`} accent="lime" /><MetricCard icon="package" label="Bibit dalam pesanan" value={formatPrice(unitsSold)} trend="ekor" accent="blue" /><MetricCard icon="list" label="Perlu ditindaklanjuti" value={String(pending)} trend="pesanan" accent="purple" /><MetricCard icon="chart" label="Pengeluaran" value={`Rp ${formatShortPrice(expenses.reduce((sum, item) => sum + Number(item.amount), 0))}`} trend={`${activeStock} kantong`} accent="orange" /></div><div className="overview-grid admin-overview-grid"><div className="dashboard-panel overview-panel"><div className="panel-head"><div><h3>Transaksi terbaru</h3><p>Pilih invoice untuk meninjau detail transaksi.</p></div><button className="text-button" onClick={() => setActive('transactions')}>Lihat semua <Icon name="arrow" size={14} /></button></div><TransactionTable transactions={transactions.slice(0, 3)} onStatusChange={null} onInvoice={onInvoice} /></div><div className="quick-admin-actions"><button onClick={() => setActive('stock')}><Icon name="package" size={19} /><span><b>Kelola stok</b><small>Atur jumlah dan status bibit</small></span><Icon name="arrow" size={15} /></button><button onClick={() => setActive('finance')}><Icon name="wallet" size={19} /><span><b>Lihat keuangan</b><small>Pemasukan dan estimasi laba</small></span><Icon name="arrow" size={15} /></button><button onClick={() => setActive('expenses')}><Icon name="chart" size={19} /><span><b>Catat pengeluaran</b><small>Perbarui biaya operasional</small></span><Icon name="arrow" size={15} /></button></div></div></>;
}

function AdminDashboard({ products, onUpdateProducts, transactions, onUpdateTransactions, expenses, onUpdateExpenses, onLogout }) {
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
  const saveProducts = () => { onUpdateProducts(draftProducts); notify('Data stok dan katalog berhasil disimpan'); };
  const addTransaction = (order) => {
    if (order.status === 'Selesai') {
      onUpdateProducts(products.map((product) => product.size === order.size ? { ...product, stock: Math.max(0, Number(product.stock || 0) - order.quantity), status: Number(product.stock || 0) - order.quantity <= 0 ? 'Habis' : product.status } : product));
      order.stockDeducted = true;
    }
    onUpdateTransactions([order, ...transactions]); setShowOrder(false); notify('Transaksi berhasil dicatat');
  };
  const updateStatus = (id, status) => {
    const order = transactions.find((item) => item.id === id);
    let nextProducts = products;
    if (status === 'Selesai' && order && !order.stockDeducted) {
      nextProducts = products.map((product) => product.size === order.size ? { ...product, stock: Math.max(0, Number(product.stock || 0) - Number(order.quantity || 0)), status: Number(product.stock || 0) - Number(order.quantity || 0) <= 0 ? 'Habis' : product.status } : product);
      onUpdateProducts(nextProducts);
    }
    onUpdateTransactions(transactions.map((item) => item.id === id ? { ...item, status, stockDeducted: item.stockDeducted || status === 'Selesai' } : item));
    notify(status === 'Selesai' && order && !order.stockDeducted ? 'Status diperbarui; stok otomatis dikurangi' : 'Status transaksi diperbarui');
  };
  const addExpense = (expense) => { onUpdateExpenses([expense, ...expenses]); setShowExpense(false); notify('Pengeluaran berhasil dicatat'); };
  const pageNames = { overview: 'Ringkasan', transactions: 'Transaksi', invoices: 'Invoice', finance: 'Keuangan', expenses: 'Pengeluaran', stock: 'Stok & katalog' };
  const pendingCount = transactions.filter((order) => ['Menunggu pembayaran', 'Dibayar'].includes(order.status)).length;
  return <div className="admin-layout"><AdminSidebar active={active} setActive={navigate} onLogout={onLogout} pendingCount={pendingCount} /><main className="admin-main"><div className="admin-topbar"><div className="breadcrumb"><button className="breadcrumb-back" onClick={goBack} aria-label="Kembali ke menu sebelumnya"><Icon name="arrow" size={14} /><span>Kembali</span></button><Icon name="chevron" size={13} /><b>{pageNames[active]}</b></div><div className="admin-top-actions"><span className="public-status"><i></i> Toko online</span><button className="view-store" onClick={onLogout}><Icon name="external" size={15} /> Lihat toko</button><div className="top-avatar">LP</div></div></div><div className="admin-content">
    {active === 'overview' && <OverviewPage transactions={transactions} expenses={expenses} products={products} setActive={navigate} onInvoice={setInvoiceOrder} />}
    {active === 'transactions' && <TransactionsPage transactions={transactions} onStatusChange={updateStatus} onInvoice={setInvoiceOrder} onNew={() => setShowOrder(true)} />}
    {active === 'invoices' && <InvoicesPage transactions={transactions} onInvoice={setInvoiceOrder} />}
    {active === 'finance' && <FinancePage transactions={transactions} expenses={expenses} />}
    {active === 'expenses' && <ExpensesPage expenses={expenses} onNew={() => setShowExpense(true)} onDelete={(id) => { const expense = expenses.find((item) => item.id === id); if (expense && window.confirm(`Hapus catatan pengeluaran “${expense.description}”?`)) { onUpdateExpenses(expenses.filter((item) => item.id !== id)); notify('Pengeluaran dihapus'); } }} />}
    {active === 'stock' && <><div className="stock-page-heading"><PageHeading eyebrow="INVENTARIS" title="Stok & katalog" description="Pantau stok bibit dan atur harga atau status yang tampil di toko." /><button className="button button-outline" onClick={() => setDraftProducts(products)}><Icon name="arrow" size={14} /> Batalkan perubahan</button></div><StockTable products={products} draftProducts={draftProducts} setDraftProducts={setDraftProducts} onSave={saveProducts} /><div className="stock-hint"><Icon name="help" size={15} /> Stok otomatis berkurang ketika status transaksi diubah menjadi Selesai.</div></>}
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

function App() {
  const [view, setView] = useState('store');
  const [showLogin, setShowLogin] = useState(false);
  const [products, setProducts] = useState(() => readStored('lelepakabi-products', DEFAULT_PRODUCTS).map((product, index) => ({ ...DEFAULT_PRODUCTS[index], ...product, stock: Number(product.stock ?? DEFAULT_PRODUCTS[index]?.stock ?? 0) })));
  const [transactions, setTransactions] = useState(() => readStored('lelepakabi-transactions', DEFAULT_TRANSACTIONS));
  const [expenses, setExpenses] = useState(() => readStored('lelepakabi-expenses', DEFAULT_EXPENSES));
  useEffect(() => { localStorage.setItem('lelepakabi-products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('lelepakabi-transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('lelepakabi-expenses', JSON.stringify(expenses)); }, [expenses]);
  const openAdmin = () => setShowLogin(true);
  const order = (product) => window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo lelepakabi, saya ingin pesan bibit lele ukuran ${product.size}. Mohon info ketersediaan dan pengirimannya ya.`)}`, '_blank', 'noopener,noreferrer');
  return view === 'admin' ? <AdminDashboard products={products} onUpdateProducts={setProducts} transactions={transactions} onUpdateTransactions={setTransactions} expenses={expenses} onUpdateExpenses={setExpenses} onLogout={() => setView('store')} /> : <div className="storefront"><Header onAdmin={openAdmin} /><main><Hero /><Catalog products={products} onOrder={order} /><Story /><HowToOrder /></main><Footer onAdmin={openAdmin} />{showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={() => { setShowLogin(false); setView('admin'); }} />}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
