# StoryNation — 테마 semantic 토큰화 구현 결과 (9단계/배치 C: 채팅 리스트 & 공용 엘리먼트 — 계획 후속 30파일 정리 완료)

- **작성 일자**: 2026-07-06
- **근거 계획**: `docs/plan/plan-20260706-theming-semantic-tokens-v2.md` (4·5단계 후속, 6단계 산출물 "미전환(범위 밖)" 224건/30파일 중 마지막 잔여 "채팅 리스트" + "공용 엘리먼트 하위" 그룹)
- **선행 구현**: `docs/write/write-20260706-theming-step6-dark-cleanup.md`(6단계, 224건/30파일 최초 분류) · `docs/write/write-20260706-theming-step7-chrome-main.md`(배치 A, 9파일) · `docs/write/write-20260706-theming-step8-character-form.md`(배치 B, 11파일) — 매핑·문맥 판단 관행을 그대로 계승
- **구현 범위**: 이번 배치(C) — 지시받은 16개 파일 중 실제 색상 변경이 필요했던 11개 파일
  - `components/chat/{ChatList,ChatItem,ChatTabs,ChatSearchBar}.tsx`
  - `components/elements/tabs/ButtonTabs.tsx`, `components/elements/tags/TagList.tsx`, `components/elements/list/List.tsx`
  - `components/elements/navigation/{Navigation,NavigationTabs}.tsx`
  - `components/elements/selectbox/BaseSelectBox.tsx`
  - `app/(routes)/chat/[id]/page.tsx`
  - **변경 없음(재확인만)**: `components/elements/card/Card.tsx`(3건)·`components/elements/sidebar/HeaderSidebar.tsx`(1건)·`components/modal/LoginModal.tsx`(1건)·`src/shared/ui/modal/SignupModal.tsx`(3건)·`src/shared/ui/modal/SocialLoginModal.tsx`(1건) — 전부 6단계 문서가 이미 "죽은 코드(주석)"로 분류한 블록과 동일 위치에서 그대로 재확인됨. 라이브 코드 상 다른 하드코딩(소셜 브랜드 HEX 등)도 함께 점검했으나 해당 5파일은 전부 주석 처리된 죽은 코드 또는 소셜 로그인 브랜드색(구글/카카오/네이버, 의도적 유지)뿐이라 **변경하지 않았다.**
- **검증**: `npx tsc --noEmit` 통과 · `npm run build` 통과(24 라우트)

---

## 구현 요약

계획에서 구축된 semantic 토큰(`surface`/`surface-sunken`/`surface-elevated`/`surface-elevated-hover`/`border-default`/`brand`/`brand-hover`/`brand/10`/`text-primary`/`text-muted`/`text-inverse`)을 기준으로, 6단계 산출물이 "미전환(범위 밖)"으로 분류한 224건/30파일 중 마지막 그룹인 "채팅 리스트"(5파일 18건)와 "공용 엘리먼트 하위"(6파일 20건), 총 38건을 semantic 클래스로 치환했다. 대상 스코프의 색상 `dark:`(`gray|dark|slate|zinc|neutral`) 잔량은 **38건 → 0건**으로 감소했다.

이번 배치로 6단계가 최초 발견한 **224건/30파일(배치A 51건+배치B 135건+배치C 38건)이 모두 전환 완료**되어, "계획 후속(30파일) 정리"가 종료되었다.

`ChatList/ChatItem/ChatTabs/ChatSearchBar`(`components/chat/*`)는 오펀(미사용) 컴포넌트로 확인됨(아래 "계획과 달라진 점" 참조)이나, 지시받은 배치 대상에 명시적으로 포함되어 있어 예외 없이 전환했다. 로직·핸들러·상태는 전혀 건드리지 않고 className만 교체했다.

---

## 변경 파일 (path:line)

### `components/chat/ChatList.tsx`
- `:55` 카드 배경 `bg-white dark:bg-dark-background-light` → `bg-surface-elevated` (`views/chat-list/home.tsx`의 이미 전환된 동일 성격 컨테이너와 동일 매핑)
- `:60` 타이틀 `text-secondary-900 dark:text-dark-secondary-700` → `text-text-primary`
- `:74` 빈 상태 안내문 `text-secondary-500 dark:text-dark-secondary-500` → `text-text-muted`
- `:80` "첫캐릭터 만들기" CTA `bg-primary-500 hover:bg-primary-600 text-white dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700` → `bg-brand hover:bg-brand-hover text-text-inverse`

