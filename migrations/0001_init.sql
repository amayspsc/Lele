-- Catalog of seedling sizes. Stock lives here and is only changed by the admin
-- inventory screen. Sales never write to this table.
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  size TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Bibit lele',
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  status TEXT NOT NULL DEFAULT 'Tersedia',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  note TEXT NOT NULL DEFAULT '',
  accent TEXT NOT NULL DEFAULT 'mint',
  popular INTEGER NOT NULL DEFAULT 0 CHECK (popular IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Manually recorded WhatsApp sales. Totals are computed on the server from the
-- catalog price at the moment of entry, so the stored invoice is self-contained.
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  invoice TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  customer TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Bibit lele',
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  discount_type TEXT NOT NULL DEFAULT 'Nominal' CHECK (discount_type IN ('Nominal', 'Persen')),
  discount_value INTEGER NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping_fee INTEGER NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL,
  payment TEXT NOT NULL DEFAULT 'Transfer bank',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions (date DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Operasional',
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses (date DESC);
