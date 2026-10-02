import { useState } from 'react';
import {
  Alert,
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import { billingApi, type Product, type ProductInput } from '../api/billingApi';
import { billingError, newProduct, productInput } from '../model/catalog';
import { useRemoteData } from '../../../shared/hooks/useRemoteData';
import { LoadError } from '../../../shared/components/admin/PageHeading';

const productTypes = [
  { value: 'consumable', label: '충전형 (소모성)' },
  { value: 'subscription', label: '구독형' },
  { value: 'non_consumable', label: '일회 구매 (비소모성)' },
];
const required = [{ required: true, whitespace: true, message: '필수 항목입니다.' }];

export function ProductCatalog() {
  const { message } = App.useApp();
  const list = useRemoteData(billingApi.products);
  const [editing, setEditing] = useState<Product | null>();
  const [archive, setArchive] = useState<Product>();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm<ProductInput>();
  const open = (product: Product | null) => {
    form.resetFields();
    form.setFieldsValue(product ? { ...product, reason: '' } : structuredClone(newProduct));
    setError('');
    setEditing(product);
  };
  const save = async () => {
    let values: ProductInput;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const input = productInput(values);
      if (editing) {
        const { code, ...body } = input;
        await billingApi.updateProduct(code, body);
      } else await billingApi.createProduct(input);
      setEditing(undefined);
      list.reload();
      void message.success('상품을 저장했습니다.');
    } catch (e) {
      setError(billingError(e));
    } finally {
      setBusy(false);
    }
  };
  const doArchive = async () => {
    if (!archive || !reason.trim()) return;
    setBusy(true);
    setError('');
    try {
      await billingApi.archiveProduct(archive.code, reason.trim());
      setArchive(undefined);
      list.reload();
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
        message="가격과 결제 주기는 Apple·Google 스토어에서 관리합니다."
        description="여기서는 상품 종류, 스토어 ID, 지급 혜택과 판매 여부를 관리합니다. 새 상품은 판매 중지로 시작하며, 스토어 등록·심사가 끝난 상품만 등록 확인을 켜세요."
      />
      <Space>
        <Button type="primary" onClick={() => open(null)}>
          상품 등록
        </Button>
        <Button onClick={list.reload}>새로고침</Button>
      </Space>
      <LoadError error={list.error} retry={list.reload} />
      <Table<Product>
        rowKey="code"
        loading={list.loading}
        dataSource={list.data}
        scroll={{ x: 960 }}
        columns={[
          {
            title: '상품',
            dataIndex: 'name',
            render: (name, p) => (
              <>
                <strong>{name}</strong>
                <Typography.Paragraph type="secondary">{p.code}</Typography.Paragraph>
              </>
            ),
          },
          { title: '종류', dataIndex: 'type', render: (v) => productTypes.find((t) => t.value === v)?.label },
          {
            title: '혜택',
            render: (_, p) =>
              p.benefits.map((b, i) => (
                <div key={i}>
                  {b.type}
                  {b.creditKey ? ` · ${b.creditKey}` : ''} × {b.quantity}
                </div>
              )),
          },
          {
            title: '스토어 ID',
            render: (_, p) => (
              <>
                <div>iOS: {p.storeProductIds.ios || '—'}</div>
                <div>Android: {p.storeProductIds.android || '—'}</div>
              </>
            ),
          },
          {
            title: '상태',
            render: (_, p) => (
              <Tag color={p.saleEnabled ? 'green' : 'default'}>
                {p.archived ? '보관됨' : p.saleEnabled ? '판매 중' : p.active ? '판매 중지' : '비활성'}
              </Tag>
            ),
          },
          {
            title: '관리',
            render: (_, p) => (
              <Space>
                <Button disabled={p.archived} onClick={() => open(p)}>
                  수정
                </Button>
                <Button
                  danger
                  disabled={p.archived}
                  onClick={() => {
                    setArchive(p);
                    setReason('');
                    setError('');
                  }}
                >
                  보관
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? '상품 수정' : '상품 등록'}
        open={editing !== undefined}
        width={760}
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
            name="code"
            label="상품 코드"
            rules={[
              ...required,
              {
                pattern: /^[a-z][a-z0-9_-]{0,99}$/,
                message: '소문자로 시작하는 영문·숫자·밑줄·하이픈 코드를 입력하세요.',
              },
            ]}
          >
            <Input disabled={Boolean(editing)} maxLength={100} />
          </Form.Item>
          <Form.Item name="name" label="상품명" rules={required}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="type" label="종류" rules={[{ required: true }]}>
            <Select options={productTypes} />
          </Form.Item>
          <Form.Item name={['storeProductIds', 'ios']} label="App Store 상품 ID">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name={['storeProductIds', 'android']} label="Google Play 상품 ID">
            <Input maxLength={100} />
          </Form.Item>
          <Form.List name="benefits">
            {(fields, { add, remove }) => (
              <>
                <Typography.Paragraph strong>지급 혜택</Typography.Paragraph>
                {fields.map((field) => (
                  <Space key={field.key} align="start" wrap>
                    <Form.Item
                      name={[field.name, 'type']}
                      label="혜택 유형"
                      rules={[
                        ...required,
                        { pattern: /^[a-z][a-z0-9_]{0,63}$/, message: '소문자·숫자·밑줄 64자 이내로 입력하세요.' },
                      ]}
                    >
                      <Input placeholder="credits" maxLength={64} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'creditKey']} label="이용권 코드 (credits 필수)">
                      <Input placeholder="playground" maxLength={64} />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'quantity']}
                      label="지급 수량"
                      rules={[{ required: true, type: 'integer', min: 1, max: 1000000 }]}
                    >
                      <InputNumber min={1} max={1000000} precision={0} />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>
                      혜택 제거
                    </Button>
                  </Space>
                ))}
                <Button
                  disabled={fields.length >= 20}
                  onClick={() => add({ type: 'credits', creditKey: 'playground', quantity: 1 })}
                >
                  혜택 추가
                </Button>
              </>
            )}
          </Form.List>
          <Typography.Paragraph type="secondary">
            구독은 스토어의 실제 결제 기간마다 지급합니다. 이미 판매된 상품의 종류·스토어 ID·혜택은 서버에서 변경을
            제한합니다.
          </Typography.Paragraph>
          <Space wrap>
            <Form.Item name={['storeRegistered', 'ios']} label="App Store 등록 확인" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name={['storeRegistered', 'android']} label="Google Play 등록 확인" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="active" label="상품 활성화" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="saleEnabled" label="판매 허용" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
          <Form.Item name="reason" label="변경 사유" rules={required}>
            <Input.TextArea maxLength={500} showCount rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="상품 보관"
        open={Boolean(archive)}
        onOk={() => void doArchive()}
        onCancel={() => {
          if (!busy) setArchive(undefined);
        }}
        confirmLoading={busy}
        okButtonProps={{ danger: true, disabled: !reason.trim() }}
        cancelButtonProps={{ disabled: busy }}
      >
        <p>{archive?.name}의 판매를 중지하고 보관합니다. 구매 원장과 이전 구매 복구는 유지됩니다.</p>
        {error && <Alert type="error" message={error} />}
        <Input.TextArea
          aria-label="보관 사유"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          placeholder="보관 사유"
          disabled={busy}
        />
      </Modal>
    </Space>
  );
}
