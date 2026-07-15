# caveduck 셸 레이아웃 — publisher 1·3단계 퍼블리싱 결과

- 작성 일자: 2026-07-10
- 근거 계획: `docs/plan/plan-20260710-caveduck-shell-layout.md`
- 담당 범위: **publisher 1단계**(`DesktopSideNavView.tsx` 좁은 레일 되돌림) · **publisher 3단계**(`header.tsx` 전폭 Top bar 마크업). writer 담당(`AppShell.tsx`, 16개 페이지 `<Header/>` 제거)은 미착수(다른 에이전트 담당).

## 변경 파일

- `components/common/DesktopSideNavView.tsx:1-75`
  - 상단 근거 계획 주석을 `plan-20260710-caveduck-shell-layout.md`(1단계)로 갱신, "가로 배치" 문구를 "세로(아이콘 위/라벨 아래)"로 갱신. 위치/높이 계약 문구 추가(`h-full`은 셸 wrapper의 `md:top-16~bottom-0`와 정합).
  - `aside`: `sticky top-0 hidden h-[100dvh] w-60 ... py-6` → `hidden h-full w-20 shrink-0 flex-col items-stretch overflow-y-auto ... py-4 md:flex` (`:47`). sticky/top-0/100dvh 제거(위치는 writer wrapper 담당), `overflow-y-auto` 추가(스크롤 필요 시 대응).
  - `nav` 좌우 패딩 `px-3` → `px-2`(80px 폭에 맞게 축소, `:48`).
  - 항목 버튼: `flex items-center gap-3 rounded-full px-4 py-3`(가로) → `flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2`(세로, `:58`). `min-h-[44px]` 유지로 터치 타깃 확보.
  - 아이콘 `h-5 w-5` 유지(`:65`), 라벨을 아이콘 우측 `text-base`에서 아이콘 아래 `text-[10px] leading-tight mt-0.5`로 변경(`:66-68`, MobileGNB `:94` 세로 패턴 참조).
  - 활성 하이라이트: `bg-brand text-text-inverse`는 유지하되 모양이 `rounded-full`(pill) → `rounded-2xl`(둥근 사각)로 전환(`:58,61`). 비활성 `text-text-muted hover:bg-surface-elevated-hover active:bg-surface-elevated-hover`, `focus-visible:outline-brand` 유지.
  - `SideNavItemView`/`DesktopSideNavViewProps` 타입 시그니처는 **불변**(export 이름·필드 그대로), 필드 주석만 "가로"→"세로" 표현 정정.
  - 하단 컴포넌트 설명 주석의 로고 담당 표기를 "writer"→"publisher"로 정정(로고는 여전히 Header 소유, 이번 계획에서 header.tsx가 publisher 담당으로 바뀌었으므로 주석 정합).

- `components/common/header.tsx:152`
  - 헤더 내부 래퍼 `container mx-auto px-4 py-3 flex items-center justify-between` → `w-full px-4 py-3 flex items-center justify-between`. `container mx-auto`(중앙 정렬 고정폭)를 제거해 전폭으로 바꿔 로고가 화면 좌측 끝, 우측 컨트롤이 화면 우측 끝에 붙도록 함. 좌우 `px-4`는 유지해 끝단에 딱 붙지 않게 여백 확보.
  - 그 외 로직/상태/핸들러/자식 컴포넌트(`SimpleToggle`, `NotificationButton`, `HeaderSidebar` 등)·props 시그니처(`export default function Header()`, prop-less)는 손대지 않음. `motion.header sticky top-0 ... z-[50] bg-surface-sunken shadow-sm`(`:147`)도 그대로 유지되어 전폭 sticky top-bar 역할 유지.

## 유지된 계약

- **폭 계약**: 레일 `w-20`(80px), writer의 `AppShell.tsx`가 이에 맞춰 `md:pl-20`/`md:top-16` 처리(이번 세션에서 미변경 확인 필요 — writer 담당).
- **prop-less Header**: `header.tsx`는 여전히 `export default function Header()`로 인자 없음. 이번 변경은 className 1줄뿐, 마운트 위치 이전(AppShell 승격)은 writer 담당.
- **aside `h-full`**: 레일 View는 자체 위치/높이를 갖지 않고 셸 wrapper(writer)가 top/bottom을 고정해야 실제로 헤더 아래부터 채워짐. writer 2단계 미착수 상태에서는 `DesktopSideNav`가 렌더되는 현재 위치(문서 흐름상 부모가 감싸는 형태)에 따라 `h-full`이 부모 높이에 의존 — writer가 fixed wrapper를 씌우기 전까지는 시각적으로 레일이 축소되어 보일 수 있음(계획대로 2단계가 이어져야 완성).

## 시각 결정 (publisher 재량 사항)

