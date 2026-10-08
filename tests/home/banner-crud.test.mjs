import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bannerCrudFixture } from './fixtures/banner-crud.fixture.mjs';

test('배너 활성화는 상태만 보내 다른 관리자의 문구와 이미지 편집을 덮지 않음', async () => {
  for (const current of [true, false]) {
    const h = bannerCrudFixture();
    await h.hook.handleToggleActive('synthetic-banner', current);
    assert.deepEqual(h.updates, [['synthetic-banner', { isActive: !current }]]);
    assert.equal(h.refreshes(), 1);
    assert.equal(h.notices[0][0], 'success');
  }
});

test('목록에 없는 배너는 활성화 요청을 보내지 않음', async () => {
  const h = bannerCrudFixture({ banners: [] });
  await h.hook.handleToggleActive('missing-banner', true);
  assert.deepEqual(h.updates, []);
  assert.equal(h.refreshes(), 0);
});

test('배너 활성화 실패를 성공으로 안내하거나 목록을 갱신하지 않음', async () => {
  const h = bannerCrudFixture({ fail: true });
  await h.hook.handleToggleActive('synthetic-banner', true);
  assert.equal(h.notices[0][0], 'error');
  assert.equal(h.refreshes(), 0);
});
