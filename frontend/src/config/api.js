// Base URL for the Express backend.
// Override per environment with REACT_APP_API_URL (see frontend/.env.example).
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default API_URL;

/**
 * Authorization header for authenticated API calls.
 *
 * Reads the token persisted by hooks/useLogin.js. Note the two shapes in play:
 * localStorage stores `{ token, foundUser }`, while the AuthContext value is the
 * raw login response (`accessToken`). Components with context access can keep
 * using `user.accessToken`; this helper is for code outside the provider tree,
 * such as the Redux thunks in actions/.
 *
 * Returns an empty object when there is no session, so callers can always spread it.
 */
export const authHeader = () => {
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('rememberMe');
    if (!raw) return {};
    const token = JSON.parse(raw)?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};
