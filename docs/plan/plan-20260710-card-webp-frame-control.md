# 카드 애니메이션 WebP — 프레임 제어형(canvas 직접 디코딩) 전환 계획

- 작성 일자: 2026-07-10
- 대상 브랜치: `red-main`
- 목표 한 줄 요약: 카드 애니 WebP를 `ImageDecoder`(WebCodecs) 기반 canvas 프레임 제어로 전환해 **정적 우선 + 온디맨드 재생 + 스크롤 중 정지**를 구현하고, 미지원(iOS) 환경은 현행 `next/image` 자동재생으로 안전 폴백한다.

> 선행 문서: `docs/plan/plan-20260710-card-animated-webp-perf.md` (1·2단계 완료 — content-visibility 유틸 `cv-card`/`cv-card-h` 적용, `useMediaQuery` 통합). 이 계획은 그 후속/확장이며 배경·제약을 승계한다.

---

## 배경 / 승계된 제약
- 프로덕션 빌드(`npm run build && npm run start`)에서도 느림 → 원인은 애니 WebP **디코딩/합성 비용**(선행 문서 §배경).
- API 응답은 `img_url` 하나뿐. 정적 썸네일/poster 필드 없음(`lib/utils/storyNationUtil.ts:210,258,300,333,361`). 따라서 **poster를 프론트가 프레임 0에서 자체 생성**해야 한다.
- `<img>`/`next/image`로 로드된 애니 WebP는 **CSS로 재생을 멈출 수 없다**(선행 문서). 그래서 프레임 제어가 필요하면 canvas로 직접 디코딩하는 길밖에 없다 — 이번 계획의 핵심.
- 선행 1단계 `content-visibility`(오프스크린 페인트/디코딩 스킵)와 2단계 `useMediaQuery` 통합은 **유지**한다. 이번 canvas 전환과 병존한다(§충돌 정리 참조).

## 확정 요구사항 (사용자 결정)
1. UX = **정적 우선(프레임0 정지) + 온디맨드 재생 + 스크롤 중 정지 + 화면 밖 미디코딩**.
2. 브라우저 전략 = **`ImageDecoder` 지원 시 canvas 프레임 제어**, 미지원(iOS Safari/WKWebView 등) 시 **현행 `next/image` 자동재생 폴백**. JS WebP 디코더는 도입하지 않음.

---

## 현황 파악 (실제 코드 근거)
- `components/elements/card/Card.tsx`
  - 세 variant: `horizontal`(121행~), `my-character`(240행~), `default` 세로형(354행~).
  - 캐릭터 이미지 `<Image fill>` 3곳:
    - horizontal `Card.tsx:140` — `className='object-cover'`, `sizes='(max-width: 640px) 25vw, 128px'`, hover scale 없음.
    - my-character `Card.tsx:262` — `object-cover transition-transform duration-500 group-hover:scale-110`, `sizes='(max-width: 640px) 50vw, ... 20vw'`.
    - default `Card.tsx:383` — 위와 동일 className/sizes.
  - `handleImageError`가 `imageError` state를 set하지만(`Card.tsx:54,96-98`) **렌더에서 한 번도 읽지 않는 dead state** — 폴백 UI 없음. 우리 컴포넌트는 canvas 디코드 실패 시 폴백 img로 전환하는 실제 에러 경로를 새로 도입한다(개선).
  - 1단계 산출물 `cv-card`/`cv-card-h` 클래스가 최상위 카드 div에 이미 적용됨(`Card.tsx:125,244,357`).
  - 2단계 산출물 `isMobile = useMediaQuery('(max-width: 768px)')` 적용됨(`Card.tsx:53`).
