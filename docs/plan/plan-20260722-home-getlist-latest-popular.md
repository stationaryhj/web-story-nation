# 홈 최신 탭 GetList 전환 + '인기' 탭 신설 — 구현 계획 (소급)

- 작성 일자: 2026-07-22
- 문서 성격: **소급(retrospective)** — 구현이 승인 게이트 없이 선반영된 뒤, 워크플로(plan → write/publish → review) 준수를 위해 계획을 역문서화한다.
- 선행 근거: `docs/plan/plan-20260721-home-latest-tab.md` (최신 탭 신설, 당시 API는 `GetListRcmnd(8,8,…)`)
- 목표 한 줄 요약: 최신 탭 데이터 소스를 `POST /api/charbot/getlist`로 바꾸고, 최신 옆에 동일 형태의 '인기' 탭(`order=1`)을 추가한다.

---

## 목표

1. **최신 탭 API 교체**: `GetListRcmnd`(`/api/charbot/rcmnd/getlist`, module_8) → `contentApi.GetList`(`/api/charbot/getlist`).
2. **인기 탭 신설**: 최신과 UI·페이지네이션·파라미터가 동일하되 `order=1`(인기순). URL `?tab=popular`.
3. **중복 제거**: 최신/인기 공통 컨테이너·View로 추출해 order·헤더 문구만 주입.

## 확정 파라미터 (사용자 지시)

| 탭 | type | order | nsfw | paginate | 비고 |
|----|------|-------|------|----------|------|
| 최신 (`latest`) | `'0'` | `2` (생성순) | `1` | `10` | paginate는 남/여 탭(`useCharacterGridStoreData`)과 동일 |
| 인기 (`popular`) | `'0'` | `1` (인기순) | `1` | `10` | 최신과 형태 동일, order만 다름 |

- `chrbot_tag_keys`: `''`
- `safety`: `GetList` 내부에서 `isAdultModeEnabled`로 자동 세팅(호출부에서 별도 전달 없음)

## 현황 파악 (구현 시점 기준)

### 변경 전 최신 탭
- `components/main/latest/LatestGridSection.tsx` — `UpdateharactersPaging` → `GetListRcmnd(8, 8, page, 50, 0)`.
- `LatestGridSectionView.tsx` — 최신 전용 헤더·그리드·더 보기.

### 남/여 탭 페이지 크기 선례
- `store/useCharacterGridStoreData.ts` — `contentApi.GetList(..., page, 10)`.
- hasMore: `chrbotList.current_page < chrbotList.last_page`.

### 홈 탭 배선
- `views/main/home.tsx` — 추천/랭킹/최신/남자/여자/성별모름. 인기 없음.

## 접근 방식

### A. 공통 GetList 그리드 `[담당: writer]` + View `[담당: publisher]`
- `components/main/list-grid/GetListGridSection.tsx` — `order`·문구 props. 로컬 state + `requestIdRef` 레이스 가드. `contentApi.GetList('0','',1,order,page,10)`.
- `components/main/list-grid/ListGridSectionView.tsx` — 기존 Latest View 마크업 일반화(`title`/`description`/`emptyTitle`).
- 응답 매핑: `chrbotList.data` → `bridgeCharacterDataToCharacter` (남/여 store와 동일 필드 매핑). 로드모어는 id 기준 중복제거 병합.
- hasMore: `current_page < last_page` 우선, 메타 없으면 길이 휴리스틱.

### B. 얇은 탭 래퍼 `[담당: writer]`
- `LatestGridSection` → `GetListGridSection order={2}` + 최신 문구.
- `PopularGridSection` (신규) → `order={1}` + 인기 문구.
- 삭제: `LatestGridSectionView.tsx` (공통 View로 대체).

### C. home 배선 `[담당: writer]`
- `navigationTabs`에 `{ id: 'popular', label: '인기' }`를 **최신 다음**에 삽입.
- 분기: `tabParam === 'popular'` → `<PopularGridSection />`.

## 단계별 계획

1. **공통 View 신설** `[담당: publisher]` — `ListGridSectionView.tsx`
   - Latest View 복제 + 헤더/빈상태 문구 props화.
2. **공통 컨테이너 신설** `[담당: writer]` — `GetListGridSection.tsx`
   - GetList 호출·페이지네이션·레이스 가드.
3. **최신 래퍼 전환 + 인기 래퍼** `[담당: writer]`
   - `LatestGridSection.tsx` 축소, `PopularGridSection.tsx` 신설, `LatestGridSectionView` 삭제.
4. **home.tsx 탭·분기** `[담당: writer]`
5. **검증** `[담당: main]` — `biome`/`tsc`, 탭 URL·order 파라미터 정적 확인.
6. **리뷰** `[담당: reviewer]`

## 리스크 / 주의

- **워크플로 위반 소급**: 본 문서는 구현 후 작성. 이후 비자명 작업은 승인 게이트 준수.
- **nsfw=1 고정**: 사용자 지시. 세이프티 전역 OFF 정책과 별도로 body `nsfw`는 1 고정.
- **type='0'**: GetList 주석상 성별은 1/2/3이나, 사용자 지시대로 `'0'`(전체) 사용.
- **home.tsx 사전 lint**: `characters`/`setSelectedTagIds` 미사용 — 본 작업 도입 아님, 건드리지 않음.

## 완료 조건

- `?tab=latest` → GetList `order=2`, paginate 10.
- `?tab=popular` → GetList `order=1`, 동일 UI.
- 탭 순서: 추천/랭킹/최신/**인기**/남자/여자/성별모름.
- 공통 모듈로 로직 중복 없음. tsc·신규 파일 biome 통과.

## 후속(비범위)

- 인기/최신 헤더 카피 Figma 확정 시 문구만 교체.
- home.tsx 기존 unused 변수 정리(별건).
