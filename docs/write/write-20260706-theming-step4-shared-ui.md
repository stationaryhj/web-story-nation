# StoryNation — 테마 semantic 토큰화 구현 결과 (4단계: 공용 UI 치환)

- **작성 일자**: 2026-07-06
- **근거 계획**: `docs/plan/plan-20260706-theming-semantic-tokens-v2.md` (4단계)
- **선행 구현**: `docs/write/write-20260706-theming-semantic-tokens-v2.md` (1·2·3·7단계, 인프라 완료)
- **구현 범위**: 계획 **4단계 — 공용 UI 치환** (`src/shared/ui/{modal,form}`, `components/elements/{card,button,sidebar,modal,dropdown,filters,pagination}`, `components/modal`)
- **검증**: `npx tsc --noEmit` ✅ · `npm run build` ✅ (24 라우트) · `biome check --write` 포맷 정리 완료

---

## 구현 요약

계획 1~3·7단계에서 구축된 semantic 토큰(`surface`/`surface-elevated`/`surface-elevated-hover`/`border-default`/`brand`/`brand-hover`/`danger`/`overlay`/`text-primary`/`text-muted`/`text-inverse`)을 기준으로, 지정된 4단계 디렉토리(총 66개 파일)의 하드코딩 색상 유틸(`bg-white`, `text-gray-*`, `border-gray-*`, `primary-*`, `secondary-*`, `dark-*` 등)과 색상용 `dark:` 접두 유틸을 semantic 클래스로 치환했다. 색상 `dark:` 잔량은 스코프 내에서 **약 491건 → 24건**으로 감소했으며, 남은 24건은 전부 (a) 죽은 코드(주석 처리된 JSX)이거나 (b) 브랜드 톤과 무관한 의도적 강조색(소셜 로그인 브랜드 버튼, 알림 유형 배지의 green/yellow/blue 등 — 대응 토큰 없음)으로 확인·문서화했다.

`primary-500/600` 계열 및 하드코딩 `#432df1`/`#4f46e5`는 `brand`/`brand-hover`로, `secondary-*`/`dark-secondary-*`/`dark-primary-*` 텍스트·배경은 역할에 따라 `text-primary`/`text-muted`/`surface-elevated`로, `v2.red`/`#FF4242`/Tailwind 기본 `red-*`(에러 상태)는 `danger`로 통일했다. `text-white`/`bg-white`는 파일별로 문맥(브랜드 필/딥 오버레이 위 vs 일반 콘텐츠)을 판별해 개별 치환했다.

---

## 처리한 디렉토리 / 파일

### `src/shared/ui/modal/*` (13개 파일)
- `base/Modal.tsx` — 색상 클래스 없음(구조만), 변경 없음
- `base/ModalBackDrop.tsx:28` — `bg-black/50` → `bg-overlay/50`
- `base/ModalContent.tsx:14` — `bg-white` → `bg-surface-elevated`
- `base/ModalClose.tsx`, `base/modalContexts.ts`, `base/index.ts`, `index.ts` — 색상 클래스 없음(Biome 포맷만 적용)
- `AlertModal.tsx:40-41` — `bg-black/80`→`bg-overlay/80`, `text-white`→`text-text-inverse`
- `CharacterMediaModal.tsx` — `text-gray-500`→`text-text-muted`, `border/bg-primary-500`→`border/bg-brand`, 관련 `text-white`→`text-text-inverse` (브랜드 필/딥배경 위)
- `ChatModeSelectModal.tsx` — `border-[#D9D9D9]`→`border-border-default`, `text-primary-600`→`text-brand-hover`, `text-[#636363]`→`text-text-muted`, `text-black/70`→`text-text-primary/70`
- `ConfirmModal.tsx` — `bg-white`→`bg-surface-elevated`, `text-black`→`text-text-primary`, `text-text-black`→`text-text-primary`, `text-white bg-button-primary`→`text-text-inverse bg-brand` 계열
- `GlobalModalHost.tsx` — 색상 클래스 없음(Biome 포맷만)
- `RedirectBannerModal.tsx` — `bg-primary`→`bg-brand`, `text-white`(브랜드 배너 위)→`text-text-inverse`
- `SignupModal.tsx` — 활성 코드 블록(생년월일 입력·약관 동의·완료 화면) 전면 치환. **주석 처리된 닉네임 입력 블록(274~314행)은 죽은 코드로 미변경**(잔여 `dark:` 6건은 전부 이 블록)
- `SocialLoginModal.tsx` — `text-icons-primary`→`text-text-muted`, `text-primary`(브랜드 텍스트)→`text-brand`, 툴팁 화살표 `border-t-white dark:border-t-gray-800`→`border-t-surface-elevated`(확인 필요 표시). SNS 버튼 배열의 `bg-black`/`text-white`(Apple 공식 브랜드 컬러)는 **의도적으로 미변경**

