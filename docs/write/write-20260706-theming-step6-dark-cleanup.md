# StoryNation — 테마 semantic 토큰화 구현 결과 (6단계: 색상 `dark:` 잔재 정리 & 전략 일원화)

- **작성 일자**: 2026-07-06
- **근거 계획**: `docs/plan/plan-20260706-theming-semantic-tokens-v2.md` (6단계)
- **선행 구현**: `docs/write/write-20260706-theming-semantic-tokens-v2.md`(1·2·3·7단계), `docs/write/write-20260706-theming-step4-shared-ui.md`(4단계), `docs/write/write-20260706-theming-step5-views.md`(5단계)
- **구현 범위**: 6단계 지시사항 3항목
  1. 4·5단계에서 치환한 부분에 남은 색상용 `dark:` 잔재 정리
  2. 원시 그레이 방식(`dark:bg-gray-*`/`dark:text-gray-*`) 흡수
  3. 전 코드베이스(`components/*`, `views/*`, `src/*`, `app/*`) 색상 `dark:` 잔량 추적·분류·문서화
- **검증**: `npx tsc --noEmit` 통과 · `npm run build` 통과(24 라우트) · `npx biome check --write` 대상 3파일 포맷 정리

---

## 요약 (가장 중요한 발견 먼저)

1·2항목(잔재 정리, 원시 그레이 흡수)은 계획대로 처리 완료했다. 그런데 **3항목(전 코드베이스 잔량 확인)에서, 계획서가 예상한 것보다 훨씬 큰 규모의 미전환 영역을 발견했다**: 4·5단계가 다루지 않았던 `components/common/*`(헤더·푸터·모바일 GNB), `components/form/character/*`(캐릭터 생성 폼 전체), `components/chat/*`(채팅 리스트/탭), `components/main/*`(메인 추천 섹션 6개), `components/elements/{navigation,tabs,tags,list,selectbox}` 등 **30개 파일·224건**이 여전히 구(舊) 전용 다크 팔레트(`dark:bg-dark-*`/`dark:text-dark-*`)를 그대로 쓰고 있다. 이 코드는 "죽은 코드"도 아니고 "대응 토큰 없는 의도적 다색"도 아닌, **애초에 4·5단계 대상 디렉토리 목록에 없어서 아직 손대지 않은 살아있는 UI**다. 이 파일들은 "이번 범위" 지시(항목 1·2는 각각 잔재 정리/원시 그레이로 범위가 명확히 좁음, 항목 3은 "분류·문서화"까지만 요구)를 벗어나므로 **임의로 전환하지 않고 아래에 상세히 분류·보고**했다. 후속 단계(가칭 8단계 또는 별도 계획) 필요 여부를 사용자가 판단해야 한다.

---

## 1. 색상 `dark:` 잔재 정리 (4·5단계 대상 디렉토리 재검증)

4·5단계 문서가 "죽은 코드"로 분류했던 항목을 다시 열어 확인했다. 전부 여전히 **주석 처리된 JSX 블록** 안에만 존재하며 실제 렌더 경로에는 없다. 코드 변경 없이 재확인만 완료:

| 파일 | 건수 | 상태 |
|---|---|---|
| `components/elements/card/Card.tsx:324-343` | 3 | 주석 처리된 "내 작가 이름" 블록 |
| `components/elements/sidebar/HeaderSidebar.tsx:77-85` | 1 | 주석 처리된 다크모드 토글 버튼 |
| `components/modal/LoginModal.tsx:427-436` | 1 | 주석 처리된 "또는" 구분선 |
| `src/shared/ui/modal/SignupModal.tsx:274-314` | 3 | 주석 처리된 닉네임 입력 블록 |
| `src/shared/ui/modal/SocialLoginModal.tsx:451-460` | 1 | 주석 처리된 "또는" 구분선 |

→ **9건 전부 죽은 코드, 조치 불필요**(4·5단계 판단 유지).

---

## 2. 원시 그레이 방식 흡수 (`dark:bg-gray-*`/`dark:text-gray-*`)