- `components/elements/card/CardGrid.tsx`
  - 기본 `useSwiper=true`(`:69`). `renderCards()`가 전 캐릭터를 SwiperSlide로 전부 DOM 렌더(`:249-266`). Swiper Virtual 미도입(선행 4단계 보류). → **화면 밖 슬라이드도 DOM에 존재**하므로 우리 컴포넌트의 IntersectionObserver 가시성 게이팅이 특히 중요.
  - 비-Swiper 분기는 CSS grid 전 렌더(`:376-390`).
- 재사용 자산
  - `hooks/useMediaQuery.ts` — `matchMedia` 훅. **SSR 초기값 `false` → 마운트 후 보정** 패턴(`:4-18`). 우리 `canvasEnabled` 상태도 동일 SSR-safe 패턴을 따른다.
  - IntersectionObserver 사용 선례: `views/search/home.tsx:167-183`(disconnect cleanup 포함) — 동일 관행 채택.
  - `src/shared/lib/hooks/index.ts` — 배럴 존재(현재 `useEscapeClose`만). 신규 훅을 여기 추가한다.
  - `src/shared/lib/utils/getImageUri.ts` / `lib/utils/storyNationUtil.ts` — `imageUrl`은 항상 CDN 절대 URL 문자열.
- **`next.config.js:11` `images.unoptimized: true`** — ★중요★. next/image가 이미 리사이즈/포맷 변환을 **하지 않는다**. 즉 canvas 경로로 전환해도 잃는 next/image 기능은 사실상 **native lazy-loading뿐**이며(blur placeholder 미사용), 이는 IntersectionObserver로 대체된다 → "next/image 최적화 포기" 트레이드오프가 거의 중립임을 확정.
- CDN: `getImageUri.ts`의 CloudFront(`d2gimcyf1gz7jq.cloudfront.net` 등). ImageDecoder는 `fetch(src)`로 바이트를 받아야 하므로 **CORS 응답 헤더가 필수** — 미검증 리스크(§리스크·PoC).

## 접근 방식

### 컴포넌트 배치 — 추천: `src/shared/ui/` (FSD)
- Card는 레거시(`components/elements`)지만, "프레임 제어 애니 WebP 이미지"는 **범용 프리미티브**이고 신규 코드다. CLAUDE.md "신규 코드는 `src/` FSD 우선" + shared가 적합 레이어. 레거시 `components`에서 `@/shared/ui/...` import는 의존 방향(features→entities→shared) 위반이 아니다(shared는 최하위).
- 배치: `src/shared/ui/animated-webp/` (배럴 `index.ts`). 훅은 `src/shared/lib/hooks/`.
- 대안(레거시 `components/elements/media/`)은 "주변 관행" 논리는 되나, 재사용 프리미티브를 레거시에 묶으면 FSD 이행에 역행 → 비추천.

### 관심사 분리 (한 파일 한 담당)
canvas 마크업과 디코딩 로직이 한 컴포넌트에 얽히므로 **표시용/컨테이너로 파일 분리**한다:
- `AnimatedWebpImageView.tsx` (publisher) — 순수 표시: `<canvas>` + 폴백 `<Image>`, 반응형/aspect/object-cover, alt/접근성. ref·flag·callback을 props로만 받음.
- `AnimatedWebpImage.tsx` (writer, 컨테이너) — 지원감지·훅 배선·IntersectionObserver·pointer(hover)·재생정책·생명주기. View를 렌더하고 ref/mode를 주입.
- 로직 훅(writer): `useImageDecoderSupport`, `useIsScrolling`, `useInView`, `useAnimatedWebp`, 그리고 동시재생 상한용 모듈 싱글턴 `animationScheduler`.
- Card.tsx의 `<Image>`→`<AnimatedWebpImage>` 치환은 **마크업 교체이므로 publisher**가 담당. 2단계(writer)가 이미 끝나 Card.tsx는 이제 publisher만 만진다(동시편집 없음).

