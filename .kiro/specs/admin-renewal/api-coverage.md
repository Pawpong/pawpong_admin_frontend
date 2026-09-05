# 관리자 API 연결 목록

검증 기준: tests/fixtures/admin-openapi.json. `pnpm test:contract`가 이 목록의 전체 관리자 operation 누락도 검사한다. 아래는 호출 코드 연결 범위이며 실제 서버 실행 완료 목록이 아니다.

## adopter-admin (4)

| 메서드 | 경로 |
|---|---|
| GET | `/api/adopter-admin/reviews/reports` |
| DELETE | `/api/adopter-admin/reviews/{breederId}/{reviewId}` |
| GET | `/api/adopter-admin/applications` |
| GET | `/api/adopter-admin/applications/{applicationId}` |

## ai-image-admin (8)

| 메서드 | 경로 |
|---|---|
| GET | `/api/ai-image-admin/filters` |
| POST | `/api/ai-image-admin/filter` |
| PATCH | `/api/ai-image-admin/filter/{filterId}` |
| DELETE | `/api/ai-image-admin/filter/{filterId}` |
| POST | `/api/ai-image-admin/filter/preview` |
| POST | `/api/ai-image-admin/upload-url` |
| GET | `/api/ai-image-admin/agent/health` |
| GET | `/api/ai-image-admin/jobs` |

## alimtalk-admin (6)

| 메서드 | 경로 |
|---|---|
| GET | `/api/alimtalk-admin/templates` |
| POST | `/api/alimtalk-admin/templates` |
| GET | `/api/alimtalk-admin/templates/{templateCode}` |
| PATCH | `/api/alimtalk-admin/templates/{templateCode}` |
| DELETE | `/api/alimtalk-admin/templates/{templateCode}` |
| POST | `/api/alimtalk-admin/templates/refresh-cache` |

## announcement-admin (4)

| 메서드 | 경로 |
|---|---|
| GET | `/api/announcement-admin/announcements` |
| POST | `/api/announcement-admin/announcement` |
| PATCH | `/api/announcement-admin/announcement/{announcementId}` |
| DELETE | `/api/announcement-admin/announcement/{announcementId}` |

## app-version-admin (4)

| 메서드 | 경로 |
|---|---|
| GET | `/api/app-version-admin` |
| POST | `/api/app-version-admin` |
| PATCH | `/api/app-version-admin/{appVersionId}` |
| DELETE | `/api/app-version-admin/{appVersionId}` |

## auth-admin (2)

| 메서드 | 경로 |
|---|---|
| POST | `/api/auth-admin/login` |
| POST | `/api/auth-admin/refresh` |

## breeder-admin (4)

| 메서드 | 경로 |
|---|---|
| POST | `/api/breeder-admin/suspend/{breederId}` |
| POST | `/api/breeder-admin/unsuspend/{breederId}` |
| PATCH | `/api/breeder-admin/test-account/{breederId}` |
| POST | `/api/breeder-admin/remind` |

## breeder-management-admin (10)

| 메서드 | 경로 |
|---|---|
| GET | `/api/breeder-management-admin/profile-banners` |
| POST | `/api/breeder-management-admin/profile-banner` |
| PATCH | `/api/breeder-management-admin/profile-banner/{bannerId}` |
| DELETE | `/api/breeder-management-admin/profile-banner/{bannerId}` |
| GET | `/api/breeder-management-admin/counsel-banners` |
| POST | `/api/breeder-management-admin/counsel-banner` |
| PATCH | `/api/breeder-management-admin/counsel-banner/{bannerId}` |
| DELETE | `/api/breeder-management-admin/counsel-banner/{bannerId}` |
| GET | `/api/breeder-management-admin/profile-banners/active` |
| GET | `/api/breeder-management-admin/counsel-banners/active` |

## breeder-report-admin (2)

| 메서드 | 경로 |
|---|---|
| GET | `/api/breeder-report-admin/reports` |
| PATCH | `/api/breeder-report-admin/reports/{reportId}` |

## breeder-verification-admin (6)

| 메서드 | 경로 |
|---|---|
| GET | `/api/breeder-verification-admin/breeders` |
| GET | `/api/breeder-verification-admin/verification/pending` |
| GET | `/api/breeder-verification-admin/verification/{breederId}` |
| PATCH | `/api/breeder-verification-admin/verification/{breederId}` |
| GET | `/api/breeder-verification-admin/stats` |
| POST | `/api/breeder-verification-admin/document-reminders/send` |

## breeds-admin (5)

| 메서드 | 경로 |
|---|---|
| GET | `/api/breeds-admin` |
| POST | `/api/breeds-admin` |
| GET | `/api/breeds-admin/{id}` |
| PATCH | `/api/breeds-admin/{id}` |
| DELETE | `/api/breeds-admin/{id}` |