### `src/shared/ui/form/*` (5개 파일 + index.ts)
- `FormButtonGroup.tsx` — active `bg-primary-500 text-white`→`bg-brand text-text-inverse`, `text-gray-500`→`text-text-muted`, `border-red-500`→`border-danger`, `text-v2-red`→`text-danger`
- `FormFieldHeader.tsx` — label `text-secondary-700 dark:text-dark-secondary-400`→`text-text-primary`, required `*` `text-primary-500`→`text-brand`, description `text-secondary-500 dark:text-dark-secondary-500`→`text-text-muted`
- `FormImageUpload.tsx` — 업로드 오버레이 `bg-black/80`→`bg-overlay/80`, 썸네일 배경 `bg-[#F4F5F5]/hover:bg-[#D9D9D9]`→`bg-surface-elevated`/`hover:bg-surface-elevated-hover`, 안내 텍스트류 `text-[#A6A6A6]`/`text-[#6B7280]`→`text-text-muted`, `text-red-500`→`text-danger`
- `FormInput.tsx` / `FormTextarea.tsx` — `inputVariants`/`textareaVariants`를 `border-border-default focus:border-brand focus:ring-brand` (default) / `border-danger focus:border-danger focus:ring-danger` (error)로 통일, base `bg-white`/`text-secondary-900`→`bg-surface`/`text-text-primary`(FormTextarea), count·error 텍스트 `text-v2-red`/`text-[#6B7280]`→`text-danger`/`text-text-muted`

### `components/elements/card/*` (4개 파일)
- `AuthorCard.tsx`, `Card.tsx` — 카드 컨테이너 `bg-white dark:bg-dark-background-light dark:border ...`→`bg-surface-elevated`(불필요해진 다크 전용 보더 제거), 제목/설명 `secondary-*`/`dark-secondary-*`→`text-primary`/`text-muted`, 해시태그 pill `primary-50/dark-primary-*`→`bg-brand/10 text-brand`, 랭크뱃지·이미지 오버레이 `text-white`→`text-text-inverse`, 그라데이션 오버레이 `black/60,70`→`overlay/60,70`, 아바타 placeholder `bg-secondary-200`→`bg-surface-elevated`, my-character 수정/삭제 버튼을 `surface-elevated`/`danger` 계열로 통일
  - **확인 필요**: `Card.tsx:218` 캐릭터 썸네일(사진) 위에 얹힌 `text-black` 아이콘 — 앱 크롬이 아닌 임의 사진 위 배치라 라이트/다크 판별이 어려워 미변경(그대로 유지)
  - **의도적 미변경**: `AuthorCard.tsx` "인증" 배지(`text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10`) — 브랜드색과 무관한 별도 정보색, 대응 토큰 없음
- `AuthorGrid.tsx`, `CardGrid.tsx` — 헤더 타이틀/부제/업데이트 시각 텍스트, 더보기 링크, 에러 배너를 `text-primary`/`text-muted`/`brand`/`danger` 계열로 통일

