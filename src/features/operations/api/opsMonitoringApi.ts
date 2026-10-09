import apiClient from '../../../shared/api/axios';
import type { ApiResponse } from '../../../shared/types/api.types';
import type {
  OpsLogLevel,
  OpsLogsResponse,
  OpsSentryResponse,
  OpsServersResponse,
  OpsTrafficResponse,
} from './opsMonitoring.types';

/** 그라파나·센트리·서버 자원을 관리자 화면 하나로 모은 조회 API */
export const opsMonitoringApi = {
  async getServers() {
    return (await apiClient.get<ApiResponse<OpsServersResponse>>('/platform-admin/ops/servers')).data.data;
  },
  async getTraffic(periodHours: number) {
    return (
      await apiClient.get<ApiResponse<OpsTrafficResponse>>('/platform-admin/ops/traffic', { params: { periodHours } })
    ).data.data;
  },
  async getLogs(params: { periodHours: number; level: OpsLogLevel; search?: string }) {
    const search = params.search?.trim();
    return (
      await apiClient.get<ApiResponse<OpsLogsResponse>>('/platform-admin/ops/logs', {
        params: { ...params, search: search || undefined },
      })
    ).data.data;
  },
  async getSentry() {
    return (await apiClient.get<ApiResponse<OpsSentryResponse>>('/platform-admin/ops/sentry')).data.data;
  },
};
