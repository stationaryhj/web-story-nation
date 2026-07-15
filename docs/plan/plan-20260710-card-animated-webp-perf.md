# 홈/목록 카드 그리드 — 애니메이션 WebP 성능 최적화 계획

- 작성 일자: 2026-07-10
- 대상 브랜치: `red-main`
- 목표 한 줄 요약: 카드 그리드의 애니메이션 WebP 디코딩/합성/리렌더 비용을 프론트 단독(poster 없이)으로 낮춰 홈·목록 스크롤 성능을 개선한다.

---

## 목표
API가 정적 썸네일/poster 필드를 주지 않는 제약 하에서, **프론트 단독**으로 오프스크린 카드의 애니메이션 WebP 디코딩·페인트·리렌더를 줄여 홈/목록 화면의 스크롤·스와이프 성능을 개선한다.

## 배경 / 확정된 제약
- `npm run build && npm run start` 프로덕션 빌드에서도 느림 → dev 오버헤드가 아니라 **애니 WebP 디코딩/합성 비용**이 원인으로 확정.
- API 응답은 `img_url` 하나뿐, 별도 정적 썸네일/poster 필드 없음. 매핑: `lib/utils/storyNationUtil.ts:210`(`getImageUri(item.img_url)` → `Character.imageUrl`).
- `Character` 인터페이스에 이미지 필드는 `imageUrl: string` 하나뿐(`store/useStoreData.ts:16`).
- `<img>`/next/image로 로드된 애니 WebP는 **CSS로 재생을 멈출 수 없다.** 정지하려면 DOM에서 제거하거나 렌더링을 스킵해야 함.
- 따라서 이번 범위는 "hover-only 재생"/"poster 교체" 불가. **오프스크린 스킵 + 동시 DOM 카드 수 감소 + 리렌더/repaint 감소**에 집중한다.

## 현황 파악
- `components/elements/card/Card.tsx`
  - 카드 3종: `horizontal`(136행~), `my-character`(255행~), `default` 세로형(369행~).
  - next/image `fill` + `object-cover transition-transform duration-500 group-hover:scale-110` (`Card.tsx:282`, `Card.tsx:403`). hover 시 이미지 자체에 transform → 애니 WebP 레이어가 hover 동안 지속 repaint.
  - **카드마다** `isMobile` state + window resize 리스너 존재(`Card.tsx:52`, `85-99`). 카드 N개 = 리스너 N개.
  - `isMobile`은 실제로는 아이콘 width/height(예: `Card.tsx:241,271,392,427,443`)와 flames 크기 정도에만 쓰임 → 시각 표시용 값.
- `components/elements/card/CardGrid.tsx`
  - 기본 `useSwiper=true`(`CardGrid.tsx:68`). Swiper 사용 시 `renderCards()`가 **모든 캐릭터를 SwiperSlide로 전부 DOM 렌더**(`265-282`). 화면 밖 슬라이드도 DOM에 존재 → 애니 재생 지속.
  - Swiper modules는 `[Navigation]`만 사용(`CardGrid.tsx:366`, import는 Navigation/Pagination). **virtual 미사용.**
  - 여기도 자체 `isMobile` state + resize 리스너 중복(`CardGrid.tsx:81`, `85-99`).
  - 비-Swiper 분기는 CSS grid로 전 카드 렌더(`384-408`).
- 홈은 여러 `CardGrid` 섹션이 세로로 나열 → 세로 스크롤 시 **화면 밖 섹션의 카드까지** 애니 재생 중.
- 기존 재사용 자산:
  - `hooks/useMediaQuery.ts` — `matchMedia` 기반 훅 이미 존재(리스너 1개, `change` 이벤트). 카드/그리드의 수동 resize 리스너를 대체 가능.
  - `app/globals.css` — 전역 스타일. 스와이퍼 커스텀 CSS가 `293~303`에 존재(`.custom-swiper`, `.card-grid-swiper .swiper-wrapper`). content-visibility 유틸을 여기에 추가 가능.
  - Swiper `^11.2.6`(package.json) — `swiper/modules`의 `Virtual` 모듈 사용 가능.
- Tailwind에는 `content-visibility` 유틸이 기본 제공되지 않음(별도 플러그인/유틸 없음 확인) → 전역 CSS 유틸 클래스 또는 arbitrary variant 필요.

## 접근 방식

프론트 단독 4개 최적화를 **효과/리스크가 낮은 순서로 단계 적용**한다. 각 단계는 독립 검증 가능하며, 앞 단계만으로도 이득이 있어 중간에서 멈춰도 안전하다.

