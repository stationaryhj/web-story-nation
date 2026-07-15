# 사이드바 메뉴 재구성 — 만들기→내 작업실 통합 · 상점 항목 추가 · Top바 상점 아이콘 제거

- 작성 일자: 2026-07-15
- 대상 브랜치: red-main (현재 작업 트리 기준)
- 목표 한 줄 요약: 사이드바 '만들기'를 `/my-characters`(구 내 작업실 목적지)로 연결하고 '내 작업실'을 제거하며, 사이드바 끝에 '상점'(`/shop-recharge`)을 추가하고 Top바의 상점 아이콘을 제거한다.

## 목표
공용 내비게이션(`navConfig`)에서 '만들기' 항목을 라우트형(`/my-characters`)으로 전환하고 '내 작업실'을 제거하며 '상점'(`/shop-recharge`) 항목을 추가하고, Top바(헤더)의 중복된 상점 아이콘을 제거해 상점 진입점을 사이드바/GNB로 일원화한다.

## 확인 필요 사항
> 사용자에게 docs/q&a로 전달 예정. 아래는 계획 확정을 위한 열린 질문이며, 답이 없으면 각 항목의 "기본 가정"으로 진행한다.

1. **MobileGNB 동시 반영**: `navConfig`는 DesktopSideNav와 MobileGNB가 **공유**한다(`navConfig.ts:2`). 따라서 이번 변경은 모바일 하단 GNB에도 그대로 반영되어, 모바일 GNB도 `내 작업실`이 사라지고 `상점`이 추가된다(순서: 홈/채팅/만들기/수익내역/상점, 5칸 유지). **기본 가정: 모바일 GNB도 동일하게 반영(일관성 유지, 별도 분기 없음).** 만약 모바일 GNB는 기존(내 작업실 유지)으로 두어야 한다면 config 분기가 필요하니 알려주세요.
2. **'만들기'를 라우트로 바꿀 때 활성 하이라이트**: `/my-characters` 진입 시 '만들기' 항목이 활성(하이라이트)된다. 라벨이 '만들기'인데 목적지가 작업실이라 활성 하이라이트가 뜨는 것이 자연스러운지 확인. **기본 가정: 자연스러움(그대로 진행).**
3. **'만들기'의 로그인 게이팅 유지**: 기존 '내 작업실'과 '만들기' 모두 `requireLogin:true`(+ `loginTypeCheck:true`, 단 현재 게이팅 로직은 `loginTypeCheck`를 실제로 강제하지 않음, `DesktopSideNav.tsx:43-48` 주석 참조). **기본 가정: 기존 값 그대로 계승.**
4. **상점 항목 게이팅**: Top바 상점은 `!isLogin` 시 socialLogin 모달을 띄웠다(`header.tsx:48-53`). 사이드바 상점도 동일하게 `requireLogin:true`로 둔다. **기본 가정: `requireLogin:true`(loginTypeCheck 없음 — 헤더는 isLogin만 검사했음).**
5. **미사용 액션 인프라 정리 범위**: 이번 변경으로 `navConfig`에 `action` 항목이 하나도 남지 않는다(만들기가 route로 전환). `NavConfigActionItem` 타입과 컨테이너/GNB의 `chatModeSelect` 분기는 **동작상 무해하게 남는 죽은 코드**가 된다. **기본 가정: 최소 변경 원칙에 따라 타입/분기 코드는 유지(제거는 범위 밖).** `chatModeSelect` 모달 자체는 `/my-characters` 페이지(`views/my-characters/home.tsx:94`)에서 계속 사용되므로 절대 제거하지 않는다.

## 현황 파악
- **공용 nav 정의**: `components/common/navConfig.ts:41-85` — 현재 5개 항목(home/chat/create(action:chatModeSelect)/studio(/my-characters)/revenue(/my-account)). `getActiveKey()`(`:92-102`)는 route 항목의 href prefix로 활성 키 판정, `/`는 완전일치 특례.
  - import: `FolderOpen, HandCoins, Home, MessageCircle, UserRoundPlus`(`:16`). `FolderOpen`은 studio 전용, `UserRoundPlus`는 create 전용.
