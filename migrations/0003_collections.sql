-- The admin app stores four JSON collections (products, transactions, expenses, movements)
-- so the Worker and the browser share one data shape. The typed tables from 0001/0002 are
-- replaced by this table; the catalog is re-created from the admin app on first save.
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS products;

CREATE TABLE IF NOT EXISTS collections (
  name TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
