import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Upload,
  message,
  Image,
  Card,
  Space,
  Popconfirm,
  Checkbox,
  Tag,
} from 'antd';
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
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [desktopImageFileName, setDesktopImageFileName] = useState<string>('');
  const [mobileImageFileName, setMobileImageFileName] = useState<string>('');
  const [desktopPreviewImage, setDesktopPreviewImage] = useState<string>('');
  const [mobilePreviewImage, setMobilePreviewImage] = useState<string>('');

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
    setDesktopImageFileName('');
    setMobileImageFileName('');
    setDesktopPreviewImage('');
    setMobilePreviewImage('');
    form.resetFields();
    form.setFieldsValue({
      linkType: 'internal',
      isActive: true,
      order: banners.length,
      targetAudience: ['guest', 'adopter', 'breeder'], // 기본값: 전체 선택
    });
    setModalVisible(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    // 백엔드에서 받은 imageFileName 사용
    setDesktopImageFileName(banner.desktopImageFileName);
    setMobileImageFileName(banner.mobileImageFileName);
    setDesktopPreviewImage(banner.desktopImageUrl || '');
    setMobilePreviewImage(banner.mobileImageUrl || '');
    form.setFieldsValue({
      title: banner.title,
      description: banner.description,
      linkType: banner.linkType,
      linkUrl: banner.linkUrl,
      order: banner.order,
      isActive: banner.isActive !== false,
      targetAudience: banner.targetAudience || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (bannerId: string) => {
    try {
      await homeApi.deleteBanner(bannerId);
      message.success('배너가 삭제되었습니다');
      fetchBanners();
    } catch (error) {
      message.error('배너 삭제 실패');
      console.error(error);
    }
  };

  const handleToggleActive = async (bannerId: string, currentStatus: boolean) => {
    try {
      const banner = banners.find((b) => b.bannerId === bannerId);
      if (!banner) return;

      await homeApi.updateBanner(bannerId, {
        ...banner,
        isActive: !currentStatus,
      });
      message.success(`배너가 ${!currentStatus ? '활성화' : '비활성화'}되었습니다`);
      fetchBanners();
    } catch (error) {
      message.error('배너 상태 변경 실패');
      console.error(error);
    }
  };

  const handleUploadDesktop = async (file: File) => {
    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'banners');
      setDesktopImageFileName(result.fileName);
      setDesktopPreviewImage(result.cdnUrl);
      message.success('PC/Pad 이미지가 업로드되었습니다');
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('PC/Pad 이미지 업로드 실패');
      console.error(error);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleUploadMobile = async (file: File) => {
    try {
      setUploadingMobile(true);
      const result = await uploadApi.uploadSingle(file, 'banners');
      setMobileImageFileName(result.fileName);
      setMobilePreviewImage(result.cdnUrl);
      message.success('모바일 이미지가 업로드되었습니다');
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('모바일 이미지 업로드 실패');
      console.error(error);
      return false;
    } finally {
      setUploadingMobile(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!desktopImageFileName) {
        message.error('PC/Pad 배너 이미지를 업로드해주세요');
        return;
      }

      if (!mobileImageFileName) {
        message.error('모바일 배너 이미지를 업로드해주세요');
        return;
      }

      if (editingBanner) {
        // 수정
        const updateData: BannerUpdateRequest = {
          ...values,
          desktopImageFileName: desktopImageFileName,
          mobileImageFileName: mobileImageFileName,
        };
        await homeApi.updateBanner(editingBanner.bannerId, updateData);
        message.success('배너가 수정되었습니다');
      } else {
        // 생성
        const createData: BannerCreateRequest = {
          ...values,
          desktopImageFileName: desktopImageFileName,
          mobileImageFileName: mobileImageFileName,
        };
        await homeApi.createBanner(createData);
        message.success('배너가 생성되었습니다');
      }

      setModalVisible(false);
      form.resetFields();
      setDesktopImageFileName('');
      setMobileImageFileName('');
      setDesktopPreviewImage('');
      setMobilePreviewImage('');
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
      key: 'preview',
      width: 350,
      render: (_: unknown, record: Banner) => (
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-grayscale-gray5)', marginBottom: '4px' }}>PC/Pad</div>
            <Image
              src={record.desktopImageUrl}
              alt="PC/Pad 배너"
              width={150}
              height={75}
              style={{ objectFit: 'cover', borderRadius: '8px' }}
              preview
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-grayscale-gray5)', marginBottom: '4px' }}>모바일</div>
            <Image
              src={record.mobileImageUrl}
              alt="모바일 배너"
              width={150}
              height={75}
              style={{ objectFit: 'cover', borderRadius: '8px' }}
              preview
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </div>
        </div>
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
      title: '표시 대상',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
      width: 150,
      render: (targetAudience: string[] | undefined) => {
        if (!targetAudience || targetAudience.length === 0) {
          return <Tag color="blue">전체</Tag>;
        }
        return (
          <Space size={4} wrap>
            {targetAudience.includes('guest') && <Tag color="default">비회원</Tag>}
            {targetAudience.includes('adopter') && <Tag color="green">입양자</Tag>}
            {targetAudience.includes('breeder') && <Tag color="purple">브리더</Tag>}
          </Space>
        );
      },
    },
    {
      title: '활성화',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: Banner) => (
        <Switch checked={isActive !== false} onChange={() => handleToggleActive(record.bannerId, isActive !== false)} />
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Banner) => (
        <Space size="middle" onClick={(e) => e.stopPropagation()}>
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
            title="배너 삭제"
            description="정말 이 배너를 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.bannerId)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            >
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* 페이지 헤더 */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-primary-500)' }}>
            메인 배너 관리
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">메인 화면에 표시될 배너를 관리합니다</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="w-full sm:w-auto"
          style={{
            backgroundColor: 'var(--color-primary-500)',
            borderColor: 'var(--color-primary-500)',
          }}
        >
          배너 추가
        </Button>
      </div>

      {/* 테이블 스크롤 래퍼 - 모바일에서 가로 스크롤 가능 */}
      <div className="overflow-x-auto -mx-3 sm:mx-0 mb-6">
        <Card style={{ borderRadius: '12px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
          <Table
            columns={columns}
            dataSource={banners}
            rowKey="bannerId"
            loading={loading}
            scroll={{ x: 1000 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}개`,
              responsive: true,
            }}
          />
        </Card>
      </div>

      <Modal
        title={editingBanner ? '배너 수정' : '배너 추가'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setDesktopImageFileName('');
          setMobileImageFileName('');
          setDesktopPreviewImage('');
          setMobilePreviewImage('');
        }}
        width="100%"
        style={{ maxWidth: '700px', top: 20 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
          },
        }}
        okText={editingBanner ? '수정' : '생성'}
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          {/* PC/Pad 버전 배너 이미지 */}
          <Form.Item label="배너 이미지 (PC/Pad 버전)" required>
            <Upload beforeUpload={handleUploadDesktop} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploading}>
                PC/Pad 이미지 업로드
              </Button>
            </Upload>
            {desktopPreviewImage && (
              <div style={{ marginTop: '12px' }}>
                <Image
                  src={desktopPreviewImage}
                  alt="PC/Pad 미리보기"
                  width="100%"
                  style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                />
              </div>
            )}
            {!desktopPreviewImage && (
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
                PC/Pad용 이미지를 업로드해주세요
              </div>
            )}
          </Form.Item>

          {/* 모바일 버전 배너 이미지 */}
          <Form.Item label="배너 이미지 (모바일 버전)" required>
            <Upload beforeUpload={handleUploadMobile} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploadingMobile}>
                모바일 이미지 업로드
              </Button>
            </Upload>
            {mobilePreviewImage && (
              <div style={{ marginTop: '12px' }}>
                <Image
                  src={mobilePreviewImage}
                  alt="모바일 미리보기"
                  width="100%"
                  style={{ maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                />
              </div>
            )}
            {!mobilePreviewImage && (
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
                모바일용 이미지를 업로드해주세요
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

          <Form.Item
            name="targetAudience"
            label="표시 대상"
            extra="선택하지 않으면 전체 사용자에게 표시됩니다"
          >
            <Checkbox.Group
              options={[
                { label: '비회원', value: 'guest' },
                { label: '입양자', value: 'adopter' },
                { label: '브리더', value: 'breeder' },
              ]}
            />
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
