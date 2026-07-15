# write-20260715-card-height-align

카드 리스트(홈 스와이퍼·그리드)에서 카드마다 높이가 제각각인 문제 수정. 태그가 1줄/2줄로 접히는 차이 때문에 하단 콘텐츠 영역 높이가 달라지는 것이 원인이었고, 같은 줄의 카드가 모두 가장 높은 카드 높이에 맞춰 늘어나도록 정렬했다.

## 원인

1. **콘텐츠 높이 가변**: 카드 하단의 해시태그 영역이 `flex-wrap`이라 태그 개수·길이에 따라 1~2줄로 달라짐 → 카드 전체 높이가 카드마다 다름.
2. **Swiper 슬라이드가 늘어나지 않음**: Swiper 기본 CSS는 `.swiper-slide { height: 100% }`인데 부모 `.swiper-wrapper` 높이가 auto라 100%가 무시되고 슬라이드가 자기 콘텐츠 높이로 계산됨. 그래서 카드 내부에 `h-full`을 걸어도 기준 높이 자체가 없었음.

## 수정 내용

### 1. `app/globals.css` — 슬라이드 높이 통일

```css
/* 슬라이드 높이 통일: 기본값 height:100%는 래퍼가 auto라 콘텐츠 높이로 계산됨.
   auto로 바꿔 flex stretch로 가장 높은 슬라이드에 맞춘다 */
.card-grid-swiper .swiper-slide {
  height: auto;
}
```

- `.swiper-wrapper`는 flex 컨테이너이므로 슬라이드를 `height: auto`로 두면 기본 stretch 정렬로 가장 높은 슬라이드 높이에 맞춰 늘어난다.
- `.card-grid-swiper`에만 스코프 — 다른 스와이퍼(author-grid-swiper 등)에는 영향 없음.

### 2. `components/elements/card/Card.tsx` — 세 variant 모두 h-full 체인 + 바닥 고정

공통 패턴:

| 위치 | before | after |
|---|---|---|
| `CardTransition` | className 없음 | `className='h-full'` |
| 카드 루트 div | 높이 없음 | `h-full` 추가 |
| 내부 래퍼 | `block` | `flex h-full flex-col` |
| 이미지 영역 | — | `shrink-0` 추가 (비율/크기 눌림 방지) |
| 콘텐츠 영역 | `p-2.5` 등 | `flex flex-1 flex-col` 추가 |
| 바닥 요소 | `mt-1.5` 등 | `mt-auto`(+`pt-1.5`)로 카드 바닥 고정 |

variant별 바닥 고정 대상:

- **default(세로형)**: 작가(creator) 행 → `mt-auto`
- **my-character**: 수정/삭제 버튼 그리드 → `mt-auto pt-1.5`
- **horizontal**: 작가 행 → `mt-auto pt-1.5`, 콘텐츠 영역 `pt-2` → `py-2`(하단 패딩 추가), 이미지 `w-32 h-32`에 `shrink-0`

### 3. content-visibility 기억 크기 대응 (후속 버그 수정, 2차에 걸쳐 해결)

카드 등고 적용 후, 반응형(뷰포트 리사이즈) 환경에서 카드가 비정상적으로 길어지는 문제 발생. 원인은 content-visibility의 '마지막 렌더 크기(last remembered size)'와 등고 스트레치의 상호작용:

1. 넓은 폭에서 렌더된 카드 높이가 화면 밖(스킵된) 슬라이드에 기억됨
2. 리사이즈 후에도 스킵된 슬라이드가 그 낡은 큰 높이를 계속 보고
3. `.swiper-slide` flex stretch가 줄 전체를 그 높이로 늘림 → 보이는 카드(`h-full`)도 늘어남

**1차 시도(실패)**: `contain-intrinsic-size: auto 320px`에서 `auto` 키워드를 제거(`320px`). 그러나 **Chrome은 `content-visibility: auto` 요소에 대해 마지막 렌더 크기를 항상 사용하며, `auto` 키워드 제거로는 비활성화되지 않는다** — 스타일시트에 `320px`만 존재해도 계산값이 `auto 320px`로 강제되는 것을 Playwright로 실측 확인(10px 단위 1280→357 드래그 재현에서 스킵된 슬라이드가 중간 폭의 높이 354/396px를 계속 보고).