### 렌더 파이프라인 (요지)
1. SSR/첫 클라 페인트: **폴백 `<Image>`** 렌더(현행과 동일 → hydration 안전, 무JS/미지원에서도 정상).
2. 마운트 후 `useImageDecoderSupport()`가 지원 확인 + `useInView`가 화면 진입 확인 → `fetch(src)` → `new ImageDecoder({data, type})` → `await decoder.tracks.ready`로 **`frameCount` 취득**.
3. **애니 여부 분기 (★핵심)**:
   - `frameCount <= 1` (정적 WebP/단일 프레임) → **canvas 승격 안 함**. 이미 렌더 중인 폴백 `<Image>`를 그대로 유지하고 디코더 즉시 `close()`. 이후 재생/스크롤 로직 미적용(현행 방식과 100% 동일).
   - `frameCount > 1` (애니 WebP) → 아래 4로 진행.
4. `decode({frameIndex:0})` → 프레임0을 canvas에 draw → `videoFrame.close()` → **정적 poster 완성, img→canvas 스왑**.
5. 재생 트리거(hover/center-in-view) 발생 시 rAF 루프로 프레임 순차 draw(각 프레임 `duration` 존중), 루프.
6. 스크롤 시작 → `useIsScrolling` true → 전 카드 일시정지(프레임0 또는 현재 프레임 정지 유지). 스크롤 종료 → 정책상 재생 조건 재평가.
7. 화면 이탈 → 재생 정지 + VideoFrame/디코더 `close()`로 리소스 해제.

> **정적 판별 비용**: 애니 여부는 바이트를 받아야만 알 수 있으므로(API 플래그 없음), 정적 WebP도 `fetch` 1회는 발생. 단 폴백 `<Image>`와 **동일 URL이라 HTTP 캐시 공유** → 실제 네트워크 다운로드는 1회, 정적 시 낭비는 "메타데이터 디코드 1회 + 즉시 close"뿐. WebP 헤더 `ANIM` 청크만 Range 요청으로 조기 판별하는 최적화는 CDN Range 지원 의존이라 **PoC 이후 선택 항목**으로 보류.

### 재생 트리거 정책 — 제안
- **데스크톱(hover 가능, `(hover: hover) and (pointer: fine)`)**: pointerenter → 재생, pointerleave → 프레임0 복귀 정지. (기존 hover scale과 UX 일치)
- **모바일/터치**: hover 없음. **화면 중앙 노출(IntersectionObserver threshold 높은 슬롯, 예 rootMargin으로 중앙 밴드) 시 재생**, 벗어나면 정지. 추가로 **탭 시 토글**은 카드 탭이 이미 캐릭터 모달 오픈에 쓰여(`Card` onClick) 충돌하므로 채택하지 않음(중앙노출 자동재생만).
- 공통: `useIsScrolling`이 true인 동안은 트리거 무관하게 정지.

### 동시 재생 상한
- 모듈 싱글턴 `animationScheduler`: 동시 재생 canvas를 최대 N개(제안 기본 3, 모바일 1~2)로 제한. 초과 요청은 대기/거절. 정적 우선이라 실제 동시 재생은 적지만, 그리드에서 hover 연타·중앙밴드 다중 매칭 시 상한이 안전장치.
- 디코더 **인스턴스 수**도 별도 상한(예 6~8) — 화면 안이라도 과다 디코더 생성 방지. LRU로 오래된 오프스크린 디코더 우선 close.

---

## 실행 계획 (단계별)

