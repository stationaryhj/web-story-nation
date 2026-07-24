# 홈 태그 랭킹 탭 동적 추가 — 구현 계획

- 작성 일자: 2026-07-22
- 대상 브랜치: `red-main`
- 관련 Q&A: [`docs/q&a/qa-20260722-home-tag-ranking-tabs.md`](../q&a/qa-20260722-home-tag-ranking-tabs.md) — order·nsfw 확정 근거
- 목표 한 줄 요약: `tagranking/get(type:0,count:10)`으로 받은 태그 랭킹을 홈 탭 목록 맨 끝('성별모름' 뒤)에 동적으로 붙이고, 태그 탭 클릭 시 `getlist(type:0, chrbot_tag_keys:[tagKey], order:1, nsfw:1)`로 캐릭터 그리드를 표시한다.

---

## 목표

홈 네비게이션 탭에 태그 랭킹 탭 최대 10개를 API 응답 순서대로 '성별모름' 탭 뒤에 동적 추가하고, 각 태그 탭은 최신/인기 탭과 동일한 `GetList` 그리드 패턴을 재사용해 해당 태그의 캐릭터 목록을 보여준다. 새로고침/직접 진입 시에도 URL(`?tab=tag-<key>`)로 해당 탭이 선택·로드된다.

## 확정 사항

> 근거: [`docs/q&a/qa-20260722-home-tag-ranking-tabs.md`](../q&a/qa-20260722-home-tag-ranking-tabs.md) (사용자 확정, 2026-07-22)

1. **태그 탭 GetList `order` = `1`(인기순) 확정** (Q1 → A). 태그 "랭킹" 맥락에 맞춰 인기순 정렬.
2. **태그 탭 GetList `nsfw` = `1` 고정 확정** (Q2 → A). 최신/인기 선례와 동일한 고정값이며 **성인모드 연동 아님**. (단, `GetList` 내부의 `safety` 필드는 기존대로 `isAdultModeEnabled`에 따라 자동 세팅됨 — body의 `nsfw`만 1 고정.)
3. **`tagranking/get`의 `type:0`**: 기존 `GetTagRankingList`는 성별 카테고리(1/2/3)를 넘겼으나, 태그 탭 페칭은 `type:0`(전체) + `count:10`을 그대로 전달한다(기존 필터용 호출과 별개 파라미터).
4. **로그인/성인모드 미인증 시 노출**: 태그 탭도 다른 탭처럼 항상 노출(폴백: 페칭 실패/로딩 시 정적 탭만).

## 현황 파악

### 탭 배선 (정적)
- `views/main/home.tsx:18-26` — `navigationTabs: TabItem[]` 정적 배열, 마지막이 `{ id: 'unknown', label: '성별모름' }`.
- `views/main/home.tsx:35` — `tabParam = searchParams.get('tab') || 'all'`.
- `views/main/home.tsx:85-104` — `tabParam` 값으로 `RecommendSection`/`RankingGridSection`/`LatestGridSection`/`PopularGridSection`/`CharacterGridSection` 분기 렌더. else 분기에서 `CharacterGridSection categoryId={tabParam as any}`.
- `views/main/home.tsx:46-57` — `handleCategoryChange`가 `?tab=` 갱신(라우팅). 태그 탭 id(`tag-16` 등)도 그대로 동작.

### 탭 UI
- `components/elements/tabs/ButtonTabs.tsx:8-12` — `TabItem { id, label, shouldUpdateUrl? }`.
- `ButtonTabs.tsx:181` — 루트가 `overflow-x-auto hide-scrollbar`, 칩은 `shrink-0`(`:195`) → **가로 스크롤 이미 지원**. 단, home.tsx:74가 `flex justify-center`로 감싸 17개 칩에서 좌측 칩이 잘릴 수 있음(아래 리스크).
- `ButtonTabs.tsx:51-54` — `activeTabId` 초기값을 URL `tab` 우선으로 문자열 비교만 하므로 `tag-<key>` id도 무해.

