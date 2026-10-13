// Format helpers — deterministic (no locale-dependent date formatting) so that
// rendered labels are identical in the browser, in tests, and in CI.

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS_LONG = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const idNumber = new Intl.NumberFormat('id-ID');

export const formatPrice = (value) => idNumber.format(Math.round(Number(value) || 0));
export const formatRupiah = (value) => `Rp ${formatPrice(value)}`;
export const formatQty = (value) => idNumber.format(Number(value) || 0);

export const formatShortPrice = (value) => {
  const number = Number(value) || 0;
  const sign = number < 0 ? '-' : '';
  const abs = Math.abs(number);
  if (abs >= 1000000) return `${sign}${(abs / 1000000).toFixed(1).replace('.', ',')} jt`;
  if (abs >= 1000) return `${sign}${Math.round(abs / 1000)} rb`;
  return `${sign}${abs}`;
};

export const formatCompactRupiah = (value) => `Rp ${formatShortPrice(value)}`;

const parseISO = (iso) => {
  if (!iso || typeof iso !== 'string') return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const toISODate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const todayISO = () => toISODate(new Date());

export const addDays = (iso, days) => {
  const date = parseISO(iso) || new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

export const addMonths = (iso, months) => {
  const date = parseISO(iso) || new Date();
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
};

export const formatDate = (iso) => {
  const date = parseISO(iso);
  if (!date) return '—';
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatLongDate = (iso) => {
  const date = parseISO(iso);
  if (!date) return '—';
  return `${DAYS_LONG[date.getDay()]}, ${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
};

export const monthKey = (iso) => (iso || '').slice(0, 7);

export const monthLabel = (key) => {
  const [y, m] = String(key).split('-').map(Number);
  if (!y || !m) return key;
  return `${MONTHS_SHORT[m - 1]} ${y}`;
};

export const monthLabelShort = (key) => {
  const [, m] = String(key).split('-').map(Number);
  return m ? MONTHS_SHORT[m - 1] : key;
};

export const lastMonthKeys = (count = 6, endISO = todayISO()) => {
  const date = parseISO(endISO) || new Date();
  const keys = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const cursor = new Date(date.getFullYear(), date.getMonth() - i, 1);
    keys.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
};

export const startOfMonth = (iso) => `${monthKey(iso || todayISO())}-01`;

export const endOfMonth = (iso) => {
  const [y, m] = String(monthKey(iso || todayISO())).split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
};

export const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || '')
    .join('')
    .toUpperCase() || 'LP';

export const formatPhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '—';
  if (digits.startsWith('62')) return `+${digits}`;
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`;
  return `+${digits}`;
};
