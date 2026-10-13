// Thin client for the Cloudflare Worker API (see worker/index.js).
// Paths are relative so the same build works on the Worker, locally, or behind a proxy.

// Demo mode (GitHub Pages, tests) keeps everything in the browser instead of calling the Worker.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.MODE === 'test';

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON responses (for example a static host without the API) fall through below.
  }
  if (!response.ok) {
    const error = new Error(data?.error || `Permintaan gagal (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  catalog: () => request('/catalog').then((data) => data.products),
  session: () => request('/admin/session'),
  login: (password) => request('/admin/login', { method: 'POST', body: { password } }),
  logout: () => request('/admin/logout', { method: 'POST', body: {} }),
  adminData: () => request('/admin/data'),
  saveCollection: (name, data) => request(`/admin/data/${name}`, { method: 'PUT', body: { data } }),
};

// Saves are serialised per collection so a slow earlier write can never overwrite a newer one.
const queues = {};
const SYNC_EVENT = 'lelepakabi:sync';

export function saveCollection(name, data) {
  const run = () => api.saveCollection(name, data);
  const next = (queues[name] || Promise.resolve()).then(run, run);
  queues[name] = next;
  next.then(
    () => window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { name, ok: true } })),
    (error) => {
      console.error(`Gagal menyimpan ${name}`, error);
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { name, ok: false, message: error.message } }));
    },
  );
  return next;
}

export const SYNC_EVENT_NAME = SYNC_EVENT;
