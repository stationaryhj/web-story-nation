# 홈 칩 탭 모바일 1행(가로 스크롤) 반응형 개선 계획

- 작성 일자: 2026-07-24
- 대상 브랜치/커밋: `red-main` / `6eb151d`
- 목표 한 줄 요약: 홈 칩 탭을 `md`(768px) 미만에서는 1행+가로 스크롤, `md` 이상에서는 현행 2행 고정+가로 스크롤로 반응형 분기한다.

## 목표
홈(`views/main/home.tsx`)의 `ButtonTabs variant='chip'`을, 왼쪽 사이드바가 하단 GNB로 바뀌는 `md`(768px) 미만에서는 **한 줄에 모두 배치하고 넘치면 가로 스크롤**로, `md` 이상에서는 **기존 2행 고정 + 가로 스크롤**을 유지하도록 반응형 분기한다.

## 현황 파악
- `components/elements/tabs/ButtonTabs.tsx:180-182` — chip은 `chipRowSplit = Math.ceil(tabs.length / 2)`로 배열을 앞/뒤 절반(`chipTopRow`/`chipBottomRow`)으로 **JS slice** 분할.
- `components/elements/tabs/ButtonTabs.tsx:223-239` — 바깥 `relative flex overflow-x-auto hide-scrollbar [-webkit-overflow-scrolling:touch]` 컨테이너 안에서 chip은 `flex flex-col items-start gap-[14px]`로 두 행(`flex w-max gap-[14px]`)을 세로 스택 → 함께 가로 스크롤. underline은 `flex space-x-4 md:space-x-8`.
- `components/elements/tabs/ButtonTabs.tsx:185-215` — `renderTabButton(tab, index)`가 버튼 마크업/로직 공유. chip 버튼은 `h-[45px] min-w-[119px] shrink-0 ... rounded-full`(터치 타겟 45px 충족).
- `components/elements/tabs/ButtonTabs.tsx:72-73` — 인디케이터 effect는 `variant !== 'underline'`이면 즉시 `return`. **chip은 `tabsRef`를 전혀 읽지 않는다** → chip 버튼 DOM이 중복 렌더돼도 인디케이터/포커스 로직에 영향 없음(핵심 근거).
- `views/main/home.tsx:50` — `tabs = [...navigationTabs(7개), ...tagTabs(최대 10개)]` = 최대 17개. `home.tsx:89-96`에서 `variant='chip'`, `className='max-w-full'` 전달.
- `views/main/home.tsx:44-49` — 태그 랭킹 로딩/실패 시 `tagTabs=[]` 폴백 → 정적 7칩만.
- `components/common/AppShell.tsx:39` — 데스크톱 사이드 레일 `hidden md:...md:block`, 본문 `md:pl-20`. 즉 사이드바↔GNB 전환 기준은 **`md`(768px)**.
- 기존 훅: `hooks/useMediaQuery.ts` 존재(초기값 `false`, SSR 안전). `components/elements/card/CardGrid.tsx:83`에서 `useMediaQuery('(max-width: 768px)')`로 이미 사용 중.
- `variant='chip'` 실제 사용처는 `views/main/home.tsx` 1곳뿐(문서 제외 소스 기준 재확인 완료). `underline` variant는 이번 변경과 무관.

## 접근 방식
세 후보 비교:

- **(a) CSS 전용 이중 렌더 — 추천.** chip일 때 1행 블록(`flex md:hidden`)과 2행 블록(`hidden md:flex`)을 **둘 다 렌더**하고 CSS로 전환. 1행 블록은 `tabs.map` 단일 나열, 2행 블록은 기존 slice 구조 유지.
  - 장점: SSR 안전(하이드레이션 미스매치·플래시 없음), JS 로직 0, **ButtonTabs.tsx 한 파일·publisher 단독** 처리, home.tsx/훅 변경 불필요.
  - "DOM 중복 → tabsRef 인덱스/포커스 문제" 우려는 **chip이 tabsRef를 읽지 않으므로 무해**(현황 근거). `md:hidden`/`hidden` 쪽은 `display:none`이라 포커스·AT 대상에서 제외됨.
  - 유일 비용: 숨겨진 칩 DOM 중복(최대 17개 × 2). 경량 버튼이라 성능 영향 미미.
