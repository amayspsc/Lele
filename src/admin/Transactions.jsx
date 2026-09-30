import React, { useMemo, useState } from 'react';
import { EmptyState, Field, Icon, Modal, OrderStatusTag, PageHeading, PaymentStatusTag } from '../components/ui.jsx';
import { InvoiceDocument, InvoiceModalActions } from './InvoiceDocument.jsx';
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  invoiceStatus,
  invoiceTotals,
  paymentStatusFor,
} from '../lib/store.js';
import { addDays, formatDate, formatPhone, formatPrice, formatQty, formatRupiah, todayISO } from '../lib/format.js';

const blankForm = (products, date = todayISO()) => ({
  date,
  dueDate: addDays(date, 7),
  customer: { name: '', phone: '', city: '' },
  lines: [{ productId: products[0]?.id ?? 1, qty: 1 }],
  discount: 0,
  shipping: 0,
  paymentMethod: 'Transfer bank',
  paidAmount: 0,
  status: 'Menunggu konfirmasi',
  note: '',
});

const toForm = (transaction) => ({
  date: transaction.date,
  dueDate: transaction.invoice?.dueDate,
  customer: { ...transaction.customer },
  lines: transaction.items.map((line) => ({ productId: line.productId, qty: line.qty })),
  discount: transaction.discount,
  shipping: transaction.shipping,
  paymentMethod: transaction.paymentMethod,
  paidAmount: transaction.paidAmount,
  status: transaction.status,
  note: transaction.note,
});

export function TransactionForm({ form, setForm, products, onSubmit, onClose, submitLabel }) {
  const items = form.lines
    .map((line) => {
      const product = products.find((p) => p.id === Number(line.productId));
      if (!product) return null;
      return { productId: product.id, size: product.size, price: product.price, cost: product.cost, qty: Number(line.qty) || 0 };
    })
    .filter((line) => line && line.qty > 0);

  const totals = invoiceTotals({ items, discount: form.discount, shipping: form.shipping, paidAmount: form.paidAmount });
  const invalid = !form.customer.name.trim() || !items.length;

  const setLine = (index, patch) => setForm({ ...form, lines: form.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)) });

  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        if (invalid) return;
        onSubmit({ ...form, items, paidAmount: Math.min(Number(form.paidAmount) || 0, totals.total) });
      }}
    >
      <div className="form-section">
        <span className="form-title">Pelanggan</span>
        <div className="form-row">
          <Field label="Nama pelanggan"><input required value={form.customer.name} onChange={(e) => setForm({ ...form, customer: { ...form.customer, name: e.target.value } })} placeholder="mis. Andi Rahman" /></Field>
          <Field label="Nomor WhatsApp"><input value={form.customer.phone} onChange={(e) => setForm({ ...form, customer: { ...form.customer, phone: e.target.value } })} placeholder="0812…" /></Field>
          <Field label="Kota"><input value={form.customer.city} onChange={(e) => setForm({ ...form, customer: { ...form.customer, city: e.target.value } })} placeholder="Bogor" /></Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-head">
          <span className="form-title">Rincian bibit</span>
          <button type="button" className="text-button" onClick={() => setForm({ ...form, lines: [...form.lines, { productId: products[0]?.id ?? 1, qty: 1 }] })}>
            <Icon name="plus" size={13} /> Tambah ukuran
          </button>
        </div>
        <div className="line-rows">
          <div className="line-row line-head"><span>Ukuran bibit</span><span>Qty (kantong)</span><span>Subtotal</span><span></span></div>
          {form.lines.map((line, index) => {
            const product = products.find((p) => p.id === Number(line.productId));
            return (
              <div className="line-row" key={index}>
                <select value={line.productId} onChange={(e) => setLine(index, { productId: Number(e.target.value) })}>
                  {products.map((p) => <option key={p.id} value={p.id}>Bibit {p.size} · {formatRupiah(p.price)}</option>)}
                </select>
                <input type="number" min="1" step="1" value={line.qty} onChange={(e) => setLine(index, { qty: Number(e.target.value) })} />
                <span className="line-total">{formatRupiah((product?.price || 0) * (Number(line.qty) || 0))}</span>
                <button type="button" className="row-delete" disabled={form.lines.length === 1} onClick={() => setForm({ ...form, lines: form.lines.filter((_, i) => i !== index) })} aria-label="Hapus baris">
                  <Icon name="trash" size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="form-section">
        <span className="form-title">Pembayaran & pengiriman</span>
        <div className="form-row">
          <Field label="Tanggal transaksi"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="Jatuh tempo"><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
          <Field label="Metode"><select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
          <Field label="Status pesanan"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Diskon (Rp)"><input type="number" min="0" step="5000" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} /></Field>
          <Field label="Ongkir (Rp)"><input type="number" min="0" step="5000" value={form.shipping} onChange={(e) => setForm({ ...form, shipping: Number(e.target.value) })} /></Field>
          <Field label="Sudah diterima (Rp)"><input type="number" min="0" step="10000" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) })} /></Field>
          <Field label="Status pembayaran" className="readonly"><span className="field-static">{paymentStatusFor({ items, discount: form.discount, shipping: form.shipping }, form.paidAmount)}</span></Field>
        </div>
        <Field label="Catatan"><textarea rows="2" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Catatan untuk tim sortir / pengiriman" /></Field>
      </div>

      <div className="form-summary">
        <div><span>Subtotal</span><b>{formatRupiah(totals.subtotal)}</b></div>
        {totals.discount > 0 && <div><span>Diskon</span><b className="minus">− {formatRupiah(totals.discount)}</b></div>}
        <div><span>Ongkir</span><b>{formatRupiah(totals.shipping)}</b></div>
        <div className="grand"><span>Total</span><b>{formatRupiah(totals.total)}</b></div>
        <div><span>Sisa</span><b className={totals.balance > 0 ? 'due' : ''}>{formatRupiah(totals.balance)}</b></div>
      </div>

      <div className="form-actions">
        <button type="button" className="button button-outline" onClick={onClose}>Batal</button>
        <button type="submit" className="button button-dark" disabled={invalid}><Icon name="save" size={15} /> {submitLabel}</button>
      </div>
    </form>
  );
}

