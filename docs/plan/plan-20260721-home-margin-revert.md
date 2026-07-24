# 홈 좌우 여백 복원 + 추천탭 카드 4.5개 복원 계획

- 작성 일자: 2026-07-21
- 대상 브랜치/커밋: `red-main` @ `6eb151d`
- 목표 한 줄 요약: 2026-07-10 caveduck 작업으로 홈에만 적용됐던 전용 폭 클래스를 전역 `.container` 방식으로 되돌리고, CardGrid의 caveduck 밀도 확장(commit `459018b`)을 되돌려 추천탭 스와이퍼를 한 줄 4.5개로 복원한다.

---

## 목표
홈(메인)의 좌우 여백을 다른 페이지와 동일한 전역 `container mx-auto px-4` 방식으로 되돌리고, 추천탭 카드 그리드(스와이퍼)를 caveduck 확장 이전의 한 줄 4.5개(`lg:4.5`)로 복원한다.

## 현황 파악

### 1) 여백 — 홈 전용 폭 클래스 (전수 grep 확정)
전역 `.container`(`tailwind.config.ts:177` `container: { center, padding:'1rem', screens: sm640/md768/lg1024/xl1152/2xl1280 }`) 대신 홈 트리에만 `mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]`가 쓰였다. 리포지토리 전수 grep(`max-w-[2200px]` / `2xl:px-[100px]` / `calc(100%+5rem)` / `-ml-20 2xl`) 결과 **정확히 아래 6개 파일**만 매칭 — 다른 페이지·`src/`에는 없음:

- `views/main/home.tsx:64` — `<main>`에 `2xl:-ml-20 2xl:w-[calc(100%+5rem)]` (셸 `md:pl-20` 레일 오프셋 상쇄용 caveduck 핵)
- `views/main/home.tsx:70` — 검색바 래퍼(`md:hidden ... pt-6 relative`)
- `views/main/home.tsx:75` — 탭 래퍼(`mt-8 flex justify-center`)
- `components/main/recommend/LatestCharactersSection.tsx:18`
- `components/main/recommend/EtcCharactersSection.tsx:18`
- `components/main/recommend/CreateCharacterSection.tsx:28`
- `components/main/CharacterGridSection.tsx:97, 119, 141, 175` (로딩/에러/빈/정상 4개 분기)
- `components/main/ranking/RankingGridSectionView.tsx:57`

비교 대상(예전=현재 다른 페이지 공통 방식): `views/shop-recharge/home.tsx`, `views/chat-list/home.tsx:403`, `views/search/home.tsx:199`, `views/my-characters/home.tsx:98`, `views/author/detail.tsx:57`, `components/common/footer.tsx:30` 모두 `container mx-auto px-4`.

