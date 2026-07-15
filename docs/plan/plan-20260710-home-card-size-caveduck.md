# 홈 캐릭터 카드 크기 축소 (caveduck 밀도) 구현 계획

- 작성 일자: 2026-07-10
- 대상 브랜치: `red-main`
- 목표 한 줄 요약: 홈(메인)의 캐릭터 카드를 caveduck.io 수준의 컴팩트한 밀도(넓은 화면 한 줄 ~7장)로 줄인다. 모바일 2~2.5장은 유지, 360/768/1280/2560px 전부 깨짐·가로스크롤 없이.

---

## 목표
홈 화면 캐릭터 카드가 넓은 화면(1280~2560px)에서 지나치게 커 보이는 문제를 caveduck 밀도(2560에서 한 줄 ~7장)로 축소한다. 원인 3대 요인(콘텐츠 폭 컨테이너 불일치 · 한 줄 카드 수 상한 부재 · 카드 내부 패딩/폰트/아이콘 과대)을 최소 변경으로 교정한다.

## 현황 파악 (실측 조사 결과)

### CardGrid 사용 매트릭스 (전수 grep 확인)
| 호출 위치 | `useSwiper` | `cardsPerRow` | `variant` | 분기(Card.tsx) | 홈 여부 |
|---|---|---|---|---|---|
| `components/main/recommend/CharacterRankingSection.tsx:116` | true | 5 | default | 세로형(369~) | ✅ 홈 |
| `components/main/recommend/LatestCharactersSection.tsx:33` | true | 5 | default | 세로형 | ✅ 홈 |
| `components/main/recommend/EtcCharactersSection.tsx:39` | true | 5 | default | 세로형 | ✅ 홈 |
| `components/main/CharacterGridSection.tsx:179` | **false(그리드)** | 미지정→기본 5 | default | 세로형 | ✅ 홈(카테고리 필터 시) |
| `views/search/home.tsx:252` | false(그리드) | 6 | default | 세로형 | 검색 |
| `views/author/detail.tsx:111` | false(그리드) | 5 | default | 세로형 | 작가상세 |
| `views/my-characters/home.tsx:123` | false(그리드) | 미지정→기본 5 | **my-character** | my-char 분기(255~) | 내 캐릭터 |
| `components/elements/sidebar/CharacterRankingSidebar.tsx:117` | false | 1 | horizontal | 가로형 분기(136~) | 사이드바 |
| `components/elements/sidebar/LatestCharacterSidebar.tsx:103` | false | 2 | default | 세로형 | 사이드바 |
| `components/elements/sidebar/EtcCharacterSidebar.tsx:100` | false | 1 | horizontal | 가로형 | 사이드바 |
| `components/elements/sidebar/NewCharacterSidebar.tsx:116` | false | 1 | horizontal | 가로형 | 사이드바 |

- **작가 랭킹은 `AuthorGrid`(별도 컴포넌트, `cardsPerRow=8`)를 쓰므로 본 작업 범위 밖**(캐릭터 카드 아님). `AuthorRankingSection.tsx:100`.
- **핵심 발견**: 홈의 캐릭터 카드는 모두 `cardsPerRow=5`(또는 미지정→기본 5)라 CardGrid의 `getSlidesPerView()`/`getGridColumns()`에서 전부 **`default` 분기**로 떨어진다. 검색(6)·작가상세(5)·내 캐릭터(기본 5)도 마찬가지로 전부 `default` 분기. 즉 **`default` 분기 한 곳만 손보면 홈 전 섹션이 동시에 교정**되고, cardsPerRow prop을 바꿀 필요가 없다(최소 변경).

### 요인 1 — 콘텐츠 폭 컨테이너 불일치
- 대부분 섹션: `mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]` (publish-20260710-home-margins-logo.md에서 caveduck 근사로 도입).
  - `RecommendSection.tsx:42`, `CharacterRankingSection.tsx:78`(제목/탭), `:113`(그리드, `pl-4 2xl:pl-[100px] pr-0`), `AuthorRankingSection.tsx:75`, `LatestCharactersSection.tsx:18`, `EtcCharactersSection.tsx:18`, `CreateCharacterSection.tsx:28`, `CharacterGridSection.tsx:97/119/141`(로딩/에러/빈 상태).
