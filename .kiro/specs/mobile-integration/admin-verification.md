# 관리자 모바일 연동 검증

검증일: 2026-09-24 (KST). 작업 브랜치: `dev`. 관리자 프런트엔드 범위이며 배포 및 `main` 동기화는 코디네이터 소유다.

## 변경 내용

- `/content/deep-links`와 탐색 메뉴를 추가했다. 실제 관리자 API로 목록·페이지 이동·생성·수정·활성/비활성·삭제를 처리하고 공유 URL 복사와 푸시 작성 이동을 제공한다.
- 공유 주소 기본값은 `https://pawpong.kr/l/{slug}`다. `VITE_PUBLIC_WEB_URL=https://dev.pawpong.kr`를 빌드 환경에 선택적으로 지정하면 dev 웹 주소를 사용한다. 운영 환경 변수는 변경하지 않았다.
- 새 딥링크 기본 목적지는 실제 앱 홈 `/`다. 현재 사용자 웹 화면 `/explore`, `/community` 등을 안내한다. 관리 화면 주소, 외부 이동, 인코딩된 외부 경로, 딥링크 재귀를 검증한다.
- 푸시 기본 대상을 개별 발송으로 바꾸고 사용자 선택, 공백 제목·본문, 사용자 앱 URL을 검증한다. 중복 제출을 차단하고 기존 전체 발송 확인을 유지한다. 테스트에서 전체 발송은 실행하지 않았다.
- 결과 화면에서 앱 알림 저장과 FCM 접수 카운트를 표시하며 FCM 접수 성공이 기기 수신·표시를 의미하지 않음을 안내한다. 토큰 없음·부분 실패는 경고 결과로 표시한다.
- 앱 버전의 권장/필수 업데이트 기준, 메시지, 스토어 주소, 활성 상태 및 기존 `appIconKey` 변경을 검토·보강했다. 플랫폼별 가장 나중에 생성한 활성 정책이 적용됨을 안내한다. `default`는 발바닥 기본 아이콘, `pixel`은 번들에 포함된 픽셀 아이콘이다.

## 확인한 API 계약

백엔드 `dev` 커밋 `00da853c`의 실제 Swagger 문서(`/tmp/pawpong-mobile-openapi.json`, 전체 274개 경로)를 내보내 `pnpm test:contract:update /tmp/pawpong-mobile-openapi.json`으로 스냅샷을 갱신했다. 관리자 스냅샷에는 106개 경로와 149개 스키마가 포함된다.

| 기능 | 요청 | 응답 |
| --- | --- | --- |
| 딥링크 목록 | `GET /api/deep-link-admin?page=1&limit=10` | `success/code/data.items/data.pagination/message/timestamp` |
| 생성 | `POST /api/deep-link-admin` | `data`의 단일 레코드 |
| 수정·활성 전환 | `PUT /api/deep-link-admin/:id` 부분 필드 | `data`의 단일 레코드 |
| 삭제 | `DELETE /api/deep-link-admin/:id` | `data: null` |
| 앱 버전 | `GET/POST /api/app-version-admin`, `PATCH/DELETE /api/app-version-admin/:id` | 기존 표준 응답 |
| 푸시 | `POST /api/notification-admin/push` | 수신자·알림 저장·FCM 토큰 접수/실패 카운트 |

딥링크 레코드는 `id`, `slug`, `title`, `description`, `targetPath`, `imageUrl`, `isActive`, `createdAt`, `updatedAt`를 사용한다. 생성 시 slug를 비우면 서버가 생성하고, 설명/이미지는 빈 문자열을 유지한다. 수정에는 `isActive: false`와 빈 문자열을 그대로 보낸다. 서버의 409/400 오류 메시지를 표시하며 저장 실패 시 모달을 유지한다.

## 자동 검증

- `pnpm build`: 성공. prebuild의 `pnpm typecheck`와 `tsc -b` 포함, Vite 7.3.3, 3,275개 모듈. 기존 주 번들 500 kB 경고가 남는다.
- `node --test tests/*.test.mjs`: **37/37 통과**. 새 회귀 테스트 9개에서 페이지네이션·서버 slug 생성·PUT 및 false/빈 문자열·개별 푸시 데이터·앱 버전 정책/스토어 주소·외부 URL 차단·공유 도메인 선택을 확인했다.
- 변경 TS/TSX 파일 ESLint 및 `git diff --check`: 통과.
- 전체 ESLint: 변경하지 않은 기존 파일의 **오류 16개, 경고 1개**로 실패. 이번에 수정한 사용자 선택 모달의 기존 effect 관련 오류 2개는 해소했다.
- `pnpm test`: 단위 테스트 37개 통과 후 계약 커버리지 검사에서 종료 코드 1. **관리자 호출 141개에서 계약 불일치 0개**, 문서의 관리자 동작 **135개 중 129개 연결**이다.
- 미연결 6개는 기존 약관 API `GET/POST /api/terms-admin`, `GET/PATCH/DELETE /api/terms-admin/{termsId}`, `PATCH /api/terms-admin/{termsId}/activate`다. 이번 모바일 연동 범위 밖이며 기존 백엔드 HEAD에 존재한다. 코디네이터 지시대로 실제 문서를 보존하고 커버리지 게이트를 완화하거나 제외 목록을 추가하지 않았다.

## 실제 격리 API와 브라우저 검증

