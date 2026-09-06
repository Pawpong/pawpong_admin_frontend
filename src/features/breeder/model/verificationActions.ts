/** 완료된 심사는 조회만 제공한다. 새 신청은 서버에서 상태가 바뀐 후 심사한다. */
export function canChangeVerification(current: string | undefined, next: string) {
  return (
    (current === 'pending' && next === 'reviewing') ||
    (current === 'reviewing' && (next === 'approved' || next === 'rejected'))
  );
}
