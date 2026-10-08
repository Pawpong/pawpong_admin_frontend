import { useCallback } from 'react';
import { Alert, Button, Space, Spin, Tag, Typography } from 'antd';
import { getCommunityReportReview } from '../api/communityReportApi';
import { useRemoteData } from '../../../shared/hooks/useRemoteData';
import { CommunityReportPhoto } from './CommunityReportPhoto';
import { CommunityReportPlaces } from './CommunityReportPlaces';

export function CommunityReportReview({ reportId }: { reportId: string }) {
  const detail = useRemoteData(useCallback(() => getCommunityReportReview(reportId), [reportId]));
  if (detail.loading)
    return (
      <div role="status" style={{ padding: 20 }}>
        <Spin /> 신고된 글을 확인하고 있어요.
      </div>
    );
  if (detail.error)
    return (
      <Alert
        type="warning"
        showIcon
        message="신고된 글을 확인할 수 없어요"
        description="현재 환경에서 사진 검토가 지원되지 않거나 접근 권한이 변경되었을 수 있어요. 신고 처리 기능은 아래 신고 정보를 기준으로 사용할 수 있습니다."
        action={<Button onClick={detail.reload}>다시 확인</Button>}
      />
    );
  const post = detail.data?.post;
  if (!post)
    return (
      <Alert
        type="info"
        showIcon
        message="본문을 제공할 수 없는 글이에요"
        description="삭제된 계정, 비공개·임시저장 전환 또는 삭제된 글은 신고 정보만 표시합니다."
      />
    );
  return (
    <section aria-label="신고된 게시물 내용">
      <Space wrap style={{ marginBottom: 12 }}>
        <Tag>{post.isActive ? '게시 중' : '숨김 처리됨'}</Tag>
        <Tag>{post.visibility === 'followers' ? '팔로워 공개' : '전체 공개'}</Tag>
        <Typography.Text type="secondary">작성자 {post.authorNickname || '정보 없음'}</Typography.Text>
        <Button size="small" onClick={detail.reload}>
          최신 내용 확인
        </Button>
      </Space>
      {post.title && <Typography.Title level={5}>{post.title}</Typography.Title>}
      <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {post.body}
      </Typography.Paragraph>
      {post.photos.length > 0 && (
        <>
          <Typography.Paragraph type="secondary">
            첨부 사진은 눌러서 확인해 주세요. 신고 확인 목적으로만 열람하며 창을 닫으면 임시 사진을 해제합니다.
          </Typography.Paragraph>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12 }}
          >
            {post.photos.map((photo) =>
              photo.state === 'protected' ? (
                <CommunityReportPhoto
                  key={`${post.sourceVersion}:${photo.index}`}
                  reportId={reportId}
                  index={photo.index}
                  sourceVersion={post.sourceVersion}
                />
              ) : (
                <Alert
                  key={photo.index}
                  type="info"
                  message={`첨부 사진 ${photo.index + 1}`}
                  description="이전 방식의 사진은 보호된 경로에서 확인할 수 없어요. 공개 주소로 우회하지 않습니다."
                />
              ),
            )}
          </div>
        </>
      )}
      <CommunityReportPlaces places={post.places} publicPlaceConfirmed={post.publicPlaceConfirmed} />
    </section>
  );
}
