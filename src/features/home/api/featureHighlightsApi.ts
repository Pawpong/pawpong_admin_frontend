import apiClient from '../../../shared/api/axios';
import {
  parseFeatureHighlightConfig,
  validateHighlightSave,
  type FeatureHighlightConfig,
} from '../model/featureHighlights';
export type { FeatureHighlight, FeatureHighlightConfig } from '../model/featureHighlights';

export const featureHighlightsApi = {
  async get(signal?: AbortSignal): Promise<FeatureHighlightConfig> {
    const response = await apiClient.get<{ data: unknown }>('/home-admin/feature-highlights', { signal });
    return parseFeatureHighlightConfig(response.data.data);
  },
  async save(config: FeatureHighlightConfig): Promise<FeatureHighlightConfig> {
    const payload = validateHighlightSave(config);
    const response = await apiClient.put<{ data: unknown }>('/home-admin/feature-highlights', payload);
    return parseFeatureHighlightConfig(response.data.data);
  },
};
