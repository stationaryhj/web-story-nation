# 구현: 데모 좌측 사이드바를 전역 크롬에 이식 (writer 단계)

- 작성 일자: 2026-07-10
- 근거 계획: `docs/plan/plan-20260710-home-sidebar-integration.md`
- 근거 퍼블리싱 산출물: `docs/publish/publish-20260710-home-sidenav-view.md` (`DesktopSideNavView.tsx` 계약)
- 구현 범위: 계획의 **writer 담당 단계 1, 3, 4, 5, 6, 7**. 2단계(`DesktopSideNavView.tsx`, publisher 담당)는 소비만 하고 수정하지 않음.

## 구현한 단계

### 1단계 — `navConfig` 공용 내비 설정
- `components/common/navConfig.ts` 신규.
- `NavConfigItem` discriminated union(`route` | `action`) + `navConfig` 배열(홈/채팅/만들기/내 작업실/수익내역) + `getActiveKey(pathname)`.
- 아이콘은 lucide로 통일: `Home / MessageCircle / UserRoundPlus / FolderOpen / HandCoins`.
- **'내 작업실' 아이콘 결정**: 계획이 제시한 `LayoutGrid` / `FolderOpen` 중 `FolderOpen` 선택. "임시저장 캐릭터 작업 공간"이라는 의미에 `LayoutGrid`(그리드 뷰)보다 `FolderOpen`(작업 중인 폴더)이 더 부합한다고 판단.
- `getActiveKey`는 route 항목만 대상으로 판정하며, `href==='/'`는 정확히 일치할 때만, 그 외는 `startsWith` + href 길이 내림차순 정렬로 가장 구체적인 항목을 우선한다.

### 3단계 — `DesktopSideNav.tsx` 컨테이너
- `components/common/DesktopSideNav.tsx` 신규(`'use client'`).
- `usePathname`/`useAccountStore`(isLogin, loginType)로 게이팅, `useModalStore`(`@/shared/model/stores/useModalStore`)로 `socialLogin`/`chatModeSelect` 오픈, `useRouter().push`로 route 이동.
- `pathname.startsWith('/chat/') && pathname !== '/chat-list'`에서 `null` 반환(MobileGNB 규칙 재사용).
- `navConfig` → `SideNavItemView[]` 매핑(`isActive = item.key === activeKey`) 후 `DesktopSideNavView`에 `items`/`onItemClick`으로 배선. View 파일은 수정하지 않음.

### 4단계 — `AppShell` + `app/layout.tsx` 마운트
- `components/common/AppShell.tsx` 신규, `app/layout.tsx`의 `div.flex-1#main-content` 래핑을 `<AppShell>{children}</AppShell>`로 교체.
- **핵심 결정(계획과 다른 점)**: 계획 원문은 `<DesktopSideNav />`를 `md:pl-32` 콘텐츠와 단순 형제로 렌더하도록 되어 있으나, `app/layout.tsx`의 상위 래퍼가 `flex flex-col`이고 `DesktopSideNavView`가 `sticky`(퍼블리셔 확정 마크업, `fixed` 아님)만 쓰기 때문에 그대로 두면 사이드바와 본문이 **수평이 아니라 수직으로 쌓이는** 레이아웃 버그가 발생함을 확인. `DesktopSideNavView.tsx`를 수정하지 않는 제약 하에, `AppShell` 내부에서 사이드바를 `<div className='md:fixed md:inset-y-0 md:left-0 md:z-40'>`로 감싸 **md 이상에서만 플로우 밖으로 고정**시키고, 본문 `md:pl-32`로 그 폭(128px)을 보정하도록 조정. 계획의 "사이드바는 Header(z-50)와 겹치지 않는 좌측 고정" 문구와 정합.
- 채팅 상세(`showSideNav=false`)에서는 `md:pl-32`도 제거해 몰입형 보존. `MobileGNB`/`DraggableButton`/`ToastPortal`은 기존 위치 유지.

