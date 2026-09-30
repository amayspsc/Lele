import React, { useMemo, useState } from 'react';
import { MetricCard, PageHeading } from '../components/ui.jsx';
import { Icon } from '../components/ui.jsx';
import {
  OPENING_CASH,
  cashBalance,
  expenseCategoryLabel,
  financeSummary,
  invoiceStatus,
  invoiceTotals,
  monthlySeries,
  percentageChange,
} from '../lib/store.js';
import {
  addMonths,
  endOfMonth,
  formatCompactRupiah,
  formatDate,
  formatLongDate,
  formatRupiah,
  monthKey,
  monthLabel,
  monthLabelShort,
  startOfMonth,
  toISODate,
} from '../lib/format.js';

const PERIODS = [
  { id: 'month', label: 'Bulan ini' },
  { id: 'prev', label: 'Bulan lalu' },
  { id: 'quarter', label: '3 bulan' },
  { id: 'all', label: 'Semua' },
];

const rangeFor = (period, today) => {
  if (period === 'month') return { from: startOfMonth(today), to: endOfMonth(today) };
  if (period === 'prev') {
    const prev = toISODate(addMonths(today, -1));
    return { from: startOfMonth(prev), to: endOfMonth(prev) };
  }
  if (period === 'quarter') return { from: startOfMonth(toISODate(addMonths(today, -2))), to: endOfMonth(today) };
  return {};
};