function PaymentModal({ transaction, onClose, onSave }) {
  const totals = invoiceTotals(transaction);
  const [amount, setAmount] = useState(totals.balance);
  return (
    <Modal title={`Catat pembayaran · ${transaction.invoice.number}`} subtitle="PENERIMAAN KAS" onClose={onClose} width="narrow"
      footer={<><button className="button button-outline" onClick={onClose}>Batal</button><button className="button button-dark" onClick={() => onSave(Math.max(0, Math.min(Number(amount) || 0, totals.total)))}><Icon name="cash" size={15} /> Simpan pembayaran</button></>}>
      <div className="pay-summary">
        <div><span>Total tagihan</span><b>{formatRupiah(totals.total)}</b></div>
        <div><span>Sudah diterima</span><b>{formatRupiah(totals.paid)}</b></div>
        <div className="grand"><span>Sisa</span><b>{formatRupiah(totals.balance)}</b></div>
      </div>
      <Field label="Nominal diterima (Rp)">
        <input type="number" min="0" step="10000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </Field>
      <div className="quick-amounts">
        {[totals.balance, totals.total].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i).map((value) => (
          <button key={value} type="button" onClick={() => setAmount(value)}>
            {value === totals.total ? 'Isi penuh' : 'Isi sisa'} · {formatRupiah(value)}
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function TransactionsPanel({ transactions, products, today, actions, onOpenInvoice, onGoInventory }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [paymentFilter, setPaymentFilter] = useState('Semua');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(() => blankForm(products));
  const [paying, setPaying] = useState(null);
  const [toast, setToast] = useState('');

  const flash = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (statusFilter !== 'Semua' && tx.status !== statusFilter) return false;
      const status = invoiceStatus(tx, today);
      if (paymentFilter !== 'Semua' && status !== paymentFilter) return false;
      if (!needle) return true;
      return [tx.invoice?.number, tx.customer?.name, tx.customer?.city, tx.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [transactions, query, statusFilter, paymentFilter, today]);

  const stats = useMemo(() => {
    const active = transactions.filter((tx) => tx.status !== 'Dibatalkan');
    return {
      count: active.length,
      invoiced: active.reduce((sum, tx) => sum + invoiceTotals(tx).total, 0),
      collected: active.reduce((sum, tx) => sum + invoiceTotals(tx).paid, 0),
      outstanding: active.reduce((sum, tx) => sum + invoiceTotals(tx).balance, 0),
    };
  }, [transactions]);

  const openCreate = () => {
    setForm(blankForm(products));
    setCreating(true);
  };

  const openEdit = (transaction) => {
    setForm(toForm(transaction));
    setEditing(transaction);
  };

  const submit = (values) => {
    if (editing) {
      actions.updateTransaction(editing.id, {
        date: values.date,
        customer: values.customer,
        items: values.items,
        discount: values.discount,
        shipping: values.shipping,
        paymentMethod: values.paymentMethod,
        paidAmount: values.paidAmount,
        status: values.status,
        note: values.note,
        invoice: { ...editing.invoice, dueDate: values.dueDate },
      });
      setEditing(null);
      flash(`Transaksi ${editing.invoice?.number} diperbarui`);
    } else {
      const created = actions.createTransaction({ ...values, invoice: { dueDate: values.dueDate } });
      setCreating(false);
      flash(created ? `Transaksi ${created.invoice.number} dibuat` : 'Transaksi gagal dibuat');
    }
  };

  return (
    <>
      <PageHeading overline="PENJUALAN" title="Transaksi" description="Catat pesanan, terima pembayaran, dan pantau status pengiriman bibit.">
        <div className="heading-actions">
          <button className="button button-outline" onClick={onGoInventory}><Icon name="boxes" size={15} /> Cek stok</button>
          <button className="button button-dark" onClick={openCreate}><Icon name="plus" size={16} /> Transaksi baru</button>
        </div>
      </PageHeading>

      <div className="stat-strip">
        <div><span className="field-label">Transaksi tercatat</span><strong>{formatQty(stats.count)}</strong></div>
        <div><span className="field-label">Nilai invoice</span><strong>{formatRupiah(stats.invoiced)}</strong></div>
        <div><span className="field-label">Kas diterima</span><strong className="positive">{formatRupiah(stats.collected)}</strong></div>
        <div><span className="field-label">Belum diterima</span><strong className="negative">{formatRupiah(stats.outstanding)}</strong></div>
      </div>

      <div className="dashboard-panel table-panel">
        <div className="panel-head">
          <div><h3>Daftar transaksi</h3><p>{filtered.length} dari {transactions.length} transaksi</p></div>
          <div className="table-filters">
            <div className="search-input"><Icon name="search" size={14} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari invoice atau pelanggan" /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Semua</option>
              {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option>Semua</option>
              {['Lunas', 'DP', 'Belum dibayar', 'Terlambat', 'Dibatalkan'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="list" title="Tidak ada transaksi" description="Ubah filter atau buat transaksi baru untuk mulai mencatat penjualan.">
            <button className="button button-dark" onClick={openCreate}><Icon name="plus" size={15} /> Transaksi baru</button>
          </EmptyState>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>INVOICE</th><th>TANGGAL</th><th>PELANGGAN</th><th>RINCIAN</th>
                  <th className="num">TOTAL</th><th className="num">SISA</th><th>PESANAN</th><th>BAYAR</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const totals = invoiceTotals(tx);
                  const detail = tx.items.map((i) => `${i.size} ×${i.qty}`).join(', ');
                  return (
                    <tr key={tx.id}>
                      <td><button className="link-cell" onClick={() => onOpenInvoice(tx)}><Icon name="file" size={13} /> {tx.invoice?.number}</button></td>
                      <td><span className="mono-cell">{formatDate(tx.date)}</span></td>
                      <td>
                        <div className="cell-stack"><b>{tx.customer?.name}</b><small>{tx.customer?.city || '—'} · {formatPhone(tx.customer?.phone)}</small></div>
                      </td>
                      <td><span className="detail-cell">{detail}</span></td>
                      <td className="num"><b>{formatRupiah(totals.total)}</b><small>{formatPrice(totals.paid)} diterima</small></td>
                      <td className={`num ${totals.balance > 0 ? 'negative' : 'positive'}`}>{formatRupiah(totals.balance)}</td>
                      <td><OrderStatusTag status={tx.status} /></td>
                      <td><PaymentStatusTag status={invoiceStatus(tx, today)} /></td>
                      <td>
                        <div className="row-actions">
                          {totals.balance > 0 && tx.status !== 'Dibatalkan' && (
                            <button className="icon-action green" title="Catat pembayaran" onClick={() => setPaying(tx)}><Icon name="cash" size={15} /></button>
                          )}
                          <button className="icon-action" title="Ubah transaksi" onClick={() => openEdit(tx)}><Icon name="edit" size={15} /></button>
                          <button className="icon-action red" title="Hapus transaksi" onClick={() => { actions.deleteTransaction(tx.id); flash(`${tx.invoice?.number} dihapus`); }}><Icon name="trash" size={15} /></button>
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
          <span><Icon name="checkCircle" size={16} /> Transaksi berstatus Selesai otomatis mengurangi stok bibit.</span>
        </div>
      </div>

      {(creating || editing) && (
        <Modal
          title={editing ? `Ubah ${editing.invoice?.number}` : 'Transaksi baru'}
          subtitle={editing ? 'UBAH DATA' : 'INPUT PENJUALAN'}
          onClose={() => { setCreating(false); setEditing(null); }}
        >
          <TransactionForm
            form={form}
            setForm={setForm}
            products={products}
            submitLabel={editing ? 'Simpan perubahan' : 'Buat transaksi'}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSubmit={submit}
          />
        </Modal>
      )}

      {paying && (
        <PaymentModal
          transaction={paying}
          onClose={() => setPaying(null)}
          onSave={(amount) => {
            actions.recordPayment(paying.id, amount);
            setPaying(null);
            flash(`Pembayaran ${formatRupiah(amount)} dicatat`);
          }}
        />
      )}

      {toast && <div className="save-toast"><Icon name="checkCircle" size={18} /> {toast}</div>}
    </>
  );
}
