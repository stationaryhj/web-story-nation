# 세이프티 필터 토글 제거 & API safety 항상 OFF(0) 고정 — 구현 계획

- 작성 일자: 2026-07-15
- 대상 브랜치: red-main
- 목표 한 줄: 톱바(헤더)의 "세이프티 필터" 토글 UI를 제거하고, 모든 API 호출의 safety 값을 항상 0(성인 모드 ON = 필터 OFF)으로 고정한다.

---

## 목표
톱바 헤더에서 세이프티 필터 토글 UI를 제거하고, `useSettingsStore.isAdultModeEnabled`를 항상 `true`로 잠가 8곳의 API 호출이 예외 없이 `safety=0`을 전송하도록 한다.

## 현황 파악
- **톱바 토글 UI/로직**: `components/common/header.tsx`
  - `SimpleToggle` 컴포넌트 정의 34-70행("세이프티 필터" 라벨, ON/OFF 이미지).
  - 사용처 180행 `<SimpleToggle isOn={isAdultModeEnabled} onToggle={handleAdultModeToggle} />` (178-182 `mounted` 가드).
  - 핸들러 `handleAdultModeToggle` 127-142행 → 로그인/게스트/`isAdult()` 분기 후 `changeAdultMode()` 또는 `openModal('adultVerification')`.
  - 스토어 바인딩 74행 `const { isAdultModeEnabled, changeAdultMode } = useSettingsStore();`, import 31행.
- **모바일 사이드바**: `components/elements/sidebar/HeaderSidebar.tsx:86-90` — SimpleToggle이 **이미 주석 처리**되어 렌더되지 않음. 추가 작업 불필요(확인만).
- **스토어**: `store/useStoreSettings.ts`
  - `isAdultModeEnabled: false`(초기값, persist name `settings-storage`, localStorage) — 30행.
  - `setAdlultMode(v)`: `isAdultModeEnabled = (v === 0)` 반전 로직 — 32-34행. (로그인 시 서버 safety 값 반영에 사용)
  - `enableAdultMode()`(true 세팅), `toggleAdultMode()`(반전), `changeAdultMode()`(`updateSafetyMode(isAdultModeEnabled ? 1 : 0)` 서버 호출 후 반전) — 37-56행.
- **API safety 규약(8곳, 전부 동일 패턴)**: `services/api/storyNationApi.ts`
  - `const safety = useSettingsStore.getState().isAdultModeEnabled ? 0 : 1` — 315, 325, 345, 367, 393, 422, 504, 525행.
  - 즉 **세이프티 OFF = safety=0**. `isAdultModeEnabled === true`이면 자동으로 8곳 모두 `safety=0` 전송.
- **로그인 시 서버 값 반영**: `store/useAccountStore.ts:517, 631, 946` → `useSettingsStore.getState().setAdlultMode(server.safety)`. 서버가 safety=1이면 `isAdultModeEnabled=false`로 되돌아감 → 잠금 시 중화 필요.
- **서버 동기화 경로**: `updateSafetyMode`는 `useAccountStore.ts:93/311`에 정의, 호출부는 오직 `useStoreSettings.ts:51`의 `changeAdultMode` 뿐. 헤더 토글이 유일한 진입점.
- **기타 `isAdultModeEnabled` 소비처(스타일 아닌 데이터 필터/트리거)**:
  - `views/search/home.tsx:51,96` — 검색 쿼리 파라미터.
  - `components/main/RecommendSection.tsx:21,27` / `components/main/CharacterGridSection.tsx:28,86` / `components/elements/card/CardGrid.tsx:77,123` — 데이터 reload 트리거(deps).
  - `components/elements/filters/FilterControls.tsx:24,137,146,279,474` — 성인 필터 옵션 표시 여부.
  - `components/form/ToggleSwitch.tsx:13,45` — **오펀 컴포넌트**(코드베이스 import 0건, `docs/review/review-20260706-...`·`docs/write/write-20260706-step6/9`에서 미사용 확인). 설정 화면에 렌더되지 않음(`views/settings/home.tsx`는 `settings`(언어)만 사용).
- **성인인증 모달(`adultVerification`) 다른 사용처**: `views/chat/detail.tsx:718`, `components/modal/CharactorModal.tsx:160`, `components/modal/CharactorOpenModal.tsx:114`, `components/form/character/LastInfoForm.tsx:91`. 이들은 캐릭터 생성/열람의 나이 게이팅으로 `isAdult()` 기반 → 헤더 토글 제거와 무관하게 유지됨. **모달 흐름 안 끊김.**

## 접근 방식

세 가지 안을 비교한다.