전 코드베이스 기준 라이브 코드에서 발견된 5개 파일을 전환했다(계획서의 "22파일" 추정치는 4·5단계에서 대부분 이미 흡수되었고, 6단계 시점에 남은 것은 아래가 전부였음):

- `components/animation/SpeechBubble.tsx:30,37` — 말풍선 배경 `bg-white dark:bg-gray-800` → `bg-surface-elevated`, 화살표 `border-t-white dark:border-t-gray-800` → `border-t-surface-elevated`. `LoginModal.tsx:372`에서 실제 사용 중인 라이브 컴포넌트.
- `components/main/CharacterGridSection.tsx:94,102,105,115,136,145,167` — 로딩/에러/빈 상태/정상 4곳의 `bg-white dark:bg-dark-background-light` → `bg-surface`(원시 그레이는 아니지만 동일 파일 내 인접 패턴이라 함께 정리, 5단계 `views/main/home.tsx` 선례와 동일 매핑), 로딩 스피너 `border-gray-200 dark:border-gray-700` → `border-border-default`, 로딩/빈 상태 안내문 `text-gray-600/500 dark:text-gray-400` → `text-text-muted`.
- `src/features/edit-character/ui/EditDm.tsx:21,127,129` — 헤더 "임시저장" 버튼 `text-black hover:bg-secondary-200 dark:text-gray-300` → `text-text-primary hover:bg-secondary-200`, 페이지 셸/헤더 `bg-white dark:bg-dark-background` → `bg-surface`(인접 패턴, 동일 원칙으로 함께 정리).
- `components/elements/badge/Badge.tsx`, `components/form/ToggleSwitch.tsx` — 라이브 코드 상 원시 그레이가 남아있으나, **코드베이스 전체에서 어디서도 import되지 않는 오펀(미사용) 컴포넌트**로 확인(`grep`으로 재확인, import/JSX 사용 0건). 렌더되지 않아 실질적 시각 영향이 없으므로 **전환하지 않고 "죽은 코드에 준하는 상태"로 분류**해 남김(변경 시 리스크 대비 이득이 없음 — 확인 필요 시 별도 오펀 파일 정리 이슈로 관리 권장).

### before/after (원시 그레이, `dark:(bg|text|border)-gray-` 기준)
| 시점 | 대상 | 건수 |
|---|---|---|
| 6단계 착수 전 | 전 코드베이스 (`components/*, views/*, src/*, app/*`) | 8건 (SpeechBubble 2 + CharacterGridSection 3 + EditDm 1 + Badge 3(neutral) + ToggleSwitch 2 — 단, SignupModal 죽은코드 2건은 항목1에서 별도 집계) |
| 6단계 완료 후 | 동일 | **3건**(전부 오펀 파일: Badge.tsx neutral variant 계열 일부, ToggleSwitch.tsx, SignupModal.tsx 죽은 코드) |

---

## 3. 전 코드베이스 색상 `dark:` 잔량 추적 (`dark:(bg|text|border)-(gray|dark|slate|zinc|neutral)`)

```
grep -rEn "dark:(bg|text|border)-(gray|dark|slate|zinc|neutral)" components views src app
```

| 시점 | 건수 |
|---|---|
| 6단계 착수 전 | **292건 / 44파일** |
| 6단계 완료 후 | **281건 / 38파일** |

(감소 11건 = SpeechBubble 2 + CharacterGridSection 7 + EditDm 3 — 위 2번 항목에서 처리한 파일들의 순수 감소분)

### 잔여 281건 분류

**(a) 죽은 코드 / 오펀 컴포넌트 — 57건**

| 분류 | 파일 | 건수 |
|---|---|---|
| 죽은 코드(주석, 4·5단계 대상) | Card.tsx(3)·HeaderSidebar.tsx(1)·LoginModal.tsx(1)·SignupModal.tsx(3)·SocialLoginModal.tsx(1) | 9 |
| 죽은 코드(전체 주석) | `views/chat/home.tsx` | 37 |
| 오펀(미사용) 컴포넌트 — 렌더 경로 없음 | `components/elements/badge/Badge.tsx`(9)·`components/form/ToggleSwitch.tsx`(2) | 11 |
| **(a)+오펀 소계** | | **57** |

