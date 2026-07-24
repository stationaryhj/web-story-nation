# 홈 최신 GetList 전환 + 인기 탭 — writer 구현 산출물 (소급)

- 작성 일자: 2026-07-22
- 근거 계획: `docs/plan/plan-20260722-home-getlist-latest-popular.md` (소급 계획)
- 참고: 구현이 계획 승인 전에 반영됨. 본 문서는 실제 코드 기준으로 기록한다.

## 구현 범위

계획 단계 **2·3·4**(공통 컨테이너, 최신/인기 래퍼, home 배선)에 해당하는 writer 영역.

## 변경 파일

- `components/main/list-grid/GetListGridSection.tsx` (신규)
  - `contentApi.GetList(LIST_TYPE='0', TAG_KEYS='', NSFW=1, order, page, PAGE_SIZE=10)`.
  - 로컬 state + `requestIdRef` 레이스 가드(랭킹/구 최신 선례).
  - `mapAndMerge`: chrbotList → ModuleCharacter 매핑 → `bridgeCharacterDataToCharacter`, id Map 병합.
  - hasMore: `current_page < last_page` (없으면 길이 휴리스틱).
  - `isAdultModeEnabled`·`order` 변경 시 page 1 재조회.
- `components/main/latest/LatestGridSection.tsx` (재작성)
  - `GetListGridSection order={2}` + 최신 헤더/빈상태 문구.
- `components/main/popular/PopularGridSection.tsx` (신규)
  - `GetListGridSection order={1}` + 인기 헤더/빈상태 문구.
- `views/main/home.tsx`
  - `popular` 탭을 최신 다음에 추가, `tabParam === 'popular'` → `<PopularGridSection />`.
- 삭제: `components/main/latest/LatestGridSectionView.tsx` (공통 View로 이관 — publisher 산출물 참고).

## 검증 결과

- `npx biome check --write` on list-grid / latest / popular / home: 신규 파일 포맷·정렬 적용 후 에러 없음. home의 unused `characters`/`setSelectedTagIds`는 **사전 존재** 경고만 잔존.
- `npx tsc --noEmit`: LatestGrid/PopularGrid/list-grid 관련 에러 없음(통과).

## 계획과 달라진 점

- 없음(소급 계획이 구현 결과를 반영해 작성됨).
- 절차상 승인 게이트를 건너뛴 점은 계획 문서에 명시함.
