// Cloudflare Worker: JSON API for the lelepakabi storefront and admin dashboard.
// Static files (the Vite build in ./dist) are served by Workers Static Assets; this
// file only handles /api/* (see wrangler.jsonc → assets.run_worker_first).

const SESSION_COOKIE = 'lelepakabi_admin';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, persisted in the browser
const LOW_STOCK_THRESHOLD = 10;
const STOCK_STATUSES = ['Tersedia', 'Stok menipis', 'Pre-order', 'Tidak tersedia'];
const TRANSACTION_STATUSES = ['Menunggu pembayaran', 'Dibayar', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
const PAYMENT_METHODS = ['Transfer bank', 'QRIS', 'Tunai'];
const EXPENSE_CATEGORIES = ['Operasional', 'Pengiriman', 'Perawatan', 'Perlengkapan', 'Lainnya'];
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const badRequest = (message) => new HttpError(400, message);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      return await route(request, env, url);
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      console.error('Unhandled API error', error);
      return json({ error: 'Terjadi kesalahan pada server. Coba lagi sebentar lagi.' }, 500);
    }
  },
};

async function route(request, env, url) {
  const { pathname } = url;
  const { method } = request;

  if (!pathname.startsWith('/api/')) throw new HttpError(404, 'Tidak ditemukan.');

  if (method === 'GET' && pathname === '/api/health') return json({ ok: true });
  if (method === 'GET' && pathname === '/api/catalog') return json({ products: await listProducts(env.DB) });

  if (method === 'POST' && pathname === '/api/admin/login') return login(request, env, url);
  if (method === 'POST' && pathname === '/api/admin/logout') return logout(url);
  if (method === 'GET' && pathname === '/api/admin/session') {
    return json({ authenticated: await isAuthenticated(request, env) });
  }

  // Everything below requires a valid admin session cookie.
  if (pathname.startsWith('/api/admin/')) await requireAdmin(request, env);

  if (method === 'GET' && pathname === '/api/admin/data') {
    const [products, transactions, expenses] = await Promise.all([
      listProducts(env.DB),
      listTransactions(env.DB),
      listExpenses(env.DB),
    ]);
    return json({ products, transactions, expenses });
  }

  if (method === 'PUT' && pathname === '/api/admin/products') return saveProducts(request, env);

  if (method === 'POST' && pathname === '/api/admin/transactions') return createTransaction(request, env);

  const transactionMatch = pathname.match(/^\/api\/admin\/transactions\/([^/]+)$/);
  if (method === 'PATCH' && transactionMatch) return updateTransactionStatus(request, env, decodeURIComponent(transactionMatch[1]));

  if (method === 'POST' && pathname === '/api/admin/expenses') return createExpense(request, env);

  const expenseMatch = pathname.match(/^\/api\/admin\/expenses\/([^/]+)$/);
  if (method === 'DELETE' && expenseMatch) return deleteExpense(env, decodeURIComponent(expenseMatch[1]));

  throw new HttpError(404, 'Endpoint tidak ditemukan.');
}

// ---------- Responses and request helpers ----------

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extraHeaders } });
}

async function readJson(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new HttpError(415, 'Permintaan harus berformat JSON.');
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object');
    return body;
  } catch {
    throw badRequest('Data permintaan tidak valid.');
  }
}

function cleanText(value, max, label, { required = false } = {}) {
  const text = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (required && !text) throw badRequest(`${label} wajib diisi.`);
  if (text.length > max) throw badRequest(`${label} maksimal ${max} karakter.`);
  return text;
}

function toInteger(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isInteger(number)) throw badRequest(`${label} harus berupa bilangan bulat.`);
  if (number < min || number > max) throw badRequest(`${label} harus di antara ${min} dan ${max}.`);
  return number;
}

function isDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Today's date in Jakarta, regardless of where the Worker runs.
function todayInJakarta() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

// ---------- Stock rules (mirrors the admin UI) ----------

function resolveStockStatus(status, stock) {
  const saved = status === 'Habis' ? 'Tidak tersedia' : status;
  if (saved === 'Tersedia') {
    if (stock <= 0) return 'Tidak tersedia';
    return stock <= LOW_STOCK_THRESHOLD ? 'Stok menipis' : 'Tersedia';
  }
  if (saved === 'Stok menipis') {
    if (stock <= 0) return 'Tidak tersedia';
    return stock > LOW_STOCK_THRESHOLD ? 'Tersedia' : 'Stok menipis';
  }
  return STOCK_STATUSES.includes(saved) ? saved : 'Tersedia';
}

// ---------- Auth ----------

function adminSecret(env) {
  if (!env.ADMIN_PASSWORD) throw new HttpError(500, 'ADMIN_PASSWORD belum diatur di Worker.');
  return env.SESSION_SECRET || env.ADMIN_PASSWORD;
}

