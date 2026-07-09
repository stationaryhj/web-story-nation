# 홈(메인) 페이지 Figma 반응형 퍼블리싱 계획

- 작성일: 2026-07-09
- 대상 브랜치/커밋: `red-main` / `51feb1a`
- Figma: `8IbJb4GyvbmBmClFRzDsbL` node `3838:32367` (1920×1080 데스크톱 다크 시안)
- 목표 한 줄: StoryNation 홈 화면을 Figma 시안(좌측 사이드바 네비 + 태그라인 + 카테고리 pill 칩 + 캐릭터 카드 그리드)을 기준으로 **모바일 퍼스트 반응형**으로 재구성하되, 마크업/스타일은 publisher가, 데이터·상태·라우팅 배선은 writer가 담당한다.

---

## 목표
`views/main/home.tsx` 홈 화면을 Figma 시안 레이아웃(데스크톱 좌측 고정 사이드바 네비 · 상단 태그라인 · pill 카테고리 칩 · 반응형 캐릭터 카드 그리드)으로 퍼블리싱하고, 모바일(360)·태블릿(768)·데스크톱(1280)에서 가로 스크롤/깨짐 없이 동작하도록 재구성한다. 색상은 하드코딩 HEX 없이 `tailwind.config.ts` semantic 토큰으로 매핑한다.

---

## 확인 필요 사항 (계획 확정 전 반드시)

1. **[범위/전략] 기존 홈을 완전 교체인가, Figma 시안대로 단순 그리드로 재편인가?**
   현재 홈(`views/main/home.tsx`)은 검색바 + 언더라인 탭(추천/남자/여자/성별모름) + `RecommendSection`(캐릭터랭킹·작가랭킹·앱설치배너·최신·기타·만들기 섹션 다수) + 랭킹 사이드바 3종으로 매우 리치하다. Figma 시안은 "칩 + 12장 카드 그리드" 한 화면이다. → **(A) 리치한 추천 섹션을 유지하고 좌측 사이드바/칩/태그라인만 얹는 재스킨**인지, **(B) Figma대로 단일 그리드로 단순화**인지 결정 필요. 이하 계획은 **(A) 재스킨(레이아웃 셸 교체 + 기존 콘텐츠 유지)** 을 기본 가정으로 작성. (B)면 RecommendSection 계열 단계가 삭제됨.

2. **[네비 아키텍처] 좌측 사이드바는 홈에만? 전 페이지에?**
   현재 전 페이지 공통 네비는 상단 `components/common/header.tsx`(데스크톱 수평 nav) + `components/common/MobileGNB.tsx`(모바일 하단 탭바, `app/layout.tsx:117`에서 전역 마운트). Figma는 **데스크톱 좌측 세로 사이드바**를 도입한다. → 좌측 사이드바가 **① 상단 Header를 대체**하는지(전역 레이아웃 변경, 대공사) **② 홈에서만 상단 Header와 공존/대체**하는지 확인 필요. 이하 계획은 **홈 한정: 데스크톱은 좌측 사이드바, 모바일은 기존 `MobileGNB` 재사용**을 기본 가정(전역 Header 구조는 건드리지 않음).

3. **[칩 데이터] 카테고리 칩(추천·랭킹·최신·미시·남/여사친·밀프·BDSM…)의 출처?**
   현재 상수 `CATEGORIES`(`services/hooks/DataListManager.ts:37`)는 `all/male/female/unknown` 4종뿐. Figma 칩은 **정렬(추천/랭킹/최신) + 태그(미시/밀프/반항적/BDSM…)** 혼합으로 보인다. 태그는 API(`ReqGetTags`/`GetTagList`)에서 온다. → 칩 목록이 **(가) 신규 정적 상수**인지 **(나) 정렬탭 + 태그 API 조합**인지 확인 필요. UI(칩 렌더)는 어느 쪽이든 publisher가 동일하게 만들 수 있으나, **데이터 연결(writer)** 범위가 달라진다.

