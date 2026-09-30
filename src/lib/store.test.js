import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EXPENSES,
  DEFAULT_MOVEMENTS,
  DEFAULT_PRODUCTS,
  DEFAULT_TRANSACTIONS,
  OPENING_CASH,
  cashBalance,
  expenseCategoryTotal,
  financeSummary,
  invoiceStatus,
  invoiceTotals,
  monthlySeries,
  movementsForTransaction,
  nextId,
  nextInvoiceNumber,
  normalizeProducts,
  paymentStatusFor,
  percentageChange,
  reservedQty,
  reversalMovementsFor,
  stockOnHand,
  stockRows,
  stockSummary,
  withProductDefaults,
} from './store.js';

const TODAY = '2026-09-30';
const SEPTEMBER = { from: '2026-09-01', to: '2026-09-30' };

const findTx = (number) => DEFAULT_TRANSACTIONS.find((tx) => tx.invoice.number === number);
const stock = () => stockRows(DEFAULT_PRODUCTS, DEFAULT_MOVEMENTS, DEFAULT_TRANSACTIONS);

describe('invoiceTotals', () => {
  it('menghitung subtotal, diskon, ongkir, dan sisa tagihan', () => {
    const totals = invoiceTotals(findTx('INV/2026/0005'));
    expect(totals.subtotal).toBe(3870000);
    expect(totals.discount).toBe(150000);
    expect(totals.shipping).toBe(80000);
    expect(totals.total).toBe(3800000);
    expect(totals.paid).toBe(3800000);
    expect(totals.balance).toBe(0);
    expect(totals.totalQty).toBe(18);
  });

  it('menyisakan saldo untuk invoice yang baru dibayar DP', () => {
    const totals = invoiceTotals(findTx('INV/2026/0004'));
    expect(totals.total).toBe(2640000);
    expect(totals.paid).toBe(1000000);
    expect(totals.balance).toBe(1640000);
  });

  it('laba kotor dikurangi HPP, bukan harga jual', () => {
    const totals = invoiceTotals(findTx('INV/2026/0006'));
    expect(totals.netSales).toBe(1800000);
    expect(totals.cogs).toBe(1180000);
    expect(totals.grossProfit).toBe(620000);
    expect(totals.margin).toBeCloseTo(34.44, 1);
  });

  it('pembayaran tidak pernah melebihi total tagihan', () => {
    const totals = invoiceTotals({ ...findTx('INV/2026/0008'), paidAmount: 99999999 });
    expect(totals.paid).toBe(totals.total);
    expect(totals.balance).toBe(0);
  });
});

describe('invoiceStatus', () => {
  it('lunas saat tidak ada sisa', () => {
    expect(invoiceStatus(findTx('INV/2026/0005'), TODAY)).toBe('Lunas');
  });

  it('terlambat saat jatuh tempo sudah lewat', () => {
    expect(invoiceStatus(findTx('INV/2026/0007'), TODAY)).toBe('Terlambat');
  });

  it('belum dibayar selama belum jatuh tempo', () => {
    expect(invoiceStatus(findTx('INV/2026/0010'), TODAY)).toBe('Belum dibayar');
  });

  it('dibatalkan mengikuti status pesanan', () => {
    expect(invoiceStatus({ ...findTx('INV/2026/0005'), status: 'Dibatalkan' }, TODAY)).toBe('Dibatalkan');
  });
});

describe('paymentStatusFor', () => {
  const tx = findTx('INV/2026/0009');

  it('mengembalikan status yang tepat sesuai nominal', () => {
    expect(paymentStatusFor(tx, 0)).toBe('Belum dibayar');
    expect(paymentStatusFor(tx, 700000)).toBe('DP');
    expect(paymentStatusFor(tx, invoiceTotals(tx).total)).toBe('Lunas');
  });
});

describe('penomoran', () => {
  it('melanjutkan nomor invoice dalam tahun yang sama', () => {
    expect(nextInvoiceNumber(DEFAULT_TRANSACTIONS, TODAY)).toBe('INV/2026/0012');
  });

  it('mulai dari 0001 untuk tahun baru', () => {
    expect(nextInvoiceNumber(DEFAULT_TRANSACTIONS, '2027-01-05')).toBe('INV/2027/0001');
  });

  it('melanjutkan id transaksi, pengeluaran, dan mutasi', () => {
    expect(nextId('TRX', DEFAULT_TRANSACTIONS)).toBe('TRX-0012');
    expect(nextId('EXP', DEFAULT_EXPENSES)).toBe('EXP-0010');
    expect(nextId('MOV', DEFAULT_MOVEMENTS)).toBe('MOV-0013');
  });
});

