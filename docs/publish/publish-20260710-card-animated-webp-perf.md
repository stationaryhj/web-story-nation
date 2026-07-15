# 카드 애니메이션 WebP 성능 최적화 — 1단계 퍼블리싱 결과

- 근거 계획: `docs/plan/plan-20260710-card-animated-webp-perf.md` (52~69행, 1단계만)
- 대상 브랜치: `red-main`
- 작업일: 2026-07-10
- 담당 범위: `[담당: publisher]`로 표기된 1a, 1b만 구현. 2·3·4단계(리스너 통합/hover scale 분리/Swiper Virtual)는 손대지 않음.

## 퍼블리싱 요약
계획 1단계에 따라 `app/globals.css`에 `content-visibility` 유틸(`.cv-card`, `.cv-card-h`)을 `@layer utilities`로 추가하고, `components/elements/card/Card.tsx`의 세 variant(가로형/my-character/세로형) 카드 컨테이너 div에 각각 클래스를 적용했다. `CardGrid.tsx`는 계획서 66행 우선안(Card 내부 div 한 곳으로 통일, 중복 containment 방지)에 따라 변경하지 않았다.

## 변경 파일
- `app/globals.css:310-338`(신규 삽입 블록, 기존 스와이퍼 커스텀 CSS `.custom-swiper`/`.card-grid-swiper`/`.author-grid-swiper` 섹션 바로 뒤) — `@layer utilities`에 `.cv-card`(`content-visibility: auto; contain-intrinsic-size: auto 320px;`), `.cv-card-h`(`content-visibility: auto; contain-intrinsic-size: auto 128px;`) 추가. 계획 1a. 반응형 전략: Tailwind에 해당 유틸이 없어 전역 CSS로 정의했고, 값은 모바일/데스크톱 공통으로 쓰이는 근사치(아래 "계획과 달라진 점" 참고)라 브레이크포인트별 분기는 없음.
- `components/elements/card/Card.tsx:139-140` — `horizontal` variant 카드 div(`CardTransition` 내부)에 `cv-card-h` 클래스 추가.
- `components/elements/card/Card.tsx:258-259` — `my-character` variant 카드 div에 `cv-card` 클래스 추가.
- `components/elements/card/Card.tsx:371-372` — `default`(세로형) variant 카드 div에 `cv-card` 클래스 추가.
  - 세 곳 모두 `CardTransition`(Framer Motion 래퍼)이 아니라 **그 안쪽** 카드 div에 적용해 모션 애니메이션과 충돌하지 않게 함(계획 65행 요구사항 준수).
  - 순수 className 추가만 수행. 로직/state/useEffect/JSX 구조는 변경하지 않음.

## 반응형 / 웹뷰 점검
- 360 / 768 / 1280px: 클래스 추가만이므로 카드 자체의 반응형 클래스(`aspect-[3/4]`, `sizes` 등)는 그대로다. `content-visibility: auto`는 레이아웃 폭/그리드 컬럼 수에 영향을 주지 않고 페인트/디코딩 스킵에만 관여하므로 이론상 세 폭 모두에서 시각적 차이는 없어야 한다. 다만 `contain-intrinsic-size`가 근사치라 실제 렌더 높이와 차이가 나면 스크롤 중 미세한 점프가 생길 수 있음 — **실제 브라우저에서 스크롤 점검 필요(확인 필요)**, 특히 홈의 세로 나열 섹션(`CardGridSection` 등 다수 사용처)에서 체감 확인 권장.
- 웹뷰: `content-visibility`/`contain-intrinsic-size`는 iOS Safari/WKWebView 15.4 미만, 구형 Android WebView에서 무시된다. 이 경우 두 속성 모두 no-op이 되어 기존 렌더링(모든 카드 상시 페인트/디코딩)으로 자연 폴백되며 레이아웃이 깨지지는 않는다. 별도 폴백 코드는 작성하지 않았다(계획 61행/1a 명시 사항).
- `overflow-hidden`과의 상호작용: 세 카드 div 모두 이미 `overflow-hidden`을 갖고 있어 `content-visibility`의 페인트 containment와 충돌하지 않는다. `group-hover:scale-110`(3단계 대상, 이번엔 미변경)도 부모가 `overflow-hidden`이라 카드 경계를 넘어 그려지지 않음 — 계획 69행 우려사항 확인 완료.

## 계획과 달라진 점 / 로직 연결 필요 / 미완 · 후속
- `contain-intrinsic-size` 값(`.cv-card: auto 320px`, `.cv-card-h: auto 128px`)은 계획서에서 요구한 대로 **실측이 아닌 근사치**다. 세로 카드는 `aspect-[3/4]` 이미지(카드 폭 약 220px 기준 높이 ~293px) + 하단 텍스트 영역(`p-2.5` 내 제목/태그/설명/작가, ~90px)을 더한 대략치이며, 실제 카드 폭이 반응형(그리드 컬럼 수에 따라 가변)이라 폭별로 오차가 있을 수 있다. 가로형은 이미지 `w-32 h-32`(128px) 고정을 기준으로 잡았다. **추후 실측(DevTools에서 실제 렌더 높이 측정) 후 보정 필요 — 후속 작업으로 남김.**
- 리스크(계획 69행): `contain-intrinsic-size` 부정확 시 스크롤바 위치가 튈 수 있음. 이번 작업에서는 근사치만 적용했고 실제 프로덕션 빌드(`npm run build && npm run start`)에서의 스크롤 점프 여부는 별도 성능 검증(계획 122~129행 "검증 방법") 단계에서 확인이 필요하다 — **확인 필요**.
- 2단계(resize 리스너/isMobile 통합, writer 담당), 3단계(group-hover scale 분리, publisher 담당이지만 이번 지시 범위 밖), 4단계(Swiper Virtual, writer/publisher 담당)는 지시에 따라 전혀 손대지 않았다. `CardGrid.tsx`도 계획 66행 우선안대로 변경하지 않았다.
- `npx tsc --noEmit` 실행 결과 오류 없음(클래스명 추가만이라 타입 영향 없음, 예상대로).
- Card.tsx/CardGrid.tsx는 이번 세션 시작 전부터 이미 다른 변경(패딩/폰트 크기 축소 등, 이번 작업과 무관)이 작업 트리에 존재했다. 이번에 실제로 추가한 것은 `cv-card-h`(139행), `cv-card`(258행), `cv-card`(371행) 3곳의 className 추가뿐이며, 그 외 diff는 이번 작업 이전부터 있던 변경분이다.