- **데스크톱 컨테이너(로직)**: `components/common/DesktopSideNav.tsx` — `navConfig`를 map해 View에 전달(`:32-37`), `handleItemClick`이 게이팅(`requireLogin && !isLogin` → socialLogin)·route push·action(chatModeSelect) 분기(`:39-58`). **config만 바꿔도 자동 반영**되는 구조.
- **데스크톱 View(표시)**: `components/common/DesktopSideNavView.tsx` — dumb view, `items` + `onItemClick(key)`만 받음. **항목 추가/삭제는 config만으로 반영, View 수정 불필요.**
- **모바일 GNB(공유)**: `components/common/MobileGNB.tsx:73-105` — `grid grid-cols-5`(`:73`)에 `navConfig`를 map. route는 `<Link>`, action은 `<button>`로 렌더. 게이팅/액션 분기는 `handleNavItemClick`(`:40-55`). **항목 수가 5개로 유지되면 grid-cols-5 그대로 정합**(변경 후 홈/채팅/만들기/수익내역/상점 = 5개). **MobileGNB 코드 수정 불필요.**
- **Top바 상점 아이콘**: `components/common/header.tsx:117-128` — `<Link href='/shop-recharge' onClick={handleShopClick}>` + `faStore`. `handleShopClick`(`:47-53`)은 `!isLogin` 시 `openNewModal({type:'socialLogin'})`. `faStore` import는 `:12`.
  - `openNewModal`은 `onClickSettingLink`(`:77-83`)에서도 사용 → 제거 대상 아님.
  - `faStore`/`handleShopClick`는 상점 블록에서만 사용(grep 확인) → 상점 블록 제거 시 함께 제거해야 lint(미사용) 통과.
- **chatModeSelect 모달**: `src/shared/ui/modal/ChatModeSelectModal.tsx` + `GlobalModalHost.tsx`. 사용처는 사이드바/GNB 외에 **`views/my-characters/home.tsx:94`(만들기 버튼)** 이 존재 → 만들기를 route로 바꿔도 모달은 살아있음(dead code 아님).
- **무관 확인**: `app/(routes)/demo/home/page.tsx:32`의 `key:'studio'`는 자체 하드코딩 데모 nav(SVG 아이콘)로 navConfig 미공유 → 영향 없음.

## 접근 방식
**추천안: navConfig 단일 소스만 수정 + header.tsx 상점 블록 제거.** 데스크톱 사이드바와 모바일 GNB가 모두 `navConfig`를 소비하므로, config 배열 하나만 바꾸면 양쪽에 동시 반영된다. View/컨테이너/GNB 렌더 코드는 손대지 않는다(최소 변경). Top바는 표시 요소(아이콘 블록)와 그에 종속된 핸들러/ import만 제거.

- '만들기' 항목: **key `create` 유지**, `kind`를 `action`→`route`, `href:'/my-characters'`, **아이콘 `UserRoundPlus` 유지**(라벨 '만들기'와 의미 정합), 라벨 '만들기' 유지. (대안: key를 `studio`로 바꾸는 방법도 있으나 라벨이 '만들기'이므로 `create` 유지가 의미상 자연스럽고 변경 폭도 동일 — `create` 유지 권장.)
- '내 작업실'(`studio`) 항목: **삭제**. 관련 `FolderOpen` import 제거.
- '상점' 항목: 배열 **맨 끝**에 추가. `kind:'route'`, key `shop`, `href:'/shop-recharge'`, 아이콘 lucide `Store`, 라벨 '상점', `requireLogin:true`.

액션 인프라(`NavConfigActionItem` 타입, 컨테이너/GNB의 chatModeSelect 분기)는 **유지**(제거는 3파일 횡단 변경이라 최소 변경 원칙에서 벗어남, 무해한 죽은 코드로 남김 — 범위 밖).

## 실행 계획 (단계별)
1. **navConfig 재구성** `[담당: writer]` — `components/common/navConfig.ts`
   - import 수정: `FolderOpen` 제거, `Store` 추가. 최종 `import { HandCoins, Home, MessageCircle, Store, UserRoundPlus } from 'lucide-react';`
   - 배열(`:41-85`) 재구성(최종 순서 = 홈→채팅→만들기→수익내역→상점):
     1. `home` (route `/`, requireLogin:false) — 유지
     2. `chat` (route `/chat-list`, requireLogin:true) — 유지
     3. `create` — **`kind:'route'`, `href:'/my-characters'`, label '만들기', icon `UserRoundPlus`, requireLogin:true, loginTypeCheck:true** (action→route 전환)
     4. `revenue` (route `/my-account`, HandCoins, requireLogin:true, loginTypeCheck:true) — 유지
     5. `shop` — **신규: `kind:'route'`, key `'shop'`, label '상점', href `/shop-recharge`, icon `Store`, requireLogin:true**
     - `studio` 항목 삭제.
   - 파일 상단 주석(`:6-12`)의 항목 종류 설명 갱신: '만들기'가 더 이상 action이 아님을 반영(예: "route: 홈/채팅/만들기/수익내역/상점"). `NavConfigActionItem` 타입은 유지(무해).
   - `getActiveKey()`(`:92-102`)는 route 기반이라 수정 불필요. 검증: `/my-characters`→`create`, `/shop-recharge`→`shop`, prefix 충돌 없음.
   - 재사용: 기존 타입/구조 그대로, 배열 값만 변경.

