# CLAUDE.md — StoryNation Front-End

이 파일은 Claude Code가 매 세션 자동으로 읽는 프로젝트 규칙이다. **실제 코드/설정 기준**으로 작성됐으며, 드리프트가 있는 기존 문서(`README.md`, `.cursorrules`)보다 이 파일을 우선한다.

## Cursor 대응

| Claude Code | Cursor |
|-------------|--------|
| `CLAUDE.md` (자동 로드) | `.cursor/rules/*.mdc` (alwaysApply·globs) |
| `.claude/skills/` | `.cursor/skills/` |
| `.claude/agents/` | `.cursor/agents/` |
| — | `AGENTS.md` (에이전트·스킬 워크플로 요약) |

내용 변경 시 `CLAUDE.md`를 먼저 갱신하고, `.cursor/rules/`·`.cursor/skills/`를 동기화한다.

## 프로젝트 정체성
**StoryNation** — AI 캐릭터 채팅 플랫폼. 사용자가 캐릭터를 만들고(작가), 실시간으로 대화하며(호감도 시스템), 재화(펜/코인)를 결제로 충전한다. 소셜 로그인, 실시간 채팅(Nakama), 결제(TossPayments), 성인 콘텐츠 모드가 핵심 축.

## 스택 (실제 버전)
Next.js **16** (App Router) · React **19** · TypeScript(strict) · Tailwind CSS **3** · Zustand · TanStack Query · Axios · react-hook-form · Framer Motion · Firebase · Nakama(`@heroiclabs/nakama-js`) · TossPayments · crypto-js · bignumber.js

> 주의: `README.md`는 Next 15·ESLint/Prettier·yarn으로 적혀 있으나 **실제는 Next 16·Biome·npm**이다(레거시 문서 드리프트). 린터는 **Biome**가 정본이다(`eslint-*` 의존성이 남아 있으나 스크립트는 Biome 사용).

## 명령어 (npm)
```bash
npm run dev        # next dev --turbo
npm run build      # next build
npm run start
npm run lint       # biome lint .
npm run lint:fix   # biome lint --write .
npm run format     # biome format --write .
npm run check      # biome check --write . (lint+format+import 정리)
npx tsc --noEmit   # 타입 체크
```
- 패키지 매니저는 **npm**(package-lock.json 기반). yarn 사용 금지.

## 아키텍처 — FSD ↔ 레거시 이중 구조
FSD(Feature-Sliced Design)로 이행 중이며 레거시와 공존한다.
- **신규 코드는 `src/` FSD 구조 우선**: `src/features/`, `src/entities/`, `src/shared/`, `src/widgets/`. 완성 레퍼런스: `src/features/edit-character/`(`api/lib/model/ui` + `index.ts` 배럴).
- **레거시(다수)**: 루트 `views/`(페이지 구현), `components/`(modal·elements·form), `store/`, `services/`.
- **중복 레이어 주의**: `components/modal` ↔ `src/shared/ui/modal`, `components/form` ↔ `src/shared/ui/form`, API가 `services/api` ↔ `src/shared/api`로 분산. **작업 시 한쪽을 정해 일관되게** 하고, 애매하면 근처 사용처를 따르거나 사용자에게 확인한다.
- **레이어 의존 방향**: `features → entities → shared`. 하위가 상위를 참조하면 위반. 슬라이스 외부에서는 배럴(`@/features/<name>`)로만 import.

### 경로 별칭 (tsconfig)
- `@/*` → **프로젝트 루트** (`@/components`, `@/store`, `@/services`, `@/views`, `@/lib`, `@/types`)
- `@/features/*` → `src/features/*` · `@/entities/*` → `src/entities/*` · `@/shared/*` → `src/shared/*` · `@/widgets/*` → `src/widgets/*`

