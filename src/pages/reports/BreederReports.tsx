import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Card, message, Space, Descriptions, Input } from 'antd';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { breederApi } from '../../features/breeder/api/breederApi';
import type { BreederReport } from '../../shared/types/api.types';

const { TextArea } = Input;

// 신고 유형 한글 매핑
const getReportTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    no_contract: '계약 불이행',
    false_info: '허위 정보',
    inappropriate_content: '부적절한 콘텐츠',
    fraudulent_listing: '사기성 매물',
    other: '기타',
  };

  return typeMap[type] || type;
};

// 신고 상태 표시
const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'orange', text: '대기 중' },
    approved: { color: 'red', text: '승인됨' },
    rejected: { color: 'green', text: '반려됨' },
  };

  const statusInfo = statusMap[status] || { color: 'default', text: status };
  return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
};

export default function BreederReports() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<BreederReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<BreederReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'reject'>('resolve');
  const [adminNotes, setAdminNotes] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchReports();
  }, [pagination.page, pagination.limit]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await breederApi.getReports(pagination.page, pagination.limit);
      setDataSource(response.items);
      setPagination((prev) => ({ ...prev, total: response.pagination.totalItems }));
    } catch (error: any) {
      console.error('Failed to fetch reports:', error);
      message.error('신고 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: BreederReport) => {
    setSelectedReport(record);
    setIsModalOpen(true);
  };

  const handleAction = (record: BreederReport, type: 'resolve' | 'reject') => {
    setSelectedReport(record);
    setActionType(type);
    setAdminNotes('');
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedReport) return;

    try {
      await breederApi.handleReport(selectedReport.reportId, {
        action: actionType,
        adminNotes,
      });

      message.success(
        actionType === 'resolve' ? '신고가 승인되었습니다. 브리더가 제재됩니다.' : '신고가 반려되었습니다.'
      );

      setIsActionModalOpen(false);
      fetchReports();
    } catch (error: any) {
      console.error('Action failed:', error);
      message.error('처리에 실패했습니다.');
    }
  };

  const columns: ColumnsType<BreederReport> = [
    {
      title: '신고 대상',
      dataIndex: 'targetName',
      key: 'targetName',
      width: 150,
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: '신고 사유',
      dataIndex: 'type',
      key: 'type',
      width: 200,
      ellipsis: true,
      render: (type: string) => getReportTypeText(type),
    },
    {
      title: '신고일',
      dataIndex: 'reportedAt',
      key: 'reportedAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '액션',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
            상세
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                danger
                icon={<CheckCircleOutlined />}
                onClick={() => handleAction(record, 'resolve')}
                size="small"
              >
                승인 (제재)
              </Button>
              <Button icon={<CloseCircleOutlined />} onClick={() => handleAction(record, 'reject')} size="small">
                반려
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* 페이지 헤더 */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-500)' }}>
          브리더 신고 관리
        </h1>
        <p className="text-sm sm:text-base text-gray-500">브리더에 대한 신고를 검토하고 처리합니다</p>
      </div>

      {/* 통계 카드 */}
      <Card
        className="mb-6"
        style={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg"
            style={{ backgroundColor: 'var(--color-status-error-100)' }}
          >
            <WarningOutlined style={{ fontSize: '24px', color: 'var(--color-status-error-500)' }} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">처리 대기 중</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-status-error-500)' }}>
              {dataSource.filter((r) => r.status === 'pending').length}건
            </p>
          </div>
        </div>
      </Card>

      {/* 테이블 스크롤 래퍼 - 모바일에서 가로 스크롤 가능 */}
      <div className="overflow-x-auto -mx-3 sm:mx-0 mb-6">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey={(record) => record.reportId}
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
            onChange: (page, pageSize) => setPagination({ ...pagination, page, limit: pageSize }),
            responsive: true,
          }}
        />
      </div>

      {/* 상세 보기 모달 */}
      <Modal
        title="신고 상세 정보"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            닫기
          </Button>,
          selectedReport?.status === 'pending' && (
            <>
              <Button
                key="reject"
                onClick={() => {
                  setIsModalOpen(false);
                  handleAction(selectedReport, 'reject');
                }}
              >
                반려
              </Button>
              <Button
                key="resolve"
                danger
                onClick={() => {
                  setIsModalOpen(false);
                  handleAction(selectedReport, 'resolve');
                }}
              >
                승인 (제재)
              </Button>
            </>
          ),
        ]}
        width="100%"
        style={{ maxWidth: '700px', top: 20 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
          },
        }}
      >
        {selectedReport && (
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="신고 대상 브리더" span={2}>
              <strong>{selectedReport.targetName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="신고 ID" span={2}>
              {selectedReport.reportId}
            </Descriptions.Item>
            <Descriptions.Item label="신고일" span={2}>
              {new Date(selectedReport.reportedAt).toLocaleString('ko-KR')}
            </Descriptions.Item>
            <Descriptions.Item label="신고 사유" span={2}>
              {getReportTypeText(selectedReport.type)}
            </Descriptions.Item>
            <Descriptions.Item label="상세 설명" span={2}>
              {selectedReport.description || '없음'}
            </Descriptions.Item>
            <Descriptions.Item label="상태" span={2}>
              {getStatusTag(selectedReport.status)}
            </Descriptions.Item>
            {selectedReport.adminNotes && (
              <Descriptions.Item label="관리자 조치" span={2}>
                {selectedReport.adminNotes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 처리 모달 */}
      <Modal
        title={actionType === 'resolve' ? '신고 승인 (브리더 제재)' : '신고 반려'}
        open={isActionModalOpen}
        onOk={handleActionSubmit}
        onCancel={() => setIsActionModalOpen(false)}
        okText={actionType === 'resolve' ? '승인' : '반려'}
        okButtonProps={{ danger: actionType === 'resolve' }}
        cancelText="취소"
        width="100%"
        style={{ maxWidth: '500px', top: 20 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
          },
        }}
      >
        <div className="mb-4">
          <p className="mb-2">관리자 메모 (선택)</p>
          <TextArea
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="처리 사유나 메모를 입력하세요"
            maxLength={500}
            showCount
          />
        </div>

        {actionType === 'resolve' && (
          <div className="p-3 rounded mt-4" style={{ backgroundColor: 'var(--color-status-error-100)' }}>
            <p className="text-sm" style={{ color: 'var(--color-status-error-500)' }}>
              ⚠️ 신고 승인 시 해당 브리더는 제재됩니다. 신중하게 결정해주세요.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
