# 코드 리뷰: 홈 사이드바 전역 통합

- 리뷰 일자: 2026-07-10
- 대상 브랜치: `red-main` (작업 트리, 커밋되지 않은 변경)
- 근거 계획: `docs/plan/plan-20260710-home-sidebar-integration.md`
- 근거 구현 기록: `docs/write/write-20260710-home-sidebar-integration.md`, `docs/publish/publish-20260710-home-sidenav-view.md`

## 리뷰한 파일
- `components/common/navConfig.ts` (신규)
- `components/common/DesktopSideNav.tsx` (신규)
- `components/common/DesktopSideNavView.tsx` (신규)
- `components/common/AppShell.tsx` (신규)
- `app/layout.tsx`
- `components/common/header.tsx`
- `components/common/MobileGNB.tsx`
- `src/shared/ui/modal/GlobalLimitCharacterModal.tsx` (신규)
- `src/shared/ui/modal/GlobalModalHost.tsx`
- `src/shared/ui/modal/ChatModeSelectModal.tsx`
- `views/my-characters/home.tsx`
- (참고 확인용, 이번 변경과 무관: `app/(routes)/chat/[id]/page.tsx`, `app/page.tsx`, `src/features/edit-character/api/dmCharacterApi.ts` — 포매팅/개행 정리 위주로 이번 사이드바 작업 범위 밖으로 판단)

---

## 리뷰 요약

전체적으로 계획(`docs/plan/`)을 충실히 따랐고, `navConfig`로 route/action을 통합해 사이드바·MobileGNB의 중복 정의를 제거한 점, 게이팅 규칙을 기존 MobileGNB 관례에서 그대로 재사용한 점, `getActiveKey`가 `/` 특수 케이스를 명확히 처리한 점이 특히 좋습니다. 한도 모달 옵션 A(전역화)도 스토어의 스택(`closeModal`이 마지막 항목을 pop) 동작을 정확히 이해하고 `closeModal()` → `openModal(limitCharacter)` 순서를 올바르게 지킨 점이 인상적입니다.

핵심 지적은 Critical은 없고, **레이아웃 결합의 암묵성(사이드바 폭과 헤더 오프셋이 우연히 일치)**, **`limitCharacter` 모달이 레거시 `BaseModal` 패턴을 그대로 끌어와 전역 모달 z-index/애니메이션 컨벤션과 어긋나는 점**, **계획에 있던 "사이드바 로고 = 홈 링크" 스펙이 조용히 누락된 점**, 그리고 **신규 컨테이너의 Zustand 구독이 selector 없이 전체 스토어를 구독하는 점** 이 네 가지가 Warning급입니다. Critical/보안 이슈는 발견되지 않았습니다.

---

## 심각도별 지적

### 🟡 Warning (개선 권장)

- **[레이아웃] `AppShell`의 사이드바 오프셋이 `Header`와 "우연히" 일치함 — 명시적 계약이 아님**
  `components/common/AppShell.tsx:30-35`에서 사이드바를 `md:fixed md:inset-y-0 md:left-0`로 플로우 밖으로 빼고, `#main-content`에 `md:pl-32`를 줘서 폭(128px)을 보정합니다. `components/common/header.tsx:146-152`의 `motion.header`는 `sticky top-0 left-0 right-0 z-[50]`이지만 **`Header`가 항상 `#main-content`(=`{children}`) 내부의 일반 플로우 자식으로 렌더된다는 전제 하에서만** 겹치지 않습니다(패딩이 콘텐츠 박스를 128px 밀어주므로 `Header`의 정적 위치도 동일하게 128px부터 시작). 실제로 현재 `Header`를 사용하는 4개 뷰(`views/main|chat-list|chat|search/home.tsx`) 모두 이 조건을 만족하고, `tailwind.config.ts`의 `container.screens` 설정과도 상충하지 않아 **지금 시점엔 겹침이 발생하지 않는 것으로 확인**했습니다. 다만 이 정합성은 "사이드바 폭(`w-32`)==본문 패딩(`md:pl-32`)"이라는 매직 넘버 일치와 "Header는 항상 main-content 안에서 렌더된다"는 암묵적 가정에 전적으로 의존합니다. 향후 어떤 페이지가 `Header`를 `fixed`/`portal`로 바꾸거나, `w-screen`/음수 마진으로 풀블리드 섹션을 만들면 즉시 깨지는데, 이를 막는 안전장치(주석 외 실제 코드/테스트)가 없습니다.
  - 권장: 사이드바 폭을 CSS 변수(`--sidenav-w`)로 export하고 `AppShell`·`DesktopSideNavView`가 같은 변수를 참조하게 하거나, 최소한 `Header`/다른 전역 크롬 파일에도 "이 요소는 `#main-content` 내부에서 렌더되어야 사이드바와 겹치지 않는다"는 계약을 주석으로 남겨 드리프트를 방지하세요.
  ```ts
  // before (매직 넘버 두 곳에 흩어짐)
  // DesktopSideNavView.tsx
  <aside className='... w-32 ...'>
  // AppShell.tsx
  <div className={cn('flex-1', showSideNav && 'md:pl-32')}>

  // after (한 곳에서 소유)
  // navConfig.ts 또는 별도 tokens 파일
  export const SIDE_NAV_WIDTH_CLASS = 'w-32'; // 128px
  export const CONTENT_OFFSET_CLASS = 'md:pl-32';
  ```

