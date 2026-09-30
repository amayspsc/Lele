import React, { useEffect, useMemo, useState } from 'react';
import { Icon, Logo, Modal } from '../components/ui.jsx';
import { InvoiceDocument, InvoiceModalActions } from './InvoiceDocument.jsx';
import { OverviewPanel } from './Overview.jsx';
import { TransactionsPanel } from './Transactions.jsx';
import { InvoicesPanel } from './Invoices.jsx';
import { FinancePanel } from './Finance.jsx';
import { ExpensesPanel } from './Expenses.jsx';
import { InventoryPanel } from './Inventory.jsx';
import { CatalogPanel } from './Catalog.jsx';
import { stockSummary } from '../lib/store.js';
import { todayISO } from '../lib/format.js';

const NAV = [
  { id: 'overview', label: 'Ringkasan', icon: 'dashboard' },
  { id: 'transactions', label: 'Transaksi', icon: 'list', badge: 'pending' },
  { id: 'invoices', label: 'Invoice', icon: 'file' },
  { id: 'finance', label: 'Keuangan', icon: 'wallet' },
  { id: 'expenses', label: 'Pengeluaran', icon: 'trendingDown' },
  { id: 'inventory', label: 'Stok', icon: 'boxes', badge: 'lowStock' },
  { id: 'catalog', label: 'Katalog bibit', icon: 'grid' },
];

export function AdminSidebar({ active, setActive, counts, onLogout, onReset }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand"><Logo light /><span className="admin-tag">ADMIN</span></div>
      <div className="admin-profile">
        <div className="profile-avatar">LP</div>
        <div><b>Admin lelepakabi</b><span>Administrator</span></div>
        <Icon name="chevron" size={15} />
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">Operasional</span>
        {NAV.slice(0, 4).map((item) => (
          <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>
            <Icon name={item.icon} size={17} /> {item.label}
            {item.badge && counts[item.badge] > 0 && <span className={`nav-count ${item.badge === 'pending' ? 'alert' : ''}`}>{counts[item.badge]}</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">Keuangan & stok</span>
        {NAV.slice(4).map((item) => (
          <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>
            <Icon name={item.icon} size={17} /> {item.label}
            {item.badge && counts[item.badge] > 0 && <span className="nav-count alert">{counts[item.badge]}</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-section sidebar-bottom">
        <span className="sidebar-label">Lainnya</span>
        <button onClick={onReset}><Icon name="refresh" size={17} /> Muat ulang data contoh</button>
      </div>

      <button className="logout-button" onClick={onLogout}><Icon name="logout" size={17} /> Keluar dari dashboard</button>
      <div className="sidebar-version">lelepakabi v2.0 <span>•</span> Bogor</div>
    </aside>
  );
}

export function AdminDashboard({ data, onLogout }) {
  const { products, transactions, expenses, movements, stock, actions } = data;
  const [active, setActive] = useState('overview');
  const [draftProducts, setDraftProducts] = useState(products);
  const [invoice, setInvoice] = useState(null);
  const [saved, setSaved] = useState('');

  useEffect(() => setDraftProducts(products), [products]);

  const today = todayISO();

  const counts = useMemo(() => {
    const summary = stockSummary(stock);
    return {
      pending: transactions.filter((tx) => tx.status === 'Menunggu konfirmasi').length,
      lowStock: summary.lowCount,
    };
  }, [transactions, stock]);

  const flash = (message) => {
    setSaved(message);
    window.setTimeout(() => setSaved(''), 3000);
  };

  const saveCatalog = () => {
    actions.saveProducts(draftProducts);
    flash('Perubahan katalog berhasil disimpan');
  };

  const label = NAV.find((item) => item.id === active)?.label || 'Ringkasan';

  return (
    <div className="admin-layout">
      <AdminSidebar
        active={active}
        setActive={setActive}
        counts={counts}
        onLogout={onLogout}
        onReset={() => { actions.resetDemoData(); flash('Data contoh dimuat ulang'); }}
      />

      <main className="admin-main">
        <div className="admin-topbar">
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={13} /><b>{label}</b></div>
          <div className="admin-top-actions">
            <span className="public-status"><i></i> Toko online</span>
            <button className="view-store" onClick={onLogout}><Icon name="external" size={15} /> Lihat toko</button>
            <div className="top-avatar">LP</div>
          </div>
        </div>

        <div className="admin-content">
          {active === 'overview' && (
            <OverviewPanel transactions={transactions} expenses={expenses} stock={stock} today={today} setActive={setActive} onOpenInvoice={setInvoice} />
          )}
          {active === 'transactions' && (
            <TransactionsPanel transactions={transactions} products={products} today={today} actions={actions} onOpenInvoice={setInvoice} onGoInventory={() => setActive('inventory')} />
          )}
          {active === 'invoices' && (
            <InvoicesPanel transactions={transactions} today={today} actions={actions} onGoTransactions={() => setActive('transactions')} />
          )}
          {active === 'finance' && <FinancePanel transactions={transactions} expenses={expenses} today={today} />}
          {active === 'expenses' && <ExpensesPanel expenses={expenses} today={today} actions={actions} />}
          {active === 'inventory' && (
            <InventoryPanel stock={stock} movements={movements} products={products} actions={actions} onGoCatalog={() => setActive('catalog')} />
          )}
          {active === 'catalog' && (
            <CatalogPanel
              products={products}
              stock={stock}
              draftProducts={draftProducts}
              setDraftProducts={setDraftProducts}
              onSave={saveCatalog}
              onSync={() => setDraftProducts(products)}
            />
          )}
        </div>

        {invoice && (
          <Modal title={invoice.invoice?.number} subtitle={`INVOICE · ${invoice.customer?.name || ''}`} onClose={() => setInvoice(null)}
            footer={<InvoiceModalActions transaction={invoice} onClose={() => setInvoice(null)} />}>
            <InvoiceDocument transaction={invoice} today={today} />
          </Modal>
        )}

        {saved && <div className="save-toast"><Icon name="checkCircle" size={18} /> {saved}</div>}
      </main>
    </div>
  );
}
