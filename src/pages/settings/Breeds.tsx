import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Modal, Form, Input, Select, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { breedApi } from '../../features/breed/api/breedApi';
import type { Breed, BreedCreateRequest, BreedUpdateRequest } from '../../shared/types/api.types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 품종 관리 페이지
 * 강아지/고양이 품종 카테고리를 관리합니다.
 */
const Breeds: React.FC = () => {
    const [dataSource, setDataSource] = useState<Breed[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBreed, setEditingBreed] = useState<Breed | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchBreeds();
    }, []);

    const fetchBreeds = async () => {
        setLoading(true);
        try {
            const data = await breedApi.getAllBreeds();
            if (Array.isArray(data)) {
                setDataSource(data);
            } else {
                console.error('Received non-array data:', data);
                setDataSource([]);
                message.warning('품종 데이터 형식이 올바르지 않습니다.');
            }
        } catch (error: unknown) {
            console.error('Failed to fetch breeds:', error);
            setDataSource([]);
            message.error('품종 목록을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingBreed(null);
        form.resetFields();
        form.setFieldsValue({ petType: 'dog' });
        setModalVisible(true);
    };

    const handleEdit = (breed: Breed) => {
        setEditingBreed(breed);
        form.setFieldsValue({
            petType: breed.petType,
            category: breed.category,
            categoryDescription: breed.categoryDescription || '',
            breeds: breed.breeds.join(', '),
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await breedApi.deleteBreed(id);
            message.success('품종이 삭제되었습니다.');
            fetchBreeds();
        } catch (error: unknown) {
            console.error('Failed to delete breed:', error);
            message.error('품종 삭제에 실패했습니다.');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            const breedsArray = values.breeds
                .split(',')
                .map((b: string) => b.trim())
                .filter((b: string) => b.length > 0);

            if (editingBreed) {
                const updateData: BreedUpdateRequest = {
                    category: values.category,
                    categoryDescription: values.categoryDescription || undefined,
                    breeds: breedsArray,
                };
                await breedApi.updateBreed(editingBreed.id, updateData);
                message.success('품종이 수정되었습니다.');
            } else {
                const createData: BreedCreateRequest = {
                    petType: values.petType,
                    category: values.category,
                    categoryDescription: values.categoryDescription || undefined,
                    breeds: breedsArray,
                };
                await breedApi.createBreed(createData);
                message.success('품종이 생성되었습니다.');
            }

            setModalVisible(false);
            fetchBreeds();
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'errorFields' in error) {
                message.error('모든 필드를 올바르게 입력해주세요.');
            } else {
                console.error('Failed to save breed:', error);
                message.error('품종 저장에 실패했습니다.');
            }
        }
    };

    const getPetTypeTag = (petType: string) => {
        return petType === 'dog' ? <Tag color="blue">강아지</Tag> : <Tag color="purple">고양이</Tag>;
    };

    const columns: ColumnsType<Breed> = [
        {
            title: '동물 타입',
            dataIndex: 'petType',
            key: 'petType',
            width: 120,
            render: (petType: string) => getPetTypeTag(petType),
            filters: [
                { text: '강아지', value: 'dog' },
                { text: '고양이', value: 'cat' },
            ],
            onFilter: (value, record) => record.petType === value,
        },
        {
            title: '카테고리',
            dataIndex: 'category',
            key: 'category',
            width: 150,
            render: (category: string) => <span style={{ fontWeight: 500 }}>{category}</span>,
        },
        {
            title: '카테고리 설명',
            dataIndex: 'categoryDescription',
            key: 'categoryDescription',
            width: 200,
        },
        {
            title: '품종 목록',
            dataIndex: 'breeds',
            key: 'breeds',
            render: (breeds: string[]) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {breeds.map((breed, index) => (
                        <Tag key={index}>{breed}</Tag>
                    ))}
                </div>
            ),
        },
        {
            title: '생성일',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        },
        {
            title: '작업',
            key: 'action',
            width: 150,
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
                    <Popconfirm
                        title="품종 삭제"
                        description="이 품종을 삭제하시겠습니까?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="삭제"
                        cancelText="취소"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>
                            삭제
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={
                    <Space>
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>품종 관리</span>
                        <Tag color="blue">{dataSource.length}개</Tag>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        새 품종 추가
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `총 ${total}개`,
                        showSizeChanger: true,
                    }}
                />
            </Card>

            {/* 품종 생성/수정 모달 */}
            <Modal
                title={editingBreed ? '품종 수정' : '새 품종 추가'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                width={600}
                okText="저장"
                cancelText="취소"
            >
                <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                    <Form.Item
                        name="petType"
                        label="동물 타입"
                        rules={[{ required: true, message: '동물 타입을 선택해주세요' }]}
                    >
                        <Select placeholder="동물 타입 선택" disabled={!!editingBreed}>
                            <Option value="dog">강아지</Option>
                            <Option value="cat">고양이</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="카테고리"
                        rules={[{ required: true, message: '카테고리를 입력해주세요' }]}
                    >
                        <Input placeholder="예: 소형견" />
                    </Form.Item>

                    <Form.Item name="categoryDescription" label="카테고리 설명">
                        <Input placeholder="예: 10kg 미만" />
                    </Form.Item>

                    <Form.Item
                        name="breeds"
                        label="품종 목록 (쉼표로 구분)"
                        rules={[{ required: true, message: '품종을 입력해주세요' }]}
                    >
                        <TextArea rows={4} placeholder="예: 비숑프리제, 닥스훈트, 말티즈" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Breeds;
