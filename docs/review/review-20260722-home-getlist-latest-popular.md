# 리뷰: 홈 최신 탭 GetList 전환 + '인기' 탭 신설

- 리뷰 일자: 2026-07-22
- 대상 브랜치/커밋: `red-main` (작업 트리 미커밋 변경, base commit `6eb151d`)
- 근거 계획: `docs/plan/plan-20260722-home-getlist-latest-popular.md` (소급)
- 참고 산출물: `docs/write/write-20260722-home-getlist-latest-popular.md`, `docs/publish/publish-20260722-home-getlist-latest-popular.md`
- 리뷰한 파일
  - `components/main/list-grid/GetListGridSection.tsx` (신규)
  - `components/main/list-grid/ListGridSectionView.tsx` (신규)
  - `components/main/latest/LatestGridSection.tsx` (재작성)
  - `components/main/popular/PopularGridSection.tsx` (신규)
  - `views/main/home.tsx` (탭/분기 — 인기 배선 중심)
  - 삭제: `components/main/latest/LatestGridSectionView.tsx`
- 참고 확인(무변경): `services/api/storyNationApi.ts` (`GetList` 시그니처), `store/useCharacterGridStoreData.ts` (paginate·hasMore 선례)

## 리뷰 요약
소급 계획의 확정 파라미터(type=`'0'`, nsfw=`1`, paginate=`10`, 최신 order=`2` / 인기 order=`1`)와 View/컨테이너 분리·`requestIdRef` 레이스 가드·`?tab=popular` 배선이 코드와 일치합니다. 공통 `GetListGridSection`/`ListGridSectionView`로 최신·인기 중복이 잘 제거됐고, `LatestGridSectionView` 삭제 후 잔여 import는 문서 외 0건입니다. `npx biome check`(대상 4파일)·관련 `tsc` 경로도 클린합니다. Critical는 없고, 성인모드 전환 실패 시 이전 목록이 남는 UX 1건(🟡)과 선택 제안(🔵) 수준입니다. **워크플로 위반(승인 게이트 전 구현)은 소급 계획/write/publish에 명시되어 있음을 확인했습니다.** `home.tsx`의 unused `characters`/`setSelectedTagIds`는 사전 이슈로 본 작업 탓이 아닙니다.

## 심각도별 지적

### 🟡 Warning (개선 권장)

- **[`GetListGridSection.tsx:93-112`](components/main/list-grid/GetListGridSection.tsx)** 성인모드(`isAdultModeEnabled`)·`order` 변경 재조회가 실패하면, 이전 목록이 화면에 그대로 남습니다. `catch`에서 `setIsLoading(false)`만 하고 `characters`/`hasMore`를 비우지 않아, 새 조건의 결과처럼 보일 수 있습니다.
  - 근거: 초기 마운트 실패 시에는 `characters`가 `[]`라 빈 상태가 맞지만, 성인모드 토글 후 네트워크 오류가 나면 직전 성공 데이터가 유지됩니다. 랭킹 탭 리뷰에서 지적했던 “최신 요청만 반영” 방향과 같이, 실패 시에도 현재 요청 기준으로 UI를 정리하는 편이 안전합니다.
  ```tsx
  // before
  .catch(() => {
    if (requestId !== requestIdRef.current) return;
    setIsLoading(false);
  });

  // after — 초기(1페이지) 재조회 실패 시에만 목록 초기화(로드모어 실패는 기존 목록 유지)
  .catch(() => {
    if (requestId !== requestIdRef.current) return;
    setCharacters([]);
    setHasMore(false);
    setIsLoading(false);
  });
  ```
  - 로드모어(`handleLoadMore`)의 catch는 기존처럼 목록을 유지하는 것이 맞습니다. 위 조치는 **useEffect 초기/재조회**에만 적용하면 됩니다.

### 🔵 Suggestion (선택적 제안)

