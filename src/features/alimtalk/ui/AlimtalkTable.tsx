import { Table, Tag, Space, Button, Switch, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import type { AlimtalkTemplate, AlimtalkButton } from '../../../shared/types/api.types';

/** 검수 상태 설정 */
const REVIEW_STATUS: Record<string, { color: string; text: string }> = {
  pending: { color: 'processing', text: '검수대기' },
  approved: { color: 'success', text: '검수통과' },
  rejected: { color: 'error', text: '검수거절' },
  re_review: { color: 'warning', text: '재검수' },
};

interface AlimtalkTableProps {
  templates: AlimtalkTemplate[];
  loading: boolean;
  onView: (templateCode: string) => void;
  onEdit: (template: AlimtalkTemplate) => void;
  onDelete: (templateCode: string) => void;
  onToggleActive: (template: AlimtalkTemplate) => void;
}

export function AlimtalkTable({ templates, loading, onView, onEdit, onDelete, onToggleActive }: AlimtalkTableProps) {
  const columns: ColumnsType<AlimtalkTemplate> = [
    {
      title: '템플릿 코드', dataIndex: 'templateCode', key: 'templateCode', width: 200,
      render: (code: string) => <span style={{ fontFamily: 'monospace' }}>{code}</span>,
    },
    { title: '템플릿 이름', dataIndex: 'name', key: 'name', width: 180 },
    {
      title: '솔라피 ID', dataIndex: 'templateId', key: 'templateId', width: 240,
      render: (id: string) => <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{id}</span>,
    },
    {
      title: '검수상태', dataIndex: 'reviewStatus', key: 'reviewStatus', width: 100, align: 'center',
      render: (s: string) => { const c = REVIEW_STATUS[s] || { color: 'default', text: s }; return <Tag color={c.color}>{c.text}</Tag>; },
    },
    {
      title: '활성화', dataIndex: 'isActive', key: 'isActive', width: 100, align: 'center',
      render: (isActive: boolean, record) => (
        <Switch checked={isActive} onChange={() => onToggleActive(record)} checkedChildren="ON" unCheckedChildren="OFF" />
      ),
    },
    {
      title: '버튼', dataIndex: 'buttons', key: 'buttons', width: 70, align: 'center',
      render: (buttons: AlimtalkButton[]) => buttons.length || 0,
    },
    {
      title: '작업', key: 'actions', width: 200, align: 'center', fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => onView(record.templateCode)}>상세</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>수정</Button>
          <Popconfirm title="템플릿 삭제" description="정말 이 템플릿을 삭제하시겠습니까?" onConfirm={() => onDelete(record.templateCode)} okText="삭제" cancelText="취소" okButtonProps={{ danger: true }}>
            <Button type="link" size="small" icon={<DeleteOutlined />} danger>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={templates} rowKey="templateCode" loading={loading} pagination={false} scroll={{ x: 1200 }} bordered />;
}