### 5단계 — `components/common/header.tsx`
- 데스크톱 nav(홈/대화/캐릭터 만들기/수익 관리) 블록 제거, `navLinks` 배열은 `HeaderSidebar` prop 타입 호환용으로 빈 배열만 유지(`HeaderSidebar`는 navLinks를 렌더에 쓰지 않음, 계획 확인 사항 그대로).
- 상점을 세이프티 필터 토글 옆으로 이동, 아이콘화(`faStore`, `/shop-recharge`, 로그인 게이팅 유지, `aria-label='상점'`).
- 데스크톱 로고 중복 방지: 좌측 로고 `Link`에 `md:hidden` 추가(계획 확인 사항 #3 권장안 적용).
- 정리: `navLinks`에서만 쓰였던 `faHome`/`faComment`/`faChartLine` import 제거. `handleNavLinkClick`은 `handleShopClick`으로 대체.

### 6단계 — `components/common/MobileGNB.tsx`
- 자체 `navLinks` 배열을 `navConfig` 공유로 교체, 5항목(홈·채팅·만들기·내 작업실·수익내역) 통일.
- '만들기'는 액션형이므로 `<button>`으로, route 항목은 `<Link>`로 렌더(계획의 "대안" 채택: route→Link, action→button 분기). 클릭 핸들러(`handleNavItemClick`)를 공유해 게이팅(`requireLogin`/`loginTypeCheck`)·액션 오픈(`chatModeSelect`) 로직을 DesktopSideNav와 동일 규칙으로 통일.
- 활성 판정을 `getActiveKey(pathname) === item.key` 기반으로 교체. `/chat/` null 처리·body padding·모달 스토어(`@/shared/model/stores/useModalStore`) 그대로 유지. `grid-cols-5` 마크업/스타일은 변경하지 않음(레이아웃 재설계 아님, 데이터·클릭 로직만 교체).

### 7단계 — `LimitCharacterModal` 전역 등록 (옵션 A)
- `src/shared/ui/modal/GlobalLimitCharacterModal.tsx` 신규: `LimitCharacterModal`(로컬 isOpen/onClose 패턴)을 전역 레지스트리에 맞게 얇게 어댑트(`isOpen` 항상 true, `onClose={closeModal}`). GlobalModalHost는 store `modals` 배열에 있는 항목만 렌더하므로 "렌더된다 = 열려 있다"를 그대로 이용.
- `GlobalModalHost.tsx`의 `MODAL_COMPONENTS`에 `limitCharacter` 등록.
- `ChatModeSelectModal.tsx`: `onLimitError`를 optional로 완화, `handleModeSelect`의 `err===4` 분기에서 `onLimitError?.()` 호출 후 `openModal({ type: 'limitCharacter' })` 추가.
- `views/my-characters/home.tsx` 정리(계획의 "선택" 항목이지만, 로컬 상태를 남기면 `onLimitError` 콜백과 전역 모달이 동시에 열려 **중복 모달**이 뜨는 회귀가 확실했으므로 정리 진행):
  - 로컬 `isLimitModalOpen` state·`LimitCharacterModal` import·렌더 제거.
  - 목록 로드 기반 프리체크(`inProgressData?.result.err === 4`)를 `openModal({ type: 'limitCharacter' })`로 교체(로컬 모달 대신 전역 모달 사용, 기존 동작 보존).
  - `handleCreateCharacter`에서 `onLimitError` prop 전달 제거(전역에서 자동 처리).

## 변경 파일
- `components/common/navConfig.ts` (신규) — 1단계 navConfig/getActiveKey.
- `components/common/DesktopSideNav.tsx` (신규) — 3단계 컨테이너.
- `components/common/AppShell.tsx` (신규) — 4단계 셸 + 레이아웃 정합 보정.
- `app/layout.tsx:10,108-109` — AppShell 마운트.
- `components/common/header.tsx:4-16,87-98,156-175,180-196` — 데스크톱 nav 제거, 상점 아이콘 이동, 로고 md:hidden.
- `components/common/MobileGNB.tsx` (전체 재작성) — 6단계 navConfig 통일.
- `src/shared/ui/modal/GlobalLimitCharacterModal.tsx` (신규) — 7단계 전역 어댑터.
- `src/shared/ui/modal/GlobalModalHost.tsx:16,39` — `limitCharacter` 등록.
- `src/shared/ui/modal/ChatModeSelectModal.tsx:13-19,24,44-48` — `onLimitError` optional화 + 전역 모달 오픈.
- `views/my-characters/home.tsx:6,8,20,31-36,91-95,136-138` — 로컬 한도 모달 정리, 전역 경로로 대체.

## 검증 결과
- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome check` — 신규/수정 파일 모두 통과. 남은 warning/error(예: `header.tsx`의 `SimpleToggle` 버튼 `type` 미지정, `layout.tsx`의 viewport 스크립트 `dangerouslySetInnerHTML`, `home.tsx`의 `handleCardClick`/`CharbotInprogressResponse` 미사용)는 **모두 이번 diff 이전부터 존재하던 사전 이슈**(git diff로 미변경 라인임을 확인)이며 이번 작업 범위 밖.
- 수동 브라우저 검증(360/768/1280px 실측)은 미수행 — dev 서버 구동 후 사용자/QA 확인 필요.

## 계획과 달라진 점
1. **AppShell 레이아웃 보정(핵심)**: 계획 원문은 `<DesktopSideNav />`를 `main-content`와 단순 형제로 렌더하라고 했으나, 상위 래퍼가 `flex-col`이고 View가 `sticky`(fixed 아님)라 그대로 두면 사이드바·본문이 수직으로 쌓이는 버그가 생김을 확인. `DesktopSideNavView.tsx`(publisher 파일)는 수정하지 않는 제약 하에, `AppShell` 내부 래퍼에 `md:fixed md:inset-y-0 md:left-0 md:z-40`를 추가해 플로우에서 분리하고 `md:pl-32`로 폭을 보정하도록 조정함. 계획의 "사이드바는 Header(z-50)와 겹치지 않는 좌측 고정" 의도와는 부합하나, 계획 문서에 이 구체적 방식이 명시돼 있지 않았으므로 **확인 필요** 항목으로 표시.
2. **'내 작업실' 아이콘**: `FolderOpen`으로 확정(계획은 `LayoutGrid`/`FolderOpen` 중 writer 판단으로 위임).
3. **`views/my-characters/home.tsx` 로컬 정리**: 계획은 "선택"으로 남겼으나, 정리하지 않으면 로컬 모달과 전역 모달이 동시에 열리는 회귀가 확정적이라 판단해 정리를 진행함.

## 미완 / 후속 필요
- **수동 반응형 검증 미수행**: 360/768/1280px 실측, `/chat/{id}` 진입 시 사이드바·MobileGNB·좌측 여백 동시 소거 확인, 만들기 클릭→모달→모드 선택→편집 페이지 이동 QA, 한도 초과 계정에서 전역 `limitCharacter` 모달 노출 확인은 dev 서버 기동 후 수동으로 재확인 필요.
- **`GlobalLimitCharacterModal`의 종료 애니메이션**: `isOpen`을 항상 `true`로 고정한 얇은 래퍼라, 모달이 store 배열에서 제거될 때 `BaseModal` 내부 `AnimatePresence`(isOpen 플립 기반)가 아니라 `GlobalModalHost` 바깥쪽 `AnimatePresence`(컴포넌트 unmount 기반)로 종료 처리된다. 기능상 정상 동작하지만 페이드아웃 디테일이 다른 전역 모달과 미세하게 다를 수 있음 — 시각적 확인 필요.
- Header의 `SimpleToggle` 버튼 `type` 미지정, viewport 스크립트의 `dangerouslySetInnerHTML`, `home.tsx`의 미사용 `handleCardClick`/`CharbotInprogressResponse` — 모두 이번 변경 이전부터 있던 이슈로 범위 밖이지만, 다음 정리 작업 시 참고용으로 남김.