4. **[브랜드 색 불일치 — 중요]** Figma 액센트 `#FF0750` ≠ 현재 다크 brand 토큰 `#FF2E7E`(`app/globals.css:88` `--color-brand: 255 46 126`). 배경도 Figma `#1F1F1F` ≠ 현재 `--color-surface`(dark) `#141414`(`globals.css:80`). → **(a) 토큰 값을 Figma에 맞게 갱신**(전역 파급, `bg-surface`/`text-brand` 쓰는 모든 화면 변동)인지 **(b) 기존 토큰 유지하고 시안과의 미세차 허용**인지 확인 필요. **하드코딩 금지 원칙상 (b) 권장**(토큰 그대로 사용, 필요 시 후속 토큰 조정 별건). 토큰 변경은 cross-cutting이라 이번 퍼블리싱 스코프에서 분리.

5. **[반응형 열 수] 브레이크포인트별 카드 열 수** — Figma는 데스크톱 6열 단일 시안. 합리적 기본값 제안(확정은 확인 필요):
   - 모바일 `< 640`: **2열**
   - `sm 640~767`: **3열**
   - `md 768~1023`: **4열**
   - `lg 1024~1279`: **5열**
   - `xl ≥ 1280`: **6열** (Figma 기준)

6. **[성인 콘텐츠 게이팅]** Figma 태그라인 "오직 성인 남성만을 위한…" 및 성인 카드가 존재. 현재 `Header`의 세이프티필터 토글(`isAdultModeEnabled`)·성인 인증 모달 로직이 있다. → 홈 진입 시 **별도 성인 게이팅 추가 여부** 확인 필요(기본: 기존 세이프티필터 토글 로직 유지, 신규 게이트 추가 안 함).

---

## 현황 파악

### 라우트 / 홈 진입
- `app/page.tsx:1` → `@/views/main/home`(레거시 `views/`)를 `PageTransition`으로 감싸 렌더.
- `views/main/home.tsx:70-120` 현재 홈: `Header` + `SearchBar` + `ButtonTabs`(추천/남자/여자/성별모름) + `tab==='all'? RecommendSection : CharacterGridSection` + `Footer` + `ModalManager` + 랭킹 사이드바 3종.
- 전역 레이아웃 `app/layout.tsx:106-119`: `Providers` > `#main-content` > children, 하단에 `DraggableButton`·`MobileGNB`·`ToastPortal` 전역 마운트.

### 재사용 가능한 기존 컴포넌트
- **카드**: `components/elements/card/Card.tsx` — `variant='default'` 세로 카드(`aspect-[3/4]`, 이미지 fill, 성인 뱃지, 댓글/레벨 오버레이, hover prefetch). Figma 카드(288×415 ≈ 3:4.3)와 근접. **그대로 재사용**.
- **그리드**: `components/elements/card/CardGrid.tsx` — `useSwiper={false}` 시 반응형 `grid-cols`(`getGridColumns` `CardGrid.tsx:211-224`) 지원. 단 현재 기본 최대 5열이라 **6열 옵션 추가 필요**. 스와이퍼 미사용 그리드 재사용 가능.
- **네비(모바일)**: `components/common/MobileGNB.tsx` — 하단 5탭(홈/대화/만들기/수익관리/상점), 로그인 게이팅 포함. `app/layout.tsx`에서 전역 마운트 → **모바일 네비로 그대로 활용**.
- **네비(데스크톱 상단)**: `components/common/header.tsx:88-119` navLinks 동일 5종. Figma 좌측 사이드바 항목(홈/채팅/만들기/내작업실/수익내역)과 라벨만 다르고 라우트 대응됨(홈`/`, 채팅`/chat-list`, 만들기`/my-characters`, 수익`/my-account`, 상점`/shop-recharge`). → **좌측 사이드바는 신규**(데스크톱 세로형 없음). navLinks 정의·게이팅 로직은 Header/MobileGNB 패턴 재사용.
- **기존 네비 엘리먼트**: `components/elements/navigation/Navigation.tsx`, `NavigationTabs.tsx` 존재 → 구현 착수 전 재사용 가능 여부 확인(publisher).
- **탭/칩**: `components/elements/tabs/ButtonTabs.tsx`(언더라인 텍스트 탭, pill 아님) · `components/elements/tags/Tags.tsx`(pill 버튼이나 색 하드코딩 `bg-indigo-600`/`bg-gray-800`, 토큰 미적용) · `components/elements/filters/FilterControls.tsx`. **Figma pill 칩과 정확히 일치하는 컴포넌트 없음 → 신규 칩 뷰 필요**(Tags를 토큰화 리팩터하기보다 신규가 깔끔; Tags는 사이드바 등 타처 사용 가능성 있어 건드리지 않음).

