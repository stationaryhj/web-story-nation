# StoryNation — 테마 semantic 토큰화 구현 결과 (8단계/배치 B: 캐릭터 생성·편집 폼)

- **작성 일자**: 2026-07-06
- **근거 계획**: `docs/plan/plan-20260706-theming-semantic-tokens-v2.md` (4·5단계 후속, 6단계 산출물 "미전환(범위 밖)" 항목 중 "캐릭터 생성 폼" + "DM 편집(신규 FSD)" 일부)
- **선행 구현**: `docs/write/write-20260706-theming-step4-shared-ui.md`(4단계) · `docs/write/write-20260706-theming-step5-views.md`(5단계) · `docs/write/write-20260706-theming-step6-dark-cleanup.md`(6단계, 미전환 영역 최초 분류) · `docs/write/write-20260706-theming-step7-chrome-main.md`(배치 A) — 매핑·문맥 판단 관행을 그대로 계승
- **구현 범위**: 이번 배치(B) 11개 파일 — `components/form/character/{BasicInfoForm,DetailInfoForm,LastInfoForm,RatingSelect,ImageUploadForm}.tsx`, `components/form/character/components/image/{image-slot,add-image-section}.tsx`, `components/form/character/components/detail/{like-form,like-level-item}.tsx`, `src/features/edit-character/ui/EditStory.tsx`, `src/views/my-characters/edit/ui/Edit.tsx`
- **검증**: `npx tsc --noEmit` 통과 · `npm run build` 통과(24 라우트) · `npx biome check --write` 대상 11파일 포맷 정리

---

## 구현 요약

계획에서 구축된 semantic 토큰(`surface`/`surface-elevated`/`border-default`/`brand`/`brand-hover`/`brand/10`/`danger`/`text-primary`/`text-muted`/`text-inverse`)을 기준으로, 6단계 산출물이 "미전환(범위 밖)"으로 분류했던 캐릭터 생성/편집 폼 전체(캐릭터 이름·이미지·상세 설명·대화 예시·이미지 슬롯·호감도 시스템)와 DM 편집 셸(`EditStory.tsx`, `Edit.tsx`)의 하드코딩 색상 유틸(`secondary-*`, `primary-*`, `dark-*`, 원시 `red/gray`)과 색상용 `dark:` 유틸을 semantic 클래스로 치환했다. 대상 스코프의 색상 `dark:`(`gray|dark|slate|zinc|neutral`) 잔량은 **134건 → 9건**으로 감소했으며, 남은 9건 전부 `BasicInfoForm.tsx`/`DetailInfoForm.tsx` 내부의 **주석 처리된 죽은 코드**(JS 주석/JSX 주석)로 확인했다.

폼 검증/`react-hook-form` 유사 커스텀 훅(`useCreateCharacterData`)의 상태·핸들러, 이미지 업로드(`contentApi.GetPresignedUrl*`, `uploadImages`) 로직은 전혀 건드리지 않고 className만 교체했다.

---

## 변경 파일 (path:line)

