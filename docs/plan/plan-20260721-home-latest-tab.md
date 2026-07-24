# 홈 '최신' 탭 신설 + '지금 막 올라온 캐릭터' 섹션 제거 — 구현 계획

- 작성 일자: 2026-07-21
- 대상 브랜치: `red-main` (파생 작업 브랜치 권장)
- 목표 한 줄 요약: 홈 네비 '랭킹' 탭 옆에 '최신' 탭을 신설해 추천 탭의 '지금 막 올라온 캐릭터' 더보기 API(module_8)를 그리드로 이관하고, 추천 탭에서 해당 섹션을 제거한다.

---

## 목표
홈(메인) 네비게이션 '랭킹' 탭 바로 옆(3번째)에 '최신' 탭을 신설해, 추천 탭 '지금 막 올라온 캐릭터'의 '더 보기'가 쓰던 API(`UpdateLatestCharactersPaging` → `GetListRcmnd(8, ...)`)를 그대로 이용한 페이지네이션형 카드 그리드를 랭킹 탭과 동일한 레이아웃으로 구성하고, 추천 탭(`RecommendSection`)에서 `LatestCharactersSection`을 제거한다.

## 확인 필요 사항
- **'최신' 탭에 랭킹 뱃지/기간 서브탭 없음**을 전제로 계획한다(요구사항 명시대로 최신은 순위가 아니므로 `hasRanking` 미적용, 기간 서브탭 미적용, 페이지네이션 '더 보기' 중심). 만약 최신에도 서브탭/뱃지를 원하면 알려줄 것 — 현재 계획은 뱃지·서브탭 없음.

## 현황 파악

### 탭 구조 / 라우팅 (랭킹 탭 선행 작업 반영됨)
- `views/main/home.tsx:16-22` — `navigationTabs` = 추천(all)/랭킹(ranking)/남자(male)/여자(female)/성별모름(unknown), 모두 `shouldUpdateUrl:true`.
- `home.tsx:31` — `tabParam = searchParams?.get('tab') || 'all'`.
- `home.tsx:81-94` — 3분기 ternary: `all`→`<RecommendSection>`, `ranking`→`<RankingGridSection>`, else→`<CharacterGridSection>`.
- `home.tsx:70-78` — 메인 탭 `<ButtonTabs variant='chip'>`.
- `components/elements/tabs/ButtonTabs.tsx:40` — `disableUrlSync = false` prop 이미 병합됨(랭킹 서브탭용). 최신 탭엔 서브탭이 없으므로 이 prop 불필요.

### '지금 막 올라온 캐릭터' 더보기 데이터 소스 (요구사항 #2 핵심 — 실코드 추적 완료)
- 추천 탭 섹션 = `components/main/recommend/LatestCharactersSection.tsx`. `useRecommendSectionStoreData().latestCharacters`(module_8, 최대 10건, 스와이퍼)를 그리드로 표시.
- '더 보기' 버튼(`LatestCharactersSection.tsx:22-27`) → `LatestCharacterSidebar`(`moduleId={8}`) 오픈.
- `LatestCharacterSidebar.tsx:30-36` → `UpdateLatestCharactersPaging(moduleId=8, 1, currentPage, 50)` 호출 → `modules_sumSlide`에 누적 저장, 그리드 렌더(`:103-108`).
- 실구현 체인 (`store/useMainStoreData.ts`):
  - `UpdateLatestCharactersPaging(ranking_type, gender, page, pageSize)` (`:332-358`) — 내부에서 `get().modules_sumSlide`를 base로 `UpdateharactersPaging(currentData, /*module_id=*/8, ranking_type, page, pageSize)` 호출 후 `modules_sumSlide`에 set. **주의: 파라미터명이 오해소지 — 사이드바가 넘기는 첫 인자 `8`이 `ranking_type` 자리에 들어가고, 2번째 인자 `1`(gender)은 함수 내부에서 미사용.** 즉 실제 호출은 `UpdateharactersPaging(base, 8, 8, page, 50)`.
  - `UpdateharactersPaging(beforeDatas, module_id, ranking_type, page, pageSize)` (`:390-452`) — `contentApi.GetListRcmnd(module_id, ranking_type, page, pageSize, /*gender=*/0)` 호출 → 결과를 `beforeDatas`와 `id` 기준 **중복제거 병합**하여 반환(**store에 직접 set하지 않음, 반환만**).
