# 홈(메인) Figma 퍼블리싱 — 데모 결과

- 작성일: 2026-07-09
- 대상 브랜치/커밋: `red-main` / `51feb1a`
- 담당: main Agent (데모/미리보기 목적, 정식 code-publisher 산출물의 선행 프로토타입)
- 근거 계획: [docs/plan/plan-20260709-home-figma-responsive.md](../plan/plan-20260709-home-figma-responsive.md)
- Figma: `8IbJb4GyvbmBmClFRzDsbL` node `3838:32367` (1920×1080 데스크톱 다크 시안)
- 미리보기 라우트: `/demo/home`

---

## 요약
홈(메인) 화면을 Figma 시안 기준으로 **모바일 퍼스트 반응형** 데모 페이지로 퍼블리싱했다. 전역 구조·토큰을 건드리지 않도록 **self-contained 단일 파일**로 작성해 미리보기만 가능하게 했다. 사용자가 확정한 4개 결정을 그대로 반영.

## 반영한 확정 결정
| 결정 | 반영 내용 |
|---|---|
| ① Figma대로 단순화 | 검색바·추천/랭킹 섹션·랭킹 사이드바 제거. **칩 + 카드 그리드** 단일 화면. |
| ② 좌측 사이드바(Header 대체) | 데스크톱 좌측 세로 네비(홈·채팅·만들기·내 작업실·수익내역), 모바일은 하단 탭바로 전환. |
| ③ Figma 색 기준 | `#1F1F1F` 배경 / `#FF0750` 액센트(활성) / `#555555` 비활성 칩 / `#B1B1B1` 비활성 네비 / `#D9D9D9` 카드 placeholder. |
| ④ 칩 UI만 | 16개 칩 정적 렌더 + 로컬 선택 상태(`useState`), 데이터 미연결. |

## 변경 파일
- `app/(routes)/demo/home/page.tsx` (신규, 177줄) — 데모 홈 페이지 전체
  - `page.tsx:20-26` — Figma 색 상수(`C`), 데모 전용 하드코딩
  - `page.tsx:28-34` — 네비 항목 정의(lucide-react 아이콘: Home/MessageCircle/PlusSquare/Store/HandCoins)
  - `page.tsx:37-54` — 카테고리 칩 정적 목록(Figma 시안 16종)
  - `page.tsx:57-61` — 데모 더미 카드 12장
  - `page.tsx:70-94` — 데스크톱 좌측 사이드바(`hidden md:flex`, `sticky`, `aria-current`)
  - `page.tsx:97-149` — 메인 컬럼: 태그라인 → 칩(가로 스크롤/wrap) → 카드 그리드
  - `page.tsx:124-148` — 카드 그리드(2→3→4→5→6열, `aspect-[288/415]`, `next/image`+`sizes`)
  - `page.tsx:152-174` — 모바일 하단 탭바(`fixed bottom-0 md:hidden`)

## 반응형 / 웹뷰 점검
- **카드 그리드 열 수**: 2(base) → 3(sm) → 4(md) → 5(lg) → 6(xl) — 계획 확인5 기본값 채택.
- **칩**: 모바일 가로 스크롤(`overflow-x-auto scrollbar-hide`) → 데스크톱 `md:flex-wrap`.
- **네비 전환**: `md` 경계에서 좌측 사이드바 ↔ 하단 탭바 전환.
- **뷰포트**: 루트 `min-h-[100dvh]`(모바일 주소창 대응), 사이드바 `h-[100dvh] sticky`.
- **터치 타깃**: 칩 `h-11`(44px), 하단 탭 `min-h-[44px]`, 사이드바 항목 `min-h-[56px]`.
- **가로 스크롤 방지**: 메인 `min-w-0 flex-1`, 카드 텍스트 `truncate`.
- **미디어**: 카드 이미지 `next/image` + 브레이크포인트별 `sizes`.
- **접근성**: 네비 `<nav aria-label>` + 활성 `aria-current='page'`, 칩 `<button aria-pressed>`, 카드 이미지 `alt`.
- 검증 폭 360 / 768 / 1280px에서 레이아웃 깨짐·가로 스크롤 없음(육안 기준).

## 검증 결과
- `npx biome check` 통과(자동 포맷 1건 적용).
- `npx tsc --noEmit` — 데모 페이지 타입 에러 없음.
- dev 런타임: `GET /demo/home 200`(webpack/turbopack 모두 정상 렌더 확인).
- ⚠️ 진행 중 Turbopack `os error 1450`(Windows 리소스/`.next` 캐시 손상)로 500 발생 → `.next` 삭제 후 정상화. **데모 코드와 무관**.

## 계획과 달라진 점 / 데모 한정 사항
- **파일 미분리**: 정식 계획은 `*View.tsx`(publisher) ↔ 컨테이너(writer) 분리지만, 데모는 미리보기 목적상 **단일 파일**로 통합. 정식 퍼블리싱 시 분리 필요.
- **색 하드코딩**: Figma 색을 `C` 상수(arbitrary/inline style)로 직접 사용. 정식 반영 시 결정③대로 `tailwind.config.ts` 토큰을 Figma 값으로 갱신(cross-cutting, 별건).
- **에셋 대체**: 로고 `logo.svg`, 네비 아이콘 lucide-react, 카드 `placeholders/default-character.jpg` 사용. 정식 퍼블리싱 시 Figma 로고/아이콘 SVG 다운로드 교체.
- **데이터 미연결**: 칩·카드 모두 정적. 실제 캐릭터 목록·카테고리 필터·라우팅·게이팅은 writer 담당(계획 6~8단계).

## 후속 필요 (정식 퍼블리싱 시)
1. 계획을 확정 결정(전역 사이드바 교체 + 토큰 Figma 갱신)에 맞춰 갱신.
2. `views/main/home.tsx` 재구성 + `*View`/컨테이너 파일 분리(담당 배정대로).
3. 색 토큰 갱신(별건, cross-cutting 영향 범위 확정 필요).
4. 사이드바 전역 적용 시 `app/layout.tsx`·`Header`·`MobileGNB` 정합성 검토.
5. 데모 라우트(`app/(routes)/demo/`)는 정식 반영 후 제거 여부 결정.
