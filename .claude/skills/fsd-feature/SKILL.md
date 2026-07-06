---
name: fsd-feature
description: >-
  StoryNation의 FSD(Feature-Sliced Design) 피처 슬라이스를 규칙에 맞게 스캐폴딩한다.
  `src/features/<name>/{api,lib,model,ui}` + public API 배럴(`index.ts`)을 생성한다.
  "새 피처 만들어줘 / FSD 슬라이스 스캐폴딩 / feature 추가" 요청 시, 또는 신규 기능을
  레거시(components/·views/·store/)가 아닌 FSD 구조로 시작할 때 사용한다.
---

# FSD 피처 슬라이스 스캐폴딩

StoryNation은 FSD로 이행 중이다. 신규 기능은 **최상위 레거시 폴더가 아니라 `src/features/`** 에 슬라이스로 만든다. 기준 레퍼런스는 이미 완성된 `src/features/edit-character/`다.

## 사전 확인
1. 피처 이름을 **소문자-대시(kebab-case)** 로 정한다 (예: `edit-character`, `chat-room`, `shop-recharge`).
2. `src/features/<name>/`가 이미 있는지 Glob으로 확인한다. 있으면 덮어쓰지 말고 사용자에게 알린다.
3. 이 피처가 실제로 features 레이어에 맞는지 판단한다 (재사용 UI/유틸이면 `shared`, 도메인 엔티티면 `entities`, 페이지 조합이면 `widgets`가 맞을 수 있다).

## 생성할 구조

```
src/features/<name>/
├── api/        # 이 피처 전용 서버 통신 (axios 호출, TanStack Query 훅). 필요할 때만
├── lib/        # 순수 유틸/검증/변환 (부수효과 없는 함수). 필요할 때만
├── model/      # 상태·타입·비즈니스 로직 (Zustand store, 타입, 도메인 훅)
├── ui/         # 이 피처의 컴포넌트
└── index.ts    # public API 배럴 — 외부는 반드시 이 파일을 통해서만 import
```

- **모든 하위 폴더를 무조건 만들지 말 것.** 실제로 쓰는 폴더만 생성한다(edit-character도 필요한 것만 둔다). 최소한 `ui/` 또는 `model/` 중 실제 산출물이 있는 폴더 + `index.ts`.

## 레이어 규칙 (반드시 준수)
- **의존 방향**: `features` → `entities` → `shared`. 상위(같은/상위 레이어의 다른 슬라이스)를 참조하지 않는다. `shared`가 `features`를 import하면 위반.
- **캡슐화**: 슬라이스 외부에서는 내부 파일 직접 경로가 아니라 **`@/features/<name>`(배럴)** 로만 import한다. 슬라이스 내부끼리는 상대경로 사용 가능.
- **경로 별칭**: `@/features/*` → `src/features/*`, `@/shared/*` → `src/shared/*`, `@/entities/*`, `@/widgets/*`. 레거시 루트는 `@/*` → 프로젝트 루트(`@/components`, `@/store` 등).

## 네이밍/스타일
- **컴포넌트 파일**: `PascalCase.tsx` (`EditStory.tsx`). **그 외 파일**: `camelCase.ts` (`dmFormValidation.ts`, `characterFormStore.ts`).
- 타입은 `interface` 선호, `enum` 지양(const map). 이벤트 핸들러 `handle*`, boolean `is/has*`.
- Biome: single quote, 2-space, 최대 100자, **세미콜론 필수**.

## public API 배럴 패턴 (`index.ts`)
`edit-character/index.ts`를 그대로 모방한다. 섹션 주석(`// model`, `// lib`, `// ui`)으로 구분하고, 필요한 심볼만 노출한다.

```ts
// model
export { use<Name>Store } from './model/<name>Store'
export type { <Name>FormData } from './model/<name>Types'

// lib
export { validate<Name> } from './lib/<name>Validation'

// ui
export { default as <Name>Panel } from './ui/<Name>Panel'
```

- ui 컴포넌트는 `export default`로 두고 배럴에서 `export { default as X }`로 재노출하는 것이 기존 관행이다(`ui/forms/index.ts` 참고).

## 완료 후
- 생성한 파일 목록과 각 파일의 역할을 알려준다.
- 아직 비어 있는(플레이스홀더) 부분과 다음에 채워야 할 내용을 안내한다.
- `npm run build` 또는 `npx tsc --noEmit`로 타입 오류가 없는지 확인한다.
- 배럴을 통해 실제로 import되는지(사용처 연결) 필요 시 안내한다.
</content>