import { useCallback, useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Spin, Tag } from 'antd';
import { ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { operationsApi, type EmailType } from '../../features/operations/api/operationsApi';
import type {
  NotificationEmailPreviewCatalogResponse,
  NotificationEmailPreviewResponse,
} from '../../features/operations/api/operations.types';
import { useRemoteData } from '../../shared/hooks/useRemoteData';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';

const templates: {
  type: EmailType;
  key: keyof NotificationEmailPreviewCatalogResponse;
  label: string;
  description: string;
}[] = [
  { type: 'breeder-approval', key: 'breederApproval', label: '브리더 승인', description: '입점 승인 안내' },
  { type: 'breeder-rejection', key: 'breederRejection', label: '브리더 반려', description: '반려 사유 및 재제출 안내' },
  { type: 'new-application', key: 'newApplication', label: '새 상담 신청', description: '브리더에게 상담 신청 알림' },
  { type: 'document-reminder', key: 'documentReminder', label: '서류 제출 독촉', description: '미제출 서류 제출 안내' },
  {
    type: 'application-confirmation',
    key: 'applicationConfirmation',
    label: '상담 신청 확인',
    description: '입양자에게 접수 확인 안내',
  },
  { type: 'new-review', key: 'newReview', label: '새 후기', description: '브리더에게 후기 등록 알림' },
];
interface Values {
  email: string;
  breederName: string;
  applicantName?: string;
  rejectionReasons?: string;
}
export default function EmailTemplates() {
  const { message, modal } = App.useApp();
  const [type, setType] = useState<EmailType>('breeder-approval');
  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<NotificationEmailPreviewResponse>();
  const [form] = Form.useForm<Values>();
  const catalog = useRemoteData(useCallback(() => operationsApi.getEmailCatalog(), []));
  const preview = useRemoteData(useCallback(() => operationsApi.renderEmail(type), [type]));
  const current = templates.find((item) => item.type === type)!;
  const send = (values: Values) =>
    modal.confirm({
      title: '테스트 이메일을 발송할까요?',
      content: `${values.email} 주소로 “${current.label}” 이메일을 실제 발송합니다.`,
      okText: '발송',
      cancelText: '취소',
      onOk: async () => {
        setSending(true);
        try {
          const data = { email: values.email.trim(), breederName: values.breederName.trim() };
          let sent: NotificationEmailPreviewResponse;
          switch (type) {
            case 'breeder-approval':
              sent = await operationsApi.sendApprovalEmail(data);
              break;
            case 'breeder-rejection':
              sent = await operationsApi.sendRejectionEmail({
                ...data,
                rejectionReasons: (values.rejectionReasons || '')
                  .split('\n')
                  .map((reason) => reason.trim())
                  .filter(Boolean),
              });
              break;
            case 'new-application':
              sent = await operationsApi.sendApplicationEmail(data);
              break;
            case 'document-reminder':
              sent = await operationsApi.sendReminderEmail(data);
              break;
            case 'application-confirmation':
              sent = await operationsApi.sendConfirmationEmail({
                ...data,
                applicantName: values.applicantName!.trim(),
              });
              break;
            case 'new-review':
              sent = await operationsApi.sendReviewEmail(data);
              break;
          }
          setResult(sent);
          setSendOpen(false);
          message[sent.sent ? 'success' : 'warning'](
            sent.sent ? '이메일 발송을 요청했습니다.' : '이메일이 발송되지 않았습니다.',
          );
        } catch (error) {
          message.error('이메일 발송에 실패했습니다.');
          throw error;
        } finally {
          setSending(false);
        }
      },
    });
  return (
    <div>
      <PageHeading
        title="이메일 템플릿"
        description="실제 서비스 이메일을 미리 보고 지정한 주소로 테스트 발송하세요."
        action={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              preview.reload();
              catalog.reload();
            }}
          >
            새로고침
          </Button>
        }
      />
      <LoadError error={catalog.error} retry={catalog.reload} />
      <div className="email-workspace">
        <div className="template-list">
          {templates.map((item) => (
            <button
              className={type === item.type ? 'selected' : ''}
              key={item.type}
              onClick={() => {
                setType(item.type);
                setResult(undefined);
              }}
            >
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>
        <Card
          title={catalog.data?.[current.key]?.subject || current.label}
          extra={
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => {
                form.resetFields();
                setSendOpen(true);
              }}
            >
              테스트 발송
            </Button>
          }
        >
          <LoadError error={preview.error} retry={preview.reload} />
          {preview.loading ? (
            <Spin />
          ) : (
            preview.data && (
              <iframe
                title={`${current.label} 이메일 미리보기`}
                className="email-preview"
                sandbox=""
                srcDoc={preview.data}
              />
            )
          )}
          {result && (
            <p>
              <Tag color={result.sent ? 'green' : 'orange'}>{result.sent ? '발송 요청 완료' : '미발송'}</Tag>
              {result.recipient}
            </p>
          )}
        </Card>
      </div>
      <Modal
        title={`${current.label} 테스트 발송`}
        open={sendOpen}
        onCancel={() => setSendOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={sending}
        okText="발송 확인"
        cancelText="취소"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={send}>
          <Form.Item
            name="email"
            label="수신 이메일"
            rules={[{ required: true, type: 'email', message: '유효한 이메일을 입력해주세요.' }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            name="breederName"
            label="브리더 이름"
            rules={[{ required: true, whitespace: true, message: '브리더 이름을 입력해주세요.' }]}
          >
            <Input />
          </Form.Item>
          {type === 'application-confirmation' && (
            <Form.Item
              name="applicantName"
              label="입양자 이름"
              rules={[{ required: true, whitespace: true, message: '입양자 이름을 입력해주세요.' }]}
            >
              <Input />
            </Form.Item>
          )}
          {type === 'breeder-rejection' && (
            <Form.Item
              name="rejectionReasons"
              label="반려 사유 (한 줄에 하나씩)"
              rules={[{ required: true, whitespace: true, message: '반려 사유를 입력해주세요.' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