### GetList 그리드 재사용 자산 (최신/인기 선례)
- `components/main/list-grid/GetListGridSection.tsx` — 컨테이너. `contentApi.GetList(LIST_TYPE='0', TAG_KEYS='', NSFW=1, order, page, PAGE_SIZE=10)` 호출, `requestIdRef` 레이스 가드, 로드모어 중복제거 병합. **`TAG_KEYS`가 현재 상수 `''`(:13)** — 여기에 태그 키만 주입하면 태그 탭 재사용 가능. **`NSFW=1`(:14)도 확정값과 동일.**
- `components/main/list-grid/ListGridSectionView.tsx` — 표시용 View. `title/description/emptyTitle` props. 마크업 변경 불필요.
- `components/main/latest/LatestGridSection.tsx`, `components/main/popular/PopularGridSection.tsx` — 얇은 래퍼 선례(문구+order만 주입).

### API / 타입
- `services/api/storyNationApi.ts:413-433` — `GetList(type, chrbot_tag_keys, nsfw, order, page, paginate)`. `chrbot_tag_keys`는 문자열(쉼표 구분). **이미 태그 키 지원**.
- `services/api/storyNationApi.ts:439-443` — `GetTagRankingList(type: number)` — **`count` 파라미터 없음**. body에 `{ type }`만 전송 → `count` 추가 필요.
- `types/api.ts:231-241` — `TagRankingListResponse { result, charbot_tag: TagRanking[] }`, `TagRanking { c_chrbot_tag_key, group, sort, tag }`. 응답 형태 요구사항과 일치.
- `services/hooks/DataListManager.ts:147-157` — `ReqGetTags(categoryType)` = 기존 태그 랭킹 훅(TanStack). 태그 필터용. **재사용하지 않고** 태그 탭 전용 훅을 신설(파라미터 `type:0,count:10`가 다름).

### 기존 `GetTagRankingList` 사용처 (하위호환 확인)
- `services/hooks/DataListManager.ts:151` (`ReqGetTags`)
- `store/useCharacterGridStoreData.ts:580` (`loadTagsForCategory`)
- → 둘 다 `type`만 전달. `count`를 **선택 파라미터(미전달 시 body에 미포함)** 로 추가하면 무영향.

## 접근 방식

### 추천안: 기존 `GetListGridSection` 컨테이너를 `tagKeys` prop으로 일반화 + 얇은 태그 래퍼 신설

최신/인기가 이미 `GetListGridSection`(container) ↔ `ListGridSectionView`(view)로 잘 분리돼 있고, 태그 탭은 `GetList`의 `chrbot_tag_keys`만 채우면 되는 **동형(同型) 작업**이다. `order:1`·`nsfw:1` 확정으로 인기 탭과 파라미터가 거의 동일(태그 키만 추가)해 재사용성이 더 명확해졌다. 따라서:

1. `GetListGridSection`에 `tagKeys?: string`(기본 `''`) prop을 추가 → `TAG_KEYS` 상수를 prop으로 대체. 최신/인기 래퍼는 변경 불필요(기본값 `''`).
2. 태그 탭 전용 얇은 래퍼 `components/main/tag/TagGridSection.tsx` 신설(최신/인기 디렉토리 패턴 준수) — `tagKey`, `tagLabel`을 받아 `GetListGridSection`에 `tagKeys={String(tagKey)}`, `order={1}`, `#태그` 문구 주입.
3. 태그 탭 목록은 home.tsx가 신규 훅 `useTagRankingTabs`(TanStack)로 페칭해 정적 탭 뒤에 병합. 페칭 실패/로딩 시 정적 탭만.

**대안 B (별도 신규 스토어/섹션 통째 신설)**: `CategoryId` 확장 또는 태그 전용 페칭 스토어 신설. → 기존 `GetList` 컨테이너와 로직 중복, 변경량 과다로 비효율. 기각.

**대안 C (`GetTagRankingList` 시그니처 대신 별도 API 함수 신설)**: 중복 함수 증가. 기존 함수에 선택 `count`만 더하는 편이 최소 변경. 기각.

## 실행 계획 (단계별)

