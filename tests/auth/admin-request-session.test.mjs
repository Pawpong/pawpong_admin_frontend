import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { client, axios, authApi, useAuthStore, login, reset, response, unauthorized, deferred } from './fixtures/admin-session.fixture.mjs';

beforeEach(reset);

test('요청 세션 메타데이터에 갱신 토큰 원문을 넣지 않는다', async () => {
  login();
  client.defaults.adapter = async config => {
    assert.equal(JSON.stringify(config._authSession).includes('가-refresh'), false);
    assert.equal(typeof config._authSession.key, 'number');
    return response(config);
  };
  await client.get('/community-admin/reports');
});

test('이전 계정의 늦은 인증 실패로 새 계정의 신고 처리를 재시도하지 않는다', async () => {
  login();
  const started = deferred(), pending = deferred();
  const sent = [];
  client.defaults.adapter = async config => {
    sent.push(config.headers.Authorization);
    if (sent.length === 1) { started.resolve(); await pending.promise; return unauthorized(config); }
    return response(config);
  };
  const request = client.post('/community-admin/reports/synthetic/resolve');
  const rejected = assert.rejects(request);
  await started.promise;
  login('나');
  pending.resolve();
  await rejected;
  assert.deepEqual(sent, ['Bearer 가-access']);
  assert.equal(useAuthStore.getState().user.adminId, '나');
});

test('계정 변경 뒤 도착한 이전 계정의 정상 응답을 화면에 반환하지 않는다', async () => {
  login();
  client.defaults.adapter = async config => { login('나'); return response(config, { private: '가의 자료' }); };
  await assert.rejects(client.get('/community-admin/reports'));
  assert.equal(useAuthStore.getState().user.adminId, '나');
});

test('로그아웃 후 같은 계정으로 다시 로그인해도 이전 응답을 버린다', async () => {
  login();
  client.defaults.adapter = async config => {
    useAuthStore.getState().logout();
    login();
    return response(config);
  };
  await assert.rejects(client.get('/community-admin/reports'));
});

test('이전 세션의 갱신 실패가 새로 로그인한 계정을 로그아웃시키지 않는다', async () => {
  login();
  client.defaults.adapter = unauthorized;
  axios.defaults.adapter = async () => { login('나'); throw new Error('합성 갱신 장애'); };
  await assert.rejects(client.get('/community-admin/reports'));
  assert.equal(useAuthStore.getState().user?.adminId, '나');
  assert.equal(window.location.href, '');
});

test('서버 로그아웃을 기다리던 이전 계정의 완료가 새 계정을 지우지 않는다', async () => {
  login();
  client.defaults.adapter = async config => { login('나'); return response(config); };
  await authApi.logout().catch(() => {});
  assert.equal(useAuthStore.getState().user?.adminId, '나');
});

test('요청 직후 동기적으로 계정이 바뀌어도 새 계정 권한으로 전송하지 않는다', async () => {
  login();
  const sent = [];
  client.defaults.adapter = async config => { sent.push(config.headers.Authorization); return response(config); };
  const pending = client.post('/community-admin/reports/synthetic/dismiss');
  login('나');
  await pending.catch(() => {});
  assert.ok(sent.every(value => value === 'Bearer 가-access'));
});

test('같은 로그인 세션에서 다른 요청이 갱신한 토큰으로는 재시도할 수 있다', async () => {
  login();
  let calls = 0;
  client.defaults.adapter = async config => {
    if (++calls === 1) {
      useAuthStore.getState().updateTokens('가-new', '가-refresh');
      return unauthorized(config);
    }
    assert.equal(config.headers.Authorization, 'Bearer 가-new');
    return response(config);
  };
  await client.get('/community-admin/reports');
  assert.equal(calls, 2);
});

test('이전 계정의 갱신 작업과 새 계정의 갱신 작업을 서로 합치거나 지우지 않는다', async () => {
  login();
  const starts = { '가-refresh': deferred(), '나-refresh': deferred() };
  const results = { '가-refresh': deferred(), '나-refresh': deferred() };
  const refreshes = [];
  axios.defaults.adapter = async config => {
    const token = JSON.parse(config.data).refreshToken;
    refreshes.push(token);
    starts[token].resolve();
    await results[token].promise;
    return response(config, { data: { accessToken: token.replace('refresh', 'new') } });
  };
  client.defaults.adapter = config => config.headers.Authorization.endsWith('-new')
    ? Promise.resolve(response(config)) : unauthorized(config);
  const old = assert.rejects(client.get('/old'));
  await starts['가-refresh'].promise;
  login('나');
  const current = client.get('/current');
  await starts['나-refresh'].promise;
  results['가-refresh'].resolve();
  await old;
  const another = client.get('/another');
  await new Promise(resolve => setImmediate(resolve));
  results['나-refresh'].resolve();
  await Promise.all([current, another]);
  assert.deepEqual(refreshes, ['가-refresh', '나-refresh']);
  assert.equal(useAuthStore.getState().user.accessToken, '나-new');
});

test('다른 탭에서 토큰 저장소가 바뀌어도 이전 응답을 반환하지 않는다', async () => {
  login();
  client.defaults.adapter = async config => {
    localStorage.setItem('refreshToken', '다른-세션');
    return response(config);
  };
  await assert.rejects(client.get('/community-admin/reports'), /로그인 상태가 변경/);
});
