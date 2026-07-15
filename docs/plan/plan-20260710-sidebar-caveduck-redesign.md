# 좌측 데스크톱 사이드바 caveduck.io/ko 감성 리디자인 계획

- 작성 일자: 2026-07-10
- 대상 브랜치/커밋: `red-main` / `b6b8b3b`
- 목표 한 줄 요약: 로고를 Header 좌측으로 되돌리고, 데스크톱 좌측 사이드바를 caveduck 감성(확장형 세로 내비 + 가로 항목 + 활성 pill)으로 표시만 리디자인한다(기능/라우팅/게이팅 불변).

---

## 목표
데스크톱 좌측 사이드바(`DesktopSideNavView`)를 caveduck.io/ko 감성(아이콘+라벨 가로 배치, 활성 pill 하이라이트, 넓은 폭)으로 **표시만** 리디자인하고, 로고는 사이드바에서 제거해 Header 좌측에서 전 화면 노출되도록 복원한다. navConfig의 라우트/게이팅/모달 동작은 그대로 유지한다.

## 확인 필요 사항 (계획 확정 전, 단 아래 "접근 방식"의 권장안으로 선진행 가능)
- **결정적 구조 발견**: `Header`는 전역 셸이 아니라 **페이지별로** `main-content`(좌측 여백 `md:pl-32`) **안에서** 렌더된다(`components/layout/provideLayout.tsx:23`, `views/main/home.tsx:6`, 그 외 ~19개 파일). 즉 Header 배경은 사이드바 오른쪽(x=사이드바폭)부터 시작하며 **화면 전폭을 덮지 않는다**. 사이드바는 `AppShell`에서 `md:fixed md:inset-y-0`(top:0)로 최좌측 전체 높이를 차지한다.
  - 따라서 지시서의 "헤더(전폭, sticky z-50) 아래에서 사이드바 시작"은 현재 구조와 충돌한다. 진짜 상단 전폭 바 + 그 아래 사이드바(caveduck 정석 레이아웃)를 만들려면 **Header를 전역 셸로 승격**(페이지 ~19곳에서 `<Header/>` 제거 → 셸 1곳 마운트)해야 하며, 이는 큰 횡단 변경이라 "표시만 리디자인" 스코프를 벗어난다.
  - **질문**: 이번 작업에서 (A) 현재 구조 유지(최소 변경, 사이드바 top:0 최좌측 고정 + 헤더는 콘텐츠 상단, 로고는 콘텐츠 좌상단) 로 갈지, (B) Header 전역 승격까지 포함해 정석 top-bar 레이아웃으로 갈지. 별도 답이 없으면 **(A)로 진행하고 (B)는 후속 과제로 분리**한다(아래 접근 방식 권장안).

## 현황 파악
- `components/common/DesktopSideNavView.tsx:41` — 표시용 aside. 현재 `sticky top-0 hidden h-[100dvh] w-32 ... gap-10 border-r border-border-default bg-surface-sunken py-8 md:flex`. 상단 로고(`Image /images/logo.svg`, `:42`) + 세로 nav. 항목은 `flex-col items-center gap-2 min-h-[64px]`(아이콘 위 `h-8 w-8`, 라벨 아래 `text-base`), 활성=`text-brand`, 비활성=`text-text-muted`, `aria-current`(`:52`). props: `{ items: SideNavItemView[], onItemClick }`.
- `components/common/DesktopSideNav.tsx:33-63` — 컨테이너(writer). navConfig→items 매핑, 게이팅/라우팅/모달 분기, `/chat/[id]`에서 null(`:27`).
- `components/common/navConfig.ts:41-85` — 5항목(home `/`, chat `/chat-list`, create=action chatModeSelect, studio `/my-characters`, revenue `/my-account`) + `getActiveKey`(`:92`). **변경 없음.**
- `components/common/AppShell.tsx:30-35` — `<div className='md:fixed md:inset-y-0 md:left-0 md:z-40'><DesktopSideNav/></div>` + `<div id='main-content' className={cn('flex-1', showSideNav && 'md:pl-32')}>`. `app/layout.tsx:108-109`에서 마운트.
- `components/common/header.tsx:146-173` — `motion.header sticky top-0 z-[50] bg-surface-sunken`, 로고 Link가 `md:hidden`(`:156-158`)으로 데스크톱에서 숨겨져 있음(width 49/height 49, `h-10 w-auto`). 헤더 높이 근거: `container ... py-3`(`:152`, 상하 12px=24px) + 로고 `h-10`(40px) ≈ **약 64px**.
- `components/common/MobileGNB.tsx:63-113` — `md:hidden` 하단 5탭. navConfig 공유. **변경 없음(데스크톱 한정 작업).**
- 시맨틱 토큰(하드코딩 금지, 이 토큰만 사용): `tailwind.config.ts` — `surface`/`surface-sunken`/`surface-elevated`/`surface-elevated-hover`(`:48-51`), `border-default`(`:54`), `brand`/`brand-hover`(`:57-58`, alpha 유틸 `bg-brand/10` 사용 가능), `text-primary`/`text-muted`(`:108-109`).

