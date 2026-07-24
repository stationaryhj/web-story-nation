# 홈 '랭킹' 탭 신설 — writer 구현 산출물 (1·3·4단계)

- 작성 일자: 2026-07-21
- 근거 계획: `docs/plan/plan-20260721-home-ranking-tab.md`
- 구현 범위: **writer 담당 단계 전체** — 1단계(`ButtonTabs` `disableUrlSync`, 사전 완료 상태로 확인), 3단계(`RankingGridSection` 컨테이너 신설), 4단계(`views/main/home.tsx` 배선). 2·5단계(publisher)·6단계(main, 파일 삭제)는 이번 범위 밖(미구현).

## 구현 요약
계획의 3·4단계를 구현했다. `components/main/ranking/RankingGridSection.tsx`를 신규 작성해 `UpdateRankingTopCharacter('KR', topid, 4, true)` 페칭과 `period` URL(`?tab=ranking&period=...`) 동기화를 담당하는 컨테이너로 만들고, publisher가 만든 `RankingGridSectionView`에 `characters`/`period`/`onPeriodChange`/`isLoading`을 연결했다. `views/main/home.tsx`에는 '랭킹' 탭을 추가하고 콘텐츠 분기를 3분기로 확장했으며, setter가 `false`로만 호출되던 死 사이드바 3종(상태·import·JSX)을 제거했다. 1단계(`ButtonTabs`의 `disableUrlSync`)는 세션 시작 시점에 이미 완료돼 있어 추가 수정하지 않았고, 코드를 확인해 명세대로 동작함을 검증했다.

## 변경 파일

### 1단계 (사전 완료 확인, 수정 없음)
- `components/elements/tabs/ButtonTabs.tsx:19,29,40,50-53,136-139` — `ButtonTabsProps`에 `disableUrlSync?: boolean`(기본 false) 존재. 초기 탭(`initialTabId`)은 `disableUrlSync`면 `tabParam`을 무시하고 `defaultTabId || tabs[0]?.id`만 사용(:50-53). `handleTabClick`은 `disableUrlSync`면 `updateUrlParams` 호출을 건너뛰고 `onTabChange`/`onTagSelect`만 호출(:136-139). 계획 명세와 일치, 기존 사용처(메인 chip, 남/여 필터)는 기본값 `false`라 동작 불변.

