export interface CommunityReportReviewPhoto {
  index: number;
  state: 'protected' | 'unavailable';
  readPath?: string;
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
  } | null;
}
