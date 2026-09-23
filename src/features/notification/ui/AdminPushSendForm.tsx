import { useState } from 'react';
import { Button, Card, Divider, Form, Input, Radio, Space, Statistic, Tag, Typography } from 'antd';
import { SearchOutlined, SendOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

import { useAdminPushSend } from '../hooks/useAdminPushSend';
import type { AdminPushIndividualRole, AdminPushTargetType, SendAdminPushRequest } from '../api/notificationAdminApi';
import { UserPickerModal, type PickedUser } from './UserPickerModal';
import { isAppDestination } from '../../deep-link/model/deepLinkPolicy';

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
 * 발송 대상 3가지:
 *   - 입양자 전체 (all_adopters)
 *   - 브리더 전체 (all_breeders)
 *   - 개별 발송 (individual + role + userId)
 *
 * 발송 후 결과 카운트(대상자/알림 doc/토큰 시도/성공/실패/invalid)를 카드로 노출한다.
 */
export function AdminPushSendForm() {
  const location = useLocation();
  const incomingUrl: unknown = location.state?.deepLinkUrl;
  const [form] = Form.useForm<FormValues>();
  const targetType = Form.useWatch('targetType', form);
  const selectedRole = Form.useWatch('role', form);
  const { submitting, lastResult, send } = useAdminPushSend();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedUser, setPickedUser] = useState<PickedUser | null>(null);

  const handlePickUser = (user: PickedUser) => {
    setPickedUser(user);
    form.setFieldsValue({ role: user.role, userId: user.userId });
    setPickerOpen(false);
  };

  const handleClearPickedUser = () => {
    setPickedUser(null);
    form.setFieldsValue({ role: undefined, userId: undefined });
  };

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
          initialValues={{
            targetType: 'individual',
            targetUrl: typeof incomingUrl === 'string' && isAppDestination(incomingUrl) ? incomingUrl : undefined,
          }}
          disabled={submitting}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="발송 대상"
            name="targetType"
            rules={[{ required: true, message: '발송 대상을 선택해주세요.' }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="individual">개별 발송</Radio.Button>
              <Radio.Button value="all_adopters">입양자 전체</Radio.Button>
              <Radio.Button value="all_breeders">브리더 전체</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {targetType === 'individual' && (
            <Form.Item
              label="대상 사용자"
              required
              extra="검색 버튼을 눌러 대상 사용자를 닉네임/이메일로 찾아 선택하세요."
            >
              {pickedUser ? (
                <Card size="small" style={{ background: '#fafafa' }}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Space wrap>
                      <Tag color={pickedUser.role === 'adopter' ? 'blue' : 'purple'}>
                        {pickedUser.role === 'adopter' ? '입양자' : '브리더'}
                      </Tag>
                      <Typography.Text strong>
                        {pickedUser.nickname || pickedUser.userName || '(이름 없음)'}
                      </Typography.Text>
                    </Space>
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                      이메일: {pickedUser.emailAddress || '-'}
                      {pickedUser.phoneNumber ? ` · 휴대전화: ${pickedUser.phoneNumber}` : ''}
                    </Typography.Text>
                    <Typography.Text code style={{ fontSize: 11 }}>
                      userId: {pickedUser.userId}
                    </Typography.Text>
                    <Space>
                      <Button size="small" onClick={() => setPickerOpen(true)}>
                        다른 사용자 선택
                      </Button>
                      <Button size="small" danger onClick={handleClearPickedUser}>
                        선택 해제
                      </Button>
                    </Space>
                  </Space>
                </Card>
              ) : (
                <Button icon={<SearchOutlined />} onClick={() => setPickerOpen(true)}>
                  사용자 찾기
                </Button>
              )}
              {/* role / userId 는 hidden field 로 폼에 유지 */}
              <Form.Item
                name="role"
                hidden
                noStyle
                rules={[{ required: true, message: '대상 사용자를 선택해주세요.' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="userId"
                hidden
                noStyle
                rules={[{ required: true, message: '대상 사용자를 선택해주세요.' }]}
              >
                <Input />
              </Form.Item>
            </Form.Item>
          )}

          <Form.Item
            label="제목"
            name="title"
            rules={[
              { required: true, whitespace: true, message: '제목을 입력해주세요.' },
              { max: 100, message: '제목은 100자 이내로 입력해주세요.' },
            ]}
          >
            <Input placeholder="예: 추석 연휴 안내" maxLength={100} showCount allowClear />
          </Form.Item>

          <Form.Item
            label="본문"
            name="body"
            rules={[
              { required: true, whitespace: true, message: '본문을 입력해주세요.' },
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
            normalize={(value: string) => value.trim()}
            rules={[
              { max: 500, message: 'URL은 500자 이내로 입력해주세요.' },
              {
                validator: (_, value) =>
                  !value || isAppDestination(value)
                    ? Promise.resolve()
                    : Promise.reject(new Error('포퐁 사용자 앱 경로 또는 pawpong.kr의 HTTPS 링크를 입력해주세요.')),
              },
            ]}
            extra={
              <span>
                포퐁 사용자 앱 경로(예: /explore) 또는 공유 링크를 입력하세요. 비워두면 앱 홈으로 이동합니다.{' '}
                <Link to="/content/deep-links">딥링크 관리에서 URL 복사</Link>
              </span>
            }
          >
            <Input placeholder="https://pawpong.kr/l/autumn-news 또는 /explore" allowClear />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={submitting}
              disabled={targetType === 'individual' && !pickedUser}
              size="large"
            >
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
            <Statistic title="앱 알림 저장" value={lastResult.notificationsCreated} suffix="건" />
            <Statistic title="FCM 토큰 시도" value={lastResult.pushTokensTargeted} suffix="개" />
            <Statistic
              title="FCM 접수 성공"
              value={lastResult.pushSuccess}
              suffix="개"
              valueStyle={{ color: '#3f8600' }}
            />
            <Statistic title="실패" value={lastResult.pushFailed} suffix="개" valueStyle={{ color: '#cf1322' }} />
            <Statistic
              title="무효 토큰"
              value={lastResult.invalidTokens}
              suffix="개"
              valueStyle={{ color: '#d4b106' }}
            />
          </Space>
          <Divider style={{ margin: '16px 0' }} />
          <div style={{ color: 'rgba(0,0,0,0.55)', fontSize: 12 }}>
            FCM 접수 성공은 기기 수신·표시를 보장하지 않습니다. 기기 알림 권한과 네트워크 상태를 함께 확인하세요.
            {lastResult.pushTokensTargeted === 0 ? ' 등록된 푸시 토큰이 없어 기기 푸시는 발송되지 않았습니다.' : ''}
          </div>
        </Card>
      )}

      {pickerOpen ? (
        <UserPickerModal
          open
          initialRole={selectedRole ?? 'adopter'}
          onCancel={() => setPickerOpen(false)}
          onPick={handlePickUser}
        />
      ) : null}
    </Space>
  );
}