- 1순위 **content-visibility: auto** (효과 큼·리스크 낮음): 오프스크린 카드의 페인트+이미지 디코딩을 브라우저가 스킵. 세로로 쌓인 섹션·비-Swiper grid·Swiper 슬라이드 모두에 효과. 구현이 가장 가벼움.
- 2순위 **resize 리스너/isMobile 통합** (리스크 낮음·구조 개선): 리스너 N→소수화, 불필요 리렌더 감소. content-visibility와 독립.
- 3순위 **group-hover scale 분리** (리스크 낮음·부수 효과): 애니 이미지 레이어의 hover repaint 완화.
- 4순위 **Swiper Virtual** (효과 큼이지만 리스크 상대적 높음): 화면 밖 슬라이드를 DOM에서 제거해 동시 존재 카드 수 축소. navigation/스타일/key 회귀 위험이 있어 마지막에, 그리고 A/B로 검증 후 도입.

> 대안 비교(Swiper Virtual vs content-visibility만): content-visibility는 DOM은 유지하되 페인트/디코딩을 스킵하므로 도입이 안전하나, 애니 WebP는 오프스크린에서 디코딩이 실제로 멈추는지 브라우저 구현 편차가 있을 수 있음(§검증에서 확인). Virtual은 DOM 제거라 확실히 재생을 중단시키지만 회귀 위험이 큼. 따라서 **content-visibility를 먼저 확정 이득으로 확보**하고, 남는 병목이 "가로 스와이퍼의 다량 오프스크린 슬라이드"로 측정되면 Virtual을 추가하는 순서를 추천한다.

---

## 실행 계획 (단계별)

### 1단계 — content-visibility 유틸 도입 및 카드 컨테이너 적용
목적: 오프스크린 카드의 **페인트 + 이미지 디코딩** 스킵. (줄이는 것: 디코딩 + 페인트/합성)

1a. **content-visibility 전역 유틸 정의** `[담당: publisher]` — `app/globals.css`
   - Tailwind에 유틸이 없으므로 `@layer utilities`에 클래스 추가:
     - `.cv-auto { content-visibility: auto; }`
     - `.cv-card { content-visibility: auto; contain-intrinsic-size: auto <카드 예상 높이>; }` (세로 카드 `aspect-[3/4]` + 텍스트 영역 기준. 카드폭이 반응형이라 `contain-intrinsic-size`는 대략치로 두고 검증에서 조정. 레이아웃 점프 방지가 목적).
     - 가로형(`horizontal`, `w-32 h-32` 이미지 + 콘텐츠)은 별도 intrinsic-size 유틸 `.cv-card-h` 검토.
   - `contain-intrinsic-size`를 빼면 오프스크린이 높이 0으로 접혀 스크롤바 점프가 생기므로 **반드시 함께 지정**.
   - 웹뷰 주의: `content-visibility`는 iOS Safari/WKWebView 15.4+, Android WebView(Chromium) 지원. 미지원 환경에서는 무시되어 **기존 동작으로 폴백**(깨지지 않음)임을 문서에 명시.

1b. **카드/슬라이드 컨테이너에 유틸 클래스 부여** `[담당: publisher]` — `Card.tsx`, `CardGrid.tsx`
   - `Card.tsx`: 세 variant의 최상위 카드 `div`(현재 `group relative overflow-hidden ...` — `Card.tsx:139`, `258`, `371`)에 `cv-card`(가로형은 `cv-card-h`) 추가.
     - 단, `CardTransition`(Framer Motion) 래퍼가 최상위이므로(각 variant `return`의 `<CardTransition>`), content-visibility는 **모션 래퍼 내부의 카드 div**에 두어 애니메이션과 충돌하지 않게 함.
   - `CardGrid.tsx`: Swiper 사용 시 `SwiperSlide`(`267`)와 비-Swiper grid의 카드 wrapper에도 필요시 적용. 단 Card 내부 div에 이미 적용하면 슬라이드까지 중복 적용은 불필요 — **Card div 한 곳으로 통일**하고 CardGrid에는 넣지 않는 것을 우선안으로 함(중복 containment 방지).
   - 순수 className 추가라 표시 담당(publisher) 단독 작업. 로직 변경 없음.

리스크: `contain-intrinsic-size` 부정확 시 스크롤바 위치가 튈 수 있음 → 검증에서 실제 카드 높이로 보정. `overflow-hidden`/`group-hover:scale-110`과의 상호작용은 containment가 paint에 국한되므로 문제 없음(확인 필요: hover scale이 카드 경계를 넘어 그려지지 않는지 — 이미 `overflow-hidden`이라 안전).