### `components/chat/ChatItem.tsx`
- `:23-27` 아이템 배경 — 선택 `bg-primary-50 dark:bg-dark-primary-900/20` → `bg-brand/10`, 호버(미선택) `hover:bg-secondary-50 dark:hover:bg-dark-secondary-100/10` → `hover:bg-surface-elevated-hover`
- `:42` 이름 `text-secondary-900 dark:text-dark-secondary-700` → `text-text-primary`
- `:45` 시각 `text-secondary-500 dark:text-dark-secondary-500` → `text-text-muted`
- `:49` 마지막 메시지 `text-secondary-600 dark:text-dark-secondary-500` → `text-text-muted`

### `components/chat/ChatTabs.tsx`
- `:16` 탭 컨테이너 구분선 `border-secondary-100 dark:border-dark-secondary-200` → `border-border-default`
- `:20,31` 활성 탭 `text-primary-600 dark:text-dark-primary-600 border-b-2 border-primary-500 dark:border-dark-primary-500` → `text-brand border-b-2 border-brand`
- `:21,32` 비활성 탭 `text-secondary-500 dark:text-dark-secondary-500 hover:text-secondary-700 dark:hover:text-dark-secondary-300` → `text-text-muted hover:text-text-primary`
- `:42` 정렬 버튼 `text-secondary-500 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600` → `text-text-muted hover:text-brand`

### `components/chat/ChatSearchBar.tsx`
- `:28` 검색 입력창 `bg-secondary-50 dark:bg-dark-secondary-100/10 text-secondary-900 dark:text-dark-secondary-700 ... focus:ring-primary-500 dark:focus:ring-dark-primary-500` → `bg-surface-elevated text-text-primary ... focus:ring-brand` (`views/chat-list/home.tsx`의 동일 검색 입력창과 정확히 동일 매핑 — "탭바·검색바 크롬"의 `bg-surface-sunken`은 header/footer/GNB 같은 페이지 레벨 바 컨테이너 전용으로 확인, 개별 검색 input은 기존 라이브 선례를 따라 `bg-surface-elevated` 사용)
- `:33` 검색 버튼 `text-secondary-500 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-500` → `text-text-muted hover:text-brand`

### `components/elements/tabs/ButtonTabs.tsx`
- `:183` 활성/비활성 탭 텍스트 `text-primary-600 dark:text-dark-primary-500` / `text-secondary-600 hover:text-primary-500 dark:text-dark-secondary-400 dark:hover:text-dark-primary-400` → `text-brand` / `text-text-muted hover:text-brand`
- `:194` 하단 인디케이터 바 `bg-primary-500 dark:bg-dark-primary-500` → `bg-brand`
- `:213-214` 해시태그 칩 — 선택 `bg-primary-100 text-primary-700 dark:bg-dark-primary-900/50 dark:text-dark-primary-300` → `bg-brand/10 text-brand`, 미선택 `bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-300 dark:hover:bg-dark-secondary-700` → `bg-surface-elevated text-text-muted hover:bg-surface-elevated-hover`

### `components/elements/tags/TagList.tsx`
- `:163` 로딩 스켈레톤 `bg-gray-200 dark:bg-dark-secondary-800` → `bg-surface-elevated`
- `:183,215` 선택된 태그 칩 `bg-primary-100 text-primary-700 dark:bg-dark-primary-900/50 dark:text-dark-primary-300` → `bg-brand/10 text-brand` (선택된 태그 렌더 블록 2곳 — 상단 요약 영역 + 목록 내 표시)
- `:216` 미선택 태그 칩 `bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-300 dark:hover:bg-dark-secondary-700` → `bg-surface-elevated text-text-muted hover:bg-surface-elevated-hover`

### `components/elements/list/List.tsx`
- `:53` 리스트 외곽 보더(옵션) `border-secondary-200 dark:border-dark-secondary-700` → `border-border-default`
- `:68,70` 아이템 호버/구분선 `hover:bg-secondary-50 dark:hover:bg-dark-secondary-800/50` → `hover:bg-surface-elevated-hover`, `border-secondary-100 dark:border-dark-secondary-800` → `border-border-default`
- `:79,81` 콘텐츠/보조콘텐츠 텍스트 `text-secondary-900 dark:text-dark-secondary-200` / `text-secondary-500 dark:text-dark-secondary-400` → `text-text-primary` / `text-text-muted`

