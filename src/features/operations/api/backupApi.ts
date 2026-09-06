import apiClient from '../../../shared/api/axios';
import type { ApiResponse } from '../../../shared/types/api.types';

export interface BackupJob {
  jobId: string;
  status: string;
  database: 'prod';
  trigger: 'manual' | 'scheduled';
  createdAt: number;
  finishedAt?: number;
  errorCode?: string;
  result?: { bytes: number; sha256: string; restoreVerified: boolean };
}
export const backupApi = {
  async list() {
    return (await apiClient.get<ApiResponse<{ enabled: boolean; jobs: BackupJob[] }>>('/platform-admin/backups')).data.data;
  },
  async request() {
    return (await apiClient.post<ApiResponse<{ jobId: string }>>('/platform-admin/backups')).data.data;
  },
};
