# 채팅 목록 Figma 퍼블리싱 — 데모 결과

- 작성일: 2026-07-24
- 대상 브랜치/커밋: `red-main` / `6eb151d`
- 담당: main Agent (데모/미리보기 목적, 정식 code-publisher 산출물의 선행 프로토타입)
- 선행 데모: [docs/publish/publish-20260709-home-demo.md](publish-20260709-home-demo.md) (`/demo/home`)
- Figma: `8IbJb4GyvbmBmClFRzDsbL` node `3840:33201` (1920×1080 데스크톱 다크 시안)
- 미리보기 라우트: `/demo/chats`

---

## 요약
**채팅 목록 화면**을 Figma 시안 기준으로 **모바일 퍼스트 반응형** 데모 페이지로 퍼블리싱했다. 선행 데모(`/demo/home`)와 동일 규칙 — 전역 구조·토큰을 건드리지 않는 **self-contained 단일 파일**, Figma 색 데모 전용 하드코딩. 좌측 사이드바/하단 탭바는 홈 데모와 동일 구조를 재사용하고 '채팅'을 활성 상태로 표시했다.

## 시안 구성 → 구현 매핑
| Figma 시안 | 구현 |
|---|---|
| 좌측 세로 네비(홈·**채팅(활성)**·만들기·내 작업실·수익내역) | 홈 데모와 동일 사이드바 재사용, `activeNav='chat'` 초기값. 모바일은 하단 탭바 전환. |
| 상단 태그라인 24px Bold | 홈 데모와 동일 `<h1>` (모바일 18px → md 24px). |
| 검색바 316×33 흰색 라운드, "캐릭터 이름으로 검색" placeholder, 우측 검색 아이콘 | `max-w-[316px]` + 모바일 풀폭, 높이는 터치 타깃 확보 위해 `h-11`(44px)로 상향. 이름 필터 로컬 동작. |
| `모든대화`(#FF1158 활성) / `즐겨찾기` 탭 18px Bold | `role='tablist'` + `aria-selected`, 로컬 상태 전환. 즐겨찾기 탭은 즐겨찾기 행만 필터. |
| 채팅 행: 아바타 60px 원형 + 이름(14 Bold) + 미리보기(#BAAAD5) + 즐겨찾기/휴지통 아이콘 | 더미 8건. 즐겨찾기 토글(핑크 전환)·삭제(행 제거) 로컬 동작. 빈 목록 문구 제공. |
| 배경 #1F1F1F + 핑크 블러 글로우 2개 (blur 55.75px) | `blur-[56px]` 장식 블롭 2개(`aria-hidden`, `pointer-events-none`). |

## 변경 파일
- `app/(routes)/demo/chats/page.tsx` (신규, 267줄) — 데모 채팅 목록 페이지 전체
  - `page.tsx:17-24` — Figma 색 상수(`C`): `#1F1F1F` 배경 / `#FF0750` 액센트 / `#FF1158` 탭 활성 / `#B1B1B1` 비활성 네비 / `#BAAAD5` 미리보기 텍스트
  - `page.tsx:43-62` — `MaskIcon`(CSS mask + currentColor, 홈 데모와 동일 패턴)
  - `page.tsx:78-92` — 탭/검색 필터링·즐겨찾기 토글·삭제 핸들러(로컬 상태)
  - `page.tsx:100-109` — 배경 블러 글로우
  - `page.tsx:112-135` — 데스크톱 좌측 사이드바
  - `page.tsx:146-160` — 검색바
  - `page.tsx:163-180` — 모든대화/즐겨찾기 탭
  - `page.tsx:183-240` — 채팅 리스트(아바타·이름·미리보기·액션 버튼) + 빈 상태
  - `page.tsx:244-265` — 모바일 하단 탭바
- `public/images/demo/chats/favorite.svg` · `trash.svg` · `search.svg` (신규) — Figma 다운로드 아이콘. 네비 아이콘은 기존 `public/images/demo/nav/` 재사용.

## 반응형 / 웹뷰 점검
- **리스트 레이아웃**: 행 기반 flex, 본문 `min-w-0 flex-1` + `line-clamp-2`로 가로 스크롤 차단. 메인 컬럼 `max-w-3xl`(데스크톱 시안의 리스트 폭 대응).
- **네비 전환**: `md` 경계에서 좌측 사이드바 ↔ 하단 탭바 전환(홈 데모와 동일).
- **뷰포트**: 루트 `min-h-[100dvh]`, 사이드바 `h-[100dvh] sticky`. 글로우 블롭은 `overflow-hidden` 루트 내부라 스크롤 유발 없음.
- **터치 타깃**: 즐겨찾기/삭제 버튼 `h-11 w-11`(44px), 탭 `min-h-[44px]`, 검색 입력 `h-11`(시안 33px에서 상향), 하단 탭 `min-h-[44px]`.
- **hover 비의존**: hover는 배경 강조만. 즐겨찾기/삭제 버튼은 항상 노출(터치 환경 고려).
- **입력**: 검색 `type='search'` + `inputmode='search'`.
- **미디어**: 아바타 `next/image` + `sizes='60px'`, 모바일 52px → md 60px.
- **접근성**: 탭 `role='tablist'`/`aria-selected`, 즐겨찾기 `aria-pressed` + 상태별 `aria-label`, 삭제 `aria-label`, 장식 요소 `aria-hidden`, 네비 `aria-current`.
- 검증 폭 360 / 768 / 1280px 기준 레이아웃 깨짐·가로 스크롤 없음(구조 검토 기준).

## 검증 결과
- `npx biome check --write` 통과(자동 포맷 1건 적용).
- `npx tsc --noEmit` — 에러 없음.
- dev 런타임: `GET /demo/chats 200` (실행 중인 dev 서버에서 렌더 확인).

## 계획과 달라진 점 / 데모 한정 사항
- **계획 문서 없음**: 선행 데모와 같은 미리보기 목적의 프로토타입이라 `docs/plan/` 없이 진행(사용자 직접 지시). 정식 반영 시 planner 계획 + publisher/writer 파일 분리 필요.
- **색 하드코딩**: Figma 색을 `C` 상수/arbitrary 값으로 직접 사용. 정식 반영 시 `tailwind.config.ts` 토큰 매핑(별건, cross-cutting).
- **시안 보정**: 검색바 높이 33px→44px(터치 타깃), 미리보기 텍스트 크기 시안 내 16px/12px 혼재 → 12px(md 14px)로 통일, 첫 행만 즐겨찾기 핑크인 시안 → 토글 상태로 일반화.
- **데이터 미연결**: 목록·검색·탭·즐겨찾기·삭제 모두 로컬 상태. 실제 채팅방 목록(Nakama/`chatApi`)·라우팅 연결은 writer 담당.

## 후속 필요 (정식 퍼블리싱 시)
1. planner 계획 수립(담당 배정: 표시용 `*View` ↔ 컨테이너 분리) 후 정식 구현.
2. 실제 채팅방 목록 데이터 연결(즐겨찾기/삭제 API, 검색 debounce) — writer.
3. 삭제는 파괴적 액션이므로 확인 모달 연결 검토(기존 `components/modal` 관행 따름).
4. 색 토큰 갱신·전역 사이드바 교체는 홈 데모 후속과 공통 별건.
5. 데모 라우트(`/demo/chats`)는 정식 반영 후 제거 여부 결정.