### 데이터 소스
- 전체 캐릭터: `store/useStoreData.ts:592` `fetchCharacters()` (스토어 내부 `queryClient.fetchQuery`). 현재 홈 `views/main/home.tsx:47`에서 호출.
- 카테고리 그리드: `store/useCharacterGridStoreData` (`changeCategory`/`updateTags`/`loadMore`/`reload`) — `CharacterGridSection.tsx:34`.
- 추천 섹션: `store/useMainStoreData`(Top10 등) — `RecommendSection` 하위 섹션들이 소비.
- 정렬/목록 훅: `ReqGetCharacterList`/`ReqTop10Characters`/`ReqTop10CharactersNew`(`DataListManager.ts:44,57,70`).
- 태그: `ReqGetTags(categoryType)` (`DataListManager.ts:147`), `GetTagList`(`:364`).
- 카드 클릭 → 캐릭터 모달: `Card.tsx:80-83`(`setSelectedCharacter`+`openModal('character')`), `store/useStoreModal`.
- `Character` 타입: `store/useStoreData.ts:8`.

### 테마 토큰 (`app/globals.css` `.dark` + `tailwind.config.ts`)
- 앱은 **고정 다크**(`src/shared/config/theme.ts` `APP_THEME='dark'`, `app/layout.tsx:65`에서 `<html class="dark">` 정적 적용). 런타임 토글 없음 → 홈은 항상 다크 토큰 사용.
- 색 매핑표:

| Figma | 용도 | 현재 토큰(클래스) | dark 실제값 | 상태 |
|---|---|---|---|---|
| `#1F1F1F` | 페이지 배경 | `bg-surface` | `#141414` | ⚠ 근사 불일치(확인4) |
| `#FF0750` | 액센트/활성 칩·활성 nav | `text-brand`/`bg-brand` | `#FF2E7E` | ⚠ 불일치(확인4) |
| `#555555` | 비활성 칩 배경 | `bg-surface-elevated` | `#3A3A3A` | ⚠ 근사 불일치 |
| `#B1B1B1` | 비활성 nav 텍스트 | `text-text-muted` | `#A8A8A8` | 근사 OK |
| `#FFFFFF` | 텍스트 | `text-text-primary`/`text-text-inverse` | `#FFFFFF` | OK |
| `#D9D9D9` | 카드 placeholder | (전용 토큰 없음) | — | ⚠ `bg-surface-elevated`로 대체 or 신규 토큰 확인 |

→ **원칙: 하드코딩 HEX 금지. 위 근사 토큰 사용.** Figma와의 미세 색차는 확인4에서 토큰 갱신 여부 결정. 대응 토큰이 아예 없는 `#D9D9D9`(placeholder)만 `bg-surface-elevated` 대체 또는 신규 토큰 여부 확인.

### FSD vs 레거시 배치 결론
- 홈과 재사용 대상(Card/CardGrid/Header/MobileGNB)이 **전부 레거시 `views/`·`components/`** 에 있고 `src/widgets`는 존재하지 않음. 근처 관행 우선 원칙에 따라 **이번 신규물은 레거시 계층에 배치**:
  - 좌측 사이드바 뷰 → `components/elements/navigation/` (기존 네비 엘리먼트 이웃)
  - 카테고리 칩 뷰 → `components/elements/tags/` 또는 `components/main/`
  - 홈 셸/컨테이너 → `views/main/`, 섹션 컴포넌트는 `components/main/`
