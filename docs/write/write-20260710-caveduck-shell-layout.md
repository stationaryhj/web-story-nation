# caveduck식 셸 레이아웃 재구성 구현 (writer 2·4단계)

- 작성 일자: 2026-07-10
- 근거 계획: `docs/plan/plan-20260710-caveduck-shell-layout.md`
- 구현 범위: **2단계(AppShell 셸 재구성, 담당: writer)**, **4단계(16개 페이지 `<Header/>` 제거, 담당: writer)**
- 미구현(다른 담당): 1단계(`DesktopSideNavView.tsx`, 담당: publisher) · 3단계(`header.tsx`, 담당: publisher) — 확인 결과 두 파일 모두 publisher가 이미 계획대로 완료한 상태였음(레일 `w-20` 세로 배치, Header `w-full px-4 py-3`). 손대지 않음.

## 변경 파일

### 2단계 — 셸 재구성
- `components/common/AppShell.tsx:1-48` — 전면 재구성.
  - `import Header from './header'` 추가, `<Header/>`를 셸 최상단에 1회 마운트(prop-less 그대로 사용).
  - `showSideNav` 판정을 `isImmersive` 변수로 분리(`/chat/[id]`이면서 `/chat-list`가 아닌 경우)하고, 이 값으로 **Header·레일·본문 `pl` 3가지를 모두** 조건 적용.
  - 레일 wrapper: `md:fixed md:inset-y-0 md:left-0 md:z-40` → `hidden md:fixed md:top-16 md:bottom-0 md:left-0 md:z-40 md:block`(헤더 4rem 아래에서 시작, z-40으로 Header z-50 아래 유지).
  - 본문: `md:pl-60` → `md:pl-20`(레일 폭 계약 w-20과 정합).
  - 파일 상단 주석을 이번 계획(`plan-20260710-caveduck-shell-layout.md`) 근거·폭 계약(w-20/pl-20/top-16)으로 갱신.
  - `app/layout.tsx`의 `div.flex.min-h-screen.flex-col` 래핑을 확인해 `<Header/>`가 AppShell의 첫 플로우 자식으로 렌더되므로 `sticky top-0`가 정상 동작함을 검증(구조 변경 없음, 확인만).

### 4단계 — 16개 페이지 `<Header/>` 제거
계획 명시 목록(15개 파일, `views/chat/home.tsx`는 이미 주석 처리되어 대상에서 제외) 전수 처리. 각 파일에서 `import Header from '@/components/common/header'`와 `<Header />` JSX를 제거했고, 이로 인해 불필요해진 `<>...</>`/개행만 함께 정리(레이아웃 마크업 구조·className은 건드리지 않음):

- `views/main/home.tsx:6,73` — import·렌더 제거.
- `views/chat-list/home.tsx:13,403` — import·렌더 제거.
- `views/search/home.tsx:5,200` — import·렌더 제거.
- `src/views/my-characters/edit/ui/Edit.tsx:5,41-46` — import·렌더 제거, 불필요해진 `<>...</>` 래퍼를 `return <EditStory />;`로 단순화(자식이 1개뿐이라 프래그먼트 불필요 — 최소 변경 판단).
- `app/(routes)/author/[id]/page.tsx:3,17` — import·렌더 제거(상위 `<div className='flex min-h-screen flex-col'>`는 유지).
- `app/(routes)/my-profile/page.tsx:3,25-30` — import·렌더 제거, `<>...</>` 단순화(`return <MyProfileView />`).
- `app/(routes)/live/page.tsx:2,9-13` — import·렌더 제거, 단순화(`return <LiveChatPage />`).
- `app/(routes)/my-characters/page.tsx:4,8-11` — import·렌더 제거, 단순화(`return <MyCharacterPage />`).
- `app/(routes)/my-account/page.tsx:1,6-9` — import·렌더 제거, 단순화(`return <MyAccountView />`).
- `app/(routes)/my-characters/create/page.tsx:2,6-9` — import·렌더 제거, 단순화(`return <CreateCharacterPage />`).
- `app/(routes)/shop-recharge/page.tsx:2,7-10` — import·렌더 제거, 단순화(`return <ShopRecharge />;`).
- `app/(routes)/settings/page.tsx:4,14` — import·렌더 제거(`<PageTransition><div className="flex flex-col min-h-screen"><main .../></div></PageTransition>` 구조는 유지).
- `app/(routes)/payment/page.tsx:5,37-38` — import·렌더 제거(`<main>` 이하 구조 유지).
- `app/(routes)/payment/success/page.tsx:14,181-182` — import·렌더 제거.
- `app/(routes)/payment/fail/page.tsx:9,95-96` — import·렌더 제거.