- **불일치**: `CharacterGridSection.tsx:174`(정상 데이터 렌더)만 `container mx-auto px-4`를 사용 → 다른 섹션보다 좁고(전역 `.container` 2xl 캡 1280px) 넓은 화면에서 카드가 상대적으로 커 보임. → 홈 전용 폭 클래스로 통일 필요.

### 요인 2 — 한 줄 카드 수 상한 부재 (가장 큰 원인)
`components/elements/card/CardGrid.tsx`
- Swiper `getSlidesPerView()` (163~176): `default` 분기 최대 `lg: 4.5`. **xl(1280)/2xl(1536) 없음** → 1024~2560px 내내 4.5장 고정 → 카드 거대화.
- `breakpoints`(182~208): 키가 320/640/768/1024까지만. **1280/1536 없음.**
- 비-Swiper `getGridColumns()` (211~224): `default` 최대 `lg:grid-cols-5`. xl/2xl 없음.
- `spaceBetween={16}`(340), 비-Swiper gap `gap-4 md:gap-6`(359).

### 요인 3 — 카드 내부 밀도
`components/elements/card/Card.tsx`
- 세로형(369~): 이미지 `aspect-[3/4]`(유지), 본문 `p-4`(451), 제목 `font-bold`(크기 미지정=text-base 상당), 설명 `text-xs h-8`, 태그 `text-xs px-2`, 작가 라인 아바타 20px.
- 오버레이 통계(410~448): 아이콘/폰트 `text-[14px] md:text-[20px]`, 이미지 width `isMobile?12:22` / `isMobile?14:20`, 성인 flames `isMobile?18.5:27.7` — **넓은 화면에서 과대**.
- my-character 분기(255~361): 이미지 `aspect-[3/4]`, 본문 `p-4`(303), 수정/삭제 버튼.
- 가로형 분기(136~253): 사이드바 전용, 본 작업과 무관(건드리지 않음).

---

## 접근 방식

### 추천안: `default` 분기 확장 + 컨테이너 통일 + 카드 세로형/내부 밀도 축소 (전부 presentation)
- **왜**: 홈 캐릭터 카드는 전부 `default` 분기이므로, `getSlidesPerView`/`getGridColumns`/`breakpoints`의 `default` 케이스에 xl/2xl 단계만 추가하면 홈 전 섹션이 한 번에 교정된다. `cardsPerRow` prop 값·데이터·핸들러를 전혀 건드리지 않아 **로직(writer) 변경이 없다**. 전부 반응형 표시 로직/스타일 → publisher 담당.
- 카드 내부는 세로형 분기(홈·검색·작가상세 공용)와 my-character 분기(내 캐릭터)를 각각 패딩/폰트/아이콘만 축소.

### 대안 비교
- **대안 B (섹션별 명시 tier)**: switch에 `case 6/7` 신설 + 홈 섹션에 `cardsPerRow={7}` 전달. → 홈만 정밀 제어 가능하나 각 섹션 prop을 수정(wiring=writer)해야 하고 case 중복이 늘어 변경량↑. 홈/검색/작가 모두 caveduck 밀도가 바람직하므로 굳이 분리할 실익이 적음.
- **채택: 추천안(A)**. 단, 내 캐릭터(my-character, 버튼 포함)가 2xl 7열에서 과도하게 작아지는지 검증 후, 문제 시에만 my-characters 호출부에 낮은 tier를 명시하는 보정을 후속(writer)로 둔다.

---

## 실행 계획 (단계별)

### 1. CardGrid 반응형 상한 확장 `[담당: publisher]`
`components/elements/card/CardGrid.tsx` — `getSlidesPerView()`/`breakpoints`/`getGridColumns()`/`spaceBetween`/gap. (표시용 반응형 로직 — 데이터/핸들러 무관.)

- `getSlidesPerView()` `default` 분기 (case 4도 동일 객체이므로 함께):
  - **before**: `{ default: 2.5, sm: 2.5, md: 3.5, lg: 4.5 }`
  - **after**: `{ default: 2.5, sm: 2.5, md: 3.5, lg: 5.5, xl: 6.5, '2xl': 7.5 }`
  - (case 1/2/3은 사이드바 전용 → 변경 금지.)
- `breakpoints` 맵에 1280/1536 키 추가:
  - **before**: 키 `320 / 640 / 768 / 1024`
  - **after**: 위 4개 유지 + 
    - `1280: { slidesPerView: obj.xl ?? obj.lg ?? ..., slidesPerGroup: 1 }`
    - `1536: { slidesPerView: obj['2xl'] ?? obj.xl ?? obj.lg ?? ..., slidesPerGroup: 1 }`
  - `'2xl'` 키는 브래킷 표기(`slidesPerView['2xl']`)로 접근. slidesPerView 객체 타입에 `xl?`, `'2xl'?` 옵셔널 추가.