describe('stok bibit', () => {
  it('menjumlahkan mutasi masuk, keluar, dan penyesuaian negatif', () => {
    expect(stockOnHand(1, DEFAULT_MOVEMENTS)).toBe(39);
    expect(stockOnHand(2, DEFAULT_MOVEMENTS)).toBe(20);
    expect(stockOnHand(3, DEFAULT_MOVEMENTS)).toBe(20);
    expect(stockOnHand(4, DEFAULT_MOVEMENTS)).toBe(0);
  });

  it('memesan stok untuk transaksi yang belum dikirim saja', () => {
    expect(reservedQty(1, DEFAULT_TRANSACTIONS)).toBe(14);
    expect(reservedQty(2, DEFAULT_TRANSACTIONS)).toBe(19);
    expect(reservedQty(4, DEFAULT_TRANSACTIONS)).toBe(0);
  });

  it('menandai ukuran di bawah batas aman', () => {
    const rows = stock();
    expect(rows.find((r) => r.id === 1)).toMatchObject({ onHand: 39, reserved: 14, available: 25, level: 'safe' });
    expect(rows.find((r) => r.id === 2)).toMatchObject({ onHand: 20, available: 1, level: 'low' });
    expect(rows.find((r) => r.id === 3)).toMatchObject({ onHand: 20, available: 8, level: 'low' });
    expect(rows.find((r) => r.id === 4)).toMatchObject({ onHand: 0, available: 0, level: 'out' });
    expect(stockSummary(rows)).toMatchObject({ lowCount: 3, outCount: 1, onHand: 79, available: 34 });
  });

  it('transaksi selesai menghasilkan mutasi keluar dengan id unik', () => {
    const tx = findTx('INV/2026/0007');
    const moves = movementsForTransaction(tx, DEFAULT_MOVEMENTS);
    expect(moves).toHaveLength(2);
    expect(moves.map((m) => m.id)).toEqual(['MOV-0013', 'MOV-0014']);
    expect(moves.every((m) => m.type === 'Keluar' && m.ref === 'INV/2026/0007')).toBe(true);
  });

  it('pembatalan mengembalikan stok', () => {
    const tx = findTx('INV/2026/0008');
    const moves = reversalMovementsFor(tx, DEFAULT_MOVEMENTS);
    expect(moves).toHaveLength(1);
    expect(moves[0]).toMatchObject({ type: 'Masuk', qty: 6, productId: 1 });
  });
});

describe('keuangan', () => {
  it('menghitung kas masuk, pengeluaran, dan laba September 2026', () => {
    const summary = financeSummary(DEFAULT_TRANSACTIONS, DEFAULT_EXPENSES, SEPTEMBER, TODAY);
    expect(summary.income).toBe(8470000);
    expect(summary.expense).toBe(7050000);
    expect(summary.net).toBe(1420000);
    expect(summary.transactionCount).toBe(8);
    expect(summary.receivable).toBe(8310000);
    expect(summary.overdueCount).toBe(1);
    expect(summary.overdueAmount).toBe(2015000);
  });

  it('mengelompokkan pengeluaran per kategori dan mengurutkan terbesar', () => {
    const summary = financeSummary(DEFAULT_TRANSACTIONS, DEFAULT_EXPENSES, SEPTEMBER, TODAY);
    expect(summary.byCategory.map((row) => row.id)).toEqual(['energi', 'operasional', 'pakan', 'obat', 'transport']);
    expect(summary.byCategory[0]).toMatchObject({ id: 'energi', total: 2640000 });
    expect(summary.byCategory.reduce((sum, row) => sum + row.total, 0)).toBe(summary.expense);
    expect(expenseCategoryTotal(DEFAULT_EXPENSES, 'energi', '2026-09')).toBe(2640000);
    expect(expenseCategoryTotal(DEFAULT_EXPENSES, 'energi', '2026-08')).toBe(1280000);
  });

  it('mengabaikan transaksi dibatalkan', () => {
    const cancelled = DEFAULT_TRANSACTIONS.map((tx) => (tx.invoice.number === 'INV/2026/0005' ? { ...tx, status: 'Dibatalkan' } : tx));
    const summary = financeSummary(cancelled, DEFAULT_EXPENSES, SEPTEMBER, TODAY);
    expect(summary.income).toBe(4670000);
    expect(summary.transactionCount).toBe(7);
  });

  it('saldo kas = modal awal + kas masuk − pengeluaran', () => {
    expect(cashBalance(DEFAULT_TRANSACTIONS, DEFAULT_EXPENSES)).toBe(OPENING_CASH + 13685000 - 12430000);
    expect(cashBalance(DEFAULT_TRANSACTIONS, DEFAULT_EXPENSES)).toBe(13755000);
  });

  it('menyusun deret 6 bulan sampai bulan berjalan', () => {
    const series = monthlySeries(DEFAULT_TRANSACTIONS, DEFAULT_EXPENSES, 6, TODAY);
    expect(series.map((row) => row.key)).toEqual(['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']);
    expect(series[4]).toMatchObject({ income: 5215000, expense: 5380000, net: -165000 });
    expect(series[5]).toMatchObject({ income: 8470000, expense: 7050000, net: 1420000 });
  });

  it('persentase perubahan aman terhadap nol', () => {
    expect(percentageChange(120, 100)).toBeCloseTo(20);
    expect(percentageChange(0, 100)).toBe(-100);
    expect(percentageChange(50, 0)).toBe(100);
  });
});

describe('migrasi data katalog lama', () => {
  it('melengkapi HPP dan batas aman dari data bawaan', () => {
    const legacy = { id: 1, size: '3–4 cm', price: 180000, status: 'Tersedia', note: 'Cocok untuk pemula', accent: 'mint', sold: '1.000 ekor' };
    expect(withProductDefaults(legacy)).toMatchObject({ cost: 118000, minStock: 8, price: 180000 });
  });

  it('menghitung HPP 65% untuk ukuran baru yang belum dikenal', () => {
    expect(withProductDefaults({ id: 99, size: '9–10 cm', price: 400000 })).toMatchObject({ cost: 260000, minStock: 8 });
  });

  it('kembali ke data bawaan bila penyimpanan kosong atau rusak', () => {
    expect(normalizeProducts(null)).toEqual(DEFAULT_PRODUCTS.map(withProductDefaults));
    expect(normalizeProducts([])).toHaveLength(4);
  });
});
