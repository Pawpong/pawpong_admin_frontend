import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AxiosError } from 'axios';
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = { localStorage, location: { pathname: '/playground/pet-release', href: '' } };
const { petReleaseApi } = await import('../src/features/playground/api/petReleaseApi.ts');
const { default: client } = await import('../src/shared/api/axios.ts');
const {
  buildPetReleaseSave,
  draftFromRelease,
  isPetReleaseDirty,
  LOCKED_PET_RELEASE_DRAFT,
  opensPublication,
  parsePlaygroundPetRelease,
  PET_PREVIEW_URL,
  petReleaseStatus,
  publicationTakesEffect,
  withPublished,
  withQualityApproval,
} = await import('../src/features/playground/model/petRelease.ts');
const { requiredPermission } = await import('../src/features/auth/model/permissions.ts');

// 운영 서버의 기본 설정: 품질 미승인, 비공개.
const release = (changes = {}) => ({
  qualityApproved: false,
  published: false,
  revision: 0,
  developmentPreviewEnabled: false,
  effectiveEnabled: false,
  environment: 'production',
  updatedAt: null,
  ...changes,
});
const respond = (request, data) => ({
  config: request,
  status: 200,
  statusText: 'OK',
  headers: {},
  data: { success: true, code: 200, data, timestamp: '2026-10-05T00:00:00.000Z' },
});
const reject = (request, status) => {
  throw new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    request,
    {},
    { config: request, status, statusText: '', headers: {}, data: { success: false, code: status } },
  );
};

test('GET reads the wrapped contract and never mutates', async () => {
  const calls = [];
  client.defaults.adapter = async (request) => {
    calls.push(request);
    return respond(request, { ...release(), internalNote: 'drop' });
  };
  const signal = new AbortController().signal;
  assert.deepEqual(await petReleaseApi.get(signal), release());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'get');
  assert.equal(calls[0].url, '/home-admin/playground-pet-release');
  assert.equal(calls[0].signal, signal);
});

test('PUT sends only qualityApproved, published and expectedRevision', async () => {
  const calls = [];
  client.defaults.adapter = async (request) => {
    calls.push(request);
    return respond(request, release({ qualityApproved: true, revision: 5, updatedAt: '2026-10-05T01:00:00.000Z' }));
  };
  const saved = await petReleaseApi.save({ qualityApproved: true, published: false, effectiveEnabled: true }, 4);
  assert.equal(calls[0].method, 'put');
  assert.equal(calls[0].url, '/home-admin/playground-pet-release');
  assert.deepEqual(JSON.parse(calls[0].data), { qualityApproved: true, published: false, expectedRevision: 4 });
  assert.equal(saved.revision, 5);
  assert.equal(petReleaseStatus(saved), 'private');
});

test('publication without quality approval is rejected before any HTTP mutation', async () => {
  const calls = [];
  client.defaults.adapter = async (request) => {
    calls.push(request);
    throw new Error('Unexpected HTTP');
  };
  await assert.rejects(petReleaseApi.save({ qualityApproved: false, published: true }, 0), /품질 승인/);
  for (const draft of [
    {},
    null,
    { qualityApproved: 'true', published: true },
    { qualityApproved: true },
    { qualityApproved: true, published: 1 },
  ]) {
    await assert.rejects(petReleaseApi.save(draft, 0));
  }
  for (const revision of [undefined, null, -1, 1.5, '3', Number.NaN, Number.MAX_SAFE_INTEGER]) {
    await assert.rejects(petReleaseApi.save({ qualityApproved: true, published: true }, revision));
  }
  assert.equal(calls.length, 0);
  assert.deepEqual(buildPetReleaseSave({ qualityApproved: true, published: true }, 2), {
    qualityApproved: true,
    published: true,
    expectedRevision: 2,
  });
});

test('missing or non-literal fields fail instead of being read as enabled or defaulted', () => {
  for (const data of [
    undefined,
    null,
    [],
    {},
    release({ qualityApproved: undefined }),
    release({ published: 'true' }),
    release({ published: 1 }),
    release({ effectiveEnabled: undefined }),
    release({ developmentPreviewEnabled: 'false' }),
    release({ revision: '1' }),
    release({ revision: -1 }),
    release({ revision: 1.5 }),
    release({ environment: '' }),
    release({ environment: undefined }),
    release({ updatedAt: undefined }),
    release({ updatedAt: 0 }),
  ]) {
    assert.throws(() => parsePlaygroundPetRelease(data), /확인할 수 없습니다/);
  }
});

test('unavailable endpoint surfaces the error and leaves the screen locked to private', async () => {
  for (const status of [404, 500, 503]) {
    client.defaults.adapter = async (request) => reject(request, status);
    await assert.rejects(petReleaseApi.get(), (error) => error.response.status === status);
  }
  client.defaults.adapter = async (request) => respond(request, undefined);
  await assert.rejects(petReleaseApi.get(), /확인할 수 없습니다/);
  assert.deepEqual(LOCKED_PET_RELEASE_DRAFT, { qualityApproved: false, published: false });
  assert.equal(petReleaseStatus(null), 'unknown');
  assert.equal(petReleaseStatus(undefined), 'unknown');
});

test('409 rejects without changing the draft, and the latest server state replaces it', async () => {
  const draft = { qualityApproved: true, published: true };
  const previous = structuredClone(draft);
  const latest = release({ qualityApproved: true, revision: 7 });
  const calls = [];
  client.defaults.adapter = async (request) => {
    calls.push(request.method);
    return request.method === 'put' ? reject(request, 409) : respond(request, latest);
  };
  await assert.rejects(petReleaseApi.save(draft, 6), (error) => error.response.status === 409);
  assert.deepEqual(draft, previous);
  const refetched = await petReleaseApi.get();
  assert.deepEqual(calls, ['put', 'get']);
  assert.equal(refetched.revision, 7);
  // 다시 불러온 뒤에는 내가 고르던 공개 값이 아니라 서버 값에서 다시 시작한다.
  assert.deepEqual(draftFromRelease(refetched), { qualityApproved: true, published: false });
});

