import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Button, message, Modal, Select, Input, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { userApi } from '../../features/user/api/userApi';
import type { UserManagement, UserSearchRequest } from '../../shared/types/api.types';

const { Search } = Input;
const { Option } = Select;

/**
 * 사용자 관리 페이지
 * 입양자와 브리더 계정을 관리합니다.
 */
const Users: React.FC = () => {
    const [dataSource, setDataSource] = useState<UserManagement[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
    const [form] = Form.useForm();
    const [filters, setFilters] = useState<UserSearchRequest>({});

    // 페이지네이션 상태
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await userApi.getUsers({
                ...filters,
                page: current,
                limit: pageSize,
            });
            setDataSource(response.items);
            setTotal(response.pagination.totalItems);
        } catch (error: unknown) {
            console.error('Failed to fetch users:', error);
            setDataSource([]);
            setTotal(0);
            message.error('사용자 목록을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    }, [filters, current, pageSize]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const getUserRoleTag = (role: string) => {
        return role === 'adopter' ? <Tag color="blue">입양자</Tag> : <Tag color="green">브리더</Tag>;
    };

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
            active: { color: 'success', text: '활성' },
            suspended: { color: 'warning', text: '정지' },
            deleted: { color: 'error', text: '탈퇴' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const handleStatusChange = (user: UserManagement) => {
        setSelectedUser(user);
        form.setFieldsValue({
            accountStatus: user.accountStatus,
            reason: '',
        });
        setModalVisible(true);
    };

    const handleModalOk = async () => {
        if (!selectedUser) return;

        try {
            const values = await form.validateFields();
            await userApi.updateUserStatus(selectedUser.userId, selectedUser.userRole as 'adopter' | 'breeder', {
                accountStatus: values.accountStatus,
                actionReason: values.reason,
            });
            message.success('사용자 상태가 변경되었습니다.');
            setModalVisible(false);
            fetchUsers();
        } catch (error: unknown) {
            console.error('Failed to update user status:', error);
            if (error && typeof error === 'object' && 'errorFields' in error) {
                message.error('모든 필드를 올바르게 입력해주세요.');
            } else {
                message.error('상태 변경에 실패했습니다.');
            }
        }
    };

    const handleRoleFilterChange = (value: string) => {
        setCurrent(1); // 필터 변경 시 첫 페이지로
        setFilters((prev) => ({
            ...prev,
            userRole: (value as 'adopter' | 'breeder') || undefined,
        }));
    };

    const handleStatusFilterChange = (value: string) => {
        setCurrent(1); // 필터 변경 시 첫 페이지로
        setFilters((prev) => ({
            ...prev,
            accountStatus: value as 'active' | 'suspended' | 'deleted' | undefined,
        }));
    };

    const handleSearch = (value: string) => {
        setCurrent(1); // 검색 시 첫 페이지로
        setFilters((prev) => ({
            ...prev,
            searchKeyword: value || undefined,
        }));
    };

    const handleTableChange = (pagination: any) => {
        setCurrent(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const columns: ColumnsType<UserManagement> = [
        {
            title: '사용자 ID',
            dataIndex: 'userId',
            key: 'userId',
            width: 120,
            ellipsis: true,
        },
        {
            title: '이름',
            dataIndex: 'userName',
            key: 'userName',
            width: 120,
            render: (name: string) => name || '-',
        },
        {
            title: '이메일',
            dataIndex: 'emailAddress',
            key: 'emailAddress',
            width: 200,
            render: (email: string) => email || '-',
        },
        {
            title: '역할',
            dataIndex: 'userRole',
            key: 'userRole',
            width: 100,
            render: (role: string) => getUserRoleTag(role),
        },
        {
            title: '상태',
            dataIndex: 'accountStatus',
            key: 'accountStatus',
            width: 100,
            render: (status: string) => (status ? getStatusTag(status) : <Tag color="default">-</Tag>),
        },
        {
            title: '최근 로그인',
            dataIndex: 'lastLoginAt',
            key: 'lastLoginAt',
            width: 150,
            render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
        },
        {
            title: '가입일',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '작업',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(record);
                    }}
                    style={{ padding: 0 }}
                >
                    상태 변경
                </Button>
            ),
        },
    ];

    return (
        <div className="p-3 sm:p-4 md:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">사용자 관리</h1>

            {/* 필터 */}
            <Card className="mb-4 sm:mb-6" style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Select placeholder="역할 선택" onChange={handleRoleFilterChange} allowClear className="w-full">
                        <Option value="adopter">입양자</Option>
                        <Option value="breeder">브리더</Option>
                    </Select>
                    <Select placeholder="상태 선택" onChange={handleStatusFilterChange} allowClear className="w-full">
                        <Option value="active">활성</Option>
                        <Option value="suspended">정지</Option>
                        <Option value="deleted">탈퇴</Option>
                    </Select>
                    <Search
                        placeholder="이름 또는 이메일 검색"
                        onSearch={handleSearch}
                        allowClear
                        className="w-full lg:col-span-1"
                    />
                    <Button onClick={fetchUsers} className="w-full">
                        새로고침
                    </Button>
                </div>
            </Card>

            {/* 사용자 목록 테이블 */}
            <Card>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    loading={loading}
                    rowKey="userId"
                    pagination={{
                        current,
                        pageSize,
                        total,
                        showSizeChanger: true,
                        showTotal: (total) => `총 ${total}명`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* 상태 변경 모달 */}
            <Modal
                title="사용자 상태 변경"
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                okText="변경"
                cancelText="취소"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="accountStatus"
                        label="계정 상태"
                        rules={[{ required: true, message: '상태를 선택해주세요' }]}
                    >
                        <Select>
                            <Option value="active">활성</Option>
                            <Option value="suspended">정지</Option>
                            <Option value="deleted">탈퇴</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="reason"
                        label="변경 사유"
                        rules={[{ required: true, message: '변경 사유를 입력해주세요' }]}
                    >
                        <Input.TextArea rows={4} placeholder="변경 사유를 입력해주세요" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;
