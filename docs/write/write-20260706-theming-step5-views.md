# StoryNation — 테마 semantic 토큰화 구현 결과 (5단계: 레거시 views/* & 시각 비중 큰 페이지)

- **작성 일자**: 2026-07-06
- **근거 계획**: `docs/plan/plan-20260706-theming-semantic-tokens-v2.md` (5단계)
- **선행 구현**: `docs/write/write-20260706-theming-semantic-tokens-v2.md`(1·2·3·7단계), `docs/write/write-20260706-theming-step4-shared-ui.md`(4단계) — 매핑·문맥 판단 관행을 그대로 계승
- **구현 범위**: 계획 **5단계 — `views/*` 전 페이지(19개 파일) + `app/(routes)/payment/*`(4개 파일)**, 총 23개 파일
- **검증**: `npx tsc --noEmit` ✅ · `npm run build` ✅ (24 라우트) · `npx biome check --write views "app/(routes)/payment"` 포맷 정리 완료

---

## 구현 요약

계획 1~4단계에서 구축된 semantic 토큰(`surface`/`surface-elevated`/`surface-elevated-hover`/`surface-sunken`/`border-default`/`brand`/`brand-hover`/`danger`/`overlay`/`text-primary`/`text-muted`/`text-inverse`)을 기준으로, `views/*` 전 페이지(19개)와 `app/(routes)/payment/*`(4개, 결제 페이지)의 하드코딩 색상 유틸(`bg-white`, `text-gray-*`, `bg-gray-*`, `border-gray-*`, `primary-*`, `secondary-*`, 임의 HEX 등)과 색상용 `dark:` 접두 유틸을 semantic 클래스로 치환했다. 결제 페이지는 **className만** 교체했고 결제 로직·TossPayments 토큰 흐름·상태는 전혀 건드리지 않았다. `views/chat/detail.tsx`(1640줄)는 채팅 버블 배경/텍스트 대비를 특히 신경 써서 별도로 전 구간을 검토·치환했다.

---

## 처리 파일 / 주요 변경 내역

### 리뷰 취약 페이지 (우선 처리)
- `views/main/home.tsx:72` — 페이지 셸 `bg-white dark:bg-dark-background-light` → `bg-surface`
- `views/my-characters/home.tsx:108-125` — 제목 `text-secondary-900 dark:...` → `text-text-primary`, 캐릭터 생성 CTA `bg-primary-500 dark:...` → `bg-brand hover:bg-brand-hover text-text-inverse`
- `views/search/home.tsx:207-249` — 검색 결과 헤더/카운트 `text-gray-700/500` → `text-text-primary`/`text-text-muted`, 검색어 하이라이트 `text-primary-600` → `text-brand`, 로딩 스피너·CTA 버튼 `border/bg-primary-500` → `border/bg-brand`

### 결제 (`app/(routes)/payment/*`, 4개 파일) — **className만 변경, 로직/토큰 흐름 불변**
- `app/(routes)/payment/page.tsx:41-77` — 테스트 결제 카드 `bg-white`→`bg-surface-elevated`, 텍스트 `text-secondary-600`→`text-text-muted`, CTA `bg-blue-500 text-white`→`bg-brand text-text-inverse`(**확인 필요**: 계획 매핑 표에 명시되지 않은 blue→brand 통일, step4의 `PaymentModal.tsx` CTA 처리와 동일 원칙 적용). 정보 박스 `bg-blue-50 dark:bg-blue-900/20`는 브랜드와 무관한 정보색으로 판단해 **의도적으로 유지**(step4 `PaymentModal.tsx` 선례와 동일)
- `app/(routes)/payment/page-origin.tsx:76-95` — 동일 원칙(테스트 토스 결제 페이지) 적용, `bg-white`→`bg-surface-elevated`, `bg-blue-500`→`bg-brand`
- `app/(routes)/payment/fail/page.tsx:50-108` — 실패 카드 `bg-white`→`bg-surface-elevated`, 에러 아이콘/타이틀 `text-red-*`→`text-danger`, 보조 텍스트 `text-secondary-*`→`text-text-muted`, "홈으로" 아웃라인 버튼 `border-secondary-300`→`border-border-default`, "다시 시도" CTA `bg-blue-500`→`bg-brand`. `bg-red-100 dark:bg-red-900/20` 아이콘 배경은 상태색으로 판단해 유지
- `app/(routes)/payment/success/page.tsx:96-186` — 동일 원칙. 성공/실패 분기 카드 `bg-white`→`bg-surface-elevated`, 상세정보 라벨/값 `text-secondary-*`→`text-text-muted`/`text-text-primary`, CTA `bg-blue-500`→`bg-brand`. **성공 상태의 `bg-green-100`/`text-green-600`은 대응 semantic 토큰이 없어 의도적으로 유지**(실패 상태 `bg-red-100`/아이콘만 `text-danger`로 통일, 라벨 텍스트는 유지)

