import { useState } from 'react';
import { App, Alert, Button, Card, Form, Input, Select } from 'antd';
import { operationsApi } from '../../features/operations/api/operationsApi';
import { PageHeading } from '../../shared/components/admin/PageHeading';

export default function ContestModeration() {
  const { message, modal } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState('');
  const [form] = Form.useForm<{ entryId: string; status: 'hidden' | 'deleted' }>();
  return (
    <div>
      <PageHeading title="콘테스트 항목 관리" description="검토한 콘테스트 항목을 숨기거나 삭제 상태로 변경하세요." />
      <Card className="form-panel" title="항목 상태 변경">
        <p className="muted mb-6">
          관리할 항목의 ID를 입력해주세요. 숨김 또는 삭제 처리한 항목은 사용자에게 노출되지 않습니다.
        </p>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'hidden' }}
          onFinish={(values) =>
            modal.confirm({
              title: values.status === 'hidden' ? '이 항목을 숨길까요?' : '이 항목을 삭제 처리할까요?',
              content: `항목 ID: ${values.entryId}`,
              okText: '상태 변경',
              cancelText: '취소',
              okButtonProps: { danger: true },
              onOk: async () => {
                setSaving(true);
                try {
                  await operationsApi.updateContestEntry(values.entryId.trim(), { status: values.status });
                  setCompleted(`${values.entryId} · ${values.status === 'hidden' ? '숨김' : '삭제'} 처리 완료`);
                  message.success('항목 상태를 변경했습니다.');
                  form.resetFields();
                } catch (error) {
                  message.error('항목 상태 변경에 실패했습니다.');
                  throw error;
                } finally {
                  setSaving(false);
                }
              },
            })
          }
        >
          <Form.Item
            name="entryId"
            label="콘테스트 항목 ID"
            rules={[{ required: true, pattern: /^[a-f\d]{24}$/i, message: '24자리 항목 ID를 입력해주세요.' }]}
          >
            <Input placeholder="항목 ID 입력" />
          </Form.Item>
          <Form.Item name="status" label="변경할 상태" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'hidden', label: '숨김' },
                { value: 'deleted', label: '삭제 처리' },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            상태 변경
          </Button>
        </Form>
        {completed && <Alert className="mt-4" type="success" message={completed} showIcon />}
      </Card>
    </div>
  );
}
