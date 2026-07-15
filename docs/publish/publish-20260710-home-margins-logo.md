# 퍼블리싱 — home 콘텐츠 좌우 여백 + Top bar 로고 레일 오프셋

- 작성 일자: 2026-07-10
- 근거 계획: `docs/plan/plan-20260710-caveduck-shell-layout.md` (셸 완료 상태) + 사용자 추가 지시(케이브덕 홈 스크린샷 2장 기반 여백/로고 X좌표 조정)
- 대상 브랜치: `red-main`

## 작업 1 — home 화면 콘텐츠 좌우 여백 (caveduck 근사)

### 사전 조사 결과 (홈 전용 여부 확인)
`grep`으로 아래 컴포넌트들의 import 사용처를 전수 확인했다.
- `components/main/RecommendSection.tsx`, `components/main/CharacterGridSection.tsx` → **`views/main/home.tsx`에서만 import**(다른 페이지 0건).
- `components/main/recommend/{AuthorRankingSection,CharacterRankingSection,EtcCharactersSection,LatestCharactersSection,CreateCharacterSection}.tsx` → **`components/main/RecommendSection.tsx`에서만 import**(다른 파일 0건).

→ 위 8개 파일은 **home 전용 트리**임이 확인되어, 그 안의 `container mx-auto px-4` 계열 클래스를 직접 조정해도 다른 페이지에 영향이 없다(계획서에서 언급한 "홈 전용이면 안전" 조건 충족). 반대로 `views/shop-recharge/home.tsx`, `views/chat-list/home.tsx`, `views/search/home.tsx`, `views/author/detail.tsx`, `components/common/footer.tsx`, `components/elements/navigation/{Navigation,NavigationTabs}.tsx`, `app/(routes)/*` 등 다른 페이지가 쓰는 `container mx-auto px-4`는 **그대로 유지**(미변경).

### 구현 방식
전역 Tailwind `.container` 유틸(`tailwind.config.ts`의 `theme.extend.container`, `screens: sm640/md768/lg1024/xl1152/2xl1280`)은 **다른 페이지 다수가 공용**하므로 절대 수정하지 않았다. 대신 홈 전용 8개 파일 내부에서 `container mx-auto px-4`(및 `pl-4 pr-0` 변형)를 **직접 arbitrary 유틸 조합**으로 교체했다(전역 컨테이너와 완전히 분리되어 이중 캡 문제 없음):

```
mx-auto w-full max-w-[2200px] px-4 2xl:px-[100px]
```
(스와이퍼 우측 여백 제거용 특수 케이스는 `pl-4 2xl:pl-[100px] pr-0`.)

**근사치 재현 근거**: box-sizing:border-box 기준으로 `boxWidth = min(뷰포트, 2200px)`, `contentWidth = boxWidth - 2×padding`.
- 1920px 뷰포트: boxWidth=1920(캡 미도달) → content=1920-200=1720, 마진 각 100px. (목표 100px 정합)
- 2560px 뷰포트: boxWidth=min(2560,2200)=2200(캡 도달) → content=2200-200=2000, 마진 각 (2560-2200)/2+100=280px. (목표 270px 근사, 계획서의 "정확한 값은 근사치" 지침에 따라 10px 편차 허용)
- 768px 이하: boxWidth<2200이라 캡 미도달, padding은 기존과 동일한 `px-4`(16px, 기존 `container` padding='1rem'과 동일) → 기존 시각과 거의 동일, 모바일 폭 축소 없음.
- `2xl:px-[100px]`는 Tailwind 기본 `screens.2xl`(1536px, `tailwind.config.ts`의 최상위 `screens`, `container.screens`와는 별개 설정)부터 적용되어 "큰 폭(≥1536)에서만 마진 확대" 요건을 만족.

### 변경 파일
- `views/main/home.tsx:73,79` — 검색바 래퍼 · 탭 래퍼의 `container mx-auto px-4` 계열 → 홈 전용 폭 클래스로 교체.
- `components/main/RecommendSection.tsx:42` — 앱 다운로드 섹션 래퍼.
- `components/main/CharacterGridSection.tsx:97,118,139,172`(4곳: 로딩/에러/empty/정상 렌더) — 전부 교체.
- `components/main/recommend/AuthorRankingSection.tsx:75`
- `components/main/recommend/CharacterRankingSection.tsx:78`(제목/탭 영역), `:114`(카드 그리드 영역, `pl-4 2xl:pl-[100px] pr-0` — 우측 스와이퍼 오버플로우 유지)
- `components/main/recommend/EtcCharactersSection.tsx:18`
- `components/main/recommend/LatestCharactersSection.tsx:18`
- `components/main/recommend/CreateCharacterSection.tsx:28`

