import { Alert, List, Tag, Typography } from 'antd';
import { communityReportPlaceRows } from '../model/community-report-places';
import type { CommunityReportPlace } from '../model/community-report.types';

/** 위치 공개(집·직장 주소 등) 신고를 판단할 수 있게 작성자가 공개한 지도 장소를 보여준다. */
export function CommunityReportPlaces({
  places,
  publicPlaceConfirmed,
}: {
  places?: CommunityReportPlace[];
  publicPlaceConfirmed?: boolean;
}) {
  if (places === undefined) return null;
  const rows = communityReportPlaceRows(places);
  return (
    <section aria-label="공개한 지도 장소" style={{ marginTop: 16 }}>
      <Typography.Title level={5}>공개한 지도 장소 {rows.length}곳</Typography.Title>
      {rows.length === 0 ? (
        <Typography.Paragraph type="secondary">이 글에는 공개한 지도 장소가 없어요.</Typography.Paragraph>
      ) : (
        <>
          <Alert
            type={publicPlaceConfirmed ? 'info' : 'warning'}
            showIcon
            style={{ marginBottom: 8 }}
            message={
              publicPlaceConfirmed
                ? '작성자가 집·개인 주소가 아닌 공개 장소라고 확인했어요.'
                : '작성자의 공개 장소 확인 기록이 없어요.'
            }
            description="장소 사이 연결은 방문 순서이며 실제 이동 경로가 아니에요. 개인 주소로 보이면 신고를 처리해 주세요."
          />
          <List
            size="small"
            bordered
            dataSource={rows}
            renderItem={(row) => (
              <List.Item
                actions={
                  row.mapUrl
                    ? [
                        <a key="map" href={row.mapUrl} target="_blank" rel="noopener noreferrer">
                          지도에서 보기
                        </a>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  title={
                    <span>
                      <Tag>{row.label}</Tag>
                      {row.name}
                    </span>
                  }
                  description={
                    <span>
                      {row.coordinates}
                      {row.photoLabel && ` · ${row.photoLabel}`}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}
    </section>
  );
}
