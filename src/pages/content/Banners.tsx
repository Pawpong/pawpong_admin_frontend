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
  Image,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { contentApi } from '../../features/content/api/contentApi';
import type { Banner, BannerCreateRequest, BannerUpdateRequest } from '../../shared/types/api.types';

const { Option } = Select;

/**
 * 배너 관리 페이지
 * 홈 화면 배너를 관리합니다.
 */
const Banners: React.FC = () => {
  const [dataSource, setDataSource] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await contentApi.getBanners();
      // 데이터가 배열인지 확인
      if (Array.isArray(data)) {
        setDataSource(data.sort((a, b) => a.order - b.order));
      } else {
        console.error('Received non-array data:', data);
        setDataSource([]);
        message.warning('배너 데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('Failed to fetch banners:', error);
      setDataSource([]);
      message.error('배너 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, order: 0 });
    setModalVisible(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    form.setFieldsValue({
      title: banner.title,
      description: banner.description,
      linkType: banner.linkType,
      linkUrl: banner.linkUrl,
      order: banner.order,
      isActive: banner.isActive !== false,
      imageFileName: '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (bannerId: string) => {
    try {
      await contentApi.deleteBanner(bannerId);
      message.success('배너가 삭제되었습니다.');
      fetchBanners();
    } catch (error: any) {
      console.error('Failed to delete banner:', error);
      message.error('배너 삭제에 실패했습니다.');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingBanner) {
        const updateData: BannerUpdateRequest = {
          linkType: values.linkType,
          linkUrl: values.linkUrl,
          order: values.order,
          isActive: values.isActive,
          title: values.title,
          description: values.description,
        };
        if (values.imageFileName) {
          updateData.imageFileName = values.imageFileName;
        }
        await contentApi.updateBanner(editingBanner.bannerId, updateData);
        message.success('배너가 수정되었습니다.');
      } else {
        const createData: BannerCreateRequest = {
          imageFileName: values.imageFileName,
          linkType: values.linkType,
          linkUrl: values.linkUrl,
          order: values.order,
          isActive: values.isActive,
          title: values.title,
          description: values.description,
        };
        await contentApi.createBanner(createData);
        message.success('배너가 생성되었습니다.');
      }

      setModalVisible(false);
      fetchBanners();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('모든 필드를 올바르게 입력해주세요.');
      } else {
        console.error('Failed to save banner:', error);
        message.error('배너 저장에 실패했습니다.');
      }
    }
  };

  const columns: ColumnsType<Banner> = [
    {
      title: '순서',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: '미리보기',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 150,
      render: (url: string) => (
        <Image
          src={url}
          alt="banner"
          style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
      ),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      ellipsis: true,
      render: (title) => title || '-',
    },
    {
      title: '링크 타입',
      dataIndex: 'linkType',
      key: 'linkType',
      width: 100,
      render: (type: string) => (type === 'internal' ? '내부' : '외부'),
    },
    {
      title: '링크 URL',
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      width: 200,
      ellipsis: true,
    },
    {
      title: '활성화',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Switch checked={isActive !== false} disabled />
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: 0 }}
          >
            수정
          </Button>
          <Popconfirm
            title="배너를 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.bannerId)}
            okText="삭제"
            cancelText="취소"
          >
            <Button type="link" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>
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
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>메인 배너 관리</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          배너 추가
        </Button>
      </div>

      <Card>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          rowKey="bannerId"
          pagination={{ showSizeChanger: true, showTotal: (total) => `총 ${total}개` }}
        />
      </Card>

      <Modal
        title={editingBanner ? '배너 수정' : '배너 추가'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText={editingBanner ? '수정' : '생성'}
        cancelText="취소"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="imageFileName"
            label="이미지 파일명"
            rules={editingBanner ? [] : [{ required: true, message: '이미지 파일명을 입력해주세요' }]}
            help={editingBanner ? '수정 시 입력하지 않으면 기존 이미지 유지' : 'banners/filename.jpg 형식으로 입력'}
          >
            <Input placeholder="banners/main-banner.jpg" />
          </Form.Item>

          <Form.Item name="title" label="제목">
            <Input placeholder="배너 제목 (관리용)" />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <Input.TextArea rows={2} placeholder="배너 설명 (관리용)" />
          </Form.Item>

          <Form.Item
            name="linkType"
            label="링크 타입"
            rules={[{ required: true, message: '링크 타입을 선택해주세요' }]}
          >
            <Select>
              <Option value="internal">내부 링크</Option>
              <Option value="external">외부 링크</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="linkUrl"
            label="링크 URL"
            rules={[{ required: true, message: '링크 URL을 입력해주세요' }]}
          >
            <Input placeholder="/explore?animal=dog 또는 https://..." />
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

export default Banners;