### 2) 카드 밀도 — CardGrid (commit `459018b` "Card bug fixed"에서 확장됨)
`components/elements/card/CardGrid.tsx`:
- 현재 `getSlidesPerView()` case 4 & default(160~171): `{ default: 2.5, xs: 3.5, sm: 3.5, md: 4.5, lg: 5.5, xl: 6.5, '2xl': 7.5 }`
- **caveduck 확장 이전 값**(git `459018b` diff로 확정): case 4 & default 모두 `{ default: 2.5, sm: 2.5, md: 3.5, lg: 4.5 }` → **lg 이상 4.5개 상한**
- 현재 `getGridColumns()` case 4 & default(232~245): default `grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7`, case4 `grid-cols-2 xs:grid-cols-3 md:grid-cols-3 lg:grid-cols-4`
- **확장 이전 값**: default `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`, case4 `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- `breakpoints` 객체(178~229)에 480/1280/1536 구간이 추가돼 있으나, 예전 map에는 `xs/xl/2xl` 키가 없어 자동으로 하위 키(`lg` 등)로 cascade → **breakpoints 객체는 건드릴 필요 없음**(예전 map과 호환).
- `useMediaQuery` 리팩터(같은 커밋)도 밀도와 무관 → **유지**.

### 3) CardGrid 소비자별 swiper/grid 구분 (되돌림 스코프 판정의 핵심)
- **`useSwiper={true}` (→ getSlidesPerView 적용)**: 추천탭의 `LatestCharactersSection`(cardsPerRow=5), `EtcCharactersSection`(cardsPerRow=5) **뿐**.
- **`useSwiper={false}` (→ getGridColumns 적용)**: `views/search/home.tsx:253`(6), `views/author/detail.tsx:115`(5), `views/my-characters/home.tsx:128`(5), `CharacterGridSection`(카테고리탭), `RankingGridSectionView`(랭킹탭).
- 결론: **`getSlidesPerView` 되돌림은 스와이퍼를 쓰는 추천탭에만 자연 스코프된다.** 다른 페이지/탭은 그리드라 영향 없음.

## 접근 방식

### 여백 (요구사항 1)
6개 파일의 `mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]` → `container mx-auto px-4`로 치환하고, `views/main/home.tsx:64`의 `<main>`에서 `2xl:-ml-20 2xl:w-[calc(100%+5rem)]` 핵을 제거(다른 페이지엔 이런 보정이 없으므로 제거가 정합). 나머지 유틸(`md:hidden`, `pt-6 relative`, `mt-8 flex justify-center`, `text-center`, `py-*`, `bg-*` 등)은 각 래퍼에 그대로 유지.

### 카드 4.5개 (요구사항 2) — 추천안: CardGrid 밀도 전체 롤백(commit 459018b의 밀도 부분 되돌리기)
`getSlidesPerView`·`getGridColumns`의 case 4 + default를 예전 값으로 되돌린다.

- **추천 대안(A, 채택)**: `getSlidesPerView` + `getGridColumns` 둘 다 롤백.
  - `getSlidesPerView` 롤백은 **스와이퍼=추천탭에만** 걸리므로 "추천탭 4.5"를 정확히 충족(요구사항 2 직결).
  - `getGridColumns` 롤백은 그리드(카테고리/랭킹/검색/작가/내캐릭터)의 lg 이상 열수를 `grid-cols-5`(예전)로 복원. **여백이 1280px 컨테이너로 돌아가면 `2xl:grid-cols-7`은 카드가 과도하게 작아지므로**(아래 계산) 함께 롤백해야 밀도가 정합.
- **대안(B, 미채택)**: `getSlidesPerView`만 롤백하고 `getGridColumns`는 현행 유지. → 추천탭 4.5는 되지만, 홈 카테고리/랭킹 그리드가 1280 컨테이너 안에서 7열로 남아 카드가 작게 찌부러진다. 밀도 불일치.
- **대안(C, 미채택)**: CardGrid에 커스텀 slidesPerView prop 신규 추가해 추천 섹션만 4.5 강제. → 불필요한 신규 추상화. 스와이퍼가 추천탭 전용이라 이득 없음.

#### 폭 캡 1280px에서 카드 폭 계산 근거
전역 컨테이너는 2xl(≥1536px 뷰포트)에서 max-width 1280px, 좌우 패딩 1rem → 콘텐츠 ~1248px.
- 예전 스와이퍼 `lg:4.5`, `spaceBetween=12`: 카드 ≈ (1248 − 4.5×12) / 4.5 ≈ **265px** (적정).
- 현행 `2xl:7.5`를 1280 컨테이너에 유지 시: ≈ (1248 − 7.5×12) / 7.5 ≈ **154px** (과소).
- 그리드도 동일: 예전 `lg:grid-cols-5` ≈ 240px vs 현행 `2xl:grid-cols-7` ≈ 168px.
→ 여백 복원과 밀도 롤백은 한 세트로 되돌리는 것이 원본 상태와 일치.

### 나머지 탭(랭킹/카테고리) 그리드 권고
요구사항은 "추천탭 4.5"만 명시하나, 랭킹/카테고리도 홈 안에서 1280 컨테이너로 함께 복귀한다. 위 계산대로 **예전 `getGridColumns`로 함께 복원(권고)** — 원본 밀도와 정합하며 caveduck 롤백 취지에 부합. (검색/작가/내캐릭터 페이지도 같은 default 그리드를 공유하므로 함께 예전 밀도로 복원됨 — 이들 페이지는 이미 1280 컨테이너를 쓰고 있어 롤백이 원본 복원에 해당, 회귀 아님.)

## 실행 계획 (단계별)

> 모든 변경이 className/레이아웃 설정 수정이라 **전 단계 `[담당: publisher]`**. 파일별로 담당이 겹치지 않음(각 파일 단일 담당). writer 불필요.

1. **홈 셸/검색/탭 여백 복원** `[담당: publisher]` — `views/main/home.tsx`
   - `:64` `<main>`: `2xl:-ml-20 2xl:w-[calc(100%+5rem)]` 제거 → `className='min-h-screen pb-24 md:pb-20 bg-surface'`. (관련 caveduck 주석 정리)
   - `:70` 검색바 래퍼: `mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]` → `container mx-auto px-4` (결과 `md:hidden container mx-auto px-4 pt-6 relative`).
   - `:75` 탭 래퍼: → `container mx-auto px-4 mt-8 flex justify-center`.

2. **추천 섹션 3종 여백 복원** `[담당: publisher]`
   - `components/main/recommend/LatestCharactersSection.tsx:18` → `container mx-auto px-4`
   - `components/main/recommend/EtcCharactersSection.tsx:18` → `container mx-auto px-4`
   - `components/main/recommend/CreateCharacterSection.tsx:28` → `container mx-auto px-4 text-center`

3. **카테고리/랭킹 탭 여백 복원** `[담당: publisher]`
   - `components/main/CharacterGridSection.tsx:97, 119, 141, 175` (4곳 모두) → `container mx-auto px-4`
   - `components/main/ranking/RankingGridSectionView.tsx:57` → `container mx-auto px-4`

4. **CardGrid 밀도 롤백(추천탭 4.5 복원)** `[담당: publisher]` — `components/elements/card/CardGrid.tsx`
   - `getSlidesPerView()`(167~170) case 4 & default → `{ default: 2.5, sm: 2.5, md: 3.5, lg: 4.5 }`
   - `getGridColumns()`(241~243) default → `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`, case 4 → `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
   - `breakpoints` 객체·`useMediaQuery`·주석은 유지(예전 map과 cascade 호환).