각 파일에 근거 주석(`docs/publish/publish-20260710-home-margins-logo.md` 경로 포함)을 남겨 향후 유지보수 시 홈 전용 스코프임을 알 수 있게 했다.

## 작업 2 — Top bar 로고 X좌표를 레일 폭(80px)부터 시작

- `components/common/header.tsx:152` — 내부 래퍼 클래스를 `w-full px-4 py-3 flex items-center justify-between` → `w-full px-4 md:pl-20 py-3 flex items-center justify-between`로 변경.
- 모바일(레일 숨김): `px-4`(기존과 동일, 좌측 끝에서 16px).
- 데스크톱(md 이상, 레일 `w-20`=80px 노출): 좌측 패딩만 `pl-20`(80px)으로 대체되어 로고가 레일 우측 끝부터 시작. 우측은 `pr-4`가 그대로 유지(암묵적으로 `px-4`가 우측 패딩도 4로 유지) — 우측 컨트롤 위치·`justify-between` 동작 불변.
- Header 로직/상태/props/자식 컴포넌트(`SimpleToggle`, `NotificationButton`, `HeaderSidebar` 등)는 손대지 않았다. className 1곳만 수정.

## 반응형 / 웹뷰 점검
- **360px**: 레일·`md:pl-20` 미적용(모바일), 홈 콘텐츠 래퍼는 `max-w-[2200px]`가 뷰포트보다 훨씬 커 영향 없음 → `px-4`만 적용, 기존과 동일한 좌우 16px 여백. 가로 스크롤 없음.
- **768px**: `md:pl-20`는 헤더 로고에 적용(데스크톱 진입), 홈 콘텐츠는 여전히 `px-4`(2xl 미달) → 기존과 동일한 폭. 헤더 로고가 사이드바 레일(80px) 오른쪽에서 시작, 우측 컨트롤은 그대로 `pr-4` 유지.
- **1280px**: 홈 콘텐츠 `max-w-[2200px]` 캡 미도달(px-4 유지, 2xl 1536 미달) → 기존과 거의 동일한 폭(이전 `container` 2xl:1280 캡보다 오히려 살짝 넓어짐, 회귀 아님 — 계획서에도 "레일 오른쪽 영역에서 좌우 대칭 여백"으로 명시된 목표와 정합).
- **1920/2560px**: 위 계산대로 좌우 마진 약 100px/약 280px로 caveduck 스크린샷 근사치 재현. 레일(`md:pl-20`)과 이중 캡 없이 정상 동작 확인(코드 리딩 기준; 브라우저 리사이즈 실측은 미실행 — 필요 시 후속 확인 권장).
- 웹뷰 관련: className만 조정한 변경이라 `position:fixed`/`100vh`/키보드 이슈 등 신규 리스크 없음. 헤더는 기존 `sticky top-0`을 유지.

## 검증
- `npx tsc --noEmit` — 통과(에러 없음).
- `npx biome check <변경 파일 9개>` — 에러/경고 다수 리포트되었으나 전부 **본 작업 이전부터 존재하던 기존 이슈**(unused import, `useButtonType`, `noArrayIndexKey`, `<img>` 사용 등, 이번 className 변경과 무관). 이번 변경으로 새로 발생한 lint 에러는 없음(교체한 줄 자체는 위반 없음). 기존 이슈는 `docs/write/write-20260706-theming-step7-chrome-main.md`에서도 "색상 변경 전부터 존재하던 기존 이슈로 무관해 미수정"이라 기록된 동일 항목들과 일치 — 이번에도 범위 밖으로 두고 미수정.

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- 없음(로직/상태/props 변경 없음, 계획 문서의 캐릭터 여백 관련 별도 계획은 없었으나 사용자 추가 지시를 계획 완료 상태 위에 그대로 적용).
- 실측 확인 필요: 실제 브라우저에서 1920/2560px 리사이즈로 caveduck 스크린샷과의 픽셀 근사치를 재확인하는 것을 권장(코드 계산상 정합이나 폰트/스크롤바 등 실측 변수는 미반영).
