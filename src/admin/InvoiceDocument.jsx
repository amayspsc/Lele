import React from 'react';
import { Icon, Logo, PaymentStatusTag } from '../components/ui.jsx';
import { buildInvoice, daysOverdue } from '../lib/store.js';
import { formatDate, formatLongDate, formatPhone, formatPrice, formatRupiah } from '../lib/format.js';

export function InvoiceDocument({ transaction, today }) {
  const invoice = buildInvoice(transaction);
  const { subtotal, discount, shipping, total, paid, balance, totalQty } = invoice.totals;
  const overdue = daysOverdue(transaction, today);

  return (
    <div className="invoice-print" id="invoice-print">
      <div className="invoice-head">
        <div>
          <Logo />
          <p className="invoice-issuer">
            Desa Cimahpar, Bogor — Jawa Barat<br />
            halo@lelepakabi.id · +62 812-3456-7890
          </p>
        </div>
        <div className="invoice-meta">
          <strong>INVOICE</strong>
          <span className="invoice-number">{invoice.number}</span>
          <PaymentStatusTag status={invoice.status} />
          <dl>
            <div><dt>Tanggal</dt><dd>{formatDate(invoice.issueDate)}</dd></div>
            <div><dt>Jatuh tempo</dt><dd>{formatDate(invoice.dueDate)}{overdue > 0 && <em className="overdue"> · telat {overdue} hari</em>}</dd></div>
          </dl>
        </div>
      </div>

      <div className="invoice-billto">
        <span className="field-label">Ditagihkan kepada</span>
        <b>{invoice.customer?.name}</b>
        <p>
          {invoice.customer?.city && <>{invoice.customer.city}<br /></>}
          {invoice.customer?.phone && formatPhone(invoice.customer.phone)}
        </p>
      </div>

      <table className="invoice-table">
        <thead>
          <tr><th>Deskripsi</th><th className="num">Qty</th><th className="num">Harga</th><th className="num">Jumlah</th></tr>
        </thead>
        <tbody>
          {invoice.items.map((line, index) => (
            <tr key={`${line.productId}-${index}`}>
              <td>
                <b>Bibit lele {line.size}</b>
                <small>Per kantong · isi ± 1.000 ekor</small>
              </td>
              <td className="num">{line.qty} kantong</td>
              <td className="num">{formatPrice(line.price)}</td>
              <td className="num">{formatPrice(line.price * line.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-summary">
        <dl>
          <div><dt>Subtotal ({totalQty} kantong)</dt><dd>{formatRupiah(subtotal)}</dd></div>
          {discount > 0 && <div><dt>Diskon</dt><dd className="minus">− {formatRupiah(discount)}</dd></div>}
          <div><dt>Ongkos kirim</dt><dd>{formatRupiah(shipping)}</dd></div>
          <div className="grand"><dt>Total tagihan</dt><dd>{formatRupiah(total)}</dd></div>
          <div><dt>Terbayar ({transaction.paymentMethod})</dt><dd>{formatRupiah(paid)}</dd></div>
          <div className={`balance ${balance > 0 ? 'due' : ''}`}><dt>Sisa tagihan</dt><dd>{formatRupiah(balance)}</dd></div>
        </dl>
      </div>

      <div className="invoice-terms">
        <b>Catatan</b>
        <p>
          {transaction.note || 'Bibit sudah melalui sortir dan aklimatisasi sebelum dikirim.'}
          Pembayaran via transfer ke BCA 1234-567-890 a.n. lelepakabi. Garansi hidup berlaku sampai bibit diterima di kolam.
        </p>
        <span className="invoice-stamp">Dibuat {formatLongDate(today)} · lelepakabi</span>
      </div>
    </div>
  );
}

export function InvoiceModalActions({ transaction, onClose }) {
  const invoice = buildInvoice(transaction);
  const lines = invoice.items.map((l) => `• Bibit ${l.size} × ${l.qty} kantong = ${formatRupiah(l.price * l.qty)}`).join('\n');
  const message = `Halo ${invoice.customer?.name || 'kak'}, berikut tagihan ${invoice.number} dari lelepakabi:\n\n${lines}\n\nTotal: ${formatRupiah(invoice.totals.total)}\nTerbayar: ${formatRupiah(invoice.totals.paid)}\nSisa: ${formatRupiah(invoice.totals.balance)}\nJatuh tempo: ${formatDate(invoice.dueDate)}\n\nTerima kasih 🙏`;

  return (
    <>
      <a
        className="button button-outline"
        href={`https://wa.me/${(invoice.customer?.phone || '').replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noreferrer"
      >
        <Icon name="send" size={15} /> Kirim via WhatsApp
      </a>
      <button className="button button-dark" onClick={() => window.print()}>
        <Icon name="printer" size={15} /> Cetak / simpan PDF
      </button>
      <button className="button button-outline" onClick={onClose}>Tutup</button>
    </>
  );
}