- **안 A — 스토어에서 `isAdultModeEnabled`를 항상 true로 잠금 (추천)**
  - 스토어 초기값 true + 모든 세터를 true 고정 + persist rehydrate 시 강제 true(레거시 false 무력화) + 로그인 서버값 반영(`setAdlultMode`) 중화.
  - 장점: API 8곳을 **한 줄도 안 건드리고** 자동으로 `safety=0`. 검색/필터/추천 등 모든 소비처가 "성인모드 ON"으로 **일관** 동작. 변경 파일 최소(스토어 1 + 헤더 1). 레거시 localStorage(false) 케이스도 스토어 한 곳에서 처리.
  - 단점: 죽은 코드(`toggleAdultMode`/`changeAdultMode`)가 잔존(무해).
- **안 B — API 계층에서 safety=0 하드코딩**
  - `storyNationApi.ts` 8곳을 `const safety = 0`으로 변경.
  - 장점: API 의도가 명시적.
  - 단점: 편집 8곳으로 많음. `isAdultModeEnabled`는 여전히 UI(검색/필터)를 좌우 → 토글은 제거됐는데 필터 UI는 "성인 아님"으로 남아 **불일치**. 레거시 false 값도 그대로.
- **안 C — 스토어/토글 전면 제거**
  - `isAdultModeEnabled` 필드·세터 제거 후 8+개 소비처를 상수 true로 리팩터링.
  - 장점: 개념적으로 깔끔.
  - 단점: 파급 범위 최대(FilterControls의 성인 필터 표시 로직, search, card grid deps 등 다수 수정). 리스크·회귀 위험 큼. 최소 침습 원칙 위배.

**추천: 안 A.** "톱바 토글 제거 + API 항상 OFF + 다른 소비처 일관성"을 최소 변경으로 모두 만족한다. 파일 겹침도 스토어(writer) ↔ 헤더(publisher)로 깔끔히 분리된다.

## 실행 계획 (단계별)

### 1. 스토어를 성인모드 ON으로 잠금 `[담당: writer]`
파일: `store/useStoreSettings.ts` (이 파일 단독)
- `isAdultModeEnabled` 초기값을 `true`로 변경.
- `setAdlultMode`: 파라미터를 무시하고 항상 `set({ isAdultModeEnabled: true })` (로그인 서버 safety 값이 false로 되돌리는 것을 차단). 시그니처는 유지(호출부 `useAccountStore` 무변경).
- `toggleAdultMode`: 항상 true 유지하도록 무력화(`set({ isAdultModeEnabled: true }); return true;`). (오펀 ToggleSwitch 등에서 호출돼도 OFF 불가)
- `changeAdultMode`: **`updateSafetyMode` 서버 동기화 호출 제거**하고 no-op(또는 `set({ isAdultModeEnabled: true })`)으로 남김 — 서버에 safety=1이 전송되는 경로를 차단. 헤더에서 호출부가 제거되므로(3단계) 실질 dead code이나, 방어적으로 무력화.
- **persist 레거시 값 처리**: `persist` 옵션에 `merge`를 추가해 rehydrate 후 항상 true 강제.
  - 예: `merge: (persisted, current) => ({ ...current, ...(persisted as object), isAdultModeEnabled: true })`.
  - (partialize만으로는 rehydrate 시 기존 저장된 false가 merge되어 부족 → merge 강제가 정답.)
- **이유**: 이 한 파일 변경으로 API 8곳(`storyNationApi.ts`)이 자동으로 `safety=0` 전송, 모든 `isAdultModeEnabled` 소비처가 ON으로 일관.
- 재사용: 기존 스토어 구조/세터 시그니처 유지(호출부 무변경).

### 2. 스토어 잠금 검증 `[담당: writer]`
- `npx tsc --noEmit`로 타입 확인(시그니처 유지 확인).
- (선택) 개발 콘솔에서 `useSettingsStore.getState().isAdultModeEnabled === true`, 로그인 후에도 true 유지, `storyNationApi` 호출 payload `safety:0` 확인.

### 3. 톱바 세이프티 필터 토글 제거 `[담당: publisher]`
파일: `components/common/header.tsx` (이 파일 단독)
- `SimpleToggle` 컴포넌트 정의(34-70행) 삭제.
- 사용 블록(178-182행 `mounted && <div><SimpleToggle .../></div>`) 삭제.
- 이제 죽는 코드 정리(같은 파일 내):
  - `handleAdultModeToggle`(127-142행) 삭제.
  - 74행 `const { isAdultModeEnabled, changeAdultMode } = useSettingsStore();` 삭제.
  - 31행 `import { useSettingsStore } from '../../store/useStoreSettings';` 삭제.
  - `SocialLoginProvider` import(27행)·`loginType`(81행 destructure)가 다른 곳에서 안 쓰이면 함께 정리(사용처 재확인 후). 미사용 아이콘 import(`faFire`/`faMoon`/`faSun` 등)는 원래 이미 미사용이면 이번 범위에서 손대지 않음(무관 변경 최소화).
  - `openModal`(useModalStore)은 254-265행 `HeaderSidebar`에 계속 전달되므로 **유지**. `openNewModal`은 `handleShopClick`/`onClickSettingLink`에서 계속 사용되므로 유지.