> 파일 소유 규칙: `GetListGridSection.tsx`(컨테이너)·`storyNationApi.ts`·훅·`home.tsx`는 writer, `ListGridSectionView.tsx`(표시)는 필요 시에만 publisher. 같은 파일을 두 담당이 동시 수정하지 않는다.

1. **`GetTagRankingList`에 `count` 선택 파라미터 추가** `[담당: writer]` — `services/api/storyNationApi.ts:439-443`
   - 시그니처: `GetTagRankingList(type: number, count?: number)`. body는 `{ type, ...(count != null ? { count } : {}) }`.
   - 기존 호출부(`ReqGetTags`, `loadTagsForCategory`) 무영향(하위호환).

2. **태그 랭킹 탭 페칭 훅 신설** `[담당: writer]` — `services/hooks/DataListManager.ts` (기존 훅 모음에 함수 추가) 또는 `src/features` 미이행 영역이므로 레거시 `services/hooks`에 배치(주변 관행 준수)
   - `export const ReqTagRankingTabs = () =>` TanStack `useQuery<TagRankingListResponse>`.
   - `queryKey: ['tagRankingTabs']`, `queryFn: contentApi.GetTagRankingList(0, 10)` (**type:0, count:10 확정**).
   - 반환에서 `charbot_tag`를 응답 순서 그대로 노출(요구사항: 받은 순서대로).

3. **`GetListGridSection` 일반화** `[담당: writer]` — `components/main/list-grid/GetListGridSection.tsx`
   - `GetListGridSectionProps`에 `tagKeys?: string` 추가(기본 `''`).
   - 상수 `TAG_KEYS` 제거하고 두 호출부(초기 로드 `:99`, 로드모어 `:121`)를 아래 매핑으로 교체:
     - **`GetList(type: '0', chrbot_tag_keys: tagKeys, nsfw: 1, order, page, paginate: 10)`**
     - 태그 탭 확정값: `type: 0`(문자열 `'0'`), `chrbot_tag_keys: '<key>'`, `order: 1`, `nsfw: 1` (`NSFW` 상수 유지값과 일치).
   - `useEffect`/`useCallback` 의존성 배열에 `tagKeys` 추가(태그 전환 시 재로딩·레이스 가드 유지).
   - 최신/인기 래퍼는 `tagKeys` 미전달 → 기존 동작 그대로.

4. **태그 탭 래퍼 신설** `[담당: writer]` — `components/main/tag/TagGridSection.tsx` (신규 디렉토리, 최신/인기 패턴)
   - props: `{ tagKey: number; tagLabel: string }`.
   - `<GetListGridSection tagKeys={String(tagKey)} order={1} title={'#' + tagLabel} description='이 태그의 인기 캐릭터를 만나보세요!' emptyTitle='해당 태그의 캐릭터가 없어요' />`.
   - **order=1(인기순), nsfw=1 확정 반영.**

5. **home.tsx 탭 병합·분기 배선** `[담당: writer]` — `views/main/home.tsx`
   - `ReqTagRankingTabs()` 호출 → `tagTabs: TabItem[]` 생성: `charbot_tag.map(t => ({ id: 'tag-' + t.c_chrbot_tag_key, label: t.tag, shouldUpdateUrl: true }))`.
   - `const tabs = [...navigationTabs, ...tagTabs]` 를 `ButtonTabs tabs`에 전달(로딩/실패 시 `tagTabs=[]` → 정적 탭만).
   - 분기 추가: `tabParam.startsWith('tag-')`이면 `key = Number(tabParam.slice(4))`, 해당 태그를 `tagTabs`에서 찾아 `<TagGridSection tagKey={key} tagLabel={label} />` 렌더. 매칭 실패(로딩 중 새로고침 직접 진입) 시 `tagLabel ?? ''` 처리, 로드된 뒤 label 채워짐.
   - else 최종 분기는 기존 `CharacterGridSection`(male/female/unknown) 유지.

6. **(선택) 태그 헤더 시각 처리** `[담당: publisher]` — `components/main/list-grid/ListGridSectionView.tsx`
   - 기본은 title에 `#로맨스` 문자열 주입만으로 충분(마크업 변경 없음). 해시태그 칩형 헤더 등 별도 디자인이 필요하면 이 단계에서만 View에 optional prop(예: `titleAs='hashtag'`)을 추가한다. **불필요하면 생략.**

