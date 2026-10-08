import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const { communityReportPlaceRows } =
  await import('../../src/features/community-report/model/community-report-places.ts');

test('공개한 장소는 방문 순서와 좌표와 연결 사진을 그대로 보여주고 지도 링크를 만든다', () => {
  const rows = communityReportPlaceRows([
    { order: 1, name: '공개 공원 입구', latitude: 37.51, longitude: 127.05, photoIndex: 0 },
    { order: 2, name: '카페 & 산책로', latitude: 37.123456, longitude: 127.987654 },
  ]);
  assert.deepEqual(
    rows.map(({ label, name, coordinates, photoLabel }) => [label, name, coordinates, photoLabel]),
    [
      ['1번째 장소', '공개 공원 입구', '37.51000, 127.05000', '첨부 사진 1과 연결'],
      ['2번째 장소', '카페 & 산책로', '37.12346, 127.98765', null],
    ],
  );
  assert.equal(
    rows[1].mapUrl,
    'https://map.kakao.com/link/map/%EC%B9%B4%ED%8E%98%20%26%20%EC%82%B0%EC%B1%85%EB%A1%9C,37.123456,127.987654',
  );
});

test('좌표가 깨졌거나 장소 정보가 없는 응답은 지도 링크를 만들지 않고 빈 목록으로 다룬다', () => {
  assert.deepEqual(communityReportPlaceRows(undefined), []);
  const [row] = communityReportPlaceRows([{ order: 1, name: '', latitude: Number.NaN, longitude: 200 }]);
  assert.equal(row.name, '이름 없는 장소');
  assert.equal(row.coordinates, '좌표 확인 불가');
  assert.equal(row.mapUrl, null);
});

test('검토 화면은 이전 서버 응답에는 장소 영역을 숨기고 연결선을 실제 경로라고 부르지 않는다', () => {
  const ui = readFileSync('src/features/community-report/ui/CommunityReportPlaces.tsx', 'utf8');
  assert.match(ui, /if \(places === undefined\) return null/);
  assert.match(ui, /실제 이동 경로가 아니에요/);
  assert.match(ui, /rel="noopener noreferrer"/);
  const review = readFileSync('src/features/community-report/ui/CommunityReportReview.tsx', 'utf8');
  assert.match(
    review,
    /<CommunityReportPlaces places=\{post\.places\} publicPlaceConfirmed=\{post\.publicPlaceConfirmed\} \/>/,
  );
});
