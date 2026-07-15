# 홈 캐릭터 카드 크기 축소 (caveduck 밀도) 퍼블리싱 결과

- 작성 일자: 2026-07-10
- 근거 계획: `docs/plan/plan-20260710-home-card-size-caveduck.md` (4단계 전부 `[담당: publisher]`)
- 대상 브랜치: `red-main`

## 퍼블리싱 요약
계획의 4단계(CardGrid 반응형 상한 확장, CharacterGridSection 컨테이너 통일, Card 세로형/my-character 내부 밀도 축소)를 계획서의 before/after 값 그대로 적용했다. `cardsPerRow`가 기본값(5) 또는 미지정인 홈의 모든 캐릭터 카드 노출 경로가 `default` 분기를 공유하므로, 데이터/props 배선을 건드리지 않고 순수 표시(마크업/Tailwind 클래스/이미지 치수)만 수정해 2560px에서 한 줄 ~7장 밀도를 구현했다.

## 변경 파일

### 1. `components/elements/card/CardGrid.tsx`
- `:22-30` — `SlidesPerViewMap` 인터페이스 신설(`xl?`, `'2xl'?` 옵셔널 추가, `getSlidesPerView` 반환 타입 명시용).
- `:172` — `getSlidesPerView(): number | SlidesPerViewMap` 반환 타입 명시.
- `:181, :183` (case 4 / default) — `{ default: 2.5, sm: 2.5, md: 3.5, lg: 4.5 }` → `{ default: 2.5, sm: 2.5, md: 3.5, lg: 5.5, xl: 6.5, '2xl': 7.5 }`.
- `:217-232` — `breakpoints` 맵에 `1280`(xl 폴백 lg→md→default), `1536`(2xl 폴백 xl→lg→md→default) 키 추가.
- `:249` — `getGridColumns()` default 분기: `...lg:grid-cols-5` → `...lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7`.
- `:367` — Swiper `spaceBetween={16}` → `spaceBetween={12}`.
- `:386` — 비-Swiper 그리드 gap `gap-4 md:gap-6` → `gap-3 md:gap-4`.

### 2. `components/main/CharacterGridSection.tsx`
- `:174-175` — 정상 데이터 렌더 컨테이너 `<div className='container mx-auto px-4'>` → `<div className='mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]'>` (로딩/에러/빈 상태 3곳과 동일 폭으로 통일, 근거 주석 유지).

### 3. `components/elements/card/Card.tsx` — 세로형(default) 분기
- `:380` — 랭킹 뱃지 `w-8 h-8` → `w-7 h-7`.
- `:391-395` — 성인 flames `isMobile?18.5:27.7` / `isMobile?23:35.3` → `isMobile?18.5:22` / `isMobile?23:28`.
- `:414-415` — faImage 아이콘/수치 `text-[14px] md:text-[20px]` → `text-[12px] md:text-[14px]`.
- `:426-432` — like 아이콘 `width/height isMobile?14:20` → `isMobile?12:16`, Lv 텍스트 `text-[14px] md:text-[20px]` → `text-[12px] md:text-[14px]`.
- `:441-447` — comment 이미지 `width isMobile?12:22 height 11:22` → `isMobile?12:16 / isMobile?11:16`, 수치 `text-[14px] md:text-[20px]` → `text-[12px] md:text-[14px]`.
- `:452` — 본문 패딩 `p-4` → `p-2.5`.
- `:453` — 제목 `font-bold ...` → `text-sm font-bold ...`.
- `:457, :461` — 태그 컨테이너 `mb-2` → `mb-1`, 태그 `text-xs px-2 py-0.5` → `text-[11px] px-1.5 py-0.5`.
- `:468` — 설명 `text-xs mb-1 line-clamp-2 h-8` → `text-[11px] mb-1 line-clamp-1 h-auto`.
- `:471, :486` — 작가 라인 아바타 `w-5 h-5` → `w-4 h-4`(이미지 `20x20`→`16x16`), 닉네임 `text-xs` → `text-[11px]`.

