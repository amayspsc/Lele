// Data model + pure business logic for the lelepakabi back office.
// Everything here is side-effect free (except the small load/save helpers) so it
// can be unit tested without React or a DOM.

import { addDays, lastMonthKeys, monthKey, todayISO } from './format.js';

export const STORAGE_KEYS = {
  products: 'lelepakabi-products',
  transactions: 'lelepakabi-transactions',
  expenses: 'lelepakabi-expenses',
  movements: 'lelepakabi-movements',
};

// Modal awal usaha — dipakai sebagai pembuka saldo kas.
export const OPENING_CASH = 12500000;

export const ORDER_STATUSES = ['Menunggu konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
export const OPEN_ORDER_STATUSES = ['Menunggu konfirmasi', 'Diproses', 'Dikirim'];
export const PAYMENT_STATUSES = ['Belum dibayar', 'DP', 'Lunas'];
export const PAYMENT_METHODS = ['Transfer bank', 'Tunai', 'Tempo 14 hari'];
export const MOVEMENT_TYPES = ['Masuk', 'Keluar', 'Penyesuaian'];

export const EXPENSE_CATEGORIES = [
  { id: 'pakan', label: 'Pakan', color: 'lime' },
  { id: 'bibit', label: 'Bibit & indukan', color: 'blue' },
  { id: 'energi', label: 'Listrik & air', color: 'purple' },
  { id: 'obat', label: 'Obat & vitamin', color: 'orange' },
  { id: 'transport', label: 'Transportasi', color: 'red' },
  { id: 'operasional', label: 'Operasional', color: 'teal' },
  { id: 'lainnya', label: 'Lainnya', color: 'grey' },
];

export const expenseCategoryLabel = (id) => EXPENSE_CATEGORIES.find((c) => c.id === id)?.label || 'Lainnya';
export const expenseCategoryColor = (id) => EXPENSE_CATEGORIES.find((c) => c.id === id)?.color || 'grey';

export const expenseCategoryTotal = (expenses = [], categoryId, month = null) =>
  expenses
    .filter((e) => e.category === categoryId && (!month || monthKey(e.date) === month))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

export const DEFAULT_PRODUCTS = [
  { id: 1, size: '3–4 cm', price: 180000, cost: 118000, status: 'Tersedia', note: 'Cocok untuk pemula', accent: 'mint', sold: '1.000 ekor', minStock: 8 },
  { id: 2, size: '4–5 cm', price: 215000, cost: 142000, status: 'Tersedia', note: 'Paling banyak dipesan', accent: 'orange', sold: '1.000 ekor', minStock: 10, popular: true },
  { id: 3, size: '5–6 cm', price: 260000, cost: 176000, status: 'Pre-order', note: 'Lebih cepat dibesarkan', accent: 'blue', sold: '1.000 ekor', minStock: 8 },
  { id: 4, size: '7–8 cm', price: 340000, cost: 238000, status: 'Habis', note: 'Stok masuk 04 Okt 2026', accent: 'violet', sold: '1.000 ekor', minStock: 5 },
];

const customer = (name, phone, city) => ({ name, phone, city });

const C = {
  andi: customer('Andi Rahman', '081234567001', 'Bogor'),
  dewi: customer('Dewi Sari', '081234567002', 'Depok'),
  bambang: customer('Bambang Yudho', '081234567003', 'Tangerang'),
  rina: customer('Rina Kartika', '081234567004', 'Bekasi'),
  hendra: customer('Hendra Gunawan', '081234567005', 'Sukabumi'),
  siti: customer('Siti Halimah', '081234567006', 'Jakarta Selatan'),
  yusuf: customer('Yusuf Maulana', '081234567007', 'Bandung'),
  rizky: customer('Rizky Ramadhan', '081234567008', 'Cianjur'),
  ahmad: customer('Ahmad Fauzi', '081234567009', 'Karawang'),
};

const item = (product, qty) => ({ productId: product.id, size: product.size, price: product.price, cost: product.cost, qty });
const P = Object.fromEntries(DEFAULT_PRODUCTS.map((p) => [p.id, p]));

export const DEFAULT_TRANSACTIONS = [
  {
    id: 'TRX-0001', invoice: { number: 'INV/2026/0001', dueDate: '2026-08-19' }, date: '2026-08-12',
    customer: C.andi, items: [item(P[2], 8)], discount: 0, shipping: 50000, paymentMethod: 'Transfer bank',
    paymentStatus: 'Lunas', paidAmount: 1770000, status: 'Selesai', note: 'Dikirim pagi, kolam siap tebar.',
  },
  {
    id: 'TRX-0002', invoice: { number: 'INV/2026/0002', dueDate: '2026-08-27' }, date: '2026-08-20',
    customer: C.dewi, items: [item(P[1], 10)], discount: 0, shipping: 40000, paymentMethod: 'Transfer bank',
    paymentStatus: 'Lunas', paidAmount: 1840000, status: 'Selesai', note: '',
  },
  {
    id: 'TRX-0003', invoice: { number: 'INV/2026/0003', dueDate: '2026-09-04' }, date: '2026-08-28',
    customer: C.bambang, items: [item(P[3], 6)], discount: 0, shipping: 45000, paymentMethod: 'Tunai',
    paymentStatus: 'Lunas', paidAmount: 1605000, status: 'Selesai', note: '',
  },
  {
    id: 'TRX-0004', invoice: { number: 'INV/2026/0004', dueDate: '2026-10-05' }, date: '2026-09-05',
    customer: C.rina, items: [item(P[2], 12)], discount: 0, shipping: 60000, paymentMethod: 'Tempo 14 hari',
    paymentStatus: 'DP', paidAmount: 1000000, status: 'Dikirim', note: 'Sisa dibayar saat bibit diterima.',
  },
  {
    id: 'TRX-0005', invoice: { number: 'INV/2026/0005', dueDate: '2026-09-18' }, date: '2026-09-11',
    customer: C.andi, items: [item(P[2], 18)], discount: 150000, shipping: 80000, paymentMethod: 'Transfer bank',
    paymentStatus: 'Lunas', paidAmount: 3800000, status: 'Selesai', note: 'Pesanan ulang, diskon pelanggan tetap.',
  },
  {
    id: 'TRX-0006', invoice: { number: 'INV/2026/0006', dueDate: '2026-09-23' }, date: '2026-09-16',
    customer: C.hendra, items: [item(P[1], 10)], discount: 0, shipping: 50000, paymentMethod: 'Transfer bank',
    paymentStatus: 'Lunas', paidAmount: 1850000, status: 'Selesai', note: '',
  },
  {
    id: 'TRX-0007', invoice: { number: 'INV/2026/0007', dueDate: '2026-09-25' }, date: '2026-09-18',
    customer: C.siti, items: [item(P[1], 5), item(P[3], 4)], discount: 0, shipping: 75000, paymentMethod: 'Tempo 14 hari',
    paymentStatus: 'Belum dibayar', paidAmount: 0, status: 'Menunggu konfirmasi', note: 'Menunggu konfirmasi jadwal kirim.',
  },
  {
    id: 'TRX-0008', invoice: { number: 'INV/2026/0008', dueDate: '2026-10-01' }, date: '2026-09-24',
    customer: C.dewi, items: [item(P[1], 6)], discount: 0, shipping: 40000, paymentMethod: 'Transfer bank',
    paymentStatus: 'Lunas', paidAmount: 1120000, status: 'Selesai', note: '',
  },
  {
    id: 'TRX-0009', invoice: { number: 'INV/2026/0009', dueDate: '2026-10-04' }, date: '2026-09-27',
    customer: C.yusuf, items: [item(P[3], 8)], discount: 0, shipping: 55000, paymentMethod: 'Tempo 14 hari',
    paymentStatus: 'DP', paidAmount: 700000, status: 'Diproses', note: 'Sortir ulang sebelum kirim.',
  },
  {
    id: 'TRX-0010', invoice: { number: 'INV/2026/0010', dueDate: '2026-10-06' }, date: '2026-09-29',
    customer: C.rizky, items: [item(P[2], 7)], discount: 0, shipping: 45000, paymentMethod: 'Transfer bank',
    paymentStatus: 'Belum dibayar', paidAmount: 0, status: 'Menunggu konfirmasi', note: '',
  },
  {
    id: 'TRX-0011', invoice: { number: 'INV/2026/0011', dueDate: '2026-10-07' }, date: '2026-09-30',
    customer: C.ahmad, items: [item(P[1], 9)], discount: 0, shipping: 50000, paymentMethod: 'Transfer bank',
    paymentStatus: 'Belum dibayar', paidAmount: 0, status: 'Menunggu konfirmasi', note: '',
  },
];

export const DEFAULT_EXPENSES = [
  { id: 'EXP-0001', date: '2026-08-06', category: 'pakan', description: 'Pakan starter 12 karung', amount: 2300000, method: 'Transfer bank', vendor: 'Toko Pakan Mandiri' },
  { id: 'EXP-0002', date: '2026-08-14', category: 'energi', description: 'Listrik kolam & pompa', amount: 1280000, method: 'Transfer bank', vendor: 'PLN' },
  { id: 'EXP-0003', date: '2026-08-22', category: 'operasional', description: 'Upah harian 4 pekerja', amount: 1800000, method: 'Tunai', vendor: '' },
  { id: 'EXP-0004', date: '2026-09-02', category: 'pakan', description: 'Pakan starter 8 karung', amount: 1680000, method: 'Transfer bank', vendor: 'Toko Pakan Mandiri' },
  { id: 'EXP-0005', date: '2026-09-05', category: 'energi', description: 'Listrik kolam & pompa', amount: 1350000, method: 'Transfer bank', vendor: 'PLN' },
  { id: 'EXP-0006', date: '2026-09-08', category: 'obat', description: 'Probiotik & vitamin bibit', amount: 480000, method: 'Tunai', vendor: 'Apotek Ikan Sentosa' },
  { id: 'EXP-0007', date: '2026-09-15', category: 'transport', description: 'Sewa pick-up pengiriman', amount: 450000, method: 'Tunai', vendor: 'Rental Barokah' },
  { id: 'EXP-0008', date: '2026-09-21', category: 'operasional', description: 'Upah harian 4 pekerja', amount: 1800000, method: 'Tunai', vendor: '' },
  { id: 'EXP-0009', date: '2026-09-27', category: 'energi', description: 'Listrik kolam & pompa', amount: 1290000, method: 'Transfer bank', vendor: 'PLN' },
];

export const DEFAULT_MOVEMENTS = [
  { id: 'MOV-0001', date: '2026-08-01', productId: 1, type: 'Masuk', qty: 40, ref: 'Stok awal', note: 'Penebaran hasil pemijahan kolam 1' },
  { id: 'MOV-0002', date: '2026-08-01', productId: 2, type: 'Masuk', qty: 32, ref: 'Stok awal', note: 'Penebaran hasil pemijahan kolam 2' },
  { id: 'MOV-0003', date: '2026-08-01', productId: 3, type: 'Masuk', qty: 26, ref: 'Stok awal', note: 'Penebaran hasil pemijahan kolam 3' },
  { id: 'MOV-0004', date: '2026-08-12', productId: 2, type: 'Keluar', qty: 8, ref: 'INV/2026/0001', note: 'Pengiriman pesanan' },
  { id: 'MOV-0005', date: '2026-08-20', productId: 1, type: 'Keluar', qty: 10, ref: 'INV/2026/0002', note: 'Pengiriman pesanan' },
  { id: 'MOV-0006', date: '2026-08-28', productId: 3, type: 'Keluar', qty: 6, ref: 'INV/2026/0003', note: 'Pengiriman pesanan' },
  { id: 'MOV-0007', date: '2026-09-11', productId: 2, type: 'Keluar', qty: 18, ref: 'INV/2026/0005', note: 'Pengiriman pesanan' },
  { id: 'MOV-0008', date: '2026-09-15', productId: 1, type: 'Masuk', qty: 25, ref: 'PO-2026-018', note: 'Restok pemijahan kolam 1' },
  { id: 'MOV-0009', date: '2026-09-15', productId: 2, type: 'Masuk', qty: 15, ref: 'PO-2026-018', note: 'Restok pemijahan kolam 2' },
  { id: 'MOV-0010', date: '2026-09-16', productId: 1, type: 'Keluar', qty: 10, ref: 'INV/2026/0006', note: 'Pengiriman pesanan' },
  { id: 'MOV-0011', date: '2026-09-22', productId: 2, type: 'Penyesuaian', qty: -1, ref: 'QC-2026-09', note: 'Sortir: 1 kantong tidak lolos QC' },
  { id: 'MOV-0012', date: '2026-09-24', productId: 1, type: 'Keluar', qty: 6, ref: 'INV/2026/0008', note: 'Pengiriman pesanan' },
];

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export const readStored = (key, fallback) => {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const writeStored = (key, value) => {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode / SSR) — keep working in memory */
  }
};

