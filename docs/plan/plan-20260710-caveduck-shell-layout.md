# caveduck식 셸 레이아웃 재구성 계획 (전폭 Top bar + 좁은 아이콘 레일 + 여백 콘텐츠)

- 작성 일자: 2026-07-10
- 대상 브랜치/커밋: `red-main` / `b6b8b3b`
- 목표 한 줄 요약: Header를 전역 셸로 승격해 전폭 sticky top-bar로 두고, 좌측 사이드바를 좁은 아이콘 레일(≈w-20, 아이콘 위/라벨 아래·활성 채움 하이라이트)로 되돌리며, 콘텐츠에 caveduck식 좌우 여백을 부여한다. (기능/IA/navConfig 불변)

---

## 목표
caveduck.io 화면 구조 = `[전폭 Top bar] / [좁은 아이콘 레일 사이드바(top bar 아래) | 좌우 마진 있는 중앙 콘텐츠]` 로 StoryNation 셸을 재구성한다. 사이드바 항목·라우팅·게이팅은 현재 navConfig 그대로 유지하고, 표시 구조와 Header 마운트 위치(전역 승격)만 바꾼다.

## 현황 파악
- `components/common/AppShell.tsx:27-41` — 전역 셸. `<div md:fixed md:inset-y-0 md:left-0 md:z-40><DesktopSideNav/></div>` + `<div id=main-content flex-1 md:pl-60>`. `showSideNav`는 `/chat/[id]`에서 false. `app/layout.tsx:108-109`의 `div.flex min-h-screen flex-col` 안에서 마운트. **Header는 여기 없음(페이지별 렌더).**
- `components/common/DesktopSideNavView.tsx:40-70` — 표시용(dumb). 현재 `sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col items-stretch ... py-6 md:flex`, 항목은 **가로 배치**(`flex items-center gap-3 rounded-full px-4 py-3`), 활성=`bg-brand text-text-inverse` pill. props `{ items: SideNavItemView[]; onItemClick }` (View는 로직 타입 비의존).
- `components/common/DesktopSideNav.tsx:20-66` — 컨테이너(로직). navConfig→items 매핑, 게이팅/라우팅/모달 분기, `/chat/[id]`에서 `null`(`:27`).
- `components/common/navConfig.ts:41-85` — 5항목(home `/`, chat `/chat-list`, create=action chatModeSelect, studio `/my-characters`, revenue `/my-account`) + `getActiveKey`(`:92`). **불변.** MobileGNB와 공유.
- `components/common/MobileGNB.tsx:63-113` — `md:hidden` 하단 5탭. 항목이 **아이콘 위+라벨 아래 세로 배치**(`flex flex-col items-center justify-center`, `Icon w-5 h-5`, `span text-[10px] mt-1`) — **레일 세로 배치의 재사용 참조 패턴**. `/chat/[id]`에서 null(`:35`). 불변.
- `components/common/header.tsx:144-267` — `motion.header sticky top-0 left-0 right-0 z-[50] bg-surface-sunken`. 내부 래퍼 `container mx-auto px-4 py-3 flex items-center justify-between`(`:152`). 좌측 로고 Link(`:157-173`, `Image h-10`), 우측 컨트롤(세이프티 토글 `SimpleToggle`, 상점, 알림 `NotificationButton`, 내정보(md), 장바구니(sm), 햄버거(md:hidden→`setIsSidebarOpen`)). `<HeaderSidebar/>`(모바일 사이드바) 동반 렌더(`:254`). **props 없음**(prop-less default export). 헤더 높이 ≈ py-3(24px)+로고 h-10(40px) = **약 64px = 4rem**.
- `components/layout/provideLayout.tsx:8,14,23` — `Header`를 props 주석(모두 비활성)과 함께 렌더. **어디에서도 import되지 않는 dead code**(grep 전수 확인: 자기 파일 외 참조 없음). → 이번 스코프 밖(수정 불필요).
- Header 페이지별 렌더처(전수, 정리 대상 16곳): `views/main/home.tsx:73`(`<main>` 내부, 아래 `container mx-auto px-4`), `views/chat-list/home.tsx:403`(`div.flex-col min-h-screen` 내부, `<main class=flex-grow>` 위), `views/search/home.tsx:200`, `src/views/my-characters/edit/ui/Edit.tsx:43`, `app/(routes)/author/[id]/page.tsx:17`, `app/(routes)/my-profile/page.tsx:27`, `app/(routes)/live/page.tsx:10`, `app/(routes)/my-characters/page.tsx:9`, `app/(routes)/my-account/page.tsx:7`(`<><Header/><View/></>`), `app/(routes)/my-characters/create/page.tsx:7`, `app/(routes)/shop-recharge/page.tsx:8`(`<><Header/><View/></>`), `app/(routes)/settings/page.tsx:14`, `app/(routes)/payment/page.tsx:37`, `app/(routes)/payment/success/page.tsx:181`, `app/(routes)/payment/fail/page.tsx:95`. **비라우트 백업**: `app/(routes)/payment/page-origin.tsx:75`(`page-origin`은 Next 라우트가 아님 → dead, 스코프 밖). **몰입형 유지**: `views/chat/home.tsx:4`(Header 이미 주석처리 — 손대지 않음).
- Footer 렌더처(페이지 유지 대상): `views/main/home.tsx`, `views/chat-list/home.tsx`, `views/chat/home.tsx`, `app/(routes)/payment/{page,success,fail,page-origin}.tsx`. → **Footer는 셸로 이관하지 않고 페이지별 유지**(현재 페이지마다 유무가 달라 전역화 시 회귀 위험).
- 시맨틱 토큰(하드코딩 HEX 금지): `tailwind.config.ts` — `surface`/`surface-sunken`/`surface-elevated-hover`, `border-default`, `brand`/`brand-hover`(alpha 유틸 `bg-brand/10` 가능), `text-primary`/`text-muted`/`text-inverse`.