### `components/elements/navigation/Navigation.tsx`
- `:24` nav 배경 `bg-white dark:bg-dark-background-light shadow-sm dark:shadow-dark-primary-300/10` → `bg-surface-sunken shadow-sm dark:shadow-dark-primary-300/10`(header.tsx 선례와 동일 원칙 — 그림자 색 `dark:`는 색상 아닌 유틸로 판단해 유지)
- `:38` 카테고리 버튼 활성/비활성 `border-primary-500 text-primary-600 dark:border-dark-primary-500 dark:text-dark-primary-600` / `border-transparent text-secondary-600 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600` → `border-brand text-brand` / `border-transparent text-text-muted hover:text-brand`

### `components/elements/navigation/NavigationTabs.tsx`
- `:57` nav 배경 — Navigation.tsx와 동일 매핑 `bg-surface-sunken shadow-sm dark:shadow-dark-primary-300/10`
- `:73-74` 카테고리 탭 활성/비활성 — Navigation.tsx와 동일 원칙 `text-brand border-b-2 border-brand` / `text-text-muted hover:text-brand`

### `components/elements/selectbox/BaseSelectBox.tsx`
- `:75` 라벨 `text-secondary-700 dark:text-dark-secondary-300`(유일한 `dark:` 짝 항목) → `text-text-primary`
- `:78,81-82` 셀렉트 트리거 — 텍스트 `text-gray-800` → `text-text-primary`, 배경/보더 `bg-white hover:bg-gray-50 ... border border-gray-200`(라이트 전용 하드코딩, `dark:` 짝 없음) → `bg-surface-elevated hover:bg-surface-elevated-hover ... border border-border-default`, `focus:border-primary-500` → `focus:border-brand`. **계획 지시("라이트 클래스가 하드코딩이면 라이트도 semantic으로 맞춘 뒤 짝 dark: 제거")에 따라 `dark:` 짝이 없던 순수 라이트 하드코딩도 함께 정리** — 배치 B의 `image-slot.tsx`/`DetailInfoForm.tsx` 확인 모달 선례와 동일 원칙
- `:97` 드롭다운 패널 배경 `bg-white` → `bg-surface-elevated`
- `:103-104` 옵션 — 호버 `hover:bg-gray-100` → `hover:bg-surface-elevated-hover`, 선택 `bg-violet-50 text-violet-700`(매핑 표의 `violet-* → brand`) → `bg-brand/10 text-brand`, 미선택 `text-gray-700` → `text-text-primary`

### `app/(routes)/chat/[id]/page.tsx`
- `:70-71` 페이지 셸 배경(바깥/안쪽 wrapper 2곳) `bg-neutral-100 dark:bg-dark-background-DEFAULT` → `bg-surface`
- **미변경(범위 밖 판단)**: `:75` 로딩 스피너 `border-primary-500`은 `dark:` 짝이 없고 검증 grep 패턴(`gray|dark|slate|zinc|neutral`)에도 잡히지 않아, 이번 지시가 명시한 "잔재 정리" 카운트 대상이 아니라고 판단해 손대지 않음 — **확인 필요**: 매핑 표상 `primary-* → brand`에 해당하므로 일관성을 위해 `border-brand`로 통일할지 후속 판단 필요.

---

## 색상 `dark:` 잔량 (`grep -cE "dark:(bg|text|border)-(gray|dark|slate|zinc|neutral)"`)

| 파일 | 치환 전 | 치환 후 |
|---|---|---|
| `components/chat/ChatList.tsx` | 4 | **0** |
| `components/chat/ChatItem.tsx` | 4 | **0** |
| `components/chat/ChatTabs.tsx` | 6 | **0** |
| `components/chat/ChatSearchBar.tsx` | 2 | **0** |
| `components/elements/tabs/ButtonTabs.tsx` | 5 | **0** |
| `components/elements/tags/TagList.tsx` | 4 | **0** |
| `components/elements/list/List.tsx` | 4 | **0** |
| `components/elements/navigation/Navigation.tsx` | 3 | **0** |
| `components/elements/navigation/NavigationTabs.tsx` | 3 | **0** |
| `components/elements/selectbox/BaseSelectBox.tsx` | 1 | **0** |
| `app/(routes)/chat/[id]/page.tsx` | 2 | **0** |
| `components/elements/card/Card.tsx` | 3 | 3(죽은 코드, 재확인만) |
| `components/elements/sidebar/HeaderSidebar.tsx` | 1 | 1(죽은 코드, 재확인만) |
| `src/shared/ui/modal/SignupModal.tsx` | 3 | 3(죽은 코드, 재확인만) |
| `src/shared/ui/modal/SocialLoginModal.tsx` | 1 | 1(죽은 코드, 재확인만) |
| `components/modal/LoginModal.tsx` | 1 | 1(죽은 코드, 재확인만) |
| **배치(C) 라이브 코드 합계** | **38** | **0** |

