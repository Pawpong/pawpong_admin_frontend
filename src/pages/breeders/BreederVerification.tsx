import { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Button,
    Modal,
    Form,
    Checkbox,
    Input,
    message,
    Space,
    Descriptions,
    Image,
    Card,
    Tabs,
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    FileTextOutlined,
    BellOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { breederApi } from '../../features/breeder/api/breederApi';
import type { BreederVerification } from '../../shared/types/api.types';

const { TextArea } = Input;

// 반려 사유 목록 - 공통
const COMMON_REJECTION_REASONS = [
    '제출한 서류가 식별이 어렵거나 해상도가 낮음',
    '유효하지 않거나 만료된 서류 제출',
    '필수 제출 서류 일부 누락',
    '제출한 서류의 상호명이 브리더 정보에 입력한 상호명과 일치하지 않음',
    '제출한 서류의 성명과 신분증 상 성명이 일치하지 않음',
    'SNS, 커뮤니티 등에서 허위 홍보나 불법 거래 사례가 확인됨',
    '타인의 사진 또는 자료 도용이 확인됨',
    '브리더의 윤리 기준이 포퐁의 가치관과 현저히 부합하지 않음',
    '동물 복지 수준이 명백히 낮다고 판단됨 (비위생적 환경, 과번식 등)',
    '비윤리적 번식 정황 확인',
];

// 반려 사유 목록 - 엘리트 레벨 한정
const ELITE_REJECTION_REASONS = [
    '브리딩 품종이 3종 이상으로 확인되었거나, 프로필에서 3종 이상 선택함',
    '도그쇼/캣쇼 참가 이력 증빙이 불충분하거나 허위로 확인됨',
    '혈통서, 협회 등록증 등 전문성 증빙 서류가 기준에 미달',
];

// 서류 타입 한국어 매핑
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    id_card: '신분증 사본',
    animal_production_license: '동물생산업 등록증',
    adoption_contract_sample: '표준 입양계약서 샘플',
    recent_pedigree_document: '최근 발급된 혈통서 사본',
    breeder_certification: '고양이 브리더 인증 서류',
};

