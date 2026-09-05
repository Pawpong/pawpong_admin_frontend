import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Input, Modal, Radio, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';

import { userApi } from '../../user/api/userApi';
import type { UserManagement } from '../../../shared/types/api.types';

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

interface FetchedSnapshot {
    /** 이 결과가 어떤 필터 조합에 대한 응답인지 표식 */
    key: string;
    users: UserManagement[];
    total: number;
}

const EMPTY_SNAPSHOT: FetchedSnapshot = { key: '', users: [], total: 0 };

const buildFilterKey = (role: UserPickerRole, debounced: string, page: number) =>
    `${role}|${debounced}|${page}`;

/**
 * 푸시 발송 대상 개별 사용자를 검색해서 선택하는 모달.
 *
 * - 역할(입양자/브리더) 라디오 + 검색어(이름/이메일) 입력으로 필터
 * - 결과 테이블에서 한 행 클릭 시 즉시 onPick 호출 후 모달 닫힘
 * - 닉네임 / 이름 / 이메일 / 휴대전화 / userId 컬럼 노출
 *
 * Stale 데이터 방지 전략:
 * - 결과(users + total) 와 그 결과가 속한 filterKey 를 한 atomic state(`fetched`)에 묶는다.
 * - 렌더 시 현재 filterKey 와 `fetched.key` 가 다르면 데이터셋을 빈 배열로 강제해
 *   필터/페이지/역할이 바뀐 직후 첫 paint 에서도 옛 행이 노출/클릭되지 않게 막는다.
 * - 동시에 sequence ref 로 race 도 차단: 늦게 도착한 응답은 무시한다.
 */
export function UserPickerModal({ open, initialRole = 'adopter', onCancel, onPick }: UserPickerModalProps) {
    const [role, setRole] = useState<UserPickerRole>(initialRole);
    const [keyword, setKeyword] = useState('');
    const [debounced, setDebounced] = useState('');
    const [page, setPage] = useState(1);
    const [fetched, setFetched] = useState<FetchedSnapshot>(EMPTY_SNAPSHOT);
    const [loading, setLoading] = useState(false);
    const fetchSeqRef = useRef(0);

    const currentKey = buildFilterKey(role, debounced, page);
    const matched = fetched.key === currentKey;
    // matched=false → 필터/페이지/역할이 바뀐 직후 paint 거나 fetch 가 아직 도착 안 함.
    // 어느 쪽이든 옛 행을 렌더/클릭하지 못하게 빈 데이터셋으로 강제한다.
    const displayedUsers = matched ? fetched.users : [];
    const displayedTotal = matched ? fetched.total : 0;
    // 새 필터/페이지인 동안에는 표를 비어있게 보여주므로 시각적으로도 항상 로딩 인디케이터를 띄운다.
    const tableLoading = loading || !matched;

    // 모달 다시 열릴 때 상태 초기화 (이전 세션 결과/페이지 잔존 방지)
    useEffect(() => {
        if (open) {
            setRole(initialRole);
            setKeyword('');
            setDebounced('');
            setPage(1);
            setFetched(EMPTY_SNAPSHOT);
            fetchSeqRef.current += 1; // 닫혀있는 동안 떠다니던 fetch 까지 무효화
        }
    }, [open, initialRole]);

    // 검색어 디바운스 (300ms)
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(keyword.trim()), 300);
        return () => clearTimeout(timer);
    }, [keyword]);

    const fetchUsers = useCallback(async () => {
        if (!open) return;
        const mySeq = ++fetchSeqRef.current;
        const targetKey = buildFilterKey(role, debounced, page);
        setLoading(true);
        try {
            // 백엔드의 findOneAdopter/findOneBreeder 는 accountStatus='active' 만 허용하므로
            // picker 도 active 사용자만 노출해 발송 직전에 거절당하는 mismatch 를 방지한다.
            const result = await userApi.getUsers({
                userRole: role,
                accountStatus: 'active',
                searchKeyword: debounced || undefined,
                page,
                limit: PAGE_SIZE,
            });
            if (mySeq !== fetchSeqRef.current) return; // 더 최신 fetch 가 진행 중 → 응답 버림
            setFetched({
                key: targetKey,
                users: result.items as UserManagement[],
                total: result.pagination?.totalItems ?? result.items.length,
            });
        } catch (error) {
            if (mySeq !== fetchSeqRef.current) return;
            console.error('user-picker fetch failed:', error);
            message.error('사용자 목록을 불러오지 못했습니다.');
        } finally {
            if (mySeq === fetchSeqRef.current) setLoading(false);
        }
    }, [open, role, debounced, page]);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

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
                    <Tag color={value === 'active' ? 'green' : value === 'suspended' ? 'orange' : 'default'}>
                        {value}
                    </Tag>
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
        if (!matched) return;
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
        <Modal
            open={open}
            onCancel={onCancel}
            title="사용자 검색"
            width={900}
            footer={null}
            destroyOnHidden
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Alert
                    type="info"
                    showIcon
                    message="활성(active) 사용자만 표시됩니다."
                    description="정지/탈퇴 사용자는 백엔드에서 푸시 발송 대상으로 거절되므로 picker 에서 제외했습니다."
                />
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
