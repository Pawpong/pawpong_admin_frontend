import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Tag, Statistic, Row, Col, Select, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { userApi } from '../../features/user/api/userApi';
import type { DeletedUser, DeletedUserSearchRequest, DeletedUserStats } from '../../features/user/api/userApi';

const { Option } = Select;

/**
 * 탈퇴 사용자 관리 페이지
 * 입양자와 브리더의 탈퇴 내역을 조회하고 통계를 확인합니다.
 */
const DeletedUsers: React.FC = () => {
  const [dataSource, setDataSource] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DeletedUserStats | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<DeletedUserSearchRequest>({
    page: 1,
    pageSize: 20,
    role: 'all',
  });
  const [selectedUser, setSelectedUser] = useState<DeletedUser | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchDeletedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userApi.getDeletedUsers(filters);
      setDataSource(response.items);
      setPagination({
        current: response.pagination.currentPage,
        pageSize: response.pagination.pageSize,
        total: response.pagination.totalItems,
      });
    } catch (error: unknown) {
      console.error('Failed to fetch deleted users:', error);
      setDataSource([]);
      message.error('탈퇴 사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await userApi.getDeletedUserStats();
      setStats(statsData);
    } catch (error: unknown) {
      console.error('Failed to fetch stats:', error);
      message.error('탈퇴 통계를 불러올 수 없습니다.');
    }
  }, []);

  useEffect(() => {
    fetchDeletedUsers();
    fetchStats();
  }, [fetchDeletedUsers, fetchStats]);

  const getUserRoleTag = (role: string) => {
    return role === 'adopter' ? <Tag color="blue">입양자</Tag> : <Tag color="green">브리더</Tag>;
  };

  const getDeleteReasonLabel = (reason: string, role: string) => {
    if (role === 'adopter') {
      const labels: Record<string, string> = {
        already_adopted: '이미 입양을 마쳤어요',
        no_suitable_pet: '마음에 드는 아이가 없어요',
        adoption_fee_burden: '입양비가 부담돼요',
        uncomfortable_ui: '사용하기 불편했어요 (UI/기능 등)',
        privacy_concern: '개인정보나 보안이 걱정돼요',
        other: '기타',
      };
      return labels[reason] || reason;
    } else {
      const labels: Record<string, string> = {
        no_inquiry: '입양 문의가 잘 오지 않았어요',
        time_consuming: '운영이 생각보다 번거롭거나 시간이 부족해요',
        verification_difficult: '브리더 심사나 검증 절차가 어려웠어요',
        policy_mismatch: '수익 구조나 서비스 정책이 잘 맞지 않아요',
        uncomfortable_ui: '사용하기 불편했어요 (UI/기능 등)',
        other: '기타',
      };
      return labels[reason] || reason;
    }
  };

  const handleRoleFilterChange = (value: 'all' | 'adopter' | 'breeder') => {
    setFilters((prev) => ({
      ...prev,
      role: value,
      page: 1,
    }));
  };

  const handleTableChange = (newPagination: any) => {
    setFilters((prev) => ({
      ...prev,
      page: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const showDetail = (record: DeletedUser) => {
    setSelectedUser(record);
    setDetailModalVisible(true);
  };

  const columns: ColumnsType<DeletedUser> = [
    {
      title: '사용자 ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      ellipsis: true,
    },
    {
      title: '닉네임',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
      render: (name: string) => name || '-',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
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
      title: '탈퇴 사유',
      dataIndex: 'deleteReason',
      key: 'deleteReason',
      width: 250,
      render: (reason: string, record) => (
        <span style={{ color: '#888' }}>{getDeleteReasonLabel(reason, record.userRole)}</span>
      ),
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '탈퇴일',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      width: 150,
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '작업',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            showDetail(record);
          }}
          style={{ color: '#4f3b2e' }}
        >
          상세보기
        </a>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">탈퇴 사용자 관리</h1>

      {/* 통계 카드 */}
      {stats && (
        <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="전체 탈퇴 사용자"
                value={stats.totalDeletedUsers}
                suffix="명"
                valueStyle={{ color: '#3c3c3c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="탈퇴한 입양자"
                value={stats.totalDeletedAdopters}
                suffix="명"
                valueStyle={{ color: '#005df9' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="탈퇴한 브리더"
                value={stats.totalDeletedBreeders}
                suffix="명"
                valueStyle={{ color: '#4f3b2e' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="최근 7일 탈퇴"
                value={stats.last7DaysCount}
                suffix="명"
                valueStyle={{ color: '#d97706' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 탈퇴 사유 통계 */}
      {stats && stats.reasonStats.length > 0 && (
        <Card className="mb-4 sm:mb-6" title="탈퇴 사유 통계">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.reasonStats.map((stat) => (
              <div key={stat.reason} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{stat.reason}</span>
                <div className="text-right">
                  <div className="text-lg font-bold">{stat.count}명</div>
                  <div className="text-xs text-gray-500">{stat.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 필터 */}
      <Card className="mb-4 sm:mb-6" style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            placeholder="역할 선택"
            value={filters.role}
            onChange={handleRoleFilterChange}
            allowClear
            className="w-full"
          >
            <Option value="all">전체</Option>
            <Option value="adopter">입양자</Option>
            <Option value="breeder">브리더</Option>
          </Select>
        </div>
      </Card>

      {/* 탈퇴 사용자 목록 테이블 */}
      <Card>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          rowKey="userId"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}명`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 상세보기 모달 */}
      <Modal
        title="탈퇴 사용자 상세 정보"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">사용자 ID</div>
                <div className="font-medium">{selectedUser.userId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">역할</div>
                <div>{getUserRoleTag(selectedUser.userRole)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">닉네임</div>
                <div className="font-medium">{selectedUser.nickname}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">이메일</div>
                <div className="font-medium">{selectedUser.email}</div>
              </div>
              {selectedUser.phone && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">전화번호</div>
                  <div className="font-medium">{selectedUser.phone}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500 mb-1">가입일</div>
                <div className="font-medium">{dayjs(selectedUser.createdAt).format('YYYY-MM-DD')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">탈퇴일</div>
                <div className="font-medium">{dayjs(selectedUser.deletedAt).format('YYYY-MM-DD HH:mm:ss')}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">탈퇴 사유</div>
              <div className="font-medium">{getDeleteReasonLabel(selectedUser.deleteReason, selectedUser.userRole)}</div>
            </div>
            {selectedUser.deleteReasonDetail && (
              <div>
                <div className="text-sm text-gray-500 mb-1">상세 사유</div>
                <div className="p-3 bg-gray-50 rounded-lg">{selectedUser.deleteReasonDetail}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeletedUsers;
