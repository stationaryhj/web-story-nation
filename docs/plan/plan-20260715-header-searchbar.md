# 검색바 헤더 이동(카베덕 스타일) 반응형 — 구현 계획

- 작성 일자: 2026-07-15
- 대상 브랜치/커밋: `red-main` / `459018b`
- 목표 한 줄 요약: 데스크톱(md+)에서는 검색바를 상단 헤더 중앙에 노출하고, 모바일(md 미만)에서는 기존 콘텐츠 영역 검색바를 그대로 유지한다.

---

## 목표
좌측 사이드바(DesktopSideNav)가 보이는 데스크톱 해상도(md, 768px 이상)에서는 검색바를 헤더 중앙(로고와 우측 액션 사이)에 상시 노출하고, 하단 탭바(MobileGNB)로 전환되는 모바일 해상도에서는 검색바를 지금처럼 콘텐츠 영역에 유지한다. 검색 동작(상태·라우팅)은 기존과 동일하게 보존한다.

## 확인 필요 사항
- **검색 결과 페이지(`/search`) 데스크톱에서의 중복 처리 정책**: 헤더 검색바가 전 페이지 노출되면 `/search`(=`views/search/home.tsx`)는 자체 인라인 검색바와 헤더 검색바가 데스크톱에서 겹친다. 본 계획은 "1차 범위: `/search` 인라인 검색바도 데스크톱에서 숨김(`md:hidden`)"으로 제안하되, 이 경우 헤더 검색바에 현재 검색어(`initialValue`)가 프리필되지 않는 한계가 있다. 프리필까지 원하면 별도 후속 작업 필요 — 정책 확정 요청.

## 현황 파악
- **브레이크포인트 확정 = `md`(768px)**. 데스크톱 사이드바 ↔ 모바일 탭바 전환 기준이 전부 `md`다.
  - `components/common/AppShell.tsx:39` — DesktopSideNav 래퍼 `hidden md:fixed ... md:block`
  - `components/common/AppShell.tsx:43` — 본문 `md:pl-20`(레일 폭 보정)
  - `components/common/MobileGNB.tsx:59` — `md:hidden`
  - `components/common/header.tsx:84` — 헤더 상단바 `w-full px-4 md:pl-20 py-3 flex items-center justify-between`
  - 따라서 검색바 노출 분기도 **`md`** 를 그대로 사용한다.
- **헤더 구조**: `components/common/header.tsx:84-163` — `justify-between`으로 좌측 로고 블록(`85-106`)과 우측 액션 블록(`108-161`, NotificationButton/내정보/장바구니/햄버거)만 존재. 중앙 슬롯 없음. 헤더는 전역 셸(`AppShell`)에서 마운트되어 **모든 페이지에 공통 노출**(단, `/chat/[id]` 몰입형 제외 — `AppShell.tsx:32,37`).
- **SearchBar는 자기완결형(라우팅 내장)**: `components/elements/searchBar/SearchBar.tsx`
  - `handleSubmit`(`111-117`): `onSearch`가 있으면 호출 후, **항상** `router.push('/search?query=...&option=...')` 로 이동. → `onSearch` 없이도 검색 라우팅이 동작한다. 따라서 헤더에 그대로 얹어도 **추가 로직/배선(writer) 불필요**.
  - 내부 상태는 `useState(query/selectedOption)`로 **인스턴스 로컬**. 헤더용·콘텐츠용 두 인스턴스가 동시에 살아도 상태 충돌 없음(동시에 하나만 화면에 보임).
  - 레이아웃: `w-full`, `[셀렉트박스(캐릭터명/작가명)] + [입력] + [검색 버튼]` 가로 배치(`131-168`). 헤더 삽입 시 **max-width 래퍼**로 폭 제한 필요.
  - ⚠️ **하드코딩 회색 스타일**(`bg-gray-50`/`bg-gray-100`/`border-gray-200`/`text-gray-700`/`bg-violet-500`, `141/155/160` 및 `components/elements/input/BaseInput.tsx:30`의 `bg-gray-100 text-gray-800`) — semantic 토큰이 아니라 **다크모드 미대응**. 기존 이슈이며 이번 스코프에서 리토큰화는 하지 않는다(리스크로만 명시).
- **검색바 사용처**:
  - `views/main/home.tsx:78-80` — 메인 홈 콘텐츠 영역(이번 작업 대상). `onSearch={handleSearch}`(단순 console.log, `64-67`).
  - `views/search/home.tsx:201-206` — 검색 결과 페이지. `initialValue={searchQuery}` + `onSearch`가 `useSearchStore`와 강결합.
  - `components/chat/ChatSearchBar.tsx`, `components/chat/ChatList.tsx` — 채팅 전용, 본 작업과 무관(범위 밖).
