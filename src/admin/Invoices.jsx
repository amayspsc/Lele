import React, { useMemo, useState } from 'react';
import { EmptyState, Icon, Modal, PageHeading, PaymentStatusTag } from '../components/ui.jsx';
import { InvoiceDocument, InvoiceModalActions } from './InvoiceDocument.jsx';
import { daysOverdue, invoiceStatus, invoiceTotals } from '../lib/store.js';
import { formatDate, formatRupiah } from '../lib/format.js';

const TABS = ['Semua', 'Lunas', 'Belum dibayar', 'Terlambat'];

const bucketFor = (tx, today) => {
  const overdue = daysOverdue(tx, today);
  if (overdue <= 0) return 'Belum jatuh tempo';
  if (overdue <= 7) return '1–7 hari';
  if (overdue <= 30) return '8–30 hari';
  return '> 30 hari';
};

export function InvoicesPanel({ transactions, today, actions, onGoTransactions }) {
  const [tab, setTab] = useState('Semua');
  const [open, setOpen] = useState(null);

  const rows = useMemo(
    () =>
      transactions
        .filter((tx) => tx.status !== 'Dibatalkan')
        .map((tx) => ({ tx, status: invoiceStatus(tx, today), totals: invoiceTotals(tx) })),
    [transactions, today],
  );

  const summary = useMemo(() => {
    const paid = rows.filter((r) => r.status === 'Lunas');
    const unpaid = rows.filter((r) => r.status === 'Belum dibayar');
    const late = rows.filter((r) => r.status === 'Terlambat');
    return {
      total: rows.length,
      paidCount: paid.length,
      paidAmount: paid.reduce((sum, r) => sum + r.totals.paid, 0),
      unpaidCount: unpaid.length,
      unpaidAmount: unpaid.reduce((sum, r) => sum + r.totals.balance, 0),
      lateCount: late.length,
      lateAmount: late.reduce((sum, r) => sum + r.totals.balance, 0),
      outstanding: [...unpaid, ...late].reduce((sum, r) => sum + r.totals.balance, 0),
    };
  }, [rows]);

  const aging = useMemo(() => {
    const pending = rows.filter((r) => r.status !== 'Lunas');
    return ['Belum jatuh tempo', '1–7 hari', '8–30 hari', '> 30 hari'].map((label) => {
      const bucket = pending.filter((r) => bucketFor(r.tx, today) === label);
      return { label, count: bucket.length, amount: bucket.reduce((sum, r) => sum + r.totals.balance, 0) };
    });
  }, [rows, today]);

  const visible = tab === 'Semua' ? rows : rows.filter((r) => r.status === tab);

  return (
    <>
      <PageHeading overline="PENAGIHAN" title="Invoice" description="Semua tagihan yang terbit dari transaksi, lengkap dengan umur piutang.">
        <button className="button button-dark" onClick={onGoTransactions}><Icon name="plus" size={16} /> Buat invoice baru</button>
      </PageHeading>

      <div className="stat-strip">
        <div><span className="field-label">Invoice terbit</span><strong>{summary.total}</strong></div>
        <div><span className="field-label">Lunas</span><strong className="positive">{summary.paidCount} · {formatRupiah(summary.paidAmount)}</strong></div>
        <div><span className="field-label">Belum dibayar</span><strong>{summary.unpaidCount} · {formatRupiah(summary.unpaidAmount)}</strong></div>
        <div><span className="field-label">Terlambat</span><strong className="negative">{summary.lateCount} · {formatRupiah(summary.lateAmount)}</strong></div>
      </div>

      <div className="aging-grid">
        {aging.map((bucket) => (
          <div className="aging-card" key={bucket.label}>
            <span className="field-label">Umur {bucket.label}</span>
            <strong>{formatRupiah(bucket.amount)}</strong>
            <small>{bucket.count} invoice</small>
          </div>
        ))}
      </div>

      <div className="dashboard-panel table-panel">
        <div className="panel-head">
          <div><h3>Daftar invoice</h3><p>Total piutang berjalan {formatRupiah(summary.outstanding)}</p></div>
          <div className="tab-strip">
            {TABS.map((label) => (
              <button key={label} className={tab === label ? 'active' : ''} onClick={() => setTab(label)}>
                {label}
                {label !== 'Semua' && <span className="tab-count">{rows.filter((r) => r.status === label).length}</span>}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon="file" title="Belum ada invoice" description="Invoice dibuat otomatis setiap kali transaksi baru dicatat." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>NOMOR</th><th>PELANGGAN</th><th>TERBIT</th><th>JATUH TEMPO</th><th className="num">TAGIHAN</th><th className="num">SISA</th><th>STATUS</th><th></th></tr>
              </thead>
              <tbody>
                {visible.map(({ tx, status, totals }) => {
                  const overdue = daysOverdue(tx, today);
                  return (
                    <tr key={tx.id}>
                      <td><button className="link-cell" onClick={() => setOpen(tx)}><Icon name="file" size={13} /> {tx.invoice?.number}</button></td>
                      <td><div className="cell-stack"><b>{tx.customer?.name}</b><small>{tx.customer?.city || '—'}</small></div></td>
                      <td><span className="mono-cell">{formatDate(tx.date)}</span></td>
                      <td>
                        <span className="mono-cell">{formatDate(tx.invoice?.dueDate)}</span>
                        {overdue > 0 && <small className="negative">telat {overdue} hari</small>}
                      </td>
                      <td className="num"><b>{formatRupiah(totals.total)}</b></td>
                      <td className={`num ${totals.balance > 0 ? 'negative' : 'positive'}`}>{formatRupiah(totals.balance)}</td>
                      <td><PaymentStatusTag status={status} /></td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-action" title="Lihat invoice" onClick={() => setOpen(tx)}><Icon name="search" size={15} /></button>
                          {totals.balance > 0 && (
                            <button className="icon-action green" title="Catat pembayaran" onClick={() => { actions.recordPayment(tx.id, totals.total); }}><Icon name="checkCircle" size={15} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="panel-footer">
          <span><Icon name="checkCircle" size={16} /> Buka invoice untuk mencetak PDF atau mengirim tagihan via WhatsApp.</span>
        </div>
      </div>

      {open && (
        <Modal title={open.invoice?.number} subtitle={`INVOICE · ${open.customer?.name || ''}`} onClose={() => setOpen(null)}
          footer={<InvoiceModalActions transaction={open} onClose={() => setOpen(null)} />}>
          <InvoiceDocument transaction={open} today={today} />
        </Modal>
      )}
    </>
  );
}
