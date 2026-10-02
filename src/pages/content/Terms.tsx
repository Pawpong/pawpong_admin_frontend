import { useCallback, useState } from 'react';
import { Alert, Button, Form, Input, Modal, Select, Space, Switch, Table, Tag } from 'antd';
import { termsApi, type Terms, type TermsDraft } from '../../features/terms/api/termsApi';
import { useRemoteData } from '../../shared/hooks/useRemoteData';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';

const codes = [
  { value: 'service', label: '서비스 이용약관' },
  { value: 'privacy', label: '개인정보 처리방침' },
  { value: 'marketing', label: '마케팅 동의' },
  { value: 'age_14plus', label: '만 14세 이상 동의' },
  { value: 'counsel_privacy', label: '상담 개인정보 동의' },
];
const errorMessage = (error: unknown) =>
  (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
  '약관을 저장하지 못했습니다. 입력 내용과 권한을 확인해 주세요.';

function TermsEditor({ id, onClose, onSaved }: { id: string | null; onClose: () => void; onSaved: () => void }) {
  const detail = useRemoteData(useCallback(() => (id ? termsApi.detail(id) : Promise.resolve(null)), [id]));
  const [form] = Form.useForm<TermsDraft>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    let values: TermsDraft;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const content = { title: values.title.trim(), body: values.body.trim(), isRequired: values.isRequired };
      if (id) await termsApi.update(id, content);
      else await termsApi.create({ ...content, code: values.code, version: values.version.trim() });
      onSaved();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={id ? '약관 내용 수정' : '약관 버전 추가'}
      open
      width={760}
      onCancel={() => {
        if (!busy) onClose();
      }}
      onOk={() => void save()}
      confirmLoading={busy}
      okButtonProps={{ disabled: detail.loading || Boolean(detail.error) }}
      cancelButtonProps={{ disabled: busy }}
    >
      <LoadError error={detail.error} retry={detail.reload} />
      {error && <Alert type="error" message={error} showIcon />}
      {(!id || detail.data) && (
        <>
          <Alert
            type={detail.data?.isActive ? 'warning' : 'info'}
            showIcon
            message={
              detail.data?.isActive
                ? '현재 활성 버전입니다. 저장하면 현재 약관의 내용이 바뀝니다.'
                : '새 버전은 비활성 상태로 저장합니다. 검토 후 목록에서 활성화하세요.'
            }
          />
          <Form
            form={form}
            layout="vertical"
            disabled={busy}
            initialValues={detail.data ?? { code: 'service', isRequired: true }}
          >
            <Form.Item name="code" label="종류" rules={[{ required: true }]}>
              <Select options={codes} disabled={Boolean(id)} />
            </Form.Item>
            <Form.Item name="version" label="버전" rules={[{ required: true, whitespace: true }]}>
              <Input disabled={Boolean(id)} placeholder="예: 2026-10-03" />
            </Form.Item>
            <Form.Item name="title" label="제목" rules={[{ required: true, whitespace: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="body" label="본문" rules={[{ required: true, whitespace: true }]}>
              <Input.TextArea rows={14} placeholder="Markdown 또는 HTML 원문" />
            </Form.Item>
            <Form.Item name="isRequired" label="필수 동의" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}

export default function TermsPage() {
  const list = useRemoteData(termsApi.list);
  const [editing, setEditing] = useState<string | null>();
  const [action, setAction] = useState<{ kind: 'activate' | 'remove'; terms: Terms }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const execute = async () => {
    if (!action) return;
    setBusy(true);
    setError('');
    try {
      if (action.kind === 'activate') await termsApi.activate(action.terms.termsId);
      else await termsApi.remove(action.terms.termsId);
      setAction(undefined);
      list.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <PageHeading
        title="약관 버전 관리"
        description="약관 원문과 동의 종류를 관리하고, 검토한 버전을 활성화합니다."
        action={
          <Button type="primary" onClick={() => setEditing(null)}>
            버전 추가
          </Button>
        }
      />
      <LoadError error={list.error} retry={list.reload} />
      <Table<Terms>
        rowKey="termsId"
        loading={list.loading}
        dataSource={list.data}
        scroll={{ x: 850 }}
        columns={[
          {
            title: '종류',
            dataIndex: 'code',
            render: (code) => codes.find((item) => item.value === code)?.label ?? code,
          },
          { title: '버전', dataIndex: 'version' },
          { title: '제목', dataIndex: 'title' },
          { title: '동의', dataIndex: 'isRequired', render: (v) => (v ? '필수' : '선택') },
          {
            title: '상태',
            dataIndex: 'isActive',
            render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? '활성' : '비활성'}</Tag>,
          },
          {
            title: '관리',
            render: (_, terms) => (
              <Space>
                <Button onClick={() => setEditing(terms.termsId)}>조회·수정</Button>
                <Button
                  disabled={terms.isActive}
                  onClick={() => {
                    setError('');
                    setAction({ kind: 'activate', terms });
                  }}
                >
                  활성화
                </Button>
                <Button
                  danger
                  disabled={terms.isActive}
                  onClick={() => {
                    setError('');
                    setAction({ kind: 'remove', terms });
                  }}
                >
                  삭제
                </Button>
              </Space>
            ),
          },
        ]}
      />
      {editing !== undefined && (
        <TermsEditor key={editing ?? 'new'} id={editing} onClose={() => setEditing(undefined)} onSaved={list.reload} />
      )}
      <Modal
        title={action?.kind === 'activate' ? '약관 활성화' : '비활성 약관 삭제'}
        open={Boolean(action)}
        onCancel={() => {
          if (!busy) setAction(undefined);
        }}
        onOk={() => void execute()}
        confirmLoading={busy}
        cancelButtonProps={{ disabled: busy }}
        okButtonProps={{ danger: action?.kind === 'remove' }}
      >
        {error && <Alert type="error" message={error} showIcon />}
        <p>
          {action?.terms.title} · {action?.terms.version}
        </p>
        <p>
          {action?.kind === 'activate'
            ? '같은 종류의 기존 활성 버전은 비활성화됩니다.'
            : '이 비활성 버전을 삭제합니다. 활성 버전은 삭제할 수 없습니다.'}
        </p>
      </Modal>
    </div>
  );
}