- **결론(재사용 대상 API)**: 최신 탭 '더 보기'와 동일한 백엔드 호출은 `GetListRcmnd(8, 8, page, 50, 0)`. 이를 `UpdateLatestCharactersPaging(8, 1, page, 50)`(사이드바와 동일 시그니처) 또는 `UpdateharactersPaging(localAccum, 8, 8, page, 50)`(store 미오염, 반환값만 사용)로 호출할 수 있다.

### `modules_sumSlide` 공유 상태 조사 (리스크 확인)
- `modules_sumSlide`를 쓰는 tsx: `LatestCharacterSidebar.tsx`(module_8), `NewCharacterSidebar.tsx`(module_1, `UpdateLatestCharactersPaging(1,4,1,50)`).
- `NewCharacterSidebar`(컴포넌트)는 현재 어떤 tsx에서도 import되지 않음(grep 전수 — 지역변수 `isNewCharacterSidebarOpen`만 매칭, 실제 컴포넌트 마운트 없음) → **사실상 死 컴포넌트**.
- `LatestCharacterSidebar`는 `LatestCharactersSection.tsx`에서만 사용 → 요구사항 #3로 섹션 제거 시 **死 코드화**.
- ⇒ `modules_sumSlide`는 최신 탭 제외하면 사실상 활성 소비자 없음. 다만 향후 오염 방지를 위해 **최신 탭 컨테이너는 store 필드 구독 대신 반환값 기반 로컬 state 권장**(랭킹 컨테이너의 race-guard 선례와 통일 — `review-20260721-home-ranking-tab.md`).

### 랭킹 탭 재사용 자산 (선행 작업 산출물 — 최대 재사용)
- 컨테이너: `components/main/ranking/RankingGridSection.tsx` (writer, 존재 확인).
- 표시용: `components/main/ranking/RankingGridSectionView.tsx` (publisher, 존재 확인) — 헤더 + 기간 서브탭 + `CardGrid useSwiper={false} hasRanking` + '더 보기' 버튼(`min-h-[44px] px-6 py-2 rounded-full bg-primary-500`).
- `home.tsx`의 랭킹 배선 패턴(탭 배열 + ternary 분기).
- 콘텐츠 폭/모션: `SectionTransition` + `container mx-auto px-4` (Ranking View `:54-56`).

### 삭제 대상 & dead code 조사(grep 결과)
- `LatestCharactersSection` 사용처: `RecommendSection.tsx:9,27` 뿐(grep 전수). 제거 후 파일 삭제 가능.
- `LatestCharacterSidebar` 사용처: `LatestCharactersSection.tsx:3,42` 뿐 → `LatestCharactersSection` 삭제 시 死 코드화(단, 이번 범위에선 **존치** — 후술).

## 접근 방식

### A. 데이터 페칭 — `UpdateharactersPaging` 직접 호출 + 로컬 누적 state (권장)
최신 탭은 랭킹(top 50 일괄)과 달리 **서버 페이지네이션**(page 증가·병합)이 자연스럽다. `UpdateharactersPaging(localAccum, 8, 8, page, 50)`를 직접 호출해 반환된 병합 배열을 로컬 state에 담는다.
- 장점: `modules_sumSlide`(공유 store 필드)를 건드리지 않아 사이드바류와 오염·경합 없음. 랭킹 컨테이너의 requestIdRef race-guard 선례와 일관.
- '더 보기'와 **동일 백엔드 API**(`GetListRcmnd(8, 8, page, 50, 0)`) — 요구사항 "그대로" 충족.
- 대안 A': `UpdateLatestCharactersPaging(8, 1, page, 50)` + `modules_sumSlide` 구독 — 사이드바와 문자 그대로 동일하나 공유 store 필드 사용(오염 위험) → 비권장.
- 대안 A'': 신규 TanStack Query 훅 신설 — 스펙과 무관한 신규 추상화, 최소변경 위배 → 비권장.

### B. 표시용 컴포넌트 — 랭킹 View 재사용 대신 전용 `LatestGridSectionView` 신설 (권장)
`RankingGridSectionView`는 `period`/`onPeriodChange`가 **필수 prop**이고 기간 서브탭·`hasRanking`을 항상 렌더한다. 최신 탭엔 서브탭·뱃지가 없으므로:
- 전용 `LatestGridSectionView.tsx`를 신설하되 **랭킹 View의 검증된 마크업(컨테이너 폭·`SectionTransition`·CardGrid·더 보기 버튼)을 그대로 복제**하고 서브탭/`hasRanking`만 뺀다.
- 대안 B'(랭킹 View 일반화): `period` optional화 + 서브탭 조건부 렌더 → 랭킹 View에 두 목적이 섞여 결합도↑, 두 담당이 같은 파일을 만질 여지. → 전용 파일 분리 권장(한 파일 한 목적).

