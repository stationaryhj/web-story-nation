---
name: component
description: >-
  StoryNation 컨벤션에 맞는 React 컴포넌트 또는 모달을 생성한다.
  배치 위치(FSD `src/shared/ui` vs 레거시 `components/`), PascalCase 파일명, props 타입,
  Tailwind semantic 토큰, 접근성을 규칙대로 적용한다.
  "컴포넌트 만들어줘 / 모달 만들어줘 / create component|modal" 요청 시 사용한다.
---

# 컴포넌트 / 모달 생성

이 프로젝트 컨벤션에 맞는 컴포넌트를 만든다. 새 코드는 가능하면 **FSD(`src/shared/ui`)** 를 우선한다.

## 1. 배치 위치 결정 (먼저 판단)
- **재사용 공용 UI (버튼/입력/카드/모달 등)** → `src/shared/ui/<카테고리>/` (신규 우선). 예: `src/shared/ui/modal/`, `src/shared/ui/form/`.
- **특정 피처 전용** → 해당 피처 슬라이스 `src/features/<name>/ui/` (fsd-feature skill 참고).
- **레거시와 강하게 얽힌 경우에만** 기존 위치(`components/elements/`, `components/modal/`, `components/form/`)에 둔다.
- ⚠️ 중복 레이어(`components/modal` ↔ `src/shared/ui/modal`)가 있으니, 어디에 둘지 사용자에게 확인하거나 근처 사용처를 보고 한쪽으로 정한다.

## 2. 파일/네이밍 규칙
- 컴포넌트 파일: **PascalCase.tsx** (`ChatItem.tsx`).
- props 타입: `interface <Name>Props`. 타입은 `interface` 선호, `enum` 지양.
- export: 프로젝트에 `export default` + 배럴 재노출과 named export가 혼재한다. **주변 디렉토리의 관행을 따른다** (예: `src/shared/ui`는 배럴 `index.ts`가 있으면 그 방식대로).
- 핸들러 `handle*`, boolean prop `is/has*`.

## 3. 구현 규칙
- **'use client'** 는 상호작용/훅/브라우저 API가 필요할 때만 추가한다. 순수 표시용이면 서버 컴포넌트로 둔다.
- **스타일**: Tailwind. 하드코딩 HEX 금지, **semantic/토큰 클래스 사용**. 다크모드는 `class` 전략(색상은 CSS 변수 토큰으로 자동 스왑되게 — 진행 중인 테마 토큰화 계획을 따른다). 클래스 병합이 필요하면 `src/shared/lib/utils/cn.ts`의 `cn()` 사용.
- **반응형 (⚠️ 필수)**: 모바일 퍼스트로 작성하고 모바일 웹·웹뷰에서 정상 동작해야 한다. 고정 px 폭/높이 지양(`w-full`·`max-w-*`·flex/grid), `sm→md→lg` 확장, 탭 대상 ≥44px, `hover` 전용 인터랙션 금지, 높이는 `100dvh`. 360/768/1280px에서 깨짐·가로 스크롤 없어야 함. 자세한 규칙은 `CLAUDE.md`의 "반응형 / 모바일·웹뷰" 참고.
- **접근성**: 의미 있는 요소, `aria-*`, 키보드 조작, 이미지 `alt`. 클릭 가능한 것은 `button`.
- **이미지**: `next/image` 사용.
- Biome: single quote, jsx single quote, 2-space, 최대 100자, 세미콜론 필수, `trailingCommas: es5`.

## 4. 모달을 만들 때 (추가)
- 기존 모달 기반 컴포넌트(`components/modal/BaseModal.tsx`, `src/shared/ui/modal/*`)와 모달 호스팅 방식(`GlobalModalHost`, `useModalStore`/`useNewModalStore`)을 먼저 확인해 **같은 패턴으로** 만든다. 새 오버레이/포털을 임의로 만들지 않는다.
- 열림/닫힘 상태, ESC/백드롭 클릭 닫기, 포커스 트랩, `overlay` 토큰 백드롭을 기존 모달과 일관되게 처리한다.
- 전역 모달이면 모달 스토어/`ModalType`에 등록하는 흐름을 따른다.

## 5. 템플릿 (기본 컴포넌트)

```tsx
interface <Name>Props {
  // ...
}

export default function <Name>({ ...props }: <Name>Props) {
  return <div className='...'>{/* ... */}</div>
}
```

## 완료 후
- 생성 위치와 이유, props 계약을 설명한다.
- 배럴(`index.ts`) 갱신이 필요하면 함께 처리한다.
- `npx tsc --noEmit` 로 타입 확인, 사용 예시를 간단히 제시한다.
</content>
