# StoryNation — Agent 워크플로우

이 프로젝트는 Cursor 서브에이전트 3종 + 프로젝트 스킬로 **계획 → 구현 → 리뷰** 파이프라인을 운영합니다.

## 프로젝트 규칙 & 스킬

| 종류 | 경로 | 설명 |
|------|------|------|
| 정본 문서 | `CLAUDE.md` | 스택·아키텍처·컨벤션 (실제 코드 기준) |
| Cursor 규칙 | `.cursor/rules/*.mdc` | `CLAUDE.md`를 Cursor Rules 형식으로 분할 |
| Cursor 스킬 | `.cursor/skills/<name>/SKILL.md` | FSD 스캐폴딩·컴포넌트 생성 등 특화 워크플로 |
| Claude Code 호환 | `.claude/skills/`, `.claude/agents/` | 동일 내용의 Claude Code용 복제본 |

### 스킬 목록 (`.cursor/skills/`)

| 스킬 | 용도 |
|------|------|
| `fsd-feature` | `src/features/<name>/` FSD 슬라이스 스캐폴딩 |
| `component` | React 컴포넌트·모달 생성 (배치·토큰·a11y) |

## 서브에이전트 (.cursor/agents/)

| 에이전트 | 역할 | 호출 예시 |
|----------|------|-----------|
| `code-planner` | 요구사항 분석, 영향 범위 파악, 단계별 실행 계획 수립 | `/code-planner 다크모드 semantic 토큰 계획 세워줘` |
| `code-writer` | `docs/plan/` 계획에 따라 실제 코드 구현 | `/code-writer plan-20260706-theming-semantic-tokens.md 구현해줘` |
| `code-reviewer` | 변경 diff 기준 코드 리뷰 (컨벤션·보안·성능·a11y) | `/code-reviewer 작업 트리 변경분 리뷰해줘` |

## 권장 작업 순서

```
요구사항 → code-planner → docs/plan/ 저장
         → code-writer  → 코드 구현
         → code-reviewer → docs/review/ 저장
```

- **자명한 소규모 수정**(오타, 단일 prop 변경 등)은 메인 Agent가 직접 처리해도 됩니다.
- **비자명한 기능·리팩터·마이그레이션**은 `code-planner`로 계획을 먼저 확정합니다.
- `code-writer`는 계획 없이 임의 구현하지 않습니다. 계획이 없으면 `code-planner`를 먼저 호출합니다.

## 산출물 경로

| 단계 | 저장 위치 | 파일명 패턴 |
|------|-----------|-------------|
| 계획 | `docs/plan/` | `plan-<YYYYMMDD>-<slug>.md` |
| 리뷰 | `docs/review/` | `review-<YYYYMMDD>-<slug>.md` |

## 모델 설정

| 에이전트 | 모델 | 설명 |
|----------|------|------|
| `code-planner` | `claude-opus-4-8-thinking-high` | 계획 수립용 고정 (Opus) |
| `code-writer` | 자동 (inherit) | 부모 Agent 모델 따름 |
| `code-reviewer` | 자동 (inherit) | 부모 Agent 모델 따름 |

## 스택 & 컨벤션 요약

- Next.js 16 (App Router) · React 19 · TypeScript(strict) · Tailwind CSS 3
- Zustand + TanStack Query · axios · Biome
- FSD 이행 중 (`src/features`, `entities`, `shared`, `widgets`)
- 패키지 매니저: **npm** (`npm run build`, `npm run lint`, `npm run check`)

## Claude Code 호환

`.claude/agents/`·`.claude/skills/`에 동일 정의가 있습니다. **Cursor는 `.cursor/`를 우선** 사용합니다.
Claude Code 전용 필드(`tools:`, `color:`)는 Cursor에서 무시됩니다.
`CLAUDE.md`는 Claude Code가 자동 로드하며, Cursor는 `.cursor/rules/`가 동등 역할을 합니다.
