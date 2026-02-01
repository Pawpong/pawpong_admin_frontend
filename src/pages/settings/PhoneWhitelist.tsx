import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Modal, Form, Input, Space, Tag, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { platformApi } from '../../features/platform/api/platformApi';
import type {
  PhoneWhitelist,
  PhoneWhitelistCreateRequest,
  PhoneWhitelistUpdateRequest,
} from '../../shared/types/api.types';
import dayjs from 'dayjs';

/**
 * 전화번호 화이트리스트 관리 페이지
 * 중복 가입이 허용되는 전화번호를 관리합니다.
 * 테스트/개발 계정용으로 동일 전화번호로 여러 계정 생성이 가능하도록 합니다.
 */
const PhoneWhitelistPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<PhoneWhitelist[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PhoneWhitelist | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const fetchWhitelist = async () => {
    setLoading(true);
    try {
      const data = await platformApi.getPhoneWhitelist();
      if (data && Array.isArray(data.items)) {
        setDataSource(data.items);
      } else {
        console.error('Received invalid data:', data);
        setDataSource([]);
        message.warning('화이트리스트 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch phone whitelist:', error);
      setDataSource([]);
      message.error('화이트리스트를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (item: PhoneWhitelist) => {
    setEditingItem(item);
    form.setFieldsValue({
      phoneNumber: item.phoneNumber,
      description: item.description,
      isActive: item.isActive,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await platformApi.deletePhoneWhitelist(id);
      message.success('화이트리스트에서 삭제되었습니다.');
      fetchWhitelist();
    } catch (error: unknown) {
      console.error('Failed to delete phone whitelist:', error);
      message.error('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (item: PhoneWhitelist) => {
    try {
      await platformApi.updatePhoneWhitelist(item.id, { isActive: !item.isActive });
      message.success(item.isActive ? '비활성화되었습니다.' : '활성화되었습니다.');
      fetchWhitelist();
    } catch (error: unknown) {
      console.error('Failed to toggle active status:', error);
      message.error('상태 변경에 실패했습니다.');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // 전화번호 형식 정규화 (하이픈 제거)
      const normalizedPhone = values.phoneNumber.replace(/-/g, '');

      if (editingItem) {
        const updateData: PhoneWhitelistUpdateRequest = {
          description: values.description,
          isActive: values.isActive,
        };
        await platformApi.updatePhoneWhitelist(editingItem.id, updateData);
        message.success('화이트리스트가 수정되었습니다.');
      } else {
        const createData: PhoneWhitelistCreateRequest = {
          phoneNumber: normalizedPhone,
          description: values.description,
        };
        await platformApi.addPhoneWhitelist(createData);
        message.success('화이트리스트에 추가되었습니다.');
      }

      setModalVisible(false);
      fetchWhitelist();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        message.error('모든 필드를 올바르게 입력해주세요.');
      } else {
        console.error('Failed to save phone whitelist:', error);
        message.error('저장에 실패했습니다.');
      }
    }
  };

  // 전화번호 포맷팅 (010-1234-5678 형식)
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const columns: ColumnsType<PhoneWhitelist> = [
    {
      title: '전화번호',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{formatPhoneNumber(phone)}</span>
        </Space>
      ),
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="활성"
          unCheckedChildren="비활성"
        />
      ),
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
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
            title="화이트리스트 삭제"
            description="이 전화번호를 화이트리스트에서 삭제하시겠습니까?"
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
    <div className="p-3 sm:p-4 md:p-6">
      <Card
        title={
          <Space wrap>
            <PhoneOutlined style={{ fontSize: '18px' }} />
            <span className="text-base sm:text-lg font-semibold">전화번호 화이트리스트</span>
            <Tag color="blue">{dataSource.length}개</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="text-xs sm:text-sm">
            새 번호 추가
          </Button>
        }
        styles={{ header: { flexWrap: 'wrap', gap: '8px' } }}
      >
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f6f8fa' }}>
          <p className="m-0 text-xs sm:text-sm text-gray-600">
            화이트리스트에 등록된 전화번호는 <strong>중복 가입이 허용</strong>됩니다. 테스트 계정이나 개발 목적으로
            사용됩니다.
          </p>
        </div>

        {/* 테이블 스크롤 래퍼 - 모바일에서 가로 스크롤 가능 */}
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            loading={loading}
            scroll={{ x: 600 }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `총 ${total}개`,
              showSizeChanger: true,
              responsive: true,
            }}
          />
        </div>
      </Card>

      {/* 화이트리스트 생성/수정 모달 */}
      <Modal
        title={editingItem ? '화이트리스트 수정' : '새 번호 추가'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width="100%"
        style={{ maxWidth: '500px', top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item
            name="phoneNumber"
            label="전화번호"
            rules={[
              { required: true, message: '전화번호를 입력해주세요' },
              {
                pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
                message: '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)',
              },
            ]}
          >
            <Input placeholder="예: 010-1234-5678" disabled={!!editingItem} prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item name="description" label="설명" rules={[{ required: true, message: '설명을 입력해주세요' }]}>
            <Input.TextArea rows={3} placeholder="예: 개발팀 테스트 계정, QA 테스트용" />
          </Form.Item>

          {editingItem && (
            <Form.Item name="isActive" label="활성 상태" valuePropName="checked">
              <Switch checkedChildren="활성" unCheckedChildren="비활성" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default PhoneWhitelistPage;