2. **Top바 상점 아이콘 제거** `[담당: publisher]` — `components/common/header.tsx`
   - 상점 `<Link>` 블록 제거(`:117-128`, 주석 `{/* 상점 - ... */}` 포함).
   - 종속 정리(제거 후 미사용으로 lint 실패 방지, 한 파일 한 담당 원칙상 함께 처리): `handleShopClick`(`:47-53`) 제거, import에서 `faStore`(`:12`) 제거.
   - **유지**: `openNewModal`(`onClickSettingLink`에서 계속 사용), 우측 액션 그룹의 알림/설정/장바구니/햄버거 버튼 및 나머지 레이아웃.
   - 반응형/웹뷰: 아이콘 하나 제거이므로 우측 액션 그룹 `gap`/정렬은 그대로 유지되며 레이아웃 영향 미미. 360/768/1280 확인 시 우측 정렬 깨짐 없어야 함.

> 파일 겹침 없음: 1단계는 `navConfig.ts`(writer), 2단계는 `header.tsx`(publisher). MobileGNB/DesktopSideNav(View·컨테이너)는 수정 대상 아님(config 소비만).

## 영향 범위 & 리스크
- **양쪽 nav 동시 변경**: `navConfig` 하나로 데스크톱 사이드바 + 모바일 GNB가 함께 바뀐다(의도된 side effect, 확인 필요 #1).
- **MobileGNB grid**: 항목 5개 유지 → `grid-cols-5` 정합. (만약 향후 항목 수가 5가 아니게 되면 grid 하드코딩과 불일치하니 주의 — 이번엔 5개라 안전.)
- **활성 하이라이트 변화**: 기존 `/my-characters` 활성 키 `studio` → 이제 `create`로 이동. UI상 활성 대상 항목이 '내 작업실'에서 '만들기'로 옮겨짐(확인 필요 #2).
- **상점 진입점 이동**: 모바일에서 헤더 상점 아이콘이 사라지고 하단 GNB '상점'으로 대체됨. 데스크톱도 헤더→사이드바로 이동. 사용자 동선 변화 있으나 진입 자체는 유지.
- **죽은 코드**: `navConfig`에 action 항목이 없어져 컨테이너/GNB의 `chatModeSelect` 분기·`NavConfigActionItem` 타입이 미실행 코드가 됨(무해, 범위 밖). `chatModeSelect` 모달 자체는 `/my-characters` 페이지에서 계속 사용되므로 제거 금지.
- **롤백**: 두 파일 모두 순수 UI/config 변경이라 revert로 즉시 원복 가능. 데이터/상태/결제 로직 무관.
- **보안**: 결제/암호화/인증 토큰 로직 미변경. 상점 게이팅은 기존 헤더와 동일한 socialLogin 모달 정책 계승.

## 검증 방법
- 타입 체크: `npx tsc --noEmit` (특히 union 타입 `NavConfigItem` 소비부 이상 없는지).
- 린트: `npm run lint` (header.tsx의 `faStore`/`handleShopClick` 미사용 잔존 없는지 확인).
- 수동 시나리오:
  - 데스크톱 사이드바 항목 순서: 홈→채팅→만들기→수익내역→상점.
  - '만들기' 클릭(로그인 상태) → `/my-characters` 이동, 해당 항목 활성 하이라이트.
  - '상점' 클릭(로그인) → `/shop-recharge` 이동 / (미로그인) → socialLogin 모달.
  - '만들기'/'상점' 미로그인 클릭 시 socialLogin 모달 게이팅 동작.
  - Top바에 상점 아이콘이 없어야 하고, 알림/설정/장바구니/햄버거는 정상.
  - 모바일(≤767px) 하단 GNB 5칸: 홈/채팅/만들기/수익내역/상점, '내 작업실' 없음.
  - `/my-characters` 페이지의 '만들기' 버튼 → chatModeSelect 모달 정상(모달 생존 확인).
- 레이아웃: 360 / 768 / 1280px 폭에서 사이드바·GNB·헤더 우측 액션 그룹 깨짐/가로 스크롤 없음.

## 범위 밖 (하지 않을 것)
- `NavConfigActionItem` 타입 및 DesktopSideNav/MobileGNB의 `chatModeSelect` 분기 제거(무해한 죽은 코드로 유지).
- `ChatModeSelectModal` / `GlobalModalHost` 수정(모달은 `/my-characters`에서 계속 사용).
- `app/(routes)/demo/home/page.tsx`의 자체 데모 nav(navConfig 미공유).
- 헤더의 알림/설정/장바구니/햄버거/로고 등 상점 외 요소.
- 새 상점 페이지/라우트 신설(기존 `/shop-recharge` 재사용).