---

## 검증 결과

- **타입**: `npx tsc --noEmit` — 오류 없음
- **빌드**: `npm run build` — 성공, 24개 라우트 정상 생성
- **로직 불변 확인**: `git diff` 상 `ChatList`/`ChatTabs`/`ChatSearchBar`의 상태·핸들러(`handleSearch`, `handleSortToggle`, 탭/태그 필터링 로직), `ButtonTabs`/`Navigation`/`NavigationTabs`의 URL 파라미터 동기화(`updateUrlParams`), `BaseSelectBox`의 외부 클릭 감지·드롭다운 토글, `ChatDetailPage`의 `useChatStore`/`checkChatBotData`/`NakamaProvider` 연동은 전부 className 문자열만 변경되었고 로직 무변경
- **소셜 브랜드색 보존 확인**: `LoginModal.tsx`/`SocialLoginModal.tsx`의 구글(`#F2F2F2`/`#1F1F1F`)·카카오(`#FEE500`/`#000000D9`)·네이버(`#03C75A`) HEX는 라이브 코드에 그대로 남아있음을 재확인(변경 없음, 4단계 문서의 "의도적 유지" 분류 존중)

---

## 전 코드베이스 최종 잔량·분류 (계획 후속 30파일 정리 완료 시점)

```
grep -rEn "dark:(bg|text|border)-(gray|dark|slate|zinc|neutral)" components views src app
```

| 시점 | 건수 |
|---|---|
| 6단계 착수 전(계획 4·5단계 완료 시점) | 292건 / 44파일 |
| 6단계 완료(원시 그레이 흡수 후, "224건/30파일 미전환" 최초 발견) | 281건 / 38파일 |
| 배치 A(7단계, 전역크롬+메인추천 9파일) 완료 후 | 240건 / 29파일(추정 — 51건 감소) |
| 배치 B(8단계, 캐릭터폼+DM편집 11파일) 완료 후 | 114건 / 18파일(추정 — 135건 감소) |
| **배치 C(9단계, 이번 — 채팅리스트+공용엘리먼트 11파일) 완료 후** | **76건 / 12파일** |

(배치 A·B 완료 직후 스냅샷은 별도 기록되지 않아 각 배치 문서의 "치환 전/후" 표에서 역산한 추정치이며, 배치 C 수치는 이번 작업에서 직접 재측정한 실측값이다.)

### 최종 잔여 76건 / 12파일 — 전량 분류

| 분류 | 파일 | 건수 |
|---|---|---|
| 죽은 코드(주석 처리된 JSX/JS 블록, 렌더 경로 없음) | `components/common/header.tsx`(1) · `components/common/footer.tsx`(9) · `components/elements/card/Card.tsx`(3) · `components/elements/sidebar/HeaderSidebar.tsx`(1) · `components/form/character/BasicInfoForm.tsx`(1) · `components/form/character/DetailInfoForm.tsx`(8) · `components/modal/LoginModal.tsx`(1) · `src/shared/ui/modal/SignupModal.tsx`(3) · `src/shared/ui/modal/SocialLoginModal.tsx`(1) · `views/chat/home.tsx`(37, 전체 주석) | **65** |
| 오펀(미사용) 컴포넌트 — 코드베이스 전체에서 import 0건 | `components/elements/badge/Badge.tsx`(9) · `components/form/ToggleSwitch.tsx`(2) | **11** |
| **합계** | | **76** |

→ **잔여 76건은 전부 죽은 코드 또는 오펀 컴포넌트이며, 실제 렌더링되는 라이브 코드에는 색상용 `dark:`(`gray|dark|slate|zinc|neutral`) 유틸이 하나도 남지 않았다.** 6단계가 발견한 "224건/30파일 미전환(범위 밖)"은 배치 A(51건)·배치 B(135건)·배치 C(38건)로 전량 처리되어 계획 후속 정리가 완료되었다.

### 참고: 소셜 브랜드색 등 "대응 토큰 없는 의도적 다색"
이 grep 패턴(`gray|dark|slate|zinc|neutral`)에는 잡히지 않지만, 4~9단계 전 구간에서 일관되게 "의도적 유지"로 분류·보존한 항목:
- 소셜 로그인 브랜드색(구글 `#F2F2F2`/`#1F1F1F`, 카카오 `#FEE500`/`#000000D9`, 네이버 `#03C75A`) — `LoginModal.tsx`, `SocialLoginModal.tsx`
- 오렌지 실드 뱃지(`#FF8A00`) — 계획서가 core 토큰 승격 제외로 명시
- blue/green/yellow 등 상태 배지 — 4·5단계 문서에 기존 분류

