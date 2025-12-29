import React, { useEffect, useState } from 'react';
import {
    Table,
    Card,
    Button,
    message,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    Space,
    Popconfirm,
    Tag,
    InputNumber,
} from 'antd';
import { EditOutlined, ReloadOutlined, SortAscendingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { standardQuestionApi } from '../../features/content/api/standardQuestionApi';
import type { StandardQuestion, StandardQuestionUpdateRequest } from '../../shared/types/api.types';

const { Option } = Select;
const { TextArea } = Input;

/**
 * ID를 한글 라벨로 변환하는 매핑 객체
 */
const ID_LABEL_MAP: Record<string, string> = {
    privacyConsent: '개인정보 동의',
    selfIntroduction: '자기소개',
    familyMembers: '가족 구성원',
    allFamilyConsent: '가족 동의',
    allergyTestInfo: '알러지 검사',
    timeAwayFromHome: '부재 시간',
    livingSpaceDescription: '거주 공간',
    previousPetExperience: '반려동물 경험',
    canProvideBasicCare: '기본 케어 가능',
    canAffordMedicalExpenses: '의료비 감당 가능',
    neuteringConsent: '중성화 동의',
    preferredPetDescription: '선호 반려동물',
    desiredAdoptionTiming: '입양 희망 시기',
    additionalNotes: '추가 문의',
};

/**
 * 표준 질문 관리 페이지
 * 입양 신청서의 17가지 표준 질문을 관리합니다.
 */
const StandardQuestions: React.FC = () => {
    const [dataSource, setDataSource] = useState<StandardQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [reorderModalVisible, setReorderModalVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<StandardQuestion | null>(null);
    const [form] = Form.useForm();
    const [reorderForm] = Form.useForm();

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const data = await standardQuestionApi.getAllQuestions();
            if (Array.isArray(data)) {
                setDataSource(data.sort((a, b) => a.order - b.order));
            } else {
                console.error('Received non-array data:', data);
                setDataSource([]);
                message.warning('질문 데이터 형식이 올바르지 않습니다.');
            }
        } catch (error: unknown) {
            console.error('Failed to fetch questions:', error);
            setDataSource([]);
            message.error('표준 질문 목록을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (question: StandardQuestion) => {
        setEditingQuestion(question);
        form.setFieldsValue({
            type: question.type,
            label: question.label,
            required: question.required,
            options: question.options?.join(', ') || '',
            placeholder: question.placeholder || '',
            description: question.description || '',
        });
        setModalVisible(true);
    };

    const handleToggleStatus = async (question: StandardQuestion) => {
        try {
            await standardQuestionApi.toggleQuestionStatus(question.id, {
                isActive: !question.isActive,
            });
            message.success(`질문이 ${!question.isActive ? '활성화' : '비활성화'}되었습니다.`);
            fetchQuestions();
        } catch (error: unknown) {
            console.error('Failed to toggle question status:', error);
            message.error('질문 상태 변경에 실패했습니다.');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            if (!editingQuestion) {
                message.error('수정할 질문이 선택되지 않았습니다.');
                return;
            }

            const updateData: StandardQuestionUpdateRequest = {
                type: values.type,
                label: values.label,
                required: values.required,
                placeholder: values.placeholder || undefined,
                description: values.description || undefined,
            };

            // options 처리: select, radio, checkbox 타입일 때만
            if (['select', 'radio', 'checkbox'].includes(values.type)) {
                if (values.options && values.options.trim()) {
                    updateData.options = values.options
                        .split(',')
                        .map((opt: string) => opt.trim())
                        .filter((opt: string) => opt.length > 0);
                }
            }

            await standardQuestionApi.updateQuestion(editingQuestion.id, updateData);
            message.success('질문이 수정되었습니다.');

            setModalVisible(false);
            fetchQuestions();
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'errorFields' in error) {
                message.error('모든 필드를 올바르게 입력해주세요.');
            } else {
                console.error('Failed to update question:', error);
                message.error('질문 수정에 실패했습니다.');
            }
        }
    };

    const handleReorder = () => {
        const initialValues: Record<string, number> = {};
        dataSource.forEach((q) => {
            initialValues[q.id] = q.order;
        });
        reorderForm.setFieldsValue(initialValues);
        setReorderModalVisible(true);
    };

    const handleReorderOk = async () => {
        try {
            const values = await reorderForm.validateFields();
            const reorderData = Object.entries(values).map(([id, order]) => ({
                id,
                order: order as number,
            }));

            await standardQuestionApi.reorderQuestions({ reorderData });
            message.success('질문 순서가 변경되었습니다.');
            setReorderModalVisible(false);
            fetchQuestions();
        } catch (error: unknown) {
            console.error('Failed to reorder questions:', error);
            message.error('질문 순서 변경에 실패했습니다.');
        }
    };

    const handleReseed = async () => {
        try {
            await standardQuestionApi.reseedQuestions();
            message.success('표준 질문이 초기화되었습니다.');
            fetchQuestions();
        } catch (error: unknown) {
            console.error('Failed to reseed questions:', error);
            message.error('표준 질문 초기화에 실패했습니다.');
        }
    };

    const getQuestionTypeTag = (type: string) => {
        const typeMap: Record<string, { color: string; label: string }> = {
            text: { color: 'blue', label: '단답형' },
            textarea: { color: 'cyan', label: '장문형' },
            checkbox: { color: 'green', label: '체크박스' },
            radio: { color: 'orange', label: '라디오' },
            select: { color: 'purple', label: '선택형' },
        };
        const config = typeMap[type] || { color: 'default', label: type };
        return <Tag color={config.color}>{config.label}</Tag>;
    };

    const columns: ColumnsType<StandardQuestion> = [
        {
            title: '순서',
            dataIndex: 'order',
            key: 'order',
            width: 80,
            sorter: (a, b) => a.order - b.order,
            render: (order: number) => <span style={{ fontWeight: 500 }}>{order}</span>,
        },
        {
            title: '식별자',
            dataIndex: 'id',
            key: 'id',
            width: 200,
            render: (id: string) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{ID_LABEL_MAP[id] || id}</div>
                    <code style={{ fontSize: '11px', color: '#999' }}>{id}</code>
                </div>
            ),
        },
        {
            title: '질문 내용',
            dataIndex: 'label',
            key: 'label',
            render: (label: string) => <span style={{ fontWeight: 500 }}>{label}</span>,
        },
        {
            title: '타입',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type: string) => getQuestionTypeTag(type),
        },
        {
            title: '필수',
            dataIndex: 'required',
            key: 'required',
            width: 80,
            render: (required: boolean) => (required ? <Tag color="red">필수</Tag> : <Tag>선택</Tag>),
        },
        {
            title: '활성',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive: boolean, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggleStatus(record)}
                    checkedChildren="활성"
                    unCheckedChildren="비활성"
                />
            ),
        },
        {
            title: '작업',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size="small" onClick={(e) => e.stopPropagation()}>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(record);
                        }}
                    >
                        수정
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={
                    <Space>
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>표준 질문 관리</span>
                        <Tag color="blue">{dataSource.length}개 질문</Tag>
                    </Space>
                }
                extra={
                    <Space>
                        <Button icon={<SortAscendingOutlined />} onClick={handleReorder}>
                            순서 변경
                        </Button>
                        <Popconfirm
                            title="표준 질문 초기화"
                            description="모든 질문을 기본 설정으로 초기화하시겠습니까?"
                            onConfirm={handleReseed}
                            okText="초기화"
                            cancelText="취소"
                            okButtonProps={{ danger: true }}
                        >
                            <Button icon={<ReloadOutlined />} danger>
                                초기화
                            </Button>
                        </Popconfirm>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 20,
                        showTotal: (total) => `총 ${total}개`,
                        showSizeChanger: true,
                    }}
                />
            </Card>

            {/* 질문 수정 모달 */}
            <Modal
                title="표준 질문 수정"
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                width={700}
                okText="저장"
                cancelText="취소"
            >
                <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                    <Form.Item
                        name="type"
                        label="질문 타입"
                        rules={[{ required: true, message: '질문 타입을 선택해주세요' }]}
                    >
                        <Select placeholder="질문 타입 선택">
                            <Option value="text">단답형 (text)</Option>
                            <Option value="textarea">장문형 (textarea)</Option>
                            <Option value="checkbox">체크박스 (checkbox)</Option>
                            <Option value="radio">라디오 (radio)</Option>
                            <Option value="select">선택형 (select)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="label"
                        label="질문 내용"
                        rules={[{ required: true, message: '질문 내용을 입력해주세요' }]}
                    >
                        <Input placeholder="예: 개인정보 수집 및 이용에 동의하시나요?" />
                    </Form.Item>

                    <Form.Item name="required" label="필수 여부" valuePropName="checked">
                        <Switch checkedChildren="필수" unCheckedChildren="선택" />
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
                    >
                        {({ getFieldValue }) => {
                            const type = getFieldValue('type');
                            return ['select', 'radio', 'checkbox'].includes(type) ? (
                                <Form.Item
                                    name="options"
                                    label="선택 옵션 (쉼표로 구분)"
                                    rules={[{ required: true, message: '옵션을 입력해주세요' }]}
                                >
                                    <Input placeholder="예: 예, 아니오, 모름" addonBefore="옵션" />
                                </Form.Item>
                            ) : null;
                        }}
                    </Form.Item>

                    <Form.Item name="placeholder" label="플레이스홀더">
                        <Input placeholder="예: 서울시 강남구" />
                    </Form.Item>

                    <Form.Item name="description" label="설명 또는 도움말">
                        <TextArea rows={3} placeholder="예: 개인정보는 입양 심사 목적으로만 사용됩니다" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 순서 변경 모달 */}
            <Modal
                title="질문 순서 변경"
                open={reorderModalVisible}
                onOk={handleReorderOk}
                onCancel={() => setReorderModalVisible(false)}
                width={800}
                okText="저장"
                cancelText="취소"
            >
                <div style={{ marginTop: '20px', marginBottom: '10px' }}>
                    <p style={{ color: '#666' }}>각 질문의 순서를 변경하세요. 숫자가 작을수록 먼저 표시됩니다.</p>
                </div>
                <Form form={reorderForm} layout="vertical">
                    {dataSource.map((q) => (
                        <Form.Item
                            key={q.id}
                            name={q.id}
                            label={
                                <Space>
                                    <span style={{ fontWeight: 600, minWidth: '120px' }}>
                                        {ID_LABEL_MAP[q.id] || q.id}
                                    </span>
                                    {getQuestionTypeTag(q.type)}
                                    <span style={{ color: '#666', fontSize: '13px' }}>
                                        {q.label.substring(0, 40)}
                                        {q.label.length > 40 ? '...' : ''}
                                    </span>
                                </Space>
                            }
                            rules={[{ required: true, type: 'number' }]}
                        >
                            <InputNumber min={1} max={100} style={{ width: '100px' }} placeholder="순서" />
                        </Form.Item>
                    ))}
                </Form>
            </Modal>
        </div>
    );
};

export default StandardQuestions;
