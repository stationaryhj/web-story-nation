# 검색바 헤더 이동(카베덕 스타일) 반응형 — 퍼블리싱 결과

- 작성 일자: 2026-07-15
- 근거 계획: `docs/plan/plan-20260715-header-searchbar.md`
- 담당: code-publisher (계획의 1~4단계 전부, 담당 `publisher`)
- 대상 브랜치: `red-main`

## 구현 범위

계획에 명시된 4단계 전부 구현 완료. writer 담당 단계는 없음(계획상 로직 작업 불필요 — SearchBar가 라우팅 자기완결형).

1. `HeaderSearch.tsx` 신규 — 완료
2. `header.tsx` 3분할 슬롯 배치 — 완료
3. `views/main/home.tsx` 콘텐츠 검색바 `md:hidden` — 완료
4. `views/search/home.tsx` 인라인 검색바 `md:hidden` — 완료

## 변경 파일

- `components/common/HeaderSearch.tsx` (신규) — 헤더 중앙 슬롯 전용 표시 래퍼.
  - 루트: `hidden md:flex md:flex-1 min-w-0 justify-center px-2` (계획 1단계: 데스크톱에서만 노출, 플렉스 오버플로우 방지용 `min-w-0`, 로고/액션과 여유 확보용 `px-2` 추가).
  - 내부: `w-full max-w-[560px] min-w-0` 래퍼로 `SearchBar`를 `onSearch` 없이 렌더(라우팅은 SearchBar 내장, `router.push('/search?query=...&option=...')`). props 없음(자기완결) — 로직 추가 없음.
  - `'use client'` 유지(SearchBar가 클라이언트 컴포넌트라 상위 경계 필요).
- `components/common/header.tsx:23` — `import HeaderSearch from '@/components/common/HeaderSearch';` 1줄 추가.
- `components/common/header.tsx:109` — 로고 블록과 우측 액션 블록(`justify-between` 컨테이너) 사이에 `<HeaderSearch />` 삽입해 `[로고] [검색] [액션]` 3분할 구성. 그 외 헤더 로직(테마/사이드바/로그인 핸들러) 무변경.
- `views/main/home.tsx:78` — 콘텐츠 검색바 래퍼 `<div className='...'>` 에 `md:hidden` 추가 → 모바일 전용 노출. `onSearch`/props 불변.
- `views/search/home.tsx:200` — 인라인 검색바 래퍼 `<div>` 에 `md:hidden` 추가 → 데스크톱에서는 헤더 검색바가 단일 진입점.

## 반응형 / 웹뷰 점검

- **360px**: 헤더에 검색바 없음(로고 ↔ 액션 양끝 배치 그대로, `HeaderSearch`가 `hidden`이라 회귀 없음). 홈/검색 콘텐츠 검색바 노출·정상 동작 확인(코드 레벨: `md:hidden`이 모바일에서 검색바를 표시).
- **768px(md)**: `HeaderSearch`가 `md:flex md:flex-1`로 활성화되어 로고-검색-액션 3분할. 검색 래퍼에 `min-w-0`을 둬 플렉스 자식이 콘텐츠 크기만큼 강제로 넓어져 우측 액션 블록을 밀어내는 현상을 방지. 내부 `max-w-[560px]`로 과도한 확장을 제한. 홈/검색 콘텐츠 검색바는 `md:hidden`으로 숨겨져 중복 없음.
- **1280px**: `max-w-[560px]` 안에서 중앙 정렬, 로고/액션과 여유 있게 배치. 검색 제출 시 기존과 동일하게 `/search?query=...&option=...` 라우팅(SearchBar 로직 무변경).
- **웹뷰 고려**: 새 창(`window.open`) 사용 없음, 헤더 검색도 기존 SearchBar의 `router.push` 인앱 라우팅을 그대로 사용. `/chat/[id]` 몰입형은 헤더 자체가 미마운트되어(`AppShell.tsx`) 헤더 검색바도 자동 미노출.
- **터치 타깃**: SearchBar 내부 버튼/입력 크기는 기존 그대로(파일 미수정). 헤더 컨텍스트에서 별도 패딩 보정은 시각적으로 문제없어 보였으나, 실기기/브라우저 렌더 확인은 못했음 — "확인 필요"로 남김.

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속

- 계획과 달라진 점 없음. 4단계 모두 계획 문서 그대로 구현.
- 로직 연결 필요 지점 없음(SearchBar가 라우팅 자기완결형이라 writer 배선 불필요, 계획에도 명시됨).
- 기존 알려진 한계(계획에 명시, 이번 스코프 밖):
  - 데스크톱에서 `/search` 진입 시 헤더 검색바에 현재 검색어(`initialValue`) 프리필 안 됨.
  - SearchBar/BaseInput의 회색 하드코딩 스타일(다크모드 미대응) — 별도 테마 토큰화 작업에서 처리.
- 실기기/실브라우저에서의 시각적 확인(스크린샷 캡처 등)은 수행하지 못했음 — 필요 시 QA 단계에서 360/768/1280px 브라우저 리사이즈로 재확인 권장.

## 검증 결과

- `npx tsc --noEmit` — 오류 없음.
- `npm run lint`(전체) — 프로젝트 전역에 걸친 다수의 **기존(pre-existing) lint 경고/오류**가 있으나, 모두 이번 변경과 무관한 레거시 파일/라인(예: `app/(routes)/*/page.tsx`의 불필요 Fragment, `noEmptyPattern`, 미사용 import 등).
- `npx biome lint` 를 변경 파일 4개(`HeaderSearch.tsx`, `header.tsx`, `views/main/home.tsx`, `views/search/home.tsx`)로 한정 실행 — 리포트된 오류는 전부 **제가 만든 diff 라인이 아닌 기존 코드**(예: `header.tsx`의 기존 미사용 FontAwesome 아이콘 import, `views/search/home.tsx`의 소문자 컴포넌트명 `searchPage`로 인한 `useHookAtTopLevel` 오탐, `Props = {}` `noEmptyPattern` 등)에서 발생. `git diff`로 대조해 제 추가 3줄(`import HeaderSearch`, `<HeaderSearch />`, `md:hidden` 클래스 2곳)과 신규 파일 `HeaderSearch.tsx`에는 lint 오류가 리포트되지 않음을 확인함.