### 2단계 — resize 리스너 / isMobile state 통합
목적: 카드 N개의 개별 window resize 리스너·state 제거로 **리스너 수·리렌더** 감소. (줄이는 것: 리렌더 + 리스너 오버헤드)

2a. **공통 훅으로 교체** `[담당: writer]` — `Card.tsx`, `CardGrid.tsx`
   - 기존 `hooks/useMediaQuery.ts` 재사용. `Card.tsx`의 `isMobile` state+useEffect(`52`, `85-99`)를 `const isMobile = useMediaQuery('(max-width: 768px)')`로 대체.
   - `CardGrid.tsx`의 동일 블록(`81`, `85-99`)도 동일 교체.
   - 주의: 기존 로직은 `window.innerWidth <= 768`(<=), `useMediaQuery`는 `max-width: 768px`(<=)로 동치. 경계값 동일하므로 표시 결과 불변.
   - 이 단계는 순수 로직/훅 배선이므로 writer 담당. className/마크업은 건드리지 않음.
   - 겹침 방지: 1단계(publisher, className 추가)와 2단계(writer, state/effect 제거)는 같은 파일을 만지지만 **작업 라인이 분리**됨(1단계=카드 div className, 2단계=state/useEffect 블록). 순서상 **1단계 완료 후 2단계 진행**하여 동시 편집 회피. 만약 병렬이 필요하면 순차로 강제.

리스크: 낮음. `useMediaQuery` 초기 렌더값이 `false`(SSR) → 클라 마운트 후 보정. 기존 코드도 초기 `useState(false)`라 동작 동일. next/image 아이콘 크기가 초기 1프레임 데스크톱값으로 그려질 수 있으나 기존과 동일한 수준.

### 3단계 — group-hover scale transform을 이미지에서 분리
목적: hover 동안 **애니 WebP 레이어 자체의 지속 repaint** 완화. (줄이는 것: hover 중 페인트/합성)

3a. **transform 대상을 별도 래퍼로 이동** `[담당: publisher]` — `Card.tsx`
   - 현재 `<Image ... className='object-cover transition-transform duration-500 group-hover:scale-110'>`(`282`, `403`)는 애니 이미지 엘리먼트에 직접 transform.
   - 이미지를 감싸는 래퍼 `div`(예: `absolute inset-0`)에 `transition-transform duration-500 group-hover:scale-110`을 옮기고, `<Image>`는 `object-cover`만 유지.
   - transform이 걸리면 브라우저가 해당 레이어를 합성 레이어로 승격 → 애니 프레임 갱신과 scale 합성을 분리. `will-change:transform`은 **남용 금지**(상시 레이어 승격은 메모리↑) — hover에만 걸리는 현재 방식 유지, will-change 추가하지 않음.
   - 순수 마크업/클래스 재배치라 publisher 단독. `my-character`(282)와 `default`(403) 두 곳. `horizontal`은 hover scale 없음(현재 `object-cover`만) → 변경 불필요.

리스크: 래퍼 구조 변경 시 기존 오버레이(`absolute inset-0` 그라데이션)·아이콘 z-index 레이어 순서 확인 필요. scale 대상이 오버레이까지 포함되지 않도록 이미지 전용 래퍼에만 적용.

### 4단계 — Swiper Virtual 모듈 도입 (측정 후 조건부)
목적: 가로 스와이퍼에서 **화면 밖 슬라이드를 DOM에서 제거**해 동시 존재(재생) 카드 수 축소. (줄이는 것: 디코딩 + 메모리 + DOM 노드)

전제: 1~3단계 적용 후 DevTools Performance 재측정에서 "가로 스와이퍼의 오프스크린 슬라이드"가 여전히 병목일 때만 진행. content-visibility로 충분하면 회귀 위험 큰 Virtual은 보류.

4a. **Virtual 배선** `[담당: writer]` — `CardGrid.tsx`
   - `swiper/modules`에서 `Virtual` 추가, `modules={[Navigation, Virtual]}`(현재 `366`).
   - `<Swiper virtual>` 활성화. Swiper 11 virtual 요구사항:
     - 각 `SwiperSlide`에 `virtualIndex={index}` 지정.
     - virtual 사용 시 슬라이드 위치가 `style`(transform/left)로 주입되므로, 커스텀 `.card-grid-swiper .swiper-wrapper { padding-bottom }`(globals.css:301)와 충돌 여부 확인.
   - navigation 호환: 현재 커스텀 외부 버튼(`nextEl/prevEl` 셀렉터, `353-375`)과 virtual 병용 시 `reachedEnd/Beginning` 갱신이 유지되는지 확인. virtual은 렌더 슬라이드만 존재하므로 `isEnd/isBeginning` 판정은 Swiper가 내부 처리 → 대체로 정상이나 회귀 테스트 필요.
   - key: 현재 `key={character.id}`(`267`) 유지 + `virtualIndex` 추가.
   - loop=false(현재)와 virtual 조합은 안전. loop+virtual은 제약이 있으나 해당 없음.

