import { Button, Card, Divider, Form, Input, Radio, Select, Space, Statistic, Tag } from 'antd';
import { SendOutlined } from '@ant-design/icons';

import { useAdminPushSend } from '../hooks/useAdminPushSend';
import type {
  AdminPushIndividualRole,
  AdminPushTargetType,
  SendAdminPushRequest,
} from '../api/notificationAdminApi';

interface FormValues {
  targetType: AdminPushTargetType;
  role?: AdminPushIndividualRole;
  userId?: string;
  title: string;
  body: string;
  targetUrl?: string;
}

/**
 * 어드민 푸시 발송 폼.
 *
 * 발송 대상 4가지:
 *   - 입양자 전체 (all_adopters)
 *   - 브리더 전체 (all_breeders)
 *   - 개별 발송 (individual + role + userId)
 *
 * 발송 후 결과 카운트(대상자/알림 doc/토큰 시도/성공/실패/invalid)를 카드로 노출한다.
 */
export function AdminPushSendForm() {
  const [form] = Form.useForm<FormValues>();
  const targetType = Form.useWatch('targetType', form);
  const { submitting, lastResult, send } = useAdminPushSend();

  const handleSubmit = async (values: FormValues) => {
    const payload: SendAdminPushRequest = {
      target:
        values.targetType === 'individual'
          ? { type: 'individual', role: values.role, userId: values.userId?.trim() }
          : { type: values.targetType },
      title: values.title.trim(),
      body: values.body.trim(),
      targetUrl: values.targetUrl?.trim() || undefined,
    };
    await send(payload);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="푸시 발송">
        <Form<FormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ targetType: 'all_adopters' }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="발송 대상"
            name="targetType"
            rules={[{ required: true, message: '발송 대상을 선택해주세요.' }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="all_adopters">입양자 전체</Radio.Button>
              <Radio.Button value="all_breeders">브리더 전체</Radio.Button>
              <Radio.Button value="individual">개별 발송</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {targetType === 'individual' && (
            <Space size="middle" style={{ width: '100%' }} wrap>
              <Form.Item
                label="대상 역할"
                name="role"
                rules={[{ required: true, message: '역할을 선택해주세요.' }]}
                style={{ minWidth: 180 }}
              >
                <Select
                  placeholder="역할 선택"
                  options={[
                    { value: 'adopter', label: '입양자(adopter)' },
                    { value: 'breeder', label: '브리더(breeder)' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="대상 userId"
                name="userId"
                rules={[
                  { required: true, message: 'userId 를 입력해주세요.' },
                  { min: 8, message: 'userId 가 너무 짧습니다.' },
                ]}
                style={{ minWidth: 320, flex: 1 }}
              >
                <Input placeholder="MongoDB ObjectId" allowClear />
              </Form.Item>
            </Space>
          )}

          <Form.Item
            label="제목"
            name="title"
            rules={[
              { required: true, message: '제목을 입력해주세요.' },
              { max: 100, message: '제목은 100자 이내로 입력해주세요.' },
            ]}
          >
            <Input placeholder="예: 추석 연휴 안내" maxLength={100} showCount allowClear />
          </Form.Item>

          <Form.Item
            label="본문"
            name="body"
            rules={[
              { required: true, message: '본문을 입력해주세요.' },
              { max: 500, message: '본문은 500자 이내로 입력해주세요.' },
            ]}
          >
            <Input.TextArea
              placeholder="푸시 본문을 입력해주세요."
              maxLength={500}
              showCount
              autoSize={{ minRows: 4, maxRows: 10 }}
            />
          </Form.Item>

          <Form.Item
            label="클릭 시 이동 URL (선택)"
            name="targetUrl"
            rules={[{ max: 500, message: 'URL 은 500자 이내로 입력해주세요.' }]}
            extra="deep link 또는 어드민 내부 경로. 비워두면 푸시 클릭 시 앱 기본 화면으로 이동합니다."
          >
            <Input placeholder="/notifications 또는 https://..." allowClear />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submitting} size="large">
              발송
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {lastResult && (
        <Card
          title={
            <Space>
              <span>최근 발송 결과</span>
              <Tag color="blue">대상 {lastResult.recipients}명</Tag>
            </Space>
          }
        >
          <Space size="large" wrap>
            <Statistic title="알림 doc 저장" value={lastResult.notificationsCreated} suffix="건" />
            <Statistic title="FCM 토큰 시도" value={lastResult.pushTokensTargeted} suffix="개" />
            <Statistic
              title="성공"
              value={lastResult.pushSuccess}
              suffix="개"
              valueStyle={{ color: '#3f8600' }}
            />
            <Statistic
              title="실패"
              value={lastResult.pushFailed}
              suffix="개"
              valueStyle={{ color: '#cf1322' }}
            />
            <Statistic
              title="invalid 토큰"
              value={lastResult.invalidTokens}
              suffix="개"
              valueStyle={{ color: '#d4b106' }}
            />
          </Space>
          <Divider style={{ margin: '16px 0' }} />
          <div style={{ color: 'rgba(0,0,0,0.55)', fontSize: 12 }}>
            invalid 토큰은 본 발송에서 자동 정리되지 않습니다. 후속 cleanup 작업에서 처리됩니다.
          </div>
        </Card>
      )}
    </Space>
  );
}
