# 구현 기록 — 사이드바 메뉴 재구성 (navConfig 재구성, writer 단계)

- 작성 일자: 2026-07-15
- 근거 계획: `docs/plan/plan-20260715-sidebar-menu-restructure.md` (1단계, 담당: writer)
- 근거 Q&A: `docs/q&a/qa-20260715-sidebar-menu-restructure.md` (Q1·Q2·Q3 모두 안 1 채택)
- 구현 범위: 계획의 **1단계(navConfig 재구성, writer 담당)만** 구현. 2단계(Top바 상점 아이콘 제거, `header.tsx`, 담당: publisher)는 **미구현**(범위 밖, publisher 담당).

## 구현 내용
- `components/common/navConfig.ts` 단독 수정.
  - import: `FolderOpen` 제거, `Store` 추가 → `import { HandCoins, Home, MessageCircle, Store, UserRoundPlus } from 'lucide-react';`
  - `create`('만들기') 항목: `kind: 'action'` + `action: 'chatModeSelect'` → `kind: 'route'` + `href: '/my-characters'` 로 전환. key `'create'`, 라벨 '만들기', 아이콘 `UserRoundPlus`, `requireLogin: true`, `loginTypeCheck: true` 그대로 유지.
  - `studio`('내 작업실') 항목 삭제.
  - 배열 맨 끝에 `shop` 항목 신규 추가: `kind: 'route'`, key `'shop'`, label `'상점'`, `href: '/shop-recharge'`, icon `Store`, `requireLogin: true`(loginTypeCheck 없음, 계획/Q3 안 1대로 헤더의 `!isLogin`만 검사하던 정책 계승).
  - 최종 배열 순서: 홈 → 채팅 → 만들기(route) → 수익내역 → 상점. 5개 항목 유지.
  - 파일 상단 주석과 `getActiveKey()` 위의 주석을 실제 구조에 맞게 갱신("만들기는 chatModeSelect 액션형" 문구 제거, "action 항목(만들기)은 라우트가 없어…" → "action 항목(현재 정의된 항목 없음)은…"로 수정).
- `NavConfigActionItem` 타입은 계획의 최소 변경 원칙(Q&A #5/계획 5번, "범위 밖")에 따라 **그대로 유지**했다. 사용처가 없어져도 타입 자체는 무해한 죽은 코드이며, `NavConfigItem` 유니온에 남아 있어도 컴파일 에러가 발생하지 않음을 `tsc --noEmit`으로 확인했다.

## 컨테이너/GNB 소비부 코드 레벨 확인 (수정 없음)
- `components/common/DesktopSideNav.tsx`: `navConfig.map`으로 `SideNavItemView[]`를 만들고 `handleItemClick`이 `item.kind === 'route'` → `router.push(item.href)`, `item.kind === 'action' && item.action === 'chatModeSelect'` → 모달 오픈 분기. 항목 키를 하드코딩 참조하는 곳 없음 → config 변경만으로 정상 동작. action 분기는 이제 실행되지 않는 죽은 코드가 되지만 타입/런타임 모두 안전.
- `components/common/MobileGNB.tsx`: `grid grid-cols-5`에 `navConfig.map`, route는 `<Link>`, action은 `<button>`로 렌더. 항목 수 5개 유지되어 `grid-cols-5`와 정합. 하드코딩 키 참조 없음 → 정상 동작.
- `app/(routes)/demo/home/page.tsx:32`의 `key: 'studio'`는 자체 하드코딩 데모 nav(SVG 아이콘, navConfig 미공유)로 이번 변경과 무관함을 재확인(grep으로 `navConfig` import 없음 확인).
- 문제 없음 — 별도 조치 불필요.

## 변경 파일
- `components/common/navConfig.ts` — 1~103행 전반: import 정리, `create`(action→route) 전환, `studio` 삭제, `shop` 신규 추가, 주석 갱신.

## 검증 결과
- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome check components/common/navConfig.ts` — 통과("No fixes applied").
- 수동 시나리오(계획서 검증 방법 중 navConfig 소비부 해당 항목)는 코드 레벨로만 확인(정적 분석), 실제 브라우저 수동 클릭 시나리오는 미수행 — 필요 시 QA 단계에서 확인 필요.
- `header.tsx` Top바 상점 아이콘 제거(2단계, publisher 담당)는 이번 작업에서 손대지 않았으므로, 전체 계획이 완결되려면 publisher가 해당 단계를 별도로 진행해야 함.

## 계획과 달라진 점 / 미완 · 후속 필요
- `getActiveKey()` 상단 주석 문구를 계획서에 명시된 예시("만들기는 chatModeSelect 모달을 여는 액션형" 등)보다 한 곳 더(하단 함수 주석) 손질했다 — 계획 취지(주석이 실제와 어긋나지 않게 갱신)에 부합하는 추가 정합화이며 범위 이탈 아님.
- 2단계(header.tsx 상점 아이콘 제거)는 담당(publisher) 범위이므로 미구현. 계획 전체 완결을 위해 후속으로 publisher 작업 필요.
- 그 외 계획과 달라진 점 없음.
