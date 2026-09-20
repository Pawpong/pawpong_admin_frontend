import React from 'react';
import { LoadError, PageHeading } from '../../shared/components/admin/PageHeading';
import { Select, Input, Button } from 'antd';

import { useUserCrud } from '../../features/user/hooks/useUserCrud';
import { UserTable } from '../../features/user/ui/UserTable';
import { UserStatusModal } from '../../features/user/ui/UserStatusModal';

const { Search } = Input;
const { Option } = Select;

/**
 * 사용자 관리 페이지
 * 입양자와 브리더 계정을 관리합니다.
 */
const Users: React.FC = () => {
  const crud = useUserCrud();

  return (
    <div>
      <PageHeading
        title="사용자 관리"
        description="입양자와 브리더 계정의 역할, 가입일, 최근 로그인과 계정 상태를 조회하고 정지 여부를 관리합니다."
        action={<Button onClick={crud.fetchUsers}>새로고침</Button>}
      />
      <LoadError error={crud.loadError} retry={crud.fetchUsers} />

      <div className="filter-bar">
        <span>역할</span>
        <Select placeholder="전체 역할" onChange={crud.handleRoleFilterChange} allowClear className="filter-control">
          <Option value="adopter">입양자</Option>
          <Option value="breeder">브리더</Option>
        </Select>
        <span>계정 상태</span>
        <Select placeholder="전체 상태" onChange={crud.handleStatusFilterChange} allowClear className="filter-control">
          <Option value="active">활성</Option>
          <Option value="suspended">정지</Option>
          <Option value="deleted">탈퇴</Option>
        </Select>
        <Search placeholder="이름 또는 이메일 검색" onSearch={crud.handleSearch} allowClear className="filter-control-wide" />
      </div>

      <UserTable
        dataSource={crud.dataSource}
        loading={crud.loading}
        current={crud.current}
        pageSize={crud.pageSize}
        total={crud.total}
        onStatusChange={crud.openStatusModal}
        onTableChange={crud.handleTableChange}
      />

      {/* 상태 변경 모달 */}
      <UserStatusModal
        visible={crud.modalVisible}
        form={crud.form}
        onOk={crud.handleModalOk}
        onCancel={crud.closeModal}
      />
    </div>
  );
};

export default Users;