Orca 관리 Vite 터미널(`127.0.0.1:5198`)과 내장 브라우저에서 실제 테스트 관리자 로그인 후 수행했다. 백엔드는 격리 MongoDB를 사용하는 Nest API `127.0.0.1:8086`, 공개 HTML은 해당 API와 연결된 웹 `127.0.0.1:3017`이다. 인증 정보는 권한 0600 임시 파일로 전달받았으며 저장소/로그에 기록하지 않았다.

### 딥링크

1. 관리자 UI에서 slug 없이 생성: POST 200, 서버 생성 slug `a19fdfbad2ab12e9989191d4`, 목적지 `/explore`, 설명/이미지 빈 문자열, 활성 상태를 실제 목록 GET에서 확인했다.
2. slug를 `admin-mobile-verification`, 제목을 `관리자 모바일 검증 수정`, 목적지를 `/community`로 수정하고 설명/이미지를 저장했다. PUT 200 및 목록 반영을 확인했다.
3. 공개 API `GET /api/v2/deep-links/admin-mobile-verification`의 데이터 일치, 웹 `GET /l/admin-mobile-verification`의 200 `text/html`, 제목·OG 정보·`/community` 이동 링크를 확인했다.
4. 공유 주소 `https://pawpong.kr/l/admin-mobile-verification`와 복사 버튼 성공 표시를 확인했다. OS 클립보드 내용을 별도로 읽지는 않았다.
5. 비활성 UI 전환 PUT 200 후 공개 API와 HTML이 모두 404를 반환했고, 다시 활성화하는 PUT 200을 확인했다.
6. 행의 `푸시 작성`으로 이동하면 해당 공유 URL이 입력되고 기본 대상이 개별이며 사용자 선택 전 발송 버튼이 비활성임을 확인했다.
7. `//external.test` 입력은 UI 검증 오류를 표시하고 저장 요청을 보내지 않았다.
8. 관리자 UI에서 확인 후 삭제: DELETE 200, 목록에서 제거, 공개 API 및 HTML 404를 확인했다. RN 공용 검증용 `mobile-integration-preview` 레코드는 유지했다.

페이지네이션 요청 계약과 실제 1페이지 목록을 검증했다. 10개 초과 데이터의 페이지 이동, 중복 slug 409 화면, 선택 필드를 비우는 UI 키보드 동작은 별도 실증하지 않았으며 빈 문자열 전달은 어댑터 회귀 테스트로 확인했다.

### 권장/필수 업데이트와 아이콘

- 기존 정책을 보존하고 별도 iOS 정책을 관리자 UI로 생성했다. 최신 `1.3.0`, 최소 `1.1.0`, 개별 권장/필수 메시지, `appIconKey: default`, 활성 상태로 POST 200 및 목록 반영을 확인했다.
- 최소 `1.4.0` / 최신 `1.3.0` 조합은 UI가 차단했고 생성 요청이 없었다.
- 공개 버전 조회에서 현재 `1.0.0`은 필수=true/권장=false, `1.1.0`은 필수=false/권장=true, `1.3.0`은 둘 다 false였다.
- 관리자 UI로 권장 메시지와 아이콘을 `pixel`로 바꾸어 PATCH 200 및 공개 응답 반영을 확인했다.
- 새 정책 비활성화 PATCH 200 후 기존 iOS `1.0.0` 정책으로 복귀했다. 새 정책을 DELETE 200으로 정리하고 기존 두 정책만 남은 목록을 확인했다.
- 이 정책에 사용한 테스트 iOS 스토어 주소는 URL 형식 검증용이다. 실제 앱 설치·스토어 게시·기기의 아이콘 전환은 이 관리자 검증으로 입증하지 않는다. 정책 제어는 RN 담당자에게 반환했다.

### 격리 개별 푸시

관리자 UI에서 테스트 입양자 1명을 명시적으로 선택하고 관리한 딥링크 주소로 1회 요청했다. POST 200 응답은 `recipients=1`, `notificationsCreated=1`, `pushTokensTargeted=0`, `pushSuccess=0`, `pushFailed=0`, `invalidTokens=0`이었다. UI의 토큰 없음 및 FCM 접수/실제 수신 구분 안내를 확인했다. 이 요청은 실제 FCM 수신 검증이 아니다.

실제 테스트 기기 토큰 한 개와 발송 예산 한 건으로 제한된 별도 QA API에서 최종 관리자 UI 발송을 준비 중이다. RN 담당자의 관찰 준비 확인을 받았으며, 최종 발송/기기 관찰 결과는 후속 기록으로 추가한다.

## 교차 검토 및 제한

- 사용자 웹의 로그아웃 대기 중 갱신된 access token이 `REQUEST_FCM_TOKEN`을 다시 보내는 경합을 실제 모듈로 재현하여 코디네이터에 전달했다. 코디네이터의 세션 lifecycle 수정 후 같은 재현에서 등록 요청이 발생하지 않음을 재확인했다. 웹 변경은 코디네이터 소유다.
- 로컬에서 만든 slug는 운영 DB에 자동 생성되지 않는다. 복사한 운영 주소의 실제 공개 동작은 같은 데이터 환경의 웹/API로 검증해야 한다.
- 운영 푸시, 대량 푸시, 운영 정책/환경 변경, 배포, `main` 푸시 및 에뮬레이터 제어는 수행하지 않았다.