### `views/chat/detail.tsx` (1640줄, 단독 배치 — 채팅 버블 대비 집중)
- `950-1108` 헤더/사이드바 크롬 — 페이지 배경 `bg-gray-50`→`bg-surface`, 헤더 `bg-white`/`border-gray-200`→`bg-surface-elevated`/`border-border-default`, 뒤로가기·더보기 버튼 `text-gray-600/700`→`text-text-muted`, 캐릭터 이름/해시태그 `text-gray-800/500`→`text-text-primary`/`text-text-muted`, 정보 아이콘 `text-violet-500`→`text-brand`(파일 전체에서 violet 계열을 brand와 동일 취급 — 새로고침/모드선택 버튼과 일관), 유료 펜 아이콘 `bg-primary-200 text-blue-600`→`bg-brand/10 text-brand`, 새로고침/삭제 버튼 `bg-blue-50`/`bg-red-50`→`bg-brand/10`/`bg-danger/10`
- `1110-1243` 더보기 사이드바 — 채팅모드 선택 카드 활성/비활성 `border-primary-500 bg-primary-50` / `border-gray-200 hover:bg-gray-50`→`border-brand bg-brand/10` / `border-border-default hover:bg-surface-elevated-hover`, 배경 토글 스위치 `bg-primary-500`/`bg-gray-200`→`bg-brand`/`bg-surface-elevated-hover`, "채팅방 나가기" 버튼 `bg-red-50 text-red-600`→`bg-danger/10 text-danger`
- `1268-1319` 캐릭터 이미지 오버레이(호감도 배지·갤러리·저장 버튼·그라데이션) — `bg-black/*`→`bg-overlay/*`, `text-white`→`text-text-inverse`(딥 이미지 오버레이 위 문맥으로 판단), 상단 그라데이션 틴트 `from-violet-500/20`→`from-brand/20`
- `1355-1408` 연결 상태 배너 — **연결 끊김(오류) 배너만** `bg-red-50`/`text-red-700`/`bg-red-100`→`bg-danger/10`/`text-danger`/`bg-danger/20`로 통일(진짜 에러 상태). **"연결 중"(yellow)/"연결됨"(green) 배너는 매핑 표에 없는 다색 상태 배지라 의도적으로 유지**(4단계 `NotificationSidebar` 선례와 동일 원칙)
- **`1444-1462` 채팅 버블 (핵심)**:
  - 내 메시지(user): `bg-primary-500 text-white` → `bg-brand text-text-inverse`, 타임스탬프 `text-white/80` → `text-text-inverse/80`
  - 상대 메시지(character): `bg-white text-gray-800 border border-gray-100` → `bg-surface-elevated text-text-primary border border-border-default`, 타임스탬프 `text-gray-500` → `text-text-muted`
  - 상황 설명(`*...*`) 이탤릭 텍스트: 기존 고정 `text-gray-400`는 브랜드색 버블(사용자)과 표면색 버블(캐릭터) 양쪽에 모두 쓰이므로 고정 회색 대신 **`text-current/60`**(부모 버블의 텍스트 색을 60% 불투명도로 사용)으로 변경 — 두 버블 모두에서 자동으로 적절한 대비 확보
  - AI 응답 새로고침/삭제 버튼: `bg-violet-50 text-violet-500`/`bg-red-50 text-red-500` → `bg-brand/10 text-brand`/`bg-danger/10 text-danger`
