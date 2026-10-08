import '../../register-typescript.mjs';
import axios, { AxiosError } from 'axios';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = { localStorage, location: { pathname: '/reports/community', href: '' } };
export const { default: client } = await import('../../../src/shared/api/axios.ts');
export const { useAuthStore } = await import('../../../src/features/auth/store/authStore.ts');
export const { authApi } = await import('../../../src/features/auth/api/authApi.ts');
export { axios };
export const response = (config, data = {}) => ({ config, status: 200, statusText: 'OK', headers: {}, data });
export const unauthorized = (config) => Promise.reject(new AxiosError('인증 필요', 'ERR_BAD_REQUEST', config, {}, { config, status: 401, data: {} }));
export const login = (id = '가', access = `${id}-access`) => useAuthStore.getState().login({ adminId: id, accessToken: access, refreshToken: `${id}-refresh` });
export function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
export function reset() {
  useAuthStore.getState().logout();
  storage.clear();
  window.location.href = '';
  const noNetwork = () => { throw new Error('예상하지 않은 네트워크 요청'); };
  client.defaults.adapter = noNetwork;
  axios.defaults.adapter = noNetwork;
}
