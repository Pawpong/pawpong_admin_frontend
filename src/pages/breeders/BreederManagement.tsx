import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Card, message, Space, Descriptions, Select, Tooltip } from 'antd';
import { SwapOutlined, StopOutlined, BellOutlined, EyeOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { breederApi } from '../../features/breeder/api/breederApi';
import type { BreederVerification } from '../../shared/types/api.types';

const { TextArea } = Input;
const { Option } = Select;

// 레벨 표시
const getLevelTag = (level: string) => {
  if (level === 'elite') {
    return (
      <Tag
        style={{
          backgroundColor: 'var(--color-level-elite-100)',
          color: 'var(--color-level-elite-500)',
          borderColor: 'var(--color-level-elite-500)',
          fontWeight: 500,
        }}
      >
        엘리트
      </Tag>
    );
  }
  return (
    <Tag
      style={{
        backgroundColor: 'var(--color-level-new-100)',
        color: 'var(--color-level-new-500)',
        borderColor: 'var(--color-level-new-500)',
        fontWeight: 500,
      }}
    >
      뉴
    </Tag>
  );
};

export default function BreederManagement() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<BreederVerification[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBreeder, setSelectedBreeder] = useState<BreederVerification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLevelChangeModalOpen, setIsLevelChangeModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false);
  const [isRemindModalOpen, setIsRemindModalOpen] = useState(false);
  const [selectedBreeders, setSelectedBreeders] = useState<string[]>([]);
  const [levelChangeForm] = Form.useForm();
  const [suspendForm] = Form.useForm();
  const [remindForm] = Form.useForm();

  // 통계 상태
  const [stats, setStats] = useState({
    totalApproved: 0,
    eliteCount: 0,
    newCount: 0,
  });

  useEffect(() => {
    fetchApprovedBreeders();
    fetchStats();
  }, [currentPage, pageSize]);

  const fetchApprovedBreeders = async () => {
    setLoading(true);
    try {
      // 승인된 브리더 목록 조회 (status='approved')
      const response = await breederApi.getBreeders('approved', currentPage, pageSize);
      setDataSource(response.items);
      setTotal(response.pagination.totalItems);
    } catch (error: unknown) {
      console.error('Failed to fetch breeders:', error);
      message.error('브리더 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await breederApi.getBreederStats();
      setStats(result);
    } catch (error: unknown) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewDetails = (record: BreederVerification) => {
    setSelectedBreeder(record);
    setIsDetailModalOpen(true);
  };

  const handleChangeLevelClick = (record: BreederVerification) => {
    setSelectedBreeder(record);
    levelChangeForm.resetFields();
    setIsLevelChangeModalOpen(true);
  };

  const handleChangeLevelSubmit = async () => {
    if (!selectedBreeder) return;

    try {
      const values = await levelChangeForm.validateFields();
      await breederApi.changeLevel(selectedBreeder.breederId, values.level);

      message.success('브리더 레벨이 변경되었습니다.');
      setIsLevelChangeModalOpen(false);
      fetchApprovedBreeders();
      fetchStats(); // 통계 다시 불러오기
    } catch (error: unknown) {
      console.error('Level change failed:', error);
      message.error('레벨 변경에 실패했습니다.');
    }
  };

  const handleSuspendClick = (record: BreederVerification) => {
    setSelectedBreeder(record);
    suspendForm.resetFields();
    setIsSuspendModalOpen(true);
  };

  const handleSuspendSubmit = async () => {
    if (!selectedBreeder) return;

    try {
      const values = await suspendForm.validateFields();
      await breederApi.suspendBreeder(selectedBreeder.breederId, values.reason);

      message.success('브리더 계정이 정지되었습니다.');
      setIsSuspendModalOpen(false);
      fetchApprovedBreeders();
      fetchStats(); // 통계 다시 불러오기
    } catch (error: unknown) {
      console.error('Suspend failed:', error);
      message.error('계정 정지에 실패했습니다.');
    }
  };

  const handleUnsuspendClick = (record: BreederVerification) => {
    setSelectedBreeder(record);
    setIsUnsuspendModalOpen(true);
  };

  const handleUnsuspendSubmit = async () => {
    if (!selectedBreeder) return;

    try {
      await breederApi.unsuspendBreeder(selectedBreeder.breederId);
      message.success('브리더 계정 정지가 해제되었습니다.');
      setIsUnsuspendModalOpen(false);
      fetchApprovedBreeders();
      fetchStats();
    } catch (error: unknown) {
      console.error('Unsuspend failed:', error);
      message.error('계정 정지 해제에 실패했습니다.');
    }
  };

  const handleRemindClick = () => {
    if (selectedBreeders.length === 0) {
      message.warning('리마인드를 보낼 브리더를 선택해주세요.');
      return;
    }
    remindForm.resetFields();
    setIsRemindModalOpen(true);
  };

  const handleRemindSubmit = async () => {
    try {
      const values = await remindForm.validateFields();
      await breederApi.sendReminder(selectedBreeders, values.message);

      message.success(`${selectedBreeders.length}명의 브리더에게 리마인드가 발송되었습니다.`);
      setIsRemindModalOpen(false);
      setSelectedBreeders([]);
    } catch (error: unknown) {
      console.error('Remind failed:', error);
      message.error('리마인드 발송에 실패했습니다.');
    }
  };

  const columns: ColumnsType<BreederVerification> = [
    {
      title: '브리더명',
      dataIndex: 'breederName',
      key: 'breederName',
      width: 150,
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: '이메일',
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: 200,
    },
    {
      title: '레벨',
      dataIndex: ['verificationInfo', 'level'],
      key: 'level',
      width: 100,
      render: (level: string) => getLevelTag(level || 'new'),
    },
    {
      title: '승인일',
      dataIndex: ['verificationInfo', 'submittedAt'],
      key: 'approvedAt',
      width: 150,
      render: (date: string) => (date ? new Date(date).toLocaleDateString('ko-KR') : '-'),
    },
    {
      title: '계정 상태',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      width: 100,
      render: (status: string) => {
        if (status === 'suspended') {
          return <Tag color="red">정지됨</Tag>;
        }
        return <Tag color="green">활성</Tag>;
      },
    },
    {
      title: '액션',
      key: 'action',
      width: 350,
      render: (_, record) => {
        const isSuspended = record.accountStatus === 'suspended';

        return (
          <Space size="small">
            <Tooltip title="상세 보기">
              <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
                상세
              </Button>
            </Tooltip>
            {!isSuspended && (
              <Tooltip title="레벨 변경 (뉴 ↔ 엘리트)">
                <Button
                  icon={<SwapOutlined />}
                  onClick={() => handleChangeLevelClick(record)}
                  size="small"
                  style={{
                    backgroundColor: 'var(--color-tertiary-500)',
                    borderColor: 'var(--color-primary-500)',
                  }}
                >
                  레벨 변경
                </Button>
              </Tooltip>
            )}
            {isSuspended ? (
              <Tooltip title="계정 정지 해제">
                <Button icon={<CheckCircleOutlined />} onClick={() => handleUnsuspendClick(record)} size="small">
                  정지 해제
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title="계정 정지 (영구)">
                <Button danger icon={<StopOutlined />} onClick={() => handleSuspendClick(record)} size="small">
                  정지
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* 페이지 헤더 */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-500)' }}>
          브리더 관리
        </h1>
        <p className="text-sm sm:text-base text-gray-500">승인된 브리더의 레벨을 변경하거나 계정을 관리합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg"
              style={{ backgroundColor: 'var(--color-tertiary-500)' }}
            >
              <UserOutlined style={{ fontSize: '24px', color: 'var(--color-primary-500)' }} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">전체 승인된 브리더</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary-500)' }}>
                {stats.totalApproved}명
              </p>
            </div>
          </div>
        </Card>

        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg"
              style={{ backgroundColor: 'var(--color-level-elite-100)' }}
            >
              <UserOutlined style={{ fontSize: '24px', color: 'var(--color-level-elite-500)' }} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">엘리트 브리더</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-level-elite-500)' }}>
                {stats.eliteCount}명
              </p>
            </div>
          </div>
        </Card>

        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg"
              style={{ backgroundColor: 'var(--color-level-new-100)' }}
            >
              <UserOutlined style={{ fontSize: '24px', color: 'var(--color-level-new-500)' }} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">뉴 브리더</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-level-new-500)' }}>
                {stats.newCount}명
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 액션 버튼 */}
      <div className="mb-4 flex flex-col sm:flex-row justify-end gap-2">
        <Button
          block
          className="sm:w-auto"
          icon={<BellOutlined />}
          onClick={handleRemindClick}
          disabled={selectedBreeders.length === 0}
          style={{
            backgroundColor: selectedBreeders.length > 0 ? 'var(--color-primary-500)' : undefined,
            color: selectedBreeders.length > 0 ? '#fff' : undefined,
            borderColor: selectedBreeders.length > 0 ? 'var(--color-primary-500)' : undefined,
          }}
        >
          선택한 브리더에게 리마인드 발송 ({selectedBreeders.length})
        </Button>
      </div>

      {/* 테이블 스크롤 래퍼 - 모바일에서 가로 스크롤 가능 */}
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="breederId"
          loading={loading}
          scroll={{ x: 800 }}
          rowSelection={{
            selectedRowKeys: selectedBreeders,
            onChange: (selectedRowKeys) => setSelectedBreeders(selectedRowKeys as string[]),
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
                setCurrentPage(1); // Reset to page 1 when page size changes
              }
            },
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
            responsive: true,
          }}
        />
      </div>

      {/* 상세 보기 모달 */}
      <Modal
        title="브리더 상세 정보"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" block className="sm:w-auto" onClick={() => setIsDetailModalOpen(false)}>
            닫기
          </Button>,
        ]}
        width="100%"
        style={{ maxWidth: '700px', top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        {selectedBreeder && (
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="브리더명" span={2}>
              <strong>{selectedBreeder.breederName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="이메일">{selectedBreeder.emailAddress}</Descriptions.Item>
            <Descriptions.Item label="레벨">
              {getLevelTag(selectedBreeder.verificationInfo.level || 'new')}
            </Descriptions.Item>
            <Descriptions.Item label="승인일" span={2}>
              {selectedBreeder.verificationInfo.submittedAt
                ? new Date(selectedBreeder.verificationInfo.submittedAt).toLocaleString('ko-KR')
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 레벨 변경 모달 */}
      <Modal
        title="브리더 레벨 변경"
        open={isLevelChangeModalOpen}
        onOk={handleChangeLevelSubmit}
        onCancel={() => setIsLevelChangeModalOpen(false)}
        okText="변경"
        cancelText="취소"
        width="100%"
        style={{ maxWidth: '500px', top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        <Form form={levelChangeForm} layout="vertical">
          <Form.Item name="level" label="변경할 레벨" rules={[{ required: true, message: '레벨을 선택해주세요' }]}>
            <Select placeholder="레벨 선택">
              <Option value="new">뉴</Option>
              <Option value="elite">엘리트</Option>
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="변경 사유 (선택)">
            <TextArea rows={3} placeholder="레벨 변경 사유를 입력해주세요" maxLength={500} showCount />
          </Form.Item>

          <div className="p-3 rounded mt-4" style={{ backgroundColor: 'var(--color-tertiary-500)' }}>
            <p className="text-sm" style={{ color: 'var(--color-primary-500)' }}>
              💡 레벨 변경은 즉시 반영됩니다.
            </p>
          </div>
        </Form>
      </Modal>

      {/* 계정 정지 모달 */}
      <Modal
        title="브리더 계정 정지"
        open={isSuspendModalOpen}
        onOk={handleSuspendSubmit}
        onCancel={() => setIsSuspendModalOpen(false)}
        okText="정지"
        okButtonProps={{ danger: true }}
        cancelText="취소"
        width="100%"
        style={{ maxWidth: '500px', top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        <Form form={suspendForm} layout="vertical">
          <Form.Item name="reason" label="정지 사유" rules={[{ required: true, message: '정지 사유를 입력해주세요' }]}>
            <TextArea
              rows={4}
              placeholder="정지 사유를 입력해주세요 (브리더에게 이메일로 발송됩니다)"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <div className="p-3 rounded mt-4" style={{ backgroundColor: 'var(--color-status-error-100)' }}>
            <p className="text-sm" style={{ color: 'var(--color-status-error-500)' }}>
              ⚠️ 계정 정지는 영구적이며, 브리더는 서비스를 이용할 수 없게 됩니다. 신중하게 결정해주세요.
            </p>
          </div>
        </Form>
      </Modal>

      {/* 계정 정지 해제 모달 */}
      <Modal
        title="브리더 계정 정지 해제"
        open={isUnsuspendModalOpen}
        onOk={handleUnsuspendSubmit}
        onCancel={() => setIsUnsuspendModalOpen(false)}
        okText="해제"
        cancelText="취소"
        width="100%"
        style={{ maxWidth: '500px', top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        {selectedBreeder && (
          <>
            <p className="mb-4">
              <strong>{selectedBreeder.breederName}</strong>님의 계정 정지를 해제하시겠습니까?
            </p>

            <div className="p-3 rounded mt-4" style={{ backgroundColor: 'var(--color-tertiary-500)' }}>
              <p className="text-sm" style={{ color: 'var(--color-primary-500)' }}>
                ✅ 정지가 해제되면 브리더는 다시 서비스를 이용할 수 있으며, 해제 안내 이메일이 발송됩니다.
              </p>
            </div>
          </>
        )}
      </Modal>

      {/* 리마인드 발송 모달 */}
      <Modal
        title="리마인드 알림 발송"
        open={isRemindModalOpen}
        onOk={handleRemindSubmit}
        onCancel={() => setIsRemindModalOpen(false)}
        okText="발송"
        cancelText="취소"
        width="100%"
        style={{ maxWidth: '500px', top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        <Form form={remindForm} layout="vertical">
          <p className="mb-4 text-sm text-gray-600">
            선택한 {selectedBreeders.length}명의 브리더에게 리마인드 알림을 발송합니다.
          </p>

          <Form.Item name="message" label="메시지" rules={[{ required: true, message: '메시지를 입력해주세요' }]}>
            <TextArea rows={4} placeholder="브리더에게 전달할 메시지를 입력해주세요" maxLength={1000} showCount />
          </Form.Item>

          <div className="p-3 rounded mt-4" style={{ backgroundColor: 'var(--color-tertiary-500)' }}>
            <p className="text-sm" style={{ color: 'var(--color-primary-500)' }}>
              💡 리마인드는 이메일로 발송됩니다.
            </p>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
