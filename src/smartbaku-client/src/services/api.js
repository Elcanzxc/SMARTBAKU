const API = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

export async function fetchJson(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function postJson(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw { response: { data: { message: errorData.message || `API error: ${res.status}` } } };
  }
  return res.json();
}

export const api = {
  post: (path, body) => postJson(path, body),
  getTrafficLights: () => fetchJson('/api/traffic/lights'),
  getStreets: () => fetchJson('/api/traffic/streets'),
  getVehicles: () => fetchJson('/api/traffic/vehicles'),
  getCrossings: () => fetchJson('/api/traffic/crossings'),
  getCongestion: () => fetchJson('/api/traffic/congestion'),
  getRules: (role = 'driver') => fetchJson(`/api/rules?role=${role}`),
  getUser: (id = 1) => fetchJson(`/api/user/${id}`),
  getUserStats: (id = 1) => fetchJson(`/api/user/${id}/stats`),
  getCoupons: () => fetchJson('/api/user/coupons'),
  selectRole: (role) => postJson('/api/user/select-role', { role }),
  redeemCoupon: (userId, couponId) => postJson(`/api/user/${userId}/redeem/${couponId}`, {}),
  calculateRoute: (fromLat, fromLng, toLat, toLng) =>
    postJson('/api/navigation/route', { fromLat, fromLng, toLat, toLng }),
  searchStreets: (q) => fetchJson(`/api/navigation/search?q=${encodeURIComponent(q)}`),
};