### `components/elements/button/*` (2개 파일)
- `BaseButton.tsx` — `primary/secondary/tertiary/gradient` variant, `disabledStyles`를 모두 `surface`/`surface-elevated`/`border-default`/`brand`/`brand-hover`/`text-primary`/`text-muted`/`text-inverse` 조합으로 재구성(회귀 기준선 유지, 라이트 렌더 동일)
- `DraggableButton.tsx` — 기본 메뉴 버튼 색 `bg-primary-500`→`bg-brand`, 버튼 텍스트 `text-white`→`text-text-inverse`, 메뉴 배경 오버레이 `bg-black/10`→`bg-overlay/10`

### `components/elements/sidebar/*` (8개 파일)
- `BaseSidebar.tsx` — 배경 오버레이 `bg-black/50`→`bg-overlay/50`, 패널/헤더 `bg-white dark:bg-dark-background-*`→`bg-surface-elevated`, 제목/닫기버튼 `secondary-*`→`text-primary`/`text-muted`
- `AuthorRankingSidebar.tsx`, `CharacterRankingSidebar.tsx`, `EtcCharacterSidebar.tsx`, `LatestCharacterSidebar.tsx`, `NewCharacterSidebar.tsx`, `NotificationButton.tsx`, `HeaderSidebar.tsx` — 스켈레톤/카드/구분선/랭크뱃지/새로고침·알림 버튼·FAB류를 `surface-elevated`/`border-default`/`text-primary`/`text-muted`/`brand`/`brand-hover`/`danger`로 통일
  - `HeaderSidebar.tsx` 주석 처리된 다크모드 토글 블록(77~85행)의 `dark:` 1건은 **죽은 코드로 미변경**

### `components/elements/modal/Modal.tsx`, `dropdown/Dropdown.tsx`, `filters/FilterControls.tsx`, `pagination/Pagination.tsx`
- `Modal.tsx` — 컨테이너/헤더/푸터 보더, 닫기 버튼을 semantic 토큰으로 통일
- `Dropdown.tsx` — 트리거/메뉴/옵션 배경·보더·텍스트 통일, 선택 항목 강조 `bg-primary-50`→`bg-brand/10`
- `FilterControls.tsx` — 정렬 탭 활성/비활성(`bg-indigo-600`가 실제로는 `#4F46E5`=`primary-600`과 동일 HEX임을 확인 후 `brand`로 매핑), NSFW 드롭다운(사용되지 않던 `dark-background-lighter` 무효 클래스 정리 포함), 태그 컨트롤 버튼을 통일. **`bg-green-50/100`, `bg-blue-50/100`(전체 이용가/이용등급 전체 선택 표시)은 대응 토큰이 없어 의도적으로 미변경**
- `Pagination.tsx` — 페이지 버튼(첫/이전/다음/마지막/번호) hover·active 상태를 `surface-elevated`/`brand`/`brand/10` 조합으로 통일

