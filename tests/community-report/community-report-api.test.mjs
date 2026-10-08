import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  client,
  response,
  reportId,
  sourceVersion,
  png,
  pngBytes,
  controller,
  prepare,
} from './fixtures/community-report.fixture.mjs';
const { getCommunityReportPhoto, getCommunityReportReview } = await import('../../src/features/community-report/api/communityReportApi.ts');
const { COMMUNITY_REPORT_PHOTO_MAX_BYTES } = await import('../../src/features/community-report/constants/community-report-photo.ts');
import { login } from '../auth/fixtures/admin-session.fixture.mjs';

beforeEach(prepare);

test('신고 상세는 관리자 인증 요청으로 조회하고 응답 자료만 반환한다', async () => {
  const detail = { reportId, post: null };
  client.defaults.adapter = async (config) => {
    assert.equal(config.url, `/community-admin/reports/${reportId}`);
    assert.equal(config.headers.Authorization, 'Bearer 가-access');
    assert.equal(config.withCredentials, false);
    return response(config, { data: detail });
  };
  assert.deepEqual(await getCommunityReportReview(reportId), detail);
});

test('사진은 고정된 관리자 경로와 글 버전으로 조회하며 토큰을 주소에 넣지 않는다', async () => {
  client.defaults.adapter = async (config) => {
    assert.equal(config.url, `/community-admin/reports/${reportId}/photos/0`);
    assert.deepEqual(config.params, { sourceVersion });
    assert.equal(config.responseType, 'blob');
    assert.equal(config.timeout, 12000);
    assert.equal(config.maxContentLength, COMMUNITY_REPORT_PHOTO_MAX_BYTES);
    return response(config, png());
  };
  assert.equal((await getCommunityReportPhoto(reportId, 0, sourceVersion, controller().signal)).type, 'image/png');
});

test('잘못된 신고 식별자와 사진 순서와 글 버전은 요청 전에 거부한다', async () => {
  for (const id of ['../reports', 'https://example.invalid', 'a'.repeat(23)]) {
    await assert.rejects(getCommunityReportReview(id));
    await assert.rejects(getCommunityReportPhoto(id, 0, sourceVersion, controller().signal));
  }
  for (const index of [-1, 10, 0.5, NaN])
    await assert.rejects(getCommunityReportPhoto(reportId, index, sourceVersion, controller().signal));
  for (const version of ['', 'c'.repeat(63), 'x'.repeat(64), sourceVersion + '?token=invalid']) {
    await assert.rejects(getCommunityReportPhoto(reportId, 0, version, controller().signal));
  }
});

test('빈 사진과 위장된 이미지와 실행 가능한 형식은 표시하지 않는다', async () => {
  for (const data of [
    new Blob([], { type: 'image/png' }),
    new Blob(['<svg/>'], { type: 'image/svg+xml' }),
    new Blob(['<script/>'], { type: 'image/png' }),
    { type: 'image/png', size: 12 },
  ]) {
    client.defaults.adapter = async (config) => response(config, data);
    await assert.rejects(getCommunityReportPhoto(reportId, 0, sourceVersion, controller().signal), /사진 형식/);
  }
});

test('허용한 크기를 초과한 사진은 응답 후에도 거부한다', async () => {
  client.defaults.adapter = async (config) =>
    response(config, new Blob([new Uint8Array(COMMUNITY_REPORT_PHOTO_MAX_BYTES + 1)], { type: 'image/png' }));
  await assert.rejects(getCommunityReportPhoto(reportId, 0, sourceVersion, controller().signal), /사진 형식/);
});

test('다운로드 중 크기 제한을 넘으면 요청을 취소한다', async () => {
  for (const progress of [
    { loaded: COMMUNITY_REPORT_PHOTO_MAX_BYTES + 1 },
    { loaded: 1, total: COMMUNITY_REPORT_PHOTO_MAX_BYTES + 1 },
  ]) {
    client.defaults.adapter = async (config) => {
      config.onDownloadProgress(progress);
      assert.equal(config.signal.aborted, true);
      return response(config, png());
    };
    await assert.rejects(getCommunityReportPhoto(reportId, 0, sourceVersion, controller().signal));
  }
});

test('창을 닫아 취소된 사진 요청은 정상 응답이어도 반환하지 않는다', async () => {
  const abort = controller();
  client.defaults.adapter = async (config) => {
    abort.abort();
    return response(config, png());
  };
  await assert.rejects(getCommunityReportPhoto(reportId, 0, sourceVersion, abort.signal));
});

test('이전 계정에서 내려받은 사진은 새 계정에 반환하지 않는다', async () => {
  client.defaults.adapter = async (config) => {
    login('나');
    return response(config, png());
  };
  await assert.rejects(getCommunityReportPhoto(reportId, 0, sourceVersion, controller().signal), /로그인 상태/);
});

test('이미 취소된 사진 요청은 네트워크에 보내지 않는다', async () => {
  const abort = controller();
  abort.abort();
  await assert.rejects(getCommunityReportPhoto(reportId, 0, sourceVersion, abort.signal));
});

test('허용된 래스터 이미지의 시그니처가 일치할 때만 반환한다', async () => {
  for (const [type, bytes] of [
    ['image/png', pngBytes],
    ['image/jpeg', Uint8Array.from([255, 216, 255])],
    ['image/webp', new TextEncoder().encode('RIFF1234WEBP')],
  ]) {
    client.defaults.adapter = async (config) => response(config, new Blob([bytes], { type }));
    assert.equal((await getCommunityReportPhoto(reportId, 0, sourceVersion, controller().signal)).type, type);
  }
});