## 접근 방식
### 핵심: Header 전역 승격(B안) + 좁은 레일 되돌림 + 콘텐츠 여백
1. **Header 전역 승격** — `<Header/>`를 `AppShell` 최상단에 1회 마운트(전폭 sticky top-bar), 16개 페이지에서 `<Header/>` 제거. Header는 prop-less이므로 이관에 인자 배선 불필요(연결 지점: `export default function Header()` 시그니처 유지).
2. **셸 오프셋** — 레일 wrapper를 `md:top-16`(헤더 4rem 아래)에서 시작, `md:bottom-0`까지. 본문은 `md:pl-20`(레일 폭 보정). Header는 전폭이라 pl 불필요(본문만 레일 폭 보정).
3. **레일 되돌림** — View를 `w-60` 가로 pill → **`w-20` 세로(아이콘 위/라벨 아래)·활성 채움 하이라이트(둥근 사각)** 로. MobileGNB 세로 패턴 재사용.

### 콘텐츠 좌우 마진 — 권장: **페이지 기존 컨테이너 유지(셸은 레일 오프셋만)**
- 대부분 페이지가 이미 `container mx-auto px-4`로 중앙 정렬 컨테이너를 갖는다(`views/main/home.tsx:76`, `views/chat-list/home.tsx:406` 등). 이 컨테이너가 `md:pl-20`된 main-content 영역 안에서 `mx-auto`로 중앙 정렬되면 caveduck식 "레일 오른쪽 영역에서 좌우 대칭 여백"이 그대로 재현된다.
- **대안 A(비권장)**: 셸 main-content에 `max-w-* mx-auto px-*` 래퍼 추가 → 페이지의 `container mx-auto`와 이중 래핑되어 콘텐츠가 과도하게 좁아지고 페이지별 편차 발생. 16개 페이지 컨테이너를 걷어내야 해 스코프 폭증.
- **결론**: 셸은 `md:pl-20`(레일 오프셋)만 담당, 좌우 마진은 페이지의 기존 `container mx-auto` 관행에 위임(CLAUDE.md "주변 컨테이너 관행을 따른다"). Header 내부는 컨테이너 해제(전폭)로 로고 far-left / 컨트롤 far-right 정렬.

