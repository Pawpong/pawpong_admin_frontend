import './register-typescript.mjs';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import axios, { AxiosError } from 'axios';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = { localStorage: globalThis.localStorage, location: { pathname: '/dashboard', href: '' } };
const { default: client } = await import('../src/shared/api/axios.ts');
const { useAuthStore } = await import('../src/features/auth/store/authStore.ts');
const { authApi } = await import('../src/features/auth/api/authApi.ts');
const { uploadApi } = await import('../src/features/upload/api/uploadApi.ts');
const { userApi } = await import('../src/features/user/api/userApi.ts');
const { breederApi } = await import('../src/features/breeder/api/breederApi.ts');
const { announcementApi } = await import('../src/features/home/api/announcementApi.ts');
const { getStatusTag } = await import('../src/features/breeder/ui/breederReportHelpers.tsx');
const response = (config, data) => ({ config, status: 200, statusText: 'OK', headers: {}, data });
const unauthorized = (config) => Promise.reject(new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, {}, { config, status: 401, data: { message: 'Invalid credentials' } }));
const noNetwork = () => { throw new Error('Unexpected network request'); };
const login = () => useAuthStore.getState().login({ adminId: 'admin', accessToken: 'old', refreshToken: 'refresh' });

beforeEach(() => {
  useAuthStore.getState().logout();
  storage.clear();
  window.location.href = '';
  client.defaults.adapter = noNetwork;
  axios.defaults.adapter = noNetwork;
});

test('login 401 preserves backend error and does not refresh or redirect', async () => {
  client.defaults.adapter = unauthorized;
  await assert.rejects(authApi.login({ email: 'invalid@example.test', password: 'invalid' }), (error) => error.response.data.message === 'Invalid credentials');
  assert.equal(window.location.href, '');
});

test('concurrent 401s share one admin refresh and retain the refresh token', async () => {
  login();
  let refreshes = 0;
  axios.defaults.adapter = async (config) => {
    refreshes++;
    assert.equal(config.url, 'https://api.test/api/auth-admin/refresh');
    assert.deepEqual(JSON.parse(config.data), { refreshToken: 'refresh' });
    await new Promise((resolve) => setTimeout(resolve, 10));
    return response(config, { data: { accessToken: 'new' } });
  };
  client.defaults.adapter = (config) => config.headers.Authorization === 'Bearer new'
    ? Promise.resolve(response(config, { data: [] })) : unauthorized(config);
  await Promise.all([client.get('/one'), client.get('/two'), client.get('/three')]);
  assert.equal(refreshes, 1);
  assert.equal(localStorage.getItem('refreshToken'), 'refresh');
  assert.equal(useAuthStore.getState().user.accessToken, 'new');
});

test('failed refresh clears both persisted and in-memory authentication', async () => {
  login();
  client.defaults.adapter = unauthorized;
  axios.defaults.adapter = unauthorized;
  await assert.rejects(client.get('/one'), /세션이 만료/);
  assert.equal(localStorage.getItem('accessToken'), null);
  assert.equal(localStorage.getItem('refreshToken'), null);
  assert.equal(useAuthStore.getState().isAuthenticated, false);
  assert.equal(window.location.href, '/login');
});

test('a retried 401 does not loop', async () => {
  login();
  let refreshes = 0;
  axios.defaults.adapter = async (config) => { refreshes++; return response(config, { data: { accessToken: 'new' } }); };
  client.defaults.adapter = unauthorized;
  await assert.rejects(client.get('/one'), (error) => error.response.status === 401);
  assert.equal(refreshes, 1);
});

test('admin refresh endpoint returns only accessToken', async () => {
  client.defaults.adapter = async (config) => {
    assert.equal(config.url, '/auth-admin/refresh');
    return response(config, { data: { accessToken: 'new' } });
  };
  assert.deepEqual(await authApi.refreshToken('refresh'), { accessToken: 'new' });
});

test('logout uses v2 and clears tokens', async () => {
  login();
  client.defaults.adapter = async (config) => { assert.equal(config.url, '/v2/auth/logout'); return response(config, { data: {} }); };
  await authApi.logout();
  assert.equal(localStorage.getItem('accessToken'), null);
});

test('single and multiple upload preserve multipart fields on v2 routes', async () => {
  const file = new File(['test'], 'test.png', { type: 'image/png' });
  const result = { fileName: 'banners/test.png', filename: 'banners/test.png', url: 'https://cdn.test/test.png', cdnUrl: 'https://cdn.test/test.png', size: 4 };
  client.defaults.adapter = async (config) => {
    assert.equal(config.data.get('folder'), 'banners');
    if (config.url === '/v2/upload/single') {
      assert.equal(config.data.get('file').name, file.name);
      return response(config, { data: result });
    }
    assert.equal(config.url, '/v2/upload/multiple');
    assert.equal(config.data.getAll('files').length, 2);
    return response(config, { data: [result, result] });
  };
  assert.deepEqual(await uploadApi.uploadSingle(file, 'banners'), result);
  assert.equal((await uploadApi.uploadMultiple([file, file], 'banners')).length, 2);
});

test('deleted-user pagination sends limit and preserves envelope data', async () => {
  const page = { items: [], pagination: { currentPage: 3, pageSize: 50, totalItems: 120 } };
  client.defaults.adapter = async (config) => {
    assert.deepEqual(config.params, { page: 3, limit: 50, role: 'breeder' });
    return response(config, { data: page });
  };
  assert.deepEqual(await userApi.getDeletedUsers({ page: 3, limit: 50, role: 'breeder' }), page);
});

