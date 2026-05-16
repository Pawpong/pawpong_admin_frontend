import React from 'react';
import { Card, Select, Input, Button } from 'antd';

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
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">사용자 관리</h1>

      {/* 필터 */}
      <Card className="mb-4 sm:mb-6" style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select placeholder="역할 선택" onChange={crud.handleRoleFilterChange} allowClear className="w-full">
            <Option value="adopter">입양자</Option>
            <Option value="breeder">브리더</Option>
          </Select>
          <Select placeholder="상태 선택" onChange={crud.handleStatusFilterChange} allowClear className="w-full">
            <Option value="active">활성</Option>
            <Option value="suspended">정지</Option>
            <Option value="deleted">탈퇴</Option>
          </Select>
          <Search placeholder="이름 또는 이메일 검색" onSearch={crud.handleSearch} allowClear className="w-full lg:col-span-1" />
          <Button onClick={crud.fetchUsers} className="w-full">새로고침</Button>
        </div>
      </Card>

      {/* 사용자 목록 테이블 */}
      <Card>
        <UserTable
          dataSource={crud.dataSource}
          loading={crud.loading}
          current={crud.current}
          pageSize={crud.pageSize}
          total={crud.total}
          onStatusChange={crud.openStatusModal}
          onTableChange={crud.handleTableChange}
        />
      </Card>

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