### 4. `components/elements/card/Card.tsx` — my-character 분기
- `:271-272` — 성인 flames `isMobile?18.5:27.7` / `isMobile?23:35.3` → `isMobile?18.5:22` / `isMobile?23:28` (세로형과 동일 값).
- `:303` — 본문 `p-4` → `p-2.5`.
- `:304` — 제목 `font-bold ...` → `text-sm font-bold ...`.
- `:308, :312` — 태그 컨테이너/태그 세로형과 동일 축소.
- `:319` — 설명 `text-xs h-8 line-clamp-2` → `text-[11px] h-auto line-clamp-1`.
- `:345-357` — 수정/삭제 버튼 `py-1.5 px-2 text-xs` → `py-1 px-1.5 text-[11px]`, 그리드 `gap-2 mt-2` → `gap-1.5 mt-1.5`.

## 반응형 / 웹뷰 점검
- **360px**: `default/sm` 분기(2.5장, my-character 포함) 값 미변경 → 회귀 없음. 컨테이너는 `px-4`만 적용(2xl:px-[100px] 미발동), 가로스크롤 없음.
- **768px**: `md` 분기(3.5장/그리드 4열) 미변경 → 회귀 없음.
- **1280px**: Swiper `xl:6.5장`, 그리드 `xl:grid-cols-6` 신규 발동. `CharacterGridSection` 컨테이너가 `max-w-[2200px] px-4`로 다른 섹션과 동일 폭이 되어 카드 폭이 계획서 목표치(~195px)에 근접.
- **2560px**: Swiper `2xl:7.5장`, 그리드 `2xl:grid-cols-7` + 컨테이너 `2xl:px-[100px]` 적용(캡 2200px) → 계획서 목표(한 줄 ~7장, 카드 폭 ~270px)에 부합.
- **웹뷰**: className/수치(px, rem 단위 유틸)만 조정, `position:fixed`/`100vh`/키보드 관련 신규 리스크 없음. 이미지 `next/image` width/height 치수만 축소했으며 `sizes` prop은 계획에 없어 미변경.
- 실측은 Playwright/브라우저 리사이즈로 직접 픽셀 캡처하지 않고 코드 레벨로 Tailwind 브레이크포인트·클래스 적용 여부를 확인함(**시각적 스크린샷 검증은 미수행 — 확인 필요 시 추가 요청**).

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- 계획서 값과 다르게 적용한 부분: 세로형 이미지 `sizes` prop을 실수로 `20vw`→`15vw`로 수정했다가 계획에 없는 변경임을 인지하고 즉시 원복(`20vw` 유지)함. 최종 diff에는 반영되지 않음.
- **my-character 분기 터치 타깃 우려(계획서에 명시된 "집중 검증 대상")**: 수정/삭제 버튼이 `py-1 px-1.5 text-[11px]`로 축소되어 2xl(7열) 기준 버튼 높이가 44px에 미달할 가능성이 높음. 계획서에서도 "문제 시 후속(writer)으로 `views/my-characters/home.tsx`에 낮은 `cardsPerRow` tier를 명시하는 보정"을 예정해 두었으므로, 실제 화면에서 버튼 터치 가능 여부를 확인 후 필요 시 code-writer에게 `cardsPerRow` 조정(예: 6 이하로 고정)을 요청하는 것을 제안한다. **이번 작업 범위(default 분기 확장)는 계획대로 완료, 이 보정은 범위 밖(후속)으로 남김.**
- 스켈레톤 개수(`Array(cardsPerRow)`=5)가 넓은 화면 카드 수(6~7)보다 적어 로딩 순간 빈 칸이 생기는 점은 계획서에서 "경미, 후속"으로 명시되어 이번엔 미변경.
- `npx tsc --noEmit`, 변경 파일 대상 `npx biome lint` 통과 확인(전체 `npm run lint`는 본 작업과 무관한 기존 프로젝트 전역 이슈 다수 존재 — 변경 파일의 diff 범위에는 새 오류 없음).
