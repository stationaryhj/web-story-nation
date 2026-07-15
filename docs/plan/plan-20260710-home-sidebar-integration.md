# 계획: 데모 좌측 사이드바를 전역 크롬에 이식

- 작성 일자: 2026-07-10
- 갱신 일자: 2026-07-10 (사이드바 '만들기' = 라우트 이동이 아니라 `chatModeSelect` 전역 모달 트리거로 정정)
- 대상 브랜치: `red-main`
- 목표 한 줄 요약: 데모(`app/(routes)/demo/home/page.tsx`)의 좌측 세로 사이드바를 전 페이지 공용 데스크톱 내비게이션으로 추출·전역 마운트하고, Top bar에서 중복 nav를 제거(상점은 아이콘화하여 세이프티 토글 옆으로 이동)하며, 모바일 하단바(MobileGNB)를 동일 5항목으로 통일한다. **'만들기'는 라우트 이동이 아니라 `chatModeSelect` 전역 모달을 여는 액션형 항목이다.**

---

## 목표
데모의 좌측 사이드바를 공용 컴포넌트로 추출해 전역 레이아웃에 마운트하고, Top bar 데스크톱 nav 제거 + 상점 아이콘 이동, MobileGNB 5항목 통일을 최소 변경으로 구현한다. 내비 항목은 **라우트형(route) / 액션형(action)** 두 종류를 지원하며, '만들기'는 `chatModeSelect` 모달을 여는 액션형이다.

## 확인 필요 사항
1. **한도체크(onLimitError) 처리 방식 결정** — 아래 "접근 방식 > 한도체크 처리" 참조. writer가 조사 후 확정. 기본값: **옵션 A(ChatModeSelectModal 자기완결화)** 권장. 미응답 시 옵션 A로 진행하되, 범위가 커지면 옵션 C(단순 트리거)로 폴백.
2. **아이콘 소스**: (권장) 프로젝트 관행대로 **lucide 통일**(MobileGNB가 이미 lucide 사용) vs 데모 Figma 마스크 에셋 유지. 미응답 시 lucide로 진행.
3. **데스크톱 로고 중복**: 사이드바 상단 로고 + Header 좌측 로고가 md 이상에서 동시 노출된다. (권장) Header 좌측 로고를 `md:hidden` 처리(홈 진입은 사이드바가 담당). 미응답 시 권장안 적용.

> **해소됨**: 이전 계획의 "활성 표시 중복(만들기·내 작업실 → 동일 `/my-characters`)"는 요구사항 정정으로 제거됨. '만들기'는 라우트가 없는 액션형이므로 active 상태가 없고, `/my-characters` active는 '내 작업실'이 단독 소유한다.

## 현황 파악

### 사이드바/GNB/Header (기존)
- `views/main/home.tsx:73` — 페이지가 `Header`를 직접 렌더. 사이드바 관련 없음. (전역 마운트 시 이 파일은 **미수정**.)
- `components/common/header.tsx`
  - 모달 스토어 두 개 import: `useNewModalStore` = `@/shared/model/stores/useModalStore`(`:31`, `openNewModal` alias `:83`), `useModalStore` = `@/store/useStoreModal`(`:33`, `:82`). **socialLogin·chatModeSelect는 전자(`@/shared/model/stores/useModalStore`)에 등록**되어 있음.
  - `navLinks` 배열 `header.tsx:88-119` (홈/대화/캐릭터 만들기/수익 관리/상점).
  - 데스크톱 nav JSX `header.tsx:215-228` (`hidden md:flex`).
  - 우측 영역 `header.tsx:231-291`: `SimpleToggle`(세이프티 필터), `NotificationButton`, 내정보(faUser, `md:block`), 장바구니(`/cart`, faShoppingBag), 모바일 햄버거.
  - 게이팅 핸들러 `handleNavLinkClick` `header.tsx:122-137` (`requireLogin && !isLogin → openNewModal({type:'socialLogin'})`).
  - `HeaderSidebar`에 `navLinks` 전달 `header.tsx:297-308`.
