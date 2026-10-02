import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.window = { localStorage, location: { pathname: '/content/terms', href: '' } };
const { termsApi } = await import('../src/features/terms/api/termsApi.ts');
const { default: client } = await import('../src/shared/api/axios.ts');

test('saving a new terms version never publishes it; activation requires its own request', async () => {
  const calls = [];
  client.defaults.adapter = async (config) => {
    calls.push(config);
    return { config, status: 200, statusText: 'OK', headers: {}, data: { success: true, data: { termsId: 'draft' } } };
  };
  await termsApi.create({ code: 'service', version: 'v2', title: 'Draft', body: 'Draft body', isRequired: true, activate: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'post');
  assert.equal(JSON.parse(calls[0].data).activate, false);
  await termsApi.activate('draft');
  assert.equal(calls[1].method, 'patch');
  assert.equal(calls[1].url, '/terms-admin/draft/activate');
});
