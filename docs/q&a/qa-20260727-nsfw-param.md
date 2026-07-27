# Q&A: nsfw 값의 의미 (2026-07-27)

## 질문
API에 쓰이는 `nsfw` 값이 무엇인가?

## 답
**1 = 성인(짜릿모드), 2 = 전체 이용가, 3 = 이용등급 전체.** 두 용도로 쓰인다.

### 1) 목록 API 요청 필터 (`GetList`의 nsfw 파라미터)
- 정의 주석: `store/useCharacterGridStoreData.ts:18` — `1: 짜릿모드 가능, 2: 전체 이용가(기본값), 3: 이용등급 전체`
- 홈 최신·인기·태그 탭(`GetListGridSection`): `NSFW = 1` 고정(성인 목록 요청)
- 남/여 카테고리 그리드(`useCharacterGridStoreData`): `nsfw: 2`(전체 이용가)

### 2) 캐릭터 속성 (응답 필드·생성 payload)
- 생성 시 매핑: `src/features/edit-character/api/dmCharacterApi.ts:43` — `rating === 'adult' ? 1 : 2`
- 채팅에서 `chatBotData.nsfw !== 1`이면 짜릿모드 UI 차단(`views/chat/detail.tsx`)
- 성인용 대체 이미지는 별도 필드 `img_url_nsfw`

## safety와의 구분
- `safety` = 유저 설정(세이프티 필터, 0=OFF/1=ON, 현재 전역 1 고정)
- `nsfw` = 콘텐츠 등급(요청 필터 또는 캐릭터 등급)
- ⚠️ 현재 홈 탭은 `nsfw: 1` + `safety: 1` 조합으로 나감 — 서버 처리에 따라 홈 탭 결과가 비거나 필터링될 수 있음.

## 관련
- `docs/q&a/qa-20260727-safety-api-value.md`
- `docs/q&a/qa-20260727-home-tabs-api.md`
