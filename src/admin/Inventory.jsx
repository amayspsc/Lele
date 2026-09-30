import React, { useMemo, useState } from 'react';
import { EmptyState, Field, Icon, Modal, PageHeading, StatusPill } from '../components/ui.jsx';
import { MOVEMENT_TYPES, movementDelta, stockSummary } from '../lib/store.js';
import { formatDate, formatPrice, formatQty, formatRupiah, todayISO } from '../lib/format.js';

const LEVEL_LABEL = { safe: 'Aman', low: 'Menipis', out: 'Habis' };

const blank = (products) => ({
  date: todayISO(),
  productId: products[0]?.id ?? 1,
  type: 'Masuk',
  qty: 10,
  ref: '',
  note: '',
});

export function MovementForm({ form, setForm, products, onSubmit, onClose, submitLabel }) {
  const isAdjustment = form.type === 'Penyesuaian';
  const invalid = !Number(form.qty);
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        if (invalid) return;
        onSubmit({ ...form, productId: Number(form.productId), qty: Number(form.qty) });
      }}
    >
      <div className="form-row">
        <Field label="Ukuran bibit">
          <select value={form.productId} onChange={(e) => setForm({ ...form, productId: Number(e.target.value) })}>
            {products.map((p) => <option key={p.id} value={p.id}>Bibit {p.size}</option>)}
          </select>
        </Field>
        <Field label="Jenis mutasi">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {MOVEMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Tanggal"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label={isAdjustment ? 'Selisih (+/−)' : 'Jumlah (kantong)'}>
          <input type="number" step="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
        </Field>
      </div>
      <div className="form-row">
        <Field label="Referensi" hint="opsional"><input value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} placeholder="PO-2026-019" /></Field>
        <Field label="Catatan" hint="opsional"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Restok pemijahan kolam 2" /></Field>
      </div>
      {isAdjustment && <p className="form-note">Penyesuaian boleh bernilai negatif untuk mencatat bibit yang tidak lolos sortir atau mati.</p>}
      <div className="form-actions">
        <button type="button" className="button button-outline" onClick={onClose}>Batal</button>
        <button type="submit" className="button button-dark" disabled={invalid}><Icon name="save" size={15} /> {submitLabel}</button>
      </div>
    </form>
  );
}

