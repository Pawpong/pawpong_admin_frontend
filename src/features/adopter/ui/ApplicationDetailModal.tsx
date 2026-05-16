import { Modal, Button, Descriptions, Tag, Spin } from 'antd';
import dayjs from 'dayjs';

import type { ApplicationDetailData } from '../../../shared/types/api.types';

const STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  consultation_pending: { color: 'default', text: '상담 대기' },
  consultation_completed: { color: 'processing', text: '상담 완료' },
  adoption_approved: { color: 'success', text: '입양 승인' },
  adoption_rejected: { color: 'error', text: '입양 거절' },
};

interface Props {
  visible: boolean;
  loading: boolean;
  application: ApplicationDetailData | null;
  onClose: () => void;
}

export function ApplicationDetailModal({ visible, loading, application, onClose }: Props) {
  const getStatusTag = (s: string) => { const c = STATUS_CONFIG[s] || { color: 'default', text: s }; return <Tag color={c.color}>{c.text}</Tag>; };

  return (
    <Modal title="상담 신청 상세" open={visible} onCancel={onClose} footer={[<Button key="close" onClick={onClose}>닫기</Button>]} width="100%" style={{ maxWidth: '800px', top: 20 }} styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}>
      {loading ? (
        <div className="flex justify-center items-center py-12"><Spin size="large" /></div>
      ) : application ? (
        <div className="flex flex-col gap-6">
          <Descriptions title="기본 정보" bordered column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="신청 ID" span={2}>{application.applicationId}</Descriptions.Item>
            <Descriptions.Item label="상태">{getStatusTag(application.status)}</Descriptions.Item>
            <Descriptions.Item label="반려동물">{application.petName || '-'}</Descriptions.Item>
            <Descriptions.Item label="입양자명">{application.adopterName}</Descriptions.Item>
            <Descriptions.Item label="이메일">{application.adopterEmail}</Descriptions.Item>
            <Descriptions.Item label="전화번호">{application.adopterPhone}</Descriptions.Item>
            <Descriptions.Item label="브리더명">{application.breederName}</Descriptions.Item>
            <Descriptions.Item label="신청일">{dayjs(application.appliedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="처리일시">{application.processedAt ? dayjs(application.processedAt).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
          </Descriptions>

          <Descriptions title="신청서 내용" bordered column={1} size="small">
            <Descriptions.Item label="개인정보 수집 동의"><Tag color={application.standardResponses.privacyConsent ? 'success' : 'error'}>{application.standardResponses.privacyConsent ? '동의' : '미동의'}</Tag></Descriptions.Item>
            <Descriptions.Item label="자기소개"><div style={{ whiteSpace: 'pre-wrap' }}>{application.standardResponses.selfIntroduction}</div></Descriptions.Item>
            <Descriptions.Item label="가족 구성원">{application.standardResponses.familyMembers}</Descriptions.Item>
            <Descriptions.Item label="가족 전원 동의"><Tag color={application.standardResponses.allFamilyConsent ? 'success' : 'error'}>{application.standardResponses.allFamilyConsent ? '동의' : '미동의'}</Tag></Descriptions.Item>
            <Descriptions.Item label="알러지 검사 정보">{application.standardResponses.allergyTestInfo}</Descriptions.Item>
            <Descriptions.Item label="집을 비우는 시간">{application.standardResponses.timeAwayFromHome}</Descriptions.Item>
            <Descriptions.Item label="주거 공간 소개"><div style={{ whiteSpace: 'pre-wrap' }}>{application.standardResponses.livingSpaceDescription}</div></Descriptions.Item>
            <Descriptions.Item label="반려동물 경험"><div style={{ whiteSpace: 'pre-wrap' }}>{application.standardResponses.previousPetExperience}</div></Descriptions.Item>
            <Descriptions.Item label="기본 케어 가능"><Tag color={application.standardResponses.canProvideBasicCare ? 'success' : 'error'}>{application.standardResponses.canProvideBasicCare ? '가능' : '불가'}</Tag></Descriptions.Item>
            <Descriptions.Item label="치료비 감당 가능"><Tag color={application.standardResponses.canAffordMedicalExpenses ? 'success' : 'error'}>{application.standardResponses.canAffordMedicalExpenses ? '가능' : '불가'}</Tag></Descriptions.Item>
            {application.standardResponses.preferredPetDescription && <Descriptions.Item label="관심 동물 특징"><div style={{ whiteSpace: 'pre-wrap' }}>{application.standardResponses.preferredPetDescription}</div></Descriptions.Item>}
            {application.standardResponses.desiredAdoptionTiming && <Descriptions.Item label="희망 입양 시기">{application.standardResponses.desiredAdoptionTiming}</Descriptions.Item>}
            {application.standardResponses.additionalNotes && <Descriptions.Item label="추가 메시지"><div style={{ whiteSpace: 'pre-wrap' }}>{application.standardResponses.additionalNotes}</div></Descriptions.Item>}
          </Descriptions>

          {application.customResponses.length > 0 && (
            <Descriptions title="추가 질문 응답" bordered column={1} size="small">
              {application.customResponses.map((cr) => <Descriptions.Item key={cr.questionId} label={cr.questionLabel}>{Array.isArray(cr.answer) ? cr.answer.join(', ') : String(cr.answer)}</Descriptions.Item>)}
            </Descriptions>
          )}

          {application.breederNotes && (
            <Descriptions title="브리더 메모" bordered column={1} size="small">
              <Descriptions.Item label="메모 내용"><div style={{ whiteSpace: 'pre-wrap' }}>{application.breederNotes}</div></Descriptions.Item>
            </Descriptions>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