- `1495-1546` 메시지 입력창 — `bg-white`/`border-gray-200`→`bg-surface-elevated`/`border-border-default`, 인풋 `bg-gray-100 text-gray-800`→`bg-surface-elevated-hover text-text-primary`, 대기 인디케이터 점 `bg-violet-500`→`bg-brand`
- `1564-1607` 모바일 이미지 모달 — `bg-black/*`→`bg-overlay/*`, `text-white`→`text-text-inverse`, 저장 버튼 `bg-violet-600`→`bg-brand`
- `confirmButtonClass` 4곳(펜 부족/메세지 삭제/채팅 삭제 x2) — `bg-primary-500.../bg-red-500...`→`bg-brand hover:bg-brand-hover text-text-inverse` / `bg-danger hover:bg-danger/90 text-text-inverse`
- 로딩 스피너·에러 배너 — `border-primary-500`→`border-brand`, `bg-red-50 border-red-200 text-red-600`→`bg-danger/10 border-danger/30 text-danger`

### 그 외 `views/*` 전 페이지
- `views/author/detail.tsx` — 뒤로가기/제목/프로필/캐릭터 목록 전 구간 치환, 에러 배너 `bg-red-100...`→`bg-danger/10 text-danger`(4단계 `CardGrid.tsx` 에러 배너 패턴과 통일). "작가를 찾을 수 없음" `bg-yellow-100` 배너는 대응 토큰 없어 유지
- `views/chat-list/home.tsx` — 카드 셸/탭/검색창/채팅 리스트 항목/페이지네이션 전 구간 치환. **Toast 알림 컴포넌트**(`bg-secondary-800 dark:bg-dark-secondary-900 text-white`, 화면 테마와 무관하게 항상 어두운 스낵바)는 theme-swap 토큰(`surface-elevated` 등)을 쓰면 라이트 모드에서 흰 배경이 되어 의도(항상 어두운 토스트)가 깨지므로, 라이트/다크 공통으로 검정 고정값인 **`bg-overlay/90 text-text-inverse`**로 매핑(**확인 필요**: 계획 매핑 표에 없는 케이스, "항상 어두운 UI 요소"에 대한 판단). 즐겨찾기 별표 `text-yellow-500`은 대응 토큰 없어 유지
- `views/chat/home.tsx` — **전체가 주석 처리된 죽은 코드**라 변경 없음(41건의 `dark:`/하드코딩 잔량은 전부 죽은 코드)
- `views/live/home.tsx` — 라이브 채팅 헤더/입력창/채팅 버블(내 메시지 `bg-primary-500`→`bg-brand`, 상대 메시지 `bg-gray-200`→`bg-surface-elevated`) 전 구간 치환
- `views/login/callback.tsx`, `views/login/home.tsx`, `views/login/signup.tsx` — 에러 배너 `bg-red-50/100`→`bg-danger/10`, CTA `bg-blue-500`→`bg-brand`, 보조 버튼 `bg-gray-500`→`bg-surface border-border-default`(아웃라인 방식으로 전환, BaseButton의 secondary variant 패턴과 통일), 로딩 오버레이 `bg-black bg-opacity-50`→`bg-overlay/50`
- `views/my-account/home.tsx` — "수익 관리" 페이지. 안내 배너/총 수익 강조색이 Tailwind 기본 `violet-*`로 하드코딩돼 있었는데, 그라데이션 버튼 클래스(`from-violet-600 to-fuchsia-600`)가 `BaseButton`의 `gradient` variant(`from-brand to-fuchsia-500`)와 동일 패턴임을 확인하고 **violet 전체를 brand로 매핑**(신뢰도 높음: 페이지 내 일관된 사용). `bg-blue-50` 안내문은 유지
- `views/my-characters/create.tsx`, `views/my-characters/edit.tsx` — 탭 네비게이션/폼 하단 버튼 전 구간 치환. edit.tsx의 "공개 전환 주의" 확인 모달 CTA `confirmButtonClass`도 `bg-danger`로 통일
- `views/my-profile/home.tsx` — my-account와 동일한 구조(구버전 프로필 페이지로 추정). `text-accent-dark border-accent-light`(기존 `accent.dark`=`#FF4242`=danger와 동일 HEX 확인) → `text-danger border-danger/40`
- `views/settings/home.tsx` — my-profile의 최신 버전. 안내 문구 `text-[#ff7f00]`(오렌지, "* 수정 시 100펜 소모")는 브랜드와 무관한 강조색으로 판단해 유지(계획의 오렌지 뱃지 처리 방침과 동일). **"회원탈퇴" 버튼의 `text-border-[#484554]`(존재하지 않는 무효 Tailwind 클래스, 원래도 렌더에 영향 없던 버그)를 `text-text-muted`로 교정** — 색상 매핑 작업 중 확인된 기존 버그이며, 시각적으로는 body 상속색과 동일해 회귀 없음(**확인 필요**: 순수 색상 매핑 범위를 약간 벗어난 typo 수정)
- `views/shop-recharge/home.tsx` — 펜 충전 페이지. 헤더/탭/보유 펜 카드/펜 패키지 카드/사용 내역 테이블 전 구간 치환. **거래 유형 배지(가성비/스토리/짜릿모드 1·2, blue/green/purple/red)와 증감액 색(+  green/− red)은 브랜드와 무관한 다색 상태 정보라 유지**, 단 대응 카테고리가 없는 **기본(회색) 배지만 `bg-surface-elevated-hover text-text-primary`로 통일**(중립 상태이므로 semantic 매핑이 자연스러움). 무료 펜 아이콘의 `amber`/`yellow`는 유지
- `views/simple-login/client.tsx` — 간편 로그인 모달. `bg-[#432DF1]`(라이트 brand와 정확히 일치하는 HEX)→`bg-brand`, `bg-[#F1F2F2]`(라이트 `surface-elevated-hover`와 정확히 일치하는 HEX)→`bg-surface-elevated-hover`, `text-[#FFFFFF]`→`text-text-inverse`
- `views/terms/home.tsx` — 약관 탭/본문 카드/에러 배너 전 구간 치환

