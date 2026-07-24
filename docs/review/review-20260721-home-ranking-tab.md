# 리뷰: 홈 '랭킹' 탭 신설 + 추천 탭 정리

- 리뷰 일자: 2026-07-21
- 대상 브랜치/커밋: `red-main` (작업 트리 미커밋 변경, base commit `9630dc3`)
- 근거 계획: `docs/plan/plan-20260721-home-ranking-tab.md`
- 참고 산출물: `docs/write/write-20260721-home-ranking-tab.md`, `docs/publish/publish-20260721-home-ranking-tab.md`
- 리뷰한 파일
  - `components/elements/tabs/ButtonTabs.tsx` (수정)
  - `components/main/ranking/RankingGridSectionView.tsx` (신규)
  - `components/main/ranking/RankingGridSection.tsx` (신규)
  - `views/main/home.tsx` (수정)
  - `components/main/RecommendSection.tsx` (수정)
  - 삭제: `components/main/recommend/CharacterRankingSection.tsx`, `components/main/recommend/AuthorRankingSection.tsx`, `components/elements/card/AuthorGrid.tsx`, `components/elements/sidebar/AuthorRankingSidebar.tsx`, `components/elements/sidebar/CharacterRankingSidebar.tsx`
  - 참고 확인(무변경): `components/elements/card/CardGrid.tsx`, `components/elements/card/Card.tsx`, `store/useMainStoreData.ts`

## 리뷰 요약
계획 대비 이탈 없이 깔끔하게 구현됐습니다. `disableUrlSync` prop은 가산적(opt-in)으로 추가되어 기존 유일한 `ButtonTabs` 사용처(`home.tsx` 메인 chip 탭)에 회귀가 없고, 삭제 5종 파일의 잔여 참조도 0으로 확인됩니다(`grep` 전수 검증). View/컨테이너 분리, gender=4 고정, 순위 뱃지(`hasRanking`) 재사용 등 확정 결정 3건도 모두 준수했습니다. `npx tsc --noEmit`·신규 파일 `npx biome check` 모두 클린합니다. 다만 기간 서브탭을 빠르게 연타할 때 응답 순서가 뒤바뀌면 오래된 응답이 최신 데이터를 덮어쓸 수 있는 레이스 컨디션 1건(🟡)을 발견했습니다. 나머지는 선택적 제안(🔵) 수준입니다.

## 심각도별 지적

### 🟡 Warning (개선 권장)