- (b) JS 분기(`useMediaQuery('(max-width: 768px)')`): 단일 렌더로 DOM 중복 없음. 그러나 훅 초기값 `false` → 모바일 첫 렌더가 2행으로 그려졌다가 1행으로 튀는 **플래시** 발생, 표시용 컴포넌트에 로직 유입, writer/publisher 담당 분리 필요. 이 케이스엔 과함.
- (c) CSS만으로 마크업 재구성(단일 컨테이너 wrap/grid): 과거 `grid-flow-col` 지그재그 순서 문제로 기각된 이력(publish-20260722-home-tag-ranking-tabs.md ④). "행 우선 + 2행 고정 + 가로 스크롤"을 CSS 단독으로 만들 수 없어 배열 분할로 간 경위 → 재현 불가.

**결론: (a) 채택.** 최소 변경, 무플래시, 단일 담당(publisher), 기존 2행 로직 그대로 재사용.

## 실행 계획 (단계별)

1. **chip 렌더를 반응형 이중 블록으로 분기** `[담당: publisher]` — `components/elements/tabs/ButtonTabs.tsx:224-234` (chip 분기 JSX)만 수정. 왜: `md` 기준으로 1행/2행 레이아웃을 CSS로 전환하기 위해.
   - 세부 작업:
     - 기존 `chipRowSplit`/`chipTopRow`/`chipBottomRow` 계산(`:180-182`)과 `renderTabButton`(`:185-215`)은 **그대로 재사용**.
     - chip 분기(`variant === 'chip' ? (...)`)를 다음 두 블록의 Fragment로 교체:
       - 모바일(1행): `<div className="flex md:hidden w-max gap-[14px]">{tabs.map((tab, i) => renderTabButton(tab, i))}</div>`
       - `md` 이상(2행, 현행 유지): `<div className="hidden md:flex flex-col items-start gap-[14px]">` 안에 기존 `chipTopRow`/`chipBottomRow` 두 행(`flex w-max gap-[14px]`) 구조를 그대로 이식.
     - 바깥 컨테이너(`:223` `relative flex overflow-x-auto hide-scrollbar [-webkit-overflow-scrolling:touch]`)는 **변경 없음** — 1행/2행 어느 쪽이든 이 컨테이너가 가로 스크롤을 담당.
     - 주석(`:219-222`, `:178-179`)을 신규 동작(모바일 1행 / md+ 2행)에 맞게 갱신.
   - 재사용: `renderTabButton`, slice 계산, 스크롤 컨테이너, 칩 스타일 전부 재사용. 신규 생성물 없음.
   - underline 분기(`:235-238`)·인디케이터(`:241-251`)·해시태그(`:255-272`)는 **무수정**.

## 영향 범위 & 리스크
- 변경 파일: `components/elements/tabs/ButtonTabs.tsx` 1곳(chip 분기 JSX + 주석). `home.tsx`·훅·store·API 무변경.
- 파급: `variant='chip'` 사용처는 `home.tsx` 1곳 → 홈 탭만 영향. `underline` 사용처(랭킹 서브탭 등)는 코드 경로가 분리돼 영향 없음.
- 리스크(낮음):
  - 숨겨진 칩 DOM 중복(최대 17×2) — 경량 버튼이라 성능 영향 미미. 접근성상 `display:none` 쪽은 포커스/AT 제외.
  - `tabsRef` 인덱스 중복 write 발생하나 chip은 tabsRef 미사용 → 무해(현황 근거). 우려되면 chip 렌더 시 ref 콜백 스킵도 가능하나 불필요.
  - 롤백: 단일 파일·JSX 국소 변경이라 diff 되돌리기만으로 원복.

## 검증 방법
- 타입/린트: `npx tsc --noEmit`, `npm run lint`.
- 수동(반응형):
  - 360px: 칩이 **1행**으로만 배치, 넘치는 칩은 가로 스크롤로 접근, **페이지 자체 가로 스크롤(overflow-x) 없음**, 터치 스크롤(-webkit-overflow-scrolling) 동작.
  - 768px·1280px: **2행 고정 + 가로 스크롤** 현행 유지, 행 우선(1행 왼→오 → 2행 왼→오) 순서 유지.
  - 767px↔768px 경계에서 1행↔2행 전환, 리사이즈 시 플래시/깜빡임 없음.
  - 시나리오: 17칩(정적 7 + 태그 10) / 7칩(태그 폴백) 모두 확인.
  - 터치 타겟: 칩 높이 45px 유지.
  - 탭 클릭 시 활성 스타일(`bg-brand text-white`)·URL 동기화·`onTabChange` 정상 동작(모바일/데스크톱 양쪽 블록에서).

## 범위 밖 (하지 않을 것)
- `underline` variant 및 그 사용처 변경.
- `home.tsx` 탭 정의/데이터 페칭/라우팅 로직 변경.
- `useMediaQuery` 훅 도입(접근안 b 미채택).
- 칩 스타일 토큰/색상, 스크롤바 표시 방식, 태그 랭킹 API 변경.
