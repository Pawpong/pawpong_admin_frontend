import './register-typescript.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const { readBreederFilters, updateBreederFilters } = await import('../src/features/breeder/model/breederFilters.ts');

test('bookmarked breeder searches restore filters and pagination', () => {
  const result = readBreederFilters(new URLSearchParams('q=hello%40example.test&city=서울&page=3&pageSize=20&status=reviewing'));
  assert.deepEqual(result, { currentPage: 3, pageSize: 20, statusFilter: 'reviewing', searchKeyword: 'hello@example.test', cityName: '서울', accountType: 'all' });
});
test('invalid pagination and unsupported account filter cannot reach backend through a URL', () => {
  const result = readBreederFilters(new URLSearchParams('page=-2&pageSize=999999&status=invalid&accountType=test'), false);
  assert.equal(result.currentPage, 1); assert.equal(result.pageSize, 10); assert.equal(result.statusFilter, undefined); assert.equal(result.accountType, 'all');
});
test('changing search resets the page while retaining the selected status', () => {
  const original = new URLSearchParams('q=old&page=7&status=approved');
  const updated = updateBreederFilters(original, { q: 'new', page: 1 });
  assert.equal(readBreederFilters(updated).currentPage, 1); assert.equal(updated.get('status'), 'approved'); assert.equal(updated.get('q'), 'new'); assert.equal(original.get('page'), '7');
});
test('reset removes stale filters without altering unrelated URL state', () => {
  const reset = updateBreederFilters(new URLSearchParams('q=old&city=서울&accountType=test&page=4&source=bookmark'), { q: undefined, city: undefined, accountType: 'all', page: 1 });
  assert.equal(reset.toString(), 'source=bookmark');
});