const encoder = new TextEncoder();

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Constant-time comparison for equal-length hex strings.
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function createSessionToken(env) {
  const expiresAt = String(Date.now() + SESSION_MAX_AGE * 1000);
  const signature = await hmacHex(adminSecret(env), `admin-session:${expiresAt}`);
  return `${expiresAt}.${signature}`;
}

async function isAuthenticated(request, env) {
  const cookie = (request.headers.get('cookie') || '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return false;
  const token = decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1));
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt) || Number(expiresAt) <= Date.now()) return false;
  const expected = await hmacHex(adminSecret(env), `admin-session:${expiresAt}`);
  return safeEqual(expected, signature);
}

async function requireAdmin(request, env) {
  if (!(await isAuthenticated(request, env))) throw new HttpError(401, 'Sesi admin tidak ditemukan. Masuk ulang.');
}

function sessionCookie(token, url, maxAge) {
  const secure = url.protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${secure}`;
}

async function login(request, env, url) {
  const body = await readJson(request);
  if (!env.ADMIN_PASSWORD) throw new HttpError(500, 'ADMIN_PASSWORD belum diatur di Worker.');
  const password = String(body.password ?? '');
  // Compare fixed-length digests so the check does not leak the password length or content through timing.
  const matches = safeEqual(await sha256Hex(password), await sha256Hex(env.ADMIN_PASSWORD));
  // Small fixed delay to slow down password guessing.
  await new Promise((resolve) => setTimeout(resolve, 350));
  if (!matches) throw new HttpError(401, 'Kata sandi belum tepat. Coba lagi.');
  const token = await createSessionToken(env);
  return json({ authenticated: true }, 200, { 'set-cookie': sessionCookie(token, url, SESSION_MAX_AGE) });
}

function logout(url) {
  return json({ authenticated: false }, 200, { 'set-cookie': sessionCookie('', url, 0) });
}

// ---------- Catalog ----------

function mapProduct(row) {
  return {
    id: row.id,
    size: row.size,
    category: row.category,
    price: row.price,
    status: row.status,
    stock: row.stock,
    note: row.note,
    accent: row.accent,
    popular: Boolean(row.popular),
  };
}

async function listProducts(db) {
  const { results } = await db.prepare('SELECT * FROM products ORDER BY sort_order, id').all();
  return results.map(mapProduct);
}

async function saveProducts(request, env) {
  const body = await readJson(request);
  if (!Array.isArray(body.products) || body.products.length === 0) throw badRequest('Daftar produk tidak valid.');
  if (body.products.length > 200) throw badRequest('Terlalu banyak produk dalam satu permintaan.');

  const statements = body.products.map((item, index) => {
    const id = toInteger(item.id, 'ID produk', { min: 1 });
    const stock = toInteger(item.stock ?? 0, `Stok ${item.size || id}`, { min: 0, max: 1000000 });
    const price = toInteger(item.price ?? 0, `Harga ${item.size || id}`, { min: 0, max: 100000000 });
    const status = resolveStockStatus(String(item.status ?? ''), stock);
    return env.DB.prepare(
      `INSERT INTO products (id, size, category, price, status, stock, note, accent, popular, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         size = excluded.size, category = excluded.category, price = excluded.price,
         status = excluded.status, stock = excluded.stock, note = excluded.note,
         accent = excluded.accent, popular = excluded.popular, sort_order = excluded.sort_order,
         updated_at = excluded.updated_at`,
    ).bind(
      id,
      cleanText(item.size, 40, 'Ukuran', { required: true }),
      cleanText(item.category, 60, 'Kategori', { required: true }),
      price,
      status,
      stock,
      cleanText(item.note, 160, 'Catatan'),
      ['mint', 'orange', 'blue', 'violet', 'lime'].includes(item.accent) ? item.accent : 'mint',
      item.popular ? 1 : 0,
      index + 1,
    );
  });

  // D1 runs a batch as one transaction: either every product saves or none does.
  await env.DB.batch(statements);
  return json({ products: await listProducts(env.DB) });
}

// ---------- Transactions (manual WhatsApp sales) ----------

function mapTransaction(row) {
  return {
    id: row.id,
    invoice: row.invoice,
    date: row.date,
    customer: row.customer,
    phone: row.phone,
    size: row.size,
    category: row.category,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    subtotal: row.subtotal,
    discount: row.discount,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    shippingFee: row.shipping_fee,
    total: row.total,
    note: row.note,
    status: row.status,
    payment: row.payment,
  };
}

async function listTransactions(db) {
  const { results } = await db.prepare('SELECT * FROM transactions ORDER BY date DESC, created_at DESC').all();
  return results.map(mapTransaction);
}

async function getTransaction(db, id) {
  const row = await db.prepare('SELECT * FROM transactions WHERE id = ?').bind(id).first();
  return row ? mapTransaction(row) : null;
}

async function createTransaction(request, env) {
  const body = await readJson(request);
  const customer = cleanText(body.customer, 120, 'Nama pelanggan', { required: true });
  const phone = cleanText(body.phone, 30, 'Nomor WhatsApp', { required: true });
  const size = cleanText(body.size, 40, 'Ukuran', { required: true });
  const quantity = toInteger(body.quantity, 'Jumlah kantong', { min: 1, max: 100000 });
  const date = body.date ? String(body.date) : todayInJakarta();
  if (!isDateString(date)) throw badRequest('Tanggal tidak valid.');

  const status = String(body.status ?? 'Menunggu pembayaran');
  if (!TRANSACTION_STATUSES.includes(status)) throw badRequest('Status pembayaran tidak valid.');
  const payment = String(body.payment ?? 'Transfer bank');
  if (!PAYMENT_METHODS.includes(payment)) throw badRequest('Metode pembayaran tidak valid.');

  // Product and price come from the catalog, never from the browser.
  const product = await env.DB.prepare('SELECT * FROM products WHERE size = ?').bind(size).first();
  if (!product) throw badRequest('Ukuran bibit tidak ditemukan di katalog.');

  const unitPrice = product.price;
  const subtotal = quantity * unitPrice;
  const discountType = body.discountType === 'Persen' ? 'Persen' : 'Nominal';
  const discountValue = toInteger(body.discountValue ?? 0, 'Nilai diskon', {
    min: 0,
    max: discountType === 'Persen' ? 100 : Number.MAX_SAFE_INTEGER,
  });
  // Discount can never exceed the product subtotal.
  const discount = Math.min(subtotal, discountType === 'Persen' ? Math.round((subtotal * discountValue) / 100) : discountValue);
  const shippingFee = toInteger(body.shippingFee ?? 0, 'Ongkos kirim', { min: 0, max: 100000000 });
  const total = subtotal - discount + shippingFee;
  const note = cleanText(body.note, 1000, 'Catatan');
  const year = date.slice(0, 4);

  // Invoice numbers are sequential per year. If two sales race for the same number, the
  // UNIQUE constraint rejects one and we retry with the next number.
  const countRow = await env.DB.prepare('SELECT COUNT(*) AS total FROM transactions WHERE invoice LIKE ?')
    .bind(`INV/LP/${year}/%`)
    .first();
  const baseCount = Number(countRow?.total ?? 0);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const invoice = `INV/LP/${year}/${String(baseCount + 1 + attempt).padStart(3, '0')}`;
    const id = `trx-${crypto.randomUUID()}`;
    try {
      // Note: this inserts the sale only. It does not touch the products table, so inventory
      // stays exactly as the admin set it.
      await env.DB.prepare(
        `INSERT INTO transactions (id, invoice, date, customer, phone, size, category, quantity, unit_price, subtotal,
           discount_type, discount_value, discount, shipping_fee, total, status, payment, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        id, invoice, date, customer, phone, product.size, product.category, quantity, unitPrice, subtotal,
        discountType, discountValue, discount, shippingFee, total, status, payment, note,
      ).run();
      return json({ transaction: await getTransaction(env.DB, id) }, 201);
    } catch (error) {
      if (!String(error?.message || error).includes('UNIQUE')) throw error;
    }
  }
  throw new HttpError(409, 'Nomor invoice bentrok. Coba simpan ulang.');
}

