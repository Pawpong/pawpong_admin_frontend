import type { ProductInput } from '../api/billingApi';

export const newProduct: ProductInput = {
  code: '',
  name: '',
  type: 'consumable',
  storeProductIds: {},
  benefits: [{ type: 'credits', creditKey: 'playground', quantity: 1 }],
  active: false,
  saleEnabled: false,
  storeRegistered: { ios: false, android: false },
  reason: '',
};

/** 빈 스토어 ID나 공백 사유를 보내지 않는다. 금액 필드는 카탈로그에 존재하지 않는다. */
export function productInput(value: ProductInput): ProductInput {
  const reason = value.reason.trim();
  if (!reason || reason.length > 500) throw new Error('변경 사유를 1~500자로 입력해 주세요.');
  const storeProductIds = Object.fromEntries(
    Object.entries(value.storeProductIds).flatMap(([key, id]) => (id?.trim() ? [[key, id.trim()]] : [])),
  );
  if (!Object.keys(storeProductIds).length) throw new Error('스토어 상품 ID를 한 개 이상 입력해 주세요.');
  const benefits = value.benefits.map((b) => ({
    type: b.type.trim(),
    ...(b.creditKey?.trim() ? { creditKey: b.creditKey.trim() } : {}),
    quantity: b.quantity,
  }));
  if (
    !benefits.length ||
    benefits.some(
      (b) => !b.type || !Number.isSafeInteger(b.quantity) || b.quantity < 1 || (b.type === 'credits' && !b.creditKey),
    )
  )
    throw new Error('혜택 유형, 이용권 코드와 양의 정수 수량을 확인해 주세요.');
  if (value.type === 'non_consumable' && benefits.some((b) => b.type === 'credits'))
    throw new Error('차감하는 이용권은 충전형 또는 구독형 상품으로 등록해 주세요.');
  if (
    value.saleEnabled &&
    (!value.active || Object.keys(storeProductIds).some((p) => !value.storeRegistered[p as 'ios' | 'android']))
  )
    throw new Error('판매하려면 상품을 활성화하고 모든 연결 스토어의 등록을 확인해 주세요.');
  return {
    code: value.code.trim(),
    name: value.name.trim(),
    type: value.type,
    storeProductIds,
    benefits,
    active: value.active,
    saleEnabled: value.saleEnabled,
    storeRegistered: value.storeRegistered,
    reason,
  };
}

export function billingError(error: unknown): string {
  const code = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
  const messages: Record<string, string> = {
    IAP_SOLD_PRODUCT_DEFINITION_IMMUTABLE:
      '이미 판매된 상품의 종류·스토어 ID·혜택은 바꿀 수 없습니다. 새 상품 코드로 등록해 주세요.',
    IAP_STORE_PRODUCT_ALREADY_MAPPED: '다른 상품에서 사용하는 스토어 ID입니다.',
    IAP_PRODUCT_ALREADY_EXISTS: '이미 등록된 상품 코드입니다.',
    IAP_STORE_REGISTRATION_REQUIRED: '연결된 스토어 상품의 등록을 먼저 확인해 주세요.',
    IAP_ACCOUNT_MISMATCH: '구매 계정이 일치하지 않습니다.',
    IAP_BENEFIT_NOT_IMPLEMENTED: '아직 지급 기능이 없는 혜택입니다. 판매 허용을 끄고 저장해 주세요.',
  };
  return code
    ? (messages[code] ?? `변경을 저장하지 못했습니다 (${code}).`)
    : error instanceof Error
      ? error.message
      : '요청을 처리하지 못했습니다.';
}
