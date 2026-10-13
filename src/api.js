// Thin client for the Cloudflare Worker API (see worker/index.js).
// All paths are relative so the same build works on the Worker, locally, or behind a proxy.

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
  saveProducts: (products) => request('/admin/products', { method: 'PUT', body: { products } }).then((data) => data.products),
  createSale: (sale) => request('/admin/transactions', { method: 'POST', body: sale }).then((data) => data.transaction),
  updateSaleStatus: (id, status) => request(`/admin/transactions/${encodeURIComponent(id)}`, { method: 'PATCH', body: { status } }).then((data) => data.transaction),
  createExpense: (expense) => request('/admin/expenses', { method: 'POST', body: expense }).then((data) => data.expense),
  deleteExpense: (id) => request(`/admin/expenses/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
