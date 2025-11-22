import { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  Checkbox,
  Input,
  message,
  Space,
  Descriptions,
  Image,
  Card,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { breederApi } from '../../features/breeder/api/breederApi';
import type { BreederVerification } from '../../shared/types/api.types';

const { TextArea } = Input;
const { Option } = Select;

// 반려 사유 목록 (MVP 명세서 기준)
const REJECTION_REASONS = [
  '제출된 서류가 불명확하거나 확인이 어려움',
  '필수 서류 누락 (신분증, 동물생산업 등록증 등)',
  '사업자 정보 불일치',
  '브리더 활동 이력 부족',
  '기타 사유',
];

export default function BreederVerification() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<BreederVerification[]>([]);
  const [selectedBreeder, setSelectedBreeder] = useState<BreederVerification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    setLoading(true);
    try {
      const data = await breederApi.getPendingVerifications();
      setDataSource(data);
    } catch (error: any) {
      console.error('Failed to fetch pending verifications:', error);
      message.error('인증 대기 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: BreederVerification) => {
    setSelectedBreeder(record);
    setIsModalOpen(true);
  };

  const handleApprove = async (breederId: string, level: 'new' | 'elite') => {
    Modal.confirm({
      title: `${level === 'elite' ? '엘리트' : '뉴'} 레벨로 승인하시겠습니까?`,
      content: '승인 후에는 브리더가 서비스를 이용할 수 있습니다.',
      okText: '승인',
      cancelText: '취소',
      onOk: async () => {
        try {
          await breederApi.updateVerification(breederId, {
            action: 'approve',
          });
          message.success('브리더 인증이 승인되었습니다.');
          fetchPendingVerifications();
        } catch (error: any) {
          console.error('Approval failed:', error);
          message.error('승인에 실패했습니다.');
        }
      },
    });
  };

  const handleReject = (record: BreederVerification) => {
    setSelectedBreeder(record);
    setIsRejectModalOpen(true);
    form.resetFields();
  };

  const handleRejectSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selectedReasons = values.rejectionReasons || [];
      const customReason = values.customReason || '';

      // 체크박스 선택된 항목 조합
      const rejectionReason = [
        ...selectedReasons,
        customReason && `기타: ${customReason}`,
      ]
        .filter(Boolean)
        .join('\n');

      if (!selectedBreeder) return;

      await breederApi.updateVerification(selectedBreeder.breederId, {
        action: 'reject',
        rejectionReason,
      });

      message.success('브리더 인증이 반려되었습니다. 반려 사유가 이메일로 발송됩니다.');
      setIsRejectModalOpen(false);
      fetchPendingVerifications();
    } catch (error: any) {
      console.error('Rejection failed:', error);
      message.error('반려 처리에 실패했습니다.');
    }
  };

  const columns: ColumnsType<BreederVerification> = [
    {
      title: '브리더명',
      dataIndex: 'breederName',
      key: 'breederName',
      width: 150,
    },
    {
      title: '이메일',
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: 200,
    },
    {
      title: '요금제',
      dataIndex: ['verificationInfo', 'subscriptionPlan'],
      key: 'subscriptionPlan',
      width: 120,
      render: (plan: string) => (
        <Tag color={plan === 'premium' ? 'gold' : 'blue'}>
          {plan === 'premium' ? '프리미엄' : '베이직'}
        </Tag>
      ),
    },
    {
      title: '신청일',
      dataIndex: ['verificationInfo', 'submittedAt'],
      key: 'submittedAt',
      width: 150,
      render: (date: string) => date ? new Date(date).toLocaleDateString('ko-KR') : '-',
    },
    {
      title: '상태',
      dataIndex: ['verificationInfo', 'verificationStatus'],
      key: 'verificationStatus',
      width: 100,
      render: (status: string) => (
        <Tag color="orange">{status === 'pending' ? '대기 중' : status}</Tag>
      ),
    },
    {
      title: '액션',
      key: 'action',
      width: 350,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            상세 보기
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.breederId, 'elite')}
            size="small"
            style={{
              backgroundColor: 'var(--color-level-elite-100)',
              color: 'var(--color-level-elite-500)',
              borderColor: 'var(--color-level-elite-500)',
              fontWeight: 500
            }}
          >
            엘리트 승인
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.breederId, 'new')}
            size="small"
            style={{
              backgroundColor: 'var(--color-level-new-100)',
              color: 'var(--color-level-new-500)',
              borderColor: 'var(--color-level-new-500)',
              fontWeight: 500
            }}
          >
            뉴 승인
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleReject(record)}
            size="small"
          >
            반려
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-500)' }}>
          브리더 인증 관리
        </h1>
        <p className="text-gray-500">브리더 인증 신청을 검토하고 승인/반려 처리합니다</p>
      </div>

      {/* 통계 카드 */}
      <Card
        className="mb-6"
        style={{
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg"
            style={{ backgroundColor: 'var(--color-tertiary-500)' }}
          >
            <FileTextOutlined style={{ fontSize: '24px', color: 'var(--color-primary-500)' }} />
          </div>
          <div>
            <p className="text-sm text-gray-500">승인 대기 중</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-500)' }}>
              {dataSource.length}명
            </p>
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="breederId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `총 ${total}건`,
        }}
      />

      {/* 상세 보기 모달 */}
      <Modal
        title="브리더 상세 정보"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedBreeder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="브리더명" span={2}>
                {selectedBreeder.breederName}
              </Descriptions.Item>
              <Descriptions.Item label="이메일">
                {selectedBreeder.emailAddress}
              </Descriptions.Item>
              <Descriptions.Item label="요금제">
                <Tag color={selectedBreeder.verificationInfo.subscriptionPlan === 'premium' ? 'gold' : 'blue'}>
                  {selectedBreeder.verificationInfo.subscriptionPlan === 'premium' ? '프리미엄' : '베이직'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="신청일" span={2}>
                {selectedBreeder.verificationInfo.submittedAt
                  ? new Date(selectedBreeder.verificationInfo.submittedAt).toLocaleString('ko-KR')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="상태" span={2}>
                <Tag color="orange">
                  {selectedBreeder.verificationInfo.verificationStatus === 'pending'
                    ? '대기 중'
                    : selectedBreeder.verificationInfo.verificationStatus}
                </Tag>
              </Descriptions.Item>
              {selectedBreeder.verificationInfo.isSubmittedByEmail && (
                <Descriptions.Item label="제출 방식" span={2}>
                  <Tag color="blue">이메일 제출</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">제출된 서류</h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedBreeder.verificationInfo.documentUrls.map((doc, index) => (
                  <div key={index} className="border p-2 rounded">
                    <p className="text-sm text-gray-600 mb-2">서류 {index + 1}</p>
                    <Image
                      src={doc}
                      alt={`서류 ${index + 1}`}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setIsModalOpen(false)}>닫기</Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  handleApprove(selectedBreeder.breederId, 'elite');
                }}
                style={{
                  backgroundColor: 'var(--color-level-elite-500)',
                  color: '#fff',
                  borderColor: 'var(--color-level-elite-500)',
                  fontWeight: 500
                }}
              >
                엘리트 승인
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  handleApprove(selectedBreeder.breederId, 'new');
                }}
                style={{
                  backgroundColor: 'var(--color-level-new-500)',
                  color: '#fff',
                  borderColor: 'var(--color-level-new-500)',
                  fontWeight: 500
                }}
              >
                뉴 승인
              </Button>
              <Button
                danger
                onClick={() => {
                  setIsModalOpen(false);
                  handleReject(selectedBreeder);
                }}
              >
                반려
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 반려 사유 모달 */}
      <Modal
        title="브리더 인증 반려"
        open={isRejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => setIsRejectModalOpen(false)}
        okText="반려 처리"
        okButtonProps={{ danger: true }}
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rejectionReasons"
            label="반려 사유 (복수 선택 가능)"
            rules={[{ required: true, message: '최소 1개 이상 선택해주세요' }]}
          >
            <Checkbox.Group className="flex flex-col space-y-2">
              {REJECTION_REASONS.slice(0, -1).map((reason, index) => (
                <Checkbox key={index} value={reason}>
                  {reason}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>

          <Form.Item name="customReason" label="기타 사유 (선택)">
            <TextArea
              rows={3}
              placeholder="기타 반려 사유를 입력해주세요"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div className="bg-yellow-50 p-3 rounded mt-4">
            <p className="text-sm text-yellow-800">
              💡 선택된 반려 사유는 자동으로 이메일에 포함되어 브리더에게 발송됩니다.
            </p>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