test('announcement list reads every unwrapped backend page', async () => {
  const pages = [];
  client.defaults.adapter = async (config) => {
    pages.push(config.params.page);
    return response(config, { items: [{ announcementId: String(config.params.page) }], pagination: { hasNextPage: config.params.page < 3 } });
  };
  assert.deepEqual((await announcementApi.getAnnouncements()).map((item) => item.announcementId), ['1', '2', '3']);
  assert.deepEqual(pages, [1, 2, 3]);
});

test('empty announcement page terminates', async () => {
  let calls = 0;
  client.defaults.adapter = async (config) => { calls++; return response(config, { items: [], pagination: { hasNextPage: false } }); };
  assert.deepEqual(await announcementApi.getAnnouncements(), []);
  assert.equal(calls, 1);
});

test('breeder detail maps backend identity fields and retains document URLs', async () => {
  const verificationInfo = { verificationStatus: 'pending', documents: [{ fileUrl: 'https://cdn.test/doc.pdf' }] };
  client.defaults.adapter = async (config) => response(config, { data: { breederId: 'breeder', nickname: 'name', email: 'test@example.test', phone: '010', verificationInfo } });
  const detail = await breederApi.getBreederDetail('breeder');
  assert.equal(detail.breederName, 'name');
  assert.equal(detail.emailAddress, 'test@example.test');
  assert.deepEqual(detail.verificationInfo, verificationInfo);
});

test('backend resolved/dismissed report statuses render Korean labels', () => {
  assert.equal(getStatusTag('resolved').props.children, '승인됨');
  assert.equal(getStatusTag('dismissed').props.children, '반려됨');
});

test('refresh completion cannot restore a logged-out session', async () => {
  login();
  axios.defaults.adapter = async (config) => {
    useAuthStore.getState().logout();
    return response(config, { data: { accessToken: 'new' } });
  };
  client.defaults.adapter = unauthorized;
  await assert.rejects(client.get('/one'), /Session changed/);
  assert.equal(useAuthStore.getState().isAuthenticated, false);
  assert.equal(localStorage.getItem('accessToken'), null);
});

test('logout clears local authentication even when the server is unavailable', async () => {
  login();
  client.defaults.adapter = async () => { throw new Error('Network unavailable'); };
  await assert.rejects(authApi.logout(), /Network unavailable/);
  assert.equal(useAuthStore.getState().isAuthenticated, false);
  assert.equal(localStorage.getItem('refreshToken'), null);
});

const { operationsApi } = await import('../src/features/operations/api/operationsApi.ts');
test('notification filters preserve unread=false and backend pagination names', async () => {
  const data = { items: [], pagination: { totalItems: 0 } };
  client.defaults.adapter = async config => {
    assert.deepEqual(config.params, { pageNumber: 2, itemsPerPage: 20, isRead: false, userRole: 'breeder' });
    return response(config, { data });
  };
  assert.deepEqual(await operationsApi.getNotifications({ pageNumber: 2, itemsPerPage: 20, isRead: false, userRole: 'breeder' }), data);
});
test('email preview reads raw HTML without invoking a sending endpoint', async () => {
  client.defaults.adapter = async config => {
    assert.equal(config.method, 'get');
    assert.equal(config.url, '/notification-email-preview-admin/render');
    assert.equal(config.params.type, 'breeder-rejection');
    assert.equal(config.responseType, 'text');
    return response(config, '<html><body>미리보기</body></html>');
  };
  assert.equal(await operationsApi.renderEmail('breeder-rejection'), '<html><body>미리보기</body></html>');
});
test('keyword update retains rank zero and inactive false after JSON serialization', async () => {
  client.defaults.adapter = async config => {
    assert.equal(config.method, 'patch');
    assert.deepEqual(JSON.parse(config.data), { keyword: '골든리트리버', rank: 0, isActive: false });
    return response(config, { data: { keywordId: 'keyword', ...JSON.parse(config.data) } });
  };
  assert.equal((await operationsApi.updateKeyword('keyword', { keyword: '골든리트리버', rank: 0, isActive: false })).isActive, false);
});
test('server-selected reminders send no invented recipient fields and expose actual sent count', async () => {
  client.defaults.adapter = async config => {
    assert.equal(config.data, undefined);
    assert.equal(config.timeout, 120000);
    return response(config, { data: { sentCount: 0, breederIds: [] } });
  };
  assert.deepEqual(await operationsApi.sendDocumentReminders(), { sentCount: 0, breederIds: [] });
});

test('breeder account type filters are sent to the server with verification status and paging', async () => {
  for (const accountType of ['all', 'normal', 'test']) {
    client.defaults.adapter = async config => {
      assert.deepEqual(config.params, { verificationStatus: 'approved', ...(accountType === 'all' ? {} : { accountType }), pageNumber: 1, itemsPerPage: 10 });
      return response(config, { data: { items: [], pagination: { totalItems: 0 } } });
    };
    assert.deepEqual((await breederApi.getBreeders('approved', 1, 10, accountType)).items, []);
  }
});
test('pending verification supports the same account type filter', async () => {
  client.defaults.adapter = async config => {
    assert.equal(config.url, '/breeder-verification-admin/verification/pending');
    assert.deepEqual(config.params, { accountType: 'test' });
    return response(config, { data: { items: [] } });
  };
  assert.deepEqual(await breederApi.getPendingVerifications('test'), []);
});
