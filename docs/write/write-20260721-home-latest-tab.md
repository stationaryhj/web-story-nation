# 홈 '최신' 탭 신설 — writer 구현 산출물 (2·3단계)

- 작성 일자: 2026-07-21
- 근거 계획: `docs/plan/plan-20260721-home-latest-tab.md`
- 선행 산출물: `components/main/latest/LatestGridSectionView.tsx` (publisher, 이번 세션에서 수정하지 않음 — props 계약만 확인)

## 구현 범위

계획의 담당 배정에 따라 **2단계(컨테이너 신설)·3단계(home.tsx 배선)만** 구현했다. 1단계(표시용 View, publisher), 4단계(RecommendSection 마크업 제거, publisher), 5단계(dead code 삭제, main)는 이번 범위 밖이며 미구현 상태다.

## 변경 파일

- `components/main/latest/LatestGridSection.tsx` (신규) — 컨테이너. `RankingGridSection.tsx`의 요청 순번 가드(`requestIdRef`) 패턴을 재사용했다.
  - `MODULE_ID=8`, `RANKING_TYPE=8`, `PAGE_SIZE=50` 상수와 매직값 유래 주석(추천 탭 '더 보기' 실호출 `GetListRcmnd(8, 8, page, 50, 0)`과 동일함을 명시).
  - `useRecommendSectionStoreData().UpdateharactersPaging(beforeDatas, module_id, ranking_type, page, pageSize)` (`store/useMainStoreData.ts:390-452`)를 직접 호출해 반환된 병합 배열만 로컬 state(`characters`)에 저장 — `modules_sumSlide` 등 공유 store 필드는 건드리지 않음(서버 상태 중복 저장 없음).
  - mount 시 및 `useSettingsStore().isAdultModeEnabled` 변경 시 `page=1`부터 재조회, `hasMore = 반환길이 >= PAGE_SIZE`.
  - `handleLoadMore`: `page+1`로 `UpdateharactersPaging(characters, ...)` 호출, 반환 길이가 이전(`characters.length`)과 같거나 작으면 `hasMore=false`로 종료 판정(무한 로딩 방지, 계획 명시 요구사항).
  - `LatestGridSectionView`에 `characters`, `isLoading`, `hasMore`, `onLoadMore`를 props로 연결.
- `views/main/home.tsx:9` — `import LatestGridSection from '@/components/main/latest/LatestGridSection';` 추가.
- `views/main/home.tsx:20` — `navigationTabs`에 `{ id: 'latest', label: '최신', shouldUpdateUrl: true }`를 '랭킹' 다음(3번째)에 삽입.
- `views/main/home.tsx:89-91` — 탭 분기에 `tabParam === 'latest' ? <LatestGridSection /> : (...)` 추가(랭킹 분기 바로 뒤). 기존 `all`/`ranking`/그 외 분기 로직·URL 스킴은 변경하지 않음.

## 검증 결과

- `npx tsc --noEmit`: 통과(에러 없음).
- `npx biome check components/main/latest/LatestGridSection.tsx`: 통과(에러/경고 없음, 신규 파일 클린).
- `npx biome check views/main/home.tsx`: 사전 존재하던 이슈(2 errors, 2 warnings) 그대로 재현됨 — `git stash`로 대조해 확인:
  - `characters`(useStoreData 구조분해) 미사용, `setSelectedTagIds` 미사용 — 커밋된 HEAD(`6eb151d`)에도 이미 존재하던 미사용 변수(이번 작업으로 도입되지 않음, 손대지 않음).
  - import 정렬 경고(`RankingGridSection` vs `RecommendSection` 순서) — 랭킹 탭 작업(직전 세션)에서 이미 도입된 대소문자 정렬 이슈. 신규 `LatestGridSection` import는 동일한 기존 패턴(`CharacterGridSection`, `RankingGridSection`과 같은 디렉토리 소문자 하위경로) 스타일로 추가했으며, 계획 범위상 기존 import 순서를 임의 재정렬하지 않음.
  - format(CRLF) 경고 — 저장소 전반 기존 이슈(작업 지시상 무시 대상).
  - → **신규로 도입한 lint 이슈 없음**, 모두 사전 존재.
- 수동 시나리오(코드 정적 검토 기준, 브라우저 실행 검증은 미수행):
  - 탭 순서: 추천/랭킹/최신/남자/여자/성별모름 — 코드상 확인됨.
  - `?tab=latest` 클릭 시 `<LatestGridSection />` 렌더 분기 확인됨.
  - '더 보기' 클릭 시 다음 페이지 병합·중복 없음(store의 `id` 기준 Map 병합 재사용)·hasMore 종료 판정 로직 확인됨.
  - 짜릿모드 토글 시 `isAdultModeEnabled` effect 의존성에 포함되어 page 1 재조회 확인됨.

## 계획과 달라진 점 / 미완·후속 필요

- 없음(계획 2·3단계와 동일하게 구현). 1·4·5단계(publisher 표시용은 이미 완료 확인, RecommendSection 정리·dead code 삭제)는 각각 담당 에이전트/후속 작업으로 남아 있음.
- 브라우저 수동 QA(360/768/1280px 반응형, 실제 API 응답 기준 hasMore 동작)는 미수행 — 필요 시 별도 확인 요청.