test('quality approval and publication are separate, and publication depends on approval', () => {
  const start = draftFromRelease(release());
  assert.deepEqual(start, { qualityApproved: false, published: false });
  assert.deepEqual(withPublished(start, true), start);
  const approved = withQualityApproval(start, true);
  assert.deepEqual(approved, { qualityApproved: true, published: false });
  const published = withPublished(approved, true);
  assert.deepEqual(published, { qualityApproved: true, published: true });
  assert.deepEqual(withQualityApproval(published, false), { qualityApproved: false, published: false });
  assert.deepEqual(withQualityApproval(start, undefined), start);
  assert.deepEqual(withPublished(approved, undefined), approved);
  // 품질 승인 없이 공개가 켜진 비정상 서버 값은 초안에서 끄고, 저장해서 바로잡을 수 있게 한다.
  const inconsistent = release({ published: true });
  assert.deepEqual(draftFromRelease(inconsistent), { qualityApproved: false, published: false });
  assert.equal(isPetReleaseDirty(inconsistent, draftFromRelease(inconsistent)), true);
  assert.equal(isPetReleaseDirty(release(), start), false);
  assert.equal(isPetReleaseDirty(release(), approved), true);
});

test('only an explicit change to published asks for publication confirmation', () => {
  assert.equal(opensPublication(release(), { qualityApproved: true, published: false }), false);
  assert.equal(opensPublication(release(), { qualityApproved: true, published: true }), true);
  assert.equal(opensPublication(release({ qualityApproved: true }), { qualityApproved: true, published: true }), true);
  const live = release({ qualityApproved: true, published: true, effectiveEnabled: true });
  assert.equal(opensPublication(live, { qualityApproved: true, published: true }), false);
  assert.equal(opensPublication(live, { qualityApproved: false, published: false }), false);
});

test('developer preview access is never reported as public', () => {
  assert.equal(petReleaseStatus(release()), 'private');
  const preview = release({ environment: 'development', developmentPreviewEnabled: true, effectiveEnabled: true });
  assert.equal(petReleaseStatus(preview), 'private');
  assert.equal(petReleaseStatus(release({ qualityApproved: true, effectiveEnabled: true })), 'private');
  assert.equal(petReleaseStatus(release({ qualityApproved: true, published: true })), 'private');
  assert.equal(petReleaseStatus(release({ published: true, effectiveEnabled: true })), 'private');
  assert.equal(petReleaseStatus(release({ qualityApproved: true, published: true, effectiveEnabled: true })), 'public');
  assert.equal(PET_PREVIEW_URL, 'https://dev.pawpong.kr/playground/pet');
});

test('the backend contract examples parse, including an unknown environment that stays closed', () => {
  // 백엔드 .kiro/specs/playground-pet/release-contract.md의 성공 data 예시와 서비스 view() 형태.
  const documented = {
    qualityApproved: false,
    published: false,
    revision: 0,
    developmentPreviewEnabled: false,
    effectiveEnabled: false,
    environment: 'production',
    updatedAt: null,
  };
  assert.deepEqual(parsePlaygroundPetRelease(documented), documented);
  const saved = { ...documented, qualityApproved: true, revision: 1, updatedAt: '2026-10-05T06:47:19.000Z' };
  assert.deepEqual(parsePlaygroundPetRelease(saved), saved);
  // APP_ENV가 없거나 다른 값이면 저장된 승인·공개가 있어도 서버가 열지 않는다.
  const unknown = { ...saved, published: true, environment: 'unknown' };
  assert.equal(petReleaseStatus(parsePlaygroundPetRelease(unknown)), 'private');
  const development = { ...saved, published: true, environment: 'development' };
  assert.equal(petReleaseStatus(parsePlaygroundPetRelease(development)), 'private');
  assert.equal(publicationTakesEffect('production'), true);
  for (const environment of ['development', 'unknown', 'Production', '']) {
    assert.equal(publicationTakesEffect(environment), false);
  }
});

test('the screen is routed, listed in navigation and visible to every administrator like the server guard', () => {
  // 서버는 home-admin의 JWT + admin 역할만 확인한다. 화면만 더 좁게 가리지 않는다.
  assert.equal(requiredPermission('/playground/pet-release'), null);
  const app = readFileSync('src/app/App.tsx', 'utf8');
  const navigation = readFileSync('src/shared/components/layout/navigation.tsx', 'utf8');
  assert.match(app, /path="playground\/pet-release" element={<PetRelease \/>}/);
  assert.match(navigation, /path: '\/playground\/pet-release', label: '반려동물 키우기 공개 관리'/);
});

test('the page only reads on mount and has no mock fallback', () => {
  const page = readFileSync('src/pages/playground/PetRelease.tsx', 'utf8');
  const api = readFileSync('src/features/playground/api/petReleaseApi.ts', 'utf8');
  assert.equal(page.match(/petReleaseApi\.save\(/g).length, 1);
  assert.match(page, /const submit = async \(\) => \{[\s\S]*petReleaseApi\.save\(/);
  assert.doesNotMatch(page.slice(page.indexOf('useEffect('), page.indexOf('const reload')), /save|submit/);
  assert.doesNotMatch(page + api, /mock|fixture|import\.meta\.env/i);
});
