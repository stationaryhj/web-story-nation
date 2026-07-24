# 홈 '랭킹' 탭 — 퍼블리싱 결과 (2단계·5단계)

- 작성 일자: 2026-07-21
- 근거 계획: `docs/plan/plan-20260721-home-ranking-tab.md`
- 담당 범위: 2단계(`RankingGridSectionView.tsx` 신규, publisher) · 5단계(`RecommendSection.tsx` 마크업 제거, publisher)
- 미포함(타 담당): 1단계 `ButtonTabs.tsx`(writer, 이미 병합됨 확인) · 3단계 `RankingGridSection.tsx` 컨테이너(writer, 아직 미생성) · 4단계 `home.tsx`(writer) · 6단계 파일 삭제(main)

## 요약
계획 2단계 명세대로 순수 표시용 `RankingGridSectionView.tsx`를 신설해 기간 서브탭(실시간/일간/주간/월간, `ButtonTabs variant='underline' disableUrlSync`)과 순위 뱃지 그리드(`CardGrid hasRanking`)를 남/여/성별모름 탭과 동일 레이아웃으로 구현했다. 성별 셀렉트는 확정 결정에 따라 넣지 않았다. 5단계로 `RecommendSection.tsx`에서 캐릭터 랭킹·작가 랭킹·앱 설치 섹션 마크업과 관련 import를 제거하고 최신/기타/캐릭터 만들기 섹션만 남겼다.

## 변경 파일

- `components/main/ranking/RankingGridSectionView.tsx` (신규, 전체) — 계획 2단계
  - `RankingGridSectionViewProps { characters, period, onPeriodChange, isLoading }` 정의 (연결 지점, writer의 `RankingGridSection.tsx` 컨테이너가 데이터/URL 로직을 채워 넣을 예정).
  - 헤더: `🏆 캐릭터 랭킹` 타이틀(`text-2xl font-bold text-text-primary`) + 기간별 안내 문구(`text-xs text-text-muted`, 기존 `CharacterRankingSection.tsx`의 `getRankingUpdateMessage` 문구를 로컬 함수로 재구현 — 원본 파일은 6단계에서 삭제 예정이라 import 대신 값만 재사용).
  - 서브탭: `<ButtonTabs tabs={periodTabs} defaultTabId={period} variant='underline' disableUrlSync onTabChange={onPeriodChange} />`.
  - 그리드: `<CardGrid customData={characters} useSwiper={false} hasRanking isLoading={isLoading} />` — `cardsPerRow` 미지정(기본값 5)으로 `CharacterGridSection`과 동일한 `grid-cols-2 xs:3 md:4 lg:5 xl:6 2xl:7` 레이아웃, `hasRanking`으로 `Card`의 `rank={index+1}` 뱃지 재사용.
  - 로딩: `isLoading` 그대로 `CardGrid`에 전달 → 내부 스켈레톤(`CardSkeleton` × cardsPerRow) 자동 렌더.
  - 빈 상태: `!isLoading && characters.length === 0`일 때 안내 텍스트 블록(`CharacterGridSection`의 빈 상태 톤과 통일).
  - 콘텐츠 폭: 홈 공용 컨테이너 `mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]` 재사용(`SectionTransition` 래핑도 `CharacterGridSection`과 동일 패턴).
  - 성별 셀렉트 없음(확정 결정①).
  - 표시용 컴포넌트라 자체 hook/state 없음 — `'use client'` 미부착(서버 컴포넌트 우선 원칙, 상위 `RankingGridSection`이 클라이언트 경계).

- `components/main/RecommendSection.tsx:1-33` — 계획 5단계
  - 제거: `<div id='character-ranking-section'><CharacterRankingSection/></div>`, `<div id='author-ranking-section'><AuthorRankingSection/></div>`, 앱 설치 섹션 JSX 전체(구글/애플 배지 버튼 포함).
  - 제거된 import: `DivideCircle`(lucide-react, 원래도 미사용이던 dead import), `Image`(next/image, 앱설치 블록 전용), `AuthorRankingSection`, `CharacterRankingSection`.
  - 유지: `LatestCharactersSection`, `EtcCharactersSection`, `CreateCharacterSection` 및 짜릿모드 변경 시 `invalidateData()` 훅(로직 영역, 손대지 않음).
  - 남은 섹션 사이 여백은 각 섹션 자체의 `py-*`에 의존하던 기존 구조 그대로라 별도 마진 보정 불필요(레이아웃 자연스럽게 유지 확인).

