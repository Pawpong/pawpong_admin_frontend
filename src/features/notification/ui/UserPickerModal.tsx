import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Modal, Radio, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';

import { userApi } from '../../user/api/userApi';
import type { UserManagement } from '../../../shared/types/api.types';
import { useRemoteData } from '../../../shared/hooks/useRemoteData';

export type UserPickerRole = 'adopter' | 'breeder';

export interface PickedUser {
  userId: string;
  role: UserPickerRole;
  nickname: string;
  userName: string;
  emailAddress: string;
  phoneNumber: string;
}

interface UserPickerModalProps {
  open: boolean;
  /** 모달이 열릴 때 디폴트로 선택될 역할 (외부 폼의 role 과 동기화) */
  initialRole?: UserPickerRole;
  onCancel: () => void;
  /** 사용자 선택 시 호출 — 외부 폼이 userId, role 등을 받아 반영 */
  onPick: (user: PickedUser) => void;
}

const PAGE_SIZE = 10;

/**
 * 푸시 발송 대상 개별 사용자를 검색해서 선택하는 모달.
 *
 * - 역할(입양자/브리더) 라디오 + 검색어(이름/이메일) 입력으로 필터
 * - 결과 테이블에서 한 행 클릭 시 즉시 onPick 호출 후 모달 닫힘
 * - 닉네임 / 이름 / 이메일 / 휴대전화 / userId 컬럼 노출
 *
 * 열 때마다 새로 마운트하며 검색 입력 즉시 이전 행을 숨긴다.
 * useRemoteData가 필터 변경·닫기 후 도착한 오래된 응답을 버린다.
 */
export function UserPickerModal({ open, initialRole = 'adopter', onCancel, onPick }: UserPickerModalProps) {
  const [role, setRole] = useState<UserPickerRole>(initialRole);
  const [keyword, setKeyword] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const request = useRemoteData(
    useCallback(
      () =>
        userApi.getUsers({
          userRole: role,
          accountStatus: 'active',
          searchKeyword: debounced || undefined,
          page,
          limit: PAGE_SIZE,
        }),
      [role, debounced, page],
    ),
  );
  const searching = keyword.trim() !== debounced;
  const displayedUsers = searching ? [] : (request.data?.items ?? []);
  const displayedTotal = searching ? 0 : (request.data?.pagination?.totalItems ?? 0);
  const tableLoading = searching || request.loading;

  // 검색어 디바운스 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const columns: ColumnsType<UserManagement> = useMemo(
    () => [
      {
        title: '닉네임',
        dataIndex: 'nickname',
        key: 'nickname',
        render: (value: string | undefined, record) => value || record.userName || '-',
        width: 140,
      },
      {
        title: '이름',
        dataIndex: 'userName',
        key: 'userName',
        width: 120,
      },
      {
        title: '이메일',
        dataIndex: 'emailAddress',
        key: 'emailAddress',
        ellipsis: true,
      },
      {
        title: '휴대전화',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        width: 140,
        render: (value: string | undefined) => value || '-',
      },
      {
        title: '상태',
        dataIndex: 'accountStatus',
        key: 'accountStatus',
        width: 90,
        render: (value: UserManagement['accountStatus']) => (
          <Tag color={value === 'active' ? 'green' : value === 'suspended' ? 'orange' : 'default'}>{value}</Tag>
        ),
      },
      {
        title: 'userId',
        dataIndex: 'userId',
        key: 'userId',
        width: 220,
        render: (value: string) => (
          <Typography.Text code style={{ fontSize: 11 }}>
            {value}
          </Typography.Text>
        ),
      },
    ],
    [],
  );

  const handleRowClick = (record: UserManagement) => {
    // 방어적 가드: 클릭이 처리되는 동안 필터가 바뀌었거나 결과가 stale 이면 무시.
    if (tableLoading) return;
    if (!displayedUsers.some((u) => u.userId === record.userId)) return;
    onPick({
      userId: record.userId,
      role: record.userRole,
      nickname: record.nickname ?? '',
      userName: record.userName ?? '',
      emailAddress: record.emailAddress ?? '',
      phoneNumber: record.phoneNumber ?? '',
    });
  };

  return (
    <Modal open={open} onCancel={onCancel} title="사용자 검색" width={900} footer={null} destroyOnHidden>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message="활성(active) 사용자만 표시됩니다."
          description="정지·탈퇴 사용자는 푸시 발송 대상에서 제외됩니다."
        />
        {request.error ? (
          <Alert
            type="error"
            showIcon
            message="사용자 목록을 불러오지 못했습니다."
            action={<Button onClick={request.reload}>다시 시도</Button>}
          />
        ) : null}
        <Space wrap>
          <Radio.Group
            value={role}
            onChange={(event) => {
              setRole(event.target.value as UserPickerRole);
              setPage(1);
            }}
            buttonStyle="solid"
          >
            <Radio.Button value="adopter">입양자</Radio.Button>
            <Radio.Button value="breeder">브리더</Radio.Button>
          </Radio.Group>
          <Input
            prefix={<SearchOutlined />}
            placeholder="이름 또는 이메일 검색"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            allowClear
            style={{ width: 320 }}
          />
        </Space>

        <Table<UserManagement>
          rowKey="userId"
          columns={columns}
          dataSource={displayedUsers}
          loading={tableLoading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: displayedTotal,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          size="middle"
        />
      </Space>
    </Modal>
  );
}
