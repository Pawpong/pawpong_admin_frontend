import { Modal, Button, Tag, Space } from 'antd';
import dayjs from 'dayjs';

import type { Notice } from '../api/noticeApi';

interface NoticeDetailModalProps {
  visible: boolean;
  notice: Notice | null;
  onClose: () => void;
}

export function NoticeDetailModal({ visible, notice, onClose }: NoticeDetailModalProps) {
  return (
    <Modal
      title="공지사항 상세"
      open={visible}
      onCancel={onClose}
      footer={[<Button key="close" onClick={onClose}>닫기</Button>]}
      width={800}
    >
      {notice && (
        <div style={{ padding: '24px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Tag color={notice.status === 'published' ? 'green' : 'orange'}>
                {notice.status === 'published' ? '게시' : '임시저장'}
              </Tag>
              {notice.isPinned && <Tag color="red">고정</Tag>}
            </Space>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{notice.title}</h2>
          <div style={{ marginBottom: 24, color: '#888' }}>
            <Space split="|">
              <span>{notice.authorName}</span>
              <span>{dayjs(notice.createdAt).format('YYYY-MM-DD HH:mm')}</span>
              <span>조회 {notice.viewCount}</span>
            </Space>
          </div>
          <div style={{ padding: 24, background: '#f5f5f5', borderRadius: 8, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {notice.content}
          </div>
        </div>
      )}
    </Modal>
  );
}
