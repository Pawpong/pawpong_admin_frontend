import apiClient from '../../../shared/api/axios';
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
