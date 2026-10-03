import apiClient from '../../../shared/api/axios';
import { assertProductSaleAllowed } from '../model/release';

export type Platform = 'ios' | 'android';
export type ProductType = 'consumable' | 'non_consumable' | 'subscription';
export interface Benefit {
  type: string;
  creditKey?: string;
  quantity: number;
}
export interface Product {
  code: string;
  name: string;
  type: ProductType;
  storeProductIds: { ios?: string; android?: string };
  benefits: Benefit[];
  active: boolean;
  saleEnabled: boolean;
  storeRegistered: { ios: boolean; android: boolean };
  archived: boolean;
}
export interface FeaturePolicy {
  featureKey: string;
  creditKey: string;
  creditCost: number;
  dailyFreeLimit: number;
  enabled: boolean;
}
export interface Policy {
  timezone: 'Asia/Seoul';
  consumptionOrder: string[];
  features: FeaturePolicy[];
  implementedFeatures: string[];
}
export type PurchaseStatus = 'pending' | 'verified' | 'refunded' | 'expired' | 'canceled' | 'on_hold';
export interface Purchase {
  id: string;
  userId: string;
  productCode: string;
  productId: string;
  platform: Platform;
  environment: 'Sandbox' | 'Production';
  type: ProductType;
  transactionId: string;
  originalTransactionId: string;
  status: PurchaseStatus;
  benefits: Benefit[];
  quantity: number;
  refundedQuantity: number;
  amount: string | null;
  currency: string | null;
  purchasedAt: string;
  expiresAt: string | null;
  autoRenewing: boolean | null;
  acknowledged: boolean;
  entitlementActive: boolean;
  adminRevoked: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface BillingEvent {
  id: string;
  type: string;
  source: string;
  userId: string | null;
  actorId?: string | null;
  purchaseId?: string | null;
  platform?: Platform | null;
  productCode?: string | null;
  transactionId?: string | null;
  environment?: string | null;
  reason?: string | null;
  creditDelta?: number;
  creditKey?: string | null;
  featureKey?: string | null;
  occurredAt: string;
  recordedAt: string;
}
export interface BillingQuery {
  userId?: string;
  productCode?: string;
  platform?: Platform;
  status?: PurchaseStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
export interface BillingPage<T> {
  items: T[];
  pagination: { currentPage: number; pageSize: number; totalItems: number; totalPages: number };
}
export type ProductInput = Omit<Product, 'archived'> & { reason: string };
type Envelope<T> = { success: boolean; data: T };

export const billingApi = {
  products: async () => (await apiClient.get<Envelope<Product[]>>('/iap-admin/products')).data.data,
  createProduct: async (body: ProductInput) => {
    assertProductSaleAllowed(body);
    return (await apiClient.post<Envelope<Product>>('/iap-admin/products', body)).data.data;
  },
  updateProduct: async (code: string, body: Partial<Omit<ProductInput, 'code'>> & { reason: string }) => {
    assertProductSaleAllowed(body);
    return (await apiClient.patch<Envelope<Product>>(`/iap-admin/products/${encodeURIComponent(code)}`, body)).data
      .data;
  },
  archiveProduct: async (code: string, reason: string) =>
    (await apiClient.delete<Envelope<Product>>(`/iap-admin/products/${encodeURIComponent(code)}`, { data: { reason } }))
      .data.data,
  policy: async () => (await apiClient.get<Envelope<Policy>>('/iap-admin/policy')).data.data,
  savePolicy: async (featureKey: string, body: Omit<FeaturePolicy, 'featureKey'> & { reason: string }) =>
    (await apiClient.put<Envelope<FeaturePolicy>>(`/iap-admin/policy/features/${encodeURIComponent(featureKey)}`, body))
      .data.data,
  purchases: async (params: BillingQuery) =>
    (await apiClient.get<Envelope<BillingPage<Purchase>>>('/iap-admin/purchases', { params })).data.data,
  userPurchases: async (userId: string, params: Omit<BillingQuery, 'userId'>) =>
    (
      await apiClient.get<Envelope<BillingPage<Purchase>>>(`/iap-admin/users/${encodeURIComponent(userId)}/purchases`, {
        params,
      })
    ).data.data,
  detail: async (id: string) =>
    (
      await apiClient.get<Envelope<{ purchase: Purchase; events: BillingEvent[] }>>(
        `/iap-admin/purchases/${encodeURIComponent(id)}`,
      )
    ).data.data,
  events: async (params: Omit<BillingQuery, 'status'>) =>
    (await apiClient.get<Envelope<BillingPage<BillingEvent>>>('/iap-admin/events', { params })).data.data,
  adjust: async (id: string, body: { action: 'revoke' | 'regrant'; reason: string }) =>
    (await apiClient.post<Envelope<Purchase>>(`/iap-admin/purchases/${encodeURIComponent(id)}/entitlement`, body)).data
      .data,
};
