# Q&A: 홈 태그 랭킹 탭 `getlist` 호출 파라미터

관련 계획: `[docs/plan/plan-20260722-home-tag-ranking-tabs.md](../plan/plan-20260722-home-tag-ranking-tabs.md)`

대상 API: `POST /api/charbot/getlist` (type=0, chrbot_tag_keys) · `POST /api/charbot/tagranking/get` (type=0, count=10)

---

## Q1. 태그 탭의 GetList 정렬(order) 값은?

**질문**
태그 탭 클릭 시 `getlist`를 `type: 0, chrbot_tag_keys: [태그 key]`로 호출하는데, 정렬 기준(`order`)이 요구사항에 명시되지 않았다.


| 선택지                   | 설명                             |
| --------------------- | ------------------------------ |
| **A. 인기순** `order: 1` | 태그별 인기 캐릭터 우선 노출 — 인기 탭과 동일    |
| **B. 최신순** `order: 2` | 태그별 최신 등록 캐릭터 우선 노출 — 최신 탭과 동일 |
| **C. order 생략**       | 서버 기본 정렬에 위임                   |


**배경**

- 최신 탭: `order: 2`, 인기 탭: `order: 1` 사용 (`docs/plan/plan-20260722-home-getlist-latest-popular.md`)
- 태그 탭은 필터(`chrbot_tag_keys`)만 지정하므로 정렬 기준 별도 결정 필요

**권장**
**A. 인기순** — 태그 랭킹에서 진입하는 탭이므로 인기 콘텐츠 우선이 자연스럽고, 인기 탭 선례와 일치.

**결정**

- [x] A. 인기순 `order: 1`
- [ ] B. 최신순 `order: 2`
- [ ] C. order 생략
- [ ] 기타: ______________

---



## Q2. nsfw 파라미터는 어떻게 보낼까?

**질문**
태그 탭 `getlist` 호출 시 `nsfw` 값을 고정으로 보낼지, 성인모드 설정에 연동할지 확인 필요.


| 선택지                     | 설명                               |
| ----------------------- | -------------------------------- |
| **A.** `nsfw: 1` **고정** | 최신/인기 탭 선례와 동일                   |
| **B. 성인모드 연동**          | `isAdultModeEnabled` 값에 따라 동적 전달 |


**배경**

- 최신/인기 탭 구현은 `nsfw: 1` 고정으로 호출 (`docs/plan/plan-20260722-home-getlist-latest-popular.md`)
- `GetListGridSection`은 성인모드 토글 시 reload는 이미 연동되어 있음

**권장**
**A.** `nsfw: 1` **고정** — 최신/인기 탭 선례 유지, 이번 범위 최소 변경.

**결정**

- [x] A. `nsfw: 1` 고정
- [ ] B. 성인모드 연동
- [ ] 기타: ______________

---



## 결정 요약 (구현 시 참고)


| #   | 항목         | 결정값                    | 결정일        | 비고  |
| --- | ---------- | ---------------------- | ---------- | --- |
| Q1  | 태그 탭 order | **A. 인기순 `order: 1`**  | 2026-07-22 |     |
| Q2  | nsfw 파라미터  | **A. `nsfw: 1` 고정**    | 2026-07-22 |     |


**모든 항목 확정** → `code-writer`로 구현 진행 가능.