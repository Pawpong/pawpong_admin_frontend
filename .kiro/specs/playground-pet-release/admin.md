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
- 메뉴와 경로는 모든 관리자에게 보인다. 서버가 home-admin의 JWT 인증과 admin 역할만 확인하므로 화면만 더 좁게 가리지 않는다. 특정 관리자로 제한하려면 서버에 권한 검사를 먼저 추가해야 한다.
- 서버는 운영 환경(`environment=production`)에서만 품질 승인+공개 설정으로 잠금을 푼다. 개발 환경은 미리보기 설정으로만 열리고 `unknown`은 열리지 않는다. 그래서 운영이 아닌 환경에서는 확인 창과 안내가 "이 서버에만 저장되고 운영 서비스는 공개되지 않는다"고 알린다.

## 검증 기록 (2026-10-05)

- `tests/playground-pet-release.test.mjs`: 계약 요청/응답, 미승인 공개 차단, 잘못된 응답 거절, 엔드포인트 부재, 409 후 재조회, 조작 분리, 미리보기와 공개의 구분, 경로·권한.
- 계약 fixture(`tests/fixtures/admin-openapi.json`)의 이 엔드포인트는 합의된 계약으로 직접 작성했다. 백엔드 구현이 dev Swagger에 올라오면 `pnpm test:contract:update`로 실제 스키마와 다시 맞춰야 한다.
- Orca 내장 브라우저 + 로컬 HTTP fixture(제품 코드 밖, 합성 세션)로 화면을 확인했다. 실제 백엔드·심사 계정 검증이 아니다. 진입 시 GET만 발생, 품질 승인만 저장(`published=false`), 공개 저장 전 확인 창, 취소 시 PUT 없음, 409 후 최신 설정 재조회와 안내 유지, 404·잘못된 응답에서 `상태 확인 불가`와 조작 잠금, 개발 미리보기 환경이 `비공개·개발 중`으로 표시됨을 확인했다. 내장 브라우저 탭이 애니메이션 프레임을 실행하지 않아 확인 창의 닫힘 애니메이션은 눈으로 확인하지 못했다.
- 실제 백엔드 연결 후 재검증이 필요하다: 실제 응답 스키마, 409 응답, 권한 응답.

## 후속 정렬 (2026-10-05, 백엔드 실제 구현 대조)

백엔드 작업 공간의 미커밋 구현(컨트롤러·본문 guard·서비스·저장소, `.kiro/specs/playground-pet/release-contract.md`)을 읽기 전용으로 대조했다.

- 계약 fixture의 이 엔드포인트를 손으로 쓴 내용에서 백엔드 소스의 실제 Swagger 메타데이터로 교체했다. 백엔드 작업 공간의 당시 미커밋 소스를 복사본에서 빌드해 추출했으며, 요청 본문, 응답 `data` 7개 필드(`environment`는 development/production/unknown), 400·401·403·409·503 응답을 포함한다. 계약 검사는 이 스키마와 화면의 요청·응답 타입을 대조한다. 백엔드 최종 커밋 뒤 다시 생성해 차이가 없는지 확인해야 하며, fixture 검사는 실제 배포된 백엔드를 증명하지 않는다.
- 화면 권한을 서버 guard에 맞췄고, 환경별 안내를 추가했으며, 서버가 거절하는 마지막 안전 정수 revision을 요청 전에 막는다.
- Orca 내장 브라우저에서 백엔드의 실제 컴파일된 컨트롤러·본문 guard·서비스를 띄워 확인했다. 대체한 것은 Mongo 저장소(메모리), JWT/역할 guard(통과), 관리자 ID(합성)다. 기본 OFF, 품질 승인만 저장, 다른 관리자 선행 저장 뒤 409와 재조회, 개발·unknown 환경 안내, 권한 제한 세션의 메뉴 노출을 확인했다. 미승인 공개·문자열 boolean·추가 필드 400과 stale revision 409는 같은 실제 컨트롤러에 직접 요청해 확인했다.
- 실제 심사 계정 로그인, 실제 Mongo, 실제 JWT·역할 guard, 배포된 dev/운영 API로는 검증하지 않았다.