4b. **virtual 슬라이드 스타일 검증/보정** `[담당: publisher]` — `app/globals.css` (필요 시)
   - virtual 도입으로 슬라이드 absolute 배치가 되면 카드 높이/간격이 틀어질 수 있음. 필요 시 `.card-grid-swiper` 관련 CSS 보정. 스타일 조정만 발생하면 publisher 담당.
   - writer(4a 배선)와 publisher(4b 스타일)는 파일이 다름(CardGrid.tsx vs globals.css)이라 겹치지 않음.

리스크(높음, 그래서 마지막): virtual은 슬라이드 마운트/언마운트가 잦아 `CardTransition`(Framer Motion 진입 애니)이 스와이프마다 재생될 수 있음 → 과하면 카드 진입 애니를 스와이퍼 컨텍스트에서 비활성화하는 보정 검토. navigation 버튼 disabled 상태 회귀 가능. **A/B(플래그 or 브랜치)로 도입하고 회귀 확인 필수.**

---

## 영향 범위 & 리스크
- 파일: `app/globals.css`(유틸 추가), `components/elements/card/Card.tsx`(className/래퍼/훅 교체), `components/elements/card/CardGrid.tsx`(훅 교체, 조건부 virtual).
- `Card`/`CardGrid`는 홈·검색·내 캐릭터·사이드바 등 다수 화면에서 공용 → 시각 회귀 범위가 넓음. 특히 3단계 래퍼 구조 변경, 4단계 virtual은 전 사용처 스모크 필요.
- `CardTransition`(Framer Motion)와 content-visibility/virtual 상호작용 주의(§각 단계 리스크).
- 롤백: 단계별 독립 커밋. content-visibility는 유틸 클래스 제거만으로, virtual은 `virtual` prop/모듈 제거만으로 원복.

## 검증 방법
- 반응형: **360 / 768 / 1280px** 폭에서 홈·검색·내 캐릭터·랭킹 사이드바 레이아웃 깨짐·가로 스크롤·카드 잘림 없음 확인.
- 성능: `npm run build && npm run start`로 프로덕션 빌드 후 Chrome DevTools > Performance 레코딩.
  - 스크롤/스와이프 중 "Rasterizer/GPU/Painting" 및 이미지 디코드 태스크가 오프스크린 카드에서 줄어드는지 비교(적용 전/후).
  - content-visibility 효과: Rendering 탭 "Paint flashing"/"Layer borders"로 오프스크린 카드가 페인트되지 않는지 확인. 애니 WebP가 오프스크린에서 실제 디코딩을 멈추는지(브라우저 편차) Performance의 Image Decode 태스크로 확인.
  - 2단계: window resize 시 리스너/리렌더 수 감소 확인(React DevTools Profiler로 카드 리렌더 횟수).
- 타입/린트: `npx tsc --noEmit`, `npm run check`.
- 웹뷰: 실제 iOS/Android WebView에서 content-visibility 미지원 폴백 시 정상 표시(깨짐 없음), 스와이프/네비게이션 정상 확인. virtual 도입 시 웹뷰 스와이프 관성/스타일 확인.

## 향후 / 백엔드 협업 (프론트 단독으로 불가)
- **전송 비용**(원본 애니 WebP 용량)은 프론트 단독으로 해결 불가. API가 `img_url` 외 **정적 썸네일/poster 필드**를 제공하면:
  - 목록/오프스크린은 정적 이미지, hover/포커스 시에만 애니 WebP 로드·재생하는 **hover-only 재생** 방식으로 확장 가능.
  - `Character` 인터페이스(`store/useStoreData.ts:8`)에 `thumbnailUrl`(정적) 추가, `storyNationUtil.ts`의 매퍼(`210` 등 5개 지점)에서 채움.
- 백엔드에 애니 WebP 프레임수/해상도 상한, 저용량 정적 poster 자동 생성 요청 검토.

## 범위 밖 (하지 않을 것)
- 백엔드 응답/`Character` 타입 변경, poster 필드 추가(향후 항목).
- hover-only 재생/정지 상태 poster 교체(현재 정적 썸네일 없어 불가).
- 이미지 CDN/포맷 변환, 전송 용량 최적화.
- `services/api` 페칭 로직·모달·라우팅 변경.