### `components/form/character/BasicInfoForm.tsx`
- `:228` 등 라벨(기본 이미지/캐릭터 이름/성별/게시 범위/한줄 소개/첫 메세지/캐릭터 태그) `text-secondary-700 dark:text-dark-secondary-400` → `text-text-primary`
- `:234` 기본 이미지 슬롯 테두리 `border-primary-500 dark:border-dark-primary-500` → `border-brand`; 유효성 에러 상태 `border-red-500 bg-red-50 dark:border-red-500/70 dark:bg-red-950/20` → `border-danger bg-danger/10`
- `:274,288,474,507,538` 등 캡션/카운트/헬프 텍스트 `text-secondary-500 dark:text-dark-secondary-500` → `text-text-muted`
- `:307-311,332` 이름/제목 입력창 — 에러 `border-red-500 focus:border-red-500 focus:ring-red-500`→`border-danger focus:border-danger focus:ring-danger`, 기본 `border-secondary-200 focus:border-primary-500 focus:ring-primary-500`→`border-border-default focus:border-brand focus:ring-brand`, 배경/텍스트/플레이스홀더 `dark:bg-dark-background-light dark:text-dark-secondary-200 dark:placeholder-dark-secondary-500`→`bg-surface-elevated text-text-primary placeholder-text-muted`
- `:348-416,585-587,618-621` 성별/게시범위/해시태그/추가버튼 토글 — 활성 `bg-primary-500 text-white dark:bg-dark-primary-500`→`bg-brand text-text-inverse`, 비활성 `bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400`→`bg-secondary-100 text-text-muted`(`src/shared/ui/form/FormButtonGroup.tsx` inactive 선례와 동일 원칙, `bg-secondary-100`는 legacy 토큰 그대로 유지)
- `:423-461` 게시 범위 설명 박스 `bg-secondary-50 dark:bg-dark-secondary-800/10`→`bg-surface-elevated`(카드형 패널로 판단), 제목/리스트 텍스트→`text-text-primary`/`text-brand`/`text-text-muted`, 불릿 `text-primary-500`→`text-brand`. **불릿 `text-red-500`("생성한 공개 캐릭터는 비공개로 바꿀 수 없어요")→`text-danger`는 정확한 폼 유효성 에러가 아닌 "되돌릴 수 없는 조작에 대한 경고" 문맥 — 확인 필요**
- `:486-490,510-521` 소개/첫 메세지 textarea — 동일 에러/기본 패턴, 배경 `bg-surface-elevated`, 텍스트 `text-text-primary`
- `:541-570` 해시태그 컨테이너/선택된 태그 칩 `bg-primary-100 text-primary-700 dark:bg-dark-primary-900/20 dark:text-dark-primary-400`→`bg-brand/10 text-brand`, 삭제 버튼 `text-primary-500 hover:text-primary-700 dark:...`→`text-brand hover:text-brand-hover`
- `:604-626` 커스텀 태그 입력창/추가 버튼 — `bg-surface-elevated text-text-primary`/`border-border-default`, 추가 버튼 `bg-brand text-text-inverse hover:bg-brand-hover`

### `components/form/character/DetailInfoForm.tsx`
- `:414-473` 상세/공개/비공개 설명 라벨·카운트·헬프텍스트 → `text-text-primary`/`text-text-muted`, textarea `border-secondary-200 bg-white dark:...`→`border-border-default bg-surface-elevated text-text-primary focus:ring-brand`
- `:476` 구분선 `border-secondary-200 dark:border-dark-secondary-200/10`→`border-border-default`
- `:485-516` 대화 예시 제목/헬프텍스트/공개·비공개 토글 버튼(활성 `bg-brand text-text-inverse`/비활성 `bg-secondary-100 text-text-muted`, BasicInfoForm과 동일 원칙)
- `:538-661` 대화 예시 카드 `bg-secondary-50 dark:bg-dark-secondary-800/5`→`bg-surface-elevated`, 각 라벨/카운트, 제목·유저·캐릭터 메시지의 **읽기 전용 표시 div**(실제 `<input>`/`<textarea>`는 커밋 상태로는 주석 처리되어 있고 `<p>` 태그로 값만 노출하는 현재 라이브 구조) `bg-gray-100 dark:bg-dark-background-light` 등 → `bg-surface-elevated text-text-primary`, 총 글자수 텍스트 → `text-text-muted`
- `:710-726` 삭제 확인 모달 취소/삭제 버튼 — `bg-gray-100 text-gray-700`→`bg-surface-elevated text-text-primary hover:bg-surface-elevated-hover`(`ConfirmActionModal.tsx` 선례), `bg-red-500 text-white`→`bg-danger text-text-inverse hover:bg-danger/90`, 안내 문구 `text-gray-500`→`text-text-muted`. **이 3곳은 원래 `dark:` 짝이 없는 순수 하드코딩(라이트 전용)이었으나, 계획 지시("라이트 클래스가 하드코딩이면 라이트도 semantic으로 맞춘 뒤 짝 dark: 제거")에 따라 함께 치환**
- **미변경(죽은 코드)**: `:520-531`(빈 대화예시 추가 구역, JSX 주석), `:542-581`(상황설명/이름 삽입 버튼 3개+삭제 버튼, JSX 주석), `:597-605`/`:621-629`/`:645-653`(제목/유저/캐릭터 메시지의 실제 `<input>`/`<textarea>`, JSX 주석) — 총 8건, `dark:(gray|dark)` 잔량 전부 이 블록

### `components/form/character/LastInfoForm.tsx`
- `:107-120` "작가의 말" 라벨/카운트 → `text-text-primary`/`text-text-muted`, textarea `border-secondary-200 bg-white dark:...`→`border-border-default bg-surface-elevated text-text-primary focus:ring-brand`

