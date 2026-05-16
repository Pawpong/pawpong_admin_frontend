import { Modal, Button, Descriptions } from 'antd';
import type { BreederReport } from '../../../shared/types/api.types';
import { getReportTypeText, getStatusTag } from './BreederReportTable';

interface BreederReportDetailModalProps {
  visible: boolean;
  report: BreederReport | null;
  onClose: () => void;
  onAction: (report: BreederReport, type: 'resolve' | 'reject') => void;
}

export function BreederReportDetailModal({ visible, report, onClose, onAction }: BreederReportDetailModalProps) {
  return (
    <Modal
      title="신고 상세 정보"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>닫기</Button>,
        report?.status === 'pending' && (
          <Button
            key="reject"
            onClick={() => { onClose(); onAction(report, 'reject'); }}
          >
            반려
          </Button>
        ),
        report?.status === 'pending' && (
          <Button
            key="resolve"
            danger
            onClick={() => { onClose(); onAction(report, 'resolve'); }}
          >
            승인 (제재)
          </Button>
        ),
      ]}
      width="100%"
      style={{ maxWidth: '700px', top: 20 }}
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
    >
      {report && (
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="신고 대상 브리더" span={2}>
            <strong>{report.targetName}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="신고 ID" span={2}>{report.reportId}</Descriptions.Item>
          <Descriptions.Item label="신고일" span={2}>
            {new Date(report.reportedAt).toLocaleString('ko-KR')}
          </Descriptions.Item>
          <Descriptions.Item label="신고 사유" span={2}>{getReportTypeText(report.type)}</Descriptions.Item>
          <Descriptions.Item label="상세 설명" span={2}>{report.description || '없음'}</Descriptions.Item>
          <Descriptions.Item label="상태" span={2}>{getStatusTag(report.status)}</Descriptions.Item>
          {report.adminNotes && (
            <Descriptions.Item label="관리자 조치" span={2}>{report.adminNotes}</Descriptions.Item>
          )}
        </Descriptions>
      )}
    </Modal>
  );
}
