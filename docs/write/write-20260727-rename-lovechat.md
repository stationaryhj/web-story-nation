# 서비스명 문구 변경: 스토리네이션 → 러브챗 (2026-07-27)

## 요약
사용자 노출 문자열 '스토리네이션'을 '러브챗'으로 일괄 변경했다. 코드 14개 파일, 총 30곳. 로직 변경 없음(문자열만).

## 변경 파일
- `app/layout.tsx` — 메타데이터 title, OG/Twitter title, OG 이미지 alt
- `components/common/header.tsx` — 로고 이미지 alt
- `components/common/footer.tsx` — 푸터 브랜드명, 카피라이트
- `components/form/SignupForm.tsx` — 만 14세 안내 문구
- `components/modal/SignupModal.tsx`, `src/shared/ui/modal/SignupModal.tsx` — 가입 안내·환영 문구 (중복 레이어 양쪽 모두)
- `components/modal/RewardModal.tsx` — 환영 문구
- `components/modal/NoticeModal.tsx` — 공지 이미지 alt
- `components/modal/ReportModal.tsx` — 신고 운영정책 안내
- `components/modal/NotificationSidebar.tsx` — 목업 알림 문구 다수
- `components/main/recommend/CreateCharacterSection.tsx` — 캐릭터 생성 소개 문구
- `views/terms/home.tsx` — 약관 페이지 제목
- `views/simple-login/client.tsx`, `views/login/home.tsx` — 로그인 안내 문구

## 제외한 항목
- `docs/figma-structure.md`(및 `.backup`) — Figma 디자인 덤프 문서라 원본 기록 유지 목적으로 변경하지 않음.
- 영문 표기 `StoryNation`(CLAUDE.md, README 등 내부 문서/코드 식별자) — 요청 범위가 한글 문구였으므로 유지. 영문 브랜드명도 바꾸려면 별도 작업 필요.

## 검증
- `docs/` 제외 전체 grep에서 '스토리네이션' 0건 확인.
