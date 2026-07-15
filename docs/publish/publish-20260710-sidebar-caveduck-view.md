# 사이드바 caveduck 리디자인 — publisher 1단계 퍼블리싱 결과

- 작성 일자: 2026-07-10
- 근거 계획: `docs/plan/plan-20260710-sidebar-caveduck-redesign.md` (실행 계획 1단계, `[담당: publisher]`)
- 대상: `components/common/DesktopSideNavView.tsx` (표시 전용, 컨테이너/셸 파일은 미수정)

## 구현 범위
- 계획 1단계(publisher 담당)만 구현. 2~4단계(`AppShell.tsx`/`header.tsx`/`DesktopSideNav.tsx` 주석)는 writer 담당이므로 손대지 않음.

## 변경 파일
- `components/common/DesktopSideNavView.tsx:1` — 상단 주석 갱신(근거 계획 경로, caveduck 리디자인 취지, "로고는 Header 담당" 명시).
- `components/common/DesktopSideNavView.tsx:15` — `next/image` import 제거(로고 삭제로 미사용).
- `components/common/DesktopSideNavView.tsx:20-22` — `SideNavItemView.label`/`isActive` 주석을 가로 배치·pill 하이라이트 문구로 갱신(props 시그니처 자체는 불변).
- `components/common/DesktopSideNavView.tsx:36-38` — 컴포넌트 상단 주석에 "로고는 사이드바가 아닌 Header 좌측" 안내 추가.
- `components/common/DesktopSideNavView.tsx:41` — `aside` 로고 `<Image>` 제거, 폭 `w-32`→`w-60`(240px, 계획 계약값), `items-center gap-10`→`items-stretch`(로고 제거로 `gap` 불필요), 상단 여백 `py-8`→`py-6`.
- `components/common/DesktopSideNavView.tsx:42` — `nav` 간격 `gap-8`→`gap-1`(가로 pill 목록 간 여백으로 축소), `px-2`→`px-3`.
- `components/common/DesktopSideNavView.tsx:46-63` — 항목 버튼: `flex-col items-center justify-center gap-2 min-h-[64px]`(세로) → `flex-row items-center gap-3 min-h-[44px] w-full px-4 py-3 rounded-full`(가로, 폭을 채우는 pill). 활성 시 `bg-brand text-text-inverse`, 비활성 `text-text-muted hover:bg-surface-elevated-hover active:bg-surface-elevated-hover`. `aria-current`·`focus-visible:outline-brand` 유지.
- `components/common/DesktopSideNavView.tsx:60` — 아이콘 `h-8 w-8`→`h-5 w-5`(가로 배치에 맞춘 축소, currentColor 상속 유지).
- `components/common/DesktopSideNavView.tsx:61-62` — 라벨 `text-base font-medium`에 `truncate`+`text-left` 추가(중앙정렬 해제, 넘침 방어), `break-words`는 한 줄 배치와 맞지 않아 `truncate`로 교체.

## 유지된 props 계약
- `DesktopSideNavViewProps { items: SideNavItemView[]; onItemClick: (key: string) => void }` — 시그니처 불변.
- `SideNavItemView { key, label, icon: LucideIcon, isActive }` — 필드/타입 불변(주석만 갱신).
- 클릭 시 `onItemClick(item.key)`만 호출(라우팅/게이팅/모달 미개입) — 그대로 유지.
- `aside`는 `hidden md:flex`(데스크톱 전용), `sticky top-0 h-[100dvh]` 그대로 유지(계획 A안: top 오프셋 미적용, `AppShell`의 `md:fixed` 래퍼가 위치 담당).

## 시각 결정 (재량 범위, 계획 계약값 준수)
- 폭: `w-60`(240px, 계획 계약값 그대로 사용). Tailwind 기본 스케일이라 config 추가 불필요.
- pill 반경: `rounded-full`(계획 예시 범위 `rounded-xl`~`rounded-full` 중 caveduck 감성에 가까운 완전 pill 선택).
- 활성 색: `bg-brand text-text-inverse`(브랜드 배경 + 대비 확보를 위해 `text-inverse` 사용; `bg-brand/10 text-brand` 대안도 고려했으나 caveduck의 "채워진 pill" 느낌에 맞춰 solid 선택). 시맨틱 토큰만 사용, 하드코딩 HEX 없음.
- 비활성 hover: `hover:bg-surface-elevated-hover`(기존 관행 그대로 재사용).
- 항목 높이: `min-h-[44px]`(터치 타깃 44px 하한 충족, `py-3` 패딩으로 보강).
- 항목 간 간격: `gap-1`(촘촘한 pill 목록, caveduck처럼 여백은 pill 내부 패딩(`px-4 py-3`)으로 확보).
- 상단 여백: `py-6`(로고 제거로 24px 감소, 헤더 라인과의 시각 정합은 계획상 A안 한계로 완전 정렬은 보장되지 않음 — 후속 QA 항목).

## 반응형 / 웹뷰 점검
- 360px: `hidden md:flex`로 사이드바 미노출, 레이아웃 영향 없음(MobileGNB는 별도 컴포넌트, 미변경).
- 768px: 사이드바 240px 노출. `AppShell`의 `md:pl-60` 정합은 writer 담당 2단계 — **현재 writer 단계가 아직 반영되지 않았다면 콘텐츠와 사이드바가 겹칠 수 있음**(publisher 파일만 단독 확인 시 예상된 상태). View 자체는 라벨 "내 작업실"(4자) 기준 `truncate` 방어로 줄바꿈/넘침 없음을 확인.
- 1280px: pill 레이아웃 가로 정렬 정상, 아이콘(`h-5 w-5`)+라벨 한 줄, `gap-3` 간격 확인.
- 웹뷰: `hidden md:flex`로 데스크톱(md 이상)에서만 렌더 — 모바일 웹뷰는 영향 없음. `sticky`/`h-[100dvh]`는 기존 구조 유지(단독 변경 없음).
- 터치 타깃: `min-h-[44px]` + `px-4 py-3`로 44px 이상 확보. hover 전용 의존 없이 `active:`/`focus-visible:` 상태 병행.

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- 계획과 다른 점: 없음(1단계 지시 그대로 구현, 재량 범위 내 시각값만 선택).
- 로직 연결 필요: 없음(props/callback 계약 불변, 컨테이너 미수정).
- 미완 · 후속:
  - 2단계(`AppShell.tsx md:pl-32`→`md:pl-60`)와 3단계(`header.tsx` 로고 `md:hidden` 제거)는 writer 담당 — 미반영 시 콘텐츠 겹침/로고 소실 가능. 세트로 반영 필요(계획 "로고 중복 방지" 항목 참고).
  - 768px에서 Header 우측 컨트롤 폭 축소로 인한 줄바꿈/가로 스크롤 리스크는 계획상 QA 필수 항목(writer 2~3단계 반영 후 통합 확인 필요).
  - 헤더-사이드바 상단 정렬은 A안 한계로 완전 일치하지 않을 수 있음(계획에 명시된 후속 B안 대상).
