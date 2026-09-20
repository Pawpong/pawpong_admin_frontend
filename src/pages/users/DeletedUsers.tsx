import React from 'react';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { Select } from 'antd';

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
    <div>
      <PageHeading
        title="탈퇴 사용자 관리"
        description="입양자와 브리더의 탈퇴 사유와 탈퇴일을 확인하고 계정 복구 또는 영구 삭제를 처리합니다."
      />
      <LoadError error={crud.loadError} retry={crud.fetchDeletedUsers} />

      <DeletedUserStatsSection stats={crud.stats} />

      <div className="filter-bar">
        <span>역할</span>
        <Select
          placeholder="전체 역할"
          value={crud.filters.role}
          onChange={crud.handleRoleFilterChange}
          allowClear
          className="filter-control"
        >
          <Option value="all">전체</Option>
          <Option value="adopter">입양자</Option>
          <Option value="breeder">브리더</Option>
        </Select>
      </div>

      <DeletedUserTable
        dataSource={crud.dataSource}
        loading={crud.loading}
        pagination={crud.pagination}
        onTableChange={crud.handleTableChange}
        onShowDetail={crud.showDetail}
        onRestore={crud.handleRestoreUser}
        onHardDelete={crud.openHardDeleteModal}
      />

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
