# 반려동물 키우기 공개 관리 어드민

`/playground/pet-release`에서 놀이터 반려동물 키우기의 품질 승인과 사용자 공개를 관리한다. 기획은 포퐁 Obsidian `Projects/Pawpong/놀이터_도트친구_다마고치_기획_v1.md`를 따른다. 이 화면은 잠금 제어만 다루며 게임 자체나 인앱결제는 건드리지 않는다.

## 계약

`GET`/`PUT /api/home-admin/playground-pet-release`, 공통 응답 래퍼의 `data`:

| 필드 | 타입 | 의미 |
|---|---|---|
| `qualityApproved` | boolean | 품질 승인 |
| `published` | boolean | 운영 공개 설정 |
| `revision` | number | 낙관적 잠금 버전 |
| `developmentPreviewEnabled` | boolean | 이 환경의 개발 미리보기 사용 여부 |
| `effectiveEnabled` | boolean | 이 환경에서 실제로 열려 있는지 |
| `environment` | string | 서버 환경 |
| `updatedAt` | string \| null | 마지막 변경 시각 |

`PUT` 본문은 `{ qualityApproved, published, expectedRevision }`이다. revision이 다르면 409다. 운영 서버 기본값은 `qualityApproved=false`, `published=false`다.

## 동작

- 진입 시 조회만 한다. 진입·배포·저장 성공 어느 것도 공개를 자동으로 켜지 않는다.
- 품질 승인(체크박스)과 운영 공개(스위치)는 별도 조작이다. 품질 승인을 체크하기 전에는 공개 스위치가 비활성이고, 승인을 해제하면 공개도 함께 꺼진다. 승인만으로 공개가 켜지지 않는다.
- 공개를 새로 여는 저장은 확인 창을 한 번 더 거친다. `published=true`·`qualityApproved=false` 조합은 HTTP 호출 전에 거절한다.
- `공개 중`은 `qualityApproved`·`published`·`effectiveEnabled`가 모두 true일 때만 표시한다. 그 외에는 `비공개·개발 중`이다. 개발 미리보기로 열려 있는 환경도 공개로 표시하지 않는다.
- 응답의 필드가 빠지거나 boolean이 아니면 기본값으로 메우지 않고 오류로 처리한다. 조회 실패(404·5xx·잘못된 응답 포함) 시 `상태 확인 불가`를 표시하고 두 조작과 저장을 잠근다. mock 대체 경로는 없다.
- 409는 저장하려던 값을 안내에 남기고 최신 설정을 다시 불러온다. 다른 관리자의 변경을 보지 않은 채 이전 선택을 재적용하지 않으므로, 초안은 서버 최신 값에서 다시 시작한다. 메뉴·직접 URL·서버 API 잠금 설명은 로딩·오류·충돌 상태에서도 항상 보인다.
- 개발 미리보기 링크는 `https://dev.pawpong.kr/playground/pet` 고정이며 공개와 무관함을 함께 안내한다.
- 메뉴와 경로는 `canManageAdmins` 권한에만 보인다. 화면 가림일 뿐이며 최종 차단은 서버가 한다.

## 검증 기록 (2026-10-05)

- `tests/playground-pet-release.test.mjs`: 계약 요청/응답, 미승인 공개 차단, 잘못된 응답 거절, 엔드포인트 부재, 409 후 재조회, 조작 분리, 미리보기와 공개의 구분, 경로·권한.
- 계약 fixture(`tests/fixtures/admin-openapi.json`)의 이 엔드포인트는 합의된 계약으로 직접 작성했다. 백엔드 구현이 dev Swagger에 올라오면 `pnpm test:contract:update`로 실제 스키마와 다시 맞춰야 한다.
- Orca 내장 브라우저 + 로컬 HTTP fixture(제품 코드 밖, 합성 세션)로 화면을 확인했다. 실제 백엔드·심사 계정 검증이 아니다. 진입 시 GET만 발생, 품질 승인만 저장(`published=false`), 공개 저장 전 확인 창, 취소 시 PUT 없음, 409 후 최신 설정 재조회와 안내 유지, 404·잘못된 응답에서 `상태 확인 불가`와 조작 잠금, 개발 미리보기 환경이 `비공개·개발 중`으로 표시됨을 확인했다. 내장 브라우저 탭이 애니메이션 프레임을 실행하지 않아 확인 창의 닫힘 애니메이션은 눈으로 확인하지 못했다.
- 실제 백엔드 연결 후 재검증이 필요하다: 실제 응답 스키마, 409 응답, 권한 응답.
