/** 1:1 문의 대화로 접수된 건의 요약. 사용자가 확인하고 보낸 초안만 보여주고 대화 원문은 다루지 않는다. */
export type SupportConversation = {
  category?: string;
  referenceCode?: string;
  draft?: { title?: string; summary?: string; conditions?: string[]; additionalInfo?: string[] };
};

export const SUPPORT_CATEGORY_LABELS: Record<string, string> = {
  usage: '이용 방법',
  error: '오류',
  account: '계정',
  feedback: '의견',
  level_exp: '레벨/EXP',
};

export interface SupportConversationView {
  categoryLabel: string;
  referenceCode: string | null;
  title: string | null;
  summary: string | null;
  conditions: string[];
  additionalInfo: string[];
}

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);
const list = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim() !== '') : [];

export function supportConversationView(
  conversation: SupportConversation | null | undefined,
): SupportConversationView | null {
  if (!conversation || typeof conversation !== 'object') return null;
  const category = text(conversation.category);
  return {
    categoryLabel: (category && SUPPORT_CATEGORY_LABELS[category]) || '기타',
    referenceCode: text(conversation.referenceCode),
    title: text(conversation.draft?.title),
    summary: text(conversation.draft?.summary),
    conditions: list(conversation.draft?.conditions),
    additionalInfo: list(conversation.draft?.additionalInfo),
  };
}