---

## 계획과 달라진 점 / 미완 · 후속 필요

### 계획과 달라진 점
- 지시받은 16개 파일 중 5개(`Card.tsx`, `HeaderSidebar.tsx`, `LoginModal.tsx`, `SignupModal.tsx`, `SocialLoginModal.tsx`)는 재확인 결과 잔여분이 전부 6단계가 이미 분류한 죽은 코드(주석)와 동일 위치여서 **변경 없이 재확인만** 했다. 실질적으로 색상 변경이 발생한 파일은 11개다.
- **`components/chat/ChatList.tsx`/`ChatItem.tsx`/`ChatTabs.tsx`/`ChatSearchBar.tsx`는 코드베이스 전체에서 어디서도 import되지 않는 오펀(미사용) 컴포넌트로 확인됨** — 실제 채팅 목록 페이지(`/chat-list`)는 `views/chat-list/home.tsx`(5단계에서 이미 자체적으로 semantic 전환 완료)를 사용하며, `components/chat/*`는 다른 파일에서 참조되지 않는다. 지시가 이 4개 파일을 명시적으로 배치 대상에 포함했기 때문에 예외 없이 전환했으나, 6단계 문서가 유사 사례(`Badge.tsx`, `ToggleSwitch.tsx`)를 "오펀이라 리스크 대비 이득 없음"으로 판단해 제외했던 것과는 다른 결론이다. 렌더되지 않아 시각적 영향은 없으며, 향후 이 4개 파일의 삭제 여부(오펀 정리)를 별도 이슈로 검토할 필요가 있다.
- `BaseSelectBox.tsx`는 원래 `dark:` 짝이 있는 항목이 1건뿐이었으나, 계획 지시에 따라 `dark:` 짝이 없던 순수 라이트 하드코딩(트리거 배경/보더/텍스트, 드롭다운 패널, 옵션 호버/선택 상태)도 함께 semantic으로 전환했다 — 전환 전에는 다크 모드에서도 항상 흰 배경으로 렌더되던 것이 이제 정상적으로 다크 배색을 따른다(회귀가 아니라 개선).

### 확인 필요 (제품/디자인 컨펌 권장)
1. **`app/(routes)/chat/[id]/page.tsx`의 로딩 스피너(`border-primary-500`)** — `dark:` 짝이 없고 이번 검증 grep 패턴에도 잡히지 않아 배치 범위(색상 `dark:` 잔재 정리) 밖으로 판단해 미변경으로 남겼다. 매핑 표상 `primary-* → brand`에 해당하므로 일관성을 위해 `border-brand`로 통일할지 후속 판단이 필요하다.
2. **오펀 컴포넌트 4개(`components/chat/ChatList/ChatItem/ChatTabs/ChatSearchBar.tsx`) 처리 여부** — 이번에 색상만 전환했을 뿐 삭제·유지 여부는 색상 작업 범위 밖이라 판단하지 않았다. `Badge.tsx`/`ToggleSwitch.tsx`와 함께 별도 오펀 파일 정리 이슈로 관리를 권장한다.

### 후속 필요
- **이번 배치로 계획서(v2) 4·5단계 후속 "30개 파일·224건" 정리가 전량 완료**되었다. 전 코드베이스 색상 `dark:`(`gray|dark|slate|zinc|neutral`) 잔량은 **76건/12파일**이며, 전부 죽은 코드 또는 오펀 컴포넌트로 실제 렌더 경로에는 영향이 없다.
- `APP_THEME='dark'` 실사용 육안 회귀 테스트는 여전히 미수행 — 전 배치(4~9단계) 완료로 이제 실행 가능한 시점이며, 전체 플로우(홈·검색·캐릭터 생성/편집·채팅·결제·설정) 스크린샷 QA를 권장한다.
- 7단계 문서가 남긴 "더보기 링크 색상"·"앱 다운로드 버튼 overlay 매핑"·"그라데이션 배경 미전환" 확인 필요 항목과 8단계 문서가 남긴 "저장 중 버튼 brand/50"·"이미지 슬롯 삭제 버튼 danger 승격" 확인 필요 항목은 이번 배치와 무관하게 별도로 여전히 열려 있다.