- **레일 폭**: 계획 계약값 `w-20`(80px) 그대로 적용, 변경 없음.
- **활성 하이라이트 모양**: `rounded-2xl`(둥근 사각) 선택 — MobileGNB의 각진 탭과 차별화하면서 caveduck의 카드형 채움 느낌을 살림. `bg-brand`/`text-text-inverse` 시맨틱 토큰 재사용, 하드코딩 HEX 없음.
- **항목 내부 패딩/간격**: `px-1 py-2`, 아이콘-라벨 간격 `gap-1` + `mt-0.5`(라벨 상단), 항목 간 간격 `gap-1`(nav). 80px 폭 안에서 여백을 최소화해 아이콘·라벨이 잘리지 않게 함.
- **라벨 표기**: 최장 라벨 "내 작업실"(4글자+공백)을 `whitespace-nowrap` + `text-[10px]`로 한 줄 유지. 폭 계산상 버튼 내부 가용폭(약 56~64px)에 10px 폭 한글 4~5글자가 들어가 줄바꿈 없이 표시됨(육안 확인 필요 — 아래 "확인 필요" 참조). 줄바꿈 허용 대신 nowrap을 선택한 이유는 항목 높이를 균일하게 유지하고 싶어서.
- **헤더 좌우 패딩**: `px-4` 유지(계획 예시의 `px-4`/`px-6` 중 기존 값 유지 — 급격한 변경보다 최소 변경 원칙).

## 반응형 / 웹뷰 점검

- **360px**: `DesktopSideNavView`는 `hidden md:flex`로 완전히 숨김(변경 없음) — 모바일에서는 MobileGNB가 대신 담당. Header는 `w-full`이라 `container` 제거로 오히려 모바일에서는 기존과 동일(모바일은 이미 뷰포트 폭이 container max-width보다 좁아 시각차 없음). 가로 스크롤 없음.
- **768px(md)**: 레일이 나타나며 `w-20`(80px) 고정. 라벨 4~5글자가 10px 폭에서 nowrap으로 들어가는지 **브라우저 실측 확인 필요**(코드 리뷰만으로 픽셀 단위 줄바꿈 여부를 100% 보장 불가). Header는 `w-full`이라 로고가 뷰포트 좌측 끝(px-4만큼 안쪽)에 위치, 이 시점에는 아직 writer의 AppShell 승격 전이라 페이지별 `<Header/>` 렌더 위치에서 그대로 전폭으로 보임.
- **1280px**: Header 로고/우측 컨트롤이 화면 끝까지 벌어짐(container 제한 해제), `justify-between` 유지로 중간 여백 자동 확장. 레일은 여전히 80px 고정, 활성 항목 하이라이트 정상 렌더 예상.
- **웹뷰 고려**: 레일 버튼은 `min-h-[44px]`로 터치 타깃 44px 이상 유지, `active:`/`focus-visible:` 상태 보유(터치 전용 환경에서 hover 미지원이어도 클릭 시 즉시 반응). Header 컨트롤(세이프티 토글/상점/알림/장바구니/햄버거)은 기존 `motion.button whileTap`으로 터치 피드백 유지(변경 없음). `overflow-y-auto`를 aside에 추가해 항목 수가 늘어나 세로 스크롤이 필요한 경우도 대응.

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속

- **writer 담당 미착수(정상)**: `AppShell.tsx`(Header 마운트, 레일 wrapper `md:top-16 md:bottom-0`, 본문 `md:pl-20`, `isImmersive` 분기)와 16개 페이지 `<Header/>` 제거는 이번 작업 범위 밖이라 손대지 않음. 현재 시점에서는 **레일이 여전히 페이지별 `DesktopSideNav` 컨테이너 위치에서 렌더**되고 Header도 여전히 페이지마다 렌더되는 구조이므로, writer 2·4단계가 완료되기 전까지는 "전폭 top-bar 1개 + 헤더 아래 시작하는 레일"이라는 최종 화면 구성은 완성되지 않는다(계획에 예정된 순서이며 정상 상태).
- **라벨 nowrap 실측 확인 필요**: "내 작업실" 라벨이 80px 레일 폭 안에서 nowrap으로 잘림/줄바꿈 없이 들어가는지 브라우저에서 육안 확인 필요(폰트 렌더링에 따라 근소한 차이 가능). 문제가 있으면 `break-keep` 허용 줄바꿈 또는 라벨 폭 여유를 위한 padding 축소 재조정 가능(publisher 재량 범위).
- **pre-existing biome 이슈**: `header.tsx`에 이번 작업과 무관한 기존 lint 경고(미사용 import, `<img>` 미최적화, 버튼 `type` 미지정 등)가 있으나 계획상 "내가 만지는 부분만 클린하게"로 범위 밖 — 수정하지 않음.
- 그 외 계획과 다른 점 없음.
