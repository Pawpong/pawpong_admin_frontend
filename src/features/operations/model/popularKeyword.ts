import { isAxiosError } from 'axios';
import type { CreatePopularKeywordRequest } from '../api/operations.types';

type PopularKeywordFormValues = {
  keyword: string;
  rank?: number | null;
  isActive?: boolean | null;
};

/** 입력란을 비우면 antd InputNumber는 null을 준다. 서버는 rank를 필수 숫자로 저장하므로 0(맨 위)으로 맞춘다. */
export function popularKeywordPayload(values: PopularKeywordFormValues): Required<CreatePopularKeywordRequest> {
  return {
    keyword: values.keyword.trim(),
    rank: typeof values.rank === 'number' && Number.isInteger(values.rank) && values.rank >= 0 ? values.rank : 0,
    isActive: values.isActive ?? true,
  };
}

/** 중복 검색어(409)는 서버가 알려준 사유를 그대로 보여주고, 그 밖의 실패는 기본 문구를 쓴다. */
export function popularKeywordErrorMessage(cause: unknown, fallback: string) {
  if (isAxiosError<{ message?: unknown }>(cause) && cause.response?.status === 409) {
    const message = cause.response.data?.message;
    return typeof message === 'string' && message.trim() ? message : '이미 등록된 검색어입니다.';
  }
  return fallback;
}