## 접근 방식
### 레이아웃(top 오프셋 vs 셸 재구성) — 권장: **A안 = 현재 구조 유지(최소 변경)**
- **A안(권장)**: 사이드바는 지금처럼 `md:fixed inset-y-0`(top:0) 최좌측 전체 높이 유지. 로고만 사이드바에서 제거하고 Header 로고의 `md:hidden`을 제거해 콘텐츠 좌상단에 로고 복원. 사이드바 상단 여백(`py-*`)으로 첫 항목을 헤더 라인과 시각적으로 맞춘다.
  - 장점: 변경 파일 4개로 최소, "표시만 리디자인" 스코프 준수. 단점: 진짜 전폭 top-bar는 아님(로고가 화면 최좌상단이 아니라 콘텐츠 좌상단에 위치). caveduck의 "사이드바가 헤더 아래에서 시작"은 완전 재현되지 않음.
  - ⚠️ **사이드바를 `md:top-16`로 내리지 말 것**: Header가 콘텐츠 안(오른쪽)에만 있어 좌상단 헤더폭×사이드바폭 영역이 비어 어색해진다. 오프셋은 B안(헤더 전역 승격)과 세트여야 의미가 있다.
- **B안(후속 과제, 이번 스코프 밖 권장)**: `Header`를 `AppShell`/`layout`으로 승격해 전폭 sticky top-bar로 두고, 사이드바 wrapper에 `md:top-16` + 높이 `h-[calc(100dvh-4rem)]` 부여 → caveduck 정석. 단점: 페이지 ~19곳에서 `<Header/>` 제거 필요(횡단 변경), Footer 배치도 함께 검토 필요 → 별도 계획으로 분리.

### 폭 변경 계약(publisher ↔ writer 합의값, 하드코딩 방지)
- 라벨 가로 배치를 위해 폭을 **`md:w-60`(240px)** 로 확대하고 `AppShell`은 **`md:pl-60`** 로 정합. 두 파일이 반드시 동일 값(spacing-60=240px)을 참조한다. publisher가 폭을 조정하고 싶으면 이 문서의 계약값을 갱신하고 writer에게 알려 `pl` 동시 갱신(단독 변경 금지).

## 실행 계획 (단계별)
> 파일 소유: `DesktopSideNavView.tsx`=publisher / `AppShell.tsx`·`header.tsx`·(필요 시)컨테이너=writer. 한 파일 한 담당, 동시 수정 없음.

1. **사이드바 View caveduck 리디자인** `[담당: publisher]` — `components/common/DesktopSideNavView.tsx`
   - 로고 제거: `Image` import(`:15`)와 로고 `<Image>`(`:42`) 삭제. (로고는 Header로 이관 — 3단계.)
   - aside 폭 `w-32` → **`w-60`**(계약값 240px), `items-center gap-10` → `items-stretch`(가로 pill이 폭을 채우도록), 좌우 패딩 `px-3`, 상단 여백은 헤더 라인과 맞추도록 `py-*` 조정(정확한 값은 publisher 재량). `sticky top-0 h-[100dvh] shrink-0 border-r border-border-default bg-surface-sunken md:flex hidden`는 유지.
   - nav 항목을 **가로 배치**로: 버튼을 `flex-col items-center min-h-[64px]` → `flex-row items-center gap-3 w-full px-3 py-3 rounded-full`(pill 반경은 재량, `rounded-xl`~`rounded-full`). 아이콘 `h-8 w-8` → `h-5 w-5`~`h-6 w-6`, 라벨 `text-base text-left`(중앙정렬 해제), `whitespace-nowrap` 유지.
   - **활성 pill 하이라이트**: 활성 = `bg-brand text-white` 또는 `bg-brand/10 text-brand`(재량, 시맨틱 토큰만). 비활성 = `text-text-muted hover:bg-surface-elevated-hover`. `aria-current`(`:52`) 유지. focus-visible outline 유지. hover/active/터치 44px 이상 유지(`py-3`로 확보).
   - 항목 간 여백 여유: `nav` `gap-8` → `gap-1`~`gap-2`(pill 간 간격, 재량).
   - `SideNavItemView` 주석의 "세로 배치/아이콘 하단" 문구(`:21`)를 가로 배치로 갱신. **props/타입 시그니처는 불변**(컨테이너 계약 유지).
   - 반응형: `md:` 미만 숨김 유지. 240px 폭에서 라벨(최장 "내 작업실") 줄바꿈 없이 표기되는지 확인.

2. **AppShell 좌측 여백 정합** `[담당: writer]` — `components/common/AppShell.tsx:33`
   - `md:pl-32` → **`md:pl-60`**(1단계 폭 계약과 일치). `showSideNav && 'md:pl-60'` 형태 유지. `md:fixed md:inset-y-0 md:left-0 md:z-40` wrapper 및 `/chat/[id]` 분기(`:26`)는 불변. **A안이므로 `md:top-*` 오프셋 추가하지 않음.**

