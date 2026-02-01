import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Card, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import {
  announcementApi,
  type Announcement,
  type AnnouncementCreateRequest,
  type AnnouncementUpdateRequest,
} from '../../features/home/api/announcementApi';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementApi.getAnnouncements();
      // 순서대로 정렬
      const sortedData = data.sort((a, b) => a.order - b.order);
      setAnnouncements(sortedData);
    } catch (error) {
      message.error('공지사항 목록 조회 실패');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      order: announcements.length,
    });
    setModalVisible(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    form.setFieldsValue({
      title: announcement.title,
      content: announcement.content,
      order: announcement.order,
      isActive: announcement.isActive,
    });
    setModalVisible(true);
  };

  const handleDelete = async (announcementId: string) => {
    try {
      await announcementApi.deleteAnnouncement(announcementId);
      message.success('공지사항이 삭제되었습니다');
      fetchAnnouncements();
    } catch (error) {
      message.error('공지사항 삭제 실패');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingAnnouncement) {
        // 수정
        const updateData: AnnouncementUpdateRequest = {
          ...values,
        };
        await announcementApi.updateAnnouncement(editingAnnouncement.announcementId, updateData);
        message.success('공지사항이 수정되었습니다');
      } else {
        // 생성
        const createData: AnnouncementCreateRequest = {
          ...values,
        };
        await announcementApi.createAnnouncement(createData);
        message.success('공지사항이 생성되었습니다');
      }

      setModalVisible(false);
      form.resetFields();
      fetchAnnouncements();
    } catch (error) {
      message.error('공지사항 저장 실패');
      console.error(error);
    }
  };

  const columns: ColumnsType<Announcement> = [
    {
      title: '순서',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '내용',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: string) => (
        <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {text}
        </div>
      ),
    },
    {
      title: '활성화',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? '활성' : '비활성'}</Tag>,
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Announcement) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
            style={{ color: 'var(--color-primary-500)' }}
          >
            수정
          </Button>
          <Popconfirm
            title="공지사항 삭제"
            description="정말 이 공지사항을 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.announcementId)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--color-primary-500)',
            margin: 0,
          }}
        >
          공지사항 관리
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          style={{
            backgroundColor: 'var(--color-primary-500)',
            borderColor: 'var(--color-primary-500)',
          }}
        >
          공지사항 추가
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={announcements}
          rowKey="announcementId"
          loading={loading}
          pagination={{ showSizeChanger: true, showTotal: (total) => `총 ${total}개` }}
        />
      </Card>

      <Modal
        title={editingAnnouncement ? '공지사항 수정' : '공지사항 추가'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={700}
        okText={editingAnnouncement ? '수정' : '생성'}
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력해주세요' }]}>
            <Input placeholder="공지사항 제목" />
          </Form.Item>

          <Form.Item name="content" label="내용" rules={[{ required: true, message: '내용을 입력해주세요' }]}>
            <Input.TextArea placeholder="공지사항 내용" rows={6} showCount maxLength={1000} />
          </Form.Item>

          <Form.Item name="order" label="정렬 순서" rules={[{ required: true, message: '정렬 순서를 입력해주세요' }]}>
            <Input type="number" placeholder="0부터 시작 (낮을수록 먼저 표시)" />
          </Form.Item>

          <Form.Item name="isActive" label="활성화 여부" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Announcements;