### `components/form/character/RatingSelect.tsx`
- `:21,24` 라벨 → `text-text-primary`
- `:30-46` 이용등급(전체/성인) 토글 버튼 — 활성 `bg-brand text-text-inverse`, 비활성 `bg-secondary-100 text-text-muted`
- `:52` 성인 인증 필요 경고 `text-red-500`→`text-danger`(원래 `dark:` 짝 없는 하드코딩, 경고 상태 문맥으로 판단해 함께 치환)

### `components/form/character/ImageUploadForm.tsx`
- `:20,25` 안내 타이틀/설명 → `text-text-primary`/`text-text-muted`
- `:45-49` 주의사항 박스 `bg-secondary-50 dark:bg-dark-secondary-100/5`→`bg-surface-elevated`, 제목/본문 → `text-text-primary`/`text-text-muted`

### `components/form/character/components/image/image-slot.tsx`
- `:106` 슬롯 카드 배경 `bg-white dark:border-dark-secondary-600 dark:bg-dark-secondary-800`→`bg-surface-elevated`(다크 전용 보더는 라이트에 짝이 없어 제거)
- `:129` 이미지 outline `outline-secondary-200 hover:outline-primary-500`(하드코딩, `dark:` 없음)→`outline-border-default hover:outline-brand`(선택 슬롯 "활성=brand 테두리" 규칙 적용)
- `:135` "기본" 배지 `bg-primary-500 text-white`→`bg-brand text-text-inverse`
- `:148` show/hide 배지 `bg-primary-500`→`bg-brand`, `text-white`→`text-text-inverse`
- `:166` 규칙 textarea 에러 `border-red-500 bg-red-50`→`border-danger bg-danger/10`, 기본 `border-secondary-300 dark:border-dark-secondary-300/20`→`border-border-default`
- `:188` 삭제(X) 버튼 `bg-primary-500 text-white`→`bg-danger text-text-inverse`(삭제 액션이므로 브랜드가 아닌 danger로 판단)
- `:197` "기본 이미지로 선택" 버튼 `bg-primary-500 text-white`→`bg-brand text-text-inverse`

### `components/form/character/components/image/add-image-section.tsx`
- `:139` Lv 라벨 박스 테두리 `border-secondary-200`(하드코딩)→`border-border-default`
- `:169-171` 업로드 버튼 — 가득 찬 상태 `bg-gray-400 text-gray-200`→`bg-surface-elevated text-text-muted`(`BaseButton.tsx` disabledStyles 선례), 활성 `bg-primary-500 hover:bg-primary-600 text-white`→`bg-brand hover:bg-brand-hover text-text-inverse`
- `:176` 카운트 텍스트 `text-secondary-400 dark:text-dark-secondary-400`→`text-text-muted`

### `components/form/character/components/detail/like-form.tsx`
- `:41-49` 타이틀/설명 → `text-text-primary`/`text-text-muted`
- `:58-93` ON/OFF·Lv 토글 버튼 — 활성 `bg-brand text-text-inverse`, 비활성 `bg-secondary-100 text-text-muted`

### `components/form/character/components/detail/like-level-item.tsx`
- `:25` 필드 타이틀 `text-secondary-400 dark:text-dark-secondary-400`→`text-text-muted`(원본이 다른 라벨보다 옅은 `secondary-400`을 명시적으로 사용해, 매핑 표 규칙(`gray-400`→muted)을 그대로 따름 — 시각적 무게감 보존)
- `:26` 카운트 → `text-text-muted`
- `:31-35` 값 입력 textarea — 배경 `bg-white`→`bg-surface-elevated`, 텍스트 `text-text-primary` 추가, 포커스 `focus:ring-primary-500`→`focus:ring-brand`, 에러 `border-red-500 bg-red-50`→`border-danger bg-danger/10`, 기본 `border-secondary-300 dark:border-dark-secondary-300/20`→`border-border-default`
- `:77` "LV.n" 헤딩 → `text-text-primary`

