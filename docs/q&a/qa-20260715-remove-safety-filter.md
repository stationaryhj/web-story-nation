# Q&A — 세이프티 필터 제거 (2026-07-15)

관련 계획: `docs/plan/plan-20260715-remove-safety-filter.md`

## Q1. 세이프티 필터 전역 강제 OFF 정책 확인 ✅ 답변 완료

**상태**: ✅ 답변 완료 (2026-07-15, 안 1 채택)
**요약**: 톱바 토글 제거 + API 항상 `safety=0` 요구사항은 사실상 "세이프티 필터 전역 강제 OFF"인데, 이 경우 **비로그인·미성년·성인인증 미완료 사용자에게도 성인 콘텐츠가 노출**된다. 의도 범위 확인 필요.

**배경**:

- API 8곳(`services/api/storyNationApi.ts`)이 `safety = isAdultModeEnabled ? 0 : 1`로 값을 생성.
- 스토어 `isAdultModeEnabled`를 항상 `true`로 잠그면 모든 사용자·모든 요청이 `safety=0`이 됨.
- 기존에는 성인인증(`adultVerification` 모달) 완료자만 토글로 OFF 가능했음.

**선택지**:

1. **전역 강제 OFF** — 모든 사용자에 대해 무조건 `safety=0`. 구현 최소(계획 안 A 그대로). 성인 콘텐츠가 인증 없이 노출됨.
2. **성인인증 사용자만 자동 OFF** — `isAdult()` 판정된 사용자만 `safety=0`, 그 외는 `safety=1` 유지. 조건부 로직 필요(계획 수정).

**답변**: 1번 전역 강제 off 한다.

**답변 반영**: 답변에 따라 `plan-20260715-remove-safety-filter.md` 1단계(스토어 잠금 방식)를 그대로 진행하거나 조건부 로직으로 수정.