# 검색바 헤더 이동(카베덕 스타일) 반응형 — 코드 리뷰

- 리뷰 일자: 2026-07-15
- 대상 브랜치/커밋: `red-main` (작업 트리 미커밋 변경, base `459018b`)
- 근거 문서: `docs/plan/plan-20260715-header-searchbar.md`, `docs/publish/publish-20260715-header-searchbar.md`
- 리뷰한 파일:
  - `components/common/HeaderSearch.tsx` (신규)
  - `components/common/header.tsx` (수정)
  - `views/main/home.tsx` (수정)
  - `views/search/home.tsx` (수정)
  - (참고 확인) `components/elements/searchBar/SearchBar.tsx`, `components/elements/selectbox/BaseSelectBox.tsx`, `components/elements/input/BaseInput.tsx`, `components/elements/button/BaseButton.tsx`, `components/common/AppShell.tsx`

## 리뷰 요약
계획대로 로직(writer) 작업 없이 순수 표시/반응형 분기만으로 헤더 검색바를 구현했고, `header.tsx`의 diff가 실제로 "import 1줄 + 슬롯 1줄"로 최소화되어 있어 회귀 리스크가 매우 낮게 관리됐습니다. `hidden`/`md:hidden` 조합이 모바일에서 기존 레이아웃(`justify-between` 2분할)을 그대로 보존하고, `min-w-0`/`max-w-[560px]`로 좁은 데스크톱에서의 오버플로우도 사전에 방어한 점이 좋습니다. Critical 이슈는 없고, Warning 2건(수동 반응형 실측 미확인, 접근성 랜드마크 부재)과 Suggestion 몇 건을 남깁니다.

## 심각도별 지적

### 🟡 Warning (개선 권장)

- **[views/search/home.tsx / 전반] 좁은 데스크톱(768~900px) 실측 검증이 코드 리뷰로는 완전히 보증되지 않음** — publish 문서(`publish-20260715-header-searchbar.md:34,43`)에서도 "실기기/실브라우저 렌더 확인은 못했음"으로 스스로 명시하고 있습니다. 정적 분석 결과:
  - `header.tsx:85`의 `flex items-center justify-between`에 `HeaderSearch`(`md:flex-1 min-w-0`)가 끼면서, 좁은 폭에서 초과분은 flex-shrink 알고리즘상 `min-w-0`이 걸린 검색 슬롯이 먼저 줄어들고 로고/액션 블록(별도 `min-w-0` 없음)은 자기 min-content 이하로 줄지 않으므로 이론상 겹침/가로 스크롤은 방지됩니다.
  - 다만 이는 "이론적 계산"이며, 실제 768px 부근에서 `BaseSelectBox`(`max-w-[150px]`) + 입력 + 버튼이 지나치게 좁아져 텍스트가 잘리거나 버튼이 찌그러지는 시각적 문제는 브라우저 리사이즈로 직접 확인해야 합니다. 배포 전 360 / 768 / 900 / 1280px 실측을 권장합니다(계획서의 "검증 방법"에도 명시된 항목).

  ```tsx
  // 확인 권장 지점 — components/common/HeaderSearch.tsx
  <div className='hidden md:flex md:flex-1 min-w-0 justify-center px-2'>
    <div className='w-full max-w-[560px] min-w-0'>
      <SearchBar placeholder='캐릭터나 작가를 검색해보세요' />
    </div>
  </div>
  ```

- **[components/common/HeaderSearch.tsx] 검색 랜드마크/접근성 라벨 부재** — 헤더와 콘텐츠 영역에 동일한 플레이스홀더의 `SearchBar`가 CSS로만 토글되어 동시에 DOM에 존재합니다(스크린리더 등 보조기술이 폼을 인식할 때 어떤 것이 "헤더 검색"인지 구분할 시맨틱 힌트가 없음). `role="search"`/`aria-label`을 래퍼에 추가하면 저비용으로 개선 가능합니다.

  ```tsx
  // before
  export default function HeaderSearch() {
    return (
      <div className='hidden md:flex md:flex-1 min-w-0 justify-center px-2'>
        <div className='w-full max-w-[560px] min-w-0'>
          <SearchBar placeholder='캐릭터나 작가를 검색해보세요' />
        </div>
      </div>
    );
  }

  // after
  export default function HeaderSearch() {
    return (
      <div
        role='search'
        aria-label='헤더 검색'
        className='hidden md:flex md:flex-1 min-w-0 justify-center px-2'
      >
        <div className='w-full max-w-[560px] min-w-0'>
          <SearchBar placeholder='캐릭터나 작가를 검색해보세요' />
        </div>
      </div>
    );
  }
  ```

