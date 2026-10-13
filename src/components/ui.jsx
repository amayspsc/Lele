import React from 'react';

const PATHS = {
  arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
  arrowUp: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
  arrowDown: <><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>,
  alert: <><path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
  boxes: <><path d="M3 8h7v6H3z" /><path d="M14 8h7v6h-7z" /><path d="M8.5 16h7v6h-7z" /><path d="M6.5 4h7v4h-7z" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M3 11h18" /></>,
  cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01" /><path d="M18 12h.01" /></>,
  chart: <><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="5" width="3" height="13" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  external: <><path d="M14 3h7v7" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.2 1-1.8 1.4-1.8 2.7" /><path d="M12 17h.01" /></>,
  leaf: <><path d="M20.5 3.5C13.8 3.3 5 6.3 5 13.1A5.9 5.9 0 0 0 10.9 19c6.8 0 9.8-8.8 9.6-15.5Z" /><path d="M4 21c2.5-5.2 6.1-8.3 11-10.5" /></>,
  list: <><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></>,
  menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  message: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 8.7 8.7 0 0 1-4-.9L3 21l1.8-4.2A8.3 8.3 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
  minus: <path d="M5 12h14" />,
  package: <><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
  phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  printer: <><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="7" rx="1" /></>,
  refresh: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  send: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v2.6h-.1a1.7 1.7 0 0 0-1.1 1.4Z" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  tag: <><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><path d="M7.5 7.5h.01" /></>,
  trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /></>,
  trending: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  trendingDown: <><path d="m3 7 6 6 4-4 8 8" /><path d="M21 11v6h-6" /></>,
  truck: <><path d="M3 6h11v11H3z" /><path d="M14 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h16v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" /><path d="M16 14h.01" /></>,
};

export function Icon({ name, size = 20, stroke = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name] || PATHS.grid}
    </svg>
  );
}

export function Logo({ light = false, compact = false }) {
  return (
    <div className={`logo ${light ? 'logo-light' : ''} ${compact ? 'logo-compact' : ''}`}>
      <span className="logo-mark"><span></span><span></span></span>
      <span>lele<span>pakabi</span></span>
    </div>
  );
}

export function StatusPill({ status, small = false }) {
  const className = status === 'Tersedia' ? 'available' : status === 'Pre-order' ? 'preorder' : 'soldout';
  return <span className={`status-pill ${className} ${small ? 'small' : ''}`}><i></i>{status}</span>;
}

export function Tag({ tone = 'neutral', children }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function Modal({ title, subtitle, onClose, children, footer, width = 'wide' }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`sheet sheet-${width}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <span className="page-overline">{subtitle}</span>
            <h3>{title}</h3>
          </div>
          <button className="modal-close static" onClick={onClose} aria-label="Tutup"><Icon name="close" size={18} /></button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function PageHeading({ overline, title, description, children }) {
  return (
    <div className="page-heading">
      <div>
        <span className="page-overline">{overline}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function MetricCard({ icon, label, value, trend, accent, hint }) {
  const down = typeof trend === 'number' && trend < 0;
  return (
    <div className={`metric-card ${accent}`}>
      <div className="metric-top">
        <span className="metric-icon"><Icon name={icon} size={18} /></span>
        {trend !== undefined && trend !== null && (
          <span className={`trend ${down ? 'down' : ''}`}>
            <Icon name={down ? 'arrowDown' : 'arrowUp'} size={12} /> {`${down ? '' : '+'}${Number(trend).toFixed(1).replace('.', ',')}%`}
          </span>
        )}
      </div>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      {hint && <span className="metric-hint">{hint}</span>}
      <div className="metric-spark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>
  );
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}{hint && <em>{hint}</em>}</span>
      {children}
    </label>
  );
}

export function EmptyState({ icon = 'package', title, description, children }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={20} /></span>
      <b>{title}</b>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

export const ORDER_TONE = {
  'Menunggu konfirmasi': 'amber',
  Diproses: 'blue',
  Dikirim: 'purple',
  Selesai: 'green',
  Dibatalkan: 'red',
};

export const PAYMENT_TONE = { Lunas: 'green', DP: 'blue', 'Belum dibayar': 'amber', Terlambat: 'red', Dibatalkan: 'grey' };

export function OrderStatusTag({ status }) {
  return <Tag tone={ORDER_TONE[status] || 'neutral'}>{status}</Tag>;
}

export function PaymentStatusTag({ status }) {
  return <Tag tone={PAYMENT_TONE[status] || 'neutral'}>{status}</Tag>;
}
