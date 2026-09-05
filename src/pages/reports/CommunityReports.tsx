import { useCallback, useState } from 'react';
import { App, Button, Descriptions, Modal, Select, Space, Table, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { operationsApi } from '../../features/operations/api/operationsApi';
import type { CommunityReportAdminItemResponse } from '../../features/operations/api/operations.types';
import { useRemoteData } from '../../shared/hooks/useRemoteData';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { getStatusTag } from '../../features/breeder/ui/breederReportHelpers';

const reasons: Record<string, string> = {
  spam: '스팸',
  inappropriate_content: '부적절한 콘텐츠',
  false_info: '허위 정보',
  hateful_content: '혐오 표현',
  other: '기타',
};
export default function CommunityReports() {
  const { message, modal } = App.useApp();
  const [query, setQuery] = useState<{ page: number; limit: number; status?: 'pending' | 'resolved' | 'dismissed' }>({
    page: 1,
    limit: 20,
  });
  const [selected, setSelected] = useState<CommunityReportAdminItemResponse>();
  const list = useRemoteData(useCallback(() => operationsApi.getCommunityReports(query), [query]));
  const act = (item: CommunityReportAdminItemResponse, resolve: boolean) =>
    modal.confirm({
      title: resolve ? '신고된 게시물을 숨길까요?' : '이 신고를 기각할까요?',
      content: resolve
        ? '신고가 처리되고 해당 게시물이 사용자에게 보이지 않게 됩니다.'
        : '게시물의 노출 상태는 유지됩니다.',
      okText: resolve ? '숨김 처리' : '기각',
      cancelText: '취소',
      okButtonProps: { danger: resolve },
      onOk: async () => {
        try {
          if (resolve) await operationsApi.resolveCommunityReport(item.reportId);
          else await operationsApi.dismissCommunityReport(item.reportId);
          setSelected(undefined);
          list.reload();
          message.success('신고를 처리했습니다.');
        } catch (error) {
          message.error('신고 처리에 실패했습니다.');
          throw error;
        }
      },
    });
  return (
    <div>
      <PageHeading
        title="커뮤니티 신고"
        description="접수된 신고를 확인하고 커뮤니티 게시물의 노출을 관리하세요."
        action={
          <Button icon={<ReloadOutlined />} onClick={list.reload}>
            새로고침
          </Button>
        }
      />
      <div className="filter-bar">
        <span>처리 상태</span>
        <Select
          aria-label="신고 처리 상태"
          allowClear
          placeholder="전체 상태"
          style={{ width: 170 }}
          value={query.status}
          options={[
            { value: 'pending', label: '대기 중' },
            { value: 'resolved', label: '처리 완료' },
            { value: 'dismissed', label: '기각' },
          ]}
          onChange={(status) => setQuery({ ...query, page: 1, status })}
        />
      </div>
      <LoadError error={list.error} retry={list.reload} />
      <Table
        rowKey="reportId"
        loading={list.loading}
        dataSource={list.data?.items}
        scroll={{ x: 850 }}
        pagination={{
          current: query.page,
          pageSize: query.limit,
          total: list.data?.pagination.totalItems,
          showSizeChanger: true,
          onChange: (page, limit) => setQuery({ ...query, page, limit }),
        }}
        columns={[
          { title: '신고자', dataIndex: 'reporterNickname' },
          { title: '신고 사유', dataIndex: 'reason', render: (reason) => <Tag>{reasons[reason] || reason}</Tag> },
          { title: '상세 내용', dataIndex: 'description', ellipsis: true },
          { title: '상태', dataIndex: 'status', render: getStatusTag },
          { title: '접수일', dataIndex: 'createdAt', render: (value) => new Date(value).toLocaleString('ko-KR') },
          {
            title: '관리',
            render: (_, item) => (
              <Space>
                <Button size="small" onClick={() => setSelected(item)}>
                  상세
                </Button>
                {item.status === 'pending' && (
                  <>
                    <Button size="small" danger onClick={() => act(item, true)}>
                      숨김
                    </Button>
                    <Button size="small" onClick={() => act(item, false)}>
                      기각
                    </Button>
                  </>
                )}
              </Space>
            ),
          },
        ]}
      />
      <Modal open={!!selected} title="커뮤니티 신고 상세" footer={null} onCancel={() => setSelected(undefined)}>
        {selected && (
          <Descriptions
            column={1}
            bordered
            items={[
              { key: 'report', label: '신고 ID', children: selected.reportId },
              { key: 'post', label: '게시물 ID', children: selected.postId },
              { key: 'reporter', label: '신고자', children: selected.reporterNickname },
              { key: 'description', label: '신고 내용', children: selected.description || '상세 내용 없음' },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
