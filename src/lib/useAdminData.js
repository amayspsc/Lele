import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_EXPENSES,
  DEFAULT_MOVEMENTS,
  DEFAULT_TRANSACTIONS,
  STORAGE_KEYS,
  invoiceTotals,
  nextId,
  nextInvoiceNumber,
  normalizeProducts,
  paymentStatusFor,
  readStored,
  stockRows,
  writeStored,
} from './store.js';
import { addDays, todayISO } from './format.js';
import { DEMO_MODE, saveCollection } from '../api.js';

// Keeps one collection in sync. Remote mode writes the whole array to the Worker; demo mode
// writes to localStorage. The first run after load is skipped when the server already has data.
function usePersist(name, value, { remote, seeded }) {
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      if (remote && seeded) return;
    }
    if (remote) saveCollection(name, value);
    else writeStored(STORAGE_KEYS[name], value);
  }, [value]);
}

const sorted = (list) => [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : String(a.id).localeCompare(String(b.id))));

// `remoteSeed` is null in demo mode. In remote mode it holds the collections loaded from the
// Worker; a missing collection is `null` and falls back to its default.
export function useAdminData(remoteSeed = null) {
  const remote = remoteSeed !== null;
  const seeded = (name) => remote && Array.isArray(remoteSeed[name]);
  const load = (name, fallback) => (remote ? remoteSeed[name] ?? fallback : readStored(STORAGE_KEYS[name], fallback));

  const [products, setProducts] = useState(() => normalizeProducts(load('products', null)));
  const [transactions, setTransactions] = useState(() => sorted(load('transactions', remote ? [] : DEFAULT_TRANSACTIONS)));
  const [expenses, setExpenses] = useState(() => sorted(load('expenses', remote ? [] : DEFAULT_EXPENSES)));
  const [movements, setMovements] = useState(() => sorted(load('movements', remote ? [] : DEFAULT_MOVEMENTS)));

  usePersist('products', products, { remote, seeded: seeded('products') });
  usePersist('transactions', transactions, { remote, seeded: seeded('transactions') });
  usePersist('expenses', expenses, { remote, seeded: seeded('expenses') });
  usePersist('movements', movements, { remote, seeded: seeded('movements') });

  const productById = useCallback((id) => products.find((p) => p.id === Number(id)), [products]);

  // A line item snapshots price + cost so historic invoices never move.
  const buildLines = useCallback(
    (lines) =>
      lines
        .map((line) => {
          const product = productById(line.productId);
          if (!product) return null;
          return {
            productId: product.id,
            size: product.size,
            price: Number(line.price ?? product.price) || 0,
            cost: Number(line.cost ?? product.cost) || 0,
            qty: Math.max(0, Number(line.qty) || 0),
          };
        })
        .filter((line) => line && line.qty > 0),
    [productById],
  );

  const createTransaction = useCallback(
    (draft) => {
      const date = draft.date || todayISO();
      const items = buildLines(draft.items || []);
      if (!items.length) return null;

      let created = null;
      setTransactions((current) => {
        const transaction = {
          id: nextId('TRX', current),
          date,
          customer: {
            name: draft.customer?.name || 'Pelanggan tanpa nama',
            phone: draft.customer?.phone || '',
            city: draft.customer?.city || '',
          },
          invoice: {
            number: draft.invoice?.number || nextInvoiceNumber(current, date),
            dueDate: draft.invoice?.dueDate || addDays(date, 7),
          },
          items,
          discount: Math.max(0, Number(draft.discount) || 0),
          shipping: Math.max(0, Number(draft.shipping) || 0),
          paymentMethod: draft.paymentMethod || 'Transfer bank',
          paidAmount: Math.max(0, Number(draft.paidAmount) || 0),
          status: draft.status || 'Menunggu konfirmasi',
          note: draft.note || '',
        };
        transaction.paymentStatus = paymentStatusFor(transaction, transaction.paidAmount);
        created = transaction;
        return sorted([transaction, ...current]);
      });

      // Sales never change inventory. Stock moves only through manual movements (Masuk/Keluar/Penyesuaian).
      return created;
    },
    [buildLines],
  );

  const updateTransaction = useCallback((id, patch) => {
    setTransactions((current) => {
      const target = current.find((tx) => tx.id === id);
      if (!target) return current;

      const items = patch.items ? buildLines(patch.items) : target.items;
      const next = { ...target, ...patch, items };
      if ('paidAmount' in patch || patch.items || 'discount' in patch || 'shipping' in patch) {
        next.paymentStatus = paymentStatusFor(next, next.paidAmount);
      }

      return sorted(current.map((tx) => (tx.id === id ? next : tx)));
    });
  }, [buildLines]);

  const recordPayment = useCallback((id, amount) => {
    setTransactions((current) =>
      current.map((tx) => {
        if (tx.id !== id) return tx;
        const paidAmount = Math.min(Math.max(0, Number(amount) || 0), invoiceTotals(tx).total);
        return { ...tx, paidAmount, paymentStatus: paymentStatusFor(tx, paidAmount) };
      }),
    );
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((current) => current.filter((tx) => tx.id !== id));
  }, []);

  const addExpense = useCallback((draft) => {
    let created = null;
    setExpenses((current) => {
      created = {
        id: nextId('EXP', current),
        date: draft.date || todayISO(),
        category: draft.category || 'operasional',
        description: draft.description || '',
        amount: Math.max(0, Number(draft.amount) || 0),
        method: draft.method || 'Tunai',
        vendor: draft.vendor || '',
      };
      return sorted([created, ...current]);
    });
    return created;
  }, []);

  const updateExpense = useCallback((id, patch) => {
    setExpenses((current) => sorted(current.map((e) => (e.id === id ? { ...e, ...patch, amount: Math.max(0, Number(patch.amount ?? e.amount) || 0) } : e))));
  }, []);

  const deleteExpense = useCallback((id) => setExpenses((current) => current.filter((e) => e.id !== id)), []);

  const addMovement = useCallback((draft) => {
    let created = null;
    setMovements((current) => {
      created = {
        id: nextId('MOV', current),
        date: draft.date || todayISO(),
        productId: Number(draft.productId),
        type: draft.type || 'Masuk',
        qty: Number(draft.qty) || 0,
        ref: draft.ref || '',
        note: draft.note || '',
      };
      return sorted([created, ...current]);
    });
    return created;
  }, []);

  const deleteMovement = useCallback((id) => setMovements((current) => current.filter((m) => m.id !== id)), []);

  const saveProducts = useCallback((next) => setProducts(normalizeProducts(next)), []);

  // Only meaningful in demo mode. In remote mode the button is hidden, so this never wipes real data.
  const resetDemoData = useCallback(() => {
    if (remote) return;
    setProducts(normalizeProducts(null));
    setTransactions(sorted(DEFAULT_TRANSACTIONS));
    setExpenses(sorted(DEFAULT_EXPENSES));
    setMovements(sorted(DEFAULT_MOVEMENTS));
  }, []);

  const stock = useMemo(() => stockRows(products, movements, transactions), [products, movements, transactions]);

  return {
    remote,
    demo: DEMO_MODE,
    products,
    transactions,
    expenses,
    movements,
    stock,
    actions: {
      saveProducts,
      createTransaction,
      updateTransaction,
      recordPayment,
      deleteTransaction,
      addExpense,
      updateExpense,
      deleteExpense,
      addMovement,
      deleteMovement,
      resetDemoData,
    },
  };
}
