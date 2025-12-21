import React, { useEffect, useState } from 'react';
import { Table, Card, message, Tag, Space, Button, Modal, Typography, Popconfirm } from 'antd';
import { DeleteOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { reviewReportApi } from '../../features/review/api/reviewReportApi';
import type { ReviewReportItem } from '../../shared/types/api.types';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

/**
 * 후기 신고 관리 페이지
 * 신고된 후기들을 조회하고 부적절한 후기를 삭제할 수 있습니다.
 */
const ReviewReports: React.FC = () => {
  const [dataSource, setDataSource] = useState<ReviewReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReviewReportItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchReviewReports(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const fetchReviewReports = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const data = await reviewReportApi.getReviewReports(page, limit);
      if (data && Array.isArray(data.items)) {
        setDataSource(data.items);
        setPagination({
          current: data.pagination.currentPage,
          pageSize: data.pagination.pageSize,
          total: data.pagination.totalItems,
        });
      } else {
        console.error('Received non-array data:', data);
        setDataSource([]);
        message.warning('후기 신고 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch review reports:', error);
      setDataSource([]);
      message.error('후기 신고 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (report: ReviewReportItem) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const handleDelete = async (breederId: string, reviewId: string) => {
    try {
      await reviewReportApi.deleteReview(breederId, reviewId);
      message.success('부적절한 후기가 삭제되었습니다.');
      fetchReviewReports(pagination.current, pagination.pageSize);
    } catch (error: unknown) {
      console.error('Failed to delete review:', error);
      message.error('후기 삭제에 실패했습니다.');
    }
  };

  const getReasonLabel = (reason: string): string => {
    const reasonMap: Record<string, string> = {
      inappropriate_content: '부적절한 내용',
      spam: '스팸',
      fake_review: '허위 후기',
      offensive_language: '욕설/비방',
      other: '기타',
    };
    return reasonMap[reason] || reason;
  };

  const columns: ColumnsType<ReviewReportItem> = [
    {
      title: '브리더',
      dataIndex: 'breederName',
      key: 'breederName',
      width: 150,
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: '후기 내용',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <div style={{ maxWidth: '300px' }}>
          <Text ellipsis={{ tooltip: content }}>{content}</Text>
        </div>
      ),
    },
    {
      title: '작성자',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 120,
    },
    {
      title: '신고자',
      dataIndex: 'reporterName',
      key: 'reporterName',
      width: 120,
    },
    {
      title: '신고 사유',
      dataIndex: 'reportReason',
      key: 'reportReason',
      width: 130,
      render: (reason: string) => (
        <Tag color="red" icon={<WarningOutlined />}>
          {getReasonLabel(reason)}
        </Tag>
      ),
    },
    {
      title: '신고 일시',
      dataIndex: 'reportedAt',
      key: 'reportedAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.reportedAt).unix() - dayjs(b.reportedAt).unix(),
    },
    {
      title: '공개 여부',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 100,
      render: (isVisible: boolean) => (isVisible ? <Tag color="green">공개</Tag> : <Tag color="default">비공개</Tag>),
    },
    {
      title: '작업',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            상세
          </Button>
          <Popconfirm
            title="후기 삭제"
            description="이 후기를 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.breederId, record.reviewId)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* 페이지 헤더 */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-500)' }}>
          후기 신고 관리
        </h1>
        <p className="text-sm sm:text-base text-gray-500">신고된 후기를 검토하고 관리합니다</p>
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
            <p className="text-xs sm:text-sm text-gray-500">신고된 후기</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-status-error-500)' }}>
              {dataSource.length}건
            </p>
          </div>
        </div>
      </Card>

      {/* 테이블 스크롤 래퍼 - 모바일에서 가로 스크롤 가능 */}
      <div className="overflow-x-auto -mx-3 sm:mx-0 mb-6">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="reviewId"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            ...pagination,
            showTotal: (total) => `총 ${total}건`,
            showSizeChanger: true,
            onChange: (page, pageSize) => {
              fetchReviewReports(page, pageSize);
            },
            responsive: true,
          }}
        />
      </div>

      {/* 상세 정보 모달 */}
      <Modal
        title="후기 신고 상세 정보"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            닫기
          </Button>,
          <Popconfirm
            key="delete"
            title="후기 삭제"
            description="이 후기를 삭제하시겠습니까?"
            onConfirm={() => {
              if (selectedReport) {
                handleDelete(selectedReport.breederId, selectedReport.reviewId);
                setDetailModalVisible(false);
              }
            }}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              후기 삭제
            </Button>
          </Popconfirm>,
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
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <Text strong>브리더 정보</Text>
              <div style={{ marginTop: '8px' }}>
                <Text>이름: {selectedReport.breederName}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  ID: {selectedReport.breederId}
                </Text>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Text strong>후기 작성자</Text>
              <div style={{ marginTop: '8px' }}>
                <Text>이름: {selectedReport.authorName}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  ID: {selectedReport.authorId}
                </Text>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Text strong>후기 내용</Text>
              <Paragraph
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                {selectedReport.content}
              </Paragraph>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                작성 일시: {dayjs(selectedReport.writtenAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Text strong>신고 정보</Text>
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <Text>신고자: {selectedReport.reporterName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    ID: {selectedReport.reportedBy}
                  </Text>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <Text>신고 사유: </Text>
                  <Tag color="red" icon={<WarningOutlined />}>
                    {getReasonLabel(selectedReport.reportReason)}
                  </Tag>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <Text>신고 설명:</Text>
                  <Paragraph
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      background: '#fff7e6',
                      border: '1px solid #ffd591',
                      borderRadius: '4px',
                    }}
                  >
                    {selectedReport.reportDescription}
                  </Paragraph>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  신고 일시: {dayjs(selectedReport.reportedAt).format('YYYY-MM-DD HH:mm')}
                </Text>
              </div>
            </div>

            <div>
              <Text strong>공개 상태</Text>
              <div style={{ marginTop: '8px' }}>
                {selectedReport.isVisible ? <Tag color="green">공개 중</Tag> : <Tag color="default">비공개</Tag>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewReports;
