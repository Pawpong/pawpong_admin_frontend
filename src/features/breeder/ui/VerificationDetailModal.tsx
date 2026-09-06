import { useState } from 'react';
import { canChangeVerification } from '../model/verificationActions';
import { Modal, Descriptions, Tag, Image, Button, Alert } from 'antd';
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
  processing: boolean;
  breeder: BreederVerification | null;
  onClose: () => void;
  onRefresh: () => void;
  onMarkAsReviewing: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (record: BreederVerification) => void;
}

export function VerificationDetailModal({
  visible,
  processing,
  breeder,
  onClose,
  onRefresh,
  onMarkAsReviewing,
  onApprove,
  onReject,
}: Props) {
  const [pdfIndex, setPdfIndex] = useState<number | null>(null);
  if (!breeder) return null;
  const status = breeder.verificationInfo?.verificationStatus;
  const statusInfo = STATUS_MAP[status] || { label: status, color: 'default' };
  const documents = breeder.verificationInfo?.documents;
  const emailSubmission = breeder.verificationInfo?.isSubmittedByEmail;

  const closeDetail = () => {
    setPdfIndex(null);
    onClose();
  };
  const pdf = pdfIndex === null ? undefined : documents?.[pdfIndex];
  const pdfUrl = pdf?.fileUrl || pdf?.url;
  const safePdfUrl = pdfUrl && /^https?:\/\//i.test(pdfUrl) ? pdfUrl : undefined;

  return (
    <>
      <Modal
        title="브리더 신청 상세"
        className="verification-detail-modal"
        open={visible}
        onCancel={closeDetail}
        footer={null}
        width="100%"
        style={{ maxWidth: '960px', top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
      >
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="middle">
          <Descriptions.Item label="브리더명">{breeder.breederName}</Descriptions.Item>
          <Descriptions.Item label="이메일">{breeder.emailAddress}</Descriptions.Item>
          <Descriptions.Item label="전화번호" span={2}>
            {breeder.phoneNumber || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="요금제">
            <Tag color={breeder.verificationInfo.subscriptionPlan === 'pro' ? 'gold' : 'blue'}>
              {breeder.verificationInfo.subscriptionPlan === 'pro' ? '프로' : '베이직'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="상태" span={2}>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="계정 생성일">
            {breeder.createdAt ? new Date(breeder.createdAt).toLocaleString('ko-KR') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="신청일">
            {breeder.verificationInfo.submittedAt
              ? new Date(breeder.verificationInfo.submittedAt).toLocaleString('ko-KR')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="지역">
            {breeder.profileInfo?.location ? String(breeder.profileInfo.location) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="세부 지역">
            {breeder.profileInfo?.detailedLocation ? String(breeder.profileInfo.detailedLocation) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="전문 분야" span={2}>
            {breeder.profileInfo?.specialization &&
            Array.isArray(breeder.profileInfo.specialization) &&
            breeder.profileInfo.specialization.length > 0
              ? breeder.profileInfo.specialization.map((spec: unknown) => (
                  <Tag key={String(spec)} color="blue">
                    {spec === 'dog' ? '강아지' : '고양이'}
                  </Tag>
                ))
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="품종" span={2}>
            {breeder.profileInfo?.breeds &&
            Array.isArray(breeder.profileInfo.breeds) &&
            breeder.profileInfo.breeds.length > 0 ? (
              <>
                {breeder.profileInfo.breeds.map((b: unknown) => (
                  <Tag key={String(b)} color="green">
                    {String(b)}
                  </Tag>
                ))}
                <span style={{ marginLeft: 8, color: '#666' }}>({breeder.profileInfo.breeds.length}종)</span>
              </>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>

        <section className="verification-detail-section">
          <h3>신청 내용</h3>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="상호명">{breeder.businessName || '미등록'}</Descriptions.Item>
            {breeder.businessNumber && (
              <Descriptions.Item label="사업자등록번호">{breeder.businessNumber}</Descriptions.Item>
            )}
            <Descriptions.Item label="최종 수정일">
              {breeder.updatedAt ? new Date(breeder.updatedAt).toLocaleString('ko-KR') : '수정 일자 정보 없음'}
            </Descriptions.Item>
            <Descriptions.Item label="소개">
              {typeof breeder.profileInfo?.description === 'string' && breeder.profileInfo.description.trim() ? (
                <div className="application-text">{breeder.profileInfo.description}</div>
              ) : (
                '등록된 소개가 없습니다.'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="경력">
              {typeof breeder.profileInfo?.experienceYears === 'number'
                ? `${breeder.profileInfo.experienceYears}년`
                : '미등록'}
            </Descriptions.Item>
            <Descriptions.Item label="서류 제출 방식">
              {emailSubmission
                ? '이메일 제출로 표시됨'
                : documents?.length
                  ? '온라인 첨부'
                  : emailSubmission === false
                    ? '온라인·이메일 제출 기록 없음'
                    : '제출 방식 정보 없음'}
            </Descriptions.Item>
            <Descriptions.Item label="심사 일자">
              {breeder.verificationInfo.processedAt
                ? new Date(breeder.verificationInfo.processedAt).toLocaleString('ko-KR')
                : '심사 일자 정보 없음'}
            </Descriptions.Item>
            {breeder.verificationInfo.rejectionReason && (
              <Descriptions.Item label="반려 사유">
                <div className="application-text">{breeder.verificationInfo.rejectionReason}</div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </section>

        <section className="verification-detail-section">
          <div className="verification-documents-heading">
            <h3>제출 서류{documents ? ` (${documents.length})` : ''}</h3>
            <Button onClick={onRefresh} disabled={processing}>
              서류 새로고침
            </Button>
          </div>
          {emailSubmission && (
            <Alert
              type="info"
              showIcon
              message="이메일 제출로 표시된 신청입니다."
              description="이메일 첨부는 이 화면에서 조회되지 않을 수 있습니다. 운영 수신함에서 제출 서류를 확인해주세요."
            />
          )}
          <p className="muted">
            이미지는 눌러 확대할 수 있습니다. 파일이 열리지 않으면 서류 새로고침으로 접근 링크를 갱신해주세요.
          </p>
          {documents?.length ? (
            <div className="verification-document-grid">
              {documents.map((doc, i) => {
                const url = doc.fileUrl || doc.url;
                const safeUrl = url && /^https?:\/\//i.test(url) ? url : undefined;
                const isPdf = /\.pdf(?:[?#]|$)/i.test(`${doc.fileName || ''} ${url || ''}`);
                const isImage = /\.(png|jpe?g|gif|webp|avif|bmp)(?:[?#]|$)/i.test(doc.fileName || url || '');
                return (
                  <article className="verification-document" key={`${doc.type}-${i}`}>
                    <h4>{DOCUMENT_TYPE_LABELS[doc.type] || doc.type}</h4>
                    <p className="muted">
                      업로드 · {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString('ko-KR') : '일시 정보 없음'}
                    </p>
                    {safeUrl && isImage ? (
                      <Image width="100%" src={safeUrl} alt={DOCUMENT_TYPE_LABELS[doc.type] || doc.type} />
                    ) : (
                      <div className="verification-file-icon">
                        <FileTextOutlined />
                        <span>{safeUrl ? '첨부 파일' : '파일 접근 링크가 없습니다.'}</span>
                      </div>
                    )}
                    {!isImage && safeUrl && (
                      <Button type="primary" block icon={<EyeOutlined />} onClick={() => setPdfIndex(i)}>
                        {isPdf ? 'PDF 미리보기' : '문서 미리보기'}
                      </Button>
                    )}
                    <Button
                      block
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={!safeUrl}
                      icon={<EyeOutlined />}
                    >
                      첨부 원본 열기
                    </Button>
                  </article>
                );
              })}
            </div>
          ) : (
            <Alert
              showIcon
              type="info"
              message={
                documents === undefined
                  ? 'API에서 서류 정보를 제공하지 않았습니다.'
                  : emailSubmission
                    ? '온라인에 등록된 첨부 파일은 없습니다.'
                    : '등록된 온라인 첨부 파일이 없습니다.'
              }
              description={
                documents === undefined
                  ? '서류 새로고침 후에도 동일하면 상세 API 확인이 필요합니다.'
                  : emailSubmission
                    ? '이메일 수신함에서 원본을 확인해주세요.'
                    : '현재 상세 API 응답에 첨부가 없습니다. 제출 여부와 제출 경로를 확인해주세요.'
              }
            />
          )}
        </section>

        {/* 액션 버튼 */}
        <div className="verification-detail-actions">
          <Button onClick={closeDetail} block className="sm:w-auto">
            닫기
          </Button>
          {canChangeVerification(breeder.verificationInfo?.verificationStatus, 'reviewing') && (
            <Button
              disabled={processing}
              block
              className="sm:w-auto"
              onClick={() => onMarkAsReviewing(breeder.breederId)}
            >
              검토 시작
            </Button>
          )}
          {canChangeVerification(breeder.verificationInfo?.verificationStatus, 'approved') && (
            <Button
              disabled={processing}
              type="primary"
              block
              className="sm:w-auto"
              onClick={() => onApprove(breeder.breederId)}
            >
              승인
            </Button>
          )}
          {canChangeVerification(breeder.verificationInfo?.verificationStatus, 'rejected') && (
            <Button
              disabled={processing}
              danger
              block
              className="sm:w-auto"
              onClick={() => {
                closeDetail();
                onReject(breeder);
              }}
            >
              반려
            </Button>
          )}
        </div>
      </Modal>
      <Modal
        title={pdf ? `${DOCUMENT_TYPE_LABELS[pdf.type] || pdf.type} · 문서` : '문서 미리보기'}
        open={visible && !!safePdfUrl}
        onCancel={() => setPdfIndex(null)}
        width="min(1200px, calc(100vw - 32px))"
        className="verification-pdf-modal"
        style={{ top: 16 }}
        footer={
          <div className="verification-pdf-actions">
            <Button onClick={onRefresh}>서류 새로고침</Button>
            <Button href={safePdfUrl} target="_blank" rel="noopener noreferrer">
              원본 새 탭 열기
            </Button>
            <Button onClick={() => setPdfIndex(null)}>닫기</Button>
          </div>
        }
      >
        <p className="muted">
          화면에 문서가 표시되지 않으면 원본 새 탭 열기를 이용해주세요. 만료된 링크는 서류 새로고침으로 갱신할 수
          있습니다.
        </p>
        {safePdfUrl && (
          <iframe
            key={safePdfUrl}
            className="verification-pdf-viewer"
            title="제출 서류 PDF 미리보기"
            src={`${safePdfUrl.split('#')[0]}#view=FitH`}
            referrerPolicy="no-referrer"
          />
        )}
      </Modal>
    </>
  );
}