- **검색 스토어**: `store/useSearchStore.ts` — `/search` 페이지가 사용. 헤더/홈 검색바는 이 스토어에 의존하지 않고 URL 라우팅만 사용하므로 변경 불필요.

## 접근 방식
**추천: SearchBar 재사용 + 헤더 전용 표시 래퍼(HeaderSearch) 신설**

- SearchBar가 이미 라우팅을 내장하고 있어 **로직(writer) 작업이 전혀 필요 없다.** 전 작업이 프레젠테이션/반응형 노출 분기(**publisher**)로 수렴한다.
- 헤더에 `<SearchBar>`를 직접 인라인하지 않고, **`components/common/HeaderSearch.tsx`(신규, 표시용)** 로 감싼다. 이유:
  - 헤더 전용 폭 제한(`max-w-*`, `flex-1`)·중앙 정렬·`hidden md:flex` 노출 분기 등 헤더 스타일을 한 파일에 격리 → `header.tsx`(로직 다수 포함) 변경을 "import 1줄 + 중앙 슬롯 1개 + flex 조정"으로 최소화.
  - `header.tsx`는 이번 작업에서 **publisher 단독 소유**(레이아웃만 수정, 로직 무변경)로 유지 → 담당 겹침 없음.

**대안 비교**
| 대안 | 장점 | 단점 |
|---|---|---|
| A. SearchBar 재사용 + HeaderSearch 래퍼 (추천) | 최소 변경, 로직 재사용, 담당 단일화(전부 publisher) | 헤더에서도 SearchBar의 회색 하드코딩 스타일 그대로(다크모드 한계) |
| B. 헤더 전용 SearchBar variant 신설 | 헤더에 맞춘 컴팩트 스타일/토큰화 자유 | 중복 컴포넌트 증가, 검색 로직 재구현 위험, 스코프 확대 |
| C. header.tsx에 `<SearchBar>` 직접 인라인 | 파일 신설 없음 | 로직 파일에 표시 마크업이 섞이고 헤더 스타일 분리 안 됨 |

→ **A 추천.** 다크모드 스타일 통일은 별도 테마 토큰화 작업(진행 중인 `docs/plan/` 테마 계획)에 위임.

## 실행 계획 (단계별)

1. **HeaderSearch 표시 컴포넌트 신설** `[담당: publisher]` — `components/common/HeaderSearch.tsx`(신규)
   - 역할: 헤더 중앙 슬롯 전용 표시 래퍼. 내부에서 `SearchBar`(`@/components/elements/searchBar/SearchBar`)를 `onSearch` 없이 렌더(라우팅은 SearchBar 내장). props 불필요(자기완결).
   - 노출 분기: 루트 래퍼에 `hidden md:flex md:flex-1 justify-center`.
   - 폭 제한: 내부에 `w-full max-w-[560px]`(카베덕식 중앙 검색바 폭, 미세조정 가능) 래퍼로 SearchBar를 감싸 헤더에서 과도하게 넓어지지 않게 함.
   - 스타일: 새로 추가하는 래퍼 클래스는 semantic 토큰만 사용(하드코딩 HEX 금지). SearchBar 내부 스타일은 손대지 않음.
   - 반응형/터치: 입력·버튼 터치 타깃 44px 확보는 SearchBar 기존 크기 확인 후 필요 시 헤더 컨텍스트에서 패딩 보정(단, SearchBar 파일은 수정하지 않고 래퍼 레벨에서만).

2. **헤더에 중앙 검색 슬롯 배치(3분할 레이아웃)** `[담당: publisher]` — `components/common/header.tsx`
   - 상단바(`header.tsx:84`)의 로고 블록과 액션 블록 사이에 `<HeaderSearch />`를 삽입해 `[로고] [검색(flex-1 중앙)] [액션]` 3분할 구성.
   - `justify-between` 유지 + `HeaderSearch`가 `md:flex-1`로 가운데를 채우도록. 모바일에서는 `HeaderSearch`가 `hidden`이라 기존 `로고 ↔ 액션` 양끝 배치 그대로 유지됨(레이아웃 회귀 없음).
   - import 1줄 추가(`HeaderSearch`). 그 외 헤더 로직(테마/사이드바/로그인)은 **무변경**.
   - 검증 폭에서 로고·검색·액션이 겹치거나 가로 스크롤이 생기지 않도록 검색 래퍼 `min-w-0` 처리(플렉스 오버플로우 방지).