- (참고) 순수 FSD면 `src/widgets/home/`가 이상적이나, 단독 위젯화는 사이드바 이웃 코드와 단절되어 유지보수 비용↑. 위젯화는 별건으로 권장.

---

## 접근 방식

**추천안: "레이아웃 셸 분리 + 표시/컨테이너 파일 분리"**

- 홈을 `[데스크톱 좌측 사이드바 | 메인 컬럼(태그라인 → 칩 → 그리드/섹션)]` 2-컬럼 셸로 재구성. `md` 미만에서는 사이드바를 숨기고 기존 `MobileGNB`(하단 탭)로 대체, 메인 컬럼만 1컬럼 풀폭.
- 각 신규 UI는 **표시용 View(publisher)** 와 **컨테이너/배선(writer)** 로 파일을 분리해 한 파일을 한 담당만 만지게 한다. View는 props/callback만 받는 순수 컴포넌트.
- 카드 그리드는 기존 `Card` + `CardGrid`(비스와이퍼 그리드) 재사용, 6열 브레이크포인트만 확장.

**대안 비교**
- 대안1: 기존 `home.tsx`를 직접 인라인 수정(파일 분리 없음). → 빠르지만 마크업/로직이 한 파일에 얽혀 publisher/writer 병렬 불가, 담당 겹침. 비추천.
- 대안2: `src/widgets/home`로 FSD 신규 위젯화. → 아키텍처적으로 이상적이나 이웃 레거시(Card/Header/MobileGNB)와 import 경계가 갈려 배럴/의존 정리 비용 큼. 이번 스코프엔 과함. 별건 권장.
- **추천: 셸 분리 + View/Container 분리(레거시 배치).** 최소 변경으로 담당 병렬화·재사용 극대화.

---

## 실행 계획 (단계별)

### 0. 에셋·시안 재확인 `[담당: publisher]`
- 구현 착수 시 `mcp__figma__get_figma_data`(fileKey `8IbJb4GyvbmBmClFRzDsbL`, nodeId `3838:32367`)로 스펙 재확인, `mcp__figma__download_figma_images`로 **로고·네비 SVG 아이콘·카드 borderRadius** 등 미확정 값과 에셋 다운로드 → `public/images/`(기존 관행: `/images/...`).
- 기존 `components/elements/navigation/Navigation.tsx`·`NavigationTabs.tsx` 재사용 가능성 먼저 확인.

### 1. 홈 2-컬럼 레이아웃 셸(View) `[담당: publisher]`
- 파일(신규): `components/main/HomeLayout.tsx` (또는 `views/main/` 내 프리젠테이션 셸).
- 데스크톱(`md:` 이상) `flex`: 좌측 고정 사이드바 슬롯 + 우측 메인 컬럼(children). `md` 미만: 사이드바 숨김, 메인 1컬럼. 하단 여백은 `MobileGNB` 높이(55px) 고려(`pb`).
- 배경 `bg-surface`. 컨테이너 최대폭·좌우 패딩은 Tailwind `container`/`px-4` 관행 따름.
- props: `{ sidebar: ReactNode; children: ReactNode }` (컨테이너가 사이드바/콘텐츠 주입).

### 2. 데스크톱 좌측 사이드바 네비(View) `[담당: publisher]`
- 파일(신규): `components/elements/navigation/HomeSidebarNavView.tsx`.
- `md:` 이상에서만 표시(`hidden md:flex`), 세로 스택. 상단 로고(원형, `next/image`) + 네비 항목(아이콘 SVG + 라벨). 활성 항목 `text-brand`, 비활성 `text-text-muted`. 폰트/간격 Figma 준수.
- 접근성: 루트 `<nav aria-label="주 메뉴">`, 활성 항목 `aria-current="page"`. 항목은 `Link`(라우팅)로 렌더.
- **props/callback 연결 지점(writer가 채움)**:
  ```ts
  interface HomeSidebarNavViewProps {
    items: Array<{ href: string; label: string; icon: ReactNode | LucideIcon; requireLogin?: boolean }>;
    activeHref: string;
    onItemClick?: (e: React.MouseEvent, item: NavItem) => void; // 로그인 게이팅 훅
  }
  ```