---

## 색상 `dark:` 잔량 (`grep -c`)

| 대상 | 치환 전(추정) | 치환 후 |
|---|---|---|
| `views/*` (19파일) | 약 250+ (상세 파일별 카운트 근거: 사전 조사 시 파일별 3~65건 산재) | **57건** |
| `app/(routes)/payment/*` (4파일) | 약 26 | **5건** |

잔여 내역(전부 검토·문서화, 추가 조치 불필요):
- **죽은 코드(전체 주석 처리)**: `views/chat/home.tsx`(41건 전부)
- **의도적 유지(대응 semantic 토큰 없음, 브랜드와 무관한 다색 상태/정보 배지)**: `views/author/detail.tsx`(작가 없음 경고 배너, 1) · `views/chat-list/home.tsx`(즐겨찾기 별 노랑, 1) · `views/shop-recharge/home.tsx`(거래유형 blue/green/purple/red + 증감액 + 무료펜 amber, 17) · `app/(routes)/payment/page.tsx`(정보 박스, 1) · `app/(routes)/payment/fail/page.tsx`(에러 아이콘 배경, 1) · `app/(routes)/payment/success/page.tsx`(성공/실패 아이콘 배경 + 성공 타이틀, 3)

색상 `dark:` 외에 `dark:` 자체가 전혀 없던 파일(`views/main/home.tsx` 등 다수)은 원래도 다크 대응이 없었으므로 하드코딩 라이트 유틸(`bg-white`, `text-gray-*` 등)만 semantic 토큰으로 치환해 다크 진입 시 자동으로 대응되도록 만들었다.

---

## 검증 결과