## community-admin (3)

| 메서드 | 경로 |
|---|---|
| GET | `/api/community-admin/reports` |
| POST | `/api/community-admin/reports/{reportId}/resolve` |
| POST | `/api/community-admin/reports/{reportId}/dismiss` |

## contest-admin (1)

| 메서드 | 경로 |
|---|---|
| PATCH | `/api/contest-admin/entries/{entryId}/status` |

## districts-admin (5)

| 메서드 | 경로 |
|---|---|
| GET | `/api/districts-admin` |
| POST | `/api/districts-admin` |
| GET | `/api/districts-admin/{id}` |
| PATCH | `/api/districts-admin/{id}` |
| DELETE | `/api/districts-admin/{id}` |

## home-admin (8)

| 메서드 | 경로 |
|---|---|
| GET | `/api/home-admin/banners` |
| POST | `/api/home-admin/banner` |
| PATCH | `/api/home-admin/banner/{bannerId}` |
| DELETE | `/api/home-admin/banner/{bannerId}` |
| GET | `/api/home-admin/faqs` |
| POST | `/api/home-admin/faq` |
| PATCH | `/api/home-admin/faq/{faqId}` |
| DELETE | `/api/home-admin/faq/{faqId}` |

## notice-admin (5)

| 메서드 | 경로 |
|---|---|
| GET | `/api/notice-admin` |
| POST | `/api/notice-admin` |
| GET | `/api/notice-admin/{noticeId}` |
| PATCH | `/api/notice-admin/{noticeId}` |
| DELETE | `/api/notice-admin/{noticeId}` |

## notification-admin (3)

| 메서드 | 경로 |
|---|---|
| GET | `/api/notification-admin/notifications` |
| GET | `/api/notification-admin/stats` |
| POST | `/api/notification-admin/push` |

## notification-email-preview-admin (8)

| 메서드 | 경로 |
|---|---|
| POST | `/api/notification-email-preview-admin/breeder-approval` |
| POST | `/api/notification-email-preview-admin/breeder-rejection` |
| POST | `/api/notification-email-preview-admin/new-application` |
| POST | `/api/notification-email-preview-admin/document-reminder` |
| POST | `/api/notification-email-preview-admin/application-confirmation` |
| POST | `/api/notification-email-preview-admin/new-review` |
| GET | `/api/notification-email-preview-admin/preview-all` |
| GET | `/api/notification-email-preview-admin/render` |

## platform-admin (3)

| 메서드 | 경로 |
|---|---|
| GET | `/api/platform-admin/stats` |
| GET | `/api/platform-admin/mvp-stats` |
| GET | `/api/platform-admin/system-health` |

## popular-keyword-admin (5)

| 메서드 | 경로 |
|---|---|
| GET | `/api/popular-keyword-admin` |
| POST | `/api/popular-keyword-admin` |
| GET | `/api/popular-keyword-admin/{id}` |
| PATCH | `/api/popular-keyword-admin/{id}` |
| DELETE | `/api/popular-keyword-admin/{id}` |

## standard-question-admin (5)

| 메서드 | 경로 |
|---|---|
| GET | `/api/standard-question-admin` |
| PATCH | `/api/standard-question-admin/{id}` |
| PATCH | `/api/standard-question-admin/{id}/status` |
| POST | `/api/standard-question-admin/reorder` |
| POST | `/api/standard-question-admin/reseed` |

## upload-admin (7)

| 메서드 | 경로 |
|---|---|
| GET | `/api/upload-admin/files` |
| DELETE | `/api/upload-admin/files` |
| GET | `/api/upload-admin/files/folder/{folder}` |
| DELETE | `/api/upload-admin/file` |
| DELETE | `/api/upload-admin/folder` |
| POST | `/api/upload-admin/files/check-references` |
| GET | `/api/upload-admin/files/referenced` |

## user-admin (11)

| 메서드 | 경로 |
|---|---|
| GET | `/api/user-admin/profile` |
| GET | `/api/user-admin/users` |
| PATCH | `/api/user-admin/users/{userId}/status` |
| GET | `/api/user-admin/deleted-users` |
| GET | `/api/user-admin/deleted-users/stats` |
| PATCH | `/api/user-admin/deleted-users/{userId}/restore` |
| PATCH | `/api/user-admin/users/{userId}/hard-delete` |
| GET | `/api/user-admin/phone-whitelist` |
| POST | `/api/user-admin/phone-whitelist` |
| PATCH | `/api/user-admin/phone-whitelist/{id}` |
| DELETE | `/api/user-admin/phone-whitelist/{id}` |
