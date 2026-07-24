# 홈 '최신' 탭 신설 — publisher 담당 단계(1, 4) 퍼블리싱 결과

- 작성 일자: 2026-07-21
- 근거 계획: `docs/plan/plan-20260721-home-latest-tab.md`
- 담당 범위: 계획의 `[담당: publisher]` 단계인 **1단계**(`LatestGridSectionView.tsx` 신규)와 **4단계**(`RecommendSection.tsx` 마크업 제거)만 구현. 2·3단계(writer: `LatestGridSection.tsx` 컨테이너, `home.tsx` 배선), 5단계(main: dead code 삭제)는 손대지 않음.

## 구현 범위
- **구현**: 1단계, 4단계.
- **미구현(타 담당)**: 2단계(`components/main/latest/LatestGridSection.tsx` 컨테이너 신설, writer), 3단계(`views/main/home.tsx` 탭 배선, writer), 5단계(`LatestCharactersSection.tsx` 삭제, main). 이번 세션에서는 View 단독으로 동작하며, 아직 어디에서도 import되지 않는다(컨테이너가 없기 때문에 정상).

## 변경 파일
- `components/main/latest/LatestGridSectionView.tsx` (신규, 전체) — 순수 표시용(View) 컴포넌트. `RankingGridSectionView.tsx`의 검증된 마크업(컨테이너 폭 `SectionTransition py-12 bg-surface` + `container mx-auto px-4`, 카드 그리드, 더 보기 버튼)을 복제하되 기간 서브탭(`ButtonTabs`)과 `hasRanking`을 제거. 헤더는 `🌱 지금 막 올라온 캐릭터 🌱` + 안내 문구, 그리드는 `<CardGrid customData={characters} useSwiper={false} isLoading={isLoading} />`(순위 뱃지 없음, `cardsPerRow` 기본값 5 → 남/여/랭킹 탭과 동일 반응형: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`), 빈 상태(`!isLoading && characters.length===0`) 안내 블록, 더 보기 버튼(`min-h-[44px] px-6 py-2 rounded-full bg-primary-500 hover:bg-primary-600`, `hasMore && onLoadMore`일 때만 렌더, 로딩 중 disabled + '로딩 중...'). `'use client'` 미부착(랭킹 View와 동일), `props`는 계획 명시 인터페이스(`characters`, `isLoading`, `hasMore?`, `onLoadMore?`) 그대로 정의하되 로직은 상위 컨테이너(writer)가 주입.
- `components/main/RecommendSection.tsx:7-8, 25` — `LatestCharactersSection` import(구 8행)와 `<LatestCharactersSection />` JSX(구 27행) 제거. `EtcCharactersSection`, `CreateCharacterSection`, 짜릿모드 `invalidateData()` 훅은 원본 그대로 유지(미변경).

## 반응형 / 웹뷰 점검
- `LatestGridSectionView`는 `RankingGridSectionView`와 동일한 컨테이너/그리드 클래스를 그대로 재사용했으므로 반응형 특성도 동일하게 상속된다.
  - **360px**: `CardGrid`(`useSwiper=false`, `cardsPerRow` 기본 5) → `grid-cols-2`로 시작, 가로 스크롤 없음. 더 보기 버튼 `min-h-[44px]` + `px-6 py-2`로 터치 타깃 44px 이상 확보.
  - **768px**: `sm:grid-cols-3` → `md:grid-cols-4` 전환 구간, 헤더 텍스트(`text-2xl`)·안내 문구(`text-xs`) 줄바꿈 문제 없음.
  - **1280px**: `lg:grid-cols-5`, `container mx-auto px-4`로 중앙 정렬, 랭킹/남/여 탭과 시각적 일관성 유지.
- 웹뷰 고려: `SectionTransition`은 기존 랭킹 View와 동일 모션 컴포넌트를 재사용(신규 애니메이션 추가 없음). 새 창(`window.open`)·고정 높이(`100vh`) 등 웹뷰 위험 요소 없음(정적 카드 그리드 + 버튼).
- 빈 문자열/긴 캐릭터명 등 콘텐츠 방어는 `Card`/`CardGrid` 내부(기존 컴포넌트) 책임 — 이번 변경 범위 밖.

## 검증 결과
- `npx tsc --noEmit` — 통과(에러 없음). `LatestGridSectionView.tsx`가 아직 어디서도 import되지 않지만(컨테이너 미구현) 독립 컴파일 가능함을 확인.
- `npx biome check components/main/latest/LatestGridSectionView.tsx` — 통과(수정 사항 없음).
- `npx biome check components/main/RecommendSection.tsx` — CRLF 포맷 경고 1건, `onSearchTrigger` 미사용 파라미터 경고 1건 발생. `git diff`로 확인한 결과 두 이슈 모두 **이번 세션 이전부터 작업 트리에 존재하던 기존 이슈**이며(계획의 "CRLF 등 저장소 전반 기존 이슈는 무시" 지침에 해당), 내가 만든 변경(import 제거, JSX 1줄 제거)과 무관함. 이번에 새로 도입한 문제는 없음.

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- 계획과 달라진 점: 없음. 계획 1·4단계 마크업/문구/클래스를 그대로 따름.
- 로직 연결 필요(writer 담당 2·3단계에서 처리): `LatestGridSectionView`의 `characters`/`isLoading`/`hasMore`/`onLoadMore` props에 `UpdateharactersPaging(localAccum, 8, 8, page, 50)` 기반 로컬 state를 배선하는 `components/main/latest/LatestGridSection.tsx` 컨테이너 신설, 및 `views/main/home.tsx`에 '최신' 탭 항목과 `tab==='latest'` 분기 추가.
- 미완/후속: 5단계(`components/main/recommend/LatestCharactersSection.tsx` dead code 삭제)는 main 담당으로 남아 있음(현재는 `RecommendSection.tsx`에서 참조만 제거된 상태, 파일 자체는 존치).

## 추가 작업 (2026-07-21, 5단계 — 담당: main)
2·3단계(writer) 완료 후 main이 계획 5단계를 수행했다.
- **삭제**: `components/main/recommend/LatestCharactersSection.tsx` — 삭제 직전 grep 전수 재확인 결과 외부 참조 0건(파일 내부 자기 정의 3건만 매칭). `LatestCharacterSidebar.tsx`·`NewCharacterSidebar.tsx`는 계획대로 이번 범위에서 존치(死 코드 정리는 별건).
- **검증**: 삭제 후 `npx tsc --noEmit` 통과(에러 0). 이로써 계획 1~5단계 전체 완료.