## 코드 컨벤션
- **파일명**: 컴포넌트는 **PascalCase**(`ChatList.tsx`), 그 외는 **camelCase**(`chatList.ts`). 디렉토리는 소문자-대시(`edit-character`).
- **타입**: `interface` 선호, `enum` 지양(const map + `satisfies`). props 타입은 `<Name>Props`.
- **export**: named export 선호. ui 컴포넌트는 `export default` + 배럴 재노출도 혼재 → **주변 관행을 따른다**.
- **네이밍**: 이벤트 핸들러 `handle*`, boolean `is/has*`.
- **Biome 포맷**: single quote(jsx도), 2-space, 최대 100자, **세미콜론 필수**, `trailingCommas: es5`, import 자동 정렬. `noExplicitAny`는 off이나 남용 자제.

## React 19 / App Router
- 불필요한 `'use client'` 남발 금지 — 서버 컴포넌트 우선, 클라이언트 경계 최소화.
- `useEffect` 의존성/cleanup 정확히. App Router 비동기 API(`cookies()`, `headers()`, `params`, `searchParams`)는 `await`.
- 이미지는 `next/image`.

## 상태 / 데이터
- **Zustand**(`store/`): 로컬/영속 상태(인증·유저·코인·채팅방·성인모드 등). persist는 `theme-storage` 등 localStorage.
- **TanStack Query**: 서버 상태 캐시. **서버 상태를 store에 중복 저장하지 않는다.**
- **데이터 페칭은 axios** (`services/api/storyNationApi.ts`의 `contentApi`·`chatApi`·`settlementApi`·`createApi` + `setAuthToken()`).
- 페칭 방식이 스토어 내부 `queryClient.fetchQuery`와 커스텀 훅으로 혼재함 — 새 코드는 훅 방식 지향.

## 스타일 / 테마
- Tailwind, 모바일 퍼스트. **하드코딩 HEX 지양**, `tailwind.config.ts` 토큰/semantic 클래스 사용.
- 다크모드는 **`class` 전략**(`<html class="dark">`). 색 토큰화(CSS 변수 semantic 토큰) 작업이 진행 중 — 관련 작업은 `docs/plan/`의 테마 계획을 따른다.
- 클래스 병합은 `src/shared/lib/utils/cn.ts`의 `cn()`.

## 보안 (⚠️ 결제·암호화·인증 취급)
- 개인키·시드·토큰·API 키를 **클라이언트에 노출/하드코딩 금지**. `NEXT_PUBLIC_` 오노출 주의.
- TossPayments·crypto-js·인증 토큰 관련 코드는 로직·토큰 흐름을 함부로 바꾸지 않는다.
- 금액·수량 계산은 부동소수 오차 회피 위해 **bignumber.js** 사용.
- 알려진 리스크: `lib/utils/cryptoUtil.ts` 하드코딩 AES 키, 401 인터셉터 비활성, 토큰 localStorage 평문 저장(작업 중 마주치면 주의).

## 워크플로 (에이전트 · 문서)
이 프로젝트는 전용 서브에이전트 3종으로 작업한다:
- 🟠 **code-planner**(opus) — 구현 전 계획 수립 → `docs/plan/plan-<날짜>-<대상>.md` 저장.
- 🟢 **code-writer**(sonnet) — 계획을 근거로 구현 → `docs/write/write-<날짜>-<대상>.md` 저장. 계획 범위·"범위 밖"을 준수.
- 🔵 **code-reviewer**(sonnet) — 변경 리뷰 → `docs/review/review-<날짜>-<대상>.md` 저장.

권장 흐름: **비자명한 작업은 plan → build → review** 순. 산출물은 `docs/plan/`·`docs/write/`·`docs/review/`에 남긴다.

## 소통 규칙
- **한국어**로 응답. 긴 응답은 요약을 먼저.
- 성능 개선 제안 시 **before/after** 코드를 함께.
- 기존 프로젝트 구조/스타일을 최우선으로 따른다.
- 커밋은 사용자가 명시적으로 요청할 때만.
</content>