### 폭 계약(publisher ↔ writer 합의값, 단독 변경 금지)
- 레일 폭 = **`w-20`(80px)**, 본문 보정 = **`md:pl-20`**. 헤더 높이 = **4rem**(레일 `md:top-16`). 세 값은 세트. publisher가 레일 폭을 조정하려면 이 문서 계약값을 갱신하고 writer에게 알려 `pl` 동시 갱신.

## 실행 계획 (단계별)
> 파일 소유(한 파일 한 담당, 동시 수정 없음): `DesktopSideNavView.tsx`·`header.tsx` = **publisher** / `AppShell.tsx`·16개 페이지·컨테이너 = **writer**.
> 연결 지점: (1) `Header` = prop-less default export 유지(writer가 `<Header/>`만 마운트). (2) 레일 wrapper(writer)가 위치/높이 담당, 레일 aside(publisher)는 `h-full w-20`로 채움. (3) 폭 계약 `w-20`/`pl-20`.

### 1. 레일 View 되돌림 + caveduck 스타일 `[담당: publisher]` — `components/common/DesktopSideNavView.tsx`
- aside: `w-60` → **`w-20`**, `flex-col items-stretch py-6` 유지하되 정렬을 세로 아이콘용으로. `sticky top-0 h-[100dvh]` → **`h-full`**(위치·높이는 셸 wrapper가 fixed로 담당 — 2단계 계약). `hidden md:flex shrink-0 border-r border-border-default bg-surface-sunken` 유지.
- nav 항목 버튼: 가로(`flex items-center gap-3 rounded-full px-4`) → **세로(`flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2`)**. 아이콘 `h-5 w-5`(유지~`h-6 w-6` 재량), 라벨 `text-[10px]~text-xs mt-0.5 text-center whitespace-nowrap`(MobileGNB `:94` 패턴 참조). 터치 타깃 최소 44×44 확보(세로 스택 높이로).
- 활성 하이라이트: **둥근 사각 채움**(`bg-brand text-text-inverse rounded-2xl`, 반경 재량 `rounded-xl~2xl`). 비활성 `text-text-muted hover:bg-surface-elevated-hover active:bg-surface-elevated-hover`. `aria-current='page'`·focus-visible outline 유지.
- 항목 간 간격 `gap-1`(재량). 좌우 패딩 `px-2`(80px 폭에 맞게 축소).
- `SideNavItemView`/`DesktopSideNavViewProps` 시그니처 **불변**(컨테이너 계약 유지). 주석의 "가로 배치" 문구를 "세로(아이콘 위/라벨 아래)"로 갱신.
- 반응형: `md:` 미만 숨김 유지. 80px 폭에서 최장 라벨("내 작업실") 표기 방식 결정(줄바꿈 허용 또는 축약 — publisher 재량, 가로 스크롤 금지).

### 2. AppShell 셸 재구성 (Header 마운트 + 레일 오프셋) `[담당: writer]` — `components/common/AppShell.tsx`
- `import Header from './header'` 추가, 반환 최상단에 `<Header/>` 마운트.
- 몰입형 분기 확장: 기존 `showSideNav`를 `isImmersive = pathname?.startsWith('/chat/') && pathname !== '/chat-list'` 기준으로 정리해 **Header·레일·본문 pl 모두** 조건 적용. `/chat/[id]`에서는 `<Header/>` 미렌더(몰입형), 레일 미렌더, 본문 `md:pl-20` 미적용.
- 레일 wrapper: `md:fixed md:inset-y-0` → **`hidden md:block md:fixed md:top-16 md:bottom-0 md:left-0 md:z-40`**(헤더 4rem 아래 시작, z는 Header `z-50` 아래). 내부 `<DesktopSideNav/>` 불변.
- 본문: `md:pl-60` → **`md:pl-20`**(폭 계약). `showSideNav`(=`!isImmersive`)일 때만 적용.
- 파일 상단 주석의 근거 계획·`pl-60`/`w-60` 문구를 본 계획·`pl-20`/`w-20`로 갱신.

