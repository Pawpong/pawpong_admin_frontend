import apiClient from '../../../shared/api/axios';

export type TermsCode = 'service' | 'privacy' | 'marketing' | 'age_14plus' | 'counsel_privacy';
export interface Terms {
  termsId: string;
  code: TermsCode;
  version: string;
  title: string;
  body: string;
  isRequired: boolean;
  isActive: boolean;
  activatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
export type TermsDraft = Pick<Terms, 'code' | 'version' | 'title' | 'body' | 'isRequired'>;
type Envelope<T> = { success: boolean; data: T };

export const termsApi = {
  list: async () => (await apiClient.get<Envelope<Terms[]>>('/terms-admin')).data.data,
  detail: async (id: string) =>
    (await apiClient.get<Envelope<Terms>>(`/terms-admin/${encodeURIComponent(id)}`)).data.data,
  create: async (draft: TermsDraft) =>
    (await apiClient.post<Envelope<Terms>>('/terms-admin', { ...draft, activate: false })).data.data,
  update: async (id: string, body: Pick<TermsDraft, 'title' | 'body' | 'isRequired'>) =>
    (await apiClient.patch<Envelope<Terms>>(`/terms-admin/${encodeURIComponent(id)}`, body)).data.data,
  activate: async (id: string) =>
    (await apiClient.patch<Envelope<Terms>>(`/terms-admin/${encodeURIComponent(id)}/activate`)).data.data,
  remove: async (id: string) => {
    await apiClient.delete(`/terms-admin/${encodeURIComponent(id)}`);
  },
};