- `components/elements/sidebar/HeaderSidebar.tsx` — **`navLinks` prop을 받지만 렌더에 사용하지 않음**(설정/내정보/로그아웃만 표시, `HeaderSidebar.tsx:71-152`). → **Header navLinks 변경은 모바일 사이드바 표시에 영향 없음(리스크 낮음).**
- `components/common/MobileGNB.tsx`
  - 자체 `navLinks` `MobileGNB.tsx:45-75` (홈/대화/만들기/수익 관리/상점, lucide `Home/MessageCircle/UserRoundPlus/HandCoins/Store`). **모두 `href` 기반 `<Link>`** — 현재 '만들기'도 `/my-characters`로 라우팅(정정 대상).
  - 모달 스토어: `useModalStore` = `@/shared/model/stores/useModalStore`(`:9`, `openModal` `:16`) — **chatModeSelect·socialLogin 등록된 정본 스토어**.
  - `grid grid-cols-5`, 활성 `activeLink === link.href` → `text-brand`/비활성 `text-text-muted` `MobileGNB.tsx:114-128`.
  - 게이팅 `MobileGNB.tsx:80-95` (`requireLogin && !isLogin` → socialLogin; `loginTypeCheck && (!loginType || loginType==='Guest')` → socialLogin).
  - `pathname.startsWith('/chat/') && pathname !== '/chat-list'`에서 null `MobileGNB.tsx:41`.
  - `document.body.style.paddingBottom='64px'` 효과 `MobileGNB.tsx:28-38` (실제 높이 55px).
- `app/layout.tsx`
  - 구조 `layout.tsx:106-118`: `Providers > div.flex.min-h-screen.flex-col.md:pb-0 > div.flex-1#main-content{children}` + 전역 `DraggableButton`, `MobileGNB`, `ToastPortal`.
  - Header는 layout에 없고 각 페이지가 렌더.

### '만들기'(캐릭터 생성) 액션 흐름 (정정 요구사항 근거)
- `views/my-characters/home.tsx:96-103` `handleCreateCharacter` — `openModal({ type: 'chatModeSelect', props: { onLimitError: handleLimitError } })`. 페이지의 '캐릭터 생성' 버튼(`:109-116`)과 빈 상태 '첫 캐릭터 만들기' 버튼(`:121-128`)이 이 동작 호출. 모달 스토어는 `useModalStore` = `@/shared/model/stores/useModalStore`(`:14`).
- `chatModeSelect` 전역 등록: `src/shared/ui/modal/GlobalModalHost.tsx:36` → `ChatModeSelectModal`. **사이드바/헤더에서 이미 이 스토어를 쓰므로 어디서든 트리거 가능.**
- `ChatModeSelectModal` (`src/shared/ui/modal/ChatModeSelectModal.tsx`)
  - props: `onLimitError: () => void` (필수, `:13-15`).
  - `handleModeSelect(chatRoomMode)` `:35-50` — **모드 선택 시 자체적으로 한도 체크**: `createApi.GetCreateChatBotInProgress(null, mode)` 호출 → `data.result.err === 4`면 `closeModal()` + `onLimitError()` 실행 후 종료(`:39-44`); `err === 0 && chrbot`이면 `/my-characters/edit/{key}`로 push(`:46-49`).
  - **즉, 진입 시점 한도 프리체크가 아니라, 사용자가 모드를 고른 뒤 서버가 한도 초과를 반환할 때 `onLimitError`가 호출된다. 콜백의 유일한 역할은 `LimitCharacterModal` 표시.**
- `views/my-characters/home.tsx`의 페이지 로컬 한도 로직: `GetCreateChatBotListMine`로 목록 조회 후 `inProgressData?.result.err === 4`면 `setIsLimitModalOpen(true)` (`:33-37`) — 이건 **목록 로드 기반 별도 프리체크**이고, `handleLimitError`(`:92-94`)는 로컬 state `isLimitModalOpen`을 켜서 `LimitCharacterModal`(`:148`)을 연다.
- `LimitCharacterModal` (`components/modal/LimitCharacterModal.tsx`) — `isOpen/onClose` 로컬 state 패턴의 `BaseModal`. **GlobalModalHost에 미등록** → 전역 트리거에서 직접 열 수 없음(현재는 페이지 로컬 state로만 제어).
- 참고(대조군, 이번 대상 아님): `components/main/recommend/CreateCharacterSection.tsx:17-23` — 다른 '캐릭터 만들기' 진입. `isLogin`이면 `router.push('/my-characters/create')`, 아니면 socialLogin 모달. **사용자가 지정한 것은 이쪽(b)이 아니라 (a) `chatModeSelect` 모달이다.**

