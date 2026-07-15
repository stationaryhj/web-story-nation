# 사이드바 caveduck 리디자인 — writer 2·3단계 구현

- 작성 일자: 2026-07-10
- 근거 계획: `docs/plan/plan-20260710-sidebar-caveduck-redesign.md` (A안, 2·3단계)
- 구현 범위: **2단계(AppShell 여백 정합) · 3단계(Header 로고 복원)** — writer 담당 단계만 구현.
  - 1단계(`DesktopSideNavView.tsx` caveduck 리디자인, publisher 담당)는 사전에 publisher가 완료한 상태를 확인만 했고 수정하지 않음.
  - 4단계(`DesktopSideNav.tsx` 주석 정합, 선택)은 코드 로직 변경이 없어 생략(계획상 "생략 가능").

## 사전 확인
- `components/common/DesktopSideNavView.tsx:42` — 폭이 이미 `w-60`(240px)이고 로고 `Image`가 제거되어 있음을 확인(publisher 1단계 완료 상태). 이 파일은 수정하지 않았음.

## 변경 파일

- `components/common/AppShell.tsx:15,21-27,33` — 헤더 주석의 `md:pl-32` 언급을 `md:pl-60`로 갱신하고, 폭 갱신 근거(계획 2단계) 주석 추가. 본문 `id='main-content'`의 `showSideNav && 'md:pl-32'`를 `showSideNav && 'md:pl-60'`로 변경(계획 2단계 — 사이드바 폭 240px 확대와 정합). `md:fixed md:inset-y-0 md:left-0 md:z-40` 래퍼, `/chat/[id]` 분기(`showSideNav`) 로직은 불변.
- `components/common/header.tsx:153-158` — 로고 `Link`의 `className`에서 `md:hidden` 제거(`'md:hidden text-xl font-bold text-brand-hover mr-10'` → `'text-xl font-bold text-brand-hover mr-10'`), 전 화면 크기에서 로고 노출(계획 3단계). 상단 주석을 "데스크톱은 사이드바가 로고 담당"에서 "로고는 Header 전용, 사이드바는 caveduck 리디자인으로 로고 없이 nav만 담당"으로 갱신. `onClick`(router.push('/') + preventDefault) 및 `Image` 속성(width/height/className='h-10 w-auto')은 변경 없음. 로고 외 우측 컨트롤(세이프티 토글/상점/알림/내정보/장바구니)·모바일 nav 등은 손대지 않음.

## 검증 결과

- `npx tsc --noEmit` — 오류 없음(통과).
- `npx biome check components/common/AppShell.tsx` — 오류/경고 없음(통과).
- `npx biome check components/common/header.tsx` — 1 error(`lint/a11y/useButtonType`, `SimpleToggle`의 `<button>` type 미지정) + 7 warnings(미사용 import `faBell`/`faCog`/`faFire`/`faMoon`/`faSignOutAlt`/`faSun`/`faTimes`/`faVideo`/`AnimatePresence`/`FadeIn`, `<img>` 사용 2건, 미사용 파라미터 `isSidebar`/`e`) 발생.
  - **모두 이번 변경 이전부터 존재하던 사항**임을 확인: 세션 시작 시 최초 `Read`한 파일 원본(4~17행 import 목록, `<img>` 사용 등)에 이미 포함돼 있었고, `git show HEAD:components/common/header.tsx`를 별도로 lint해도 동일한 `useButtonType` 오류가 재현됨. 이번 작업은 로고 `className`에서 `md:hidden` 제거 + 주석 1건 갱신만 수행했으며 해당 두 지점은 lint 오류 없음. CLAUDE.md의 "최소 변경" 원칙에 따라 무관한 사전 존재 이슈는 수정하지 않음.

## 계획과 달라진 점 / 미완 · 후속 필요

- 없음(2·3단계는 계획대로 구현). 4단계(컨테이너 주석 정합)는 계획상 선택 사항으로 생략.
- **QA 필요(계획에 명시된 리스크)**: 768px에서 사이드바 240px(`pl-60`) 반영으로 콘텐츠 폭이 528px로 줄어 Header 우측 컨트롤(세이프티 토글 `w-20`+라벨, 상점/알림/내정보/장바구니 아이콘)이 좁아져 줄바꿈/가로 스크롤이 발생하는지 수동 확인이 필요함(코드 변경만으로는 검증 불가, 브라우저 실측 필요). 위험 시 계획에 명시된 대안(사이드바 폭을 `w-56`=224px로 낮추고 `pl-56`로 재정합)을 publisher와 계약값 갱신 후 적용해야 함.
- header.tsx의 사전 존재 Biome 오류/경고(미사용 import, `<img>` 미최적화, button type 미지정)는 이번 작업 범위 밖이라 수정하지 않음. 별도 후속 정리 필요 시 별도 계획/작업으로 분리 권장.