3. **Header 로고 복원** `[담당: writer]` — `components/common/header.tsx:156-158`
   - 로고 `Link`의 className에서 **`md:hidden` 제거**(전 화면 노출). 나머지(`text-xl font-bold text-brand-hover mr-10`, onClick, `Image` 속성)는 불변. `:154-155`의 "데스크톱은 사이드바가 로고 담당" 주석을 "로고는 Header 전용" 취지로 갱신.
   - 담당 근거: `header.tsx`는 `'use client'` 상태/핸들러가 얽힌 컨테이너(writer 소유)이고, 변경은 클래스 1개 제거로 소규모 → 한 파일 한 담당 원칙상 writer가 처리(publisher가 별도로 이 파일을 건드리지 않게).

4. **(선택) 컨테이너 주석 정합** `[담당: writer]` — `components/common/DesktopSideNav.tsx`
   - 코드 로직 변경 없음. items 매핑/게이팅/모달 분기 그대로. 필요 시 주석만 최신화(생략 가능).

## 영향 범위 & 리스크
- **변경 파일(A안)**: `DesktopSideNavView.tsx`(publisher), `AppShell.tsx`·`header.tsx`(writer) — 최소 3~4개.
- **폭 확대 파급(240px)**:
  - `AppShell md:pl-60` 미정합 시 콘텐츠가 사이드바 아래로 겹침 → 2단계에서 반드시 동시 반영.
  - Header는 `main-content`(pl-60) 안에 있어 함께 우측으로 밀림 → **768px에서 콘텐츠 폭 528px**. Header 우측 컨트롤(세이프티 토글 `w-20`+라벨, 상점/알림/내정보/장바구니 아이콘)이 좁아져 줄바꿈/가로 스크롤 위험 → QA 필수. 위험 시 폭을 `w-56`(224px)로 낮추는 대안(계약값 함께 갱신).
- **로고 중복 방지**: 사이드바 로고 제거(1단계)와 Header `md:hidden` 제거(3단계)는 **세트**. 한쪽만 반영되면 로고 중복 또는 로고 소실.
- **MobileGNB / navConfig / 게이팅·모달**: 변경 없음. 데스크톱 한정.
- **롤백**: 세 파일의 클래스/JSX 되돌리면 원복. 로직 변경이 없어 리스크 낮음.
- **caveduck 시각 재현 제약(리스크)**: caveduck.io/ko는 SPA라 정확한 픽셀(폭/pill 반경/간격/색)을 정적으로 확인하기 어렵다. 애매한 시각 디테일은 **publisher가 프로젝트 시맨틱 토큰과 기존 컴포넌트 관행에 맞춰 결정**한다(하드코딩 HEX 금지).
- **레이아웃 정석 미달(A안 한계)**: 로고가 화면 최좌상단이 아닌 콘텐츠 좌상단에 위치, 사이드바 top이 헤더와 같은 높이에서 시작. 정석 top-bar가 필요하면 B안(Header 전역 승격) 후속 진행.

## 검증 방법
- 타입/린트: `npx tsc --noEmit`, `npm run lint`.
- 수동(다크모드 기준) — 360px: 사이드바 숨김, MobileGNB 정상, Header 로고 노출, 가로 스크롤 없음.
- 768px: 사이드바 240px 노출 + 콘텐츠 정합(`pl-60`), Header 우측 컨트롤 잘림/줄바꿈/가로 스크롤 없음(핵심 점검), 로고 노출.
- 1280px: 사이드바 pill 정렬, 활성 항목 pill 하이라이트 + `aria-current`, hover/focus 상태, 각 항목 라우팅/게이팅/모달(만들기=chatModeSelect) 정상.
- 활성 판정: 홈/`/chat-list`/`/my-characters`/`/my-account` 이동 시 해당 pill 활성. `/chat/[id]`에서 사이드바 숨김 유지.

## 후속 (별도 과제)
- **B안**: Header 전역 셸 승격 → 전폭 top-bar + 사이드바 `md:top-16` 오프셋(caveduck 정석). ~19개 페이지의 `<Header/>`/Footer 배치 정리 필요 → 별도 plan.
- 시각 QA: 브레이크포인트(360/768/1280), 헤더-사이드바 상단 정렬, active pill 대비/명도, 라벨 최장("내 작업실") 줄바꿈 여부.

## 범위 밖 (하지 않을 것)
- navConfig 항목/라우트/게이팅/모달 로직 변경.
- Header 우측 컨트롤(세이프티/상점/알림/내정보/장바구니)의 사이드바 이관.
- MobileGNB / 모바일 레이아웃 리디자인.
- Header 전역 승격(B안) 및 사이드바 top 오프셋(A안에서는 미적용).
