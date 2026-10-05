import apiClient from '../../../shared/api/axios';
import {
  buildPetReleaseSave,
  parsePlaygroundPetRelease,
  type PetReleaseDraft,
  type PlaygroundPetRelease,
} from '../model/petRelease';
export type { PetReleaseDraft, PlaygroundPetRelease } from '../model/petRelease';

export const petReleaseApi = {
  async get(signal?: AbortSignal): Promise<PlaygroundPetRelease> {
    const response = await apiClient.get<{ data: PlaygroundPetRelease }>('/home-admin/playground-pet-release', {
      signal,
    });
    return parsePlaygroundPetRelease(response.data.data);
  },
  /** 화면이 마지막으로 확인한 revision과 함께 저장한다. 서버가 먼저 바뀌었으면 409로 거절된다. */
  async save(draft: PetReleaseDraft, expectedRevision: number): Promise<PlaygroundPetRelease> {
    const payload = buildPetReleaseSave(draft, expectedRevision);
    const response = await apiClient.put<{ data: PlaygroundPetRelease }>('/home-admin/playground-pet-release', payload);
    return parsePlaygroundPetRelease(response.data.data);
  },
};
