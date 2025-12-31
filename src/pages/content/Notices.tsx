import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Card, Space, Tag, Popconfirm, DatePicker, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
    noticeApi,
    type Notice,
    type NoticeCreateRequest,
    type NoticeUpdateRequest,
} from '../../features/notice/api/noticeApi';
import dayjs from 'dayjs';

const { TextArea } = Input;

const Notices = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState<'published' | 'draft' | 'archived' | undefined>(undefined);
    const limit = 10;

    useEffect(() => {
        fetchNotices();
    }, [currentPage, statusFilter]);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await noticeApi.getNotices(currentPage, limit, statusFilter);
            setNotices(response.data.items);
            setTotalItems(response.data.pagination.totalItems);
        } catch (error) {
            message.error('공지사항 목록 조회 실패');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingNotice(null);
        form.resetFields();
        form.setFieldsValue({
            status: 'published',
            isPinned: false,
        });
        setModalVisible(true);
    };

    const handleEdit = (notice: Notice) => {
        setEditingNotice(notice);
        form.setFieldsValue({
            title: notice.title,
            content: notice.content,
            status: notice.status,
            isPinned: notice.isPinned,
            publishedAt: notice.publishedAt ? dayjs(notice.publishedAt) : null,
            expiredAt: notice.expiredAt ? dayjs(notice.expiredAt) : null,
        });
        setModalVisible(true);
    };

    const handleView = (notice: Notice) => {
        setViewingNotice(notice);
        setDetailModalVisible(true);
    };

    const handleDelete = async (noticeId: string) => {
        try {
            await noticeApi.deleteNotice(noticeId);
            message.success('공지사항이 삭제되었습니다');
            fetchNotices();
        } catch (error) {
            message.error('공지사항 삭제 실패');
            console.error(error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const submitData = {
                title: values.title,
                content: values.content,
                status: values.status || 'published',
                isPinned: values.isPinned || false,
                publishedAt: values.publishedAt ? values.publishedAt.toISOString() : undefined,
                expiredAt: values.expiredAt ? values.expiredAt.toISOString() : undefined,
            };

            if (editingNotice) {
                // 수정
                const updateData: NoticeUpdateRequest = submitData;
                await noticeApi.updateNotice(editingNotice.noticeId, updateData);
                message.success('공지사항이 수정되었습니다');
            } else {
                // 생성
                const createData: NoticeCreateRequest = submitData;
                await noticeApi.createNotice(createData);
                message.success('공지사항이 생성되었습니다');
            }

            setModalVisible(false);
            form.resetFields();
            setEditingNotice(null);
            fetchNotices();
        } catch (error) {
            message.error(editingNotice ? '공지사항 수정 실패' : '공지사항 생성 실패');
            console.error(error);
        }
    };

    const columns: ColumnsType<Notice> = [
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (status: string) => {
                const statusConfig = {
                    published: { color: 'green', text: '게시' },
                    draft: { color: 'orange', text: '임시저장' },
                    archived: { color: 'default', text: '보관' },
                };
                const config = statusConfig[status as keyof typeof statusConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '고정',
            dataIndex: 'isPinned',
            key: 'isPinned',
            width: 60,
            render: (isPinned: boolean) => (isPinned ? <Tag color="red">고정</Tag> : <Tag>-</Tag>),
        },
        {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: '작성자',
            dataIndex: 'authorName',
            key: 'authorName',
            width: 100,
        },
        {
            title: '조회수',
            dataIndex: 'viewCount',
            key: 'viewCount',
            width: 80,
            align: 'right',
        },
        {
            title: '작성일',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: '작업',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size={4}>
                    <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="삭제하시겠습니까?"
                        onConfirm={() => handleDelete(record.noticeId)}
                        okText="삭제"
                        cancelText="취소"
                    >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="공지사항 관리"
            extra={
                <Space>
                    <Select
                        placeholder="상태 필터"
                        allowClear
                        style={{ width: 120 }}
                        value={statusFilter}
                        onChange={(value) => {
                            setStatusFilter(value);
                            setCurrentPage(1);
                        }}
                        options={[
                            { value: 'published', label: '게시' },
                            { value: 'draft', label: '임시저장' },
                            { value: 'archived', label: '보관' },
                        ]}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        공지사항 추가
                    </Button>
                </Space>
            }
        >
            <Table
                columns={columns}
                dataSource={notices}
                rowKey="noticeId"
                loading={loading}
                scroll={{ x: 1000 }}
                pagination={{
                    current: currentPage,
                    pageSize: limit,
                    total: totalItems,
                    onChange: (page) => setCurrentPage(page),
                    showSizeChanger: false,
                    showTotal: (total) => `총 ${total}개`,
                }}
            />

            {/* 생성/수정 모달 */}
            <Modal
                title={editingNotice ? '공지사항 수정' : '공지사항 추가'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                width={800}
                okText={editingNotice ? '수정' : '추가'}
                cancelText="취소"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력해주세요' }]}>
                        <Input placeholder="공지사항 제목을 입력하세요" maxLength={200} showCount />
                    </Form.Item>

                    <Form.Item name="content" label="내용" rules={[{ required: true, message: '내용을 입력해주세요' }]}>
                        <TextArea rows={10} placeholder="공지사항 내용을 입력하세요" maxLength={5000} showCount />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 24 }}>
                        <Form.Item name="status" label="상태" initialValue="published">
                            <Switch
                                checkedChildren="게시"
                                unCheckedChildren="임시저장"
                                onChange={(checked) => form.setFieldValue('status', checked ? 'published' : 'draft')}
                                checked={form.getFieldValue('status') === 'published'}
                            />
                        </Form.Item>

                        <Form.Item name="isPinned" label="상단 고정" valuePropName="checked" initialValue={false}>
                            <Switch checkedChildren="고정" unCheckedChildren="미고정" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="publishedAt" label="게시 시작일 (선택)">
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{ width: '100%' }}
                                placeholder="시작일 선택"
                            />
                        </Form.Item>

                        <Form.Item name="expiredAt" label="게시 종료일 (선택)">
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{ width: '100%' }}
                                placeholder="종료일 선택"
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* 상세 보기 모달 */}
            <Modal
                title="공지사항 상세"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setViewingNotice(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        닫기
                    </Button>,
                ]}
                width={800}
            >
                {viewingNotice && (
                    <div style={{ padding: '24px 0' }}>
                        <div style={{ marginBottom: 16 }}>
                            <Space>
                                <Tag color={viewingNotice.status === 'published' ? 'green' : 'orange'}>
                                    {viewingNotice.status === 'published' ? '게시' : '임시저장'}
                                </Tag>
                                {viewingNotice.isPinned && <Tag color="red">고정</Tag>}
                            </Space>
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{viewingNotice.title}</h2>
                        <div style={{ marginBottom: 24, color: '#888' }}>
                            <Space split="|">
                                <span>{viewingNotice.authorName}</span>
                                <span>{dayjs(viewingNotice.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                                <span>조회 {viewingNotice.viewCount}</span>
                            </Space>
                        </div>
                        <div
                            style={{
                                padding: 24,
                                background: '#f5f5f5',
                                borderRadius: 8,
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.6,
                            }}
                        >
                            {viewingNotice.content}
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default Notices;
