# 홈 '랭킹' 탭 신설 + 추천 탭 정리 — 구현 계획

- 작성 일자: 2026-07-21
- 대상 브랜치: `red-main` (파생 작업 브랜치 권장)
- 목표 한 줄 요약: 홈 네비 탭에 '랭킹' 탭(추천 옆 2번째)을 추가해 '캐릭터 랭킹'을 그리드 형태로 이관하고, 추천 탭에서 캐릭터 랭킹·작가 랭킹·앱 설치 섹션을 제거한다.

---

## 목표
홈(메인) 네비게이션에 '랭킹' 탭을 추천 바로 옆(2번째)에 신설하고, 기존 추천 탭의 '캐릭터 랭킹'을 '랭킹 더보기' API(`GetListRcmnd(9, ...)`) 기반 카드 그리드 + 기간 서브탭(실시간/일간/주간/월간)으로 이관하며, 추천 탭에서 캐릭터 랭킹·작가 랭킹·앱 설치 섹션과 관련 dead code를 제거한다.

## 확정 결정 (사용자 승인 완료 2026-07-21)
1. **성별 필터: 제거.** 랭킹 탭에는 기간 서브탭(실시간/일간/주간/월간)만 두고 성별 셀렉트는 넣지 않는다. `UpdateRankingTopCharacter('KR', topid, gender, true)` 호출 시 **gender는 전체=`4`로 고정**한다(코드 근거: `genderOptions` `{ value: 4, label: '전체' }` — `CharacterRankingSection.tsx:21`, `CharacterRankingSidebar.tsx:20`). `RankingGridSectionView` props에서 성별 관련 항목(`gender`/`onGenderChange`)은 두지 않는다.
2. **순위 뱃지: 표시.** 카드에 순위 번호(1·2·3…) 오버레이. 기존 랭킹 UI 구현을 재사용 — `CardGrid`에 **`hasRanking={true}`** 전달(`CardGrid.tsx:395-396` → `Card`의 `hasRank`/`rank={index+1}` 경로). 별도 신규 뱃지 마크업 불필요.
3. **작가 랭킹 store 로직: 유지(파일만 삭제).** 컴포넌트 파일 5종만 삭제하고 `store/useMainStoreData`의 작가 랭킹 페칭 로직(`UpdateRankingTopCreater`/`rankingCreaters`/`rankingCreatersSlide` + `initialize()`의 module_10 세팅)은 **주석 처리도 하지 않고 그대로 둔다.** 정리는 아래 '추후 별건 정리'로 이관.

## 현황 파악

### 탭 구조 / 라우팅
- `views/main/home.tsx:20-25` — `navigationTabs` = all(추천)/male/female/unknown, 모두 `shouldUpdateUrl:true`.
- `home.tsx:34` — `tabParam = searchParams.get('tab') || 'all'`.
- `home.tsx:94-104` — 2분기: `tab==='all'` → `<RecommendSection>`, else → `<CharacterGridSection categoryId={tabParam}>`.
- `home.tsx:84-90` — 메인 탭은 `<ButtonTabs variant='chip'>`(알약형).
- `components/elements/tabs/ButtonTabs.tsx:26-27,185-199` — `variant`: `'underline'`(기본, 밑줄+framer 인디케이터) / `'chip'`(알약). **주의**: `handleTabClick`→`updateUrlParams`가 `shouldUpdateUrl` 없으면 `params.delete('tab')` 수행(`ButtonTabs.tsx:106-111`) → 서브탭에 그대로 쓰면 상위 `?tab=ranking`을 지워버림. 또한 초기 활성탭을 `searchParams.get('tab')`에서 읽음(`:44,48`) → 서브탭이 상위 tab값을 잘못 읽음. **서브탭엔 URL 동기화를 꺼야 함.**

