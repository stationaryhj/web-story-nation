# 홈 최신/인기 공통 그리드 View — publisher 산출물 (소급)

- 작성 일자: 2026-07-22
- 근거 계획: `docs/plan/plan-20260722-home-getlist-latest-popular.md`
- 담당 범위: 계획 **1단계** 표시용 View (공통화). writer 래퍼·home 배선은 `docs/write/` 참고.

## 변경 파일

- `components/main/list-grid/ListGridSectionView.tsx` (신규)
  - 구 `LatestGridSectionView` 마크업을 복제·일반화.
  - props: `characters`, `isLoading`, `hasMore?`, `onLoadMore?`, `title`, `description`, `emptyTitle`.
  - 레이아웃: `SectionTransition` + `container mx-auto px-4`, `CardGrid useSwiper={false}` (순위 뱃지 없음), 더 보기 `min-h-[44px]` primary pill.
  - 빈 상태: `emptyTitle` + '잠시 후 다시 확인해주세요.'
- 삭제: `components/main/latest/LatestGridSectionView.tsx` — 공통 View로 대체. 잔여 import 0 확인.

## 반응형 / a11y

- 남·여·랭킹·구 최신과 동일 그리드 계약 유지(360/768/1280 기준 레이아웃 상속).
- 더 보기 터치 타깃 44px, `type='button'`, 로딩 중 disabled.

## 검증

- `npx biome check components/main/list-grid/ListGridSectionView.tsx` — 통과.
- 헤더 카피(최신/인기)는 래퍼에서 주입 — Figma 미확정 시 문구만 교체 가능.