async function updateTransactionStatus(request, env, id) {
  const body = await readJson(request);
  const status = String(body.status ?? '');
  if (!TRANSACTION_STATUSES.includes(status)) throw badRequest('Status transaksi tidak valid.');
  const result = await env.DB.prepare('UPDATE transactions SET status = ? WHERE id = ?').bind(status, id).run();
  if (!result.meta?.changes) throw new HttpError(404, 'Transaksi tidak ditemukan.');
  return json({ transaction: await getTransaction(env.DB, id) });
}

// ---------- Expenses ----------

function mapExpense(row) {
  return { id: row.id, date: row.date, description: row.description, category: row.category, amount: row.amount };
}

async function listExpenses(db) {
  const { results } = await db.prepare('SELECT * FROM expenses ORDER BY date DESC, created_at DESC').all();
  return results.map(mapExpense);
}

async function createExpense(request, env) {
  const body = await readJson(request);
  const date = body.date ? String(body.date) : todayInJakarta();
  if (!isDateString(date)) throw badRequest('Tanggal tidak valid.');
  const description = cleanText(body.description, 160, 'Deskripsi', { required: true });
  const category = EXPENSE_CATEGORIES.includes(body.category) ? body.category : 'Lainnya';
  const amount = toInteger(body.amount, 'Jumlah pengeluaran', { min: 1, max: 100000000000 });
  const id = `exp-${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO expenses (id, date, description, category, amount) VALUES (?, ?, ?, ?, ?)')
    .bind(id, date, description, category, amount)
    .run();
  const row = await env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first();
  return json({ expense: mapExpense(row) }, 201);
}

async function deleteExpense(env, id) {
  const result = await env.DB.prepare('DELETE FROM expenses WHERE id = ?').bind(id).run();
  if (!result.meta?.changes) throw new HttpError(404, 'Pengeluaran tidak ditemukan.');
  return json({ deleted: true });
}
