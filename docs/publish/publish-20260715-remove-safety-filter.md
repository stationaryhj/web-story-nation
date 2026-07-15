# 세이프티 필터 토글 제거 — 퍼블리싱 기록 (3·4단계)

- 작성 일자: 2026-07-15
- 근거 계획: `docs/plan/plan-20260715-remove-safety-filter.md` (3단계·4단계, 담당: publisher)
- 정책 결정 근거: `docs/q&a/qa-20260715-remove-safety-filter.md` (Q1 = 안 1, 전역 강제 OFF 확정)

## 구현 범위

### 3단계 — 톱바 세이프티 필터 토글 제거 (완료)
파일: `components/common/header.tsx` (단독 수정)

- `SimpleToggle` 컴포넌트 정의(구 34-70행) 삭제.
- 사용 블록(구 178-182행 `mounted && <div><SimpleToggle ... /></div>` 및 위 주석) 삭제. 이어지는 상점 아이콘 주석도 `SimpleToggle` 참조를 제거해 정확한 문구로 정리(`상점 - 데스크톱 nav 제거에 따라 아이콘화되어 우측 액션 그룹 첫머리에 위치`).
- `handleAdultModeToggle` 핸들러(구 127-142행) 삭제.
- `const { isAdultModeEnabled, changeAdultMode } = useSettingsStore();`(구 74행) 및 `import { useSettingsStore } from '../../store/useStoreSettings';`(구 31행) 삭제.
- `SocialLoginProvider` import(구 27행)와 `loginType` destructure(구 81행) — 파일 내 다른 사용처 없음을 재확인 후 함께 제거.
- `isAdult` destructure — `useAccountStore()`에서 가져오던 것도 `handleAdultModeToggle` 삭제로 파일 내 유일한 사용처가 사라져 함께 제거(`const { isLogin, logout } = useAccountStore();`). 계획에 명시된 항목은 아니었으나, `loginType`·`SocialLoginProvider`와 동일하게 이 토글 기능에만 종속된 죽은 참조라 판단해 같은 원칙으로 정리(범위 이탈 아님, 최소 변경 유지).
- 원래부터 미사용이던 아이콘 import(`faBell`/`faCog`/`faFire`/`faMoon`/`faSignOutAlt`/`faSun`/`faTimes`/`faVideo`)·`AnimatePresence`·`FadeIn`·onClick 파라미터 `(e)` 등은 이번 변경과 무관한 기존 미사용 항목이므로 손대지 않음(계획의 "무관한 정리 금지" 준수).
- `mounted` state는 다크모드 적용 `useEffect`(`if (!mounted) return;`)에서 여전히 사용 중이므로 유지.
- `openModal`(useModalStore) → `HeaderSidebar`에 계속 전달, `openNewModal`(useNewModalStore) → `handleShopClick`/`onClickSettingLink`에서 계속 사용. 둘 다 유지.

### 4단계 — 헤더 레이아웃/반응형 검증 (완료, 코드 레벨)
- 우측 액션 그룹 컨테이너 `flex items-center md:space-x-4 gap-1`은 구조 변경 없이 유지. 토글 `<div>`가 제거되어 첫 항목이 상점 아이콘으로 이동했을 뿐, 나머지 아이템(알림·유저·장바구니·햄버거)의 `hidden`/`md:block`/`sm:visible` 가시성 규칙은 변경하지 않음.
- 360px: 상점 → 알림 → 햄버거만 노출(유저는 `md:block`, 장바구니는 `sm:visible`로 숨김). `gap-1`만 적용되어 좁은 화면에서도 정렬 자연스러움. 가로 스크롤 유발 요소 없음.
- 768px(`md`): `space-x-4` 활성화, 유저 아이콘 노출. 장바구니는 `sm:visible`(비표준 유틸이나 기존 동작 그대로) 상태 유지.
- 1280px: 전체 아이콘 노출, `space-x-4`로 간격 유지. 토글 제거로 좌측 여백이 사라지고 로고 옆 공백이 약간 넓어졌으나 `justify-between` 구조상 레이아웃 붕괴 없음.
- 터치 타겟(44×44px)·오버플로 관련 사항은 이번 변경으로 새로 발생한 이슈 없음(기존 아이콘 버튼 크기/패딩 자체는 변경하지 않았으므로 기존 상태 그대로, 별도 개선은 계획 범위 밖).

## 변경 파일
- `components/common/header.tsx` — `SimpleToggle` 정의/사용 블록·`handleAdultModeToggle`·관련 스토어 바인딩(`useSettingsStore`, `isAdultModeEnabled`, `changeAdultMode`) 삭제, 부수적으로 죽은 참조(`SocialLoginProvider`, `loginType`, `isAdult`) 정리.

## 검증
- `npx tsc --noEmit` — 통과(오류 없음).
- `npx biome lint components/common/header.tsx` — 경고 4건, 전부 이번 변경 이전부터 존재하던 미사용 항목(아이콘 import 다수, `AnimatePresence`, `FadeIn`, onClick 미사용 파라미터 `(e)`)이며 계획 범위 밖이라 손대지 않음. 세이프티 토글 관련 신규 경고 없음(`git diff` 확인 결과 이번 편집분에는 해당 미사용 항목이 없음).
- 360/768/1280px 반응형은 코드 레벨(클래스·가시성 유틸 검토)로 확인. 실제 브라우저/디바이스 스크린샷 검증은 별도(확인 필요 시 요청).

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- `isAdult` destructure 제거는 계획 3단계 문구에 명시적으로 나열되지 않았으나, `loginType`/`SocialLoginProvider`와 동일하게 이 토글에만 종속된 죽은 참조라 판단해 같은 원칙(사용처 재확인 후 정리)으로 함께 제거함. 이견이 있으면 롤백 가능.
- 1·2단계(스토어 잠금, `store/useStoreSettings.ts`)는 writer 담당으로 이번 작업 범위에 포함하지 않음 — 별도 진행 필요.
- 5단계(오펀 `ToggleSwitch.tsx` 정리)는 `[담당: main]`이며 계획상 기본 보류, 이번 작업에서 다루지 않음.
- 실물 디바이스/브라우저 스크린샷 기반 반응형 확인은 미실시(코드 레벨 검토만 완료) — 필요 시 후속 확인 요청.