// Products saved by an older build may miss the finance/stock fields.
export const withProductDefaults = (product) => {
  const base = DEFAULT_PRODUCTS.find((p) => p.id === product.id) || {};
  return { minStock: 8, cost: Math.round((product.price || base.price || 0) * 0.65), ...base, ...product };
};

export const normalizeProducts = (list) => (Array.isArray(list) && list.length ? list : DEFAULT_PRODUCTS).map(withProductDefaults);

// ---------------------------------------------------------------------------
// Identifiers & numbering
// ---------------------------------------------------------------------------

const numericSuffix = (value) => Number(String(value).match(/(\d+)\s*$/)?.[1] || 0);

export const nextId = (prefix, existing = [], width = 4) => {
  const max = existing.reduce((acc, entry) => Math.max(acc, numericSuffix(entry?.id)), 0);
  return `${prefix}-${String(max + 1).padStart(width, '0')}`;
};

export const nextInvoiceNumber = (transactions = [], date = todayISO()) => {
  const prefix = `INV/${String(date).slice(0, 4)}/`;
  const max = transactions.reduce((acc, tx) => {
    const number = tx?.invoice?.number || '';
    return number.startsWith(prefix) ? Math.max(acc, numericSuffix(number)) : acc;
  }, 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
};

// ---------------------------------------------------------------------------
// Invoice / transaction maths
// ---------------------------------------------------------------------------

export const lineTotal = (line) => (Number(line?.price) || 0) * (Number(line?.qty) || 0);
export const lineCogs = (line) => (Number(line?.cost) || 0) * (Number(line?.qty) || 0);

export const invoiceTotals = (transaction) => {
  const items = transaction?.items || [];
  const subtotal = items.reduce((sum, line) => sum + lineTotal(line), 0);
  const cogs = items.reduce((sum, line) => sum + lineCogs(line), 0);
  const discount = Math.min(Number(transaction?.discount) || 0, subtotal);
  const shipping = Number(transaction?.shipping) || 0;
  const netSales = subtotal - discount;
  const total = netSales + shipping;
  const paid = Math.min(Number(transaction?.paidAmount) || 0, total);
  return {
    subtotal,
    cogs,
    discount,
    shipping,
    netSales,
    total,
    paid,
    balance: Math.max(0, total - paid),
    grossProfit: netSales - cogs,
    margin: netSales > 0 ? ((netSales - cogs) / netSales) * 100 : 0,
    totalQty: items.reduce((sum, line) => sum + (Number(line?.qty) || 0), 0),
  };
};

export const INVOICE_STATUSES = ['Lunas', 'Belum dibayar', 'Terlambat', 'Dibatalkan'];

export const invoiceStatus = (transaction, today = todayISO()) => {
  if (transaction?.status === 'Dibatalkan') return 'Dibatalkan';
  const dueDate = transaction?.invoice?.dueDate;
  const { balance } = invoiceTotals(transaction);
  if (balance <= 0) return 'Lunas';
  return dueDate && dueDate < today ? 'Terlambat' : 'Belum dibayar';
};

export const isPaidUp = (transaction) => invoiceStatus(transaction) === 'Lunas';

export const daysOverdue = (transaction, today = todayISO()) => {
  if (invoiceStatus(transaction, today) !== 'Terlambat') return 0;
  const due = new Date(transaction.invoice.dueDate);
  const now = new Date(today);
  return Math.max(0, Math.round((now - due) / 86400000));
};

// Suggested payment status once the admin records a payment.
export const paymentStatusFor = (transaction, paidAmount) => {
  const { total } = invoiceTotals({ ...transaction, paidAmount });
  const paid = Number(paidAmount) || 0;
  if (paid <= 0) return 'Belum dibayar';
  return paid >= total ? 'Lunas' : 'DP';
};

export const buildInvoice = (transaction) => ({
  number: transaction.invoice?.number,
  issueDate: transaction.date,
  dueDate: transaction.invoice?.dueDate || addDays(transaction.date, 7),
  customer: transaction.customer,
  items: transaction.items,
  totals: invoiceTotals(transaction),
  status: invoiceStatus(transaction),
});

// ---------------------------------------------------------------------------
// Stock
// ---------------------------------------------------------------------------

const MOVEMENT_SIGN = { Masuk: 1, Keluar: -1, Penyesuaian: 1 };

export const movementDelta = (movement) => (MOVEMENT_SIGN[movement?.type] ?? 1) * (Number(movement?.qty) || 0);

export const stockOnHand = (productId, movements = []) =>
  movements.filter((m) => m.productId === productId).reduce((sum, m) => sum + movementDelta(m), 0);

export const reservedQty = (productId, transactions = []) =>
  transactions
    .filter((tx) => OPEN_ORDER_STATUSES.includes(tx.status) && tx.status !== 'Dibatalkan')
    .reduce((sum, tx) => sum + tx.items.filter((i) => i.productId === productId).reduce((a, i) => a + (Number(i.qty) || 0), 0), 0);

export const stockRows = (products = [], movements = [], transactions = []) =>
  products.map((product) => {
    const onHand = stockOnHand(product.id, movements);
    const reserved = reservedQty(product.id, transactions);
    const available = onHand - reserved;
    const minStock = Number(product.minStock) || 0;
    return {
      ...product,
      onHand,
      reserved,
      available,
      minStock,
      stockValue: onHand * (Number(product.cost) || 0),
      level: available <= 0 ? 'out' : available <= minStock ? 'low' : 'safe',
      low: available <= minStock,
    };
  });

export const stockSummary = (rows = []) => ({
  onHand: rows.reduce((sum, r) => sum + r.onHand, 0),
  available: rows.reduce((sum, r) => sum + r.available, 0),
  reserved: rows.reduce((sum, r) => sum + r.reserved, 0),
  value: rows.reduce((sum, r) => sum + r.stockValue, 0),
  lowCount: rows.filter((r) => r.low).length,
  outCount: rows.filter((r) => r.level === 'out').length,
});

// Movements generated when a transaction ships stock out of the pond.
export const movementsForTransaction = (transaction, existing = []) => {
  const base = existing.reduce((max, entry) => Math.max(max, numericSuffix(entry?.id)), 0);
  return transaction.items.map((line, index) => ({
    id: `MOV-${String(base + index + 1).padStart(4, '0')}`,
    date: transaction.date,
    productId: line.productId,
    type: 'Keluar',
    qty: Number(line.qty) || 0,
    ref: transaction.invoice?.number || transaction.id,
    note: 'Pengiriman pesanan',
  }));
};

// Reversal entries written back when a transaction is cancelled.
export const reversalMovementsFor = (transaction, existing = []) => {
  const base = existing.reduce((max, entry) => Math.max(max, numericSuffix(entry?.id)), 0);
  return transaction.items.map((line, index) => ({
    id: `MOV-${String(base + index + 1).padStart(4, '0')}`,
    date: todayISO(),
    productId: line.productId,
    type: 'Masuk',
    qty: Number(line.qty) || 0,
    ref: transaction.invoice?.number || transaction.id,
    note: 'Pembatalan pesanan — stok dikembalikan',
  }));
};

// ---------------------------------------------------------------------------
// Finance
// ---------------------------------------------------------------------------

export const inRange = (iso, range) =>
  (!range?.from || iso >= range.from) && (!range?.to || iso <= range.to);

export const financeSummary = (transactions = [], expenses = [], range = {}, today = todayISO()) => {
  const sales = transactions.filter((tx) => tx.status !== 'Dibatalkan' && inRange(tx.date, range));
  const costs = expenses.filter((expense) => inRange(expense.date, range));

  const totals = sales.reduce(
    (acc, tx) => {
      const t = invoiceTotals(tx);
      acc.invoiced += t.total;
      acc.income += t.paid;
      acc.receivable += t.balance;
      acc.cogs += t.cogs;
      acc.netSales += t.netSales;
      return acc;
    },
    { invoiced: 0, income: 0, receivable: 0, cogs: 0, netSales: 0 },
  );

  const expense = costs.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const byCategory = EXPENSE_CATEGORIES.map((category) => ({
    ...category,
    total: costs.filter((e) => e.category === category.id).reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
  }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);

  const unpaid = sales.filter((tx) => invoiceStatus(tx, today) === 'Belum dibayar' || invoiceStatus(tx, today) === 'Terlambat');

  return {
    ...totals,
    expense,
    net: totals.income - expense,
    grossProfit: totals.netSales - totals.cogs,
    transactionCount: sales.length,
    expenseCount: costs.length,
    unpaidCount: unpaid.length,
    overdueCount: unpaid.filter((tx) => invoiceStatus(tx, today) === 'Terlambat').length,
    overdueAmount: unpaid.filter((tx) => invoiceStatus(tx, today) === 'Terlambat').reduce((sum, tx) => sum + invoiceTotals(tx).balance, 0),
    byCategory,
    maxCategoryTotal: byCategory[0]?.total || 0,
    topExpense: [...costs].sort((a, b) => b.amount - a.amount)[0] || null,
  };
};

export const cashBalance = (transactions = [], expenses = []) => {
  const income = transactions
    .filter((tx) => tx.status !== 'Dibatalkan')
    .reduce((sum, tx) => sum + invoiceTotals(tx).paid, 0);
  const expense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return OPENING_CASH + income - expense;
};

export const monthlySeries = (transactions = [], expenses = [], months = 6, endISO = todayISO()) => {
  const keys = lastMonthKeys(months, endISO);
  return keys.map((key) => {
    const summary = financeSummary(
      transactions.filter((tx) => monthKey(tx.date) === key),
      expenses.filter((e) => monthKey(e.date) === key),
      {},
      endISO,
    );
    return { key, income: summary.income, expense: summary.expense, net: summary.net };
  });
};

export const percentageChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};
