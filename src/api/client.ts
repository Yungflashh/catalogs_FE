import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('catalog_user');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

// Friendly fallback whenever the server rejects us for auth reasons. The raw
// backend strings ("Not authorized, token failed" / "no token") are developer
// language and scare shoppers mid-checkout — show a clear, calm message instead.
const FRIENDLY_AUTH_MESSAGE =
  'Your session has expired. Please sign in again to continue.';

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const rawMessage: string =
      err.response?.data?.message || err.message || 'Something went wrong';

    // A 401 (expired/missing token) always becomes friendly. We also catch
    // auth-shaped messages that arrive with no HTTP status (e.g. network/CORS),
    // but we never touch a 403 like "Not authorized as admin" — that's a real,
    // distinct message for admins.
    const looksLikeAuth = /not authorized,|token failed|no token|unauthor/i.test(
      rawMessage
    );
    const message =
      status === 401 || (status === undefined && looksLikeAuth)
        ? FRIENDLY_AUTH_MESSAGE
        : rawMessage;

    return Promise.reject(new Error(message));
  }
);

export default api;