## 영향 범위 & 리스크
- **여백**: 6개 홈 트리 파일만 변경. 전수 grep으로 홈 외 사용처 없음 확인 → **다른 페이지 여백 영향 없음**. `<main>` 핵 제거로 2xl 이상에서 콘텐츠가 셸 콘텐츠 영역 기준 중앙 정렬(= 다른 페이지와 동일). 리스크 낮음.
- **getSlidesPerView 롤백**: 스와이퍼 사용처가 추천탭(Latest/Etc)뿐 → **추천탭에만 영향**. 요구사항 정확 충족.
- **getGridColumns 롤백**: 그리드 공유 소비자(카테고리/랭킹/검색/작가/내캐릭터)의 lg 이상 열수가 `grid-cols-5`로 감소. 이는 caveduck 이전 원본 밀도로의 복원이며, 해당 페이지들은 이미 1280 컨테이너를 사용 중이라 회귀가 아님. 다만 "홈 밖 페이지 밀도까지 바뀐다"는 점은 사용자 확인 포인트로 남김(아래).
- **롤백 방법**: 전부 className/상수 치환이라 git revert 용이. TossPayments/암호화/인증 등 보안 민감 코드 미접촉.

## 확인 필요 사항
- `getGridColumns` 롤백을 **홈 밖 페이지(검색/작가/내캐릭터)에도 적용**해도 되는지. 사용자가 "홈만" 원하면 대안 B(추천탭 swiper만 롤백, 그리드 현행 유지)로 축소 가능하나, 그 경우 홈 카테고리/랭킹 그리드가 1280 컨테이너에서 7열로 남아 카드가 작아짐. → 본 계획은 **전체 롤백(A)** 권고.

## 검증 방법
- `npx tsc --noEmit` 타입 체크 통과.
- 수동 반응형(360 / 768 / 1280px, 추가로 ≥1536px 광폭):
  - 홈의 검색바/탭/추천·카테고리·랭킹 섹션 좌우 여백이 shop-recharge·search 등 타 페이지와 **동일 정렬**인지.
  - 광폭에서 홈 콘텐츠가 1280px 컨테이너로 캡되고, 셸 사이드바 레일 기준 중앙 정렬되는지(2xl `-ml-20` 핵 제거 확인).
  - 추천탭 스와이퍼가 lg 이상에서 **4.5개(다음 카드 반쪽 peek)** 로 보이는지.
  - 카테고리/랭킹 그리드가 lg 5열로 복원되는지, 360/768px에서 가로 스크롤·잘림 없는지.
- 스와이퍼 이전/다음 네비 버튼 동작, 카드 최소 44px 터치 타깃 유지 확인.

## 범위 밖 (하지 않을 것)
- CardGrid의 `useMediaQuery` 리팩터·`breakpoints` 480/1280/1536 구간·`case 1~3` 값 변경.
- `tailwind.config.ts` container 토큰 수정(전역 방식 그대로 재사용).
- 홈 외 페이지의 레이아웃/여백 재설계, 데이터 페칭·상태·라우팅 로직 변경.