- `getGridColumns()` `default` 분기:
  - **before**: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
  - **after**: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7`
- 간격 축소(caveduck 조밀감):
  - Swiper `spaceBetween={16}`(340) → `spaceBetween={12}`
  - 비-Swiper gap `gap-4 md:gap-6`(359) → `gap-3 md:gap-4`
- (선택) 스켈레톤 수: `renderSkeletons`/그리드 스켈레톤이 `Array(cardsPerRow)`(5개)라 넓은 화면에서 빈 칸이 생김 — 기능 영향 없어 이번엔 미변경(후속 개선 여지).

### 2. CharacterGridSection 컨테이너 불일치 정리 `[담당: publisher]`
`components/main/CharacterGridSection.tsx:174`
- **before**: `<div className='container mx-auto px-4'>`
- **after**: `<div className='mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]'>` (로딩/에러/빈 상태 3곳과 동일 폭으로 통일, 근거 주석 유지)
- 홈 전용 트리로 확인됨(publish-20260710-home-margins-logo.md) → 타 페이지 영향 없음.

### 3. Card 세로형 내부 밀도 축소 `[담당: publisher]`
`components/elements/card/Card.tsx` 세로형 분기(369~494). (홈·검색·작가상세 공용.)
- 본문 패딩 `p-4`(451) → `p-2.5`
- 제목 h3(452): `font-bold ...` → `text-sm font-bold ...` (크기 명시로 축소)
- 태그 컨테이너(456) `mb-2` → `mb-1`, 태그 `text-xs px-2 py-0.5` → `text-[11px] px-1.5 py-0.5`
- 설명(467) `text-xs ... h-8` → `text-[11px] ... h-auto line-clamp-1` (또는 line-clamp-2 유지 시 `h-7`) — 카드 높이 절감
- 작가 라인(470~) 아바타 `w-5 h-5`→`w-4 h-4`, 닉네임 `text-xs`→`text-[11px]`
- 오버레이 통계(410~448) 넓은 화면 과대 축소:
  - faImage(414) `text-[14px] md:text-[20px]` → `text-[12px] md:text-[14px]`, 수치 span 동일
  - like 아이콘(427) `width/height isMobile?14:20` → `isMobile?12:16`, Lv 텍스트(430) `text-[14px] md:text-[20px]` → `text-[12px] md:text-[14px]`
  - comment 이미지(443) `width isMobile?12:22 height 11:22` → `isMobile?12:16` / `isMobile?11:16`, 수치(446) `text-[14px] md:text-[20px]` → `text-[12px] md:text-[14px]`
  - 성인 flames(388~394) `isMobile?27.7:35.3` 계열 → 데스크톱 값 축소(예 `isMobile?18.5:22` / `23:28`)
  - 랭킹 뱃지(379) `w-8 h-8` → `w-7 h-7`(작은 카드 대비)

### 4. Card my-character 내부 밀도 축소 `[담당: publisher]`
`components/elements/card/Card.tsx` my-character 분기(255~366). (내 캐릭터 페이지 전용.)
- 본문 `p-4`(303) → `p-2.5`
- 제목(304) `font-bold ...` → `text-sm font-bold ...`
- 태그(308~316) 세로형과 동일 축소
- 설명(319) `text-xs h-8` → `text-[11px] h-auto line-clamp-1`
- 수정/삭제 버튼(345~359) `py-1.5 px-2 text-xs` → `py-1 px-1.5 text-[11px]`, 그리드 `gap-2 mt-2` → `gap-1.5 mt-1.5`
- 성인 flames(266~274) 세로형과 동일 축소

> 단계 3·4는 같은 파일(`Card.tsx`)의 **서로 다른 분기**만 각각 수정 → 파일 내 충돌 없음. 둘 다 순수 표시(마크업/스타일)이므로 publisher 단독. **writer 담당 단계 없음**(데이터/상태/핸들러/prop 배선 변경 없음).

---

## 목표 밀도 근거 (콘텐츠 폭 대비 카드 폭 계산)
콘텐츠 폭 = `min(viewport, 2200) - 2×padding` (px-4=16, 2xl:px-[100px]=100).
- **1280px**: content ≈ 1280-32=1248, 그리드 6열 gap md:gap-4(16) → 카드 ≈ (1248-80)/6 ≈ **195px** (이미지 높 ≈ 260px). 컴팩트.
- **1536px**: content ≈ 1536-200=1336, 7열 → (1336-96)/7 ≈ **177px**.
- **2560px**: content = 2200-200=2000(캡), 7열 → (2000-96)/7 ≈ **272px** → 한 줄 ~7장, caveduck 밀도 근사.
- Swiper(2xl 7.5장, spaceBetween 12): 캐릭터 랭킹 컨테이너(`pr-0` 우측 오버플로우) 기준 카드 폭 ≈ 그리드와 정합(~270px).
- **모바일 360/768**: default/sm 2.5, md 3.5 → 현행 유지(2xl:px-[100px] 미적용, px-4만). 가로스크롤 없음.

---

## 영향 범위 & 리스크
- **`default` 분기 확장이 파급되는 곳**: 홈 3개 swiper 섹션 + 홈 카테고리 그리드(CharacterGridSection) + `views/search`(6→default) + `views/author/detail`(5→default) + `views/my-characters`(default, my-character variant). 전부 넓은 화면에서 열 수 증가 = 카드 축소.
  - **검색/작가상세**: caveduck 밀도가 바람직 → 개선으로 간주(회귀 아님).
  - **내 캐릭터(my-character)**: 2xl 7열 시 수정/삭제 버튼이 작아질 수 있음 → **집중 검증 대상**. 버튼 터치 타깃(≥44px 권장) 확보 어려우면 후속으로 `views/my-characters/home.tsx:123`에 `cardsPerRow`를 낮은 값(예: 신설 case)으로 명시하는 보정(=writer/wiring)을 추가. (이번엔 기본 확장 후 실측으로 판단.)
- **사이드바(1/2 tier, 가로형 분기)**: `default` 분기·세로형 내부 변경과 무관 → 영향 없음. (LatestCharacterSidebar는 세로형이나 `cardsPerRow=2`=case 2로 default 미적용, Card 세로형 폰트 축소는 반영되나 사이드바 폭에서 오히려 적절.)
- **작가 랭킹(AuthorGrid)**: 별도 컴포넌트 → 미변경.
- **스켈레톤**: 넓은 화면에서 스켈레톤 5개만 노출(카드보다 적음) — 로딩 순간 시각적 빈칸, 기능 무해. `CardSkeleton imageHeight={236}` 고정값이 축소된 카드보다 커 보일 수 있음 → 경미, 후속.
- **모바일 회귀 없음**: default/sm 2.5 유지, xl/2xl는 1280/1536↑에서만 발동.
- **웹뷰**: className/수치 조정만 → `position:fixed`/`100vh`/키보드 신규 리스크 없음.

## 검증 방법
- `npx tsc --noEmit` (slidesPerView 객체에 `xl`/`'2xl'` 옵셔널 추가 후 breakpoints 접근 타입 확인).
- 브라우저 리사이즈 실측 — **360 / 768 / 1280 / 2560px**:
  - 360/768: 카드 2.5~3.5장, 가로스크롤·잘림 없음(현행 유지).
  - 1280: 그리드 6열 / swiper 6.5장, 카드 폭 ~195px.
  - 2560: 한 줄 ~7장(그리드 7열 / swiper 7.5장), caveduck 밀도 근사, 우측 오버플로우 정상.
- 홈 정상 렌더(추천 swiper) + 카테고리 필터 선택 시 그리드(CharacterGridSection) 양쪽 확인.
- 내 캐릭터 페이지 2560px에서 수정/삭제 버튼 터치 가능 여부 집중 확인.
- 검색/작가상세 페이지 레이아웃 깨짐 없는지 확인.

## 범위 밖 (하지 않을 것)
- `AuthorGrid`(작가 랭킹) 카드 축소 — 별도 컴포넌트, 캐릭터 카드 아님.
- 사이드바 카드(가로형 분기) 디자인 변경.
- `cardsPerRow` prop 값 변경 및 신규 case 신설(추천안은 default 확장으로 해결). 내 캐릭터 보정이 필요할 때만 후속 writer 단계로.
- 스켈레톤 개수/높이 동기화(경미, 후속 여지).
- 데이터/스토어/페칭/핸들러 로직 변경(writer 작업 없음).
