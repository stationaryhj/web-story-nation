# 퍼블리싱: 데스크톱 사이드바 표시용 View (`DesktopSideNavView.tsx`)

- 근거 계획: `docs/plan/plan-20260710-home-sidebar-integration.md` — 실행 계획 2단계 `[담당: publisher]`
- 작업 일자: 2026-07-10
- 범위: 표시용(View) 컴포넌트 신규 생성만. navConfig(1단계)·컨테이너(3단계)·AppShell/layout(4단계)·Header(5단계)·MobileGNB(6단계)·한도 모달 전역화(7단계)는 모두 writer 담당이라 손대지 않음.

## 구현 내역

### 신규 파일

- `components/common/DesktopSideNavView.tsx`
  - 데모(`app/(routes)/demo/home/page.tsx:103-126`)의 데스크톱 `aside` 마크업을 이식하고 하드코딩 색(`#FF0750`/`#B1B1B1`/`border-white/5`)을 semantic 토큰으로 교체.
  - 컨테이너 `className`: `sticky top-0 hidden h-[100dvh] w-32 shrink-0 flex-col items-center gap-10 border-r border-border-default bg-surface-sunken py-8 md:flex` (계획 2단계 지시와 동일).
  - 로고: `next/image`로 `/images/logo.svg` 렌더(`width=48 height=48 priority`).
  - 항목: `<nav aria-label='주 메뉴'>` 안에 `<button type='button'>`로 통일(계획의 "route도 button 통일" 지침 반영). 아이콘 24~32px(`h-8 w-8` = 32px) + 라벨(세로 배치), 활성 `text-brand` / 비활성 `text-text-muted`, `hover:`/`active:` 둘 다 제공(터치 환경 hover 미의존), `focus-visible:outline`으로 키보드 포커스 표시, 활성 항목 `aria-current='page'`, `min-h-[64px]`(44px 이상 터치 타깃 충족).
  - 데모의 `MaskIcon`(CSS mask + SVG 에셋)은 쓰지 않고 `lucide-react`의 `LucideIcon` 컴포넌트를 `props.icon`으로 받아 `<Icon />`으로 렌더(색은 `currentColor` 상속).
  - 클래스 병합은 `@/shared/lib/utils/cn`의 `cn()` 사용(프로젝트 컨벤션 준수).



## export한 컴포넌트명 · props 시그니처 (writer 배선용 계약)

```ts
// components/common/DesktopSideNavView.tsx
export interface SideNavItemView {
  key: string;       // 컨테이너의 navConfig item.key와 대응
  label: string;
  icon: LucideIcon;  // lucide-react 아이콘 컴포넌트
  isActive: boolean; // true → text-brand + aria-current='page'
}

export interface DesktopSideNavViewProps {
  items: SideNavItemView[];
  onItemClick: (key: string) => void; // key만 전달, 라우팅/게이팅/모달 오픈은 컨테이너 책임
}

export default function DesktopSideNavView(props: DesktopSideNavViewProps): JSX.Element;
```

- **default export**: `DesktopSideNavView`.
- **named export**: `SideNavItemView`, `DesktopSideNavViewProps` (타입).
- 데스크톱 전용 표시: 컴포넌트 내부에서 `hidden md:flex`로 md 미만은 렌더되지만 화면엔 보이지 않음 — md 미만 완전 비노출은 계획대로 MobileGNB가 별도로 담당(이 View는 항상 마운트돼도 무방하나, 계획상 컨테이너가 `pathname.startsWith('/chat/')` 조건으로 `null` 반환 여부를 결정).



## 계획 원문과 달라진 점 (작업 지시에 따른 의도적 단순화)

계획 2단계 원문의 props는 `items: NavConfigItem[]`, `activeKey: string | null`, `onItemClick: (item: NavConfigItem) => void`였으나, **본 작업 지시(발주 메시지)가 명시적으로 "navConfig import 금지 — 표시용은 로직 타입에 의존하지 않음"** 이라며 아래 형태로 재정의했습니다.

- `NavConfigItem`(discriminated union, writer 소유 `navConfig.ts`의 타입) → import하지 않음.
- 항목별 활성 여부는 View가 `activeKey`와 `item.key`를 비교하지 않고, **컨테이너가 미리 계산한** `isActive: boolean`**을 각 항목에 넣어 전달**받는 형태로 변경(`SideNavItemView.isActive`).
- `onItemClick`이 전체 `NavConfigItem` 객체가 아니라 `key: string`**만** 전달받도록 축소.

이는 표시 레이어가 컨테이너(writer)의 타입 정의 파일에 의존하지 않게 하여 파일 간 결합을 줄이는 목적의 의도적 변경입니다. **writer가** `DesktopSideNav.tsx` **컨테이너를 작성할 때**:

- `navConfig` items를 순회하며 `getActiveKey(pathname)`과 비교해 `isActive`를 계산한 `SideNavItemView[]`로 매핑해 전달해야 합니다.
- `onItemClick(key)`을 받아 `items.find(i => i.key === key)`로 원본 `NavConfigItem`을 찾아 `kind` 분기(게이팅 → route push / action 모달 오픈)를 수행해야 합니다.

계획과 실제 배선 방식이 다르므로, **plan 문서의 2단계 props 스펙과 본 산출물의 실제 계약이 다르다는 점을 code-planner/writer에게 공지 필요**합니다(계획 문서 자체는 수정하지 않았습니다 — 범위 밖).

## 검증

- `npx biome check components/common/DesktopSideNavView.tsx` → 통과(수정 없음).
- `npx tsc --noEmit` → 프로젝**트 전체 기준 에러 없음(신규 파일 포함).**
- **아직 컨테이너가 없어 브라우저 렌더 확인은 불가(수동 360/768/1280 점**검은 writer의 컨테이너 배선 후 통합 시 필요).



## 미완 · 후속

- 이 View는 아직 아무 곳에도 마운트되지 않음(컨테이너 3단계 + AppShell 4단계는 writer 담당).
- '내 작업실' 아이콘 후보(`FolderKanban`/`Briefcase`) 최종 선택은 계획상 publisher 몫으로 언급되어 있으나, 아이콘은 컨테이너가 `props.icon`으로 주입하는 구조라 View 파일에는 아이콘 선택이 없음 — **writer가** `navConfig.ts` **작성 시 최종 아이콘을 확정**해야 함(확인 필요 표시).