export function FinancePanel({ transactions, expenses, today }) {
  const [period, setPeriod] = useState('month');
  const range = rangeFor(period, today);

  const current = useMemo(() => financeSummary(transactions, expenses, range, today), [transactions, expenses, range, today]);

  const previous = useMemo(() => {
    if (period === 'all') return null;
    if (period === 'quarter') return financeSummary(transactions, expenses, { from: startOfMonth(toISODate(addMonths(today, -5))), to: startOfMonth(toISODate(addMonths(today, -3))) }, today);
    const shift = period === 'month' ? -1 : -1;
    const base = toISODate(addMonths(today, shift));
    return financeSummary(transactions, expenses, { from: startOfMonth(base), to: endOfMonth(base) }, today);
  }, [transactions, expenses, period, today]);

  const series = useMemo(() => monthlySeries(transactions, expenses, 6, today), [transactions, expenses, today]);
  const peak = Math.max(...series.map((row) => Math.max(row.income, row.expense)), 1);
  const balance = cashBalance(transactions, expenses);

  const receivables = useMemo(
    () =>
      transactions
        .filter((tx) => tx.status !== 'Dibatalkan')
        .map((tx) => ({ tx, status: invoiceStatus(tx, today), balance: invoiceTotals(tx).balance }))
        .filter((row) => row.balance > 0)
        .sort((a, b) => String(a.tx.invoice?.dueDate).localeCompare(String(b.tx.invoice?.dueDate))),
    [transactions, today],
  );

  const label = period === 'all' ? 'sejak awal pencatatan' : period === 'quarter' ? '3 bulan terakhir' : monthLabel(monthKey(range.from));

  return (
    <>
      <PageHeading overline={`PERIODE · ${label.toUpperCase()}`} title="Keuangan" description="Arus kas usaha: penerimaan penjualan dikurangi pengeluaran budidaya.">
        <div className="period-tabs">
          {PERIODS.map((option) => (
            <button key={option.id} className={period === option.id ? 'active' : ''} onClick={() => setPeriod(option.id)}>{option.label}</button>
          ))}
        </div>
      </PageHeading>

      <div className="metrics-grid">
        <MetricCard icon="wallet" label="Kas masuk" value={formatCompactRupiah(current.income)} trend={previous ? percentageChange(current.income, previous.income) : undefined} accent="lime" hint={`${current.transactionCount} transaksi`} />
        <MetricCard icon="trendingDown" label="Pengeluaran" value={formatCompactRupiah(current.expense)} trend={previous ? percentageChange(current.expense, previous.expense) : undefined} accent="orange" hint={`${current.expenseCount} catatan`} />
        <MetricCard icon="trending" label="Laba bersih" value={formatCompactRupiah(current.net)} trend={previous ? percentageChange(current.net, previous.net) : undefined} accent={current.net >= 0 ? 'blue' : 'red'} hint={`Margin kotor ${current.netSales > 0 ? ((current.grossProfit / current.netSales) * 100).toFixed(0).replace('.', ',') : '0'}%`} />
        <MetricCard icon="cash" label="Saldo kas" value={formatCompactRupiah(balance)} accent="purple" hint={`Termasuk modal awal ${formatCompactRupiah(OPENING_CASH)}`} />
      </div>

      <div className="overview-grid finance-grid">
        <div className="dashboard-panel chart-panel">
          <div className="panel-head">
            <div><h3>Arus kas 6 bulan</h3><p>Perbandingan kas masuk dan pengeluaran per bulan</p></div>
            <div className="chart-legend"><span><i className="dot-lime"></i>Kas masuk</span><span><i className="dot-orange"></i>Pengeluaran</span></div>
          </div>
          <div className="bar-chart">
            {series.map((row) => (
              <div className="bar-col" key={row.key}>
                <div className="bar-pair">
                  <div className="bar income" style={{ height: `${Math.max(2, (row.income / peak) * 100)}%` }} title={`Kas masuk ${formatRupiah(row.income)}`}></div>
                  <div className="bar expense" style={{ height: `${Math.max(2, (row.expense / peak) * 100)}%` }} title={`Pengeluaran ${formatRupiah(row.expense)}`}></div>
                </div>
                <span className="bar-value">{formatCompactRupiah(row.net)}</span>
                <span className="bar-label">{monthLabelShort(row.key)}</span>
              </div>
            ))}
          </div>
          <div className="panel-footer">
            <span><Icon name="checkCircle" size={16} /> Angka di bawah bulan adalah laba bersih bulan tersebut.</span>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-head">
            <div><h3>Komposisi pengeluaran</h3><p>{label}</p></div>
            <span className="last-updated"><span className="green-dot"></span>{formatRupiah(current.expense)}</span>
          </div>
          <div className="category-list">
            {current.byCategory.length === 0 && <p className="empty-note">Belum ada pengeluaran pada periode ini.</p>}
            {current.byCategory.map((row) => (
              <div className="category-row" key={row.id}>
                <div className="category-line"><b>{row.label}</b><span>{formatRupiah(row.total)}</span></div>
                <div className="category-bar"><i style={{ width: `${current.maxCategoryTotal ? (row.total / current.maxCategoryTotal) * 100 : 0}%` }} className={`fill-${row.color}`}></i></div>
                <small>{current.expense ? ((row.total / current.expense) * 100).toFixed(0) : 0}% dari total pengeluaran</small>
              </div>
            ))}
          </div>
          {current.topExpense && (
            <div className="panel-footer">
              <span><Icon name="tag" size={16} /> Terbesar: {current.topExpense.description} · {formatRupiah(current.topExpense.amount)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="overview-grid finance-grid">
        <div className="dashboard-panel table-panel">
          <div className="panel-head">
            <div><h3>Piutang pelanggan</h3><p>{receivables.length} invoice belum lunas · {formatRupiah(receivables.reduce((s, r) => s + r.balance, 0))}</p></div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>INVOICE</th><th>PELANGGAN</th><th>JATUH TEMPO</th><th className="num">SISA</th><th>STATUS</th></tr></thead>
              <tbody>
                {receivables.map(({ tx, status, balance: due }) => (
                  <tr key={tx.id}>
                    <td className="mono-cell">{tx.invoice?.number}</td>
                    <td>{tx.customer?.name}</td>
                    <td className="mono-cell">{formatDate(tx.invoice?.dueDate)}</td>
                    <td className="num negative">{formatRupiah(due)}</td>
                    <td><span className={`tag tag-${status === 'Terlambat' ? 'red' : 'amber'}`}>{status}</span></td>
                  </tr>
                ))}
                {receivables.length === 0 && <tr><td colSpan="5" className="empty-row">Semua tagihan sudah lunas. Kerja bagus 🎉</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-panel ledger-panel">
          <div className="panel-head">
            <div><h3>Ringkasan periode</h3><p>{label}</p></div>
            <span className="date-chip small"><Icon name="calendar" size={13} /> {formatLongDate(today)}</span>
          </div>
          <dl className="ledger">
            <div><dt>Kas masuk penjualan</dt><dd className="positive">{formatRupiah(current.income)}</dd></div>
            <div><dt>Total pengeluaran</dt><dd className="negative">− {formatRupiah(current.expense)}</dd></div>
            <div className="grand"><dt>Laba bersih</dt><dd className={current.net >= 0 ? 'positive' : 'negative'}>{formatRupiah(current.net)}</dd></div>
            <div><dt>Nilai invoice terbit</dt><dd>{formatRupiah(current.invoiced)}</dd></div>
            <div><dt>Belum diterima</dt><dd>{formatRupiah(current.receivable)}</dd></div>
            <div><dt>Invoice terlambat</dt><dd className="negative">{current.overdueCount} · {formatRupiah(current.overdueAmount)}</dd></div>
            <div><dt>Laba kotor (setelah HPP)</dt><dd>{formatRupiah(current.grossProfit)}</dd></div>
          </dl>
          <div className="panel-footer">
            <span><Icon name="checkCircle" size={16} /> HPP dihitung dari harga pokok tiap ukuran bibit di katalog.</span>
          </div>
        </div>
      </div>

      <div className="dashboard-panel table-panel">
        <div className="panel-head">
          <div><h3>Pengeluaran terbesar</h3><p>{current.expenseCount} catatan pada periode ini</p></div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>TANGGAL</th><th>KATEGORI</th><th>KETERANGAN</th><th>METODE</th><th className="num">JUMLAH</th></tr></thead>
            <tbody>
              {expenses
                .filter((e) => (!range.from || e.date >= range.from) && (!range.to || e.date <= range.to))
                .slice(0, 6)
                .map((expense) => (
                  <tr key={expense.id}>
                    <td className="mono-cell">{formatDate(expense.date)}</td>
                    <td>{expenseCategoryLabel(expense.category)}</td>
                    <td><div className="cell-stack"><b>{expense.description}</b>{expense.vendor && <small>{expense.vendor}</small>}</div></td>
                    <td>{expense.method}</td>
                    <td className="num negative">{formatRupiah(expense.amount)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
