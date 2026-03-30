import { Modal, Descriptions, Tag, Image, Button } from 'antd';
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';

import type { BreederVerification } from '../../../shared/types/api.types';
import { DOCUMENT_TYPE_LABELS } from '../hooks/useBreederVerification';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '대기 중', color: 'default' },
  reviewing: { label: '검토 중', color: 'processing' },
  approved: { label: '승인됨', color: 'success' },
  rejected: { label: '반려됨', color: 'error' },
};

interface Props {
  visible: boolean;
  breeder: BreederVerification | null;
  onClose: () => void;
  onMarkAsReviewing: (id: string) => void;
  onApprove: (id: string, level: 'new' | 'elite') => void;
  onReject: (record: BreederVerification) => void;
}

export function VerificationDetailModal({ visible, breeder, onClose, onMarkAsReviewing, onApprove, onReject }: Props) {
  if (!breeder) return null;
  const level = breeder.verificationInfo?.level || 'new';
  const status = breeder.verificationInfo?.verificationStatus;
  const statusInfo = STATUS_MAP[status] || { label: status, color: 'default' };

  return (
    <Modal title="브리더 상세 정보" open={visible} onCancel={onClose} footer={null} width="100%" style={{ maxWidth: '800px', top: 20 }} styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}>
      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
        <Descriptions.Item label="브리더명">{breeder.breederName}</Descriptions.Item>
        <Descriptions.Item label="이메일">{breeder.emailAddress}</Descriptions.Item>
        <Descriptions.Item label="전화번호" span={2}>{breeder.phoneNumber || '-'}</Descriptions.Item>
        <Descriptions.Item label="신청 레벨">
          <Tag style={{ backgroundColor: level === 'elite' ? 'var(--color-level-elite-100)' : 'var(--color-level-new-100)', color: level === 'elite' ? 'var(--color-level-elite-500)' : 'var(--color-level-new-500)', borderColor: level === 'elite' ? 'var(--color-level-elite-500)' : 'var(--color-level-new-500)', fontWeight: 500 }}>
            {level === 'elite' ? '엘리트' : '뉴'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="요금제">
          <Tag color={breeder.verificationInfo.subscriptionPlan === 'premium' ? 'gold' : 'blue'}>{breeder.verificationInfo.subscriptionPlan === 'premium' ? '프리미엄' : '베이직'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="상태" span={2}><Tag color={statusInfo.color}>{statusInfo.label}</Tag></Descriptions.Item>
        <Descriptions.Item label="계정 생성일">{breeder.createdAt ? new Date(breeder.createdAt).toLocaleString('ko-KR') : '-'}</Descriptions.Item>
        <Descriptions.Item label="신청일">{breeder.verificationInfo.submittedAt ? new Date(breeder.verificationInfo.submittedAt).toLocaleString('ko-KR') : '-'}</Descriptions.Item>
        <Descriptions.Item label="지역">{breeder.profileInfo?.location ? String(breeder.profileInfo.location) : '-'}</Descriptions.Item>
        <Descriptions.Item label="세부 지역">{breeder.profileInfo?.detailedLocation ? String(breeder.profileInfo.detailedLocation) : '-'}</Descriptions.Item>
        <Descriptions.Item label="전문 분야" span={2}>
          {breeder.profileInfo?.specialization && Array.isArray(breeder.profileInfo.specialization) && breeder.profileInfo.specialization.length > 0
            ? breeder.profileInfo.specialization.map((spec: unknown) => <Tag key={String(spec)} color="blue">{spec === 'dog' ? '강아지' : '고양이'}</Tag>)
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="품종" span={2}>
          {breeder.profileInfo?.breeds && Array.isArray(breeder.profileInfo.breeds) && breeder.profileInfo.breeds.length > 0
            ? <>{breeder.profileInfo.breeds.map((b: unknown) => <Tag key={String(b)} color="green">{String(b)}</Tag>)}<span style={{ marginLeft: 8, color: '#666' }}>({breeder.profileInfo.breeds.length}종)</span></>
            : '-'}
        </Descriptions.Item>
      </Descriptions>

      {/* 서류 */}
      <div className="mt-4 sm:mt-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3">제출된 서류</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {breeder.verificationInfo.documents?.length > 0 ? breeder.verificationInfo.documents.map((doc, i) => {
            const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf');
            return (
              <div key={i} className="border p-2 rounded">
                <p className="text-sm font-semibold text-gray-700 mb-2">{DOCUMENT_TYPE_LABELS[doc.type] || doc.type}</p>
                <p className="text-xs text-gray-500 mb-2">업로드: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('ko-KR') : '-'}</p>
                {isPdf ? (
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded">
                    <FileTextOutlined style={{ fontSize: '48px', color: '#d32f2f' }} />
                    <p className="text-sm text-gray-600 mt-2 mb-3">PDF 파일</p>
                    <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => window.open(doc.fileUrl || doc.url, '_blank')}>PDF 보기</Button>
                  </div>
                ) : (
                  <Image src={doc.fileUrl || doc.url || '/placeholder.png'} alt={DOCUMENT_TYPE_LABELS[doc.type] || doc.type} className="w-full" fallback="/placeholder.png" />
                )}
              </div>
            );
          }) : <div className="col-span-2 text-center text-gray-500 py-4">제출된 서류가 없습니다</div>}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2">
        <Button onClick={onClose} block className="sm:w-auto">닫기</Button>
        <Button block className="sm:w-auto" onClick={() => onMarkAsReviewing(breeder.breederId)} style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#f59e0b', fontWeight: 500 }}>리뷰 완료</Button>
        {level === 'elite' && <Button block className="sm:w-auto" onClick={() => onApprove(breeder.breederId, 'elite')} style={{ backgroundColor: 'var(--color-level-elite-500)', color: '#fff', borderColor: 'var(--color-level-elite-500)', fontWeight: 500 }}>엘리트 승인</Button>}
        {level === 'new' && <Button block className="sm:w-auto" onClick={() => onApprove(breeder.breederId, 'new')} style={{ backgroundColor: 'var(--color-level-new-500)', color: '#fff', borderColor: 'var(--color-level-new-500)', fontWeight: 500 }}>뉴 승인</Button>}
        <Button danger block className="sm:w-auto" onClick={() => { onClose(); onReject(breeder); }}>반려</Button>
      </div>
    </Modal>
  );
}
