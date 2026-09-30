import React, { useMemo, useState } from 'react';
import { EmptyState, Field, Icon, Modal, PageHeading, Tag } from '../components/ui.jsx';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, expenseCategoryColor, expenseCategoryLabel, expenseCategoryTotal } from '../lib/store.js';
import { formatDate, formatRupiah, monthKey, monthLabel, todayISO } from '../lib/format.js';

const blank = () => ({ date: todayISO(), category: 'pakan', description: '', amount: 0, method: 'Transfer bank', vendor: '' });

export function ExpenseForm({ form, setForm, onSubmit, onClose, submitLabel }) {
  const invalid = !form.description.trim() || Number(form.amount) <= 0;
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        if (invalid) return;
        onSubmit({ ...form, amount: Number(form.amount) || 0 });
      }}
    >
      <div className="form-row">
        <Field label="Tanggal"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Kategori">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Metode pembayaran">
          <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Keterangan"><input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="mis. Pakan starter 12 karung" /></Field>
      <div className="form-row">
        <Field label="Jumlah (Rp)"><input required type="number" min="0" step="10000" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Field>
        <Field label="Vendor / pemasok" hint="opsional"><input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Toko Pakan Mandiri" /></Field>
      </div>
      <div className="form-summary">
        <div className="grand"><span>Total dicatat</span><b className="minus">{formatRupiah(Number(form.amount) || 0)}</b></div>
      </div>
      <div className="form-actions">
        <button type="button" className="button button-outline" onClick={onClose}>Batal</button>
        <button type="submit" className="button button-dark" disabled={invalid}><Icon name="save" size={15} /> {submitLabel}</button>
      </div>
    </form>
  );
}

export function ExpensesPanel({ expenses, today, actions }) {
  const [monthFilter, setMonthFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [toast, setToast] = useState('');

  const flash = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const months = useMemo(() => {
    const keys = [...new Set(expenses.map((e) => monthKey(e.date)))].sort().reverse();
    return keys;
  }, [expenses]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return expenses.filter((expense) => {
      if (monthFilter !== 'all' && monthKey(expense.date) !== monthFilter) return false;
      if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false;
      if (!needle) return true;
      return [expense.description, expense.vendor, expense.id].filter(Boolean).some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [expenses, monthFilter, categoryFilter, query]);

  const total = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const monthTotal = expenses.filter((e) => monthKey(e.date) === monthKey(today)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const biggest = [...filtered].sort((a, b) => b.amount - a.amount)[0];

  const submit = (values) => {
    if (editing) {
      actions.updateExpense(editing.id, values);
      setEditing(null);
      flash('Pengeluaran diperbarui');
    } else {
      const created = actions.addExpense(values);
      setCreating(false);
      flash(`${created?.id} dicatat`);
    }
  };

  return (
    <>
      <PageHeading overline="BIAYA OPERASIONAL" title="Pengeluaran" description="Catat semua biaya budidaya agar laba bersih di laporan keuangan akurat.">
        <button className="button button-dark" onClick={() => { setForm(blank()); setCreating(true); }}><Icon name="plus" size={16} /> Catat pengeluaran</button>
      </PageHeading>

      <div className="stat-strip">
        <div><span className="field-label">Bulan ini</span><strong className="negative">{formatRupiah(monthTotal)}</strong></div>
        <div><span className="field-label">Tampil sekarang</span><strong>{formatRupiah(total)}</strong></div>
        <div><span className="field-label">Jumlah catatan</span><strong>{filtered.length}</strong></div>
        <div><span className="field-label">Terbesar</span><strong>{biggest ? formatRupiah(biggest.amount) : '—'}</strong></div>
      </div>

      <div className="category-chips">
        {EXPENSE_CATEGORIES.map((category) => {
          const amount = expenseCategoryTotal(expenses, category.id, monthFilter === 'all' ? null : monthFilter);
          return (
            <button key={category.id} className={`category-chip ${categoryFilter === category.id ? 'active' : ''}`} onClick={() => setCategoryFilter(categoryFilter === category.id ? 'all' : category.id)}>
              <Tag tone={expenseCategoryColor(category.id)}>{category.label}</Tag>
              <b>{formatRupiah(amount)}</b>
            </button>
          );
        })}
      </div>

      <div className="dashboard-panel table-panel">
        <div className="panel-head">
          <div><h3>Catatan pengeluaran</h3><p>{filtered.length} dari {expenses.length} catatan</p></div>
          <div className="table-filters">
            <div className="search-input"><Icon name="search" size={14} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari keterangan atau vendor" /></div>
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <option value="all">Semua bulan</option>
              {months.map((key) => <option key={key} value={key}>{monthLabel(key)}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="trendingDown" title="Belum ada pengeluaran" description="Catat biaya pakan, listrik, obat, atau transportasi agar laporan keuangan lengkap.">
            <button className="button button-dark" onClick={() => { setForm(blank()); setCreating(true); }}><Icon name="plus" size={15} /> Catat pengeluaran</button>
          </EmptyState>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>TANGGAL</th><th>KATEGORI</th><th>KETERANGAN</th><th>METODE</th><th className="num">JUMLAH</th><th></th></tr></thead>
              <tbody>
                {filtered.map((expense) => (
                  <tr key={expense.id}>
                    <td className="mono-cell">{formatDate(expense.date)}</td>
                    <td><Tag tone={expenseCategoryColor(expense.category)}>{expenseCategoryLabel(expense.category)}</Tag></td>
                    <td><div className="cell-stack"><b>{expense.description}</b><small>{expense.vendor || 'Tanpa vendor'}</small></div></td>
                    <td>{expense.method}</td>
                    <td className="num negative"><b>{formatRupiah(expense.amount)}</b></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-action" title="Ubah" onClick={() => { setForm({ ...expense }); setEditing(expense); }}><Icon name="edit" size={15} /></button>
                        <button className="icon-action red" title="Hapus" onClick={() => { actions.deleteExpense(expense.id); flash(`${expense.id} dihapus`); }}><Icon name="trash" size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="panel-footer">
          <span><Icon name="checkCircle" size={16} /> Pengeluaran langsung mengurangi laba bersih di halaman Keuangan.</span>
        </div>
      </div>

      {(creating || editing) && (
        <Modal title={editing ? `Ubah ${editing.id}` : 'Catat pengeluaran'} subtitle={editing ? 'UBAH DATA' : 'BIAYA BARU'} onClose={() => { setCreating(false); setEditing(null); }}>
          <ExpenseForm form={form} setForm={setForm} submitLabel={editing ? 'Simpan perubahan' : 'Simpan pengeluaran'} onClose={() => { setCreating(false); setEditing(null); }} onSubmit={submit} />
        </Modal>
      )}

      {toast && <div className="save-toast"><Icon name="checkCircle" size={18} /> {toast}</div>}
    </>
  );
}