`<>...</>` 프래그먼트를 단일 자식 `return <X />`로 단순화한 파일들은 Header 제거로 프래그먼트가 자식 1개만 남게 되어 불필요해진 것으로, 마크업 구조 변경이 아니라 로직상 자연스러운 정리로 판단(publisher 영역인 className/레이아웃 재편에는 해당하지 않음). 이견이 있으면 프래그먼트를 되돌릴 수 있음.

## Header 전역 마운트 방식
- `AppShell.tsx`에서 `<Header/>`를 조건부(`!isImmersive`)로 1회 렌더. Header는 `export default function Header()`(prop-less) 시그니처를 그대로 사용하므로 인자 배선이 필요 없음.
- `/chat/[id]`(단, `/chat-list`는 제외)에서는 `isImmersive=true`가 되어 Header·레일·`pl-20` 세 가지 모두 미적용 — 기존 `views/chat/home.tsx`의 Header 주석 처리 상태와 정합.

## 검증 결과
- **grep 교차검증**: `<Header|import Header|from '.../header'` 전수 검색 결과, 활성 렌더는 `components/common/AppShell.tsx:37` **1곳**만 남음. 그 외 매치는 모두 스코프 제외 대상과 정확히 일치:
  - `views/chat/home.tsx:4,67` — 주석 처리(변경 없음, 계획상 몰입형 유지 대상).
  - `components/layout/provideLayout.tsx:8` — dead code(어디서도 import되지 않음, 스코프 밖).
  - `app/(routes)/payment/page-origin.tsx:6,75` — 비라우트 백업(스코프 밖).
  - `components/common/header.tsx:24` — `HeaderSidebar`(별개 컴포넌트, Header 자신의 import) — 무관.
- **`npx tsc --noEmit`**: 통과(에러 없음). Header 제거로 인한 미사용 import 에러 없음.
- **`npx biome check`**(변경 파일 대상): `components/common/AppShell.tsx`는 완전히 클린. 나머지 14개 페이지 파일에서 다수의 lint/format 경고·에러가 나오지만, `git diff`로 대조한 결과 모두 **내가 건드리지 않은 기존 라인**에서 발생(예: `useButtonType`, `noUnusedImports/Variables`, `useHookAtTopLevel`(소문자 컴포넌트명 오탐), CRLF/세미콜론 없는 파일 전체 포맷 드리프트). 내가 추가/삭제한 라인(Header import·JSX 제거, 프래그먼트 단순화)은 새 에러를 유발하지 않음을 각 파일 diff로 확인. CLAUDE.md의 "최소 변경(무관한 사전 이슈 수정 금지)" 원칙에 따라 이 사전 이슈들은 손대지 않음.

## 계획과 달라진 점 / 미완·후속 필요
- 계획 본문 제목은 "16개 페이지"이나 명시된 처리 목록은 15개 파일(`views/chat/home.tsx`는 이미 주석 상태로 별도 언급) — 실제로는 목록의 15개 파일만 편집 대상이었고 그대로 처리함. 개수 표기상 혼선이나 실질적 범위 차이는 없음.
- `src/views/my-characters/edit/ui/Edit.tsx`·`my-profile/page.tsx`·`live/page.tsx`·`my-characters/page.tsx`·`my-account/page.tsx`·`my-characters/create/page.tsx`·`shop-recharge/page.tsx`: Header 제거로 프래그먼트(`<>...</>`)가 단일 자식만 남아 `return <X />` 형태로 단순화함(계획에 명시적 지시는 없었으나 "최상위 래퍼 유지" 취지에 부합하는 최소 정리로 판단). 문제가 있으면 프래그먼트로 되돌릴 수 있음.
- 후속 QA 필요(계획의 "검증 방법"에 명시된 시각 회귀 점검 — 코드 관점 검증은 완료했으나 실제 브라우저 렌더 확인은 별도 필요):
  - 360/768/1280/1920px에서 Header 단일 렌더·레일 오프셋(헤더 4rem 아래 시작)·본문 `pl-20` 정합·가로 스크롤 없음 확인.
  - `views/main/home.tsx`(검색바 `pt-6`), `views/chat-list/home.tsx`(`py-6`) 등 상단 콘텐츠가 전역 Header 아래에서 잘리지 않는지 실측.
  - `/chat/[id]`에서 Header·레일·`pl-20` 모두 사라지고 몰입형 전폭 유지되는지, `/chat-list`에서는 정상적으로 Header·레일이 노출되는지 확인.
  - 레일 활성 항목 하이라이트·라우팅/게이팅/모달 동작은 publisher(1단계)·기존 `DesktopSideNav` 로직 불변이므로 별도 회귀 없을 것으로 예상되나 실제 클릭 동작 확인 권장.
