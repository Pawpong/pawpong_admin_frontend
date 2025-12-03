import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, Upload, message, Image, Card, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import {
  homeApi,
  type Banner,
  type BannerCreateRequest,
  type BannerUpdateRequest,
} from '../../features/home/api/homeApi';
import { uploadApi } from '../../features/upload/api/uploadApi';

const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await homeApi.getBanners();
      // 순서대로 정렬
      const sortedData = data.sort((a, b) => a.order - b.order);
      setBanners(sortedData);
    } catch (error) {
      message.error('배너 목록 조회 실패');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setImageFileName('');
    setPreviewImage('');
    form.resetFields();
    form.setFieldsValue({
      linkType: 'internal',
      isActive: true,
      order: banners.length,
    });
    setModalVisible(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    // 백엔드에서 받은 imageFileName 사용
    setImageFileName(banner.imageFileName);
    setPreviewImage(banner.imageUrl || '');
    form.setFieldsValue({
      title: banner.title,
      description: banner.description,
      linkType: banner.linkType,
      linkUrl: banner.linkUrl,
      order: banner.order,
      isActive: banner.isActive !== false,
    });
    setModalVisible(true);
  };

  const handleDelete = async (bannerId: string) => {
    Modal.confirm({
      title: '배너 삭제',
      content: '정말 이 배너를 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okType: 'danger',
      onOk: async () => {
        try {
          await homeApi.deleteBanner(bannerId);
          message.success('배너가 삭제되었습니다');
          fetchBanners();
        } catch (error) {
          message.error('배너 삭제 실패');
          console.error(error);
        }
      },
    });
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'banners');
      setImageFileName(result.fileName);
      setPreviewImage(result.cdnUrl);
      message.success('이미지가 업로드되었습니다');
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('이미지 업로드 실패');
      console.error(error);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!imageFileName) {
        message.error('배너 이미지를 업로드해주세요');
        return;
      }

      if (editingBanner) {
        // 수정
        const updateData: BannerUpdateRequest = {
          ...values,
          imageFileName: imageFileName,
        };
        await homeApi.updateBanner(editingBanner.bannerId, updateData);
        message.success('배너가 수정되었습니다');
      } else {
        // 생성
        const createData: BannerCreateRequest = {
          ...values,
          imageFileName: imageFileName,
        };
        await homeApi.createBanner(createData);
        message.success('배너가 생성되었습니다');
      }

      setModalVisible(false);
      form.resetFields();
      setImageFileName('');
      setPreviewImage('');
      fetchBanners();
    } catch (error) {
      message.error('배너 저장 실패');
      console.error(error);
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
      width: 200,
      render: (imageUrl: string) => (
        <Image
          src={imageUrl}
          alt="배너"
          width={150}
          height={75}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          preview
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
      ),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => text || '-',
    },
    {
      title: '링크 타입',
      dataIndex: 'linkType',
      key: 'linkType',
      width: 100,
      render: (type: string) => (
        <span
          style={{
            color: type === 'internal' ? 'var(--color-primary-500)' : 'var(--color-secondary-500)',
            fontWeight: 500,
          }}
        >
          {type === 'internal' ? '내부' : '외부'}
        </span>
      ),
    },
    {
      title: '링크 URL',
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      ellipsis: true,
    },
    {
      title: '활성화',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => <Switch checked={isActive !== false} disabled />,
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      render: (_: any, record: Banner) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: 'var(--color-primary-500)' }}
          >
            수정
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.bannerId)}>
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--color-primary-500)',
            margin: 0,
          }}
        >
          메인 배너 관리
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          style={{
            backgroundColor: 'var(--color-primary-500)',
            borderColor: 'var(--color-primary-500)',
          }}
        >
          배너 추가
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={banners}
          rowKey="bannerId"
          loading={loading}
          pagination={{ showSizeChanger: true, showTotal: (total) => `총 ${total}개` }}
        />
      </Card>

      <Modal
        title={editingBanner ? '배너 수정' : '배너 추가'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageFileName('');
          setPreviewImage('');
        }}
        width={700}
        okText={editingBanner ? '수정' : '생성'}
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="배너 이미지">
            <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploading}>
                이미지 업로드
              </Button>
            </Upload>
            {previewImage && (
              <div style={{ marginTop: '12px' }}>
                <Image
                  src={previewImage}
                  alt="미리보기"
                  width="100%"
                  style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                />
              </div>
            )}
            {!previewImage && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '40px',
                  background: 'var(--color-grayscale-gray1)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: 'var(--color-grayscale-gray5)',
                }}
              >
                이미지를 업로드해주세요
              </div>
            )}
          </Form.Item>

          <Form.Item name="title" label="제목 (선택)">
            <Input placeholder="배너 제목 (관리용)" />
          </Form.Item>

          <Form.Item name="description" label="설명 (선택)">
            <Input.TextArea placeholder="배너 설명 (관리용)" rows={2} />
          </Form.Item>

          <Form.Item
            name="linkType"
            label="링크 타입"
            rules={[{ required: true, message: '링크 타입을 선택해주세요' }]}
          >
            <Select>
              <Select.Option value="internal">내부 링크</Select.Option>
              <Select.Option value="external">외부 링크</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="linkUrl" label="링크 URL" rules={[{ required: true, message: '링크 URL을 입력해주세요' }]}>
            <Input placeholder="/explore?animal=dog 또는 https://example.com" />
          </Form.Item>

          <Form.Item name="order" label="정렬 순서" rules={[{ required: true, message: '정렬 순서를 입력해주세요' }]}>
            <Input type="number" placeholder="0부터 시작 (낮을수록 먼저 표시)" />
          </Form.Item>

          <Form.Item name="isActive" label="활성화 여부" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Banners;
