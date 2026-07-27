# Q&A: 홈 탭(추천·랭킹 외)의 API 호출 방식 (2026-07-27)

## 질문
추천, 랭킹 탭 말고 다른 탭(최신·인기·태그 탭)은 API를 어떻게 호출하는가?

## 답
최신·인기·태그 탭은 전부 **`POST /api/charbot/getlist`** (`contentApi.GetList`) 하나를 파라미터만 바꿔 호출한다.

## 구조
- `views/main/home.tsx` — `tab` URL 파라미터로 섹션 분기.
- 최신/인기/태그 섹션은 공용 컨테이너 `components/main/list-grid/GetListGridSection.tsx` 재사용.
- 표시는 `ListGridSectionView`(표시용/컨테이너 분리 구조).

## 탭별 파라미터
| 탭 | order | chrbot_tag_keys |
|----|-------|-----------------|
| 최신 | 2 (생성순) | — |
| 인기 | 1 (인기순) | — |
| 태그 탭 | 1 | 태그 키 (`tab=tag-<key>`) |

공통: `type '0'`, `nsfw 1`, `paginate 10`, `page`(더보기 시 증가), `countryCode 'KR'`, `safety`(전역 정책상 항상 1 — `docs/write/write-20260727-safety-on.md`).

- 더보기: `current_page < last_page`로 판단, 같은 API에 page+1.
- 탭 연타 대응: `requestIdRef` 요청 순번 가드.

## 태그 탭 목록의 출처
`ReqTagRankingTabs()` 훅 → `GetTagRankingList(type=0, count=10)`. 실패 시 정적 탭(추천·랭킹·최신·인기)만 노출.

## 예외
- 추천 탭: 모듈별 rcmnd 계열(`GetTop10` 등).
- 랭킹 탭: `GetTop10Ranking`(`/api/charbot/rcmnd/ranking/top10`).
