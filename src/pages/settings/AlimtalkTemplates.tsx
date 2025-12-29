import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Tag,
    Modal,
    Form,
    Input,
    Switch,
    Select,
    Space,
    message,
    Card,
    Descriptions,
    Popconfirm,
} from 'antd';
import { EditOutlined, ReloadOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { alimtalkApi } from '../../features/alimtalk/api/alimtalkApi';
import type {
    AlimtalkTemplate,
    AlimtalkButton,
    AlimtalkButtonType,
    AlimtalkTemplateCreateRequest,
} from '../../shared/types/api.types';

/**
 * 알림톡 템플릿 관리 페이지
 *
 * 기능:
 * - 알림톡 템플릿 목록 조회
 * - 템플릿 생성 (CoolSMS 검수 후 등록)
 * - 템플릿 상세 조회 (모달)
 * - 템플릿 수정 (templateId, isActive, memo, reviewStatus)
 * - 템플릿 삭제
 * - 캐시 새로고침
 */
export default function AlimtalkTemplates() {
    const [templates, setTemplates] = useState<AlimtalkTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<AlimtalkTemplate | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // 검수 상태 색상
    const reviewStatusColor: Record<string, string> = {
        pending: 'processing',
        approved: 'success',
        rejected: 'error',
        re_review: 'warning',
    };

    // 검수 상태 텍스트
    const reviewStatusText: Record<string, string> = {
        pending: '검수대기',
        approved: '검수통과',
        rejected: '검수거절',
        re_review: '재검수',
    };

    // 버튼 타입 텍스트
    const buttonTypeText: Record<AlimtalkButtonType, string> = {
        WL: '웹링크',
        AL: '앱링크',
        BK: '봇키워드',
        MD: '메시지전달',
        DS: '배송조회',
        BC: '상담톡전환',
        BT: '봇전환',
        AC: '채널추가',
    };

    // 템플릿 목록 조회
    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await alimtalkApi.getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('템플릿 목록 조회 실패:', error);
            message.error('템플릿 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 템플릿 상세 조회 모달 열기
    const showDetailModal = async (templateCode: string) => {
        try {
            const template = await alimtalkApi.getTemplateByCode(templateCode);
            setSelectedTemplate(template);
            setDetailModalVisible(true);
        } catch (error) {
            console.error('템플릿 상세 조회 실패:', error);
            message.error('템플릿 상세 정보를 불러오는데 실패했습니다.');
        }
    };

    // 템플릿 생성 모달 열기
    const showCreateModal = () => {
        createForm.resetFields();
        createForm.setFieldsValue({
            fallbackToSms: true,
            isActive: true,
            reviewStatus: 'approved',
            requiredVariables: [],
        });
        setCreateModalVisible(true);
    };

    // 템플릿 생성 처리
    const handleCreate = async (values: any) => {
        try {
            const createData: AlimtalkTemplateCreateRequest = {
                templateCode: values.templateCode,
                templateId: values.templateId,
                name: values.name,
                description: values.description,
                requiredVariables: values.requiredVariables || [],
                fallbackToSms: values.fallbackToSms,
                isActive: values.isActive,
                reviewStatus: values.reviewStatus,
                memo: values.memo,
            };

            await alimtalkApi.createTemplate(createData);
            message.success('템플릿이 생성되었습니다.');
            setCreateModalVisible(false);
            createForm.resetFields();
            fetchTemplates();
        } catch (error: any) {
            console.error('템플릿 생성 실패:', error);
            const errorMessage = error.response?.data?.message || '템플릿 생성에 실패했습니다.';
            message.error(errorMessage);
        }
    };

    // 템플릿 수정 모달 열기
    const showEditModal = (template: AlimtalkTemplate) => {
        setSelectedTemplate(template);
        editForm.setFieldsValue({
            templateId: template.templateId,
            isActive: template.isActive,
            memo: template.memo || '',
            reviewStatus: template.reviewStatus,
        });
        setEditModalVisible(true);
    };

    // 템플릿 수정 처리
    const handleUpdate = async (values: any) => {
        if (!selectedTemplate) return;

        try {
            await alimtalkApi.updateTemplate(selectedTemplate.templateCode, {
                templateId: values.templateId,
                isActive: values.isActive,
                memo: values.memo,
                reviewStatus: values.reviewStatus,
            });
            message.success('템플릿이 수정되었습니다.');
            setEditModalVisible(false);
            editForm.resetFields();
            fetchTemplates();
        } catch (error) {
            console.error('템플릿 수정 실패:', error);
            message.error('템플릿 수정에 실패했습니다.');
        }
    };

    // 템플릿 삭제 처리
    const handleDelete = async (templateCode: string) => {
        try {
            await alimtalkApi.deleteTemplate(templateCode);
            message.success('템플릿이 삭제되었습니다.');
            fetchTemplates();
        } catch (error) {
            console.error('템플릿 삭제 실패:', error);
            message.error('템플릿 삭제에 실패했습니다.');
        }
    };

    // 캐시 새로고침
    const handleRefreshCache = async () => {
        setRefreshing(true);
        try {
            await alimtalkApi.refreshCache();
            message.success('캐시가 새로고침되었습니다.');
            await fetchTemplates();
        } catch (error) {
            console.error('캐시 새로고침 실패:', error);
            message.error('캐시 새로고침에 실패했습니다.');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // 테이블 컬럼 정의
    const columns: ColumnsType<AlimtalkTemplate> = [
        {
            title: '템플릿 코드',
            dataIndex: 'templateCode',
            key: 'templateCode',
            width: 200,
            render: (code: string) => <span style={{ fontFamily: 'monospace' }}>{code}</span>,
        },
        {
            title: '템플릿 이름',
            dataIndex: 'name',
            key: 'name',
            width: 180,
        },
        {
            title: '솔라피 ID',
            dataIndex: 'templateId',
            key: 'templateId',
            width: 240,
            render: (id: string) => <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{id}</span>,
        },
        {
            title: '검수상태',
            dataIndex: 'reviewStatus',
            key: 'reviewStatus',
            width: 100,
            align: 'center',
            render: (status: string) => <Tag color={reviewStatusColor[status]}>{reviewStatusText[status]}</Tag>,
        },
        {
            title: '활성화',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            align: 'center',
            render: (isActive: boolean, record) => (
                <Switch
                    checked={isActive}
                    onChange={async () => {
                        try {
                            await alimtalkApi.updateTemplate(record.templateCode, { isActive: !isActive });
                            message.success(isActive ? '비활성화되었습니다.' : '활성화되었습니다.');
                            fetchTemplates();
                        } catch (error) {
                            message.error('상태 변경에 실패했습니다.');
                        }
                    }}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                />
            ),
        },
        {
            title: '버튼',
            dataIndex: 'buttons',
            key: 'buttons',
            width: 70,
            align: 'center',
            render: (buttons: AlimtalkButton[]) => buttons.length || 0,
        },
        {
            title: '작업',
            key: 'actions',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (_: any, record: AlimtalkTemplate) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => showDetailModal(record.templateCode)}
                    >
                        상세
                    </Button>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                        수정
                    </Button>
                    <Popconfirm
                        title="템플릿 삭제"
                        description="정말 이 템플릿을 삭제하시겠습니까?"
                        onConfirm={() => handleDelete(record.templateCode)}
                        okText="삭제"
                        cancelText="취소"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" size="small" icon={<DeleteOutlined />} danger>
                            삭제
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div
                style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>알림톡 템플릿 관리</h1>
                    <p style={{ color: '#666', marginTop: '8px' }}>
                        CoolSMS에서 검수 받은 알림톡 템플릿을 등록하고 관리합니다.
                    </p>
                </div>
                <Space>
                    <Button icon={<PlusOutlined />} onClick={showCreateModal} type="default">
                        템플릿 등록
                    </Button>
                    <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefreshCache} loading={refreshing}>
                        새로고침
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={templates}
                rowKey="templateCode"
                loading={loading}
                pagination={false}
                scroll={{ x: 1200 }}
                bordered
            />

            {/* 템플릿 생성 모달 */}
            <Modal
                title="알림톡 템플릿 등록"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                onOk={() => createForm.submit()}
                width={700}
            >
                <Form form={createForm} onFinish={handleCreate} layout="vertical">
                    <Form.Item
                        label="템플릿 코드"
                        name="templateCode"
                        rules={[
                            { required: true, message: '템플릿 코드를 입력하세요' },
                            {
                                pattern: /^[A-Z_]+$/,
                                message: '대문자와 언더스코어(_)만 사용 가능합니다',
                            },
                        ]}
                        extra="예: PAYMENT_CONFIRMATION (대문자 스네이크 케이스)"
                    >
                        <Input placeholder="PAYMENT_CONFIRMATION" />
                    </Form.Item>

                    <Form.Item
                        label="솔라피 템플릿 ID"
                        name="templateId"
                        rules={[{ required: true, message: '솔라피 템플릿 ID를 입력하세요' }]}
                        extra="CoolSMS 콘솔에서 확인한 템플릿 ID"
                    >
                        <Input placeholder="KA01TP..." />
                    </Form.Item>

                    <Form.Item
                        label="템플릿 이름"
                        name="name"
                        rules={[{ required: true, message: '템플릿 이름을 입력하세요' }]}
                    >
                        <Input placeholder="결제 완료 알림" />
                    </Form.Item>

                    <Form.Item label="설명" name="description">
                        <Input.TextArea rows={2} placeholder="템플릿 설명 (선택사항)" />
                    </Form.Item>

                    <Form.Item
                        label="필수 변수"
                        name="requiredVariables"
                        extra="템플릿에서 사용하는 변수 (쉼표로 구분)"
                    >
                        <Select mode="tags" placeholder="결제금액, 주문번호" />
                    </Form.Item>

                    <Form.Item label="검수 상태" name="reviewStatus" initialValue="approved">
                        <Select>
                            <Select.Option value="pending">검수대기</Select.Option>
                            <Select.Option value="approved">검수통과</Select.Option>
                            <Select.Option value="rejected">검수거절</Select.Option>
                            <Select.Option value="re_review">재검수</Select.Option>
                        </Select>
                    </Form.Item>

                    <Space size="large">
                        <Form.Item
                            label="SMS 대체 발송"
                            name="fallbackToSms"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item label="활성화" name="isActive" valuePropName="checked" initialValue={true}>
                            <Switch />
                        </Form.Item>
                    </Space>

                    <Form.Item label="메모" name="memo">
                        <Input.TextArea rows={2} placeholder="관리자용 메모 (선택사항)" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 템플릿 수정 모달 */}
            <Modal
                title="알림톡 템플릿 수정"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    editForm.resetFields();
                }}
                onOk={() => editForm.submit()}
                width={600}
            >
                <Form form={editForm} onFinish={handleUpdate} layout="vertical">
                    <Form.Item label="템플릿 코드" style={{ marginBottom: '12px' }}>
                        <Input value={selectedTemplate?.templateCode} disabled />
                    </Form.Item>

                    <Form.Item label="템플릿 이름" style={{ marginBottom: '12px' }}>
                        <Input value={selectedTemplate?.name} disabled />
                    </Form.Item>

                    <Form.Item
                        label="솔라피 템플릿 ID"
                        name="templateId"
                        rules={[{ required: true, message: '솔라피 템플릿 ID를 입력하세요' }]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Input placeholder="KA01TP..." />
                    </Form.Item>

                    <Form.Item
                        label="검수 상태"
                        name="reviewStatus"
                        rules={[{ required: true, message: '검수 상태를 선택하세요' }]}
                        style={{ marginBottom: '12px' }}
                    >
                        <Select>
                            <Select.Option value="pending">검수대기</Select.Option>
                            <Select.Option value="approved">검수통과</Select.Option>
                            <Select.Option value="rejected">검수거절</Select.Option>
                            <Select.Option value="re_review">재검수</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="활성화" name="isActive" valuePropName="checked" style={{ marginBottom: '12px' }}>
                        <Switch />
                    </Form.Item>

                    <Form.Item label="메모" name="memo" style={{ marginBottom: 0 }}>
                        <Input.TextArea rows={3} placeholder="관리자용 메모" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 템플릿 상세 모달 */}
            <Modal
                title="알림톡 템플릿 상세"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        닫기
                    </Button>,
                ]}
                width={800}
            >
                {selectedTemplate && (
                    <div>
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="템플릿 코드">
                                <span style={{ fontFamily: 'monospace' }}>{selectedTemplate.templateCode}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="템플릿 이름">{selectedTemplate.name}</Descriptions.Item>
                            <Descriptions.Item label="설명">{selectedTemplate.description || '-'}</Descriptions.Item>
                            <Descriptions.Item label="솔라피 템플릿 ID">
                                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                    {selectedTemplate.templateId}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="검수 상태">
                                <Tag color={reviewStatusColor[selectedTemplate.reviewStatus]}>
                                    {reviewStatusText[selectedTemplate.reviewStatus]}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="활성화">
                                <Tag color={selectedTemplate.isActive ? 'success' : 'default'}>
                                    {selectedTemplate.isActive ? 'ON' : 'OFF'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="SMS 대체 발송">
                                {selectedTemplate.fallbackToSms ? '사용' : '미사용'}
                            </Descriptions.Item>
                            <Descriptions.Item label="필수 변수">
                                {selectedTemplate.requiredVariables.join(', ') || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="메모">{selectedTemplate.memo || '-'}</Descriptions.Item>
                            <Descriptions.Item label="생성일">{selectedTemplate.createdAt}</Descriptions.Item>
                            <Descriptions.Item label="수정일">{selectedTemplate.updatedAt}</Descriptions.Item>
                        </Descriptions>

                        {selectedTemplate.buttons.length > 0 && (
                            <Card title="알림톡 버튼" style={{ marginTop: '16px' }} size="small">
                                {selectedTemplate.buttons.map((button, index) => (
                                    <Card
                                        key={index}
                                        type="inner"
                                        title={`버튼 ${index + 1}: ${button.buttonName}`}
                                        size="small"
                                        style={{
                                            marginBottom: index < selectedTemplate.buttons.length - 1 ? '8px' : 0,
                                        }}
                                    >
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label="버튼 타입">
                                                <Tag>{buttonTypeText[button.buttonType]}</Tag>
                                            </Descriptions.Item>
                                            {button.linkMo && (
                                                <Descriptions.Item label="모바일 링크">
                                                    <a href={button.linkMo} target="_blank" rel="noopener noreferrer">
                                                        {button.linkMo}
                                                    </a>
                                                </Descriptions.Item>
                                            )}
                                            {button.linkPc && (
                                                <Descriptions.Item label="PC 링크">
                                                    <a href={button.linkPc} target="_blank" rel="noopener noreferrer">
                                                        {button.linkPc}
                                                    </a>
                                                </Descriptions.Item>
                                            )}
                                            {button.linkAnd && (
                                                <Descriptions.Item label="Android 스킴">
                                                    {button.linkAnd}
                                                </Descriptions.Item>
                                            )}
                                            {button.linkIos && (
                                                <Descriptions.Item label="iOS 스킴">{button.linkIos}</Descriptions.Item>
                                            )}
                                        </Descriptions>
                                    </Card>
                                ))}
                            </Card>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
