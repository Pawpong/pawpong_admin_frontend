import { Modal, Button, Tag, Typography, Popconfirm } from 'antd';
import { DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ReviewReportItem } from '../../../shared/types/api.types';
import { getReasonLabel } from './ReviewReportTable';

const { Text, Paragraph } = Typography;

interface ReviewReportDetailModalProps {
  visible: boolean;
  report: ReviewReportItem | null;
  onClose: () => void;
  onDelete: (breederId: string, reviewId: string) => void;
}

export function ReviewReportDetailModal({ visible, report, onClose, onDelete }: ReviewReportDetailModalProps) {
  return (
    <Modal
      title="후기 신고 상세 정보"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>닫기</Button>,
        <Popconfirm
          key="delete"
          title="후기 삭제"
          description="이 후기를 삭제하시겠습니까?"
          onConfirm={() => {
            if (report) {
              onDelete(report.breederId, report.reviewId);
              onClose();
            }
          }}
          okText="삭제"
          cancelText="취소"
          okButtonProps={{ danger: true }}
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>후기 삭제</Button>
        </Popconfirm>,
      ]}
      width="100%"
      style={{ maxWidth: '700px', top: 20 }}
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
    >
      {report && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text strong>브리더 정보</Text>
            <div style={{ marginTop: '8px' }}>
              <Text>이름: {report.breederName}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>ID: {report.breederId}</Text>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Text strong>후기 작성자</Text>
            <div style={{ marginTop: '8px' }}>
              <Text>이름: {report.authorName}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>ID: {report.authorId}</Text>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Text strong>후기 내용</Text>
            <Paragraph style={{ marginTop: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
              {report.content}
            </Paragraph>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              작성 일시: {dayjs(report.writtenAt).format('YYYY-MM-DD HH:mm')}
            </Text>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Text strong>신고 정보</Text>
            <div style={{ marginTop: '8px' }}>
              <div style={{ marginBottom: '8px' }}>
                <Text>신고자: {report.reporterName}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>ID: {report.reportedBy}</Text>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text>신고 사유: </Text>
                <Tag color="red" icon={<WarningOutlined />}>{getReasonLabel(report.reportReason)}</Tag>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Text>신고 설명:</Text>
                <Paragraph style={{
                  marginTop: '8px', padding: '12px',
                  background: '#fff7e6', border: '1px solid #ffd591', borderRadius: '4px',
                }}>
                  {report.reportDescription}
                </Paragraph>
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                신고 일시: {dayjs(report.reportedAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </div>
          </div>

          <div>
            <Text strong>공개 상태</Text>
            <div style={{ marginTop: '8px' }}>
              {report.isVisible ? <Tag color="green">공개 중</Tag> : <Tag color="default">비공개</Tag>}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