### 3. Header 전폭 top-bar 마크업 `[담당: publisher]` — `components/common/header.tsx`
- 내부 래퍼 `container mx-auto px-4 py-3`(`:152`) → **`w-full px-4 py-3`(또는 `px-6`)**: 로고를 화면 far-left(레일 상단과 세로 정렬), 우측 컨트롤을 far-right로. `justify-between` 유지.
- 로고/우측 컨트롤 **구성·핸들러·기능 불변**(세이프티 토글·상점·알림·내정보·장바구니·모바일 햄버거→HeaderSidebar 유지). caveduck의 검색바/무료충전/디스코드는 **도입하지 않음**(StoryNation IA 유지). 표시 재배치만.
- `motion.header sticky top-0 z-[50] bg-surface-sunken shadow-sm`(`:147`) 유지 — 전폭 sticky top-bar 역할 확정.
- ⚠️ 이 단계는 **마크업 className만** 손댐. 상태/핸들러/store 로직·`export default function Header()`(prop-less) 시그니처 불변 → writer의 2·4단계와 파일 충돌 없음.
- 반응형: 360/768/1280/1920px에서 로고+컨트롤이 한 줄에 들어가고 줄바꿈/가로 스크롤 없게(전폭이라 기존보다 여유 증가). 터치 타깃 44px 유지.

### 4. 16개 페이지 `<Header/>` 제거 `[담당: writer]` — 아래 목록 전수
- 배치 A(views): `views/main/home.tsx`(import `:6`, 렌더 `:73`), `views/chat-list/home.tsx`(`:13`,`:403`), `views/search/home.tsx`(`:5`,`:200`), `src/views/my-characters/edit/ui/Edit.tsx`(`:5`,`:43`).
- 배치 B(app/(routes) 단순 래퍼): `my-account/page.tsx`, `shop-recharge/page.tsx`, `my-characters/page.tsx`, `my-characters/create/page.tsx`, `live/page.tsx`, `my-profile/page.tsx`, `author/[id]/page.tsx`, `settings/page.tsx`.
- 배치 C(app/(routes) payment): `payment/page.tsx`(`:37`), `payment/success/page.tsx`(`:181`), `payment/fail/page.tsx`(`:95`).
- 각 파일: `import Header ...` 및 `<Header/>` JSX 제거. Header 제거 후 최상위 래퍼(`<main>`/`div.flex-col`/`<>`)와 하위 컨텐츠·Footer는 유지. Header가 담당하던 상단 sticky 여백은 **전역 Header(2단계)가 대체**하므로 추가 padding 불필요(단, 회귀 점검에서 상단 잘림 확인 — 아래 리스크).
- **커버리지 교차검증**: 위 16개 = grep 전수 목록과 1:1 일치. `views/chat/home.tsx`(주석)·`payment/page-origin.tsx`(비라우트)·`provideLayout.tsx`(dead)는 **제외**(손대지 않음).

## 영향 범위 & 리스크
- **전 페이지 영향(횡단)**: Header 마운트 위치가 페이지→셸로 이동. 셸이 Header를 1회 렌더하므로 페이지에서 제거가 누락되면 **Header 중복 렌더**(2중 top-bar). 4단계 16개 전수 제거 필수.
- **상단 여백/잘림**: 기존 Header는 sticky라 페이지 상단 콘텐츠 위에 겹쳐 흐름을 차지하지 않음(단, 첫 콘텐츠가 Header 아래에서 시작). 전역 Header도 동일 sticky top-0이므로 흐름 상 동일. 다만 페이지 최상위가 `<main class=min-h-screen>` 등일 때 Header 아래 첫 요소 여백은 페이지가 이미 `pt-*`/`container ... py-*`로 보유 → 대체로 안전하나 페이지별 상단 잘림 회귀 점검 필요(특히 `views/main/home.tsx` 검색바 `pt-6`, `chat-list` `py-6`).
- **z-index 정합**: Header `z-50` > 레일 wrapper `z-40` > MobileGNB `z-100`(하단, 겹침 없음). 레일이 헤더 아래(top-16)에서 시작하므로 헤더와 시각 충돌 없음.
- **콘텐츠 여백(1920px)**: main-content가 `md:pl-20`로 레일 폭만 보정 → 콘텐츠는 그 안에서 `container mx-auto`로 중앙 정렬. 초광폭에서 콘텐츠는 뷰포트 중앙보다 레일 폭(80px)만큼 우측으로 치우쳐 보이나, 이는 caveduck과 동일(콘텐츠는 레일 오른쪽 영역 기준 중앙). 좌우 마진은 `container` max-width가 결정.
  - 360px: 레일·Header 컨트롤 숨김/모바일 모드, MobileGNB, 가로 스크롤 없음.
  - 768px(md): 레일 80px + `pl-20`, `container`(max 768) 거의 꽉 참(좌우 마진 최소) — 정상.
  - 1280px: `container`(max 1280) 중앙 정렬, 레일 오른쪽 영역에서 좌우 대칭 여백.
  - 1920px: `container` max에서 멈춰 좌우 넉넉한 여백(caveduck식).