export function InventoryPanel({ stock, movements, products, actions, onGoCatalog }) {
  const [form, setForm] = useState(() => blank(products));
  const [creating, setCreating] = useState(false);
  const [productFilter, setProductFilter] = useState('all');
  const [toast, setToast] = useState('');

  const flash = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const summary = useMemo(() => stockSummary(stock), [stock]);
  const lowRows = stock.filter((row) => row.low);

  const ledger = useMemo(
    () => movements.filter((m) => productFilter === 'all' || String(m.productId) === String(productFilter)),
    [movements, productFilter],
  );

  const sizeOf = (id) => products.find((p) => p.id === Number(id))?.size || '—';

  const submit = (values) => {
    actions.addMovement(values);
    setCreating(false);
    flash('Mutasi stok dicatat');
  };

  return (
    <>
      <PageHeading overline="PERSEDIAAN" title="Stok bibit" description="Pantau ketersediaan per ukuran, catat restok, dan lacak setiap mutasi kolam.">
        <div className="heading-actions">
          <button className="button button-outline" onClick={onGoCatalog}><Icon name="grid" size={15} /> Harga katalog</button>
          <button className="button button-dark" onClick={() => { setForm(blank(products)); setCreating(true); }}><Icon name="plus" size={16} /> Catat mutasi</button>
        </div>
      </PageHeading>

      <div className="stat-strip">
        <div><span className="field-label">Total di kolam</span><strong>{formatQty(summary.onHand)} kantong</strong></div>
        <div><span className="field-label">Siap dijual</span><strong className="positive">{formatQty(summary.available)} kantong</strong></div>
        <div><span className="field-label">Dipesan (belum kirim)</span><strong>{formatQty(summary.reserved)} kantong</strong></div>
        <div><span className="field-label">Nilai persediaan</span><strong>{formatRupiah(summary.value)}</strong></div>
      </div>

      {lowRows.length > 0 && (
        <div className="alert-banner">
          <span className="alert-icon"><Icon name="alert" size={17} /></span>
          <div>
            <b>{lowRows.length} ukuran bibit perlu restok</b>
            <p>{lowRows.map((row) => `${row.size} (${formatQty(Math.max(0, row.available))} kantong)`).join(' · ')}</p>
          </div>
          <button className="button button-dark" onClick={() => { setForm({ ...blank(products), productId: lowRows[0].id }); setCreating(true); }}><Icon name="plus" size={15} /> Restok sekarang</button>
        </div>
      )}

      <div className="stock-cards">
        {stock.map((row) => (
          <div className={`stock-card level-${row.level}`} key={row.id}>
            <div className="stock-card-head">
              <div className={`table-thumb ${row.accent}`}><span>{row.size.split('–')[0]}</span></div>
              <div>
                <b>Bibit {row.size}</b>
                <small>{formatPrice(row.price)} / kantong</small>
              </div>
              <span className={`level-tag ${row.level}`}>{LEVEL_LABEL[row.level]}</span>
            </div>
            <div className="stock-card-figures">
              <div><span className="field-label">Siap dijual</span><strong>{formatQty(row.available)}</strong></div>
              <div><span className="field-label">Di kolam</span><strong>{formatQty(row.onHand)}</strong></div>
              <div><span className="field-label">Dipesan</span><strong>{formatQty(row.reserved)}</strong></div>
            </div>
            <div className="stock-meter">
              <i style={{ width: `${Math.min(100, (row.available / Math.max(row.minStock * 3, 1)) * 100)}%` }}></i>
              <span>Batas aman {formatQty(row.minStock)} kantong</span>
            </div>
            <div className="stock-card-foot">
              <span>{formatRupiah(row.stockValue)}</span>
              <button className="text-button" onClick={() => { setForm({ ...blank(products), productId: row.id }); setCreating(true); }}>Restok <Icon name="arrow" size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-panel table-panel">
        <div className="panel-head">
          <div><h3>Ketersediaan per ukuran</h3><p>Stok siap dijual = stok di kolam − pesanan yang belum dikirim</p></div>
          <span className="last-updated"><span className="green-dot"></span> Tersinkron dengan transaksi</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>UKURAN BIBIT</th><th>STATUS KATALOG</th><th className="num">DI KOLAM</th><th className="num">DIPESAN</th><th className="num">SIAP DIJUAL</th><th className="num">BATAS AMAN</th><th className="num">NILAI</th><th>KONDISI</th></tr></thead>
            <tbody>
              {stock.map((row) => (
                <tr key={row.id}>
                  <td><div className="table-product"><div className={`table-thumb ${row.accent}`}><span>{row.size.split('–')[0]}</span></div><div><b>Bibit lele {row.size}</b><small>{row.note}</small></div></div></td>
                  <td><StatusPill status={row.status} small /></td>
                  <td className="num">{formatQty(row.onHand)}</td>
                  <td className="num">{formatQty(row.reserved)}</td>
                  <td className={`num ${row.available <= 0 ? 'negative' : ''}`}><b>{formatQty(row.available)}</b></td>
                  <td className="num">{formatQty(row.minStock)}</td>
                  <td className="num">{formatRupiah(row.stockValue)}</td>
                  <td><span className={`tag tag-${row.level === 'safe' ? 'green' : row.level === 'low' ? 'amber' : 'red'}`}>{LEVEL_LABEL[row.level]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-panel table-panel">
        <div className="panel-head">
          <div><h3>Riwayat mutasi stok</h3><p>{ledger.length} mutasi tercatat</p></div>
          <div className="table-filters">
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="all">Semua ukuran</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.size}</option>)}
            </select>
          </div>
        </div>
        {ledger.length === 0 ? (
          <EmptyState icon="boxes" title="Belum ada mutasi" description="Catat stok masuk, keluar, atau penyesuaian sortir." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>TANGGAL</th><th>UKURAN</th><th>JENIS</th><th className="num">JUMLAH</th><th>REFERENSI</th><th>CATATAN</th><th></th></tr></thead>
              <tbody>
                {ledger.map((movement) => {
                  const delta = movementDelta(movement);
                  return (
                    <tr key={movement.id}>
                      <td className="mono-cell">{formatDate(movement.date)}</td>
                      <td>Bibit {sizeOf(movement.productId)}</td>
                      <td><span className={`tag tag-${movement.type === 'Masuk' ? 'green' : movement.type === 'Keluar' ? 'blue' : 'amber'}`}>{movement.type}</span></td>
                      <td className={`num ${delta >= 0 ? 'positive' : 'negative'}`}>{delta >= 0 ? '+' : '−'}{formatQty(Math.abs(delta))}</td>
                      <td className="mono-cell">{movement.ref || '—'}</td>
                      <td><span className="detail-cell">{movement.note || '—'}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-action red" title="Hapus mutasi" onClick={() => { actions.deleteMovement(movement.id); flash(`${movement.id} dihapus`); }}><Icon name="trash" size={15} /></button>
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
          <span><Icon name="checkCircle" size={16} /> Transaksi berstatus Selesai otomatis tercatat sebagai stok keluar.</span>
        </div>
      </div>

      {creating && (
        <Modal title="Catat mutasi stok" subtitle="PERSEDIAAN" onClose={() => setCreating(false)} width="narrow">
          <MovementForm form={form} setForm={setForm} products={products} submitLabel="Simpan mutasi" onClose={() => setCreating(false)} onSubmit={submit} />
        </Modal>
      )}

      {toast && <div className="save-toast"><Icon name="checkCircle" size={18} /> {toast}</div>}
    </>
  );
}