### '랭킹 더보기' 데이터 소스 (요구사항 #2 핵심)
- 추천 탭의 '캐릭터 랭킹' = `components/main/recommend/CharacterRankingSection.tsx`.
- '랭킹 더보기' 버튼(`CharacterRankingSection.tsx:85-90`) → `CharacterRankingSidebar` 오픈.
- `CharacterRankingSidebar.tsx:37,48,80,88` → `UpdateRankingTopCharacter('KR', topid, gender, isSlide=true)` 호출 → `rankingCharactersSlide`에 저장.
- 실구현: `store/useMainStoreData.ts:159-213` `UpdateRankingTopCharacter` → **`contentApi.GetListRcmnd(9, ranking_type, 1, 50, gender)`** (module_9, pageSize 50). `isSlide=true`면 `rankingCharactersSlide`, false면 `rankingCharacters`.
- **topid(ranking_type) 매핑**: 실시간=4, 일간=1, 주간=2, 월간=3 (`CharacterRankingSection.tsx:52`, `CharacterRankingSidebar.tsx:47`).
- **gender 값**: 전체=4, 남=1, 여=2, 모름=3. 본 계획은 성별 필터 미노출이므로 **gender=4(전체) 고정**.
- **결론**: 새 랭킹 탭은 `UpdateRankingTopCharacter('KR', topid, 4, /*isSlide*/ true)` 를 호출하고 `rankingCharactersSlide`(최대 50건)를 그리드로 렌더 → '랭킹 더보기'와 동일 API·동일 페이지크기.

### 그리드 레이아웃(남/여 탭과 동일)
- `components/main/CharacterGridSection.tsx:180` — `<CardGrid categoryId customData={characters} useSwiper={false} />` (cardsPerRow 기본 5, hasRanking 기본 false).
- `components/elements/card/CardGrid.tsx:378-401` — `useSwiper={false}`면 `grid getGridColumns()` 반응형 그리드. `hasRanking`이면 rank 뱃지(index+1).

### 제거 대상 & dead code 조사(grep 결과)
- **앱 설치 섹션**: `RecommendSection.tsx:39-81` 인라인 JSX (별도 컴포넌트 아님). 다른 사용처 없음.
- **CharacterRankingSection**: `RecommendSection.tsx:10,33`에서만 사용. (신규 랭킹 탭으로 로직 이관 후) 삭제 가능.
- **AuthorRankingSection**: `RecommendSection.tsx:8,36`에서만 사용 → 삭제 가능.
- **AuthorGrid** (`components/elements/card/AuthorGrid.tsx`): `AuthorRankingSection`에서만 사용(grep 전수 확인, tsx 2파일=정의+사용처) → 삭제 가능.
- **AuthorRankingSidebar**: `home.tsx:7,115`(열림 트리거 없는 死 인스턴스) + `AuthorRankingSection.tsx:5,111`에서만 사용 → 양쪽 제거 시 삭제 가능.
- **CharacterRankingSidebar**: `home.tsx:8,110`(死 인스턴스, setter true 호출 없음) + `CharacterRankingSection.tsx:6,128`에서만 사용 → 삭제 가능(신규 랭킹 그리드가 '더보기' 사이드바를 대체).
- **NewCharacterSidebar**: `home.tsx:9,120`(死 인스턴스) 외 `LatestCharactersSection.tsx`·`EtcCharactersSection.tsx`에서 사용 중 → **컴포넌트는 존치**, home.tsx의 死 인스턴스만 제거.
- **home.tsx의 3개 사이드바 상태**(`:40-42`)와 JSX(`:110-123`)는 모두 setter가 `false`로만 호출됨 → 전부 死 코드, 제거 대상.

## 접근 방식

### A. 데이터 페칭 — 기존 store 메서드 재사용 (권장)
요구사항이 "'랭킹더보기' API를 그대로"이므로 `useRecommendSectionStoreData().UpdateRankingTopCharacter(..., isSlide=true)` + `rankingCharactersSlide`를 재사용한다. CLAUDE.md는 신규 코드에 TanStack Query 훅을 권장하나, 해당 API 흐름이 이미 store의 `queryClient.fetchQuery`로 캡슐화돼 있어 **신규 훅을 만들면 중복**이 된다. → 최소 변경 원칙에 따라 store 메서드 재사용. (대안: 신규 `useRankingCharacters` 훅으로 axios 직접 호출 — 스펙과 무관한 신규 추상화라 비권장.)