### 0단계 — PoC (최우선, 리스크 큰 전환이므로 게이트) `[담당: writer]`
목적: 전면 도입 전 **실측**으로 지원율·메모리·프레임·CORS를 검증하고 진행 여부를 결정.
- 임시 검증 하니스(별도 라우트 또는 스토리 페이지, 프로덕션 코드 경로에 미포함)로 카드 **20~40개** 그리드에 canvas 디코딩 렌더.
- 측정 항목:
  - `ImageDecoder` 지원 감지 동작(Chrome/Edge/Android WebView = 지원, iOS Safari/WKWebView = 미지원 → 폴백).
  - **애니/정적 판별**: `frameCount`로 애니 WebP는 canvas 승격, 정적 WebP는 폴백 `<Image>` 유지가 정확히 갈리는지(실제 데이터에 정적/애니 혼재 확인). 정적 판별 시 canvas가 안 뜨고 깜빡임 없는지.
  - **CORS**: 실제 CloudFront `img_url`에 `fetch()`가 성공하는지(cross-origin CORS 헤더 존재 여부). 실패 시 canvas 경로 전면 재검토(§리스크).
  - 메모리: DevTools Memory/Performance로 디코더·VideoFrame 누수 여부(close 전후 heap), 40카드 상주 시 사용량.
  - 프레임/CPU: 스크롤 중 정지가 실제로 디코드 태스크를 0으로 만드는지, 재생 시 rAF 부하.
  - iOS 실기(Safari/앱 WKWebView)에서 폴백이 현행과 동일하게 자동재생·정상 표시.
- **게이트**: CORS 실패 또는 메모리 누수 미해결이면 canvas 전환 보류(폴백 경로만 유지). 통과 시 1단계 진행.
- 산출: PoC 결과 요약을 `docs/write/`에 기록.

### 1단계 — 지원 감지 훅 `[담당: writer]`
`src/shared/lib/hooks/useImageDecoderSupport.ts` (신규) + 배럴 추가.
- `useState(false)` → `useEffect`에서 `typeof window !== 'undefined' && typeof (window as any).ImageDecoder !== 'undefined'` 확인 후 set(true). SSR 초기 false 유지 → hydration 안전(`useMediaQuery`와 동일 패턴).
- 선택: `ImageDecoder.isTypeSupported('image/webp')`가 Promise면 마운트 후 비동기 확정.
- named export, `interface` 불필요(boolean 반환).

### 2단계 — 전역 스크롤 감지 훅 `[담당: writer]`
`src/shared/lib/hooks/useIsScrolling.ts` (신규) + 배럴 추가.
- **리스너 1개 공유** 철학(useMediaQuery와 동일). 모듈 싱글턴에 `scroll` 리스너(passive) 1개 등록 + 구독자 Set. 값 변경 시에만 구독자 notify.
- 스크롤 시작 → true, 마지막 스크롤 후 디바운스(예 120ms) → false. `scrollend` 이벤트 지원 시 우선 사용(Chromium), 미지원(iOS)은 디바운스 폴백.
- iOS 관성 스크롤(`-webkit-overflow-scrolling`) 편차: `touchstart/touchmove/touchend` 보조 감지 + 디바운스로 관성 종료까지 true 유지.
- window 스크롤 + 필요 시 스크롤 컨테이너 대응(홈은 window 스크롤, Swiper 가로는 내부 스크롤 아님/터치 스와이프). 우선 window 대상, 가로 스와이프는 Swiper 이벤트가 아닌 터치 감지로 커버.
- 반환 boolean. 컴포넌트에서 구독.

### 3단계 — 가시성 훅 `[담당: writer]`
`src/shared/lib/hooks/useInView.ts` (신규, 재사용 가능 범용) + 배럴 추가.
- `IntersectionObserver`로 대상 ref의 화면 진입/이탈 + (중앙밴드용) 옵션 rootMargin/threshold. `views/search/home.tsx:167-183` 패턴 준용(cleanup disconnect).
- 반환: `{ ref | (setRef), inView, isCentered? }`. 관측 대상은 컨테이너 div.
- content-visibility(cv-card)와 **중복 아님/충돌 없음**: cv-card는 far-offscreen 페인트/디코딩 스킵(브라우저 자동), useInView는 **디코더 생성/재생 생명주기**를 앱 레벨에서 게이팅. 둘 다 유지(§충돌 정리).