## 반응형 / 웹뷰 점검
- **360px**: `RankingGridSectionView` 헤더는 세로 스택(타이틀 → 안내문구 → 서브탭), 그리드는 `grid-cols-2`로 시작해 가로 스크롤 없음. 서브탭 컨테이너(`ButtonTabs` 내부 `overflow-x-auto hide-scrollbar`)가 좁은 화면에서 넘칠 경우 페이지 레벨이 아닌 탭 내부에서만 스크롤되어 페이지 가로 스크롤 방지.
- **768px**: 그리드 `md:grid-cols-4`, 서브탭 `md:text-lg`로 확대, 레이아웃 깨짐 없음.
- **1280px**: 콘텐츠 폭 `max-w-[2200px]` 컨테이너 내에서 `lg:grid-cols-5` 적용, 남/여 탭과 동일 시각.
- **터치 타깃**: `ButtonTabs`(공용, 이번 작업 미수정) underline variant의 실제 히트 영역은 `py-2 px-1` 기준으로 약 36~40px 수준으로 확인됨(44px 미만 가능성) — 이는 계획상 재사용 대상인 기존 공용 컴포넌트의 기존 특성이며, `CharacterRankingSection.tsx`도 동일 컴포넌트를 동일하게 써왔으므로 **회귀는 아님**. 44px 미달이 실제 이슈라면 `ButtonTabs.tsx`(writer 소유 파일) 쪽 개선이 필요 — 이번 범위 밖으로 제안만 남김.
- **웹뷰 고려**: 새 창/딥링크 없음(순수 그리드+탭), `position:fixed` 미사용, `100vh` 미사용(섹션 컨테이너는 콘텐츠 높이 기반). 앱 설치 섹션 제거로 `window.open`류 외부 링크(`target='_blank'`)가 추천 탭에서 사라져 웹뷰 팝업 제약 이슈도 함께 줄어듦.
- **긴 텍스트 방어**: 카드 자체(`Card.tsx`)는 기존 컴포넌트 그대로 사용해 별도 변경 없음(계획 범위 밖).

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- **로직 연결 필요**: `RankingGridSectionView`의 `characters`/`period`/`onPeriodChange`/`isLoading` props는 writer가 3단계 `RankingGridSection.tsx` 컨테이너에서 `useRecommendSectionStoreData().UpdateRankingTopCharacter('KR', topid, 4, true)` 결과(`rankingCharactersSlide`)와 `period` URL 상태를 연결해야 한다(계획 3단계 그대로, 아직 미생성 확인됨).
- **타입 체크**: `npx tsc --noEmit` 전체 통과(에러 0). `ButtonTabs`의 `disableUrlSync` prop은 이미 병합되어 있어 타입 에러 없이 사용됨(계획에서 우려했던 "미병합 시 에러 무시" 상황은 발생하지 않음).
- **Biome**: 신규 파일 `RankingGridSectionView.tsx`는 `npx biome check`로 단독 클린. `RecommendSection.tsx`는 두 가지 기존 이슈가 그대로 남음 — (1) `onSearchTrigger` prop `noUnusedFunctionParameters` 경고: 원본 파일에도 이미 있던 pre-existing 이슈로 확인됨(수정은 prop 인터페이스/호출부 변경이 필요해 범위 밖, home.tsx에서 실제 전달 여부는 writer 확인 필요), (2) CRLF 개행 관련 formatter 경고: 저장소 전반(`CharacterGridSection.tsx` 등 무변경 파일에서도 동일 재현)에 걸친 기존 이슈로 이번 작업과 무관.
- **미완**: 없음(2·5단계 지정 범위 내 구현 완료).

## 추가 작업 (2026-07-21, '더 보기' 버튼)
사용자 요청으로 `RankingGridSectionView.tsx`에 '더 보기' 버튼을 추가했다(담당: main, 소규모 후속).
- **props 추가**: `hasMore?: boolean`(버튼 표시 여부), `onLoadMore?: () => void`(클릭 핸들러) — 노출 개수 로직은 컨테이너 담당, View는 표시만.
- **마크업**: 그리드 하단 `mt-8 flex justify-center` + `CharacterGridSection`의 더 보기 버튼 스타일 준용(`px-6 py-2 rounded-full bg-primary-500 hover:bg-primary-600`). 차이점 2가지 — ① `min-h-[44px]` 추가로 터치 타깃 44px 충족(기존 버튼은 ~40px), ② `type='button'` 명시.
- **로딩 처리**: `isLoading` 중엔 `disabled` + '로딩 중...' 표기(기존 탭과 동일 UX).
- 검증: 360/768/1280px 그리드 하단 중앙 정렬 확인 기준 충족, `tsc`·`biome` 클린, dev 서버 200.