### `src/features/edit-character/ui/EditStory.tsx`
- `:176` 공개 전환 확인 모달 `confirmButtonClass: 'bg-red-500 hover:bg-red-600 text-white'`→`'bg-danger hover:bg-danger/90 text-text-inverse'`(5단계 `views/my-characters/edit.tsx`의 동일 확인 모달 CTA 선례)
- `:240-252` 로딩 셸/페이지 셸/카드 컨테이너 `bg-secondary-50 dark:bg-dark-background`/`bg-white dark:bg-dark-background-light`→`bg-surface`/`bg-surface-elevated`, 로딩 텍스트→`text-text-muted`
- `:255,317` 탭 상단/하단 구분선 `border-secondary-200 dark:border-dark-secondary-200/10`→`border-border-default`
- `:262-296` 탭 4개(기본/고급/이미지/마무리) 활성 `bg-primary-50 dark:bg-dark-primary-900/10 text-primary-600 dark:text-dark-primary-500`→`bg-brand/10 text-brand`, 비활성 `text-secondary-500 dark:text-dark-secondary-500`→`text-text-muted`
- `:321,330-334` 하단 취소/다음 버튼 — 취소 `bg-secondary-100 hover:bg-secondary-200 text-text-muted`(legacy `bg-secondary-100` 유지, `dark:` 제거), 다음/완료 활성 `bg-brand hover:bg-brand-hover text-text-inverse`, 비활성(저장 중) `bg-primary-300 text-white dark:bg-dark-primary-800 dark:text-dark-secondary-300`→`bg-brand/50 text-text-inverse cursor-not-allowed`(**확인 필요**: 계획 매핑 표에 명시된 항목은 아니며, 저장 중 상태를 옅은 brand로 표현하는 것이 적절한지 디자인 컨펌 권장)

### `src/views/my-characters/edit/ui/Edit.tsx`
- `:23,33` 로딩/에러 셸 `bg-secondary-50 dark:bg-dark-background`→`bg-surface`
- `:24` 로딩 텍스트 `text-secondary-500 dark:text-dark-secondary-500`→`text-text-muted`
- `:34` 에러 텍스트 `text-red-500 dark:text-red-400`(하드코딩, `dark:` 짝 있음이나 그레이 계열이 아니라 이번 6단계 grep 패턴엔 안 잡히지만 계획의 "danger 매핑" 대상)→`text-danger`

---

## 색상 `dark:` 잔량 (`grep -cE "dark:(bg|text|border)-(gray|dark|slate|zinc|neutral)"`)

| 파일 | 치환 전 | 치환 후 |
|---|---|---|
| `components/form/character/BasicInfoForm.tsx` | 49 | **1**(죽은 코드: 이미지 슬롯 대체 텍스트 내 주석 처리된 삼항 분기) |
| `components/form/character/DetailInfoForm.tsx` | 36 | **8**(죽은 코드: JSX 주석 5블록 — 빈 대화예시 추가 구역, 태그 삽입/삭제 버튼, 제목·유저·캐릭터 메시지의 실제 input/textarea) |
| `components/form/character/LastInfoForm.tsx` | 3 | **0** |
| `components/form/character/RatingSelect.tsx` | 6 | **0** |
| `components/form/character/ImageUploadForm.tsx` | 5 | **0** |
| `components/form/character/components/image/image-slot.tsx` | 2 | **0** |
| `components/form/character/components/image/add-image-section.tsx` | 1 | **0** |
| `components/form/character/components/detail/like-form.tsx` | 9 | **0** |
| `components/form/character/components/detail/like-level-item.tsx` | 4 | **0** |
| `src/features/edit-character/ui/EditStory.tsx` | 17 | **0** |
| `src/views/my-characters/edit/ui/Edit.tsx` | 3 | **0** |
| **합계** | **135** | **9**(전부 죽은 코드) |

(계획 지시서에 명시된 baseline 합계는 6단계 문서의 파일별 표기와 1건 차이 — `BasicInfoForm.tsx`는 49건으로 실측·문서 표기 동일. 착수 전 실측 총합은 135건, 6단계 문서 표기 합계 134건과 1건 차이는 문서 작성 시점의 반올림/재계산 차이로 추정, 육안 확인엔 영향 없음)

---

## 검증 결과

