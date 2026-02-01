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
  InputNumber,
  Switch,
  Space,
  Tag,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { contentApi } from '../../features/content/api/contentApi';
import type { FAQ, FaqCreateRequest, FaqUpdateRequest } from '../../shared/types/api.types';

const { Option } = Select;

/**
 * FAQ 관리 페이지
 * 자주 묻는 질문을 관리합니다.
 */
const Faqs: React.FC = () => {
  const [dataSource, setDataSource] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const data = await contentApi.getFaqs();
      // 데이터가 배열인지 확인
      if (Array.isArray(data)) {
        setDataSource(data.sort((a, b) => a.order - b.order));
      } else {
        console.error('Received non-array data:', data);
        setDataSource([]);
        message.warning('FAQ 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch FAQs:', error);
      setDataSource([]);
      message.error('FAQ 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFaq(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, order: 0, userType: 'both' });
    setModalVisible(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    form.setFieldsValue({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      userType: faq.userType,
      order: faq.order,
      isActive: faq.isActive !== false,
    });
    setModalVisible(true);
  };

  const handleDelete = async (faqId: string) => {
    try {
      await contentApi.deleteFaq(faqId);
      message.success('FAQ가 삭제되었습니다.');
      fetchFaqs();
    } catch (error: unknown) {
      console.error('Failed to delete FAQ:', error);
      message.error('FAQ 삭제에 실패했습니다.');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingFaq) {
        const updateData: FaqUpdateRequest = {
          question: values.question,
          answer: values.answer,
          category: values.category,
          userType: values.userType,
          order: values.order,
          isActive: values.isActive,
        };
        await contentApi.updateFaq(editingFaq.faqId, updateData);
        message.success('FAQ가 수정되었습니다.');
      } else {
        const createData: FaqCreateRequest = {
          question: values.question,
          answer: values.answer,
          category: values.category,
          userType: values.userType,
          order: values.order,
          isActive: values.isActive,
        };
        await contentApi.createFaq(createData);
        message.success('FAQ가 생성되었습니다.');
      }

      setModalVisible(false);
      fetchFaqs();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        message.error('모든 필드를 올바르게 입력해주세요.');
      } else {
        console.error('Failed to save FAQ:', error);
        message.error('FAQ 저장에 실패했습니다.');
      }
    }
  };

  const getCategoryTag = (category: string) => {
    const categoryMap: Record<string, { color: string; text: string }> = {
      service: { color: 'blue', text: '서비스' },
      adoption: { color: 'green', text: '입양' },
      breeder: { color: 'purple', text: '브리더' },
      payment: { color: 'orange', text: '결제' },
      etc: { color: 'default', text: '기타' },
    };
    const config = categoryMap[category] || { color: 'default', text: category };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getUserTypeTag = (userType: string) => {
    const userTypeMap: Record<string, { color: string; text: string }> = {
      adopter: { color: 'blue', text: '입양자' },
      breeder: { color: 'green', text: '브리더' },
      both: { color: 'cyan', text: '공통' },
    };
    const config = userTypeMap[userType] || { color: 'default', text: userType };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<FAQ> = [
    {
      title: '순서',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: '질문',
      dataIndex: 'question',
      key: 'question',
      width: 250,
      ellipsis: true,
    },
    {
      title: '답변',
      dataIndex: 'answer',
      key: 'answer',
      width: 300,
      ellipsis: true,
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => getCategoryTag(category),
    },
    {
      title: '대상',
      dataIndex: 'userType',
      key: 'userType',
      width: 100,
      render: (userType: string) => getUserTypeTag(userType),
    },
    {
      title: '활성화',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => <Switch checked={isActive !== false} disabled />,
    },
    {
      title: '작업',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
            style={{ padding: 0 }}
          >
            수정
          </Button>
          <Popconfirm
            title="FAQ를 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.faqId)}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
              style={{ padding: 0 }}
            >
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>FAQ 관리</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          FAQ 추가
        </Button>
      </div>

      <Card>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          rowKey="faqId"
          pagination={{ showSizeChanger: true, showTotal: (total) => `총 ${total}개` }}
        />
      </Card>

      <Modal
        title={editingFaq ? 'FAQ 수정' : 'FAQ 추가'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText={editingFaq ? '수정' : '생성'}
        cancelText="취소"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="question" label="질문" rules={[{ required: true, message: '질문을 입력해주세요' }]}>
            <Input placeholder="자주 묻는 질문을 입력하세요" />
          </Form.Item>

          <Form.Item name="answer" label="답변" rules={[{ required: true, message: '답변을 입력해주세요' }]}>
            <Input.TextArea rows={4} placeholder="답변 내용을 입력하세요" />
          </Form.Item>

          <Form.Item name="category" label="카테고리" rules={[{ required: true, message: '카테고리를 선택해주세요' }]}>
            <Select>
              <Option value="service">서비스</Option>
              <Option value="adoption">입양</Option>
              <Option value="breeder">브리더</Option>
              <Option value="payment">결제</Option>
              <Option value="etc">기타</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="userType"
            label="대상 사용자"
            rules={[{ required: true, message: '대상 사용자를 선택해주세요' }]}
          >
            <Select>
              <Option value="adopter">입양자</Option>
              <Option value="breeder">브리더</Option>
              <Option value="both">공통</Option>
            </Select>
          </Form.Item>

          <Form.Item name="order" label="정렬 순서" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isActive" label="활성화" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Faqs;
