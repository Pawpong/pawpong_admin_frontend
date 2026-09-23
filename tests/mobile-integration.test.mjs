import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const {
  APP_VERSION_PATTERN,
  compareAppVersions,
  isStoreUrl,
} = await import('../src/features/app-version/model/appVersionPolicy.ts');
const {
  deepLinkUrl,
  isAppDestination,
  isHttpsUrl,
  isInternalAppPath,
  isPlainLinkText,
  resolvePublicWebOrigin,
} = await import('../src/features/deep-link/model/deepLinkPolicy.ts');

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.window = { localStorage: globalThis.localStorage, location: { pathname: '/content/deep-links' } };
const { default: client } = await import('../src/shared/api/axios.ts');
const { deepLinkApi } = await import('../src/features/deep-link/api/deepLinkApi.ts');
const { appVersionApi } = await import('../src/features/app-version/api/appVersionApi.ts');
const { notificationAdminApi } = await import('../src/features/notification/api/notificationAdminApi.ts');
const response = (config, data) => ({ config, status: 200, statusText: 'OK', headers: {}, data });
client.defaults.adapter = () => {
  throw new Error('Unexpected network request');
};

test('deep-link pagination preserves the real backend envelope and page/limit parameters', async () => {
  const result = {
    success: true,
    data: {
      items: [{ id: 'link', slug: 'news', isActive: false }],
      pagination: { currentPage: 2, pageSize: 10, totalItems: 11 },
    },
  };
  client.defaults.adapter = async (config) => {
    assert.equal(config.method, 'get');
    assert.equal(config.url, '/deep-link-admin');
    assert.deepEqual(config.params, { page: 2, limit: 10 });
    return response(config, result);
  };
  assert.deepEqual(await deepLinkApi.getDeepLinks(2, 10), result);
});

test('deep-link create leaves slug generation to the server and unwraps the saved record', async () => {
  client.defaults.adapter = async (config) => {
    assert.equal(config.method, 'post');
    assert.equal(config.url, '/deep-link-admin');
    assert.deepEqual(JSON.parse(config.data), {
      title: '소식',
      targetPath: '/',
      description: '',
      imageUrl: '',
      isActive: false,
    });
    return response(config, { success: true, data: { id: 'link', slug: 'generated', isActive: false } });
  };
  assert.equal(
    (
      await deepLinkApi.createDeepLink({
        slug: undefined,
        title: '소식',
        targetPath: '/',
        description: '',
        imageUrl: '',
        isActive: false,
      })
    ).slug,
    'generated',
  );
});

test('deep-link update uses PUT and preserves false and empty fields; delete addresses the ID', async () => {
  client.defaults.adapter = async (config) => {
    assert.equal(config.url, '/deep-link-admin/link');
    if (config.method === 'put') {
      assert.deepEqual(JSON.parse(config.data), { description: '', imageUrl: '', isActive: false });
      return response(config, { success: true, data: { id: 'link', isActive: false } });
    }
    assert.equal(config.method, 'delete');
    assert.equal(config.data, undefined);
    return response(config, { success: true, data: null });
  };
  assert.equal(
    (await deepLinkApi.updateDeepLink('link', { description: '', imageUrl: '', isActive: false })).isActive,
    false,
  );
  await deepLinkApi.deleteDeepLink('link');
});

test('individual push keeps role, user ID and managed URL and returns dispatch counts without claiming device receipt', async () => {
  const payload = {
    target: { type: 'individual', role: 'adopter', userId: 'isolated-user' },
    title: '테스트',
    body: '소식',
    targetUrl: 'https://pawpong.kr/l/news',
  };
  const counts = {
    recipients: 1,
    notificationsCreated: 1,
    pushTokensTargeted: 0,
    pushSuccess: 0,
    pushFailed: 0,
    invalidTokens: 0,
  };
  client.defaults.adapter = async (config) => {
    assert.equal(config.method, 'post');
    assert.equal(config.url, '/notification-admin/push');
    assert.equal(config.timeout, 120000);
    assert.deepEqual(JSON.parse(config.data), payload);
    return response(config, { success: true, data: counts });
  };
  assert.deepEqual(await notificationAdminApi.sendPush(payload), counts);
});

