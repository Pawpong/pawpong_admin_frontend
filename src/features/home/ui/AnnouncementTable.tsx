import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import type { Announcement } from '../api/announcementApi';

interface AnnouncementTableProps {
  announcements: Announcement[];
  loading: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
}

export function AnnouncementTable({ announcements, loading, onEdit, onDelete }: AnnouncementTableProps) {
  const columns: ColumnsType<Announcement> = [
    { title: '순서', dataIndex: 'order', key: 'order', width: 80, sorter: (a, b) => a.order - b.order },
    { title: '제목', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '내용', dataIndex: 'content', key: 'content', ellipsis: true,
      render: (text: string) => <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</div>,
    },
    {
      title: '활성화', dataIndex: 'isActive', key: 'isActive', width: 100,
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? '활성' : '비활성'}</Tag>,
    },
    {
      title: '등록일', dataIndex: 'createdAt', key: 'createdAt', width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      title: '작업', key: 'action', width: 120,
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>수정</Button>
          <Popconfirm title="공지사항 삭제" description="정말 이 공지사항을 삭제하시겠습니까?" onConfirm={() => onDelete(record.announcementId)} okText="삭제" cancelText="취소" okButtonProps={{ danger: true }}>
            <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={announcements} rowKey="announcementId" loading={loading} pagination={{ showSizeChanger: true, showTotal: (total) => `총 ${total}개` }} />;
}
