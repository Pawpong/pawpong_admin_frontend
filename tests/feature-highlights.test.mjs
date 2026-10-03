import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = { localStorage, location: { pathname: '/content/feature-highlights', href: '' } };
const { featureHighlightsApi } = await import('../src/features/home/api/featureHighlightsApi.ts');
const { default: client } = await import('../src/shared/api/axios.ts');
const { parseFeatureHighlightConfig, validateHighlightSave, HIGHLIGHT_DESTINATIONS } =
  await import('../src/features/home/model/featureHighlights.ts');
const card = (changes = {}) => ({
  id: 'care-map',
  eyebrow: '',
  title: '우리 동네 돌봄 지도',
  description: '',
  icon: 'map',
  enabled: true,
  placements: ['home', 'playground'],
  actions: [{ label: '동물병원 찾기', href: '/care-map' }],
  ...changes,
});
const config = (cards = [card()], revision = 0) => ({ revision, cards });

test('GET and PUT use actual contract envelopes and preserve revision, order, empty and OFF settings', async () => {
  const calls = [];
  const payload = config(
    [
      card({ enabled: false }),
      card({ id: 'second', icon: 'spark', actions: [{ label: 'AI 사진', href: '/ai-filter' }] }),
    ],
    8,
  );
  client.defaults.adapter = async (request) => {
    calls.push(request);
    return {
      config: request,
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { success: true, data: request.method === 'get' ? payload : { ...JSON.parse(request.data), revision: 9 } },
    };
  };
  const signal = new AbortController().signal;
  assert.deepEqual(await featureHighlightsApi.get(signal), payload);
  assert.equal(calls[0].signal, signal);
  assert.equal(calls[0].url, '/home-admin/feature-highlights');
  assert.deepEqual(await featureHighlightsApi.save(payload), { ...payload, revision: 9 });
  assert.deepEqual(JSON.parse(calls[1].data), payload);
  assert.equal(calls[1].method, 'put');
  assert.deepEqual(await featureHighlightsApi.save(config([], 8)), config([], 9));
});
test('invalid links and map explore placement are rejected before any HTTP mutation', async () => {
  const calls = [];
  client.defaults.adapter = async (request) => {
    calls.push(request);
    throw new Error('Unexpected HTTP');
  };
  for (const href of [
    '/billing',
    '/playground/pet',
    '//evil.test',
    'https://pawpong.kr/care-map',
    '/care-map?kind=hospital&x=y',
    '/ai-filter#buy',
  ]) {
    await assert.rejects(featureHighlightsApi.save(config([card({ actions: [{ label: '링크', href }] })])));
  }
  const legacy = config([card({ placements: ['home', 'explore'] })]);
  assert.doesNotThrow(() => parseFeatureHighlightConfig(legacy));
  await assert.rejects(featureHighlightsApi.save(legacy), /탐색 선택을 해제/);
  assert.equal(calls.length, 0);
});
test('all released destinations are accepted without granting arbitrary path access', () => {
  for (const href of HIGHLIGHT_DESTINATIONS)
    assert.doesNotThrow(() => validateHighlightSave(config([card({ actions: [{ label: '바로가기', href }] })])));
});
test('409 keeps draft and revision unchanged for explicit conflict resolution', async () => {
  const draft = config([card({ title: '내 편집 초안' })], 1);
  const previous = structuredClone(draft);
  client.defaults.adapter = async (request) => {
    throw new AxiosError(
      'Conflict',
      'ERR_BAD_REQUEST',
      request,
      {},
      { config: request, status: 409, statusText: 'Conflict', headers: {}, data: { code: 409, success: false } },
    );
  };
  await assert.rejects(featureHighlightsApi.save(draft), (error) => error.response.status === 409);
  assert.deepEqual(draft, previous);
});
test('malformed payloads and literal boolean/revision violations fail separately from empty settings', () => {
  assert.deepEqual(parseFeatureHighlightConfig(config([], 2)), config([], 2));
  for (const data of [
    null,
    {},
    config([card({ enabled: 'false' })]),
    config([card(), card()]),
    config([card({ title: ' ' })]),
    config([card({ placements: [] })]),
    config([], Number.MAX_SAFE_INTEGER),
  ])
    assert.throws(() => parseFeatureHighlightConfig(data));
});
test('only contract fields are serialized, with text preserved rather than interpreted as markup', () => {
  const normalized = validateHighlightSave({
    ...config([
      card({
        title: '<b>지도</b>',
        html: '<script/>',
        actions: [{ label: '병원', href: '/care-map', tracking: true }],
      }),
    ]),
    secret: 'drop',
  });
  assert.equal(normalized.cards[0].title, '<b>지도</b>');
  assert.equal('secret' in normalized, false);
  assert.equal('html' in normalized.cards[0], false);
  assert.equal('tracking' in normalized.cards[0].actions[0], false);
});