export default function BreederVerification() {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<BreederVerification[]>([]);
    const [selectedBreeder, setSelectedBreeder] = useState<BreederVerification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDocumentRemindModalOpen, setIsDocumentRemindModalOpen] = useState(false);
    const [selectedBreeders, setSelectedBreeders] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined); // 상태 필터 추가
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchVerifications();
    }, [statusFilter, currentPage, pageSize]);

    const fetchVerifications = async () => {
        setLoading(true);
        try {
            const response = await breederApi.getBreeders(statusFilter, currentPage, pageSize);
            setDataSource(response.items);
            setTotalCount(response.pagination.totalItems);
        } catch (error: unknown) {
            console.error('Failed to fetch verifications:', error);
            message.error('브리더 목록을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (record: BreederVerification) => {
        try {
            setLoading(true);
            const detailData = await breederApi.getBreederDetail(record.breederId);
            setSelectedBreeder({
                ...record,
                verificationInfo: {
                    ...record.verificationInfo,
                    ...detailData.verificationInfo,
                },
                profileInfo: detailData.profileInfo || record.profileInfo,
                createdAt: detailData.createdAt,
                updatedAt: detailData.updatedAt,
            });
            setIsModalOpen(true);
        } catch (error: unknown) {
            console.error('Failed to fetch breeder details:', error);
            message.error('브리더 상세 정보를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsReviewing = async (breederId: string) => {
        console.log('🔵 [handleMarkAsReviewing] 호출됨 - breederId:', breederId);

        // 임시: Modal.confirm 건너뛰고 바로 실행해서 테스트
        console.log('🟢 [handleMarkAsReviewing] API 호출 시작 (Modal 건너뜀)');
        try {
            await breederApi.updateVerification(breederId, {
                verificationStatus: 'reviewing',
            });
            console.log('✅ [handleMarkAsReviewing] API 호출 성공');
            message.success('리뷰 완료로 표시되었습니다.');
            setIsModalOpen(false);
            fetchVerifications();
        } catch (error: unknown) {
            console.error('❌ [handleMarkAsReviewing] API 호출 실패:', error);
            message.error('상태 변경에 실패했습니다.');
        }
    };

    const handleApprove = async (breederId: string, level: 'new' | 'elite') => {
        console.log('🔵 [handleApprove] 호출됨 - breederId:', breederId, 'level:', level);

        // 임시: Modal.confirm 건너뛰고 바로 실행해서 테스트
        console.log('🟢 [handleApprove] API 호출 시작 (Modal 건너뜀)');
        try {
            await breederApi.updateVerification(breederId, {
                verificationStatus: 'approved',
            });
            console.log('✅ [handleApprove] API 호출 성공');
            message.success('브리더 인증이 승인되었습니다.');
            setIsModalOpen(false);
            fetchVerifications();
        } catch (error: unknown) {
            console.error('❌ [handleApprove] API 호출 실패:', error);
            message.error('승인에 실패했습니다.');
        }
    };

    const handleReject = (record: BreederVerification) => {
        console.log('🔵 [handleReject] 호출됨 - breederId:', record.breederId);
        setSelectedBreeder(record);
        setIsRejectModalOpen(true);
        form.resetFields();
    };

    const handleRejectSubmit = async () => {
        try {
            const values = await form.validateFields();
            const selectedReasons = values.rejectionReasons || [];
            const customReason = values.customReason || '';

            // 체크박스 선택된 항목 조합
            const rejectionReason = [...selectedReasons, customReason && `기타: ${customReason}`]
                .filter(Boolean)
                .join('\n');

            if (!selectedBreeder) return;

            await breederApi.updateVerification(selectedBreeder.breederId, {
                verificationStatus: 'rejected',
                rejectionReason,
            });

            message.success('브리더 인증이 반려되었습니다. 반려 사유가 이메일로 발송됩니다.');
            setIsRejectModalOpen(false);
            fetchVerifications();
        } catch (error: unknown) {
            console.error('Rejection failed:', error);
            message.error('반려 처리에 실패했습니다.');
        }
    };

    // 입점 심사 독촉 알림
    const handleDocumentRemindClick = () => {
        if (selectedBreeders.length === 0) {
            message.warning('입점 심사 독촉 알림을 보낼 브리더를 선택해주세요.');
            return;
        }
        setIsDocumentRemindModalOpen(true);
    };

    const handleDocumentRemindSubmit = async () => {
        try {
            await breederApi.sendReminder(selectedBreeders, 'document_reminder');
            message.success(`${selectedBreeders.length}명의 브리더에게 입점 심사 독촉 알림이 발송되었습니다.`);
            setIsDocumentRemindModalOpen(false);
            setSelectedBreeders([]);
        } catch (error: unknown) {
            console.error('Document remind failed:', error);
            message.error('입점 심사 독촉 알림 발송에 실패했습니다.');
        }
    };

    const columns: ColumnsType<BreederVerification> = [
        {
            title: '브리더명',
            dataIndex: 'breederName',
            key: 'breederName',
            width: 150,
        },
        {
            title: '이메일',
            dataIndex: 'emailAddress',
            key: 'emailAddress',
            width: 200,
        },
        {
            title: '요금제',
            dataIndex: ['verificationInfo', 'subscriptionPlan'],
            key: 'subscriptionPlan',
            width: 120,
            render: (plan: string) => (
                <Tag color={plan === 'premium' ? 'gold' : 'blue'}>{plan === 'premium' ? '프리미엄' : '베이직'}</Tag>
            ),
        },
        {
            title: '신청 레벨',
            dataIndex: ['verificationInfo', 'level'],
            key: 'level',
            width: 100,
            render: (level: string) => (
                <Tag
                    color={level === 'elite' ? 'purple' : 'green'}
                    style={{
                        backgroundColor:
                            level === 'elite' ? 'var(--color-level-elite-100)' : 'var(--color-level-new-100)',
                        color: level === 'elite' ? 'var(--color-level-elite-500)' : 'var(--color-level-new-500)',
                        borderColor: level === 'elite' ? 'var(--color-level-elite-500)' : 'var(--color-level-new-500)',
                        fontWeight: 500,
                    }}
                >
                    {level === 'elite' ? '엘리트' : '뉴'}
                </Tag>
            ),
        },
        {
            title: '신청일',
            dataIndex: ['verificationInfo', 'submittedAt'],
            key: 'submittedAt',
            width: 150,
            render: (date: string) => (date ? new Date(date).toLocaleDateString('ko-KR') : '-'),
        },
        {
            title: '상태',
            dataIndex: ['verificationInfo', 'verificationStatus'],
            key: 'verificationStatus',
            width: 120,
            render: (status: string) => {
                const statusMap: Record<string, { label: string; color: string }> = {
                    pending: { label: '대기 중', color: 'default' },
                    reviewing: { label: '검토 중', color: 'processing' },
                    approved: { label: '승인됨', color: 'success' },
                    rejected: { label: '반려됨', color: 'error' },
                };
                const statusInfo = statusMap[status] || { label: status, color: 'default' };
                return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
            },
        },
        {
            title: '액션',
            key: 'action',
            width: 400,
            render: (_, record) => {
                const appliedLevel = record.verificationInfo?.level || 'new';
                return (
                    <Space size="small" onClick={(e) => e.stopPropagation()}>
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(record);
                            }}
                        >
                            상세 보기
                        </Button>
                        <Button
                            onClick={(e) => {
                                console.log('🟡 [테이블 버튼] 리뷰 완료 버튼 클릭됨', record.breederId);
                                e.stopPropagation();
                                handleMarkAsReviewing(record.breederId);
                            }}
                            size="small"
                            style={{
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                borderColor: '#f59e0b',
                                fontWeight: 500,
                            }}
                        >
                            리뷰 완료
                        </Button>
                        {appliedLevel === 'elite' && (
                            <Button
                                icon={<CheckCircleOutlined />}
                                onClick={(e) => {
                                    console.log('🟡 [테이블 버튼] 엘리트 승인 버튼 클릭됨', record.breederId);
                                    e.stopPropagation();
                                    handleApprove(record.breederId, 'elite');
                                }}
                                size="small"
                                style={{
                                    backgroundColor: 'var(--color-level-elite-100)',
                                    color: 'var(--color-level-elite-500)',
                                    borderColor: 'var(--color-level-elite-500)',
                                    fontWeight: 500,
                                }}
                            >
                                엘리트 승인
                            </Button>
                        )}
                        {appliedLevel === 'new' && (
                            <Button
                                icon={<CheckCircleOutlined />}
                                onClick={(e) => {
                                    console.log('🟡 [테이블 버튼] 뉴 승인 버튼 클릭됨', record.breederId);
                                    e.stopPropagation();
                                    handleApprove(record.breederId, 'new');
                                }}
                                size="small"
                                style={{
                                    backgroundColor: 'var(--color-level-new-100)',
                                    color: 'var(--color-level-new-500)',
                                    borderColor: 'var(--color-level-new-500)',
                                    fontWeight: 500,
                                }}
                            >
                                뉴 승인
                            </Button>
                        )}
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={(e) => {
                                console.log('🟡 [테이블 버튼] 반려 버튼 클릭됨', record.breederId);
                                e.stopPropagation();
                                handleReject(record);
                            }}
                            size="small"
                        >
                            반려
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="p-3 sm:p-4 md:p-6">
            {/* 페이지 헤더 */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-500)' }}>
                    브리더 신청 관리
                </h1>
                <p className="text-sm sm:text-base text-gray-500">브리더 입점 신청을 검토하고 승인/반려 처리합니다</p>
            </div>

            {/* 통계 카드 */}
            <Card
                className="mb-4 sm:mb-6"
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg"
                        style={{ backgroundColor: 'var(--color-tertiary-500)' }}
                    >
                        <FileTextOutlined
                            style={{ fontSize: '20px', color: 'var(--color-primary-500)' }}
                            className="sm:text-2xl"
                        />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm text-gray-500">총 브리더</p>
                        <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-500)' }}>
                            {totalCount}명
                        </p>
                    </div>
                </div>
            </Card>

            {/* 상태 필터 탭 */}
            <Tabs
                activeKey={statusFilter || 'all'}
                onChange={(key) => {
                    setStatusFilter(key === 'all' ? undefined : key);
                    setCurrentPage(1);
                }}
                className="mb-4"
                items={[
                    { key: 'all', label: '전체' },
                    { key: 'pending', label: '대기 중 (서류 미제출)' },
                    { key: 'reviewing', label: '검토 중' },
                    { key: 'approved', label: '승인됨' },
                    { key: 'rejected', label: '반려됨' },
                ]}
            />

            {/* 액션 버튼 */}
            <div className="mb-4 flex justify-end">
                <Button
                    icon={<BellOutlined />}
                    onClick={handleDocumentRemindClick}
                    disabled={selectedBreeders.length === 0}
                    style={{
                        backgroundColor: selectedBreeders.length > 0 ? '#f59e0b' : undefined,
                        color: selectedBreeders.length > 0 ? '#fff' : undefined,
                        borderColor: selectedBreeders.length > 0 ? '#f59e0b' : undefined,
                    }}
                >
                    입점 심사 독촉 알림 ({selectedBreeders.length})
                </Button>
            </div>

            {/* 테이블 스크롤 래퍼 - 모바일에서 가로 스크롤 가능 */}
            <div className="overflow-x-auto -mx-3 sm:mx-0">
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="breederId"
                    loading={loading}
                    scroll={{ x: 800 }}
                    rowSelection={{
                        selectedRowKeys: selectedBreeders,
                        onChange: (selectedRowKeys) => setSelectedBreeders(selectedRowKeys as string[]),
                    }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        showSizeChanger: true,
                        showTotal: (total) => `총 ${total}건`,
                        responsive: true,
                        onChange: (page, newPageSize) => {
                            setCurrentPage(page);
                            setPageSize(newPageSize);
                        },
                    }}
                />
            </div>

            {/* 상세 보기 모달 */}
            <Modal
                title="브리더 상세 정보"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width="100%"
                style={{ maxWidth: '800px', top: 20 }}
                styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
            >
                {selectedBreeder && (
                    <div>
                        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
                            {/* 기본 정보 */}
                            <Descriptions.Item label="브리더명">{selectedBreeder.breederName}</Descriptions.Item>
                            <Descriptions.Item label="이메일">{selectedBreeder.emailAddress}</Descriptions.Item>

                            {/* 인증 정보 */}
                            <Descriptions.Item label="신청 레벨">
                                <Tag
                                    style={{
                                        backgroundColor:
                                            selectedBreeder.verificationInfo.level === 'elite'
                                                ? 'var(--color-level-elite-100)'
                                                : 'var(--color-level-new-100)',
                                        color:
                                            selectedBreeder.verificationInfo.level === 'elite'
                                                ? 'var(--color-level-elite-500)'
                                                : 'var(--color-level-new-500)',
                                        borderColor:
                                            selectedBreeder.verificationInfo.level === 'elite'
                                                ? 'var(--color-level-elite-500)'
                                                : 'var(--color-level-new-500)',
                                        fontWeight: 500,
                                    }}
                                >
                                    {selectedBreeder.verificationInfo.level === 'elite' ? '엘리트' : '뉴'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="요금제">
                                <Tag
                                    color={
                                        selectedBreeder.verificationInfo.subscriptionPlan === 'premium'
                                            ? 'gold'
                                            : 'blue'
                                    }
                                >
                                    {selectedBreeder.verificationInfo.subscriptionPlan === 'premium'
                                        ? '프리미엄'
                                        : '베이직'}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="상태" span={2}>
                                {(() => {
                                    const status = selectedBreeder.verificationInfo.verificationStatus;
                                    const statusMap: Record<string, { label: string; color: string }> = {
                                        pending: { label: '대기 중', color: 'default' },
                                        reviewing: { label: '검토 중', color: 'processing' },
                                        approved: { label: '승인됨', color: 'success' },
                                        rejected: { label: '반려됨', color: 'error' },
                                    };
                                    const statusInfo = statusMap[status] || { label: status, color: 'default' };
                                    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
                                })()}
                            </Descriptions.Item>

                            {/* 일시 정보 */}
                            <Descriptions.Item label="계정 생성일">
                                {selectedBreeder.createdAt
                                    ? new Date(selectedBreeder.createdAt).toLocaleString('ko-KR')
                                    : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="신청일">
                                {selectedBreeder.verificationInfo.submittedAt
                                    ? new Date(selectedBreeder.verificationInfo.submittedAt).toLocaleString('ko-KR')
                                    : '-'}
                            </Descriptions.Item>

                            {/* 위치 정보 */}
                            <Descriptions.Item label="지역">
                                {selectedBreeder.profileInfo?.location
                                    ? String(selectedBreeder.profileInfo.location)
                                    : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="세부 지역">
                                {selectedBreeder.profileInfo?.detailedLocation
                                    ? String(selectedBreeder.profileInfo.detailedLocation)
                                    : '-'}
                            </Descriptions.Item>

                            {/* 전문 분야 */}
                            <Descriptions.Item label="전문 분야" span={2}>
                                {selectedBreeder.profileInfo?.specialization &&
                                Array.isArray(selectedBreeder.profileInfo.specialization) &&
                                selectedBreeder.profileInfo.specialization.length > 0
                                    ? selectedBreeder.profileInfo.specialization.map((spec: unknown) => (
                                          <Tag key={String(spec)} color="blue">
                                              {spec === 'dog' ? '강아지' : '고양이'}
                                          </Tag>
                                      ))
                                    : '-'}
                            </Descriptions.Item>

                            {/* 품종 정보 */}
                            <Descriptions.Item label="품종" span={2}>
                                {selectedBreeder.profileInfo?.breeds &&
                                Array.isArray(selectedBreeder.profileInfo.breeds) &&
                                selectedBreeder.profileInfo.breeds.length > 0 ? (
                                    <>
                                        {selectedBreeder.profileInfo.breeds.map((breed: unknown) => (
                                            <Tag key={String(breed)} color="green">
                                                {String(breed)}
                                            </Tag>
                                        ))}
                                        <span style={{ marginLeft: '8px', color: '#666' }}>
                                            ({selectedBreeder.profileInfo.breeds.length}종)
                                        </span>
                                    </>
                                ) : (
                                    '-'
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="mt-4 sm:mt-6">
                            <h3 className="text-base sm:text-lg font-semibold mb-3">제출된 서류</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {selectedBreeder.verificationInfo.documents &&
                                selectedBreeder.verificationInfo.documents.length > 0 ? (
                                    selectedBreeder.verificationInfo.documents.map((doc, index) => {
                                        const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf');
                                        return (
                                            <div key={index} className="border p-2 rounded">
                                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                                    {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                                                </p>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    업로드:{' '}
                                                    {doc.uploadedAt
                                                        ? new Date(doc.uploadedAt).toLocaleDateString('ko-KR')
                                                        : '-'}
                                                </p>
                                                {isPdf ? (
                                                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded">
                                                        <FileTextOutlined
                                                            style={{ fontSize: '48px', color: '#d32f2f' }}
                                                        />
                                                        <p className="text-sm text-gray-600 mt-2 mb-3">PDF 파일</p>
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            icon={<EyeOutlined />}
                                                            onClick={() =>
                                                                window.open(doc.fileUrl || doc.url, '_blank')
                                                            }
                                                        >
                                                            PDF 보기
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Image
                                                        src={doc.fileUrl || doc.url || '/placeholder.png'}
                                                        alt={DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                                                        className="w-full"
                                                        fallback="/placeholder.png"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-2 text-center text-gray-500 py-4">
                                        제출된 서류가 없습니다
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2">
                            <Button onClick={() => setIsModalOpen(false)} block className="sm:w-auto">
                                닫기
                            </Button>
                            <Button
                                type="default"
                                block
                                className="sm:w-auto"
                                onClick={() => {
                                    console.log('🟡 [모달 버튼] 리뷰 완료 버튼 클릭됨', selectedBreeder.breederId);
                                    handleMarkAsReviewing(selectedBreeder.breederId);
                                }}
                                style={{
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                    borderColor: '#f59e0b',
                                    fontWeight: 500,
                                }}
                            >
                                리뷰 완료
                            </Button>
                            {selectedBreeder.verificationInfo.level === 'elite' && (
                                <Button
                                    block
                                    className="sm:w-auto"
                                    onClick={() => {
                                        console.log(
                                            '🟡 [모달 버튼] 엘리트 승인 버튼 클릭됨',
                                            selectedBreeder.breederId,
                                        );
                                        handleApprove(selectedBreeder.breederId, 'elite');
                                    }}
                                    style={{
                                        backgroundColor: 'var(--color-level-elite-500)',
                                        color: '#fff',
                                        borderColor: 'var(--color-level-elite-500)',
                                        fontWeight: 500,
                                    }}
                                >
                                    엘리트 승인
                                </Button>
                            )}
                            {selectedBreeder.verificationInfo.level === 'new' && (
                                <Button
                                    block
                                    className="sm:w-auto"
                                    onClick={() => {
                                        console.log('🟡 [모달 버튼] 뉴 승인 버튼 클릭됨', selectedBreeder.breederId);
                                        handleApprove(selectedBreeder.breederId, 'new');
                                    }}
                                    style={{
                                        backgroundColor: 'var(--color-level-new-500)',
                                        color: '#fff',
                                        borderColor: 'var(--color-level-new-500)',
                                        fontWeight: 500,
                                    }}
                                >
                                    뉴 승인
                                </Button>
                            )}
                            <Button
                                danger
                                block
                                className="sm:w-auto"
                                onClick={() => {
                                    console.log('🟡 [모달 버튼] 반려 버튼 클릭됨', selectedBreeder.breederId);
                                    setIsModalOpen(false);
                                    handleReject(selectedBreeder);
                                }}
                            >
                                반려
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 반려 사유 모달 */}
            <Modal
                title="브리더 인증 반려"
                open={isRejectModalOpen}
                onOk={handleRejectSubmit}
                onCancel={() => setIsRejectModalOpen(false)}
                okText="반려 처리"
                okButtonProps={{ danger: true }}
                cancelText="취소"
                width="100%"
                style={{ maxWidth: '600px', top: 20 }}
                styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="rejectionReasons"
                        label="반려 사유 (복수 선택 가능)"
                        rules={[{ required: true, message: '최소 1개 이상 선택해주세요' }]}
                    >
                        <Checkbox.Group style={{ width: '100%' }}>
                            {/* 공통 반려 사유 */}
                            <div className="mb-4">
                                <div
                                    className="px-3 py-2 rounded mb-3"
                                    style={{
                                        backgroundColor: 'var(--color-tertiary-500)',
                                        borderLeft: '3px solid var(--color-primary-500)',
                                    }}
                                >
                                    <p className="text-sm font-semibold" style={{ color: 'var(--color-primary-500)' }}>
                                        ✅ 공통 반려 사유
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 pl-2">
                                    {COMMON_REJECTION_REASONS.map((reason, index) => (
                                        <Checkbox key={`common-${index}`} value={reason}>
                                            <span className="text-sm">{reason}</span>
                                        </Checkbox>
                                    ))}
                                </div>
                            </div>

                            {/* 엘리트 레벨 한정 반려 사유 */}
                            {selectedBreeder?.verificationInfo?.level === 'elite' && (
                                <div className="mt-4">
                                    <div
                                        className="px-3 py-2 rounded mb-3"
                                        style={{
                                            backgroundColor: 'var(--color-level-elite-100)',
                                            borderLeft: '3px solid var(--color-level-elite-500)',
                                        }}
                                    >
                                        <p
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--color-level-elite-500)' }}
                                        >
                                            🏅 엘리트 레벨 한정 반려 사유
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 pl-2">
                                        {ELITE_REJECTION_REASONS.map((reason, index) => (
                                            <Checkbox key={`elite-${index}`} value={reason}>
                                                <span className="text-sm">{reason}</span>
                                            </Checkbox>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Checkbox.Group>
                    </Form.Item>

                    <Form.Item name="customReason" label="기타 사유 (선택)">
                        <TextArea rows={3} placeholder="기타 반려 사유를 입력해주세요" maxLength={500} showCount />
                    </Form.Item>

                    <div
                        className="p-3 rounded mb-3"
                        style={{ backgroundColor: '#fef3c7', borderLeft: '3px solid #f59e0b' }}
                    >
                        <p className="text-sm" style={{ color: '#92400e' }}>
                            💡 선택된 반려 사유는 자동으로 이메일에 포함되어 브리더에게 발송됩니다.
                        </p>
                    </div>

                    <div
                        className="p-3 rounded"
                        style={{ backgroundColor: '#dbeafe', borderLeft: '3px solid #3b82f6' }}
                    >
                        <p className="text-sm" style={{ color: '#1e40af' }}>
                            📱 <strong>카카오 알림톡:</strong> 프리미엄(Pro) 요금제 브리더에게만 발송됩니다.
                        </p>
                    </div>
                </Form>
            </Modal>

            {/* 입점 심사 독촉 알림 모달 */}
            <Modal
                title="입점 심사 독촉 알림 발송"
                open={isDocumentRemindModalOpen}
                onOk={handleDocumentRemindSubmit}
                onCancel={() => setIsDocumentRemindModalOpen(false)}
                okText="발송"
                cancelText="취소"
                width="100%"
                style={{ maxWidth: '500px', top: 20 }}
                styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
            >
                <p className="mb-4 text-sm text-gray-600">
                    선택한 {selectedBreeders.length}명의 브리더에게 입점 심사 독촉 알림을 발송합니다.
                </p>

                <div
                    className="p-4 rounded mb-4"
                    style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}
                >
                    <p className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>
                        📄 발송 메시지
                    </p>
                    <p className="text-sm mb-2" style={{ color: '#78350f' }}>
                        <strong>서비스 알림:</strong> 브리더 입점 절차가 아직 완료되지 않았어요! 필요한 서류들을
                        제출하시면 입양자에게 프로필이 공개됩니다.
                    </p>
                    <p className="text-sm" style={{ color: '#78350f' }}>
                        <strong>이메일:</strong> [포퐁] 브리더 입점 절차를 완료해주세요 ✨
                    </p>
                </div>

                <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-tertiary-500)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-primary-500)' }}>
                        💡 서류 미제출 상태(PENDING)인 브리더에게만 발송됩니다.
                    </p>
                </div>

                <div
                    className="p-3 rounded"
                    style={{ backgroundColor: '#dbeafe', borderLeft: '3px solid #3b82f6' }}
                >
                    <p className="text-sm" style={{ color: '#1e40af' }}>
                        📱 <strong>카카오 알림톡:</strong> 프리미엄(Pro) 요금제 브리더에게만 발송됩니다.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
