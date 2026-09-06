import type { BreederAccountType } from '../api/breederApi';

export const accountTypeFilterEnabled = import.meta.env.VITE_ACCOUNT_TYPE_FILTER_ENABLED === 'true';
const statuses = ['pending', 'reviewing', 'approved', 'rejected'];
const pageSizes = [10, 20, 50, 100];

/** URL의 잘못된 값은 서버 요청 전에 기본값으로 정규화한다. */
export function readBreederFilters(params: URLSearchParams, allowAccountType = accountTypeFilterEnabled) {
  const page = Number(params.get('page'));
  const size = Number(params.get('pageSize'));
  const account = params.get('accountType');
  const status = params.get('status');
  return {
    currentPage: Number.isSafeInteger(page) && page > 0 ? page : 1,
    pageSize: pageSizes.includes(size) ? size : 10,
    accountType: (allowAccountType && (account === 'normal' || account === 'test')
      ? account
      : 'all') as BreederAccountType,
    statusFilter: status && statuses.includes(status) ? status : undefined,
    searchKeyword: (params.get('q') || '').trim().slice(0, 100),
    cityName: (params.get('city') || '').trim().slice(0, 50),
  };
}

export function updateBreederFilters(current: URLSearchParams, changes: Record<string, string | number | undefined>) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === '' || value === 'all' || (key === 'page' && value === 1)) next.delete(key);
    else next.set(key, String(value));
  }
  return next;
}