### 3단계 (신규)
- `components/main/ranking/RankingGridSection.tsx` (신규 전체) — 컨테이너.
  - `PERIOD_TO_TOPID`(realtime=4/daily=1/weekly=2/monthly=3), `GENDER_ALL=4`(전체 고정), `parsePeriod()`로 URL의 `period` 값 방어(유효하지 않으면 `'realtime'`).
  - `period` 로컬 state를 URL 초기값으로 시딩(`useState(() => parsePeriod(searchParams?.get('period') ?? null))`) → 새로고침/공유 시 복원(계획 시나리오 #4).
  - `useEffect([period, isAdultModeEnabled, UpdateRankingTopCharacter])`: mount/period 변경/짜릿모드 변경 시 `UpdateRankingTopCharacter('KR', topid, 4, true)` 호출, `isLoading` 관리(cleanup으로 stale 응답 무시).
  - `handlePeriodChange`: 로컬 `period` 갱신 + `router.replace`로 `?tab=ranking&period=...` 반영(기존 `searchParams` 병합, `tab=ranking` 보존, `scroll:false`).
  - `useRecommendSectionStoreData().rankingCharactersSlide`를 그대로 `RankingGridSectionView`에 전달(서버상태 중복 저장 없음).

### 4단계 (수정)
- `views/main/home.tsx:5-13` — `AuthorRankingSidebar`/`CharacterRankingSidebar`/`NewCharacterSidebar`/`useModalStore`/`useSettingsStore` import 제거(모두 body에서 미사용이던 死 import, `useModalStore`는 계획에 명시되지 않았으나 동일 사유로 함께 정리), `RankingGridSection` import 추가.
- `views/main/home.tsx:16-22` — `navigationTabs`의 2번째 자리에 `{ id: 'ranking', label: '랭킹', shouldUpdateUrl: true }` 삽입.
- `views/main/home.tsx:33` — `isCharacterRankingSidebarOpen`/`isAuthorRankingSidebarOpen`/`isNewCharacterSidebarOpen` state 3개 제거.
- `views/main/home.tsx:85-99` — 콘텐츠 분기를 3분기로 확장: `tab==='all'`→`RecommendSection`, `tab==='ranking'`→`RankingGridSection`, else→`CharacterGridSection`.
- `views/main/home.tsx:100-102` — 死 사이드바 JSX 3개(`CharacterRankingSidebar`/`AuthorRankingSidebar`/`NewCharacterSidebar`) 제거.

## 검증 결과
- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome check`
  - `components/main/ranking/RankingGridSection.tsx` — 단독 실행 시 이슈 없음("No fixes applied").
  - `views/main/home.tsx` — 사전 존재하던 미사용 변수 경고 2건 확인(`characters`, `setSelectedTagIds`). `git diff`로 대조한 결과 **둘 다 이번 변경 이전부터 미사용 상태**였음(코드 수정 없이 그대로 유지된 라인) → 새로 유발한 이슈 아님, 보고만.
  - `components/elements/tabs/ButtonTabs.tsx` — organizeImports/포맷/버튼 `type` 미지정 등 다수 이슈 확인. **이번 세션에서 해당 파일을 수정하지 않았고**(1단계는 사전 완료 상태), git status상으로도 이전 커밋에서 이미 변경된 상태 → 기존 이슈로 판단, 보고만(수정하지 않음).
- 수동 시나리오 검증은 미실시(빌드/개발 서버 구동 확인 필요 — 후속 확인 권장).

## 계획과 달라진 점 / 미완 · 후속 필요
- `useModalStore` import 제거는 계획 4단계 문구에 명시적으로 언급되진 않았으나(계획은 `useSettingsStore`만 언급), 동일하게 body에서 미사용이던 死 import라 함께 정리했다(범위 내 최소 정리로 판단).
- 2·5단계(publisher: `RankingGridSectionView`/`RecommendSection` 정리)와 6단계(main: 5개 파일 삭제)는 이번 writer 작업 범위가 아니므로 손대지 않음 — 계획대로 사전 완료/별도 진행 상태.
- 개발 서버 기동 후 수동 시나리오(탭 순서, `?tab=ranking` 이동, 서브탭 실시간/일간/주간/월간 전환 시 URL·데이터 갱신, `?tab=ranking&period=weekly` 새로고침 복원, 남/여 탭 회귀)는 미실시 — 후속으로 확인 필요.
- `ButtonTabs.tsx`의 기존 포맷/lint 이슈(세미콜론 없음, import 미정렬, 버튼 `type` 미지정 등)는 이번 작업과 무관한 기존 이슈로 별도 정리 필요 시 사용자 확인 후 진행 권장.

## 추가 작업 (2026-07-21, 리뷰 반영 + 더 보기)
`RankingGridSection.tsx` 컨테이너에 아래 2건을 추가 반영했다(담당: main, 소규모 후속).
1. **리뷰 Warning 반영 — 기간 연타 레이스 가드**: store `rankingCharactersSlide` 구독 대신 `UpdateRankingTopCharacter`의 resolve 값을 요청 순번(`requestIdRef`) 가드와 함께 로컬 state로 사용. 늦게 도착한 이전 기간 응답이 최신 선택을 덮지 않는다. (근거: review-20260721-home-ranking-tab.md 🟡 Warning)
2. **'더 보기' 버튼**: 랭킹 API는 top 50을 1회에 받으므로(기존 '랭킹더보기' 사이드바와 동일) 서버 페이징 대신 **클라이언트 점진 노출** 방식 채택 — `visibleCount` state(20 시작, 클릭당 +20 → 20/40/50), 기간·짜릿모드 변경 시 20으로 초기화. `hasMore`/`onLoadMore` props로 View에 전달. `slice(0, visibleCount)`는 앞에서부터 자르므로 순위 뱃지(index 기반) 정합성 유지.
- 참고: store의 `UpdateharactersPaging`은 gender가 `0`으로 하드코딩되어 있어 랭킹(gender=4 전체)과 의미가 달라 재사용하지 않음.
- 검증: `npx tsc --noEmit` 통과, `npx biome check` 신규 파일 2종 클린, dev 서버 `/?tab=ranking` 200.
