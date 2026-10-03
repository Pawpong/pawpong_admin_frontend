import { useState } from 'react';
import { Alert, Button, Form, Input, InputNumber, Modal, Space, Switch, Table, Tag } from 'antd';
import { billingApi, type FeaturePolicy } from '../api/billingApi';
import { billingError } from '../model/catalog';
import { useRemoteData } from '../../../shared/hooks/useRemoteData';
import { LoadError } from '../../../shared/components/admin/PageHeading';

type PolicyInput = FeaturePolicy & { reason: string };
export function FeaturePolicies() {
  const policy = useRemoteData(billingApi.policy);
  const [editing, setEditing] = useState<FeaturePolicy | null>();
  const [form] = Form.useForm<PolicyInput>();
  const featureKey = Form.useWatch('featureKey', form);
  const supported = policy.data?.implementedFeatures.includes(featureKey) ?? false;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const open = (value: FeaturePolicy | null) => {
    form.resetFields();
    form.setFieldsValue(
      value
        ? { ...value, reason: '' }
        : { featureKey: '', creditKey: 'playground', dailyFreeLimit: 0, creditCost: 1, enabled: false, reason: '' },
    );
    setError('');
    setEditing(value);
  };
  const save = async () => {
    let input: PolicyInput;
    try {
      input = await form.validateFields();
    } catch {
      return;
    }
    const { featureKey: key, reason, ...body } = input;
    setBusy(true);
    setError('');
    try {
      await billingApi.savePolicy(key.trim(), {
        ...body,
        creditKey: body.creditKey.trim(),
        enabled: supported && body.enabled,
        reason: reason.trim(),
      });
      setEditing(undefined);
      policy.reload();
    } catch (e) {
      setError(billingError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="기능별 무료 횟수와 이용권 비용을 설정합니다."
        description="이 정책의 활성화는 무료 이용을 포함한 기능 사용 설정이며 상품 판매를 시작하지 않습니다. 같은 이용권 코드는 공통 잔액을 사용하며, 무료분은 한국 시간 자정에 초기화됩니다. 새 기능은 서버 소비 처리가 구현된 뒤 활성화할 수 있습니다."
      />
      <Space>
        <Button type="primary" onClick={() => open(null)}>
          기능 정책 추가
        </Button>
        <Button onClick={policy.reload}>새로고침</Button>
      </Space>
      <LoadError error={policy.error} retry={policy.reload} />
      <Table<FeaturePolicy>
        rowKey="featureKey"
        loading={policy.loading}
        dataSource={policy.data?.features}
        scroll={{ x: 700 }}
        columns={[
          { title: '기능 코드', dataIndex: 'featureKey' },
          { title: '이용권 코드', dataIndex: 'creditKey' },
          { title: '1회 비용', dataIndex: 'creditCost' },
          { title: '일일 무료 횟수', dataIndex: 'dailyFreeLimit' },
          {
            title: '상태',
            render: (_, value) => (
              <Tag color={value.enabled ? 'green' : 'default'}>{value.enabled ? '활성' : '중지'}</Tag>
            ),
          },
          { title: '관리', render: (_, value) => <Button onClick={() => open(value)}>수정</Button> },
        ]}
      />
      <Modal
        title="기능별 이용 정책"
        open={editing !== undefined}
        onOk={() => void save()}
        onCancel={() => {
          if (!busy) setEditing(undefined);
        }}
        confirmLoading={busy}
        cancelButtonProps={{ disabled: busy }}
        destroyOnHidden
      >
        {error && <Alert type="error" showIcon message={error} />}
        <Form form={form} layout="vertical" disabled={busy}>
          <Form.Item
            name="featureKey"
            label="기능 코드"
            rules={[
              {
                required: true,
                pattern: /^[a-z][a-z0-9_]{0,63}$/,
                message: '소문자로 시작하는 영문·숫자·밑줄 코드를 입력하세요.',
              },
            ]}
          >
            <Input disabled={Boolean(editing)} maxLength={64} />
          </Form.Item>
          <Form.Item
            name="creditKey"
            label="사용할 이용권 코드"
            rules={[
              {
                required: true,
                pattern: /^[a-z][a-z0-9_]{0,63}$/,
                message: '소문자로 시작하는 영문·숫자·밑줄 코드를 입력하세요.',
              },
            ]}
          >
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item
            name="creditCost"
            label="1회 이용권 비용"
            rules={[{ required: true, type: 'integer', min: 1, max: 1000000 }]}
          >
            <InputNumber min={1} max={1000000} precision={0} />
          </Form.Item>
          <Form.Item
            name="dailyFreeLimit"
            label="일일 무료 횟수"
            rules={[{ required: true, type: 'integer', min: 0, max: 1000 }]}
          >
            <InputNumber min={0} max={1000} precision={0} />
          </Form.Item>
          <Form.Item
            name="enabled"
            label="기능 활성화"
            valuePropName="checked"
            extra={supported ? undefined : '서버 소비 기능이 연결되지 않아 활성화할 수 없습니다.'}
          >
            <Switch disabled={!supported || busy} />
          </Form.Item>
          <Form.Item name="reason" label="변경 사유" rules={[{ required: true, whitespace: true }]}>
            <Input.TextArea maxLength={500} rows={3} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
