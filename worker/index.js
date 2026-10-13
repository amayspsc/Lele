// Cloudflare Worker: JSON API for the lelepakabi storefront and admin dashboard.
// Static files (the Vite build in ./dist) are served by Workers Static Assets; this
// file only handles /api/* (see wrangler.jsonc → assets.run_worker_first).
//
// Data model: the admin app keeps four collections (products, transactions, expenses,
// movements). Each one is stored as a JSON document in the D1 `collections` table, the same
// shape the browser uses. Inventory is only changed by explicit movement entries. Creating or
// updating a sale never writes to movements.

const SESSION_COOKIE = 'lelepakabi_admin';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, persisted in the browser
const COLLECTIONS = ['products', 'transactions', 'expenses', 'movements'];
const MAX_COLLECTION_BYTES = 900_000; // D1 row limit is ~1 MB; keep headroom
const MAX_ITEMS = 5000;
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
  if (method === 'GET' && pathname === '/api/catalog') return json({ products: await publicCatalog(env.DB) });

  if (method === 'POST' && pathname === '/api/admin/login') return login(request, env, url);
  if (method === 'POST' && pathname === '/api/admin/logout') return logout(url);
  if (method === 'GET' && pathname === '/api/admin/session') {
    return json({ authenticated: await isAuthenticated(request, env) });
  }

  // Everything below requires a valid admin session cookie.
  if (pathname.startsWith('/api/admin/')) await requireAdmin(request, env);

  if (method === 'GET' && pathname === '/api/admin/data') return json(await loadAllCollections(env.DB));

  const collectionMatch = pathname.match(/^\/api\/admin\/data\/([a-z]+)$/);
  if (method === 'PUT' && collectionMatch) return saveCollection(request, env, collectionMatch[1]);

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

// ---------- Collections (admin data) ----------

async function readCollection(db, name) {
  const row = await db.prepare('SELECT data FROM collections WHERE name = ?').bind(name).first();
  return row ? JSON.parse(row.data) : null;
}

async function loadAllCollections(db) {
  const entries = await Promise.all(COLLECTIONS.map(async (name) => [name, await readCollection(db, name)]));
  return Object.fromEntries(entries);
}

// The storefront never receives internal fields such as cost (HPP), minimum stock, or sales counts.
async function publicCatalog(db) {
  const products = await readCollection(db, 'products');
  if (!Array.isArray(products)) return null;
  return products.map((p) => ({
    id: p.id,
    size: p.size,
    price: p.price,
    status: p.status,
    note: p.note || '',
    accent: p.accent || 'mint',
    popular: Boolean(p.popular),
  }));
}

function validateItems(name, items) {
  if (!Array.isArray(items)) throw badRequest('Data harus berupa daftar.');
  if (items.length > MAX_ITEMS) throw badRequest(`Terlalu banyak data (maks. ${MAX_ITEMS}).`);
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw badRequest(`Data ${name} tidak valid.`);
    if (!(typeof item.id === 'string' || typeof item.id === 'number')) throw badRequest(`Setiap data ${name} membutuhkan id.`);
  }
}

async function saveCollection(request, env, name) {
  if (!COLLECTIONS.includes(name)) throw new HttpError(404, 'Koleksi tidak dikenal.');
  const body = await readJson(request);
  validateItems(name, body.data);
  const data = JSON.stringify(body.data);
  if (data.length > MAX_COLLECTION_BYTES) {
    throw new HttpError(413, 'Data terlalu besar untuk disimpan. Hubungi pengembang untuk memindahkan arsip lama.');
  }
  await env.DB.prepare(
    `INSERT INTO collections (name, data, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(name) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  ).bind(name, data).run();
  return json({ ok: true, count: body.data.length });
}
