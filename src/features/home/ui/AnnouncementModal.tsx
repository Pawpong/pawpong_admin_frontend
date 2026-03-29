import { Modal, Form, Input, Switch } from 'antd';
import type { FormInstance } from 'antd';

import type { Announcement } from '../api/announcementApi';

interface AnnouncementModalProps {
  visible: boolean;
  editingAnnouncement: Announcement | null;
  form: FormInstance;
  submitting: boolean;
  onOk: () => void;
  onCancel: () => void;
}

export function AnnouncementModal({ visible, editingAnnouncement, form, submitting, onOk, onCancel }: AnnouncementModalProps) {
  return (
    <Modal
      title={editingAnnouncement ? '공지사항 수정' : '공지사항 추가'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={700}
      okText={editingAnnouncement ? '수정' : '생성'}
      cancelText="취소"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력해주세요' }]}>
          <Input placeholder="공지사항 제목" />
        </Form.Item>
        <Form.Item name="content" label="내용" rules={[{ required: true, message: '내용을 입력해주세요' }]}>
          <Input.TextArea placeholder="공지사항 내용" rows={6} showCount maxLength={1000} />
        </Form.Item>
        <Form.Item name="order" label="정렬 순서" rules={[{ required: true, message: '정렬 순서를 입력해주세요' }]}>
          <Input type="number" placeholder="0부터 시작 (낮을수록 먼저 표시)" />
        </Form.Item>
        <Form.Item name="isActive" label="활성화 여부" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