- 아이콘은 Figma SVG 다운로드분 또는 기존 `lucide-react`(Home/MessageCircle/UserRoundPlus/HandCoins/Store) 재사용.

### 3. 카테고리 pill 칩(View) `[담당: publisher]`
- 파일(신규): `components/main/CategoryChipsView.tsx`.
- 가로 스크롤(`overflow-x-auto scrollbar-hide`, 기존 `tailwind-scrollbar-hide` 플러그인·`hide-scrollbar` 클래스 활용) pill 그룹. 활성 `bg-brand text-text-inverse`, 비활성 `bg-surface-elevated text-text-primary`. `rounded-full`, Figma 사이즈(≈h-11 px-5) 반영.
- 접근성: 각 칩은 `<button type="button">`, 활성 `aria-pressed`. 다행 wrap이 아니라 **모바일은 가로 스크롤**(요구사항), 데스크톱은 wrap 허용 여부 확인4/5 결과 반영.
- **props 연결 지점**: `{ chips: Array<{ id: string; label: string }>; activeId: string; onSelect: (id: string) => void }`.

### 4. 상단 태그라인(View) `[담당: publisher]`
- 파일(신규): `components/main/HomeTagline.tsx` (또는 HomeLayout 내부).
- 정적 텍스트 "오직 성인 남성만을 위한, 상상하는 모든것이 이뤄지는 AI파라다이스", `text-text-primary` bold, 반응형 폰트(`text-lg md:text-2xl`). 순수 표시.

### 5. 카드 그리드 6열 확장(View) `[담당: publisher]`
- 파일(수정): `components/elements/card/CardGrid.tsx` — `getGridColumns()`(`:211`)에 6열 케이스 추가 및 기본 그리드 반응형을 확인5 열 수(2→3→4→5→6)로 조정. `cardsPerRow` prop로 제어하거나 신규 분기.
- ⚠ 이 파일은 스와이퍼/사이드바 등 **타처에서도 사용** → 기본값 변경이 파급되지 않도록 **새 prop(예: `cols={6}`) 또는 홈 전용 분기**로 비침습 추가. 기존 호출부 동작 불변 유지.
- `Card`(`variant='default'`)는 그대로 사용. 카드 이미지 `alt`는 이미 `${name} 캐릭터 이미지`로 존재(`Card.tsx:157,278,399`) — 접근성 충족.

### 6. 홈 컨테이너 재배선 `[담당: writer]`
- 파일(수정): `views/main/home.tsx` — 위 View들을 조립하는 컨테이너로 재작성.
- 배선 내용:
  - `HomeLayout`에 사이드바(컨테이너)·메인 콘텐츠 주입.
  - `fetchCharacters()` 초기 로드 유지(`useStoreData`), 카테고리/정렬 선택 상태 관리, `useCharacterGridStoreData`(`changeCategory`/`updateTags`/`loadMore`)와 칩 선택 연결.
  - 확인1 결과에 따라 추천 섹션(`RecommendSection`) 유지/제거 분기.
  - 카드 클릭 → 기존 모달 흐름 유지(`Card` 내부 default 동작 또는 `onCardClick`).
- **한 파일 한 담당 유지**: 이 파일은 컨테이너(writer)만 소유. 마크업은 5개 View로 위임.

### 7. 좌측 사이드바 네비 컨테이너 `[담당: writer]`
- 파일(신규): `components/elements/navigation/HomeSidebarNav.tsx` (2번 View를 감싸는 컨테이너).
- navLinks 정의(Figma: 홈/채팅/만들기/내작업실/수익내역 → 라우트 매핑), `usePathname`로 `activeHref`, 로그인 게이팅(`useAccountStore` + `useModalStore`의 `socialLogin` 모달)을 **`header.tsx:122`/`MobileGNB.tsx:80` 패턴 재사용**해 `onItemClick` 구현.
- ⚠ 확인2: 라우트 라벨/대상(내작업실=`/my-characters`? 수익내역=`/my-account`?) 매핑 확정 필요.