- **[레이아웃 중복] `/chat/[id]` 숨김 조건이 3곳에 하드코딩되어 DRY 위반**
  `pathname.startsWith('/chat/') && pathname !== '/chat-list'` 동일 로직이 `AppShell.tsx:26`, `DesktopSideNav.tsx:27`, `MobileGNB.tsx:35`(기존)에 각각 중복돼 있습니다. 지금은 세 곳이 동일하지만, 향후 규칙이 바뀌면(예: `/chat-list/recommend` 같은 서브 라우트 추가) 한 곳만 고치고 나머지를 놓치기 쉽습니다.
  ```ts
  // before (3파일에 중복)
  const showSideNav = !(pathname && pathname.startsWith('/chat/') && pathname !== '/chat-list');

  // after (navConfig.ts에 단일 함수로 추출, 3곳에서 import)
  export function isImmersiveChatRoute(pathname: string | null | undefined): boolean {
    return !!pathname && pathname.startsWith('/chat/') && pathname !== '/chat-list';
  }
  ```

- **[모달 아키텍처] `limitCharacter`가 전역 모달 컨벤션과 다른 레거시 패턴을 그대로 사용**
  `GlobalModalHost`의 다른 등록 모달(`ChatModeSelectModal` 등)은 `src/shared/ui/modal/base/Modal`을 사용해 `ModalZIndexContext`(`BASE_Z_INDEX=20000 + index*10`)로 z-index를 받고, 별도 `AnimatePresence`/`Portal`을 갖지 않습니다(GlobalModalHost의 바깥쪽 `AnimatePresence`가 마운트/언마운트로 exit 애니메이션을 처리). 반면 `GlobalLimitCharacterModal.tsx:20`은 `isOpen` 항상 `true`로 고정한 채 레거시 `LimitCharacterModal`→`BaseModal`(`components/modal/BaseModal.tsx`)을 그대로 감쌉니다. `BaseModal`은 **자체 `Portal` + 자체 `AnimatePresence`(`isOpen` 기반)** 를 갖고 z-index도 `zIndex` prop을 받지만 실제로는 쓰지 않고 `z-[1100]/[1101]/[1102]`를 하드코딩합니다(`BaseModal.tsx:160,167,174`). 결과적으로:
    1. `limitCharacter`는 다른 전역 모달과 z-index 체계가 분리되어 있어(1100대 vs 20000대), 다른 등록 모달과 동시에 열리는 경로가 생기면 스태킹 순서가 컨벤션을 벗어날 수 있습니다(현재 호출 경로에서는 `chatModeSelect`가 항상 먼저 `closeModal()`로 스스로를 제거하므로 실질적 충돌은 낮지만, 향후 재사용 시 함정이 됩니다).
    2. `isOpen`이 항상 `true`이므로 `BaseModal` 내부 `AnimatePresence`는 exit 트랜지션을 트리거할 기회가 없고, `GlobalModalHost`의 `renderModal`이 반환하는 래퍼도 일반 `<div>`(모션 컴포넌트 아님)라 바깥쪽 `AnimatePresence` 역시 exit을 보장하지 않습니다 → 다른 전역 모달과 달리 **닫힐 때 페이드아웃 없이 즉시 사라질 가능성**이 있습니다. write 문서에서도 이 부분을 "확인 필요"로 이미 인지하고 있는데, 실제 검증이 필요합니다.
  - 권장: 장기적으로 `LimitCharacterModal`을 `Modal`/`Modal.Content` 조합(다른 전역 모달과 동일 패턴)으로 이전하거나, 최소한 `GlobalLimitCharacterModal`이 `useModalZIndex()`를 읽어 `BaseModal`에 전달(단, 현재 `BaseModal`이 그 prop을 실제로 쓰지 않으므로 `BaseModal`도 함께 손봐야 함)하도록 후속 작업을 이슈로 남기세요.