3. **메인 홈 콘텐츠 검색바 데스크톱 숨김** `[담당: publisher]` — `views/main/home.tsx:78-80`
   - 콘텐츠 검색바 래퍼(`<div ...><SearchBar .../></div>`, `78-80`)에 `md:hidden` 추가 → 모바일 전용 노출.
   - `onSearch`/props는 그대로 유지(모바일 동작 불변). 데스크톱에서는 헤더 검색바가 대체.

4. **검색 결과 페이지 콘텐츠 검색바 데스크톱 숨김** `[담당: publisher]` — `views/search/home.tsx:200-206`
   - 인라인 검색바 래퍼(`200`의 `<div>`)에 `md:hidden` 추가 → 데스크톱 중복 제거(헤더 검색바가 단일 진입점).
   - ⚠️ 데스크톱에서 헤더 검색바에는 현재 검색어 프리필이 안 됨(초기 스코프 한계, 위 "확인 필요 사항" 참조). `useSearchStore` 결과 렌더/페이지네이션 로직은 URL·스토어 기반이라 그대로 동작.
   - 정책상 `/search`에서 헤더 검색을 아예 숨기고 인라인만 쓰는 방향으로 확정되면, 본 단계 대신 "헤더 검색을 `/search`에서 조건부 미노출"로 전환(HeaderSearch에 `usePathname` 분기 추가 — 이 경우 HeaderSearch가 소폭 로직을 갖게 되나 라우트 기반 표시 분기 수준). 확정 전까지는 `md:hidden` 안을 기본으로 한다.

> 로직(writer) 단계 없음 — SearchBar 라우팅 내장으로 배선 불필요. 전 단계 publisher.

## 영향 범위 & 리스크
- **변경 파일(4)**: `components/common/HeaderSearch.tsx`(신규), `components/common/header.tsx`(레이아웃), `views/main/home.tsx`(노출 분기), `views/search/home.tsx`(노출 분기).
- **전 페이지 영향**: 헤더는 전역(AppShell) → 데스크톱에서 **모든 페이지 헤더에 검색바가 노출**된다(카베덕 의도와 일치). 콘텐츠 검색바를 데스크톱에서 숨기는 건 홈·검색 두 페이지뿐이므로, 그 외 페이지는 콘텐츠 검색바가 원래 없어 중복 이슈 없음.
- **`/chat/[id]` 몰입형**: 헤더 자체가 미마운트(`AppShell.tsx:37`)이므로 헤더 검색바도 자동 미노출 — 문제 없음.
- **다크모드 한계(기존 이슈)**: SearchBar/BaseInput의 회색 하드코딩으로 다크모드에서 헤더 검색바 배경이 어색할 수 있음. 이번 스코프 밖(테마 토큰화 계획에서 처리). 리스크로 명시.
- **레이아웃 깨짐 리스크**: 헤더 3분할 시 좁은 데스크톱(md~lg)에서 로고+액션+검색이 붐빌 수 있음 → 검색 래퍼 `min-w-0`, `max-w-[560px]`로 완충. 768px에서 액션 아이콘과 겹치지 않는지 확인 필수.
- **롤백**: 4개 변경이 독립적. 헤더 슬롯 제거 + `md:hidden` 3곳 원복이면 완전 롤백.

## 검증 방법
- `npx tsc --noEmit` 타입 체크, `npm run lint`(Biome) 통과.
- 수동 반응형 확인(최소 3폭):
  - **360px**: 헤더에 검색바 없음(로고↔액션 양끝), 홈 콘텐츠 검색바 노출·동작(검색 시 `/search` 이동). 가로 스크롤 없음.
  - **768px(md)**: 헤더 중앙 검색바 노출, 홈/검색 페이지 콘텐츠 검색바 숨김, 로고·검색·액션 겹침/잘림 없음.
  - **1280px**: 헤더 검색바 중앙 정렬·적정 폭(max-w), 검색 실행 시 `/search?query=...&option=...` 라우팅 정상.
- 기능 회귀: 데스크톱 헤더 검색 → 결과 페이지 이동/렌더 정상, 모바일 콘텐츠 검색 → 기존과 동일.
- `/chat/[id]` 진입 시 헤더·검색바 모두 미노출 확인.

## 범위 밖 (하지 않을 것)
- SearchBar/BaseInput의 회색 하드코딩 → semantic 토큰 리토큰화(다크모드 대응)는 별도 테마 작업.
- 검색 로직/스토어(`useSearchStore`) 변경, 검색 API·디바운스 재활성화.
- 채팅 검색(`ChatSearchBar`, `ChatList`) 관련 변경.
- 헤더 검색바에 `/search` 현재 검색어 프리필(후속, 정책 확정 시).
- 헤더 전용 컴팩트 SearchBar variant 신설(대안 B).
