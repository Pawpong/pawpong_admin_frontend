import { client, login, reset, response } from '../../auth/fixtures/admin-session.fixture.mjs';

export { client, response };
export const reportId = 'a'.repeat(24);
export const sourceVersion = 'b'.repeat(64);
export const pngBytes = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
export const png = () => new Blob([pngBytes], { type: 'image/png' });
export const controller = () => new AbortController();
export function prepare() {
  reset();
  login();
}