- **[플랜 이탈, 미문서화] 사이드바 로고에 "홈 링크"가 빠짐**
  계획 2단계(`docs/plan/...md:115`)는 "로고: `next/image` `/images/logo.svg`, 홈 링크(`Link href='/'`)"를 명시했지만, 실제 `DesktopSideNavView.tsx:42`는 `<Image .../>`만 있고 `Link`/`button`으로 감싸지 않아 **로고 클릭 시 아무 동작도 하지 않습니다**. `publish-20260710-home-sidenav-view.md`의 "계획과 달라진 점" 섹션에도 이 누락이 기록되어 있지 않습니다. 치명적이진 않습니다(같은 사이드바의 "홈" nav 항목이 동일 기능을 제공하므로 기능 자체는 존재) — 다만 계획-구현 간 조용한 드리프트이므로, 의도된 단순화인지 누락인지 확인이 필요합니다.
  ```tsx
  // before
  <Image src='/images/logo.svg' alt='StoryNation' width={48} height={48} priority />

  // after (계획대로 홈 링크 복원 예시 — 컨테이너 계약을 건드리지 않고 View 내부에서만 처리 가능)
  <Link href='/' aria-label='홈으로 이동'>
    <Image src='/images/logo.svg' alt='StoryNation' width={48} height={48} priority />
  </Link>
  ```

- **[한도 모달, 확인 필요] 목록 로드 프리체크와 액션 트리거가 같은 전역 스택을 공유하며 "재등장" 가능성**
  `views/my-characters/home.tsx:31-33`의 마운트 이펙트(`inProgressData?.result.err === 4` → `openModal({type:'limitCharacter'})`)와 `handleCreateCharacter`의 `chatModeSelect` 오픈은 서로 독립적으로 트리거됩니다. 페이지 진입 시 한도 초과로 `limitCharacter`가 열린 상태에서 사용자가 "캐릭터 생성" 버튼을 눌러 `chatModeSelect`를 추가로 열면(스토어가 타입별로 별도 슬롯이므로 두 모달이 동시에 스택에 존재), `chatModeSelect`가 z-index상 위에 뜹니다. 이후 사용자가 `chatModeSelect`를 닫으면(`closeModal()`이 스택 마지막 항목을 pop) **뒤에 숨어있던 `limitCharacter`가 다시 드러납니다.** 이 흐름 자체는 **이번 diff로 새로 생긴 회귀는 아닙니다**(구버전도 마운트 이펙트에서 로컬 `isLimitModalOpen`을 켜고 `chatModeSelect`는 별도 전역 스토어를 썼으므로 동일한 잠재적 재등장 가능성이 이미 있었고, z-index 상 순서도 동일하게 유지됩니다). 다만 이번 변경으로 두 모달이 **같은 스토어의 같은 스택**을 쓰게 되었으므로, 원한다면 `handleCreateCharacter`나 `chatModeSelect` 오픈 시점에 `closeModalByType('limitCharacter')`를 함께 호출해 정리하는 것을 검토해보세요(옵션 A 채택 시 선택적 개선, 필수는 아님).

- **[Zustand 구독] 신규 `DesktopSideNav.tsx`가 selector 없이 스토어 전체를 구독**
  `DesktopSideNav.tsx:23-24`의 `const { openModal } = useModalStore();`, `const { isLogin, loginType } = useAccountStore();`는 MobileGNB의 기존 관례를 그대로 재사용한 것으로 프로젝트 일관성 관점에서는 자연스럽지만, `DesktopSideNav`는 **모든 페이지에서 항상 마운트되는 전역 컴포넌트**이므로 `modals` 배열이 바뀔 때마다(앱 어디서든 아무 모달이 열리고 닫힐 때마다) 리렌더됩니다. 신규 파일이라 selector 적용의 진입장벽이 낮으니, 이번 기회에 개선을 검토해보시면 좋겠습니다(기존 `MobileGNB`/`Header`까지 한 번에 바꾸자는 요구는 아닙니다).
  ```ts
  // before
  const { openModal } = useModalStore();
  const { isLogin, loginType } = useAccountStore();

  // after
  const openModal = useModalStore((s) => s.openModal);
  const isLogin = useAccountStore((s) => s.isLogin);
  const loginType = useAccountStore((s) => s.loginType);
  ```

### 🔵 Suggestion (선택적 제안)

