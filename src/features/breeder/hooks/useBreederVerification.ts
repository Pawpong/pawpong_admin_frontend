import { useState, useCallback, useEffect } from 'react';
import { Form, message } from 'antd';

import { breederApi } from '../api/breederApi';
import type { BreederVerification } from '../../../shared/types/api.types';

/** 반려 사유 목록 - 공통 */
export const COMMON_REJECTION_REASONS = [
  '제출한 서류가 식별이 어렵거나 해상도가 낮음',
  '유효하지 않거나 만료된 서류 제출',
  '필수 제출 서류 일부 누락',
  '제출한 서류의 상호명이 브리더 정보에 입력한 상호명과 일치하지 않음',
  '제출한 서류의 성명과 신분증 상 성명이 일치하지 않음',
  'SNS, 커뮤니티 등에서 허위 홍보나 불법 거래 사례가 확인됨',
  '타인의 사진 또는 자료 도용이 확인됨',
  '브리더의 윤리 기준이 포퐁의 가치관과 현저히 부합하지 않음',
  '동물 복지 수준이 명백히 낮다고 판단됨 (비위생적 환경, 과번식 등)',
  '비윤리적 번식 정황 확인',
];

/** 반려 사유 목록 - 엘리트 레벨 한정 */
export const ELITE_REJECTION_REASONS = [
  '브리딩 품종이 3종 이상으로 확인되었거나, 프로필에서 3종 이상 선택함',
  '도그쇼/캣쇼 참가 이력 증빙이 불충분하거나 허위로 확인됨',
  '혈통서, 협회 등록증 등 전문성 증빙 서류가 기준에 미달',
];

/** 서류 타입 한국어 매핑 */
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  id_card: '신분증 사본',
  animal_production_license: '동물생산업 등록증',
  adoption_contract_sample: '표준 입양계약서 샘플',
  recent_pedigree_document: '최근 발급된 혈통서 사본',
  breeder_certification: '고양이 브리더 인증 서류',
};

/**
 * 브리더 신청 관리(인증 심사) 비즈니스 로직 훅
 * 상태 필터, 서버 페이지네이션, 상세/반려/독촉 모달 지원
 */
export function useBreederVerification() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<BreederVerification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  /* 선택된 브리더 (독촉 알림용) */
  const [selectedBreeders, setSelectedBreeders] = useState<string[]>([]);

  /* 상세 보기 모달 */
  const [selectedBreeder, setSelectedBreeder] = useState<BreederVerification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  /* 반려 모달 */
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectForm] = Form.useForm();

  /* 독촉 알림 모달 */
  const [isDocumentRemindModalOpen, setIsDocumentRemindModalOpen] = useState(false);

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await breederApi.getBreeders(statusFilter, currentPage, pageSize);
      setDataSource(response.items);
      setTotalCount(response.pagination.totalItems);
    } catch (error: unknown) {
      console.error('Failed to fetch verifications:', error);
      message.error('브리더 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage, pageSize]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleViewDetails = useCallback(async (record: BreederVerification) => {
    try {
      setLoading(true);
      const detailData = await breederApi.getBreederDetail(record.breederId);
      setSelectedBreeder({
        ...record,
        verificationInfo: {
          ...record.verificationInfo,
          ...detailData.verificationInfo,
        },
        profileInfo: detailData.profileInfo || record.profileInfo,
        createdAt: detailData.createdAt,
        updatedAt: detailData.updatedAt,
      });
      setIsDetailModalOpen(true);
    } catch (error: unknown) {
      console.error('Failed to fetch breeder details:', error);
      message.error('브리더 상세 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkAsReviewing = useCallback(async (breederId: string) => {
    try {
      await breederApi.updateVerification(breederId, {
        verificationStatus: 'reviewing',
      });
      message.success('리뷰 완료로 표시되었습니다.');
      setIsDetailModalOpen(false);
      fetchVerifications();
    } catch (error: unknown) {
      console.error('Mark as reviewing failed:', error);
      message.error('상태 변경에 실패했습니다.');
    }
  }, [fetchVerifications]);

  const handleApprove = useCallback(async (breederId: string, level: 'new' | 'elite') => {
    void level; // level is used for UI context only
    try {
      await breederApi.updateVerification(breederId, {
        verificationStatus: 'approved',
      });
      message.success('브리더 인증이 승인되었습니다.');
      setIsDetailModalOpen(false);
      fetchVerifications();
    } catch (error: unknown) {
      console.error('Approve failed:', error);
      message.error('승인에 실패했습니다.');
    }
  }, [fetchVerifications]);

  const openRejectModal = useCallback((record: BreederVerification) => {
    setSelectedBreeder(record);
    setIsRejectModalOpen(true);
    rejectForm.resetFields();
  }, [rejectForm]);

  const handleRejectSubmit = useCallback(async () => {
    try {
      const values = await rejectForm.validateFields();
      const selectedReasons: string[] = values.rejectionReasons || [];
      const customReason: string = values.customReason || '';

      const rejectionReason = [...selectedReasons, customReason && `기타: ${customReason}`].filter(Boolean).join('\n');

      if (!selectedBreeder) return;

      await breederApi.updateVerification(selectedBreeder.breederId, {
        verificationStatus: 'rejected',
        rejectionReason,
      });

      message.success('브리더 인증이 반려되었습니다. 반려 사유가 이메일로 발송됩니다.');
      setIsRejectModalOpen(false);
      fetchVerifications();
    } catch (error: unknown) {
      console.error('Rejection failed:', error);
      message.error('반려 처리에 실패했습니다.');
    }
  }, [rejectForm, selectedBreeder, fetchVerifications]);

  const handleDocumentRemindClick = useCallback(() => {
    if (selectedBreeders.length === 0) {
      message.warning('입점 심사 독촉 알림을 보낼 브리더를 선택해주세요.');
      return;
    }
    setIsDocumentRemindModalOpen(true);
  }, [selectedBreeders.length]);

  const handleDocumentRemindSubmit = useCallback(async () => {
    try {
      await breederApi.sendReminder(selectedBreeders, 'document_reminder');
      message.success(`${selectedBreeders.length}명의 브리더에게 입점 심사 독촉 알림이 발송되었습니다.`);
      setIsDocumentRemindModalOpen(false);
      setSelectedBreeders([]);
    } catch (error: unknown) {
      console.error('Document remind failed:', error);
      message.error('입점 심사 독촉 알림 발송에 실패했습니다.');
    }
  }, [selectedBreeders]);

  const onStatusFilterChange = useCallback((key: string) => {
    setStatusFilter(key === 'all' ? undefined : key);
    setCurrentPage(1);
  }, []);

  const onPageChange = useCallback((page: number, newPageSize: number) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  }, []);

  return {
    dataSource,
    loading,
    totalCount,
    currentPage,
    pageSize,
    statusFilter,
    selectedBreeders,
    setSelectedBreeders,
    onStatusFilterChange,
    onPageChange,
    handleViewDetails,
    handleMarkAsReviewing,
    handleApprove,
    detail: {
      selectedBreeder,
      isDetailModalOpen,
      closeDetail: () => setIsDetailModalOpen(false),
    },
    reject: {
      selectedBreeder,
      isRejectModalOpen,
      rejectForm,
      openRejectModal,
      handleRejectSubmit,
      closeReject: () => setIsRejectModalOpen(false),
    },
    remind: {
      isDocumentRemindModalOpen,
      selectedCount: selectedBreeders.length,
      handleDocumentRemindClick,
      handleDocumentRemindSubmit,
      closeRemind: () => setIsDocumentRemindModalOpen(false),
    },
  };
}
