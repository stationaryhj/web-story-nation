# 헤더 태그라인 추가 (2026-07-27)

## 요약
헤더 로고 오른쪽에 서비스 태그라인 "상상하는 모든것이 이뤄지는 AI파라다이스"를 추가했다. (사용자 제공 스크린샷 시안 기준)

## 변경 파일
- `components/common/header.tsx` — 로고 `<Link>` 뒤에 `<p>` 태그라인 추가.

## 구현 세부
- 클래스: `hidden lg:block text-base font-semibold text-text-primary whitespace-nowrap truncate max-w-[38rem]`
- **반응형**: 모바일·태블릿(< lg 1024px)에서는 검색창·알림 버튼과 겹쳐 레이아웃이 깨지므로 숨김. lg 이상에서만 노출.
- 과도한 폭 점유 방지: `truncate + max-w-[38rem]`로 좁은 데스크톱에서 말줄임 처리.
- 색상은 semantic 토큰(`text-text-primary`) 사용, 하드코딩 HEX 없음.

## 검증 (Playwright, C:\temp\pw-qa\tagline-check.js)
| 폭 | 태그라인 | 가로 스크롤 |
|----|---------|------------|
| 360 | 숨김(의도) | 없음 |
| 768 | 숨김(의도) | 없음 |
| 1280 | 노출 | 없음 |
| 1920 | 노출 | 없음 |

스크린샷: `C:\temp\pw-qa\shots\tagline-{360,768,1280,1920}.png`