### 4단계 — 동시재생/디코더 스케줄러 `[담당: writer]`
`src/shared/lib/animation/animationScheduler.ts` (신규, 비-React 모듈).
- 재생 슬롯 상한(기본 desktop 3 / mobile 2)과 디코더 인스턴스 상한(6~8, LRU) 관리. `requestPlay(id)`, `release(id)`, `registerDecoder/evict`.
- 순수 로직 모듈(테스트 용이). 컴포넌트가 이 API를 호출.

### 5단계 — 핵심 디코딩/렌더 루프 훅 `[담당: writer]`
`src/shared/lib/hooks/useAnimatedWebp.ts` (신규).
- 입력: `{ src, canvasRef, enabled(=support&&inView), shouldPlay(=trigger && !isScrolling), width?, height? }`.
- 동작:
  - `enabled` true & 미초기화 → `fetch(src, {mode:'cors'})` → `ArrayBuffer` → `new ImageDecoder({ data, type:'image/webp' })` → `await decoder.tracks.ready` → `frameCount`, 각 프레임 `duration` 취득.
  - **애니 여부 분기 (★핵심)**: `frameCount <= 1`이면 정적 이미지 → `decoder.close()` 후 `onStatic()`(또는 `onError`와 구분되는) 콜백으로 컨테이너에 알림 → 컨테이너는 `mode='fallback'` 유지(canvas 스왑 안 함, 재생 로직 미가동). 훅은 여기서 조기 종료.
  - (`frameCount > 1`) **프레임0 즉시 draw**(정적 poster). `decode({frameIndex:0})` → `drawImage(videoFrame)` → **`videoFrame.close()` 즉시**. `onReady()` 콜백으로 컨테이너에 canvas 활성 알림.
  - `shouldPlay` true → rAF/타이머 루프: 다음 프레임 `decode({frameIndex})` → draw → `close()` → 프레임 `duration` 후 다음. 루프(마지막→0). `shouldPlay` false → 루프 중단, 현재/0 프레임 정지.
  - `animationScheduler`로 재생 슬롯 획득 실패 시 정적 유지.
- **cleanup(누수 방지)**: 언마운트/`enabled` false → 진행 중 rAF 취소, 대기 중 VideoFrame `close()`, `decoder.close()`, fetch `AbortController` abort. 모든 VideoFrame은 draw 직후 close 원칙.
- canvas 크기: DPR 대응(`canvas.width = cssW * dpr`), `drawImage`로 object-cover 계산(비율 맞춰 crop). object-cover 로직은 훅이 계산해 draw(표시 규칙이지만 canvas 픽셀 조작이라 writer 영역). 컨테이너 CSS 크기는 View(publisher)가 소유.
- 디코드/네트워크 에러 → `onError()` 콜백 → 컨테이너가 mode를 'fallback'으로 강등.

### 6단계 — 표시용 View 컴포넌트 `[담당: publisher]`
`src/shared/ui/animated-webp/AnimatedWebpImageView.tsx` (신규).
- **연결 지점(publisher가 정의하는 props 인터페이스)** — writer는 이 인터페이스에 맞춰 컨테이너를 배선:
  ```ts
  interface AnimatedWebpImageViewProps {
    mode: 'fallback' | 'canvas';          // canvas 준비 전엔 fallback
    containerRef: Ref<HTMLDivElement>;    // writer: IO/pointer 부착 대상
    canvasRef: Ref<HTMLCanvasElement>;    // writer: 프레임 draw 대상
    canvasReady: boolean;                 // true면 img 숨기고 canvas 노출
    src: string;
    alt: string;
    sizes?: string;
    className?: string;                   // 기존 object-cover 등 그대로 전달
    onImgError?: () => void;              // 폴백 img 로드 실패 전달
  }
  ```