### B. 서브탭 UI — 기존 `ButtonTabs variant='underline'` 재사용 + URL 동기화 차단 prop 추가 (권장)
메인 탭이 chip(알약)이므로 서브탭은 **underline(밑줄)** 이면 시각적 위계가 자연히 구분된다(기존 `CharacterRankingSection`도 default=underline 사용). 다만 `ButtonTabs`가 내부에서 상위 `?tab`을 읽고/지우는 문제가 있으므로 **가산적 prop `disableUrlSync?: boolean`(기본 false)** 를 추가해 서브탭에서는 (1) 초기 활성탭을 `searchParams`가 아닌 `defaultTabId`에서만 읽고 (2) 클릭 시 `updateUrlParams`를 건너뛰고 `onTabChange`만 호출하게 한다. 기본값 false라 기존 모든 사용처 동작 불변.
- 대안(세그먼트 컨트롤 신규 제작): 위계는 확실하나 신규 마크업 추가 → underline 재사용이 더 적은 변경. **underline 재사용 채택.**

### C. URL 파라미터 — `?tab=ranking&period=<realtime|daily|weekly|monthly>` (권장)
새로고침/공유 시 기간까지 복원되게 컨테이너가 `period` 파라미터를 `router.replace(scroll:false)`로 관리한다. `ButtonTabs`는 `tab`/`tags`만 다루므로 `period`는 컨테이너 소관(그래서 B의 `disableUrlSync` 필요). 성별은 필터 미노출이므로 URL·상태 모두 불필요(gender=4 고정).

## 실행 계획 (단계별)

> 파일 소유: 한 파일은 한 담당. 신규 컨테이너(`RankingGridSection.tsx`)=writer, 신규 표시용(`RankingGridSectionView.tsx`)=publisher, `RecommendSection.tsx`(마크업 제거)=publisher, `home.tsx`(라우팅/상태 배선)=writer, `ButtonTabs.tsx`(로직 prop)=writer, 파일 삭제=main.

1. **ButtonTabs에 `disableUrlSync` prop 추가** `[담당: writer]` — `components/elements/tabs/ButtonTabs.tsx`
   - `ButtonTabsProps`에 `disableUrlSync?: boolean`(기본 false) 추가.
   - 초기 상태(`:48` `initialTabId`): `disableUrlSync`면 `tabParam`을 무시하고 `defaultTabId || tabs[0]?.id` 사용.
   - `handleTabClick`(`:125`): `disableUrlSync`면 `updateUrlParams(...)` 호출 생략(태그 로직도 생략), `onTabChange`/`onTagSelect`만 호출.
   - 기존 사용처(메인 chip, 남/여 필터 등) 영향 0 — 기본값 false로 동작 동일. 회귀 확인 필수.

