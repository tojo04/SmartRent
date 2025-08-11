// client/lib/api.js
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let accessToken = null;
export function setAccessToken(token) { accessToken = token; }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res = await fetch(`${API}${path}`, { ...options, headers, credentials: 'include' }); // include cookies
  if (res.status === 401) {
    // try refresh
    const r = await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (r.ok) {
      const { accessToken: newAT } = await r.json();
      setAccessToken(newAT);
      headers.Authorization = `Bearer ${newAT}`;
      res = await fetch(`${API}${path}`, { ...options, headers, credentials: 'include' });
    }
  }
  if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
  return res.json();
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
};
