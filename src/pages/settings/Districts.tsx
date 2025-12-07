import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Modal, Form, Input, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { districtApi } from '../../features/district/api/districtApi';
import type { District, DistrictCreateRequest, DistrictUpdateRequest } from '../../shared/types/api.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

/**
 * 지역 관리 페이지
 * 시/도 및 시/군/구 지역 데이터를 관리합니다.
 */
const Districts: React.FC = () => {
  const [dataSource, setDataSource] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    setLoading(true);
    try {
      const data = await districtApi.getAllDistricts();
      if (Array.isArray(data)) {
        setDataSource(data);
      } else {
        console.error('Received non-array data:', data);
        setDataSource([]);
        message.warning('지역 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('Failed to fetch districts:', error);
      setDataSource([]);
      message.error('지역 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDistrict(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (district: District) => {
    setEditingDistrict(district);
    form.setFieldsValue({
      city: district.city,
      districts: district.districts.join(', '),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await districtApi.deleteDistrict(id);
      message.success('지역이 삭제되었습니다.');
      fetchDistricts();
    } catch (error: any) {
      console.error('Failed to delete district:', error);
      message.error('지역 삭제에 실패했습니다.');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const districtsArray = values.districts
        .split(',')
        .map((d: string) => d.trim())
        .filter((d: string) => d.length > 0);

      if (editingDistrict) {
        const updateData: DistrictUpdateRequest = {
          city: values.city,
          districts: districtsArray,
        };
        await districtApi.updateDistrict(editingDistrict.id, updateData);
        message.success('지역이 수정되었습니다.');
      } else {
        const createData: DistrictCreateRequest = {
          city: values.city,
          districts: districtsArray,
        };
        await districtApi.createDistrict(createData);
        message.success('지역이 생성되었습니다.');
      }

      setModalVisible(false);
      fetchDistricts();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('모든 필드를 올바르게 입력해주세요.');
      } else {
        console.error('Failed to save district:', error);
        message.error('지역 저장에 실패했습니다.');
      }
    }
  };

  const columns: ColumnsType<District> = [
    {
      title: '시/도',
      dataIndex: 'city',
      key: 'city',
      width: 200,
      render: (city: string) => <span style={{ fontWeight: 500 }}>{city}</span>,
    },
    {
      title: '시/군/구 목록',
      dataIndex: 'districts',
      key: 'districts',
      render: (districts: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {districts.map((district, index) => (
            <Tag key={index}>{district}</Tag>
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
            title="지역 삭제"
            description="이 지역을 삭제하시겠습니까?"
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
            <span style={{ fontSize: '18px', fontWeight: 600 }}>지역 관리</span>
            <Tag color="blue">{dataSource.length}개</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            새 지역 추가
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

      {/* 지역 생성/수정 모달 */}
      <Modal
        title={editingDistrict ? '지역 수정' : '새 지역 추가'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item name="city" label="시/도" rules={[{ required: true, message: '시/도를 입력해주세요' }]}>
            <Input placeholder="예: 서울특별시" />
          </Form.Item>

          <Form.Item
            name="districts"
            label="시/군/구 목록 (쉼표로 구분)"
            rules={[{ required: true, message: '시/군/구를 입력해주세요' }]}
          >
            <TextArea rows={4} placeholder="예: 강남구, 강동구, 강북구" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Districts;
