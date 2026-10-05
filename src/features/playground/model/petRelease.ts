export interface PlaygroundPetRelease {
  qualityApproved: boolean;
  published: boolean;
  revision: number;
  developmentPreviewEnabled: boolean;
  effectiveEnabled: boolean;
  environment: string;
  updatedAt: string | null;
}

export interface PlaygroundPetReleaseSave {
  qualityApproved: boolean;
  published: boolean;
  expectedRevision: number;
}

export type PetReleaseDraft = Pick<PlaygroundPetRelease, 'qualityApproved' | 'published'>;
export type PetReleaseStatus = 'public' | 'private' | 'unknown';

// 개발 환경 확인용 주소다. 이 링크가 열리는 것은 운영 공개와 무관하다.
export const PET_PREVIEW_URL = 'https://dev.pawpong.kr/playground/pet';

/** 서버 상태를 확인하지 못했을 때의 화면 값. 확인되지 않은 값을 켜진 상태로 보여 주지 않는다. */
export const LOCKED_PET_RELEASE_DRAFT: PetReleaseDraft = Object.freeze({ qualityApproved: false, published: false });

export const PET_RELEASE_QUALITY_REQUIRED = '품질 승인 없이는 공개할 수 없어요. 품질 승인을 먼저 확인해 주세요.';
const INVALID_RESPONSE = '반려동물 키우기 공개 설정을 확인할 수 없습니다.';
const INVALID_SAVE = '공개 설정을 확인할 수 없어 저장하지 않았어요. 최신 설정을 다시 불러와 주세요.';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isRevision = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

/** 누락·문자열 boolean 등 잘못된 응답은 기본값으로 메우지 않고 실패 처리한다. */
export function parsePlaygroundPetRelease(value: unknown): PlaygroundPetRelease {
  if (
    !isRecord(value) ||
    typeof value.qualityApproved !== 'boolean' ||
    typeof value.published !== 'boolean' ||
    typeof value.developmentPreviewEnabled !== 'boolean' ||
    typeof value.effectiveEnabled !== 'boolean' ||
    !isRevision(value.revision) ||
    typeof value.environment !== 'string' ||
    value.environment.trim().length === 0 ||
    (value.updatedAt !== null && typeof value.updatedAt !== 'string')
  ) {
    throw new Error(INVALID_RESPONSE);
  }
  return {
    qualityApproved: value.qualityApproved,
    published: value.published,
    revision: value.revision,
    developmentPreviewEnabled: value.developmentPreviewEnabled,
    effectiveEnabled: value.effectiveEnabled,
    environment: value.environment,
    updatedAt: value.updatedAt,
  };
}

/** 품질 승인이 없는 공개 값은 편집 초안에서도 꺼진 상태로 다룬다. */
export function draftFromRelease(release: PlaygroundPetRelease): PetReleaseDraft {
  const qualityApproved = release.qualityApproved === true;
  return { qualityApproved, published: qualityApproved && release.published === true };
}

/** 품질 승인을 해제하면 공개도 함께 꺼진다. 승인만으로 공개가 켜지지는 않는다. */
export function withQualityApproval(draft: PetReleaseDraft, approved: boolean): PetReleaseDraft {
  const qualityApproved = approved === true;
  return { qualityApproved, published: qualityApproved && draft.published === true };
}

export function withPublished(draft: PetReleaseDraft, published: boolean): PetReleaseDraft {
  const qualityApproved = draft.qualityApproved === true;
  return { qualityApproved, published: qualityApproved && published === true };
}

export function isPetReleaseDirty(release: PlaygroundPetRelease, draft: PetReleaseDraft): boolean {
  return release.qualityApproved !== draft.qualityApproved || release.published !== draft.published;
}

/** 저장 결과가 운영 공개를 새로 여는 변경인지. 이 경우 화면에서 한 번 더 확인받는다. */
export function opensPublication(release: PlaygroundPetRelease, draft: PetReleaseDraft): boolean {
  return draft.published === true && !(release.qualityApproved === true && release.published === true);
}

/** 품질 승인·공개 설정·서버의 실제 허용이 모두 확인될 때만 공개 중으로 본다. */
export function petReleaseStatus(release: PlaygroundPetRelease | null | undefined): PetReleaseStatus {
  if (!release) return 'unknown';
  return release.qualityApproved === true && release.published === true && release.effectiveEnabled === true
    ? 'public'
    : 'private';
}

/**
 * 서버는 운영 환경에서만 품질 승인과 공개 설정으로 잠금을 푼다.
 * 개발 환경은 미리보기 설정으로만 열리고, 환경을 알 수 없으면 저장해도 열리지 않는다.
 */
export function publicationTakesEffect(environment: string): boolean {
  return environment === 'production';
}

export function buildPetReleaseSave(draft: PetReleaseDraft, expectedRevision: number): PlaygroundPetReleaseSave {
  if (
    !isRecord(draft) ||
    typeof draft.qualityApproved !== 'boolean' ||
    typeof draft.published !== 'boolean' ||
    !isRevision(expectedRevision) ||
    // 서버가 저장 시 revision을 1 올리므로 마지막 안전 정수는 받지 않는다.
    expectedRevision >= Number.MAX_SAFE_INTEGER
  ) {
    throw new Error(INVALID_SAVE);
  }
  if (draft.published && !draft.qualityApproved) throw new Error(PET_RELEASE_QUALITY_REQUIRED);
  return { qualityApproved: draft.qualityApproved, published: draft.published, expectedRevision };
}