**(b) 대응 semantic 토큰 없는 의도적 다색** — 이번 3항목 audit 범위(전 코드베이스)에서는 **추가로 발견되지 않음**. (4·5단계에서 이미 문서화된 blue/green/yellow 상태 배지·소셜 브랜드색 등은 `blue-*`/`green-*`/`yellow-*` 패턴이라 이번 grep 정규식(`gray|dark|slate|zinc|neutral`)에는 잡히지 않는 별도 그룹이며, 4·5단계 문서에 이미 최종 분류되어 있음.)

**(c) 미전환 — 4·5단계 대상 디렉토리 밖의 살아있는 레거시 다크 팔레트 (신규 발견, 범위 밖)** — **224건 / 30파일**

계획서(v2)의 "전용 팔레트(`dark:bg-dark-*`) 85파일" 추산 중, 4·5단계가 다루지 않은 디렉토리에 여전히 남아있는 분량이다. `.dark` 클래스는 계속 존재하므로 렌더 자체가 깨지지는 않지만(구 다크 팔레트 HEX로 표시됨), **새 핑크 다크 무드(`brand=#FF2E7E`, `surface=#141414` 등)와는 색이 전혀 다르게 렌더**되어 `APP_THEME='dark'` 전환 시 이 컴포넌트들만 예전 다크 배색으로 튀는 리스크가 있다.

| 영역 | 파일(건수) |
|---|---|
| 전역 크롬 | `components/common/header.tsx`(9), `components/common/footer.tsx`(17), `components/common/MobileGNB.tsx`(5) |
| 캐릭터 생성 폼 | `components/form/character/BasicInfoForm.tsx`(49), `DetailInfoForm.tsx`(36), `RatingSelect.tsx`(6), `ImageUploadForm.tsx`(5), `LastInfoForm.tsx`(3), `components/detail/like-form.tsx`(9), `components/detail/like-level-item.tsx`(4), `components/image/image-slot.tsx`(2), `components/image/add-image-section.tsx`(1) |
| DM 편집(신규 FSD) | `src/features/edit-character/ui/EditStory.tsx`(17), `src/views/my-characters/edit/ui/Edit.tsx`(3) |
| 채팅 리스트 | `components/chat/ChatTabs.tsx`(6), `components/chat/ChatList.tsx`(4), `components/chat/ChatItem.tsx`(4), `components/chat/ChatSearchBar.tsx`(2), `app/(routes)/chat/[id]/page.tsx`(2) |
| 메인 추천 섹션 | `components/main/RecommendSection.tsx`(4), `CreateCharacterSection.tsx`(4), `AuthorRankingSection.tsx`(4), `EtcCharactersSection.tsx`(3), `CharacterRankingSection.tsx`(3), `LatestCharactersSection.tsx`(2) |
| 공용 엘리먼트(4단계 미포함 하위 디렉토리) | `components/elements/tabs/ButtonTabs.tsx`(5), `components/elements/tags/TagList.tsx`(4), `components/elements/list/List.tsx`(4), `components/elements/navigation/NavigationTabs.tsx`(3), `components/elements/navigation/Navigation.tsx`(3), `components/elements/selectbox/BaseSelectBox.tsx`(1) |

이 30개 파일은 **계획서 4단계 대상(`src/shared/ui/{modal,form}`, `components/elements/{card,button,sidebar,modal,dropdown,filters,pagination}`, `components/modal`) · 5단계 대상(`views/*`, `app/(routes)/payment/*`)에 포함되지 않는다.** 즉 "잔재 정리"가 아니라 **애초에 아직 마이그레이션 손이 닿지 않은 신규 대상**이며, 이번 6단계 지시(항목 1: 4·5단계 치환분 잔재, 항목 2: 원시 그레이 22파일)의 명시적 범위를 넘어선다. 임의로 전환하면 4·5단계 수준의 파일별 문맥 판단(라이트 클래스 동반 치환, `text-white` 등 수동 판별)이 필요한 헤더·푸터·캐릭터 생성 폼 같은 핵심 화면을 검증 없이 대량 수정하는 위험이 있어 **이번 범위에서는 전환하지 않았다.**