### 8. 카테고리 칩 컨테이너 `[담당: writer]`
- 파일(신규): `components/main/CategoryChips.tsx` (3번 View를 감싸는 컨테이너).
- 확인3 결과에 따라 칩 목록 구성:
  - (가) 정적 상수: 신규 상수 파일(정렬 3 + 태그 N).
  - (나) 정렬탭 + 태그 API: `ReqGetTags`/`GetTagList` 소비 + `CATEGORIES` 정렬 연결.
- 선택 상태 → 6번 홈 컨테이너의 그리드 쿼리(카테고리/태그/정렬)로 전달. 서버 상태는 store에 중복 저장 금지, 훅/쿼리 방식 지향.

---

## 영향 범위 & 리스크

- **`views/main/home.tsx` 전면 재작성** — 검색바·랭킹 사이드바·추천 섹션 흐름이 확인1 결정에 따라 유지/이동/제거됨. 회귀 위험 최상. 기존 기능(성인 토글, 모달, 검색) 누락 주의.
- **`components/elements/card/CardGrid.tsx` 수정** — 타처(사이드바, 마이페이지, 카테고리 섹션 등) 공용. **6열 확장은 신규 prop/분기로 비침습** 처리, 기존 호출부 회귀 없어야 함. 변경 후 `grep`으로 `CardGrid` 사용처 전수 확인 권장.
- **네비 이중화 위험(확인2)** — 상단 Header + 좌측 사이드바 공존 시 중복. 전역 Header 유지 여부 미확정 시 홈에서 Header 노출/숨김 정책 필요.
- **색 토큰 불일치(확인4)** — `#1F1F1F`/`#FF0750`/`#555555`/`#D9D9D9`가 현행 토큰과 미세~중간 차이. 시안 픽셀 일치를 강제하면 토큰 갱신(cross-cutting, 전 화면 파급) 필요 → **이번 스코프에서 분리, 토큰 사용 유지 권장**.
- **성인 콘텐츠(확인6)** — 태그라인/성인 카드 노출. 세이프티필터·성인 인증 기존 로직과의 정합성 확인. writer 취급 영역이나 인증 토큰 흐름은 변경 금지.
- **에셋 누락** — 카드 borderRadius, 네비 아이콘 실제 SVG 등 데이터 미명시 값은 구현 시 Figma 재확인 필수(0단계).

## 검증 방법
- **반응형**: 360 / 768 / 1024 / 1280 / 1920 폭에서 (1) 가로 스크롤 없음(칩 영역 제외) (2) 사이드바 md 경계 전환 (3) 그리드 열 수 2→3→4→5→6 확인.
- **모바일 네비**: `md` 미만에서 좌측 사이드바 숨김 + 하단 `MobileGNB` 정상 동작.
- **기능 회귀**: 칩 선택 시 그리드 데이터 갱신, 카드 클릭 시 캐릭터 모달, 네비 로그인 게이팅(비로그인 시 socialLogin 모달), `fetchCharacters` 초기 로드.
- **접근성**: `nav[aria-label]`·`aria-current`(활성 네비)·칩 `button`/`aria-pressed`·카드 `alt` 존재. 키보드 포커스 이동.
- **타입/린트**: `npx tsc --noEmit`, `npm run check`(Biome). 하드코딩 HEX 미포함 확인(`grep`).
- **CardGrid 회귀**: 기존 사용처(사이드바/마이페이지) 렌더 스냅샷 육안 확인.

## 범위 밖 (하지 않을 것)
- semantic 색 토큰 값 자체 변경(`#1F1F1F`/`#FF0750` 정합) — 확인4에서 별건 결정.
- 전역 상단 `Header` 구조 개편 / 전 페이지 좌측 사이드바 적용 — 확인2에서 별건 결정.
- `src/widgets` FSD 위젯화(레거시 배치 유지).
- 검색 실제 동작 구현(`handleSearch` 현재 `console.log` 스텁), 결제/인증/암호화 로직 변경.
- `components/elements/tags/Tags.tsx` 토큰화 리팩터(신규 칩 뷰로 대체, 기존은 미변경).
