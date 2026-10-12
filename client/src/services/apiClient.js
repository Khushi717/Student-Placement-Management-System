import axios from 'axios';

export const TOKEN_KEY = 'spms_token';

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 15000 });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // An expired/invalid token on a non-auth call => tell the AuthContext to sign the user out.
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.startsWith('/auth/login') && !url.startsWith('/auth/register')) {
      window.dispatchEvent(new Event('spms:unauthorized'));
    }
    return Promise.reject(error);
  }
);

/** Returns { data, meta } from the API envelope. */
export const unwrap = (promise) => promise.then((res) => ({ data: res.data.data, meta: res.data.meta, message: res.data.message }));

/** Turns any thrown error into a user-presentable message (and field errors if present). */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error.response) return error.code === 'ECONNABORTED' ? 'The request timed out.' : 'Cannot reach the server. Is the API running?';
  const { message, errors } = error.response.data || {};
  if (errors?.length) return `${message}: ${errors.map((e) => e.message).join('; ')}`;
  return message || fallback;
}

export default apiClient;