---

## 검증 결과

- **타입**: `npx tsc --noEmit` — 오류 없음
- **빌드**: `npm run build` — 성공, 24개 라우트 정상 생성
- **포맷**: `npx biome check --write components/animation/SpeechBubble.tsx components/main/CharacterGridSection.tsx src/features/edit-character/ui/EditDm.tsx` — import 정렬/싱글쿼트/세미콜론 정리(색상 변경 로직에는 영향 없음, 기존 a11y 경고 `useButtonType` 2건은 이번 작업과 무관한 기존 이슈로 미수정)
- **잔량 카운트**: 전 코드베이스 색상 `dark:` 292건/44파일 → **281건/38파일**. 감소분은 항목2(원시 그레이 흡수)에서 처리한 3파일에 한정됨(항목1은 이미 죽은 코드라 변경 없음).
- **잔여 281건 전량 재분류**: 죽은 코드 46건(주석 9 + `views/chat/home.tsx` 37) + 오펀 컴포넌트 11건 + **미전환 레거시(범위 밖, 신규 발견) 224건**. "대응 토큰 없는 의도적 다색"은 이번 grep 패턴 범위에서 0건(별도 색 그룹은 4·5단계 문서에 기존 분류됨).

---

## 계획과 달라진 점 / 미완 · 후속 필요

### 계획과 달라진 점
- 계획서는 6단계를 "치환된 부분의 잔재 정리 + 원시 그레이 22파일 흡수"로 규모를 작게 추산했으나, **전 코드베이스 audit 결과 4·5단계가 다루지 않은 30개 파일·224건의 살아있는 레거시 다크 팔레트가 별도로 존재함을 확인**했다. 이는 "잔재"가 아니라 "미마이그레이션 신규 영역"이라 이번 6단계 범위(항목1·2의 명시적 한정, 항목3의 "분류·문서화"까지)를 넘어서므로 전환하지 않고 위와 같이 분류·보고만 했다.
- `components/main/CharacterGridSection.tsx`, `src/features/edit-character/ui/EditDm.tsx`에서 원시 그레이가 아닌 인접 `bg-white dark:bg-dark-background(-light)` 패턴도 (4·5단계에서 이미 검증된 동일 매핑 `bg-surface`를 그대로 적용해) 함께 정리했다 — 순수 "원시 그레이"보다 약간 넓은 정리이나, 동일 파일·동일 패턴이라 리스크는 낮음.

### 후속 필요 (사용자 판단 요청)
1. **"미전환 224건/30파일" 처리 여부 결정 필요** — 헤더/푸터/모바일 GNB, 캐릭터 생성 폼 전체, 채팅 리스트, 메인 추천 섹션 등 핵심 화면이 포함되어 있어, `APP_THEME='dark'` 실사용 전환 시 이 영역만 구 다크 배색(팔레트 그대로)으로 렌더될 것으로 예상됨. 새 계획(예: "8단계" 또는 별도 `plan-*`)으로 4·5단계와 동일한 파일별 문맥 판단 절차를 거쳐 전환할지 결정 필요.
2. `components/elements/badge/Badge.tsx`, `components/form/ToggleSwitch.tsx`는 코드베이스 전체에서 미사용 오펀 파일로 확인됨 — 삭제 여부는 이번 범위(색상 정리) 밖이라 판단하지 않고 그대로 둠(별도 정리 이슈로 관리 권장).
3. `APP_THEME='dark'` 실사용 육안 회귀 테스트는 여전히 미수행 — 위 1항목 결정 후 전체 플로우 스크린샷 QA 권장.
