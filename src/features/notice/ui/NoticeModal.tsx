import { Modal, Form, Input, Switch, DatePicker } from 'antd';
import type { FormInstance } from 'antd';

import type { Notice } from '../api/noticeApi';

const { TextArea } = Input;

interface NoticeModalProps {
  visible: boolean;
  editingNotice: Notice | null;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
}

export function NoticeModal({ visible, editingNotice, form, onOk, onCancel }: NoticeModalProps) {
  return (
    <Modal
      title={editingNotice ? '공지사항 수정' : '공지사항 추가'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={800}
      okText={editingNotice ? '수정' : '추가'}
      cancelText="취소"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력해주세요' }]}>
          <Input placeholder="공지사항 제목을 입력하세요" maxLength={200} showCount />
        </Form.Item>
        <Form.Item name="content" label="내용" rules={[{ required: true, message: '내용을 입력해주세요' }]}>
          <TextArea rows={10} placeholder="공지사항 내용을 입력하세요" maxLength={5000} showCount />
        </Form.Item>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 24 }}>
          <Form.Item name="status" label="상태" initialValue="published">
            <Switch
              checkedChildren="게시"
              unCheckedChildren="임시저장"
              onChange={(checked) => form.setFieldValue('status', checked ? 'published' : 'draft')}
              checked={form.getFieldValue('status') === 'published'}
            />
          </Form.Item>
          <Form.Item name="isPinned" label="상단 고정" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="고정" unCheckedChildren="미고정" />
          </Form.Item>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item name="publishedAt" label="게시 시작일 (선택)">
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="시작일 선택" />
          </Form.Item>
          <Form.Item name="expiredAt" label="게시 종료일 (선택)">
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="종료일 선택" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