- **[`GetListGridSection.tsx:115-137`](components/main/list-grid/GetListGridSection.tsx)** `handleLoadMore`에 `isLoading` 조기 가드가 없습니다. View 버튼이 `disabled={isLoading}`이지만, 리렌더 전에 연타하면 동일 `nextPage` 요청이 두 번 나갈 수 있습니다(`requestIdRef` 덕분에 데이터 오염은 없고 마지막 응답만 반영). 우선순위는 낮습니다.
  ```tsx
  // before
  const handleLoadMore = useCallback(() => {
    const requestId = ++requestIdRef.current;
    // ...

  // after
  const handleLoadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    const requestId = ++requestIdRef.current;
    // ...
  }, [characters, page, order, isLoading, hasMore]);
  ```

- **[`GetListGridSection.tsx:85`](components/main/list-grid/GetListGridSection.tsx)** `useSettingsStore()`를 selector 없이 구독 — 설정 스토어의 다른 필드 변경에도 리렌더됩니다. 프로젝트 전반 관행과 같고 회귀는 아니며, 여유 시 `useSettingsStore((s) => s.isAdultModeEnabled)`를 고려할 수 있습니다.

- **[`GetListGridSection.tsx:93-104`](components/main/list-grid/GetListGridSection.tsx)** `order`/성인모드 변경 시 응답 전까지 이전 캐릭터 목록이 그대로 보입니다(`setIsLoading(true)`만). 체감이 거슬리면 effect 진입 직후 `setCharacters([])`로 스켈레톤만 보여주는 UX도 가능합니다(선택).

- **[아키텍처, 확인 필요]** `components/main/list-grid/`는 레거시 `components/` 하위입니다. CLAUDE.md의 FSD 우선 권고와 다르지만, 홈 형제(`latest`/`popular`/`ranking`/`CharacterGridSection`)와 동일 레이어를 따른 판단으로 보이며 문제 삼지 않습니다.

## 확인 포인트 체크

| # | 항목 | 결과 |
|---|------|------|
| 1 | GetList: type=`0`, nsfw=`1`, paginate=`10`, 최신 order=`2` / 인기 order=`1` | ✅ `LIST_TYPE`/`NSFW`/`PAGE_SIZE` 상수 + 래퍼 `order={2}`/`order={1}` |
| 2 | View/컨테이너 분리, 중복 제거 | ✅ `GetListGridSection` + `ListGridSectionView`, 래퍼는 문구·order만 |
| 3 | `requestIdRef` 레이스 가드, hasMore(`current_page < last_page`) | ✅ 초기·로드모어 모두 가드, 메타 없으면 길이 휴리스틱 |
| 4 | `?tab=popular` 배선, 탭 순서(최신 다음 인기) | ✅ `navigationTabs`·분기 모두 최신 직후 인기 |
| 5 | `home.tsx` unused 변수 | ✅ 사전 이슈 — 본 작업 범위 외 |
| 6 | 승인 전 구현 워크플로 위반 | ✅ 소급 문서화 확인(요약에 명시) |

## 잘한 점
- **공통 모듈 추출이 깔끔합니다.** 최신/인기가 `order`와 카피만 다른 얇은 래퍼로 남아 이후 문구·파라미터 조정이 쉽습니다.
- **랭킹 리뷰에서 권장했던 `requestIdRef` 패턴을 처음부터 적용**해, 성인모드 토글·탭 전환·더 보기 연타 시 늦은 응답이 덮어쓰는 문제를 예방했습니다.
- **남/여 탭 선례와 hasMore·paginate·매핑이 일치**합니다(`bridgeCharacterDataToCharacter`, id Map 병합, `current_page < last_page`).
- **삭제 검증이 확실합니다.** `LatestGridSectionView` 파일 없음, 코드 import 잔여 0(문서 언급만).
- **표시용 View는 fetch/URL 로직이 없고**, 더 보기 `type='button'`·`min-h-[44px]`·로딩 disabled 등 publisher 계약이 잘 지켜졌습니다.
- 대상 파일 `npx biome check` 통과, 관련 경로 `tsc` 이슈 없음.
