# 홈 좌우 여백 복원 + 추천탭 카드 4.5개 복원 — 퍼블리싱 결과

- 작성 일자: 2026-07-21
- 근거 계획: `docs/plan/plan-20260721-home-margin-revert.md` (전 단계 `[담당: publisher]`, A안 전체 롤백)
- 대상 브랜치: `red-main`

## 퍼블리싱 요약
계획 1~4단계를 전부 A안(전체 롤백) 그대로 구현했다. 2026-07-10 caveduck 작업으로 홈 트리에만 적용됐던 `mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]` 전용 폭 클래스 6곳을 전역 `container mx-auto px-4` 방식으로 되돌리고, `<main>`의 `2xl:-ml-20 2xl:w-[calc(100%+5rem)]` 오프셋 핵과 관련 caveduck 주석을 제거했다. 이어서 `CardGrid.tsx`의 `getSlidesPerView`/`getGridColumns`(case 4 & default)를 commit `459018b` 확장 이전 값으로 되돌려 추천탭 스와이퍼가 `lg` 이상에서 4.5개로, 카테고리/랭킹 그리드가 `lg` 이상 5열로 복원되도록 했다.

## 변경 파일

1. **홈 셸/검색/탭 여백 복원**
   - `views/main/home.tsx:63-68` — `<main>`에서 `2xl:-ml-20 2xl:w-[calc(100%+5rem)]` 제거 → `className='min-h-screen pb-24 md:pb-20 bg-surface'`. 검색바 래퍼(`:65`) `md:hidden container mx-auto px-4 pt-6 relative`, 탭 래퍼(`:68`) `container mx-auto px-4 mt-8 flex justify-center`로 변경. caveduck 오프셋/전용폭 근거 주석 전부 제거, 검색바 위에 짧은 대체 주석("전역 container 방식(다른 페이지와 동일)")만 남김.

2. **추천 섹션 3종 여백 복원**
   - `components/main/recommend/LatestCharactersSection.tsx:17` — `container mx-auto px-4`
   - `components/main/recommend/EtcCharactersSection.tsx:17` — `container mx-auto px-4`
   - `components/main/recommend/CreateCharacterSection.tsx:27` — `container mx-auto px-4 text-center`
   - 각 파일의 `docs/publish/publish-20260710-home-margins-logo.md` 근거 주석 제거.

3. **카테고리/랭킹 탭 여백 복원**
   - `components/main/CharacterGridSection.tsx:96, 113, 134, 170` (로딩/에러/빈/정상 4개 분기 전부) — `container mx-auto px-4`
   - `components/main/ranking/RankingGridSectionView.tsx:56` — `container mx-auto px-4`
   - 동일 근거 주석 제거.

4. **CardGrid 밀도 롤백(추천탭 4.5 복원)**
   - `components/elements/card/CardGrid.tsx:167-170` `getSlidesPerView()` case 4 & default → `{ default: 2.5, sm: 2.5, md: 3.5, lg: 4.5 }`
   - `components/elements/card/CardGrid.tsx:240-243` `getGridColumns()` default → `'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'`, case 4 → `'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'`
   - `breakpoints` 객체·`useMediaQuery`·case 1~3은 변경하지 않음(계획 명시대로 유지, 예전 map과 cascade 호환 확인).

## 반응형 / 웹뷰 점검
- **코드 리뷰 기준(정적 확인)**: 6개 파일 모두 전역 `.container`(`tailwind.config.ts` `screens: sm640/md768/lg1024/xl1152/2xl1280`) + `px-4`로 통일되어, 다른 페이지(`views/shop-recharge/home.tsx`, `views/search/home.tsx` 등)와 동일한 좌우 여백 규칙을 공유한다.
- **360px**: `container` 좌우 패딩 `px-4`(1rem)만 적용되고 `max-width`는 걸리지 않아 기존과 동일하게 풀폭 사용, 가로 스크롤 유발 요소 없음. 카드 그리드는 `grid-cols-2`(모바일 기본)로 caveduck 확장 이전과 동일 — 변경 없음.
- **768px**: `md` 브레이크포인트에서 컨테이너 `max-width: 768px` 적용(전역 규칙). 카테고리/랭킹 그리드 `md:grid-cols-4`, 추천 스와이퍼 `md:3.5`로 롤백 — caveduck 확장(`md:4.5`/`md:grid-cols-4`~) 대비 밀도가 낮아지나 계획 의도(원본 복원)와 일치.
- **1280px 이상(2xl≥1536)**: `<main>`의 `2xl:-ml-20` 오프셋 핵 제거로 콘텐츠가 셸 사이드바 레일 기준이 아닌 전역 컨테이너(`max-width:1280px`) 중앙 정렬로 복귀. 추천탭 스와이퍼는 `lg:4.5`(peek 포함) 상한, 그리드는 `lg:grid-cols-5` 상한으로 caveduck 이전 밀도로 복원됨(계획의 폭 캡 계산: 카드 ≈265px vs 롤백 전 154px).
- **웹뷰 관련 고려사항**: 이번 변경은 컨테이너 폭/그리드 열수 클래스 치환일 뿐 `position:fixed`, `100vh`, 키보드 대응 등 웹뷰 특이 요소는 건드리지 않음(변경 없음, 회귀 리스크 없음). 터치 타깃(카드 최소 44px, 스와이퍼 네비 버튼)도 클래스 미변경.
- **실제 브라우저(360/768/1280) 렌더링 스크린샷 확인은 하지 않음** — 코드/클래스 매핑과 tsc/biome 결과 기준 정적 검증만 수행. 필요 시 개발 서버 기동 후 실측 확인 권장(확인 필요로 표시).

## 검증 결과
- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome check <변경 파일 7개>` — 실행됨. 검출된 이슈(미사용 import/변수, `noArrayIndexKey`, `useButtonType`, 개행(CRLF) 포맷 diff 등)는 모두 **이번 변경 이전부터 존재하던 기존 이슈**(git diff로 대조해 className 외 라인은 무변경임을 확인)이며, 계획 지시대로 **수정하지 않음**. 이번에 수정한 라인(className 문자열 자체)에는 새로운 lint 위반이 없음.

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- 없음 — 계획 1~4단계를 지시된 값 그대로 적용했으며, `breakpoints`/`useMediaQuery`/case 1~3, 데이터·상태·핸들러 로직은 변경하지 않음.
- (참고, 범위 밖 제안) `CardGrid.tsx`/`CharacterGridSection.tsx`/`home.tsx`/`CreateCharacterSection.tsx`에 남아있는 기존 biome 이슈(미사용 import/변수 등)는 이번 작업 범위가 아니므로 그대로 두었음. 정리가 필요하면 별도 계획으로 진행 권장.
