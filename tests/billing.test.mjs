import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, v) => storage.set(key, v),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = { localStorage, location: { pathname: '/billing', href: '' } };
const { productInput, newProduct } = await import('../src/features/billing/model/catalog.ts');
const { billingApi } = await import('../src/features/billing/api/billingApi.ts');
const { default: client } = await import('../src/shared/api/axios.ts');
const product = () => ({
  ...structuredClone(newProduct),
  code: 'pack',
  name: 'Pack',
  storeProductIds: { ios: 'pack.ios', android: '' },
  reason: 'catalog setup',
});
test('new products are unsold and unregistered; only normalized allowed fields are sent', () => {
  const input = productInput({ ...product(), price: 999, archived: true });
  assert.equal(input.saleEnabled, false);
  assert.equal(input.active, false);
  assert.deepEqual(input.storeRegistered, { ios: false, android: false });
  assert.deepEqual(input.storeProductIds, { ios: 'pack.ios' });
  assert.equal('price' in input, false);
  assert.equal('archived' in input, false);
});
test('blank reasons, unregistered sales, missing credit keys and non-consumable credits are rejected', () => {
  for (const bad of [
    { reason: '  ' },
    { active: true, saleEnabled: true },
    { benefits: [{ type: 'credits', quantity: 2 }] },
    { benefits: [{ type: 'credits', creditKey: 'pool', quantity: 1.5 }] },
    { type: 'non_consumable' },
  ]) {
    assert.throws(() => productInput({ ...product(), ...bad }));
  }
});
test('both prepaid credit packs and subscriptions can use a common pool', () => {
  for (const type of ['consumable', 'subscription']) {
    const input = productInput({
      ...product(),
      type,
      active: true,
      saleEnabled: true,
      storeRegistered: { ios: true, android: false },
    });
    assert.equal(input.benefits[0].creditKey, 'playground');
  }
});
test('admin HTTP methods preserve audit reasons and the backend envelope', async () => {
  const calls = [];
  client.defaults.adapter = async (config) => {
    calls.push(config);
    return { config, status: 200, statusText: 'OK', headers: {}, data: { success: true, data: { id: 'result' } } };
  };
  assert.deepEqual(await billingApi.archiveProduct('pack', 'retired'), { id: 'result' });
  assert.equal(calls[0].method, 'delete');
  assert.equal(calls[0].url, '/iap-admin/products/pack');
  assert.deepEqual(JSON.parse(calls[0].data), { reason: 'retired' });
  await billingApi.savePolicy('ai_image', {
    creditKey: 'playground',
    creditCost: 2,
    dailyFreeLimit: 5,
    enabled: true,
    reason: 'policy update',
  });
  assert.equal(calls[1].method, 'put');
  assert.equal(calls[1].url, '/iap-admin/policy/features/ai_image');
  await billingApi.adjust('purchase', { action: 'revoke', reason: 'confirmed refund' });
  assert.deepEqual(JSON.parse(calls[2].data), { action: 'revoke', reason: 'confirmed refund' });
});