- **[a11y] `MobileGNB`의 활성 탭에 `aria-current` 누락**
  같은 작업에서 새로 만든 `DesktopSideNavView.tsx:52`는 `aria-current={item.isActive ? 'page' : undefined}`를 제공하는데, `MobileGNB.tsx`의 `Link`/`button`(`:87-95`, `:100-108`)에는 없습니다. 색상만으로 활성 상태를 구분하면 스크린리더 사용자가 현재 위치를 알기 어렵습니다.
  ```tsx
  // before
  <Link key={item.key} href={item.href} onClick={...} className={...}>

  // after
  <Link
    key={item.key}
    href={item.href}
    onClick={...}
    aria-current={isActive ? 'page' : undefined}
    className={...}
  >
  ```
  같은 맥락에서 하단 탭바 전체를 `<nav aria-label='하단 메뉴'>`로 감싸는 것도 함께 고려해보세요(현재는 `<div className='grid grid-cols-5 ...'>` 뿐입니다).

- **[정리 기회] `header.tsx`의 죽은 아이콘 import**
  `faFire`, `faVideo`는 이전부터 미사용이었고(주석 처리된 `/live` 링크에서만 참조) 이번 diff에서도 그대로 남아 있습니다. 이번에 바로 옆 import 블록(`faHome`/`faComment`/`faChartLine`)을 정리한 김에 같이 제거하면 좋을 것 같습니다. 범위 밖 이슈라 강하게 요구하지는 않습니다.

- **[정리 기회] `header.tsx`의 `navLinks`/`HeaderSidebar` prop이 사실상 죽은 값**
  `navLinks`가 항상 `[]`로 고정되고 `HeaderSidebar`도 렌더에 쓰지 않으므로, 지금 구조는 안전하지만 "언젠가 채워질 것처럼 보이는" 빈 배열 + 좁아진 타입이 다소 불필요한 결합을 남깁니다. 이번 PR 범위에서는 최소 변경 원칙에 맞게 잘 처리하셨고, 후속 정리 시 `HeaderSidebarProps.navLinks` 자체를 제거하는 것도 검토해볼 만합니다.

- **[모달 시맨틱] 상점 아이콘의 `<Link><motion.button>` 중첩**
  `header.tsx:184-193`의 신규 상점 버튼은 `<Link>` 안에 `<button>`을 중첩하는데, 이는 HTML 콘텐츠 모델상 interactive-in-interactive라 완전히 유효하지는 않습니다. 다만 바로 아래 장바구니 버튼(`:227-235`)도 동일 패턴이라 **기존 스타일을 그대로 따른 것**이며, 이번 PR에서 새로 만든 문제는 아닙니다. 프로젝트 전체적으로 개선할 기회가 생기면 참고해주세요.

---

## 확인 필요 (재현/시각 검증 권장)
- 360 / 768 / 1280px에서 사이드바·헤더·MobileGNB 실측 확인(특히 `md` 경계값 768px 부근에서 사이드바 128px + 본문 여백이 좁은 화면에서 콘텐츠를 과도하게 압박하는지).
- `/chat/{id}` 진입 시 사이드바·좌측 패딩·MobileGNB 동시 소거 확인.
- 한도 초과 계정에서 `limitCharacter` 모달의 등장/퇴장 애니메이션(페이드 없이 즉시 사라지는지) 시각 확인.
- 사이드바 "만들기" 클릭 → `chatModeSelect` → 모드 선택 → 편집 페이지 이동, 그리고 미로그인/Guest 게이팅 동작.

---

## 잘한 점
- `navConfig.ts`의 `route`/`action` discriminated union과 `getActiveKey`가 홈(`/`) 특수 케이스를 명확히 분리해, 기존에 우려됐던 "만들기·내 작업실 동시 하이라이트" 문제를 구조적으로 해소했습니다.
- 사이드바(`DesktopSideNav`)와 `MobileGNB`가 동일한 `navConfig`/게이팅 규칙을 공유하도록 만들어 이후 nav 항목 변경 시 단일 지점 수정으로 충분하게 설계했습니다.
- 한도 모달 전역화에서 `useModalStore`의 스택 동작(`closeModal`이 마지막 항목을 pop)을 정확히 이해하고 `closeModal()` → `openModal(limitCharacter)` 순서를 지켜, 방금 스스로 push한 새 모달이 아니라 원래 열려 있던 `chatModeSelect`가 정확히 제거되도록 처리했습니다.
- 모달 스토어 혼동(레거시 `@/store/useStoreModal` vs 신규 `@/shared/model/stores/useModalStore`) 없이 신규 코드 전체가 정본 스토어만 사용했습니다.
- publisher(View)/writer(컨테이너) 파일을 명확히 분리하고, View가 로직 타입(`NavConfigItem`)에 의존하지 않도록 별도 `SideNavItemView` 계약을 정의한 점이 FSD 경계 준수 측면에서 좋은 선례입니다.
- `docs/write/`에 계획과 달라진 지점(AppShell 레이아웃 보정, 아이콘 선택, home.tsx 정리 사유)을 스스로 기록해 리뷰 근거를 명확히 남긴 점이 훌륭합니다.