**2차 수정(실제 해결)**: 리사이즈 중에만 스킵을 해제해 기억 크기를 현재 폭 기준으로 갱신.

- `app/globals.css`: `html.viewport-resizing .cv-card, .cv-card-h { content-visibility: visible; }`
- `app/providers.tsx`: `resize` 이벤트에서 `<html>`에 `viewport-resizing` 클래스 부여, 마지막 리사이즈 후 300ms 디바운스로 제거.

리사이즈 동안 전 카드가 렌더되어 기억 크기가 갱신되고, 종료 후 다시 스킵 최적화로 복귀. 평상시(스크롤) 성능 최적화는 그대로 유지된다.

검증: 1280→357px 10px 단위 드래그 후와 새로고침 후 슬라이드 높이가 완전 동일(모두 320px)함을 Playwright로 확인.

### 4. `components/elements/card/CardGrid.tsx` — 그리드 컬럼 중간 브레이크포인트 추가

비 Swiper 그리드(내 캐릭터 페이지 등)에서 640px(`sm`) 미만이 되는 순간 3열 → 2열로 떨어져, 480~640px 구간에서 카드가 과도하게 커지는 문제 수정. `getGridColumns()`에 480px 단계를 추가해 3열 유지:

```tsx
// before
case 4:  'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
default: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
// after
case 4:  'grid-cols-2 xs:grid-cols-3 md:grid-cols-3 lg:grid-cols-4'
default: 'grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
```

- 360px 폰: 2열(~165px) 유지, 480~767px: 3열, 768px 이상: 기존과 동일.
- default 케이스를 쓰는 다른 그리드 페이지(검색 등)에도 동일 적용됨.

**주의 — `min-[480px]:` 임의 변형은 이 프로젝트에서 동작하지 않는다.** `tailwind.config.ts`의 `screens`에 객체형 항목(`max-sm: { max: '639px' }` 등)이 섞여 있으면 Tailwind v3가 `min-*`/`max-*` 임의 변형 생성을 비활성화하기 때문(단순 문자열 screens에서만 지원). 최초 시도에서 `min-[480px]:grid-cols-3`이 무시되어 오히려 2열 구간이 넓어지는 회귀가 있었고, `tailwind.config.ts`의 `screens`에 named 스크린 `xs: '480px'`을 추가하고 `xs:` 변형을 쓰는 방식으로 해결했다. Tailwind CLI 컴파일로 `@media (min-width: 480px) { .xs\:grid-cols-3 { ... } }` 생성 확인.

### 5. `components/elements/card/CardGrid.tsx` — 홈 스와이퍼 카드 수 단계화 (.5 peek + 480 단계)

홈 스와이퍼의 `getSlidesPerView()`(case 4·default)를 재조정 — 최대 해상도 7장(+반쪽)에서 브레이크포인트마다 1장씩 차감, 최저 2장(+반쪽). `.5`는 다음 카드 반쪽 미리보기(peek)로 스와이프 가능함을 암시:

```tsx
// before
{ default: 2.5, sm: 2.5, md: 3.5, lg: 5.5, xl: 6.5, '2xl': 7.5 }
// after — <480→2.5, 480→3.5, sm→3.5, md→4.5, lg→5.5, xl→6.5, 2xl→7.5
{ default: 2.5, xs: 3.5, sm: 3.5, md: 4.5, lg: 5.5, xl: 6.5, '2xl': 7.5 }
```

- `SlidesPerViewMap`에 `xs`(480px, tailwind `xs` 스크린과 동일 경계) 추가, Swiper `breakpoints`에 480 엔트리 추가(폴백 체인에 xs 반영).
- Playwright 실측(걸치는 슬라이드 수 = 올림값): 360/479→3, 480/640→4, 768→5, 1024→6, 1280→7, 1600→8 전부 일치, 각 폭에서 카드 높이 동일.

### 6. `components/elements/card/Card.tsx` — 태그 한 줄 고정 + 말줄임

카드 높이 편차의 근본 원인이던 태그 줄바꿈(1~2줄 가변)을 원천 차단. 세 variant 모두 태그 컨테이너를 `flex flex-wrap gap-1` → `overflow-hidden text-ellipsis whitespace-nowrap`(한 줄 + 말줄임)로 변경, 태그 span은 `inline-block mr-1`:

```tsx
// before
<div className='mb-1 flex flex-wrap gap-1'>
  <span className='text-[11px] ...' >{tag}</span>
// after — 한 줄 고정, 넘치면 …
<div className='mb-1 overflow-hidden text-ellipsis whitespace-nowrap'>
  <span className='mr-1 inline-block text-[11px] ...'>{tag}</span>
```

- 인라인 흐름이라 `text-overflow: ellipsis`가 잘리는 태그 자리에 `…`를 렌더한다.
- default variant 작가 행에 `pt-1` 추가(한 줄 태그 기준 하단 여백 보정).
- Playwright 실측(491px): 카드 6장 전부 높이 320px 균일, 태그 박스 24px(정확히 1줄), `…` 정상 표기.

### 7. `app/globals.css` — contain-intrinsic-size 추정치 하향 (하단 여백/스와이프 출렁임 수정)

태그 1줄화(6번)로 실제 카드 높이가 줄자(모바일 ~276px), 추정치 320px이 실제보다 커짐 → 아직 렌더되지 않은 화면 밖 슬라이드가 320px을 보고해 줄 전체가 부풀고(작가 행 위 과도한 여백), 스와이프로 그 슬라이드들이 렌더되는 순간 줄이 276px로 줄어드는 출렁임 발생.

**규칙: 추정치는 반드시 실제 최소 카드 높이보다 작아야 한다** (크면 스킵 슬라이드가 등고 스트레치를 통해 줄을 부풀림).

```css
.cv-card { contain-intrinsic-size: 250px; }               /* 모바일 실측 최소 ~276px */
@media (min-width: 1024px) {
  .cv-card { contain-intrinsic-size: 300px; }              /* lg+ 실측 최소 ~321px */
}
```

검증(Playwright, 홈 스와이퍼 fresh load → 끝까지 스와이프 → 복귀): 360px(278), 491px(276), 1024px(321), 1280px(339) 전 폭에서 첫 페인트부터 자연 높이로 시작하고 스와이프 전후 높이 변화 없음.

## 동작 원리

```
.swiper-slide (height:auto → flex stretch로 가장 높은 슬라이드에 맞춤)
└─ CardTransition (h-full)
   └─ 카드 루트 (h-full)
      └─ flex h-full flex-col
         ├─ 이미지 (aspect-[3/4] 또는 w-32 h-32, shrink-0)
         └─ 콘텐츠 (flex-1 flex-col)
            └─ 바닥 요소 (mt-auto) ← 태그 1줄/2줄 차이를 여기서 흡수
```

- 비 Swiper 경로(`useSwiper={false}`의 grid 분기)도 grid 아이템 기본 stretch + 동일한 `h-full` 체인으로 같은 줄 높이가 맞춰진다.

## 검증

- `npx tsc --noEmit` 통과.
- **Playwright 실측(2026-07-15, `C:\temp\pw-qa\card-responsive.js`)**: 360/480/605/691/768/1280px 각 폭 fresh load에서
  - 홈 스와이퍼(#latest-characters-section) 보이는 카드 높이 전부 동일(예: 605px → 3장 모두 426px).
  - `/search?query=여` 그리드 컬럼 수 = 기대값(360→2, 480~691→3, 768→4, 1280→6), 첫 줄 높이 동일.
  - 1280 → 491px 리사이즈 스윕 후에도 카드 h=368(w=176, 정상 비율) — content-visibility 비대화 회귀 없음.
- 홈 "지금 막 올라온 캐릭터" 스와이퍼에서 태그 1줄/2줄 카드 높이 일치 및 작가 영역 바닥 정렬 확인.
- IDE Biome 진단(`==` 사용, 배열 index key, button `type` 누락 등)은 기존 이슈로 이번 변경과 무관하여 미수정.

## 관련 파일

- `components/elements/card/Card.tsx` — default·my-character·horizontal 3개 variant
- `app/globals.css` — `.card-grid-swiper .swiper-slide` 규칙 추가
- (참고) `components/motion/PageTransition.tsx`의 `CardTransition`은 기존 `className` prop 활용, 변경 없음
