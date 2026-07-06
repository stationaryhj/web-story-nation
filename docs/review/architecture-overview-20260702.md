# StoryNation 프론트엔드 — 전체 구조 리뷰

- **리뷰 일자**: 2026-07-02
- **대상 브랜치 / 커밋**: `red-main` / `531dc93` (2026-07-01)
- **리뷰 범위**: 프로젝트 전체 아키텍처 및 동작 구조 (특정 diff 아님)
- **스택**: Next.js 16 (App Router) · React 19 · TypeScript(strict) · Tailwind 3 · Zustand · TanStack Query · Axios · Firebase · Nakama

---

## 한눈에 보는 정체성

**StoryNation은 AI 캐릭터 채팅 플랫폼**이다. 사용자가 캐릭터를 만들고(작가), 다른 캐릭터와 실시간으로 대화하며(호감도 시스템), 재화(펜/코인)를 결제로 충전하는 서비스다. 소셜 로그인, 실시간 채팅(Nakama), 결제(TossPayments), 성인 콘텐츠 모드가 핵심 축이다.

---

## 1. 앱 진입 & 렌더링 흐름

```
RootLayout (app/layout.tsx)          ← 폰트/테마/뷰포트, ToastPortal, MobileGNB, 플로팅 버튼
  └─ Providers (app/providers.tsx)   ← 'use client' 경계
      └─ QueryClientProvider
          └─ Suspense(SearchParamsHandler)
              └─ GlobalModalHost + SkeletonThemeProvider
                  └─ InitDataLoader   ← coinList 등 초기 데이터 프리페치 + Zustand 하이드레이션
                      └─ AnimatePresence → {페이지} + ModalManager
      + NoticeModal(공지) + CharactorOpenModal(캐릭터 링크)
```

- `app/layout.tsx` 서버 셸 → `app/providers.tsx` 클라이언트 프로바이더 스택 → `app/providers/InitDataLoader.tsx` 초기 로딩
- `app/api/` **라우트 핸들러 없음** — 모든 API는 외부 백엔드(storynation) 직접 호출

## 2. 라우팅 (app/(routes))

| 도메인 | 역할 |
|---|---|
| `main`(=`app/page.tsx`) | 홈 — 추천/랭킹/최신 캐릭터 그리드 |
| `chat/[id]` · `chat-list` | 캐릭터 채팅방(Nakama 소켓) · 채팅 목록 |
| `my-characters` (`create`, `edit/[id]`) | 내 캐릭터 관리/생성/편집 |
| `author/[id]` · `my-profile` · `my-account` | 작가/프로필/계정 |
| `login`(`signup`) · `callback` · `guest` · `simple-login` | 인증/OAuth 콜백/게스트 |
| `shop-recharge` · `payment`(`success`/`fail`) · `pass` | 재화 충전 / 결제 / 패스 |
| `search` · `settings` · `terms` · `live` | 검색 / 설정 / 약관 / 라이브 |

## 3. 상태 & 데이터 3계층

```
UI → Zustand(로컬+localStorage 영속) / TanStack Query(서버상태 캐시) → Axios(4개 API 객체) → Backend
                                                            └ Nakama WebSocket(실시간 채팅)
```

- **Zustand** (`store/`): `useAccountStore`(인증/유저/코인), `useChatStore`(채팅방/호감도), `useMainStoreData`(홈 데이터), `useSearchStore`, `useStoreSettings`(성인모드) 등 17개
- **API 레이어** (`services/api/storyNationApi.ts`): `contentApi`·`chatApi`·`settlementApi`·`createApi` 4개 축 + `setAuthToken()`로 Bearer 주입
- **데이터 페칭**: ①스토어 내부 `queryClient.fetchQuery` ②커스텀 훅 `useQuery` 래퍼(`services/hooks/DataListManager.ts`, `src/shared/api/queries/`) — 두 방식 혼재
- **인증** (`services/auth/`): `AuthManager` 싱글톤 — Naver/Kakao/Google/Apple OAuth → `login2()` → localStorage `authorization`에 토큰 저장
- **실시간** (`app/providers/NakamaProviders.tsx`): Nakama 클라이언트/세션/소켓으로 채팅방 입장·메시지 송수신
- **오프라인 캐시** (`services/indexedDB.ts`): 채팅 메시지 IndexedDB 저장

## 4. 외부 통합 현황

| 통합 | 상태 | 위치 |
|---|---|---|
| TossPayments | ✅ 활성 | `components/modal/PaymentModal.tsx`, 코인/펜 결제 |
| Firebase | ✅ 활성 | `app/firebase.ts` — Auth + Analytics (FCM 푸시는 미확인) |
| crypto-js | ✅ 활성 | `lib/utils/cryptoUtil.ts` — AES 암복호화 |
| idb / Nakama | ✅ 활성 | 채팅 캐시 / 실시간 |
| Figma API | ✅ 빌드툴 | `lib/utils/figma.ts` — `npm run figma`로 디자인 문서 생성 |
| **Web3 / MetaMask** | ⚠️ **미사용** | `web3`·`@metamask/sdk` 설치됐으나 실사용 없음, `services/contract/abi/`는 데드코드 |
| **i18next** | ⚠️ **미완성** | 유틸(`lib/utils/languageUtil.ts`)만 존재, 초기화 미구현 |

## 5. 아키텍처 상태: FSD 이행 "초기 단계"

가장 중요한 구조적 특징. **FSD(Feature-Sliced Design)로 이행 중이지만 레거시와 이중 구조로 공존**한다.

- **신규(FSD)**: `src/features/edit-character/`만 `api/lib/model/ui` 패턴 완성. `src/shared/`에 공용 axios 인스턴스·모달·폼·아이콘 정비 중
- **레거시(다수)**: 최상위 `views/`(전체 페이지 구현), `components/`(모달 27·요소 35·폼 14), `store/`, `services/`
- **중복 지점**: `components/modal/` ↔ `src/shared/ui/modal/`, `components/form/` ↔ `src/shared/ui/form/`, API 레이어가 `services/api` ↔ `src/shared/api`로 분산

---

## ⚠️ 주요 리스크 (심각도순)

### 🔴 Critical

1. **하드코딩된 암호화 키** — `lib/utils/cryptoUtil.ts`에 AES 키(`12345...`)가 소스에 노출. 클라이언트 번들에 그대로 실려 사실상 암호화가 무의미하다. **최우선 점검 대상.**
2. **인증 인터셉터 비활성** — `services/api/`의 401 처리 인터셉터가 주석 처리됨. 토큰 만료 시 자동 처리 흐름 부재.

### 🟡 Warning

3. **토큰을 localStorage 평문 저장** — XSS 발생 시 토큰 탈취 위험.
4. **이중 아키텍처** — FSD/레거시 혼재로 "어디에 코드를 둘지" 규칙이 흐려짐. 마이그레이션 순서·기준 정의 필요.

### 🔵 Suggestion

5. **미사용 의존성** — web3/metamask/i18next가 설치만 됨 → 번들 크기·혼란 유발. 정리 또는 완성 결정 필요.
6. **거대 파일** — `views/chat/detail.tsx`(1600+줄), `views/settings/home.tsx`(~31KB) 분해 여지.

---

## 데이터 흐름 요약

```
UI Component
  ↓
useAccountStore / useMainStoreData / custom hooks
  ↓
TanStack Query (queryClient.fetchQuery / useQuery)
  ↓
Axios Instance (contentApi · chatApi · settlementApi · createApi)
  ↓
setAuthToken() → Authorization: Bearer <token> 자동 첨부
  ↓
Backend API  (+ Nakama WebSocket = 실시간 채팅)
```
