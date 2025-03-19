# StoryNation Front-End

## 프로젝트 개요

**프로젝트 이름:** StoryNation  
**버전:** 0.1.0  
**개발 환경:**

- Next.js 15.1.5
- React 19.0.0
- TypeScript 5.3.3
- TailwindCSS 3.4.1
- 기타 주요 라이브러리: Zustand, React Query, Axios, Framer Motion, Web3

## 프로젝트 구조

### 페이지 구조

- **CSR**: 클라이언트 측에서 페이지가 렌더링됩니다.
- **SSR**: 서버 측에서 페이지가 렌더링됩니다.
- **SSG**: 정적 페이지로 미리 렌더링됩니다.

### 폴더 구조

```
app/
├── (routes)/
│   ├── my-characters/
│   │   ├── create/
│   │   │   └── page.tsx
│   │   ├── edit/[id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── chat/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── ...
├── api/
│   └── ...
components/
├── ui/
│   ├── features/
│   │   ├── card/
│   │   │   └── Card.tsx
│   │   └── ...
│   └── motion/
│       └── PageTransition.tsx
├── modal/
│   ├── Modal.tsx
│   └── DeleteConfirmModal.tsx
└── layout/
    ├── header.tsx
    └── ...
store/
├── useStoreData.ts
├── useAuthStore.ts
├── useStoreModal.ts
└── ...
```

## ESLint 규칙 및 설정

### 파일 이름 규칙

1. **일반 파일**: 파일 이름은 **대문자로 시작하지 않는다**.
   - 예시:
     - `userProfile.tsx`
     - `loginForm.tsx`
     - `chatList.tsx`
2. **컴포넌트 파일**: 컴포넌트 파일은 **대문자로 시작한다**.
   - 예시:
     - `UserProfile.tsx`
     - `LoginForm.tsx`
     - `ChatList.tsx`

### 네이밍 규칙

#### 1. **인터페이스 (Interface)**

- **파스칼케이스 (PascalCase)** 사용
- 예시:
  - `UserProfile`
  - `LoginFormProps`
  - `ChatMessage`

#### 2. **메서드 (Methods)**

- **카멜케이스 (camelCase)** 또는 **스네이크케이스 (snake_case)** 또는 **어퍼케이스 (UPPERCASE)**를 사용
- 예시:
  - `handleClick()`
  - `getUserData()`
  - `update_profile()`
  - `DELETE_USER_DATA`

#### 3. **함수 (Function)**

- **카멜케이스 (camelCase)** 또는 **파스칼케이스 (PascalCase)** 사용
- 예시:
  - `submitForm()`
  - `toggleModal()`
  - `MyComponent()`

#### 4. **이넘 (Enum)**

- **카멜케이스 (camelCase)**, **파스칼케이스 (PascalCase)**, 또는 **어퍼케이스 (UPPERCASE)** 사용
- 예시:
  - `UserRole`
  - `OrderStatus`
  - `STATUS_PENDING`

#### 5. **클래스 (Class)**

- **파스칼케이스 (PascalCase)** 사용
- 예시:
  - `UserProfile`
  - `LoginModal`
  - `ChatComponent`

#### 6. **임포트 (Import)**

- **카멜케이스 (camelCase)** 또는 **파스칼케이스 (PascalCase)** 사용
- 예시:
  - `import UserProfile from './UserProfile'`
  - `import { useState } from 'react'`
  - `import { getUserData } from './api/user'`

### 컴포넌트 구조

- **공통 컴포넌트**는 `components/ui/` 디렉토리에 보관됩니다.
- **기능별 컴포넌트**는 `components/ui/features/` 아래에 구성됩니다.
- **모달 컴포넌트**는 `components/modal/` 디렉토리에 구성됩니다.
- **기능**은 콜백 함수로 받아서 처리하며, **스타일**은 props로 전달받은 타입에 맞춰 동적으로 변경됩니다.

## Git 관리 및 브랜치 전략

- **브랜치 전략**: `issue`, `branch` 방식으로 관리됩니다.

## GitHub Actions

프로젝트는 GitHub Actions를 사용하여 자동화된 워크플로우를 구현합니다.

### 이슈 기반 브랜치 자동 생성

이슈가 생성되면 자동으로 해당 이슈에 대한 브랜치가 생성됩니다.

- **지원하는 라벨과 브랜치 접두어**:

  - `build`: `build/issue-이슈번호`
  - `documentation`: `docs/issue-이슈번호`
  - `enhancement`: `enhance/issue-이슈번호`
  - `feature`: `feat/issue-이슈번호`
  - `fix`: `fix/issue-이슈번호`
  - `perf`: `perf/issue-이슈번호`
  - `refactor`: `refactor/issue-이슈번호`
  - `revert`: `revert/issue-이슈번호`
  - `style`: `style/issue-이슈번호`
  - `test`: `test/issue-이슈번호`
  - `other`: `issue/issue-이슈번호`

- **제외 대상**:
  - `wontfix`, `invalid`, `duplicate`, `question` 라벨이 있는 이슈는 브랜치가 생성되지 않습니다.

## 타입스크립트 및 폴더 정리

- **타입 분리**: 페이지별로 타입을 분리하여 관리합니다.
  - 예: `types/main`, `types/chat`, `types/myCharacter` 등
- **타입 및 인터페이스 분리**는 진행하지 않습니다.

## 코드 스타일 가이드

### ESLint & Prettier 적용

프로젝트에 ESLint와 Prettier를 적용하여 코드 스타일을 통일합니다.

- **ESLint**: 코드 품질 및 일관성을 유지하기 위해 사용됩니다.
- **Prettier**: 코드 포맷팅을 자동으로 관리하여 개발자의 생산성을 높입니다.

## 사용되는 도구 및 라이브러리

### 주요 의존성 패키지

```json
{
  "dependencies": {
    "@fortawesome/fontawesome-svg-core": "^6.7.2",
    "@fortawesome/free-solid-svg-icons": "^6.7.2",
    "@fortawesome/react-fontawesome": "^0.2.2",
    "@metamask/sdk": "^0.31.2",
    "@tanstack/react-query": "^5.18.1",
    "axios": "^1.6.7",
    "bignumber.js": "^9.1.2",
    "dotenv": "^16.4.7",
    "framer-motion": "^12.5.0",
    "i18next": "^24.2.1",
    "idb": "^8.0.1",
    "immer": "^10.1.1",
    "next": "15.1.5",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-intersection-observer": "^9.15.0",
    "react-loading-skeleton": "^3.5.0",
    "web3": "^4.16.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.16",
    "@types/react": "19.0.7",
    "@types/react-dom": "19.0.3",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "prettier": "^3.2.5",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```