- **타입**: `npx tsc --noEmit` — 오류 없음 (편집 중간 1회, Biome 포맷 후 최종 1회 재검증)
- **빌드**: `npm run build` — 성공, 24개 라우트 정상 생성 (Biome 포맷 후 최종 재검증)
- **포맷**: `npx biome check --write views "app/(routes)/payment"` 실행 — 23개 파일 포맷 정리(싱글쿼트/세미콜론/2-space/import 정렬). 함께 보고된 `useButtonType`(버튼 `type` 누락) 등 a11y 경고는 **이번 작업과 무관한 기존 이슈**로 판단해 미수정(범위 밖, step4와 동일 방침)
- **회귀 기준선**: `text-white`/`bg-white`는 전부 파일별 문맥(카드·모달 표면 vs 이미지 오버레이 vs 딥/고정 배경) 판단 후 개별 처리, 자동 일괄 치환 없음. 라이트 모드 렌더는 `:root` 변수가 현행값 유지이므로 색상 변화 없어야 함(코드 레벨 확인 완료, 실제 화면 스크린샷 비교는 후속 필요)
- **채팅 버블 대비 집중 검수**: 사용자 버블(`bg-brand`/`text-text-inverse`) vs 캐릭터 버블(`bg-surface-elevated`/`text-text-primary`) 배경·텍스트 조합이 라이트(`brand`=#432df1, `surface-elevated`=#FFFFFF)·다크(`brand`=#FF2E7E, `surface-elevated`=#3A3A3A) 양쪽에서 서로 다른 두 표면으로 명확히 구분됨을 코드 레벨로 확인. 상황 설명 텍스트는 `text-current/60`으로 버블별 자동 대비 확보
- **결제 로직 불변 확인**: `app/(routes)/payment/*` 4개 파일 모두 `git diff` 상 className 문자열만 변경되었고 `settlementApi`/`TossPayments`/상태 관리(`useState`, `useAccountStore`) 로직은 무변경

---

## 계획과 달라진 점 / 미완 · 후속 필요

### 없음(계획 범위 준수)
- 6단계(색상 `dark:` 잔재 정리·전략 완전 일원화)는 지시대로 건드리지 않음(위 잔량 표의 "의도적 유지" 항목들이 6단계 후보).
- 4단계에서 처리한 `components/*`, `src/shared/ui/*`는 건드리지 않음.

### 확인 필요 (제품/디자인 컨펌 권장)
1. **`app/(routes)/payment/page.tsx`, `page-origin.tsx`, `fail/page.tsx`, `success/page.tsx`의 CTA 색 blue→brand 통일** — step4의 `PaymentModal.tsx`와 동일 원칙이나, 테스트/디버그 성격의 페이지라 실제 운영 영향은 적음. TossPayments 실제 브랜딩 의도가 blue였다면 되돌림 필요.
2. **`views/chat-list/home.tsx`의 Toast 컴포넌트**를 `bg-overlay/90`(테마 무관 고정 검정)으로 매핑한 것 — "항상 어두운 스낵바"라는 기존 디자인 의도를 유지하기 위한 판단이며 계획 매핑 표에 명시된 항목은 아님.
3. **`views/settings/home.tsx`의 `text-border-[#484554]` 무효 클래스를 `text-text-muted`로 교정**한 것 — 순수 색상 치환을 넘어 기존 버그(오타)를 함께 고친 것이라 "className만 변경" 원칙에서 약간 벗어남(단, 시각적 회귀는 없음).
4. **`views/chat/detail.tsx`의 violet 계열 전체를 brand로 통일**(정보 아이콘, 새로고침 버튼, 이미지 그라데이션 오버레이, 대기 인디케이터, 저장 버튼) — 계획 매핑 표는 `#432df1`/`#4f46e5`/`v2.purple`만 명시하지만, Tailwind 기본 `violet-*`가 이 파일 전역에서 일관되게 "브랜드 강조색" 용도로 쓰이고 있어 확장 적용함(4단계 `FilterControls.tsx`의 `indigo-600`→`brand` 매핑과 같은 논리).
5. **`views/my-account/home.tsx`의 violet 계열도 동일하게 brand로 통일** — 그라데이션 버튼 클래스가 `BaseButton`의 gradient variant와 동일 패턴임을 근거로 판단.

### 후속 필요
- `APP_THEME='dark'` 실사용 육안 회귀 테스트(다크 진입 시 흰 배경 튐 0건, 채팅 버블/입력창/헤더 명도 대비 WCAG AA)는 아직 실제 브라우저 스크린샷으로 확인하지 못함 — 6단계(잔재 정리) 완료 후 전체 플로우 육안 QA 권장.
- Biome가 보고한 기존 a11y 경고(`useButtonType` 등)는 이번 작업 범위 밖이므로 별도 후속 이슈로 관리 권장.
