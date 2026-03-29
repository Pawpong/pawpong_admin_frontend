import React from 'react';
import { Card, Select } from 'antd';

import { useDeletedUserCrud } from '../../features/user/hooks/useDeletedUserCrud';
import { DeletedUserTable } from '../../features/user/ui/DeletedUserTable';
import { DeletedUserStatsSection } from '../../features/user/ui/DeletedUserStats';
import { DeletedUserDetailModal } from '../../features/user/ui/DeletedUserDetailModal';
import { DeletedUserHardDeleteModal } from '../../features/user/ui/DeletedUserHardDeleteModal';

const { Option } = Select;

/**
 * 탈퇴 사용자 관리 페이지
 * 입양자와 브리더의 탈퇴 내역을 조회하고 통계를 확인합니다.
 */
const DeletedUsers: React.FC = () => {
  const crud = useDeletedUserCrud();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">탈퇴 사용자 관리</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        입양자와 브리더의 탈퇴 내역을 조회하고 통계를 확인합니다.
      </p>

      <DeletedUserStatsSection stats={crud.stats} />

      {/* 필터 */}
      <Card className="mb-6 sm:mb-8" style={{ borderRadius: '12px', marginBottom: '2rem' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select placeholder="역할 선택" value={crud.filters.role} onChange={crud.handleRoleFilterChange} allowClear className="w-full">
            <Option value="all">전체</Option>
            <Option value="adopter">입양자</Option>
            <Option value="breeder">브리더</Option>
          </Select>
        </div>
      </Card>

      {/* 탈퇴 사용자 목록 테이블 */}
      <Card>
        <DeletedUserTable
          dataSource={crud.dataSource}
          loading={crud.loading}
          pagination={crud.pagination}
          onTableChange={crud.handleTableChange}
          onShowDetail={crud.showDetail}
          onRestore={crud.handleRestoreUser}
          onHardDelete={crud.openHardDeleteModal}
        />
      </Card>

      <DeletedUserDetailModal visible={crud.detailModalVisible} user={crud.selectedUser} onCancel={crud.closeDetailModal} />

      <DeletedUserHardDeleteModal
        visible={crud.hardDeleteModalVisible}
        user={crud.selectedUser}
        confirmInput={crud.confirmDeleteInput}
        onConfirmInputChange={crud.setConfirmDeleteInput}
        onOk={crud.handleHardDeleteConfirm}
        onCancel={crud.closeHardDeleteModal}
      />
    </div>
  );
};

export default DeletedUsers;
