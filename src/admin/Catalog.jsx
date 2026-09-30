import React from 'react';
import { Icon, PageHeading, StatusPill } from '../components/ui.jsx';
import { formatPrice, formatQty, formatRupiah } from '../lib/format.js';

const marginOf = (product) => {
  const price = Number(product.price) || 0;
  const cost = Number(product.cost) || 0;
  return price > 0 ? ((price - cost) / price) * 100 : 0;
};

export function CatalogPanel({ products, stock, draftProducts, setDraftProducts, onSave, onSync }) {
  const update = (id, key, value) =>
    setDraftProducts(draftProducts.map((p) => (p.id === id ? { ...p, [key]: ['price', 'cost', 'minStock'].includes(key) ? Number(value) : value } : p)));

  const stockOf = (id) => stock.find((row) => row.id === id);

  return (
    <>
      <PageHeading overline="KATALOG PUBLIK" title="Katalog bibit" description="Harga, harga pokok, dan status yang tampil di halaman utama toko.">
        <div className="heading-actions">
          <button className="button button-outline" onClick={onSync}><Icon name="refresh" size={15} /> Batalkan perubahan</button>
          <button className="button button-dark" onClick={onSave}><Icon name="save" size={15} /> Simpan katalog</button>
        </div>
      </PageHeading>

      <div className="dashboard-panel table-panel">
        <div className="panel-head">
          <div><h3>Harga & ketersediaan</h3><p>Perubahan langsung terlihat di katalog publik setelah disimpan</p></div>
          <span className="last-updated"><span className="green-dot"></span> Tersimpan otomatis</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>UKURAN BIBIT</th><th>HARGA JUAL</th><th>HPP / KANTONG</th><th className="num">MARGIN</th><th>BATAS AMAN</th><th>STATUS</th><th className="num">SIAP DIJUAL</th></tr>
            </thead>
            <tbody>
              {draftProducts.map((product) => {
                const row = stockOf(product.id);
                const margin = marginOf(product);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <div className={`table-thumb ${product.accent}`}><span>{product.size.split('–')[0]}</span></div>
                        <div><b>Bibit lele {product.size}</b><small>{product.note}</small></div>
                      </div>
                    </td>
                    <td>
                      <div className="price-input"><span>Rp</span><input type="number" min="0" step="5000" value={product.price} onChange={(e) => update(product.id, 'price', e.target.value)} /></div>
                    </td>
                    <td>
                      <div className="price-input"><span>Rp</span><input type="number" min="0" step="2000" value={product.cost} onChange={(e) => update(product.id, 'cost', e.target.value)} /></div>
                    </td>
                    <td className={`num ${margin >= 30 ? 'positive' : margin > 0 ? '' : 'negative'}`}><b>{margin.toFixed(0)}%</b><small>{formatRupiah((Number(product.price) || 0) - (Number(product.cost) || 0))} / kantong</small></td>
                    <td><input className="mini-input" type="number" min="0" step="1" value={product.minStock} onChange={(e) => update(product.id, 'minStock', e.target.value)} /></td>
                    <td>
                      <select className={`status-select ${product.status === 'Tersedia' ? 'green' : product.status === 'Pre-order' ? 'yellow' : 'red'}`} value={product.status} onChange={(e) => update(product.id, 'status', e.target.value)}>
                        <option>Tersedia</option><option>Pre-order</option><option>Habis</option>
                      </select>
                    </td>
                    <td className="num">{row ? <><b>{formatQty(row.available)}</b><small>dari {formatQty(row.onHand)} kantong</small></> : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="panel-footer">
          <span><Icon name="checkCircle" size={16} /> HPP dipakai untuk menghitung laba kotor di laporan Keuangan.</span>
          <span className="price-hint"><StatusPill status="Tersedia" small /> Status ini yang tampil di kartu katalog publik.</span>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-head"><div><h3>Pratinjau harga publik</h3><p>{formatPrice(draftProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0))} total seluruh ukuran</p></div></div>
        <div className="price-preview">
          {draftProducts.map((product) => (
            <div className="price-preview-row" key={product.id}>
              <span className={`table-thumb ${product.accent}`}><span>{product.size.split('–')[0]}</span></span>
              <div><b>{product.size}</b><small>{formatRupiah(product.price)} per kantong</small></div>
              <StatusPill status={product.status} small />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
