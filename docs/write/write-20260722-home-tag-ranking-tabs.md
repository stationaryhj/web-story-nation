# 홈 태그 랭킹 탭 동적 추가 — 구현 결과 (writer 1~5단계)

- 작성 일자: 2026-07-22
- 근거 계획: [`docs/plan/plan-20260722-home-tag-ranking-tabs.md`](../plan/plan-20260722-home-tag-ranking-tabs.md)
- 근거 Q&A: [`docs/q&a/qa-20260722-home-tag-ranking-tabs.md`](../q&a/qa-20260722-home-tag-ranking-tabs.md)
- 담당: code-writer — 계획의 **1~5단계(writer)** 만 구현. 6~7단계(publisher: 태그 헤더 시각 처리, 가로 스크롤/센터링 검증)는 **범위 밖, 미착수**.

## 구현 범위

| 단계 | 내용 | 상태 |
| --- | --- | --- |
| 1 | `GetTagRankingList`에 선택적 `count` 파라미터 추가 | 완료 |
| 2 | 태그 랭킹 탭 페칭 훅 `ReqTagRankingTabs` 신설 | 완료 |
| 3 | `GetListGridSection`에 `tagKeys?` prop 일반화 | 완료 |
| 4 | 태그 탭 래퍼 `TagGridSection` 신설 | 완료 |
| 5 | `home.tsx` 탭 병합·`tag-<key>` 분기 배선 | 완료 |
| 6 (publisher) | 태그 헤더 시각 처리 | 미착수 (범위 밖) |
| 7 (publisher) | 가로 스크롤/센터링 검증·조정 | 미착수 (범위 밖) |

## 변경 파일

- `services/api/storyNationApi.ts:439-451` — `GetTagRankingList(type: number, count?: number)`로 확장. `count`가 주어질 때만 body에 포함해 기존 호출부(`ReqGetTags`, `useCharacterGridStoreData.loadTagsForCategory`) 하위호환 유지.
- `services/hooks/DataListManager.ts:147-169` — `ReqGetTags` 뒤에 `ReqTagRankingTabs()` 신설. `queryKey: ['tagRankingTabs']`, `contentApi.GetTagRankingList(0, 10)` (type:0, count:10 확정값) 호출, `TagRankingListResponse` 그대로 반환.
- `components/main/list-grid/GetListGridSection.tsx:11-16, 70-90, 96-140` — 상수 `TAG_KEYS` 제거, `GetListGridSectionProps`에 `tagKeys?: string`(기본 `''`) 추가. 초기 로드·로드모어 두 `GetList` 호출에서 `TAG_KEYS` → `tagKeys` 치환, `useEffect`/`useCallback` 의존성 배열에 `tagKeys` 추가(태그 전환 시 재로딩·레이스 가드 유지). 최신/인기 래퍼는 `tagKeys` 미전달로 기존 동작 그대로.
- `components/main/tag/TagGridSection.tsx` (신규) — `{ tagKey, tagLabel }` props를 받아 `GetListGridSection`에 `tagKeys={String(tagKey)}`, `order={1}`, `title={'#'+tagLabel}` 등 주입. 최신/인기 래퍼와 동일 패턴.
- `views/main/home.tsx:13,16,42-53,90-91,112-117` — `ReqTagRankingTabs()` 호출 → `tagTabs: TabItem[]`(`id: 'tag-'+c_chrbot_tag_key`, `label: tag`, `shouldUpdateUrl: true`) 생성, `tabs = [...navigationTabs, ...tagTabs]`를 `ButtonTabs tabs`에 전달. `tabParam.startsWith('tag-')` 분기 추가 → `TagGridSection tagKey={Number(tabParam.slice(4))} tagLabel={activeTagTab?.label ?? ''}` 렌더(직접 진입/새로고침 시 라벨 로딩 전이라도 그리드는 `tagKey`만으로 즉시 동작).

## 검증 결과

- `npx tsc --noEmit` — 통과 (에러 없음, exit code 0).
- `npx biome lint` (변경 파일 대상) — 신규 코드에서 발생한 이슈 없음. 다음은 **본 작업과 무관한 기존 이슈**로 그대로 둠(계획 "범위 밖" 항목과 일치):
  - `views/main/home.tsx`의 `characters`, `setSelectedTagIds` 미사용 — 계획 "범위 밖" 명시(`home.tsx 기존 미사용 변수 정리는 별건`).
  - `services/hooks/DataListManager.ts`의 `CharbotChatModeResponse` 미사용 import — 기존 주석 처리된 `ReqGetChatMode` 관련, 본 변경 이전부터 존재.
  - `services/api/storyNationApi.ts`의 `headers.common['Authorization']` 관련 `useLiteralKeys` 경고 다수 — 본 작업 이전부터 존재하는 파일 전역 이슈, 이번 변경(`GetTagRankingList`) 부분과 무관.
- 수동 시나리오(코드 리뷰 기준, 실제 브라우저 미검증 — 개발 서버 실행 확인 필요):
  - `?tab` 없음 → 정적 7탭 + `tagTabs` 로드 후 최대 10개가 '성별모름' 뒤에 순서대로 병합됨(`tagRankingData` 실패/로딩 시 `tagTabs=[]`로 정적 탭만 노출, 폴백 요구사항 충족).
  - 태그 탭 클릭 → `TagGridSection` → `GetListGridSection`에 `tagKeys=String(tagKey)`, `order=1` 전달 → `GetList('0', tagKeys, 1, 1, page, 10)` 호출(요구 파라미터 `type:0, chrbot_tag_keys, order:1, nsfw:1` 일치).
  - `?tab=tag-<key>` 직접 진입 → `tabParam.startsWith('tag-')` 분기로 즉시 `TagGridSection` 렌더, `tagLabel`은 `tagTabs` 로드 전이면 빈 문자열로 폴백(그리드 자체는 `tagKey`만으로 정상 동작).

## 추가 요청 반영 — 태그 탭 개수 .env 설정화 (2026-07-22, main)

- 사용자 요청으로 `ReqTagRankingTabs`의 하드코딩 `count: 10`을 환경 변수로 이동.
- `.env` — 기능 플래그 섹션에 `NEXT_PUBLIC_HOME_TAG_TAB_COUNT=10` 추가.
- `services/hooks/DataListManager.ts` — `HOME_TAG_TAB_COUNT = Number(process.env.NEXT_PUBLIC_HOME_TAG_TAB_COUNT) || 10` 상수 도입(미설정/잘못된 값이면 10 폴백). `queryKey`에도 포함(`['tagRankingTabs', HOME_TAG_TAB_COUNT]`). 기존 `ReqGetTags`(필터용, count 미사용)는 무변경.
- `NEXT_PUBLIC_`은 빌드 타임 인라인이므로 값 변경 시 재빌드(개발 서버 재시작) 필요.
- 검증: `npx tsc --noEmit` 통과.

## 계획과 달라진 점 / 미완 · 후속 필요

- 없음(1~5단계는 계획 매핑 그대로 구현). 6~7단계(publisher 담당: 태그 헤더 시각 처리, 360px 가로 스크롤/센터링 검증)는 의도적으로 미착수.
- 실제 브라우저/Network 탭 기준의 수동 검증(계획 "검증 방법" 섹션의 API 호출 확인, 360/768/1280px 확인)은 미실행 — 개발 서버 기동 후 확인 필요.