- 렌더 구조: `containerRef` div(`relative` 채움) 안에
  - 폴백/기본: `<Image fill sizes className onError={onImgError}>`(현행 그대로). `canvasReady`면 `aria-hidden`/`opacity-0`로 숨김(레이아웃 유지).
  - `<canvas ref={canvasRef}>` `object-cover w-full h-full` — `canvasReady`일 때 노출, 아니면 `opacity-0`.
  - 접근성: canvas는 이미지 대체 텍스트를 못 가지므로 **`role='img'` + `aria-label={alt}`**. 폴백 img의 alt와 동치 유지.
- 반응형: 컨테이너는 부모 aspect(`aspect-[3/4]`/가로형 `w-32 h-32`)를 채우도록 `absolute inset-0`/`w-full h-full`. 360/768/1280 모두 부모 비율 승계 → 카드 레이아웃 불변.
- 모션: 기존 `group-hover:scale-110`은 **canvas/img를 감싸는 래퍼**에 두어 프레임 갱신 레이어와 분리(선행 3단계 취지 계승). publisher가 래퍼 배치.
- 순수 표시 — 훅/상태 없음.

### 7단계 — 컨테이너 컴포넌트 `[담당: writer]`
`src/shared/ui/animated-webp/AnimatedWebpImage.tsx` (신규) + 배럴 `index.ts`.
- **공개 props**(Card가 사용):
  ```ts
  interface AnimatedWebpImageProps {
    src: string;
    alt: string;
    sizes?: string;
    className?: string;
    playPolicy?: 'hover' | 'center' | 'auto'; // auto=desktop hover/mobile center
    priorityDisabled?: boolean;               // 필요시
  }
  ```
- 배선: `useImageDecoderSupport`, `useInView`(containerRef), `useIsScrolling`, `useAnimatedWebp`. hover 정책이면 containerRef에 pointerenter/leave 리스너 부착(useEffect). `(hover:hover)` matchMedia로 데스크톱/모바일 트리거 분기(또는 `useMediaQuery`).
- `mode`/`canvasReady`/`onImgError` 계산 후 `AnimatedWebpImageView`에 주입. 미지원/**정적(frameCount<=1)**/에러 → 항상 fallback img(현행 자동재생). 즉 canvas 승격은 "지원 && 화면진입 && 애니(frameCount>1) && 디코드 성공" 전부 만족할 때만.
- 이 파일과 View는 파일이 분리되어 writer/publisher 동시편집 없음. View의 props 인터페이스(6단계)를 계약으로 사용.

### 8단계 — Card.tsx의 `<Image>` 치환 `[담당: publisher]`
`components/elements/card/Card.tsx` — 3곳(`:140`, `:262`, `:383`)의 캐릭터 이미지 `<Image>`를 `<AnimatedWebpImage>`로 교체.
- props 매핑: `src={imageUrl}`, `alt`, `sizes`(각 variant 기존값), `className`(hover scale은 View 래퍼로 이관하므로 canvas/img엔 `object-cover`만), `playPolicy='auto'`.
- horizontal은 hover scale 없음 → `playPolicy='center'` 또는 hover여도 무방(작게). my-character/default는 hover scale 유지.
- `onError`/`imageError` dead state는 이 기회에 View의 `onImgError`로 실제 폴백 연결(선택 개선).
- 마크업 교체이므로 publisher. Card의 로직(핸들러·useMediaQuery)은 건드리지 않음.

> 단계 순서: 0(PoC 게이트) → 1~5(writer, 신규 파일) → 6(publisher, View) → 7(writer, 컨테이너) → 8(publisher, Card 치환). 6과 7은 파일이 달라 병렬 가능하나 **props 인터페이스(6단계) 확정 후 7 진행** 권장.

---

