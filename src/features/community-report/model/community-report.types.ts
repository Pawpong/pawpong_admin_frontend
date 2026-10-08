export interface CommunityReportReviewPhoto {
  index: number;
  state: 'protected' | 'unavailable';
  readPath?: string;
}

/** 작성자가 공개한 지도 장소. 위치 공개 신고를 판단할 때만 쓴다. */
export interface CommunityReportPlace {
  order: number;
  name: string;
  latitude: number;
  longitude: number;
  photoIndex?: number;
}

export interface CommunityReportReview {
  reportId: string;
  post: {
    postId: string;
    title?: string;
    body: string;
    authorNickname: string;
    visibility: 'public' | 'followers';
    isActive: boolean;
    reviewState: string;
    sourceVersion: string;
    photos: CommunityReportReviewPhoto[];
    // 서버 배포 순서와 무관하게 이전 응답도 읽을 수 있도록 선택 필드로 둔다.
    places?: CommunityReportPlace[];
    publicPlaceConfirmed?: boolean;
  } | null;
}
