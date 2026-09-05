import { Tag } from 'antd';

/** 신고 유형 한글 매핑 */
const REPORT_TYPE_MAP: Record<string, string> = {
  no_contract: '계약 불이행',
  false_info: '허위 정보',
  inappropriate_content: '부적절한 콘텐츠',
  fraudulent_listing: '사기성 매물',
  other: '기타',
};

/** 신고 상태 태그 설정 */
const STATUS_CONFIG: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '대기 중' },
  resolved: { color: 'red', text: '승인됨' },
  dismissed: { color: 'green', text: '반려됨' },
};

export function getReportTypeText(type: string): string {
  return REPORT_TYPE_MAP[type] || type;
}

export function getStatusTag(status: string) {
  const info = STATUS_CONFIG[status] || { color: 'default', text: status };
  return <Tag color={info.color}>{info.text}</Tag>;
}