- **한 파일 한 담당 준수**: header.tsx는 UI 요소 + 딸린 핸들러의 **삭제**만 발생하므로(신규 로직 배선 없음) publisher 단독으로 처리한다. 스토어(1단계, writer)와 파일이 분리되어 겹치지 않는다.
- **이유**: 요구된 톱바 UI 제거. 레이아웃 검증도 표시 담당 영역.

### 4. 헤더 레이아웃/반응형 검증 `[담당: publisher]`
- 360 / 768 / 1280px 폭에서 헤더 우측 아이콘 정렬(상점·알림·유저·장바구니·햄버거) 깨짐/가로 스크롤/잘림 없는지 확인.
- 토글이 차지하던 좌측 여백 제거 후 `md:space-x-4 gap-1` 정렬 자연스러운지 확인.

### 5. (확인 필요 사항 결정 후) 오펀 토글 정리 — 선택 `[담당: main]`
- `components/form/ToggleSwitch.tsx`는 미사용 오펀. 프로젝트 기존 방침(오펀 파일은 별도 정리 이슈로 보류)을 따라 **이번 범위에서 삭제하지 않음**을 기본으로 함. 삭제를 원하면 별도 지시.

## 영향 범위 & 리스크
- **자동 전파(무편집)**: `services/api/storyNationApi.ts` 8곳 → `safety=0` 고정. `views/search/home.tsx`, `components/main/RecommendSection.tsx`, `CharacterGridSection.tsx`, `components/elements/card/CardGrid.tsx`, `components/elements/filters/FilterControls.tsx` → 모두 "성인모드 ON" 데이터/필터로 동작(일관).
- **로그인 서버 동기화**: `useAccountStore` 3곳의 `setAdlultMode(server.safety)`는 세터 중화로 무해(항상 true). 파일 무편집.
- **성인인증 모달**: 헤더 외 4개 사용처는 `isAdult()` 기반 나이 게이팅 → **영향 없음**.
- **서버측 저장 safety 값**: 기존 사용자의 서버 저장 safety=1이 남아 있어도, 각 요청이 `safety=0`을 명시 전송하므로 결과는 필터 OFF. 서버측 저장값 강제 갱신은 **범위 밖**(필요 시 별도).
- **리스크/롤백**: 스토어 잠금이 전 서비스의 콘텐츠 필터를 성인 노출로 바꾸므로, 미성년/미인증 사용자에게도 성인 콘텐츠가 노출될 수 있음 — **제품/법무 확인 필요**(아래 확인 필요 사항). 롤백은 `useStoreSettings.ts` 되돌리기 + 헤더 토글 복구(git revert 2커밋)로 단순.
- **persist merge 주의**: `merge` 커스텀이 `settings`(언어 등) 다른 필드를 덮어쓰지 않도록 `...persisted` 먼저 전개 후 `isAdultModeEnabled: true`만 강제.

## 검증 방법
- 각 단계 후 `npx tsc --noEmit`, 완료 후 `npm run lint`(Biome) 통과.
- 런타임: (1) 헤더에 세이프티 토글이 사라졌는지, (2) 네트워크 탭에서 `top10`·검색 등 요청 body `safety:0`인지, (3) 로그아웃→재로그인 후에도 `safety:0` 유지되는지, (4) localStorage `settings-storage`에 과거 `isAdultModeEnabled:false`가 있던 브라우저에서도 새로고침 후 ON 유지되는지.
- 반응형: 헤더 360/768/1280px 확인(4단계).

## 확인 필요 사항
- **정책 확인(중요)**: 세이프티 필터를 전역 강제 OFF로 잠그면 로그인 전/미성년/미인증 사용자에게도 성인 콘텐츠가 노출된다. 의도된 것인지(성인 전용 서비스 전환) 확인 필요. 만약 "로그인·성인인증 사용자에 한해서만" 의도라면 안 A가 아니라 조건부 로직이 필요하므로 계획 수정 필요.
- **서버측 저장 safety 값**도 0으로 마이그레이션(사용자별 `SetSafetyMode(0)` 1회 호출)할지 여부 — 기본은 범위 밖.
- **오펀 `ToggleSwitch.tsx` 삭제** 포함할지(기본: 보류).

## 범위 밖 (하지 않을 것)
- `services/api/storyNationApi.ts` 편집(안 A에서는 불필요).
- `useAccountStore.ts`의 `setAdlultMode` 호출부·`updateSafetyMode` 정의 편집.
- `FilterControls`/`search`/`card`/`main` 등 소비처 리팩터링.
- 성인인증(`adultVerification`) 모달 및 캐릭터 생성 나이 게이팅 로직.
- 서버측 저장 safety 값 마이그레이션.
- 오펀 컴포넌트 삭제(별도 이슈).