7. **가로 스크롤/센터링 검증·조정** `[담당: publisher]` — `views/main/home.tsx:74` 래퍼(단, 5단계와 파일 충돌 방지: 이 조정은 래퍼 `div`의 className만 대상)
   - 17개 칩에서 `justify-center`가 좌측 칩을 잘리게 하면 모바일에서 `justify-start`(또는 `md:justify-center`)로 조정. 360px에서 좌측 첫 탭('추천') 접근 가능 여부 확인.
   - ⚠️ home.tsx는 5단계(writer)와 파일이 겹침 → **7단계는 5단계 완료 후 순차 진행**하거나, className 조정을 5단계 writer가 함께 반영하고 본 단계는 검증만 수행(권장: 검증만).

8. **검증** `[담당: main]` — `npx tsc --noEmit`, `npm run lint`(신규/수정 파일), 수동 시나리오(아래).

## 영향 범위 & 리스크

- **수정 파일**: `services/api/storyNationApi.ts`(count 추가), `services/hooks/DataListManager.ts`(훅 추가), `components/main/list-grid/GetListGridSection.tsx`(tagKeys prop), `views/main/home.tsx`(탭 병합·분기).
- **신규 파일**: `components/main/tag/TagGridSection.tsx`.
- **하위호환**: `GetTagRankingList` `count` 선택 파라미터 → 기존 필터/스토어 호출 무영향(2개 사용처 확인 완료).
- **레이스 컨디션**: 태그 탭 전환 시 `GetListGridSection`의 `tagKeys` 의존성 추가로 이전 요청 무시(`requestIdRef`) 유지 필수.
- **직접 진입/새로고침**: `?tab=tag-16`으로 진입 시 태그 목록 페칭 완료 전이면 탭 칩·label이 잠깐 비어 보일 수 있음. 그리드는 `tagKey`만으로 즉시 로드 가능(label 없어도 `GetList`는 동작). label은 페칭 후 채워짐. 존재하지 않는 key면 빈 상태 표시.
- **성인모드**: body `nsfw`는 1 고정(성인모드 연동 아님, Q2 확정). 단 `GetList` 내부 `safety` 필드는 기존대로 `isAdultModeEnabled` 자동 세팅이며, `GetListGridSection`이 `isAdultModeEnabled` 의존성으로 reload(:113)하므로 태그 탭도 성인모드 토글 시 재요청됨.
- **가로 스크롤**: ButtonTabs 자체는 지원. home.tsx `justify-center` 래퍼만 360px 확인 필요(7단계).
- **보안**: 결제/암호화/인증 무관.

## 검증 방법

- `?tab` 없음(추천) → 정적 7탭 + 로드 후 태그 탭 최대 10개가 '성별모름' 뒤에 순서대로 노출.
- 태그 탭 클릭 → `POST /api/charbot/getlist` body `type:'0', chrbot_tag_keys:'<key>', order:1, nsfw:1` 확인(Network 탭), 그리드·더 보기 동작.
- `?tab=tag-<key>` 직접 진입/새로고침 → 해당 탭 활성·그리드 로드.
- 성인모드 토글 → 태그 탭 그리드 reload(단 body `nsfw`는 1 유지, `safety`만 변동).
- 360/768/1280px: 탭 가로 스크롤로 전 탭 접근 가능, 가로 스크롤바(page overflow) 없음.
- `npx tsc --noEmit`, `npm run lint` 통과.

## 범위 밖 (하지 않을 것)

- 태그 그룹(성격/관계/소재) 구분 UI·헤더 그룹핑.
- 태그 필터용 기존 `ReqGetTags`/`loadTagsForCategory`/`CharacterGridSection` 태그 로직 변경.
- `CategoryId` 타입 확장(태그 탭은 별도 컨테이너로 처리하므로 불필요).
- home.tsx 기존 미사용 변수(`characters`, `selectedTagIds`) 정리(별건).
- 태그 탭 헤더 문구/디자인 Figma 확정(확정 시 문구·6단계에서 조정).