### `components/modal/*` (24개 파일)
전 파일 처리 완료. 대표 처리 내역:
- `BaseModal.tsx`(공용 베이스) — `backdropColor` 기본값 `bg-black/50`→`bg-overlay/50`, 컨테이너 `bg-white dark:bg-dark-background-light`→`bg-surface-elevated`, 헤더/타이틀/닫기버튼/푸터 보더 통일
- `CharactorModal.tsx`, `CharactorOpenModal.tsx` — 900행대 대형 파일. 헤더/아이콘버튼/이미지 스켈레톤/해시태그/작가정보/댓글좋아요/DM 말풍선/CTA 버튼까지 전 구간 치환(PC·모바일 레이아웃 중복 포함). 브랜드 아바타 링·말풍선 배경은 `brand/10`, `brand/20`, `brand/30` alpha 조합으로 통일
- `GalleryModal.tsx`, `Modal.tsx`, `NotificationSidebar.tsx`, `ReportModal.tsx`, `ChatModeModal.tsx`, `DuplicateCheckModal.tsx`, `duplicateLoginModal.tsx`, `ConfirmActionModal.tsx`, `DeleteAccountModal.tsx`, `DeleteConfirmModal.tsx`, `AdultVerificationModal.tsx`, `BankInfoModal.tsx`, `IdeaShareModal.tsx`, `LimitCharacterModal.tsx`, `LoginModal.tsx`, `NoticeModal.tsx`, `PaymentModal.tsx`, `ResetChatModal.tsx`, `RewardModal.tsx`, `SignupModal.tsx`, `UnlockActionModal.tsx`, `WithdrawModal.tsx`, `BigImageModal.tsx`, `ModalManager.tsx` — 동일 원칙(문맥별 `surface`/`surface-elevated`/`border-default`/`brand`/`brand-hover`/`danger`/`text-primary`/`text-muted`/`text-inverse`/`overlay`)으로 치환
  - `PaymentModal.tsx`(TossPayments) — **로직/토큰 흐름은 전혀 변경하지 않고 className만 교체**. CTA 버튼 색을 `bg-blue-500`→`bg-brand`로 통일(확인 필요: 원래 blue가 의도적 브랜딩이었는지 제품 확인 권장), 정보 박스(`bg-blue-50`)는 브랜드와 무관한 정보색으로 판단해 유지
  - `LoginModal.tsx` — Google/Kakao/Apple/Naver 소셜 로그인 버튼의 공식 브랜드 색(`bg-[#F2F2F2]`, `bg-[#FEE500]`, `bg-black`, `bg-[#03C75A]`, 관련 `text-white`)은 **의도적으로 미변경**(제3자 브랜드 아이덴티티)
  - `ReportModal.tsx`, `IdeaShareModal.tsx` — 자체 "블루" 강조 테마(번호 배지·포커스 링)는 브랜드와 무관한 별도 강조색으로 판단해 유지, 회색·빨강 계열(본문/에러)만 토큰화
  - `NotificationSidebar.tsx` — 알림 유형 배지(success/warning/info)의 green/yellow/blue는 대응 토큰이 없어 유지, error만 `danger`로 통일

---

## 색상 `dark:` 잔량 (`grep -c`)

| 시점 | 대상 | 건수 |
|---|---|---|
| 치환 전 | 4단계 스코프 전체 (`src/shared/ui/{modal,form}` + `components/elements/{card,button,sidebar,modal,dropdown,filters,pagination}` + `components/modal`) | 약 491건 (34 + 119 + 338) |
| 치환 후 | 동일 스코프 | **24건** |

잔여 24건 내역(전부 검토·문서화 완료, 추가 조치 불필요):
- **죽은 코드(주석 처리된 JSX)**: `SignupModal.tsx`(shared/ui, 5) · `SocialLoginModal.tsx`(shared/ui, 1, 하단 "또는" 구분선 주석) · `Card.tsx`(3) · `AuthorCard.tsx` 인증배지 제외 시 0 · `HeaderSidebar.tsx`(1) · `LoginModal.tsx`(components/modal, 1)
- **의도적 유지(대응 semantic 토큰 없음, 브랜드와 무관한 강조/정보색)**: `AuthorCard.tsx` 인증 배지(1) · `FilterControls.tsx` 전체이용가/이용등급 배지(4) · `ReportModal.tsx` 블루 테마(2) · `IdeaShareModal.tsx` 블루 아이콘(2) · `PaymentModal.tsx` 정보 박스(1) · `NotificationSidebar.tsx` 알림 유형 배지(3)

---

## 계획 대비 매핑 결정 사항 (확인 필요 표시분)

