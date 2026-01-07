import { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Button,
    Modal,
    Form,
    Input,
    message,
    Space,
    Descriptions,
    Image,
    Card,
    Checkbox,
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ArrowRightOutlined,
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

export default function BreederLevelChangeRequests() {
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<BreederVerification[]>([]);
    const [selectedBreeder, setSelectedBreeder] = useState<BreederVerification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchLevelChangeRequests();
    }, [currentPage, pageSize]);

    const fetchLevelChangeRequests = async () => {
        setLoading(true);
        try {
            const response = await breederApi.getLevelChangeRequests(currentPage, pageSize);
            setDataSource(response.items);
            setTotalCount(response.pagination.totalItems);
        } catch (error: unknown) {
            console.error('Failed to fetch level change requests:', error);
            message.error('레벨 변경 신청 목록을 불러올 수 없습니다.');
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
                    documents: detailData.verificationInfo.documents || [],
                },
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to fetch breeder detail:', error);
            message.error('브리더 상세 정보를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (breederId: string, level: string) => {
        try {
            await breederApi.updateVerification(breederId, {
                verificationStatus: 'approved',
            });
            message.success(`${level === 'elite' ? '엘리트' : '뉴'} 레벨 변경이 승인되었습니다.`);
            await fetchLevelChangeRequests();
        } catch (error) {
            console.error('Failed to approve:', error);
            message.error('승인에 실패했습니다.');
        }
    };

    const handleRejectClick = (record: BreederVerification) => {
        setSelectedBreeder(record);
        setIsRejectModalOpen(true);
    };

    const handleReject = async (values: { rejectionReason: string }) => {
        if (!selectedBreeder) return;

        try {
            await breederApi.updateVerification(selectedBreeder.breederId, {
                verificationStatus: 'rejected',
                rejectionReason: values.rejectionReason,
            });
            message.success('레벨 변경 신청이 거절되었습니다.');
            setIsRejectModalOpen(false);
            form.resetFields();
            await fetchLevelChangeRequests();
        } catch (error) {
            console.error('Failed to reject:', error);
            message.error('거절에 실패했습니다.');
        }
    };

    const getLevelTag = (level: string) => {
        if (level === 'elite') {
            return <Tag color="purple">Elite</Tag>;
        }
        return <Tag color="blue">New</Tag>;
    };

    const columns: ColumnsType<BreederVerification> = [
        {
            title: '브리더명',
            dataIndex: 'breederName',
            key: 'breederName',
            width: 120,
        },
        {
            title: '이메일',
            dataIndex: 'emailAddress',
            key: 'emailAddress',
            width: 200,
            responsive: ['md'],
        },
        {
            title: '전화번호',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: 140,
            responsive: ['lg'],
        },
        {
            title: '레벨 변경',
            key: 'levelChange',
            width: 180,
            render: (_, record) => (
                <Space>
                    {getLevelTag(record.verificationInfo.previousLevel || 'new')}
                    <ArrowRightOutlined style={{ color: '#999' }} />
                    {getLevelTag(record.verificationInfo.level)}
                </Space>
            ),
        },
        {
            title: '신청일',
            dataIndex: ['verificationInfo', 'submittedAt'],
            key: 'submittedAt',
            width: 120,
            responsive: ['md'],
            render: (date: string) => (date ? new Date(date).toLocaleDateString('ko-KR') : '-'),
        },
        {
            title: '작업',
            key: 'actions',
            width: 280,
            fixed: 'right' as const,
            render: (_, record) => (
                <Space size="small" wrap>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                        size="small"
                    >
                        상세
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(record.breederId, record.verificationInfo.level)}
                        size="small"
                        style={{
                            backgroundColor: 'var(--color-primary-500)',
                            borderColor: 'var(--color-primary-500)',
                        }}
                    >
                        승인
                    </Button>
                    <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleRejectClick(record)}
                        size="small"
                    >
                        거절
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-3 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">레벨 변경 신청 관리</h1>

            {/* 통계 카드 */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 gap-4">
                    <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500">총 레벨 변경 신청</p>
                        <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-500)' }}>
                            {totalCount}건
                        </p>
                    </div>
                </div>
            </Card>

            {/* 테이블 */}
            <div className="overflow-x-auto -mx-3 sm:mx-0">
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="breederId"
                    loading={loading}
                    scroll={{ x: 800 }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size || 10);
                        },
                        showSizeChanger: true,
                        showTotal: (total) => `총 ${total}건`,
                    }}
                />
            </div>

            {/* 상세 정보 모달 */}
            <Modal
                title="레벨 변경 신청 상세"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
            >
                {selectedBreeder && (
                    <div>
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="브리더명">{selectedBreeder.breederName}</Descriptions.Item>
                            <Descriptions.Item label="이메일">{selectedBreeder.emailAddress}</Descriptions.Item>
                            <Descriptions.Item label="전화번호">
                                {selectedBreeder.phoneNumber || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="레벨 변경">
                                <Space>
                                    {getLevelTag(selectedBreeder.verificationInfo.previousLevel || 'new')}
                                    <ArrowRightOutlined />
                                    {getLevelTag(selectedBreeder.verificationInfo.level)}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="요금제">
                                {selectedBreeder.verificationInfo.subscriptionPlan === 'pro' ? 'Pro' : 'Basic'}
                            </Descriptions.Item>
                            <Descriptions.Item label="신청일">
                                {selectedBreeder.verificationInfo.submittedAt
                                    ? new Date(selectedBreeder.verificationInfo.submittedAt).toLocaleString('ko-KR')
                                    : '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        <h3 className="mt-6 mb-3 font-semibold">제출 서류</h3>
                        <div className="space-y-4">
                            {selectedBreeder.verificationInfo.documents?.map((doc, index) => (
                                <div key={index} className="border rounded p-3">
                                    <p className="font-medium mb-2">
                                        {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                                    </p>
                                    {doc.fileUrl && (
                                        <Image
                                            src={doc.fileUrl}
                                            alt={doc.type}
                                            style={{ maxWidth: '100%', maxHeight: '400px' }}
                                        />
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        업로드: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString('ko-KR') : '-'}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button onClick={() => setIsModalOpen(false)}>닫기</Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => {
                                    handleApprove(selectedBreeder.breederId, selectedBreeder.verificationInfo.level);
                                    setIsModalOpen(false);
                                }}
                                style={{
                                    backgroundColor: 'var(--color-primary-500)',
                                    borderColor: 'var(--color-primary-500)',
                                }}
                            >
                                승인
                            </Button>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                    setIsModalOpen(false);
                                    handleRejectClick(selectedBreeder);
                                }}
                            >
                                거절
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* 거절 사유 입력 모달 */}
            <Modal
                title="레벨 변경 신청 거절"
                open={isRejectModalOpen}
                onCancel={() => {
                    setIsRejectModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="거절"
                cancelText="취소"
                okButtonProps={{ danger: true }}
            >
                <Form form={form} layout="vertical" onFinish={handleReject}>
                    <Form.Item label="거절 사유 선택">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">공통 사유:</p>
                            {COMMON_REJECTION_REASONS.map((reason, index) => (
                                <Checkbox
                                    key={index}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            const currentReason = form.getFieldValue('rejectionReason') || '';
                                            form.setFieldsValue({
                                                rejectionReason: currentReason
                                                    ? `${currentReason}\n- ${reason}`
                                                    : `- ${reason}`,
                                            });
                                        }
                                    }}
                                >
                                    {reason}
                                </Checkbox>
                            ))}

                            {selectedBreeder?.verificationInfo.level === 'elite' && (
                                <>
                                    <p className="text-sm font-medium mt-4">엘리트 레벨 전용 사유:</p>
                                    {ELITE_REJECTION_REASONS.map((reason, index) => (
                                        <Checkbox
                                            key={index}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const currentReason = form.getFieldValue('rejectionReason') || '';
                                                    form.setFieldsValue({
                                                        rejectionReason: currentReason
                                                            ? `${currentReason}\n- ${reason}`
                                                            : `- ${reason}`,
                                                    });
                                                }
                                            }}
                                        >
                                            {reason}
                                        </Checkbox>
                                    ))}
                                </>
                            )}
                        </div>
                    </Form.Item>

                    <Form.Item
                        label="거절 사유"
                        name="rejectionReason"
                        rules={[{ required: true, message: '거절 사유를 입력해주세요.' }]}
                    >
                        <TextArea
                            rows={6}
                            placeholder="거절 사유를 입력하세요..."
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
