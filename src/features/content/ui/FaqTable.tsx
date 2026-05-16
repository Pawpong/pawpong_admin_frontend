import { Table, Tag, Space, Button, Switch, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import type { FAQ } from '../../../shared/types/api.types';

/** 카테고리 태그 매핑 */
const CATEGORY_MAP: Record<string, { color: string; text: string }> = {
  service: { color: 'blue', text: '서비스' },
  adoption: { color: 'green', text: '입양' },
  breeder: { color: 'purple', text: '브리더' },
  payment: { color: 'orange', text: '결제' },
  etc: { color: 'default', text: '기타' },
};

/** 사용자 타입 태그 매핑 */
const USER_TYPE_MAP: Record<string, { color: string; text: string }> = {
  adopter: { color: 'blue', text: '입양자' },
  breeder: { color: 'green', text: '브리더' },
  both: { color: 'cyan', text: '공통' },
};

interface FaqTableProps {
  faqs: FAQ[];
  loading: boolean;
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
}

export function FaqTable({ faqs, loading, onEdit, onDelete }: FaqTableProps) {
  const columns: ColumnsType<FAQ> = [
    { title: '순서', dataIndex: 'order', key: 'order', width: 80, sorter: (a, b) => a.order - b.order },
    { title: '질문', dataIndex: 'question', key: 'question', width: 250, ellipsis: true },
    { title: '답변', dataIndex: 'answer', key: 'answer', width: 300, ellipsis: true },
    {
      title: '카테고리', dataIndex: 'category', key: 'category', width: 100,
      render: (c: string) => { const cfg = CATEGORY_MAP[c] || { color: 'default', text: c }; return <Tag color={cfg.color}>{cfg.text}</Tag>; },
    },
    {
      title: '대상', dataIndex: 'userType', key: 'userType', width: 100,
      render: (t: string) => { const cfg = USER_TYPE_MAP[t] || { color: 'default', text: t }; return <Tag color={cfg.color}>{cfg.text}</Tag>; },
    },
    { title: '활성화', dataIndex: 'isActive', key: 'isActive', width: 80, render: (v: boolean) => <Switch checked={v !== false} disabled /> },
    {
      title: '작업', key: 'actions', width: 150,
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} style={{ padding: 0 }}>수정</Button>
          <Popconfirm title="FAQ를 삭제하시겠습니까?" onConfirm={() => onDelete(record.faqId)} okText="삭제" cancelText="취소">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table dataSource={faqs} columns={columns} loading={loading} rowKey="faqId" pagination={{ showSizeChanger: true, showTotal: (total) => `총 ${total}개` }} />;
}