2. **랭킹 그리드 표시용(View) 컴포넌트 신설** `[담당: publisher]` — `components/main/ranking/RankingGridSectionView.tsx` (신규)
   - 순수 표시용: props로 받은 데이터/상태를 렌더. 내부 fetch/URL 로직 없음.
   - 레이아웃: `RecommendSection`/`CharacterGridSection`과 동일한 홈 폭 컨테이너 `mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]`.
   - 헤더: `🏆 캐릭터 랭킹` 타이틀(`text-2xl font-bold text-text-primary`) + 기간별 안내 문구(`text-xs text-text-muted`, 기존 `getRankingUpdateMessage` 문구 재사용).
   - 서브탭: `<ButtonTabs variant='underline' disableUrlSync tabs={periodTabs} defaultTabId={period} onTabChange={onPeriodChange} />`.
   - **성별 셀렉트 없음**(확정 #1). 헤더는 타이틀+서브탭만.
   - 그리드: `<CardGrid customData={characters} useSwiper={false} hasRanking={true} isLoading={isLoading} />` — 남/여 탭과 동일 그리드(`useSwiper=false`, cardsPerRow 기본 5) + **순위 뱃지(확정 #2, `hasRanking=true` → `Card`의 `rank={index+1}` 오버레이 재사용)**.
   - **props 인터페이스(연결 지점, writer가 채움)**:
     ```ts
     interface RankingGridSectionViewProps {
       characters: Character[];
       period: 'realtime' | 'daily' | 'weekly' | 'monthly';
       onPeriodChange: (period: string) => void;
       isLoading: boolean;
     }
     ```
   - 반응형/터치: 서브탭 44px 터치 타깃, `overflow-x-auto hide-scrollbar`(ButtonTabs 기본), 가로 스크롤 방지. 360/768/1280 확인.

3. **랭킹 그리드 컨테이너 신설(데이터/URL 배선)** `[담당: writer]` — `components/main/ranking/RankingGridSection.tsx` (신규)
   - `'use client'`. `period` = `searchParams.get('period')` (없으면 `'realtime'`). **성별 상태 없음 — gender=4(전체) 상수 고정**(확정 #1).
   - `const { rankingCharactersSlide, UpdateRankingTopCharacter } = useRecommendSectionStoreData();`
   - topid 매핑 유틸: realtime→4, daily→1, weekly→2, monthly→3.
   - mount 및 period 변경 시 `UpdateRankingTopCharacter('KR', topid, 4, /*isSlide*/ true)` 호출(로딩 상태 관리). 짜릿모드(`isAdultModeEnabled`) 변경 시 재조회 — 기존 패턴 참고.
   - `onPeriodChange`: 로컬 state + `router.replace('?tab=ranking&period=...', {scroll:false})`로 URL 동기화(기존 `searchParams` 병합).
   - `RankingGridSectionView`에 `characters={rankingCharactersSlide}`, `period`, `onPeriodChange`, `isLoading` 전달.
   - 서버상태를 별도 store에 중복 저장하지 않음(기존 `rankingCharactersSlide` 재사용).

4. **home.tsx — 랭킹 탭 추가 + 분기 + 死 사이드바 제거** `[담당: writer]` — `views/main/home.tsx`
   - `navigationTabs`(`:20`): 2번째 위치에 `{ id: 'ranking', label: '랭킹', shouldUpdateUrl: true }` 삽입.
   - 분기(`:94-104`)를 3분기로: `tab==='all'`→`<RecommendSection>`, `tab==='ranking'`→`<RankingGridSection>`, else→`<CharacterGridSection>`.
   - `import RankingGridSection` 추가.
   - 死 코드 제거: `isCharacterRankingSidebarOpen`/`isAuthorRankingSidebarOpen`/`isNewCharacterSidebarOpen` 상태(`:40-42`)와 세 사이드바 JSX(`:109-123`), 관련 import(`:7-9`) 삭제(모두 setter true 미호출로 검증됨).
   - `useSettingsStore` import가 미사용이면 함께 정리(확인 후).

5. **RecommendSection 정리(마크업 제거)** `[담당: publisher]` — `components/main/RecommendSection.tsx`
   - `<CharacterRankingSection/>`(+`#character-ranking-section` 래퍼, `:32-34`), `<AuthorRankingSection/>`(+`#author-ranking-section` 래퍼, `:35-37`), 앱 설치 섹션 JSX(`:39-81`) 제거.
   - 해당 import(`:8,10`) 제거. `LatestCharactersSection`·`EtcCharactersSection`·`CreateCharacterSection`은 유지.
   - 미사용 import 정리(`DivideCircle`, `Image` 등 앱설치 블록 전용이면 제거).

6. **dead code 파일 삭제** `[담당: main]`
   - `components/main/recommend/CharacterRankingSection.tsx`
   - `components/main/recommend/AuthorRankingSection.tsx`
   - `components/elements/card/AuthorGrid.tsx`
   - `components/elements/sidebar/AuthorRankingSidebar.tsx`
   - `components/elements/sidebar/CharacterRankingSidebar.tsx`
   - (전제: 4·5단계로 마지막 참조가 제거된 뒤 실행. 삭제 전 `grep`로 잔여 참조 0 재확인.)
   - **store `useMainStoreData`는 손대지 않는다**(확정 #3 — 작가 랭킹 페칭 로직 존치).

## 영향 범위 & 리스크
- **ButtonTabs(공용)**: 남/여 필터·검색·기타 다수에서 사용. `disableUrlSync` 기본 false 가산 변경이라 회귀 위험 낮으나, **기존 사용처 전수 회귀 확인 필요**(메인 chip 탭 URL 이동, 태그 선택 URL).
- **URL 스킴 변경**: `?tab=ranking&period=...` 신설. 기존 `?tab=male` 등 불변. 서브탭 클릭이 상위 `tab`을 지우지 않는지(=`disableUrlSync` 정상 동작) 반드시 확인.
- **`rankingCharactersSlide` 공유 상태**: 기존엔 사이드바가 쓰던 슬롯. 사이드바 제거 후 랭킹 탭 전용으로 사용 → 충돌 없음.
- **파일 삭제 5종**: 삭제 전 잔여 import 0 확인 필수(특히 배럴/인덱스 재노출 여부 grep). 롤백은 git revert.
- **작가 랭킹 store 잔존**: `UpdateRankingTopCreater`/`rankingCreaters*`가 호출부 없이 남지만(확정 #3) 빌드/타입엔 무해. 추후 별건 정리.
- **성인 모드**: 랭킹 API에 gender=4 고정으로 넘기고 nsfw 필터는 기존 CardGrid/데이터 브릿지 로직에 의존 — 기존과 동일하게 동작하는지 확인.

## 검증 방법
- `npx tsc --noEmit` 타입 통과, `npm run check`(biome lint+format) 통과.
- 수동 시나리오:
  1. 홈 진입 → 탭 순서가 추천/랭킹/남자/여자/성별모름인지.
  2. '랭킹' 클릭 → URL `?tab=ranking`, 캐릭터 랭킹 그리드가 남/여 탭과 동일 레이아웃 + **순위 뱃지(1·2·3…)** 로 렌더.
  3. 서브탭 실시간/일간/주간/월간 전환 → 데이터 갱신 + URL `period` 반영, **상위 `?tab=ranking` 유지**(사라지지 않음).
  4. `?tab=ranking&period=weekly`로 새로고침 → 주간 활성 복원.
  5. 랭킹 탭에 **성별 셀렉트가 없는지**(확정 #1) 확인.
  6. 추천 탭에 캐릭터 랭킹·작가 랭킹·앱 설치 섹션이 사라졌는지, 최신/기타/캐릭터 만들기 섹션은 유지되는지.
  7. 남/여 필터 탭 URL 이동·태그 선택이 여전히 정상(ButtonTabs 회귀).
- 반응형: 360/768/1280px에서 랭킹 그리드·서브탭 가로 스크롤/잘림 없음, 터치 타깃 44px.

## 추후 별건 정리 (이번 범위 밖)
- **작가 랭킹 store 로직 제거**(확정 #3): `store/useMainStoreData.ts`의 `UpdateRankingTopCreater`, `rankingCreaters`/`rankingCreatersSlide` 상태, `initialize()` 내 `module_10`(rankingCreaters) 세팅 및 관련 타입/브릿지(`bridgeModuleCreatorToCharacter`) — 컴포넌트 삭제 후 호출부 0이 되므로 별도 작업으로 안전 제거.

## 범위 밖 (하지 않을 것)
- 위 '추후 별건 정리'의 store 작가 랭킹 로직 제거(이번엔 존치, 주석도 달지 않음).
- `NewCharacterSidebar`/`EtcCharacterSidebar`/`LatestCharacterSidebar` 등 존치 컴포넌트 리팩터링.
- 랭킹 데이터 페칭을 TanStack Query 훅으로 신규 이관(기존 store 흐름 재사용).
- 랭킹 무한스크롤/더보기 페이징(현행 최대 50건 그대로).
- 랭킹 API 엔드포인트/페이지크기 변경, 성별 필터 기능.
