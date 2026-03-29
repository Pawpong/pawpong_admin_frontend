import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Button, message, Modal, Form, Input, Select, Space, Tag, Switch, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { appVersionApi } from '../../features/app-version/api/appVersionApi';
import type { AppVersion as AppVersionType, AppVersionCreateRequest, AppVersionUpdateRequest } from '../../features/app-version/api/appVersionApi';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 앱 버전 관리 페이지
 * iOS/Android 앱 강제/권장 업데이트 버전 정보를 관리합니다.
 */
const AppVersion: React.FC = () => {
  const [dataSource, setDataSource] = useState<AppVersionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVersion, setEditingVersion] = useState<AppVersionType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [form] = Form.useForm();

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await appVersionApi.getAppVersions(currentPage, pageSize);
      setDataSource(response.data.items);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error: unknown) {
      console.error('Failed to fetch app versions:', error);
      setDataSource([]);
      message.error('앱 버전 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleCreate = () => {
    setEditingVersion(null);
    form.resetFields();
    form.setFieldsValue({ platform: 'ios', isActive: true });
    setModalVisible(true);
  };

  const handleEdit = (record: AppVersionType) => {
    setEditingVersion(record);
    form.setFieldsValue({
      platform: record.platform,
      latestVersion: record.latestVersion,
      minRequiredVersion: record.minRequiredVersion,
      forceUpdateMessage: record.forceUpdateMessage,
      recommendUpdateMessage: record.recommendUpdateMessage,
      iosStoreUrl: record.iosStoreUrl,
      androidStoreUrl: record.androidStoreUrl,
      isActive: record.isActive,
    });
    setModalVisible(true);
  };

  const handleDelete = async (appVersionId: string) => {
    try {
      await appVersionApi.deleteAppVersion(appVersionId);
      message.success('앱 버전이 삭제되었습니다.');
      fetchVersions();
    } catch (error: unknown) {
      console.error('Failed to delete app version:', error);
      message.error('앱 버전 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (record: AppVersionType) => {
    try {
      await appVersionApi.updateAppVersion(record.appVersionId, { isActive: !record.isActive });
      message.success(`앱 버전이 ${!record.isActive ? '활성화' : '비활성화'}되었습니다.`);
      fetchVersions();
    } catch (error: unknown) {
      console.error('Failed to toggle app version:', error);
      message.error('상태 변경에 실패했습니다.');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingVersion) {
        const updateData: AppVersionUpdateRequest = {
          latestVersion: values.latestVersion,
          minRequiredVersion: values.minRequiredVersion,
          forceUpdateMessage: values.forceUpdateMessage,
          recommendUpdateMessage: values.recommendUpdateMessage,
          iosStoreUrl: values.iosStoreUrl,
          androidStoreUrl: values.androidStoreUrl,
          isActive: values.isActive,
        };
        await appVersionApi.updateAppVersion(editingVersion.appVersionId, updateData);
        message.success('앱 버전이 수정되었습니다.');
      } else {
        const createData: AppVersionCreateRequest = {
          platform: values.platform,
          latestVersion: values.latestVersion,
          minRequiredVersion: values.minRequiredVersion,
          forceUpdateMessage: values.forceUpdateMessage,
          recommendUpdateMessage: values.recommendUpdateMessage,
          iosStoreUrl: values.iosStoreUrl,
          androidStoreUrl: values.androidStoreUrl,
          isActive: values.isActive ?? true,
        };
        await appVersionApi.createAppVersion(createData);
        message.success('앱 버전이 생성되었습니다.');
      }

      setModalVisible(false);
      fetchVersions();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        message.error('모든 필드를 올바르게 입력해주세요.');
      } else {
        console.error('Failed to save app version:', error);
        message.error('앱 버전 저장에 실패했습니다.');
      }
    }
  };

  const columns: ColumnsType<AppVersionType> = [
    {
      title: '플랫폼',
      dataIndex: 'platform',
      key: 'platform',
      width: 100,
      render: (platform: string) =>
        platform === 'ios' ? <Tag color="blue">iOS</Tag> : <Tag color="green">Android</Tag>,
      filters: [
        { text: 'iOS', value: 'ios' },
        { text: 'Android', value: 'android' },
      ],
      onFilter: (value, record) => record.platform === value,
    },
    {
      title: '최신 버전',
      dataIndex: 'latestVersion',
      key: 'latestVersion',
      width: 120,
      render: (version: string) => <span style={{ fontWeight: 600 }}>{version}</span>,
    },
    {
      title: '최소 요구 버전',
      dataIndex: 'minRequiredVersion',
      key: 'minRequiredVersion',
      width: 130,
      render: (version: string) => <Tag color="red">{version}</Tag>,
    },
    {
      title: '활성 상태',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="활성"
          unCheckedChildren="비활성"
        />
      ),
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '작업',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            수정
          </Button>
          <Popconfirm
            title="앱 버전 삭제"
            description="이 버전 정보를 삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.appVersionId)}
            okText="삭제"
            cancelText="취소"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
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
            <span style={{ fontSize: '18px', fontWeight: 600 }}>앱 버전 관리</span>
            <Tag color="blue">{totalItems}개</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            새 버전 추가
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="appVersionId"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showTotal: (total) => `총 ${total}개`,
            showSizeChanger: true,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* 앱 버전 생성/수정 모달 */}
      <Modal
        title={editingVersion ? '앱 버전 수정' : '새 앱 버전 추가'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={640}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item
            name="platform"
            label="플랫폼"
            rules={[{ required: true, message: '플랫폼을 선택해주세요' }]}
          >
            <Select placeholder="플랫폼 선택" disabled={!!editingVersion}>
              <Option value="ios">iOS</Option>
              <Option value="android">Android</Option>
            </Select>
          </Form.Item>

          <Space style={{ display: 'flex' }} align="start">
            <Form.Item
              name="latestVersion"
              label="최신 버전"
              rules={[{ required: true, message: '최신 버전을 입력해주세요' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="예: 1.2.0" />
            </Form.Item>

            <Form.Item
              name="minRequiredVersion"
              label="최소 요구 버전"
              rules={[{ required: true, message: '최소 요구 버전을 입력해주세요' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="예: 1.0.0" />
            </Form.Item>
          </Space>

          <Form.Item
            name="forceUpdateMessage"
            label="강제 업데이트 메시지"
            rules={[{ required: true, message: '강제 업데이트 메시지를 입력해주세요' }]}
          >
            <TextArea rows={2} placeholder="필수 보안 업데이트가 있습니다. 앱을 업데이트해주세요." />
          </Form.Item>

          <Form.Item
            name="recommendUpdateMessage"
            label="권장 업데이트 메시지"
            rules={[{ required: true, message: '권장 업데이트 메시지를 입력해주세요' }]}
          >
            <TextArea rows={2} placeholder="새로운 기능이 추가되었습니다. 업데이트를 권장합니다." />
          </Form.Item>

          <Form.Item
            name="iosStoreUrl"
            label="iOS App Store URL"
            rules={[{ required: true, message: 'iOS 스토어 URL을 입력해주세요' }]}
          >
            <Input placeholder="https://apps.apple.com/app/pawpong/id000000000" />
          </Form.Item>

          <Form.Item
            name="androidStoreUrl"
            label="Google Play Store URL"
            rules={[{ required: true, message: 'Android 스토어 URL을 입력해주세요' }]}
          >
            <Input placeholder="https://play.google.com/store/apps/details?id=kr.pawpong.app" />
          </Form.Item>

          <Form.Item name="isActive" label="활성 상태" valuePropName="checked">
            <Switch checkedChildren="활성" unCheckedChildren="비활성" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppVersion;
