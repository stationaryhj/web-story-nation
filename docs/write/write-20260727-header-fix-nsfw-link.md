# header.tsx 문법 오류 수정 + nsfw ↔ isAdultModeEnabled 연동 (2026-07-27)

## 요약
1. `components/common/header.tsx`의 컴파일을 깨뜨리던 문법 오류 3건 수정.
2. 홈 최신·인기·태그 탭의 `GetList` 요청 `nsfw`를 `isAdultModeEnabled`와 연동: **false면 nsfw=2(전체 이용가), true면 1(짜릿모드)**. 현재 전역 정책상 `isAdultModeEnabled`가 항상 false이므로 실제로는 항상 `nsfw: 2`.

## 변경 파일

### components/common/header.tsx (오류 수정만, 기존 편집 내용 유지)
- 잘린 import 문(`import { components/motion/PageTransition';`) 제거 — 사용처 없음.
- 사라진 `isSidebarOpen`/`setIsSidebarOpen` state 선언 복구.
- `</div>_e` 스트레이 문자 제거.

### components/main/list-grid/GetListGridSection.tsx
- `const NSFW = 1` 상수 제거 → `const nsfw = isAdultModeEnabled ? 1 : 2`로 대체.
- 초기 로드·더보기 두 호출 모두 적용, useEffect/useCallback 의존성에 `nsfw` 반영(더보기 쪽은 기존에 성인모드 의존성이 누락돼 있었음).

## 검증
- `npx tsc --noEmit` — 수정 파일 에러 없음.
- Playwright로 `/?tab=latest` 접속, `/api/charbot/getlist` 요청 바디 캡처:
  `{ type: '0', nsfw: 2, order: 2, page: 1, paginate: 10, safety: 1, ... }` 확인.
- 페이지가 정상 렌더됨(헤더 컴파일 오류 해소 방증).

## 참고
- 채팅 계열 API(SendChat/ReSendChat)의 `nsfw: 1` 하드코딩은 의미가 다름(유저 성인 여부)이라 이번 범위에서 제외.
- 관련: `docs/write/write-20260727-safety-on.md`, `docs/q&a/qa-20260727-nsfw-param.md`