### 토큰/에셋
- 토큰: `tailwind.config.ts:56-59` `brand`(DEFAULT/hover), `text-primary/muted` `:106-111`. `app/globals.css`: 다크 `--color-brand: 255 46 126`(#FF2E7E), `--color-text-muted: 168 168 168`(#A8A8A8). → 데모 `#FF0750`→`text-brand`, `#B1B1B1`→`text-text-muted` 매핑 타당.
- 데모 사이드바 `app/(routes)/demo/home/page.tsx`: `NAV_ITEMS` `:28-34`, `MaskIcon` `:37-56`, 데스크톱 aside `:103-126`, 모바일 하단 탭바 `:184-205`.
- 데모 에셋: `public/images/demo/nav/{home,chat,create,studio}.svg`, `revenue.png`.

## 접근 방식

### 마운트 위치: 전역 레이아웃 (권장)
Top bar에서 홈/대화/만들기/수익 nav를 전역 제거하므로 사이드바를 home에만 두면 다른 페이지에서 데스크톱 내비가 사라진다. → **전역(레이아웃) 마운트 필수.** home.tsx 미수정, `app/layout.tsx`에 공용 사이드바 마운트.

### 추출 위치: 레거시 `components/common/` (권장)
`Header`·`MobileGNB`가 `components/common/`에 있고 전역 크롬이 여기 모여 있다. 일관성 우선 → `components/common/`에 배치.

### navConfig: 라우트형/액션형 통합 (핵심 변경)
항목을 **`kind` 분기로 route/action 둘 다 표현**한다. 사이드바와 MobileGNB가 이 config를 공유하므로 양쪽 클릭 핸들러가 `kind`를 분기 처리한다.

```
type NavConfigItem =
  | { kind: 'route'; key; label; href; icon; requireLogin; loginTypeCheck? }
  | { kind: 'action'; key; label; action: 'chatModeSelect'; icon; requireLogin; loginTypeCheck? };
```

- `home`  홈    `kind:'route'`  `/`          requireLogin:false
- `chat`  채팅  `kind:'route'`  `/chat-list` requireLogin:true
- `create` 만들기 `kind:'action'` `action:'chatModeSelect'` requireLogin:true, loginTypeCheck:true
- `studio` 내 작업실 `kind:'route'` `/my-characters` requireLogin:true, loginTypeCheck:true
- `revenue` 수익내역 `kind:'route'` `/my-account` requireLogin:true, loginTypeCheck:true

활성 판정 `getActiveKey(pathname)`: **route 항목만 대상**으로 pathname 매칭. action 항목(`create`)은 라우트가 없어 활성 상태 없음 → `/my-characters`는 `studio`가 단독 소유하므로 **중복 하이라이트 원천 제거**(이전 계획의 first-match 캡슐화 로직 불필요, 단순화). 예: `getActiveKey('/my-characters') === 'studio'`.

### 한도체크(onLimitError) 처리 — writer 결정 사항
전역 사이드바 트리거에는 my-characters 페이지의 로컬 state(`isLimitModalOpen`/`LimitCharacterModal`)가 없다. `ChatModeSelectModal`은 모드 선택 시 `onLimitError()`를 호출하는데, 사이드바에서 열 때 이 콜백이 가리키는 로컬 모달이 없다. 세 옵션:

- **옵션 A (권장) — ChatModeSelectModal 자기완결화**: `LimitCharacterModal`을 GlobalModalHost에 새 타입(`limitCharacter`)으로 등록하고, `ChatModeSelectModal.handleModeSelect`의 `err===4` 분기에서 `onLimitError?.()` 대신(또는 함께) `openModal({ type: 'limitCharacter' })`로 전역 모달을 직접 연다. `onLimitError`는 **선택적(optional)**으로 완화. → 사이드바는 콜백 없이 `chatModeSelect`만 열면 되고, my-characters 페이지도 그대로 동작(콜백 넘겨도 무방). 한 곳 수정으로 모든 진입점에서 한도 피드백 보장.
  - 트레이드오프: `LimitCharacterModal`을 전역 모달 시그니처(`ModalComponent`, props 기반 open/close)로 어댑트해야 함 → 아래 "조사 포인트" 참조. 변경 파일: `GlobalModalHost.tsx`, `ChatModeSelectModal.tsx`(+ 선택적으로 `LimitCharacterModal` 래핑), (선택) `views/my-characters/home.tsx`에서 로컬 state 제거.
- **옵션 B — 한도체크 재사용 훅 추출**: my-characters의 목록 로드 프리체크를 `useCharacterCreateLimit()` 훅으로 추출해 사이드바에서도 프리체크. → 과함. 모달이 이미 모드 선택 시 자체 체크를 하므로 프리체크 중복. 비권장.
- **옵션 C — 단순 트리거(폴백)**: 사이드바는 `chatModeSelect`만 열고 `onLimitError`에 no-op을 넘긴다(또는 prop optional화 후 미전달). 한도 초과 시 모달은 조용히 닫히고 별도 안내 없음. → 가장 단순하나 사이드바 진입 시 한도 피드백 없음(UX 저하). 옵션 A 범위가 커질 때만 폴백.

**추천: 옵션 A.** 모든 진입점 일관 + 최소 중복. 단 아래 조사 포인트를 writer가 먼저 확인.

**조사 포인트 (writer)**:
1. `src/shared/model/types/modal.ts`의 `ModalComponent<P>` 시그니처 — `LimitCharacterModal`(`isOpen/onClose`)을 어떻게 어댑트할지. 다른 전역 모달(`SocialLoginModal` 등)은 스토어 `closeModal`을 직접 쓰는지 확인해 동일 패턴으로 래핑.
2. `LimitCharacterModal`이 쓰는 `BaseModal`(`components/modal/BaseModal`)이 `isOpen=false`일 때 아무것도 렌더 안 하는지 — 전역 호스트는 "열린 것만 렌더"하므로 항상 `isOpen`을 전달해도 되는지, 아니면 얇은 래퍼 컴포넌트(`GlobalLimitCharacterModal`)로 감싸 `closeModal`을 연결할지.
3. `views/my-characters/home.tsx`의 로컬 `isLimitModalOpen`/`LimitCharacterModal`(`:148`) 제거 시 회귀 없는지(옵션 A 채택 시 정리 권장이나, 최소 변경 원칙상 그대로 두고 전역 경로만 추가해도 무방).

### 아이콘/색 토큰화
- 색: 데모 하드코딩(`#FF0750`/`#B1B1B1`/inline `style`) 금지. 활성 `text-brand`, 비활성 `text-text-muted`, 경계선 `border-border-default`, 배경 `bg-surface-sunken`.
- 아이콘(권장): **lucide 통일** — `Home / MessageCircle / UserRoundPlus(만들기) / (내 작업실) / HandCoins`. '내 작업실' 후보: `FolderKanban` 또는 `Briefcase`(publisher 최종 선택). 상점(Header 아이콘): 기존 `faStore` 유지.

## 실행 계획 (단계별)

1. **공용 내비 설정 추출 (route/action 통합)** `[담당: writer]` — `components/common/navConfig.ts` 신규
   - 5항목을 위 "navConfig" 스키마대로 정의. `create`만 `kind:'action', action:'chatModeSelect'`, 나머지는 `kind:'route'`.
   - `getActiveKey(pathname): string | null` — **route 항목만** pathname 매칭(action은 제외). `/my-characters` → `studio` 단독. named export.
   - `icon`은 lucide 컴포넌트 참조(대안 채택 시 마스크 에셋 경로).
   - 재사용: MobileGNB·DesktopSideNav 모두 이 config import → nav 정의 단일화.
   - 타입 `NavConfigItem`(discriminated union) export.

2. **데스크톱 사이드바 표시용 View** `[담당: publisher]` — `components/common/DesktopSideNavView.tsx` 신규
   - 데모 aside(`page.tsx:103-126`) 마크업 이식, **하드코딩 색 → semantic 토큰** 교체.
   - 컨테이너: `sticky top-0 hidden h-[100dvh] w-32 shrink-0 flex-col items-center gap-10 border-r border-border-default bg-surface-sunken py-8 md:flex`.
   - 로고: `next/image` `/images/logo.svg`, 홈 링크(`Link href='/'`).
   - **항목 렌더는 `kind` 무관하게 동일한 클릭 가능한 요소로 표시하되, 마크업은 항상 `<button type='button'>` 기반으로 통일**(route도 action도 컨테이너가 클릭을 가로채 처리하므로 표시용은 button으로 단일화 → route/action 분기 마크업 불필요). 활성 `text-brand`, 비활성 `text-text-muted`, `hover:bg-surface-elevated-hover`, `aria-current`(활성 route일 때), 최소 44px 터치 타깃(`min-h-[64px]`), 아이콘 24~32px + 라벨.
     - (대안) route는 `<Link>`, action은 `<button>`으로 분기하고 싶다면 컨테이너가 `renderItem` 콜백을 주입하는 방식도 가능하나, **접근성상 route도 button+programmatic navigation으로 통일하면 컨테이너 로직이 단순**해짐. publisher는 button 통일안으로 진행하고, SEO/우클릭-새탭 요구가 있으면 writer와 협의.
   - **props/callback 연결 지점(연결 계약)**:
     - `items: NavConfigItem[]`
     - `activeKey: string | null`
     - `onItemClick: (item: NavConfigItem) => void` (route/action 분기·게이팅은 전부 컨테이너에서 처리)
   - 색/텍스트/마크업만 담당. pathname·store·게이팅·라우팅 없음.

3. **데스크톱 사이드바 컨테이너** `[담당: writer]` — `components/common/DesktopSideNav.tsx` 신규 (`'use client'`)
   - `usePathname`, `useRouter`, `useAccountStore`(isLogin, loginType), `useModalStore`(`@/shared/model/stores/useModalStore`의 `openModal`) 사용 — MobileGNB 게이팅/스토어 패턴 재사용.
   - `navConfig` items 주입, `getActiveKey(pathname)`로 activeKey 계산.
   - `onItemClick(item)` 로직:
     1. **게이팅**: `item.requireLogin && !isLogin` 또는 `item.loginTypeCheck && (!loginType || loginType==='Guest')` → `openModal({ type:'socialLogin' })` 후 return. (MobileGNB `:80-95` 규칙 재사용.)
     2. **kind 분기**:
        - `kind==='route'` → `router.push(item.href)`.
        - `kind==='action' && action==='chatModeSelect'` → `openModal({ type:'chatModeSelect', props: <한도체크 옵션 결정에 따름> })`. 옵션 A면 props 없이(또는 `onLimitError` optional) 호출; 옵션 C면 no-op 콜백.
   - **가시성 규칙**: `pathname.startsWith('/chat/') && pathname !== '/chat-list'`이면 `return null` (MobileGNB `:41` 동일).
   - `<DesktopSideNavView items activeKey onItemClick />` 렌더.

4. **전역 셸(마운트 + 콘텐츠 여백)** `[담당: writer]` — `components/common/AppShell.tsx` 신규 + `app/layout.tsx` 배선
   - `AppShell`('use client'): `usePathname`으로 `showSideNav`(= chat/[id] 아닐 때) 계산.
   - 렌더: `<DesktopSideNav />` + `<div id='main-content' className={cn('flex-1', showSideNav && 'md:pl-32')}>{children}</div>`. `cn`은 `src/shared/lib/utils/cn.ts`.
   - `app/layout.tsx:107-111`의 `div.flex-1#main-content` 래핑을 `<AppShell>{children}</AppShell>`로 교체. `MobileGNB`·`DraggableButton`·`ToastPortal`은 기존 위치 유지.
   - 채팅 상세에서는 여백·사이드바 모두 제거. z-index: 사이드바는 Header(z-50)와 겹치지 않는 좌측 고정, MobileGNB(z-100)와 md 분기로 무관.

5. **Top bar 정리 + 상점 아이콘 이동** `[담당: writer]` — `components/common/header.tsx`
   - 데스크톱 nav JSX(`:215-228`) 제거. `navLinks`(`:88-119`)는 렌더 미사용 → 상점만 남겨 아이콘 데이터로 쓰거나 배열 제거. `HeaderSidebar`에 넘기는 `navLinks`(`:300`)는 표시 미사용이므로 빈 배열/제거 안전.
   - `SimpleToggle` 옆(우측 영역 `:231` 부근)에 **상점 아이콘 버튼** 추가: `Link href='/shop-recharge'` + `FontAwesomeIcon icon={faStore}`, 장바구니 버튼(`:271-279`) 스타일 재사용. 게이팅: 상점 `requireLogin:true` → 미로그인 시 `openNewModal({type:'socialLogin'})`. `aria-label='상점'`.
   - (확인 필요 #3 권장 적용 시) 좌측 로고 `Link`(`:196-212`)에 `md:hidden` 추가.
   - 장바구니(`/cart`)·NotificationButton·내정보·세이프티 토글·모바일 햄버거 유지.
   - ⚠️ 변경 소규모(블록 삭제 + 아이콘 버튼 1개 + 기존 게이팅 재사용)라 **단일 담당(writer)**.

6. **MobileGNB 5항목 통일 (만들기 = 액션형)** `[담당: writer]` — `components/common/MobileGNB.tsx`
   - 자체 `navLinks`(`:45-75`)를 **1단계 `navConfig`로 교체** → 사이드바와 동일 5항목(홈·채팅·만들기·내 작업실·수익내역). 기존 '상점'(`:68-74`) 제거(상단 아이콘으로 이동), '대화'→'채팅', '수익 관리'→'수익내역' 라벨 통일, '내 작업실' 추가.
   - **'만들기'는 액션형이므로 `<Link href>`가 아니라 클릭 시 `chatModeSelect` 모달을 연다.** route 항목은 `<Link>` 유지 가능하나, DesktopSideNav 컨테이너와 동일하게 **`onItemClick(item)` 단일 핸들러로 kind 분기**하도록 통일하는 편이 config 공유 이점을 살림. (route도 button+router.push로 통일하거나, route는 Link·action은 button으로 분기 — 컨테이너 로직 단순화 위해 통일 권장.)
   - 활성 판정을 `getActiveKey(pathname)` + `item.key` 비교로 교체(현재 `activeLink === link.href`는 create/studio 동일 href 문제 → 이제 create는 라우트 없음, key 기반으로 확실히 해소).
   - 게이팅 규칙(`:80-95`)·`/chat/` null(`:41`)·body padding(`:28-38`)·모달 스토어(`@/shared/model/stores/useModalStore`) 유지.
   - 한도체크: DesktopSideNav와 동일 옵션(A/C) 적용 — `chatModeSelect` 오픈 방식 일치시킬 것.

7. **(옵션 A 채택 시) 한도 모달 전역화** `[담당: writer]` — `src/shared/ui/modal/GlobalModalHost.tsx` + `src/shared/ui/modal/ChatModeSelectModal.tsx` (+ 선택: `LimitCharacterModal` 래퍼)
   - "접근 방식 > 한도체크 처리 > 옵션 A" 및 "조사 포인트" 참조.
   - `GlobalModalHost`의 `MODAL_COMPONENTS`에 `limitCharacter` 등록. `LimitCharacterModal`을 전역 시그니처로 어댑트(얇은 래퍼로 `closeModal` 연결).
   - `ChatModeSelectModal.handleModeSelect`의 `err===4` 분기에서 `openModal({type:'limitCharacter'})` 추가, `onLimitError` prop을 optional로 완화.
   - (선택) `views/my-characters/home.tsx` 로컬 `isLimitModalOpen`/`LimitCharacterModal` 정리 — 회귀 확인 후 진행, 최소 변경 원칙상 유지도 가능.
   - ⚠️ 옵션 C 채택 시 이 단계 생략.

## 영향 범위 & 리스크
- **home.tsx 미수정**: 전역 마운트로 전 페이지 자동 적용. `views/main/home.tsx`의 하단 여백 유지.
- **'만들기' 동작 변경**: 이제 라우트 이동이 아니라 `chatModeSelect` 모달. `/my-characters`로 가던 기존 사용자 흐름이 바뀜 → 모달에서 모드 선택 후 `/my-characters/edit/{key}`로 진행. QA 필요.
- **활성 표시**: create가 라우트 없는 액션이 되어 `/my-characters` 중복 하이라이트 문제 소멸. `getActiveKey`가 route만 판정.
- **한도체크**: 옵션 A면 `ChatModeSelectModal`·`GlobalModalHost` 수정으로 my-characters 진입에도 영향 → 기존 로컬 모달과 이중 표시되지 않도록 로컬 정리 여부 결정. 옵션 C면 사이드바 진입 시 한도 피드백 없음(수용 가능 여부 확인).
- **모달 스토어 혼동 주의**: chatModeSelect·socialLogin은 반드시 `@/shared/model/stores/useModalStore`로 열 것(Header의 `useModalStore`=`@/store/useStoreModal`와 혼동 금지).
- **HeaderSidebar**: `navLinks` prop 미사용 → 제거/축소 안전. 타입 유지 위해 빈 배열 전달 권장.
- **콘텐츠 좌측 여백**: `md:pl-32` 전 페이지 적용 → md 폭(768/1024/1280)에서 주요 페이지 가로 스크롤·잘림 점검.
- **채팅 상세(`/chat/[id]`)**: 사이드바·여백 제거로 몰입형 보존.
- **웹뷰/모바일**: 데스크톱 `md:flex`, 모바일 `md:hidden` 전환으로 겹침 없음. `h-[100dvh]` 주소창 대응. 링크/버튼 44×44 터치 타깃.
- 롤백: 신규 파일(navConfig/View/컨테이너/AppShell) 삭제 + `layout.tsx`/`header.tsx`/`MobileGNB.tsx` revert. 옵션 A 채택 시 `GlobalModalHost.tsx`/`ChatModeSelectModal.tsx`도 revert 대상.

## 검증 방법
- `npx tsc --noEmit` 타입 체크 / `npm run check`(Biome).
- 수동(360 · 768 · 1280px):
  - md 이상: 좌측 사이드바 노출. route 항목 라우팅(홈`/`, 채팅`/chat-list`, 내작업실`/my-characters`, 수익내역`/my-account`), 활성 하이라이트 1개만(`/my-characters`에서 '내 작업실'만).
  - **만들기 클릭(로그인 상태) → 페이지 이동 없이 `chatModeSelect` 모달 오픈**, 모드 선택 시 편집 페이지로 진행. 미로그인/Guest → `socialLogin` 모달.
  - **한도 초과 시나리오**(임시저장 한도 도달 계정): 사이드바/GNB '만들기' → 모드 선택 시 한도 안내 모달 노출(옵션 A). 옵션 C면 조용히 닫힘(설계 의도 확인).
  - md 미만: 사이드바 숨김, MobileGNB 5항목 동일 동작, 상점은 하단바에 없음. '만들기'는 라우트 이동 아님(모달).
  - Top bar: 데스크톱 nav 사라짐, 세이프티 토글 옆 상점 아이콘 → `/shop-recharge`(미로그인 시 로그인 모달).
  - `/chat/{id}` 진입 시 사이드바·MobileGNB·좌측 여백 모두 사라짐, `/chat-list`는 사이드바 노출.
  - 전 페이지 가로 스크롤/잘림 없음.

## 범위 밖 (하지 않을 것)
- 데모 라우트(`app/(routes)/demo/home/page.tsx`) 제거 — 후속 별건.
- `views/main/home.tsx` 내부 콘텐츠 변경.
- `CreateCharacterSection.tsx`(홈 하단 캐릭터 만들기 유도, `/my-characters/create` 라우팅) 동작 변경 — 이번 대상 아님.
- `ChatModeSelectModal`의 모드 선택 로직/한도 판정 규칙(`err===4`) 자체 변경 — 옵션 A는 표시 경로만 추가.
- 상점/결제 로직, 세이프티 필터 토글 동작 변경.
- `tailwind.config.ts`/`globals.css` 토큰 추가·수정.
- FSD(`src/widgets`)로의 크롬 이전.
</content>
</invoke>
