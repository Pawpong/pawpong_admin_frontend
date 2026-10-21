import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';

const { popularKeywordErrorMessage, popularKeywordPayload } =
  await import('../src/features/operations/model/popularKeyword.ts');
const failure = (status, data) =>
  new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    {},
    {},
    { config: {}, status, statusText: '', headers: {}, data },
  );

test('cleared rank input is saved as 0 instead of null', () => {
  assert.deepEqual(popularKeywordPayload({ keyword: '  비숑 ', rank: null, isActive: true }), {
    keyword: '비숑',
    rank: 0,
    isActive: true,
  });
  assert.equal(popularKeywordPayload({ keyword: '말티즈' }).rank, 0);
  assert.equal(popularKeywordPayload({ keyword: '말티즈', rank: -1 }).rank, 0);
  assert.equal(popularKeywordPayload({ keyword: '말티즈', rank: 1.5 }).rank, 0);
  assert.equal(popularKeywordPayload({ keyword: '말티즈', rank: 3 }).rank, 3);
});

test('isActive keeps an explicit false and defaults to visible', () => {
  assert.equal(popularKeywordPayload({ keyword: '푸들', isActive: false }).isActive, false);
  assert.equal(popularKeywordPayload({ keyword: '푸들', isActive: null }).isActive, true);
});

test('duplicate keyword shows the server reason, other failures keep the fallback', () => {
  const fallback = '검색어 저장에 실패했습니다.';
  assert.equal(
    popularKeywordErrorMessage(failure(409, { message: '이미 등록된 키워드입니다: 비숑' }), fallback),
    '이미 등록된 키워드입니다: 비숑',
  );
  assert.equal(popularKeywordErrorMessage(failure(409, {}), fallback), '이미 등록된 검색어입니다.');
  assert.equal(popularKeywordErrorMessage(failure(500, { message: 'internal detail' }), fallback), fallback);
  assert.equal(popularKeywordErrorMessage(new Error('network'), fallback), fallback);
});
