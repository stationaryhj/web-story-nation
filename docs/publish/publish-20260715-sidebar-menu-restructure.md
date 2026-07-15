# Publish — 사이드바 메뉴 재구성: Top바 상점 아이콘 제거

- 작성 일자: 2026-07-15
- 근거 계획: `docs/plan/plan-20260715-sidebar-menu-restructure.md` (2단계, `[담당: publisher]`)
- 근거 Q&A: `docs/q&a/qa-20260715-sidebar-menu-restructure.md` — Q1·Q2·Q3 모두 안 1(기본 가정) 채택 확정 (해당 결정은 1단계 `navConfig.ts`(writer 담당)에 적용되는 것으로, 본 작업(2단계 header.tsx)에는 직접적 로직 영향 없음. 상점 게이팅 정책 계승(Q3)만 참고).
- 담당 범위: **2단계(Top바 상점 아이콘 제거)만**. 1단계(`navConfig.ts` 재구성)는 writer 담당이라 손대지 않음.

## 구현 범위
- **구현함**: `components/common/header.tsx`에서 상점(펜충전) 아이콘 `<Link href='/shop-recharge'>` 블록과 관련 주석, 종속 `handleShopClick` 핸들러, `faStore` import를 제거.
- **미구현/범위 밖**: `navConfig.ts` 등 1단계는 writer 담당이라 미수정. `NavConfigActionItem` 타입, `chatModeSelect` 분기, 헤더의 알림/설정/장바구니/햄버거/로고 등 상점 외 요소는 계획대로 손대지 않음.

## 변경 파일
- `components/common/header.tsx:11` — import 목록에서 `faStore` 제거(단독 라인 삭제).
- `components/common/header.tsx:46-53`(수정 전 기준) — 상점 클릭 시 로그인 게이팅용 `handleShopClick` 핸들러 전체 삭제(주석 `// 상점 아이콘 클릭 시 로그인 게이팅.` 포함).
- `components/common/header.tsx:118-128`(수정 전 기준) — 상점 아이콘 `<Link href='/shop-recharge' onClick={handleShopClick}>...</Link>` 블록 및 안내 주석(`{/* 상점 - 데스크톱 nav 제거에 따라... */}`) 삭제. 우측 액션 그룹(`<div className='flex items-center md:space-x-4 gap-1'>`)의 첫 자식이 다크모드 토글 주석 처리 블록으로 바로 이어짐.

`openNewModal`은 `onClickSettingLink`에서 계속 사용하므로 유지, `isLogin`도 `onClickSettingLink`·`HeaderSidebar` prop 전달에서 계속 사용하므로 유지. 그 외 원래부터 미사용이던 import(`faBell`, `faCog`, `faFire`, `faMoon`, `faSignOutAlt`, `faTimes`, `faVideo`, `AnimatePresence`, `FadeIn` 등)는 계획의 "최소 변경" 원칙에 따라 손대지 않음.

## 반응형 / 웹뷰 점검
- 우측 액션 그룹은 `flex items-center md:space-x-4 gap-1` 컨테이너로, 상점 버튼 제거 후에도 다크모드 토글(주석 처리 상태 유지)→알림 버튼→내 정보(`hidden md:block`)→장바구니(`hidden sm:visible`)→햄버거(`md:hidden`) 순서와 반응형 노출 조건은 변경되지 않음. 아이콘 하나가 줄어든 것뿐이라 `gap-1`/`space-x-4` 간격 로직에는 영향 없음.
- **360px**: 모바일 폭 기준 노출되는 요소는 알림 버튼 + 햄버거 버튼(`md:hidden`)뿐. 상점 아이콘 제거로 오히려 우측 그룹이 더 여유로워져 가로 스크롤/겹침 위험 없음(코드 레벨 확인, 실기기 미검증).
- **768px**: `md` 이상이라 내 정보 버튼(`hidden md:block`)이 노출되고 햄버거는 숨김. 상점 아이콘이 없어도 알림→내 정보→장바구니 순서 정렬 유지, `justify-between` 헤더 레이아웃 깨짐 없음.
- **1280px**: `lg` 이상에서도 동일 그룹 구조 유지, 여백 축소로 인한 시각적 변화만 있고 레이아웃 붕괴 요소 없음.
- **웹뷰 고려**: 제거된 상점 아이콘은 `<Link>`(인앱 라우팅)였으므로 `window.open` 등 새 창 이슈는 원래도 없었음. 상점 진입점이 사이드바/GNB(`navConfig` 소비)로 일원화되어 웹뷰에서도 기존과 동일한 인앱 네비게이션 방식 유지(계획 1단계 완료 시).

## 검증
- `npx tsc --noEmit`: `header.tsx` 관련 에러 없음(그룹 필터링 결과 0건). 단, `components/common/navConfig.ts:73`에서 `Cannot find name 'FolderOpen'` 에러가 발생 — 이는 1단계(writer 담당, `navConfig.ts`)의 미완료/진행 중 상태로 보이며 **본 작업(header.tsx)과 무관**. header.tsx 단독으로는 타입 문제 없음.
- `npx biome lint components/common/header.tsx`: 경고 4건 발생하나 모두 **작업 전부터 존재하던 사전 경고**임을 확인:
  - `noUnusedImports`: `faBell, faCog, faFire, faMoon, faSignOutAlt, faTimes, faVideo` (faStore 제거와 무관하게 원래도 미사용)
  - `noUnusedImports`: `AnimatePresence`, `FadeIn` (원래도 미사용)
  - `noUnusedFunctionParameters`: 햄버거 버튼 `onClick={(e) => ...}`의 `e` (원래도 미사용, 변경하지 않은 기존 코드)
  - 세션 시작 시점(직전 세이프티 필터 제거 작업 이후)의 파일 내용을 기준으로 대조한 결과, 이 4건은 모두 내 변경 이전부터 존재하던 경고이며 **이번 변경으로 새로 늘어난 경고는 없음**. `faStore`/`handleShopClick` 자체는 깨끗이 제거되어 관련 미사용 경고는 발생하지 않음.

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- 없음(계획의 2단계 범위를 그대로 구현). 1단계(`navConfig.ts`, writer 담당)가 아직 미완료(FolderOpen import 관련 타입 에러 존재)로 보이므로, writer 작업 완료 후 전체 `npx tsc --noEmit` 재검증이 필요함(header.tsx는 본 작업으로 이미 클린 상태).
