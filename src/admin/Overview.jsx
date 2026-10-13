import React, { useMemo } from 'react';
import { Icon, MetricCard, OrderStatusTag, PaymentStatusTag, PageHeading } from '../components/ui.jsx';
import {
  OPEN_ORDER_STATUSES,
  cashBalance,
  financeSummary,
  invoiceStatus,
  invoiceTotals,
  monthlySeries,
  percentageChange,
  stockSummary,
} from '../lib/store.js';
import {
  addMonths,
  endOfMonth,
  formatCompactRupiah,
  formatDate,
  formatLongDate,
  formatQty,
  formatRupiah,
  startOfMonth,
  toISODate,
} from '../lib/format.js';

export function OverviewPanel({ transactions, expenses, stock, today, setActive, onOpenInvoice }) {
  const thisMonth = useMemo(
    () => financeSummary(transactions, expenses, { from: startOfMonth(today), to: endOfMonth(today) }, today),
    [transactions, expenses, today],
  );
  const prevMonth = useMemo(() => {
    const prev = toISODate(addMonths(today, -1));
    return financeSummary(transactions, expenses, { from: startOfMonth(prev), to: endOfMonth(prev) }, today);
  }, [transactions, expenses, today]);

  const series = useMemo(() => monthlySeries(transactions, expenses, 6, today), [transactions, expenses, today]);
  const peak = Math.max(...series.map((row) => Math.max(row.income, row.expense)), 1);

  const summary = useMemo(() => stockSummary(stock), [stock]);
  const openOrders = useMemo(() => transactions.filter((tx) => OPEN_ORDER_STATUSES.includes(tx.status)), [transactions]);
  const recent = useMemo(() => transactions.slice(0, 5), [transactions]);
  const soldKantong = useMemo(
    () => transactions.filter((tx) => tx.status === 'Selesai').reduce((sum, tx) => sum + invoiceTotals(tx).totalQty, 0),
    [transactions],
  );

  const safe = stock.filter((r) => r.level === 'safe').length;
  const low = stock.filter((r) => r.level === 'low' && r.level !== 'out').length;
  const out = stock.filter((r) => r.level === 'out').length;
  const totalRows = Math.max(stock.length, 1);
  const safeDeg = Math.round((safe / totalRows) * 360);
  const lowDeg = safeDeg + Math.round((low / totalRows) * 360);

  return (
    <>
      <PageHeading overline={formatLongDate(today).toUpperCase()} title="Selamat datang kembali, admin." description="Ringkasan penjualan, kas, dan persediaan lelepakabi hari ini.">
        <span className="date-chip"><Icon name="dashboard" size={15} /> {formatDate(today)}</span>
      </PageHeading>

      <div className="metrics-grid">
        <MetricCard icon="wallet" label="Kas masuk bulan ini" value={formatCompactRupiah(thisMonth.income)} trend={percentageChange(thisMonth.income, prevMonth.income)} accent="lime" hint={`${thisMonth.transactionCount} transaksi`} />
        <MetricCard icon="trending" label="Laba bersih bulan ini" value={formatCompactRupiah(thisMonth.net)} trend={percentageChange(thisMonth.net, prevMonth.net)} accent={thisMonth.net >= 0 ? 'blue' : 'red'} hint={`Pengeluaran ${formatCompactRupiah(thisMonth.expense)}`} />
        <MetricCard icon="file" label="Piutang berjalan" value={formatCompactRupiah(thisMonth.receivable)} accent="purple" hint={`${thisMonth.unpaidCount} invoice belum lunas`} />
        <MetricCard icon="package" label="Bibit terkirim" value={`${formatQty(soldKantong)}`} accent="orange" hint="kantong · transaksi selesai" />
      </div>

      <div className="overview-grid">
        <div className="dashboard-panel chart-panel">
          <div className="panel-head">
            <div><h3>Arus kas 6 bulan</h3><p>Kas masuk dibanding pengeluaran</p></div>
            <div className="chart-legend"><span><i className="dot-lime"></i>Masuk</span><span><i className="dot-orange"></i>Keluar</span></div>
          </div>
          <div className="bar-chart">
            {series.map((row) => (
              <div className="bar-col" key={row.key}>
                <div className="bar-pair">
                  <div className="bar income" style={{ height: `${Math.max(2, (row.income / peak) * 100)}%` }}></div>
                  <div className="bar expense" style={{ height: `${Math.max(2, (row.expense / peak) * 100)}%` }}></div>
                </div>
                <span className="bar-value">{formatCompactRupiah(row.net)}</span>
                <span className="bar-label">{row.key.slice(5, 7)}</span>
              </div>
            ))}
          </div>
          <div className="panel-footer">
            <span><Icon name="cash" size={16} /> Saldo kas saat ini {formatRupiah(cashBalance(transactions, expenses))}</span>
            <button className="text-button" onClick={() => setActive('finance')}>Buka laporan keuangan <Icon name="arrow" size={13} /></button>
          </div>
        </div>

        <div className="dashboard-panel quick-panel">
          <div className="panel-head">
            <div><h3>Kondisi stok</h3><p>{formatQty(summary.available)} kantong siap dijual</p></div>
            <button className="mini-icon-button" onClick={() => setActive('inventory')} aria-label="Buka stok"><Icon name="arrow" size={15} /></button>
          </div>
          <div className="stock-donut">
            <div className="donut" style={{ background: `conic-gradient(#9dcc5e 0deg ${safeDeg}deg, #e3b06a ${safeDeg}deg ${lowDeg}deg, #d8907b ${lowDeg}deg 360deg)` }}>
              <div><strong>{safe}</strong><span>aman</span></div>
            </div>
            <div className="donut-legend">
              <span><i className="dot-green"></i>Aman <b>{safe}</b></span>
              <span><i className="dot-yellow"></i>Menipis <b>{low}</b></span>
              <span><i className="dot-red"></i>Habis <b>{out}</b></span>
            </div>
          </div>
          {summary.lowCount > 0 && <div className="inline-alert"><Icon name="alert" size={14} /> {summary.lowCount} ukuran di bawah batas aman</div>}
          <button className="quick-link" onClick={() => setActive('inventory')}>Kelola persediaan <Icon name="arrow" size={14} /></button>
        </div>
      </div>

      <div className="overview-orders">
        <div className="dashboard-panel orders-panel">
          <div className="panel-head">
            <div><h3>Transaksi terbaru</h3><p>{openOrders.length} pesanan masih berjalan</p></div>
            <button className="text-button" onClick={() => setActive('transactions')}>Lihat semua <Icon name="arrow" size={14} /></button>
          </div>
          <div className="orders-list">
            {recent.map((tx) => {
              const totals = invoiceTotals(tx);
              return (
                <div className="order-row" key={tx.id}>
                  <span className="order-avatar lime">{(tx.customer?.name || '??').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
                  <div className="order-customer">
                    <b>{tx.customer?.name}</b>
                    <span>{tx.invoice?.number} · {tx.items.map((i) => `${i.size} ×${i.qty}`).join(', ')}</span>
                  </div>
                  <strong className="order-total">{formatRupiah(totals.total)}</strong>
                  <PaymentStatusTag status={invoiceStatus(tx, today)} />
                  <button className="more-button" onClick={() => onOpenInvoice(tx)} title="Lihat invoice"><Icon name="file" size={14} /></button>
                </div>
              );
            })}
          </div>
          <div className="panel-footer"><span><Icon name="checkCircle" size={16} /> Klik ikon invoice untuk mencetak atau mengirim tagihan.</span></div>
        </div>

        <div className="tips-card">
          <div className="tips-icon"><Icon name="alert" size={17} /></div>
          <span className="page-overline">PERLU TINDAKAN</span>
          <h3>{summary.lowCount > 0 ? `${summary.lowCount} ukuran bibit menipis` : 'Persediaan dalam kondisi aman'}</h3>
          <p>
            {summary.lowCount > 0
              ? `${stock.filter((r) => r.low).map((r) => r.size).join(', ')} sudah di bawah batas aman. Jadwalkan restok agar pesanan tidak tertunda.`
              : 'Semua ukuran masih di atas batas aman. Pantau terus setelah pesanan besar masuk.'}
          </p>
          <button onClick={() => setActive('inventory')}>Cek stok <Icon name="arrow" size={14} /></button>
          <div className="tips-extra">
            <div><span className="field-label">Pesanan berjalan</span><b>{openOrders.length}</b></div>
            <div><span className="field-label">Perlu konfirmasi</span><b>{transactions.filter((tx) => tx.status === 'Menunggu konfirmasi').length}</b></div>
            <div><span className="field-label">Invoice telat</span><b>{thisMonth.overdueCount}</b></div>
          </div>
          <span className="tips-status"><OrderStatusTag status={openOrders[0]?.status || 'Selesai'} /></span>
        </div>
      </div>
    </>
  );
}