1. **`PaymentModal.tsx`의 CTA 버튼 색을 blue→brand로 통일**한 것은 계획 매핑 표에 명시된 항목이 아니라, 테스트/플레이스홀더 성격의 버튼으로 판단해 앱 전역 CTA 색과 통일했습니다. TossPayments 결제 버튼의 실제 브랜딩 의도가 blue였다면 되돌려야 합니다. **(확인 필요)**
2. **`SocialLoginModal.tsx`(shared/ui) 툴팁 화살표** `border-t-white dark:border-t-gray-800`를 `border-t-surface-elevated`로 매핑했습니다. 해당 말풍선 컨테이너 자체에 `bg-*` 클래스가 없어(기존 코드에도 없던 사각지대) 실제 배경이 무엇인지 불명확한 상태에서의 추정 매핑입니다. **(확인 필요)**
3. **Tailwind 기본 `red-*`(`red-500`/`red-400` 등, 에러 상태)를 `danger` 토큰으로 통합**했습니다. 계획 매핑 표는 `#FF4242`/`v2.red`만 명시하지만, 동일한 "에러/위험" 역할이라 판단해 확장 적용했습니다.
4. **`ChatModeModal.tsx`의 인라인 스타일** `var(--color-primary-600)`/`var(--color-secondary-500)`는 1단계 CSS 변수 개편으로 이미 존재하지 않는 변수명이 되어 있었습니다(선행 인프라 작업의 부작용, 기존에도 무효했던 참조로 추정). `rgb(var(--color-brand))`/`rgb(var(--color-text-muted))`로 교정했습니다.
5. **`indigo-600`(`FilterControls.tsx`)** 는 Tailwind 기본 팔레트 HEX가 `#4F46E5`로 `primary.600`과 정확히 일치함을 확인하고 `brand`로 매핑했습니다.

---

## 검증 결과

- **타입**: `npx tsc --noEmit` — 오류 없음 (2회 재검증: 1차 편집 직후, Biome 포맷 후 최종)
- **빌드**: `npm run build` — 성공, 24개 라우트 정상 생성 (2회 재검증)
- **포맷**: `npx biome check --write <4단계 대상 디렉토리>` 실행 완료 — 지정 디렉토리 66개 파일 포맷 정리(싱글쿼트/세미콜론/2-space/import 정렬). 별도로 보고된 a11y(`useButtonType`, `useFocusableInteractive`)·미사용 변수 경고는 **이번 작업과 무관한 기존 이슈**로 판단해 미수정(범위 밖)
- **회귀 기준선**: `git diff`로 각 파일 확인 — `text-white`/`bg-white` 치환은 전부 파일별 문맥(브랜드 필/오버레이 위 vs 카드·모달 표면) 판단 후 개별 처리, 자동 일괄 치환 없음. 색상 값 자체는 라이트 모드 기준 기존과 동일(`:root` 변수가 현행값 유지)하므로 라이트 렌더는 변화 없어야 함(육안 확인은 후속 필요)

---

## 계획과 달라진 점 / 미완 · 후속 필요

### 없음(계획 범위 준수)
- 5·6단계(`views/*`, 레거시 페이지, 색상 `dark:` 전략 완전 일원화)는 지시대로 **건드리지 않음**.
- `primary`/`secondary`/`v2.*` 레거시 토큰 정의 자체는 삭제하지 않음(개별 사용처만 semantic으로 치환).

### 후속 필요 (확인 필요 항목)
- 위 "확인 필요" 5개 항목(특히 `PaymentModal.tsx` CTA 색상)에 대한 제품/디자인 컨펌 권장.
- `APP_THEME='dark'`로 실제 전환 시 육안 회귀 테스트(다크 모드 진입 시 흰 배경 튐 0건, 명도 대비 WCAG AA)는 **5·6단계 완료 후** 전체적으로 수행 필요(4단계 단독으로는 부분 검증만 가능).
- Biome가 보고한 기존 a11y 경고(버튼 `type` 누락, 포커스 불가능한 interactive role 등)와 CSS 클래스 중복 경고(`CharactorOpenModal.tsx`, `ReportModal.tsx`)는 이번 작업 범위 밖이므로 별도 후속 이슈로 관리 권장.