test('app-version create and PATCH preserve optional/forced policy and bundled icon choice', async () => {
  const policy = {
    latestVersion: '1.3.0',
    minRequiredVersion: '1.1.0',
    forceUpdateMessage: '필수 업데이트',
    recommendUpdateMessage: '권장 업데이트',
    iosStoreUrl: 'https://apps.apple.com/app/id123',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
    appIconKey: 'pixel',
    isActive: false,
  };
  client.defaults.adapter = async (config) => {
    if (config.method === 'post') {
      assert.equal(config.url, '/app-version-admin');
      assert.deepEqual(JSON.parse(config.data), { ...policy, platform: 'ios' });
    } else {
      assert.equal(config.method, 'patch');
      assert.equal(config.url, '/app-version-admin/version');
      assert.deepEqual(JSON.parse(config.data), { ...policy, appIconKey: 'default' });
    }
    return response(config, { success: true, data: { appVersionId: 'version', ...JSON.parse(config.data) } });
  };
  assert.equal((await appVersionApi.createAppVersion({ ...policy, platform: 'ios' })).data.appIconKey, 'pixel');
  assert.equal(
    (await appVersionApi.updateAppVersion('version', { ...policy, appIconKey: 'default' })).data.isActive,
    false,
  );
});

test('version comparison treats numeric segments and optional fourth segment correctly', () => {
  assert.equal(compareAppVersions('1.10.0', '1.9.9'), 1);
  assert.equal(compareAppVersions('1.2.0', '1.2.0.0'), 0);
  assert.equal(compareAppVersions('1.2.0', '1.2.0.1'), -1);
  for (const value of ['1', '1.2', '1.2.3-beta', '1.2.3.4.5', 'abc'])
    assert.equal(APP_VERSION_PATTERN.test(value), false, value);
  assert.equal(isStoreUrl('https://apps.apple.com/kr/app/id6814126823', 'ios'), true);
  assert.equal(isStoreUrl('https://apps.apple.com/us/app/pawpong/id6814126823/?l=en', 'ios'), true);
  assert.equal(isStoreUrl('https://apps.apple.com/kr/app/id123', 'ios'), false);
  assert.equal(isStoreUrl('https://apps.apple.com/app/id68141268230', 'ios'), false);
  assert.equal(isStoreUrl('https://apps.apple.com/app/id6814126823/another-app', 'ios'), false);
  assert.equal(isStoreUrl('https://play.google.com/store/apps/details?id=kr.pawpong.app', 'android'), true);
  assert.equal(isStoreUrl('https://play.google.com/store/apps/details?id=another.app', 'android'), false);
  assert.equal(isStoreUrl('https://apps.apple.com/', 'ios'), false);
  for (const value of [
    'http://apps.apple.com/app',
    'https://apps.apple.com.evil.test',
    'https://user@apps.apple.com',
    'javascript:alert(1)',
  ])
    assert.equal(isStoreUrl(value, 'ios'), false, value);
});

test('managed app paths reject recursive links, admin/API paths and encoded external destinations', () => {
  for (const value of ['/', '/explore/dog', '/explore/breeder/abc', '/chat?roomId=abc'])
    assert.equal(isInternalAppPath(value), true, value);
  for (const value of [
    '//evil.test',
    '/%2fevil.test',
    '/%252fevil.test',
    '/explore/../api',
    '/l/nested',
    '/api/login',
    '/content/banners',
    '/\\evil.test',
    '/explore%0a',
    'https://pawpong.kr/',
    '/explore?next=https://evil.test',
  ]) {
    assert.equal(isInternalAppPath(value), false, value);
  }
  assert.equal(deepLinkUrl('autumn-news'), 'https://pawpong.kr/l/autumn-news');
});

test('push accepts managed links and app destinations but rejects external or administrator hosts', () => {
  for (const value of [
    '/',
    '/explore/dog',
    '/l/autumn-news',
    'https://pawpong.kr/l/autumn-news',
    'https://www.pawpong.kr/explore/cat',
  ])
    assert.equal(isAppDestination(value), true, value);
  for (const value of [
    'https://admin.pawpong.kr/content/banners',
    'https://pawpong.kr.evil.test/',
    'https://pawpong.kr@evil.test/',
    'javascript:alert(1)',
    '//evil.test',
    '/content/banners',
  ])
    assert.equal(isAppDestination(value), false, value);
  assert.equal(isHttpsUrl('https://cdn.pawpong.kr/photo.png'), true);
  assert.equal(isHttpsUrl('http://cdn.pawpong.kr/photo.png'), false);
  assert.equal(isPlainLinkText('<script>alert(1)</script>'), false);
  assert.equal(isPlainLinkText('포퐁 소식'), true);
});

test('share URLs default to production and allow only the selected Pawpong web environment', () => {
  assert.equal(resolvePublicWebOrigin(), 'https://pawpong.kr');
  assert.equal(resolvePublicWebOrigin('https://dev.pawpong.kr/'), 'https://dev.pawpong.kr');
  for (const value of ['http://pawpong.kr', 'https://evil.test', 'https://user@pawpong.kr', 'invalid']) {
    assert.equal(resolvePublicWebOrigin(value), 'https://pawpong.kr');
  }
});
