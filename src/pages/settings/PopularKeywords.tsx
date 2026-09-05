import { useCallback, useState } from 'react';
import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Tag } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { operationsApi } from '../../features/operations/api/operationsApi';
import type {
  PopularKeywordResponse,
  CreatePopularKeywordRequest,
} from '../../features/operations/api/operations.types';
import { useRemoteData } from '../../shared/hooks/useRemoteData';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';

export default function PopularKeywords() {
  const { message } = App.useApp();
  const list = useRemoteData(useCallback(() => operationsApi.getKeywords(), []));
  const [editing, setEditing] = useState<PopularKeywordResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<CreatePopularKeywordRequest>();
  const edit = async (id: string) => {
    try {
      const item = await operationsApi.getKeyword(id);
      setEditing(item);
      form.setFieldsValue(item);
      setOpen(true);
    } catch {
      message.error('검색어 상세 조회에 실패했습니다.');
    }
  };
  const save = async (values: CreatePopularKeywordRequest) => {
    setSaving(true);
    try {
      const data = { keyword: values.keyword.trim(), rank: values.rank, isActive: values.isActive };
      if (editing) await operationsApi.updateKeyword(editing.keywordId, data);
      else await operationsApi.createKeyword(data);
      setOpen(false);
      list.reload();
      message.success('검색어를 저장했습니다.');
    } catch {
      message.error('검색어 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      <PageHeading
        title="인기 검색어"
        description="탐색 화면에 보여줄 검색어와 노출 순서를 관리하세요."
        action={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={list.reload}>
              새로고침
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditing(null);
                form.resetFields();
                setOpen(true);
              }}
            >
              검색어 추가
            </Button>
          </Space>
        }
      />
      <LoadError error={list.error} retry={list.reload} />
      <Table
        rowKey="keywordId"
        loading={list.loading}
        dataSource={list.data}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        scroll={{ x: 650 }}
        columns={[
          {
            title: '노출 순서',
            dataIndex: 'rank',
            width: 110,
            sorter: (a, b) => a.rank - b.rank,
            defaultSortOrder: 'ascend',
          },
          { title: '검색어', dataIndex: 'keyword', render: (value) => <strong>{value}</strong> },
          {
            title: '노출 상태',
            dataIndex: 'isActive',
            render: (active) => <Tag color={active ? 'green' : 'default'}>{active ? '노출 중' : '비노출'}</Tag>,
          },
          {
            title: '관리',
            render: (_, item) => (
              <Space>
                <Button size="small" onClick={() => edit(item.keywordId)}>
                  수정
                </Button>
                <Popconfirm
                  title={`“${item.keyword}” 검색어를 삭제할까요?`}
                  onConfirm={async () => {
                    try {
                      await operationsApi.deleteKeyword(item.keywordId);
                      list.reload();
                    } catch {
                      message.error('검색어 삭제에 실패했습니다.');
                    }
                  }}
                >
                  <Button size="small" danger>
                    삭제
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        open={open}
        title={editing ? '검색어 수정' : '검색어 추가'}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="저장"
        cancelText="취소"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={save} initialValues={{ rank: 0, isActive: true }}>
          <Form.Item
            name="keyword"
            label="검색어"
            rules={[{ required: true, whitespace: true, message: '검색어를 입력해주세요.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="rank" label="노출 순서">
            <InputNumber min={0} precision={0} />
          </Form.Item>
          <Form.Item name="isActive" label="노출 여부" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