### 🔵 Suggestion (선택적 제안)

- **[views/search/home.tsx] `/search` 데스크톱 진입 시 헤더 검색바에 현재 검색어(`initialValue`)가 프리필되지 않는 한계** — 계획서에서 이미 알려진 리스크로 명시(1차 스코프 밖)되어 있고, 이번 diff 범위에서 처리할 필요는 없습니다. 다만 실제 사용자가 `/search?query=...`로 들어왔을 때 데스크톱에서 "검색창이 비어 보인다"는 체감 회귀가 있을 수 있어, 후속 작업(헤더 검색바에 `usePathname` + `useSearchParams` 기반 prefill)을 백로그로 남겨두는 것을 권장합니다.
- **[components/common/HeaderSearch.tsx] 컴포넌트 두 벌이 항상 DOM에 공존** — CSS `hidden`/`md:hidden` 방식이라 헤더 인스턴스와 콘텐츠 인스턴스가 뷰포트와 무관하게 항상 마운트됩니다. 이는 이 프로젝트의 기존 반응형 패턴(`MobileGNB`, `DesktopSideNav` 등)과 일치하는 관행이라 문제 삼을 정도는 아니지만, `BaseSelectBox`의 `useEffect`(외부 클릭 리스너)가 숨겨진 인스턴스에서도 계속 등록되어 있다는 점은 참고만 해두면 좋겠습니다(현재 스코프에서 성능 영향은 미미).
- **[components/common/header.tsx] 슬롯 삽입 위치의 주석 부재** — `<HeaderSearch />` 삽입부에 계획서(`docs/plan/plan-20260715-header-searchbar.md`) 근거 주석이 없습니다. 같은 파일의 다른 블록(로고, 로직)에는 근거 주석이 꼬리표처럼 달려 있는 이 프로젝트 관행(예: `header.tsx:87-89`, `views/main/home.tsx:74-77`)을 따라 한 줄 근거 주석을 남기면 추후 추적이 쉬워집니다.

  ```tsx
  // after (제안)
  <div className='flex items-center'>...</div>

  {/* 헤더 중앙 검색 슬롯(데스크톱 전용). 근거: docs/plan/plan-20260715-header-searchbar.md (2단계) */}
  <HeaderSearch />
  ```

## 잘한 점
- `header.tsx`의 실제 diff가 계획서/퍼블리시 문서에서 선언한 대로 "import 1줄 + `<HeaderSearch />` 1줄"로 정확히 제한되어 있음을 `git diff`로 직접 확인했습니다. 테마·사이드바·로그인 로직은 한 글자도 건드리지 않아 겹침·회귀 리스크가 최소화됐습니다.
- 모바일에서 `HeaderSearch`가 `hidden`(즉 `display:none`)이라 `justify-between` 컨테이너의 flex item 개수가 실질적으로 2개로 유지되어, 기존 로고↔액션 양끝 배치가 CSS만으로 자연스럽게 보존됩니다. 조건부 렌더링 없이 순수 CSS로 처리한 선택이 안전합니다.
- `min-w-0` + `max-w-[560px]` 조합으로 flex 오버플로우(가로 스크롤) 리스크를 사전에 방어한 설계가 꼼꼼합니다. `BaseSelectBox`의 드롭다운(`absolute z-50`)도 조상 요소 어디에도 `overflow-hidden`이 없어 헤더 sticky 컨텍스트에서 잘림 없이 정상 렌더될 것으로 확인됩니다.
- `SearchBar`가 라우팅을 자체 내장(`router.push('/search?...')`)하고 있다는 점을 정확히 파악해 별도 배선(writer) 없이 재사용한 판단이 합리적입니다. 코드 재구현/중복 없이 최소 변경으로 목표를 달성했습니다.
- `npx tsc --noEmit` 통과, 신규/변경 라인에는 Biome lint 오류 없음을 직접 재확인했습니다(기존 미사용 import 등 프로젝트 전역의 선행 이슈와 무관).
- 새 파일(`HeaderSearch.tsx`)이 PascalCase 컴포넌트 파일명, single quote, 세미콜론 등 프로젝트 Biome 컨벤션을 그대로 따르고 있으며, `components/common/`(레거시) 위치를 헤더 관련 기존 파일들과 일관되게 선택해 FSD/레거시 혼재 이슈를 만들지 않았습니다.
