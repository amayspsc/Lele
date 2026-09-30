import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_EXPENSES,
  DEFAULT_MOVEMENTS,
  DEFAULT_TRANSACTIONS,
  STORAGE_KEYS,
  invoiceTotals,
  movementsForTransaction,
  nextId,
  nextInvoiceNumber,
  normalizeProducts,
  paymentStatusFor,
  readStored,
  reversalMovementsFor,
  stockRows,
  writeStored,
} from './store.js';
import { addDays, todayISO } from './format.js';

const hasOutMovement = (movements, ref, productId) =>
  movements.some((m) => m.ref === ref && m.productId === productId && m.type === 'Keluar');

const sorted = (list) => [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : String(a.id).localeCompare(String(b.id))));

export function useAdminData() {
  const [products, setProducts] = useState(() => normalizeProducts(readStored(STORAGE_KEYS.products, null)));
  const [transactions, setTransactions] = useState(() => sorted(readStored(STORAGE_KEYS.transactions, DEFAULT_TRANSACTIONS)));
  const [expenses, setExpenses] = useState(() => sorted(readStored(STORAGE_KEYS.expenses, DEFAULT_EXPENSES)));
  const [movements, setMovements] = useState(() => sorted(readStored(STORAGE_KEYS.movements, DEFAULT_MOVEMENTS)));

  useEffect(() => writeStored(STORAGE_KEYS.products, products), [products]);
  useEffect(() => writeStored(STORAGE_KEYS.transactions, transactions), [transactions]);
  useEffect(() => writeStored(STORAGE_KEYS.expenses, expenses), [expenses]);
  useEffect(() => writeStored(STORAGE_KEYS.movements, movements), [movements]);

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

      if (created && created.status === 'Selesai') {
        setMovements((current) => {
          const ref = created.invoice.number;
          const extra = movementsForTransaction(created, current).filter((m) => !hasOutMovement(current, ref, m.productId));
          return extra.length ? sorted([...current, ...extra]) : current;
        });
      }
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

      const ref = next.invoice?.number || next.id;
      if (next.status === 'Selesai') {
        setMovements((moves) => {
          const extra = movementsForTransaction(next, moves).filter((m) => !hasOutMovement(moves, ref, m.productId));
          return extra.length ? sorted([...moves, ...extra]) : moves;
        });
      } else if (next.status === 'Dibatalkan' && target.status === 'Selesai') {
        setMovements((moves) => sorted([...moves, ...reversalMovementsFor(next, moves)]));
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
    setTransactions((current) => {
      const target = current.find((tx) => tx.id === id);
      if (target && target.status === 'Selesai') {
        setMovements((moves) => sorted([...moves, ...reversalMovementsFor(target, moves)]));
      }
      return current.filter((tx) => tx.id !== id);
    });
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

  const resetDemoData = useCallback(() => {
    setProducts(normalizeProducts(null));
    setTransactions(sorted(DEFAULT_TRANSACTIONS));
    setExpenses(sorted(DEFAULT_EXPENSES));
    setMovements(sorted(DEFAULT_MOVEMENTS));
  }, []);

  const stock = useMemo(() => stockRows(products, movements, transactions), [products, movements, transactions]);

  return {
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
