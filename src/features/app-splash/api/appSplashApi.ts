import apiClient from '../../../shared/api/axios';

export type SplashPlatform = 'ios' | 'android';
export interface SplashSettings {
  isEnabled: boolean;
  imageFileName: string;
  backgroundColor: string;
  imageWidth: number;
  durationMs: number;
}
export interface AppSplash extends SplashSettings {
  platform: SplashPlatform;
  imageUrl: string;
  updatedAt: string | null;
}
interface SplashResponse<T> { success: boolean; data: T }

export const appSplashApi = {
  async list(): Promise<AppSplash[]> {
    const response = await apiClient.get<SplashResponse<AppSplash[]>>('/app-splash-admin');
    return response.data.data;
  },
  async save(platform: SplashPlatform, settings: SplashSettings): Promise<AppSplash> {
    const response = await apiClient.put<SplashResponse<AppSplash>>(`/app-splash-admin/${platform}`, settings);
    return response.data.data;
  },
};
