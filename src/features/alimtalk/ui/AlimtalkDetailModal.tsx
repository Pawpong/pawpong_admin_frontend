import { Modal, Button, Tag, Descriptions, Card } from 'antd';

import type { AlimtalkTemplate, AlimtalkButtonType } from '../../../shared/types/api.types';

/** 검수 상태 설정 */
const REVIEW_STATUS: Record<string, { color: string; text: string }> = {
  pending: { color: 'processing', text: '검수대기' },
  approved: { color: 'success', text: '검수통과' },
  rejected: { color: 'error', text: '검수거절' },
  re_review: { color: 'warning', text: '재검수' },
};

/** 버튼 타입 텍스트 */
const BUTTON_TYPE_TEXT: Record<AlimtalkButtonType, string> = {
  WL: '웹링크', AL: '앱링크', BK: '봇키워드', MD: '메시지전달',
  DS: '배송조회', BC: '상담톡전환', BT: '봇전환', AC: '채널추가',
};

interface AlimtalkDetailModalProps {
  visible: boolean;
  template: AlimtalkTemplate | null;
  onClose: () => void;
}

export function AlimtalkDetailModal({ visible, template, onClose }: AlimtalkDetailModalProps) {
  return (
    <Modal
      title="알림톡 템플릿 상세"
      open={visible}
      onCancel={onClose}
      footer={[<Button key="close" onClick={onClose}>닫기</Button>]}
      width={800}
    >
      {template && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="템플릿 코드">
              <span style={{ fontFamily: 'monospace' }}>{template.templateCode}</span>
            </Descriptions.Item>
            <Descriptions.Item label="템플릿 이름">{template.name}</Descriptions.Item>
            <Descriptions.Item label="설명">{template.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="솔라피 템플릿 ID">
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{template.templateId}</span>
            </Descriptions.Item>
            <Descriptions.Item label="검수 상태">
              <Tag color={REVIEW_STATUS[template.reviewStatus]?.color}>{REVIEW_STATUS[template.reviewStatus]?.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="활성화">
              <Tag color={template.isActive ? 'success' : 'default'}>{template.isActive ? 'ON' : 'OFF'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="SMS 대체 발송">{template.fallbackToSms ? '사용' : '미사용'}</Descriptions.Item>
            <Descriptions.Item label="필수 변수">{template.requiredVariables.join(', ') || '-'}</Descriptions.Item>
            <Descriptions.Item label="메모">{template.memo || '-'}</Descriptions.Item>
            <Descriptions.Item label="생성일">{template.createdAt}</Descriptions.Item>
            <Descriptions.Item label="수정일">{template.updatedAt}</Descriptions.Item>
          </Descriptions>

          {template.buttons.length > 0 && (
            <Card title="알림톡 버튼" style={{ marginTop: '16px' }} size="small">
              {template.buttons.map((button, index) => (
                <Card key={index} type="inner" title={`버튼 ${index + 1}: ${button.buttonName}`} size="small" style={{ marginBottom: index < template.buttons.length - 1 ? '8px' : 0 }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="버튼 타입"><Tag>{BUTTON_TYPE_TEXT[button.buttonType]}</Tag></Descriptions.Item>
                    {button.linkMo && <Descriptions.Item label="모바일 링크"><a href={button.linkMo} target="_blank" rel="noopener noreferrer">{button.linkMo}</a></Descriptions.Item>}
                    {button.linkPc && <Descriptions.Item label="PC 링크"><a href={button.linkPc} target="_blank" rel="noopener noreferrer">{button.linkPc}</a></Descriptions.Item>}
                    {button.linkAnd && <Descriptions.Item label="Android 스킴">{button.linkAnd}</Descriptions.Item>}
                    {button.linkIos && <Descriptions.Item label="iOS 스킴">{button.linkIos}</Descriptions.Item>}
                  </Descriptions>
                </Card>
              ))}
            </Card>
          )}
        </div>
      )}
    </Modal>
  );
}
