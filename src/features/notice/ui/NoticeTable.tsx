import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import type { Notice } from '../api/noticeApi';

/** 상태 태그 설정 */
const STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  published: { color: 'green', text: '게시' },
  draft: { color: 'orange', text: '임시저장' },
  archived: { color: 'default', text: '보관' },
};

interface NoticeTableProps {
  notices: Notice[];
  loading: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (notice: Notice) => void;
  onEdit: (notice: Notice) => void;
  onDelete: (id: string) => void;
}

export function NoticeTable({ notices, loading, currentPage, totalItems, pageSize, onPageChange, onView, onEdit, onDelete }: NoticeTableProps) {
  const columns: ColumnsType<Notice> = [
    {
      title: '상태', dataIndex: 'status', key: 'status', width: 80,
      render: (s: string) => { const c = STATUS_CONFIG[s] || { color: 'default', text: s }; return <Tag color={c.color}>{c.text}</Tag>; },
    },
    {
      title: '고정', dataIndex: 'isPinned', key: 'isPinned', width: 60,
      render: (v: boolean) => v ? <Tag color="red">고정</Tag> : <Tag>-</Tag>,
    },
    { title: '제목', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '작성자', dataIndex: 'authorName', key: 'authorName', width: 100 },
    { title: '조회수', dataIndex: 'viewCount', key: 'viewCount', width: 80, align: 'right' },
    { title: '작성일', dataIndex: 'createdAt', key: 'createdAt', width: 120, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    {
      title: '작업', key: 'action', width: 120, fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onView(record)} />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => onDelete(record.noticeId)} okText="삭제" cancelText="취소">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table columns={columns} dataSource={notices} rowKey="noticeId" loading={loading} scroll={{ x: 1000 }}
      pagination={{ current: currentPage, pageSize, total: totalItems, onChange: onPageChange, showSizeChanger: false, showTotal: (total) => `총 ${total}개` }} />
  );
}