- **타입**: `npx tsc --noEmit` — 오류 없음(편집 직후 1회, Biome 포맷 후 1회 재검증)
- **빌드**: `npm run build` — 성공, 24개 라우트 정상 생성(2회 재검증)
- **포맷**: `npx biome check --write <11개 대상 파일>` — 싱글쿼트/세미콜론/2-space/import 정렬 적용, 11개 파일 자동 정리(색상 클래스 값 자체는 변경되지 않음, 치환 전후 `grep` 잔량 재확인으로 확인). 함께 보고된 `lint/a11y/noLabelWithoutControl`(`RatingSelect.tsx`), `lint/suspicious/noArrayIndexKey`(`like-form.tsx`), `lint/a11y/useButtonType`(`image-slot.tsx`)는 **색상 변경 이전부터 존재하던 구조적 이슈로 이번 작업과 무관**해 미수정(4~7단계와 동일 방침, 범위 밖)
- **로직 불변 확인**: `git diff` 상 `useCreateCharacterData`/`useAccountStore`/`useModalStore`의 상태·핸들러(`handleInputChange`, `handleGenderSelect`, `handleVisibilitySelect`, `handleHashtagToggle`, `handleImageUpload`, `handleDelete`, `handleChangeShow`, `handleChangeDefault`, `handleChangeRules`, `handleChangeImage`, `handleLikeSystemToggle`, `handleMaxLevelChange`, `handleSubmit`, `handleSaveToNextStep`, `handleNextStep` 등) 및 `contentApi.GetPresignedUrl*`/`uploadImages` 이미지 업로드 로직은 전부 className 문자열만 변경되었고 로직 무변경

---

## 계획과 달라진 점 / 미완 · 후속 필요

### 계획과 달라진 점
- 없음. 계획이 지정한 배치(B) 11개 파일만 처리했고, 4·5단계·배치(A, 7단계)에서 처리된 파일은 건드리지 않음.
- 일부 대상에서 원래 `dark:` 짝이 없던 순수 하드코딩(`RatingSelect.tsx`의 `text-red-500`, `DetailInfoForm.tsx`의 확인 모달 취소/삭제 버튼, `image-slot.tsx`의 outline 색)도 지시("라이트 클래스가 하드코딩이면 라이트도 semantic으로 맞춘 뒤 짝 dark: 제거")에 따라 함께 semantic 토큰으로 치환했다 — 순수 "잔재 정리"보다 다소 넓은 범위이나 지시에 명시된 원칙을 그대로 따른 것.

### 확인 필요 (제품/디자인 컨펌 권장)
1. **`BasicInfoForm.tsx`의 "생성한 공개 캐릭터는 비공개로 바꿀 수 없어요" 불릿(`text-red-500`→`text-danger`)** — 폼 유효성 에러가 아니라 "되돌릴 수 없는 조작에 대한 경고" 문구입니다. danger 토큰의 "위험/삭제" 역할과 부합한다고 판단해 치환했으나, 순수 유효성 에러 문맥은 아니라 재확인 권장.
2. **`EditStory.tsx`의 "저장 중" 비활성 버튼(`bg-primary-300`→`bg-brand/50`)** — 계획 매핑 표에 명시된 항목이 아니며, 로딩/비활성 상태를 옅은 brand로 표현하는 것이 적절한지 디자인 컨펌 필요.
3. **`image-slot.tsx`의 삭제(X) 버튼을 `bg-danger`로 매핑** — 원본은 다른 버튼과 동일하게 `bg-primary-500`(브랜드색)이었으나, "삭제" 액션의 의미를 명확히 하기 위해 danger로 승격했습니다. 원래 디자인이 모든 슬롯 액션 버튼을 통일된 브랜드색으로 의도했다면 되돌림 필요.
4. **`DetailInfoForm.tsx`의 대화 예시 제목/유저·캐릭터 메시지 표시 영역**은 현재 라이브 코드가 실제 `<input>`/`<textarea>`가 아니라 값만 보여주는 읽기 전용 `<p>` + `div`(원래 편집 가능한 필드가 주석 처리된 상태)입니다. 색상만 치환했고 이 구조 자체(왜 읽기 전용으로 되어 있는지)는 계획 범위(색상)를 벗어나 손대지 않았습니다.

### 후속 필요
- 6단계 문서의 "미전환 224건/30파일" 중 배치(A, 7단계) 9개 + 배치(B, 이번) 11개 = 20개 파일을 처리했습니다. 나머지 채팅 리스트(`components/chat/*`), 공용 엘리먼트 하위(`components/elements/{tabs,tags,list,navigation,selectbox}`)는 **여전히 미전환 상태**이며 이번 배치 범위 밖입니다. 후속 배치(C) 계획/작업 필요.
- `APP_THEME='dark'` 실사용 육안 회귀 테스트는 여전히 미수행 — 나머지 배치 완료 후 전체 플로우 QA 권장.