- **Footer**: 페이지별 유지(셸 미이관). Header만 이관하므로 Footer 유무 편차는 불변.
- **몰입형(`/chat/[id]`)**: Header·레일·본문 pl 모두 숨김(2단계 `isImmersive`). `views/chat/home.tsx` Header 주석 상태와 정합.
- **provideLayout.tsx / payment/page-origin.tsx**: dead/비라우트 → 미변경(변경 시 오히려 혼선). 리스크: 향후 재사용 시 Header 이중 렌더 가능 → 주석으로 남기거나 후속 제거(스코프 밖).
- **caveduck 픽셀 정합 제약**: caveduck.io는 SPA로 정확한 레일 폭/하이라이트 반경/마진 픽셀을 정적 확인 불가. 애매한 시각값(레일 폭 미세조정·pill 반경·라벨 표기·마진)은 이미지 근사치 + 프로젝트 시맨틱 토큰으로 **publisher가 결정**(하드코딩 HEX 금지).
- **롤백**: 4단계 페이지 `<Header/>` 복원 + AppShell/View 클래스 되돌리면 원복. 로직 변경 없음(게이팅/모달/라우팅 불변)이라 리스크 중간(주로 레이아웃 회귀).

## 검증 방법
- 타입/린트: `npx tsc --noEmit`, `npm run lint`.
- Header 단일성: 임의 페이지에서 top-bar가 **정확히 1개**만 렌더(중복 없음). 16개 페이지 순회로 확인.
- 레일: 1280/1920px에서 `w-20` 세로 항목(아이콘 위/라벨 아래), 활성 항목 둥근 사각 채움 하이라이트 + `aria-current`, hover/focus/active 동작. 각 항목 라우팅/게이팅/모달(만들기=chatModeSelect) 정상.
- 오프셋: 레일이 헤더(4rem) 아래에서 시작, 헤더-레일 겹침 없음. 본문이 `pl-20`로 레일과 안 겹침.
- 여백: 360/768/1280/1920px에서 콘텐츠 좌우 마진·중앙 정렬 확인, 가로 스크롤/잘림 없음. 상단 콘텐츠(검색바 등) 헤더에 안 가림.
- 몰입형: `/chat/[id]`에서 Header·레일·pl 모두 숨김, 채팅 전폭 유지.
- 모바일(360px): 레일 숨김, MobileGNB 하단 정상, Header 햄버거→HeaderSidebar 동작.
- 페이지 회귀 점검 목록(각 URL 상단 잘림/여백/Footer 확인): `/`, `/chat-list`, `/search`(해당 라우트), `/my-characters`, `/my-characters/create`, `/my-characters/edit/...`, `/my-account`, `/my-profile`, `/author/[id]`, `/live`, `/shop-recharge`, `/settings`, `/payment`, `/payment/success`, `/payment/fail`.

## 범위 밖 (하지 않을 것)
- '최근 대화' 아바타 섹션(데이터 연결 필요) — 후속 과제.
- navConfig 항목/라우트/게이팅/모달 로직, MobileGNB 로직 변경.
- Header에 caveduck식 검색바·무료충전·디스코드 추가(StoryNation IA 유지).
- Footer 전역화, `provideLayout.tsx`·`payment/page-origin.tsx`(dead/비라우트) 수정.
- 색상 토큰화 등 무관한 리팩터링.
