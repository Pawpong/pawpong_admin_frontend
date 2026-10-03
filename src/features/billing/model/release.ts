// 인앱결제 업데이트 심사 승인 및 별도 출시 승인 전에는 판매를 열지 않는다.
// 상품·정책 관리나 코드 배포만으로 이 값을 변경하면 안 된다.
export const BILLING_SALES_ENABLED = false;

export const BILLING_SALES_HOLD_MESSAGE =
  '인앱결제 출시를 준비 중입니다. 심사 승인과 출시 확인 전에는 판매를 허용할 수 없습니다.';

/** PATCH에서도 명시적으로 판매 중지를 보내 기존 판매 상태가 유지되지 않게 한다. */
export function assertProductSaleAllowed(input: { saleEnabled?: boolean }): void {
  if (!BILLING_SALES_ENABLED && input.saleEnabled !== false) {
    throw new Error(BILLING_SALES_HOLD_MESSAGE);
  }
}
