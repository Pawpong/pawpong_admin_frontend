import apiClient from '../../../shared/api/axios';
import type { SupportConversation } from '../model/supportConversation';
export type Status = 'open' | 'in_progress' | 'resolved';
export type Ticket = {
  eventId: string;
  kind: string;
  message?: string;
  environment: string;
  status: Status;
  assigneeId: string;
  revision: number;
  deliveryStatus: string;
  createdAt: string;
  history: { actorId: string; status: Status; assigneeId: string; note: string; at: string }[];
  // 1:1 문의 대화로 접수된 건만 있다. 응답 스키마가 열려 있어 없는 경우를 함께 다룬다.
  conversation?: SupportConversation;
};

export const supportApi = {
  list: async (page: number, status?: Status, receiptId?: string) => {
    const { data } = await apiClient.get<{ data: { items: Ticket[]; total: number } }>('/home-admin/support', {
      params: { page, status, receiptId },
    });
    return data.data;
  },
  update: (
    eventId: string,
    payload: { revision: number; status: Status; assignment?: 'me' | 'unassigned'; note?: string },
  ) => apiClient.patch(`/home-admin/support/${eventId}`, payload),
};