- **[신규] `components/main/ranking/RankingGridSection.tsx:42-55`** 기간(period) 전환 시 응답 순서가 뒤바뀌는 레이스 컨디션 — `UpdateRankingTopCharacter`가 `queryClient.fetchQuery` 결과를 그대로 `store.rankingCharactersSlide`에 `set()`하기 때문에(store, 손대지 않음), 컨테이너의 `isCancelled` 가드는 `isLoading` 표시만 막을 뿐 store에 쓰이는 데이터 자체의 도착 순서는 보장하지 않습니다. 사용자가 실시간→월간→주간을 빠르게 연타하면, 가장 마지막에 도착한 응답(요청 순서와 다를 수 있음)이 화면에 남을 수 있습니다.
  - 근거: 기존 `CharacterRankingSidebar`(삭제됨)도 동일한 취약점을 갖고 있었으나, 자주 열리지 않는 사이드바였던 것과 달리 이번엔 **메인 네비게이션 탭**으로 노출 빈도가 크게 늘어 체감 가능성이 높아졌습니다. store 로직은 계획상 손대지 않기로 확정(#3)했으므로, 컨테이너 레벨에서 요청 순번(request id)으로 방어하는 것을 권장합니다.
  ```tsx
  // before (components/main/ranking/RankingGridSection.tsx:42-55)
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const topid = PERIOD_TO_TOPID[period];
    UpdateRankingTopCharacter('KR', topid, GENDER_ALL, true).finally(() => {
      if (!isCancelled) setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [period, isAdultModeEnabled, UpdateRankingTopCharacter]);

  // ...
  return (
    <RankingGridSectionView
      characters={rankingCharactersSlide} // store 공유 필드를 그대로 표시
      ...
    />
  );

  // after — 요청 순번 가드 + resolve된 값을 직접 사용(늦게 도착한 응답은 화면 반영 안 함)
  const requestIdRef = useRef(0);
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    const topid = PERIOD_TO_TOPID[period];
    UpdateRankingTopCharacter('KR', topid, GENDER_ALL, true).then((data) => {
      if (requestId !== requestIdRef.current) return; // 늦게 도착한 응답 무시
      setCharacters(data);
      setIsLoading(false);
    });
  }, [period, isAdultModeEnabled, UpdateRankingTopCharacter]);

  return (
    <RankingGridSectionView characters={characters} ... />
  );
  ```
  - store를 수정하지 않고도 컨테이너 레벨에서 해결 가능하며, "서버 상태를 별도 store에 중복 저장하지 않는다"는 원칙도 위반하지 않습니다(로컬 UI state일 뿐, store에는 여전히 동일하게 write됨).
  - ✅ **조치 완료(2026-07-21, main)**: 위 제안대로 `RankingGridSection.tsx`에 요청 순번 가드(`requestIdRef`) + resolve 값 직접 사용으로 반영. `rankingCharactersSlide` 구독 제거(→ 아래 Suggestion 1의 전체 구독 리렌더 우려도 함께 해소). `tsc`·`biome` 클린, `/?tab=ranking&period=weekly` 200 확인.

### 🔵 Suggestion (선택적 제안)

- **[신규] `components/main/ranking/RankingGridSection.tsx:34`** `useRecommendSectionStoreData()`를 selector 없이 전체 구독 — `rankingCreaters`/`latestCharacters`/`etcCharactersSlide` 등 랭킹 탭과 무관한 필드가 store에서 갱신될 때도 이 컴포넌트가 리렌더됩니다. 다만 이는 `CharacterGridSection.tsx:34-35`의 `useCharacterGridStoreData()` 등 프로젝트 전반에 이미 퍼져 있는 기존 관행이라 **회귀는 아니며 이번 PR만의 문제는 아닙니다**. 여유가 있을 때 selector 적용을 고려해볼 수 있습니다.
  ```tsx
  // before
  const { rankingCharactersSlide, UpdateRankingTopCharacter } = useRecommendSectionStoreData();

  // after (필요한 필드만 구독)
  const rankingCharactersSlide = useRecommendSectionStoreData((s) => s.rankingCharactersSlide);
  const UpdateRankingTopCharacter = useRecommendSectionStoreData((s) => s.UpdateRankingTopCharacter);
  ```

- **[신규] `components/main/ranking/RankingGridSection.tsx:57-69`** `handlePeriodChange`가 동일 기간을 재클릭해도 `router.replace`를 매번 호출합니다(무해하지만 불필요). `parsePeriod(nextPeriod) === period`일 때 조기 반환하면 미세하게 더 효율적입니다. 우선순위는 낮습니다.

- **[아키텍처, 확인 필요]** `components/main/ranking/`은 레거시 `components/` 하위에 신설됐습니다. CLAUDE.md는 "신규 코드는 `src/` FSD 구조 우선"을 권고하지만, 같은 화면을 구성하는 형제 컴포넌트(`CharacterGridSection`, `RecommendSection`)가 모두 `components/main/`에 있어 **인접 코드 스타일을 따른 것으로 판단**되며 문제 삼지 않습니다. 다만 이 영역을 향후 `src/features/`로 이관할 계획이 있다면 미리 공유해주시면 좋겠습니다.

- **[a11y, 확인 필요]** `ButtonTabs.tsx`의 underline variant 버튼은 `type` 속성이 없고(`useButtonType` lint 경고), 히트 영역이 `py-2 px-1` 기준 약 36~40px로 CLAUDE.md의 "터치 대상 최소 44×44px" 기준에 못 미칠 가능성이 있습니다(publisher 문서에서도 동일하게 지적). **이번 diff에서 새로 만든 문제는 아니며**(`git show HEAD`로 확인한 원본 `ButtonTabs.tsx`에도 동일한 lint 경고 2건이 이미 존재), 랭킹 서브탭에서 재사용하며 노출 빈도가 늘었으니 별도 티켓으로 개선을 고려해볼 만합니다.

## 잘한 점
- **회귀 방지가 꼼꼼합니다.** `disableUrlSync` 기본값을 `false`로 둬 기존 유일 사용처(`home.tsx` 메인 chip 탭)의 동작을 그대로 보존했고, 실제로 `git show HEAD`로 확인한 결과 삭제 대상 5개 파일에서만 쓰이던 나머지 4개의 `ButtonTabs` 사용처가 같은 커밋에서 함께 제거되어 회귀 표면 자체가 사라졌습니다.
- **삭제 검증이 철저합니다.** 5개 파일 삭제 후 `grep` 전수 확인 결과 import/배럴/동적 import/id 앵커 어디에도 잔여 참조가 없습니다.
- **View/컨테이너 관심사 분리가 명확합니다.** `RankingGridSectionView.tsx`는 fetch/URL 로직이 전혀 없는 순수 표시용 컴포넌트이고, `RankingGridSection.tsx`가 페칭·URL 동기화를 전담합니다. `?period=` 값도 `parsePeriod()`로 화이트리스트 검증해 방어적으로 처리했습니다.
- **확정 결정 3건을 모두 정확히 준수했습니다** — gender=4 고정(성별 셀렉트 없음), `hasRanking`으로 기존 뱃지 로직 재사용, `store/useMainStoreData.ts` 무변경.
- **코드 스타일이 오히려 `biome.json` 설정(세미콜론 필수, single quote)에 더 충실합니다.** 신규 파일 2종은 `npx biome check` 단독 실행 시 클린한 반면, 손댄 레거시 파일(`ButtonTabs.tsx`, `home.tsx`, `RecommendSection.tsx`)의 남은 lint 경고는 모두 `git show HEAD` 원본에도 이미 존재하던 사전(pre-existing) 이슈임을 개별 확인했습니다.
- `npx tsc --noEmit` 전체 통과.