### C. URL — `?tab=latest` (period 없음)
최신 탭은 서브탭이 없으므로 `period` 등 추가 파라미터 불필요. `home.tsx`의 기존 `?tab=` 스킴만 확장.

## 실행 계획 (단계별)

> 파일 소유: 한 파일 한 담당. 신규 컨테이너 `LatestGridSection.tsx`=writer, 신규 표시용 `LatestGridSectionView.tsx`=publisher, `home.tsx`(배선)=writer, `RecommendSection.tsx`(마크업 제거)=publisher, 파일 삭제=main.

1. **최신 그리드 표시용(View) 신설** `[담당: publisher]` — `components/main/latest/LatestGridSectionView.tsx` (신규)
   - 순수 표시용, 자체 fetch/URL 없음. `RankingGridSectionView.tsx`의 레이아웃을 복제하되 **기간 서브탭(ButtonTabs) 블록과 `hasRanking`을 제거**한다.
   - 컨테이너: `<SectionTransition className='py-12 bg-surface'>` + `<div className='container mx-auto px-4'>` (랭킹 View와 동일).
   - 헤더: `<h2 className='text-2xl font-bold text-text-primary mb-1'>🌱 지금 막 올라온 캐릭터 🌱</h2>` + 안내 문구(`text-xs text-text-muted`, 예: '방금 등록된 따끈따끈한 캐릭터를 만나보세요!'). 서브탭·성별 셀렉트 없음.
   - 그리드: `<CardGrid customData={characters} useSwiper={false} isLoading={isLoading} />` (**`hasRanking` 미전달** → 순위 뱃지 없음, `cardsPerRow` 기본 5 → 남/여/랭킹 탭과 동일 반응형 그리드).
   - 빈 상태: `!isLoading && characters.length === 0` 시 안내 블록(랭킹 View의 빈 상태 톤 준용, 문구만 '최신' 맥락으로).
   - 더 보기 버튼: 랭킹 View(`:84-98`)의 버튼 마크업 그대로 복제(`min-h-[44px] px-6 py-2 rounded-full text-white bg-primary-500 hover:bg-primary-600`, `type='button'`, 로딩 중 disabled + '로딩 중...').
   - **props 인터페이스(연결 지점, writer가 채움)**:
     ```ts
     interface LatestGridSectionViewProps {
       characters: Character[];        // @/store/useStoreData
       isLoading: boolean;
       hasMore?: boolean;
       onLoadMore?: () => void;
     }
     ```
   - `'use client'` 미부착(표시용, 상위 컨테이너가 클라이언트 경계). named default export.
   - 반응형/터치: 360px `grid-cols-2` 시작·가로 스크롤 없음, 더 보기 버튼 44px 터치 타깃. 768/1280 확인.

2. **최신 그리드 컨테이너 신설(데이터/페이지네이션 배선)** `[담당: writer]` — `components/main/latest/LatestGridSection.tsx` (신규)
   - `'use client'`. `RankingGridSection.tsx` 구조를 참고(기간/gender/서브탭 로직은 제외).
   - `const { UpdateharactersPaging } = useRecommendSectionStoreData();`
   - 로컬 state: `characters: Character[]`, `isLoading`, `page`, `hasMore`. requestIdRef로 늦은 응답 가드(랭킹 선례).
   - 상수: `MODULE_ID = 8`, `RANKING_TYPE = 8`(더보기 실호출과 동일), `PAGE_SIZE = 50`.
   - mount 및 짜릿모드(`useSettingsStore().isAdultModeEnabled`) 변경 시: `page=1`부터 `UpdateharactersPaging([], 8, 8, 1, 50)` → 반환값을 `characters`로 set, `hasMore = 반환길이 >= PAGE_SIZE`(대략치) 판단.
   - `handleLoadMore`: `next=page+1`, `UpdateharactersPaging(characters, 8, 8, next, 50)` → 반환값으로 set. **반환 길이가 이전과 같으면(중복제거로 증가 없음) `hasMore=false`** 로 종료 판정(무한 로딩 방지).
   - `LatestGridSectionView`에 `characters`, `isLoading`, `hasMore`, `onLoadMore` 전달.
   - 서버상태를 별도 store에 중복 저장하지 않음(로컬 state만, `modules_sumSlide` 미사용).