## 영향 범위 & 리스크
- **신규 파일**(격리): `src/shared/lib/hooks/{useImageDecoderSupport,useIsScrolling,useInView,useAnimatedWebp}.ts`, `src/shared/lib/animation/animationScheduler.ts`, `src/shared/ui/animated-webp/{AnimatedWebpImage,AnimatedWebpImageView,index}.tsx`. 배럴 `src/shared/lib/hooks/index.ts` 갱신.
- **수정 파일**: `components/elements/card/Card.tsx`(이미지 3곳 치환)만. `CardGrid.tsx` 변경 없음.
- **회귀 범위(넓음)**: `Card`/`CardGrid`는 홈(`views/main/home.tsx`), 검색(`views/search/home.tsx`), 내 캐릭터(`views/my-characters/home.tsx`), 채팅 리스트(`views/chat-list/home.tsx`), 랭킹 사이드바(`components/main/recommend/*`) 공용 → **전 사용처 스모크 필수**.
- 리스크:
  - **CORS(가장 큼)**: `fetch(cloudfront)`가 CORS 헤더 없으면 canvas 경로 전면 실패 → PoC 게이트에서 확정. 실패 시 canvas 보류/폴백 유지.
  - **메모리 누수**: VideoFrame/디코더 미해제 시 급증 → draw 직후 close + 스케줄러 LRU + 언마운트 cleanup으로 방어, PoC에서 실측.
  - **hydration**: SSR=fallback img로 고정, 클라 마운트 후에만 canvas 승격 → mismatch 없음.
  - **hover scale 래퍼 이관** 시 오버레이/아이콘 z-index 순서 확인(선행 3단계와 동일 주의).
  - **동시 재생 폭주**: 스케줄러 상한으로 방어.
  - **next/image 최적화 상실**: `unoptimized:true`라 실질 손실 = lazy뿐 → IntersectionObserver로 대체(중립). 폴백 경로는 next/image 그대로 유지.
- 롤백: Card.tsx의 `<AnimatedWebpImage>`를 `<Image>`로 되돌리면 즉시 원복(신규 파일은 미사용 상태로 남김). 단계별 독립 커밋.

## 검증 방법
- **반응형 360/768/1280px**: 홈·검색·내 캐릭터·채팅리스트·랭킹 사이드바에서 카드 레이아웃 깨짐·가로 스크롤·aspect 틀어짐·잘림 없음. canvas가 부모 비율 정확히 채우는지.
- **성능(프로덕션)**: `npm run build && npm run start` 후 DevTools Performance.
  - 정적 상태(스크롤 없음): 디코드 태스크 최소(프레임0 1회씩)인지.
  - 스크롤 중: `useIsScrolling`으로 재생/디코드 태스크가 0에 수렴하는지(before/after 비교).
  - hover/중앙노출 재생 시 rAF 부하·프레임 타이밍(각 프레임 duration 준수) 확인.
- **폴백 확인**: iOS Safari + 실제 iOS WKWebView, Android WebView(Chromium)에서
  - iOS: canvas 미승격, `next/image` 자동재생 현행과 동일.
  - Android/Chromium: canvas 프레임 제어(정지→hover/중앙 재생→스크롤 정지) 동작.
- **메모리 누수**: DevTools Memory — 카드 40개 스크롤/hover 반복 후 heap 안정(디코더/VideoFrame 상주 수 상한 내), 페이지 이탈 시 해제.
- **접근성**: canvas `role=img`+`aria-label` 스크린리더 낭독, alt 동치.
- **타입/린트**: `npx tsc --noEmit`, `npm run check`(Biome).

## 범위 밖 (하지 않을 것)
- 백엔드 poster/썸네일 필드 추가, `Character` 타입 변경(향후 협업 항목).
- JS WebP 디코더(iOS 프레임 제어) 도입 — 폴백은 현행 자동재생 유지.
- Swiper Virtual 도입(선행 4단계, 별도 판단). `CardGrid` 로직 변경.
- next/image 최적화 재설정(`unoptimized` 변경), 이미지 CDN/포맷/전송용량 최적화.
- `services/api`·모달·라우팅 변경.
