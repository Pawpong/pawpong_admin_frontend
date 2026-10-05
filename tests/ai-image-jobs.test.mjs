import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.window = { localStorage, location: { pathname: '/content/ai-image-jobs', href: '' } };
const { aiImageApi } = await import('../src/features/ai-image/api/aiImageApi.ts');
const { default: client } = await import('../src/shared/api/axios.ts');
const { AiImageJobUser } = await import('../src/features/ai-image/ui/AiImageJobUser.tsx');
const { AiImageJobTable } = await import('../src/features/ai-image/ui/AiImageJobTable.tsx');

// All accounts and images in these regressions are synthetic fixtures.
const summary = (overrides = {}) => ({
  displayName: '테스트 입양자', nickname: '테스트 닉네임',
  emailAddress: 'adopter@example.test', accountStatus: 'active', ...overrides,
});
const job = (overrides = {}) => ({
  jobId: '507f1f77bcf86cd799439010', userId: '507f1f77bcf86cd799439011', userRole: 'adopter',
  user: summary(), filterId: '507f1f77bcf86cd799439012', contestId: null, status: 'succeeded',
  inputImageUrl: null, outputImageUrl: null, inputObjectKey: 'synthetic.jpg', outputObjectKey: null,
  promptSnapshot: '테스트 프롬프트', negativePromptSnapshot: '', modelSnapshot: 'test-model',
  outputSizeSnapshot: '1024x1024', attempt: 1, errorCode: null,
  createdAt: '2026-10-05T00:00:00.000Z', completedAt: '2026-10-05T00:00:01.000Z', ...overrides,
});
const renderUser = (item) => renderToStaticMarkup(createElement(AiImageJobUser, { job: item }));
const beforeDetails = (markup) => markup.slice(0, markup.indexOf('<details'));

test('jobs API preserves filters, pagination envelope and the additive user summary in one request', async () => {
  const items = [job()];
  const envelope = { success: true, data: { items, pagination: { currentPage: 2, pageSize: 10, totalItems: 21, totalPages: 3, hasNextPage: true, hasPrevPage: true } } };
  let calls = 0;
  client.defaults.adapter = async (config) => {
    calls++;
    assert.equal(config.method, 'get');
    assert.equal(config.url, '/ai-image-admin/jobs');
    assert.deepEqual(config.params, { page: 2, limit: 10, status: 'failed', filterId: 'filter', userId: 'user' });
    return { config, status: 200, statusText: 'OK', headers: {}, data: envelope };
  };
  assert.deepEqual(await aiImageApi.getJobs(2, 10, { status: 'failed', filterId: 'filter', userId: 'user' }), envelope);
  assert.equal(calls, 1);
});

test('name, nickname, email and role lead the cell, with raw ID only inside expandable details', () => {
  const item = job();
  const markup = renderUser(item);
  assert.match(beforeDetails(markup), /테스트 입양자/);
  assert.match(beforeDetails(markup), /닉네임: 테스트 닉네임/);
  assert.match(beforeDetails(markup), /adopter@example.test/);
  assert.match(beforeDetails(markup), /입양자/);
  assert.doesNotMatch(beforeDetails(markup), new RegExp(item.userId));
  assert.match(markup.slice(markup.indexOf('<details')), new RegExp(item.userId));
  assert.match(markup, /<summary[^>]*>사용자 ID<\/summary>/);
});

test('breeder company and suspended role are readable independently of failed job status', () => {
  const markup = renderUser(job({ userRole: 'breeder', status: 'failed', user: summary({ displayName: '테스트 브리더 상호', accountStatus: 'suspended' }) }));
  for (const text of ['테스트 브리더 상호', '테스트 닉네임', 'adopter@example.test', '브리더', '이용 정지']) assert.ok(markup.includes(text));
});

test('deleted and missing accounts never expose stale profile fields or use an ID as their name', () => {
  for (const [accountStatus, label] of [['deleted', '탈퇴한 사용자'], ['missing', '사용자를 찾을 수 없음']]) {
    const item = job({ status: 'failed', user: summary({ accountStatus }) });
    const markup = renderUser(item);
    assert.ok(beforeDetails(markup).includes(label));
    for (const hidden of ['테스트 입양자', '테스트 닉네임', 'adopter@example.test', item.userId]) assert.ok(!beforeDetails(markup).includes(hidden));
  }
});

test('legacy omitted/null summaries clearly report unavailable information', () => {
  for (const user of [undefined, null]) {
    const markup = renderUser(job({ user }));
    assert.match(beforeDetails(markup), /사용자 정보 미제공/);
    assert.match(beforeDetails(markup), /계정 정보 없음/);
    assert.doesNotMatch(beforeDetails(markup), /507f1f77/);
  }
});

test('partial profiles use nickname or explicit missing name/email labels without duplicating nickname', () => {
  const nicknameOnly = renderUser(job({ user: summary({ displayName: ' ', nickname: '별명만', emailAddress: null, accountStatus: 'unknown' }) }));
  assert.match(nicknameOnly, /별명만/);
  assert.doesNotMatch(nicknameOnly, /닉네임: 별명만/);
  assert.match(nicknameOnly, /이메일 미등록/);
  assert.match(nicknameOnly, /상태 미확인/);
  const empty = renderUser(job({ user: summary({ displayName: null, nickname: null, emailAddress: null }) }));
  assert.match(beforeDetails(empty), /이름 미등록/);
  assert.match(beforeDetails(empty), /이메일 미등록/);
});

test('user text is escaped and long account strings can wrap', () => {
  const markup = renderUser(job({ user: summary({ displayName: '<script>synthetic</script>', emailAddress: `${'long'.repeat(30)}@example.test` }) }));
  assert.doesNotMatch(markup, /<script>/);
  assert.match(markup, /&lt;script&gt;/);
  assert.match(markup, /overflow-wrap:anywhere/);
});

test('real job table keeps success/failure/deletion labels and server pagination', () => {
  const jobs = [
    job(),
    job({ jobId: 'failed', status: 'failed', userRole: 'breeder', errorCode: 'QUEUE_UNAVAILABLE', user: summary({ displayName: '테스트 상호' }) }),
    job({ jobId: 'deleted', status: 'queued', user: summary({ accountStatus: 'deleted' }) }),
  ];
  const markup = renderToStaticMarkup(createElement(AiImageJobTable, { jobs, loading: false, currentPage: 1, pageSize: 20, totalItems: 63, onPageChange() {} }));
  for (const text of ['테스트 입양자', '테스트 상호', '탈퇴한 사용자', '성공', '실패', '대기', 'QUEUE_UNAVAILABLE', '총 63건']) assert.ok(markup.includes(text), text);
});