3. **home.tsx — '최신' 탭 추가 + 분기** `[담당: writer]` — `views/main/home.tsx`
   - `navigationTabs`(`:16-22`): '랭킹' 다음(3번째)에 `{ id: 'latest', label: '최신', shouldUpdateUrl: true }` 삽입 → 추천/랭킹/최신/남자/여자/성별모름.
   - 분기(`:81-94`)에 `tab==='latest'` → `<LatestGridSection />` 추가(랭킹 분기 바로 뒤). ternary 중첩이 길어지면 매핑/조기 return으로 정리 가능(선택).
   - `import LatestGridSection from '@/components/main/latest/LatestGridSection';` 추가.

4. **RecommendSection 정리(마크업 제거)** `[담당: publisher]` — `components/main/RecommendSection.tsx`
   - `<LatestCharactersSection />`(`:27`) 제거, 해당 import(`:9`) 제거.
   - 유지: `EtcCharactersSection`, `CreateCharacterSection`, 짜릿모드 `invalidateData()` 훅(로직, 손대지 않음).
   - 제거 후 남는 섹션 여백은 각 섹션 자체 `py-*`에 의존(랭킹 선행 작업과 동일 구조) — 별도 마진 보정 불필요.

5. **dead code 파일 삭제** `[담당: main]`
   - `components/main/recommend/LatestCharactersSection.tsx` — 4단계로 마지막 참조 제거 후 삭제. 삭제 전 `grep`로 잔여 참조 0 재확인.
   - **`LatestCharacterSidebar.tsx`·`NewCharacterSidebar.tsx`는 이번 범위에서 존치**(死 코드지만 `moduleForTitleData`/store와 얽혀 있어 별건 정리 권장 — 아래 '범위 밖').

## 영향 범위 & 리스크
- **`home.tsx` 탭 배열 변경**: 탭 순서·분기만 추가. 기존 탭 URL/동작 불변. ternary 3→4분기 가독성 주의.
- **`modules_sumSlide` 공유 상태**: 권장안(A)은 이 필드를 건드리지 않으므로 오염 없음. 대안 A' 채택 시 死 사이드바(`Latest/NewCharacterSidebar`)와 필드 공유 → 비권장.
- **`RANKING_TYPE=8` 매직값**: '더 보기' 실호출을 그대로 복제한 값. 백엔드 module_8 최신 정렬 계약에 의존(기존과 동일). 값 변경 시 최신 정렬 깨질 수 있으니 주석 명시.
- **hasMore 판정**: 중복제거 병합 특성상 정확한 총건수를 알 수 없어 '반환 길이 증가 여부'로 근사. 마지막 페이지에서 더 보기 1회 헛클릭 후 종료될 수 있음(치명적 아님). 필요 시 '반환 length < 이전+PAGE_SIZE'로 보강.
- **파일 삭제**: `LatestCharactersSection.tsx` 삭제 전 잔여 import 0 확인(배럴/인덱스 재노출 없음 확인됨). 롤백은 git revert.
- **성인 모드**: 최신 데이터도 짜릿모드 변경 시 재조회(2단계 effect 의존성). CardGrid/브릿지의 nsfw 필터는 기존 로직 의존 — 남/여/랭킹 탭과 동일 동작하는지 확인.

## 검증 방법
- `npx tsc --noEmit` 통과, `npm run check`(biome) 통과.
- 수동 시나리오:
  1. 홈 진입 → 탭 순서 추천/랭킹/**최신**/남자/여자/성별모름.
  2. '최신' 클릭 → URL `?tab=latest`, module_8 최신 캐릭터가 남/여/랭킹 탭과 동일 그리드 레이아웃(**순위 뱃지 없음**)으로 렌더.
  3. '더 보기' 클릭 → 다음 페이지가 아래로 누적, 중복 없음, 마지막 페이지 이후 버튼 사라짐.
  4. 짜릿모드 토글 → 최신 목록 재조회(page 1 초기화).
  5. 추천 탭에서 '지금 막 올라온 캐릭터' 섹션이 사라지고 기타/캐릭터 만들기 섹션은 유지.
  6. 랭킹/남/여 탭 회귀 정상.
- 반응형: 360/768/1280px에서 최신 그리드·더 보기 버튼 가로 스크롤/잘림 없음, 터치 타깃 44px.

## 범위 밖 (하지 않을 것)
- `LatestCharacterSidebar`/`NewCharacterSidebar` 및 store `UpdateLatestCharactersPaging`/`modules_sumSlide`/`ClearLatestCharactersSlide`/`moduleForTitleData` 死 코드 정리(별건).
- 최신 탭에 기간 서브탭·순위 뱃지·성별 필터 추가.
- 데이터 페칭 TanStack Query 훅 신규 이관(기존 store 메서드 재사용).
- `RankingGridSectionView`/`RankingGridSection` 리팩터링·일반화.
