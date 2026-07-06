# StoryNation — 테마 semantic 토큰화 구현 리뷰 (계획 대비)

- **리뷰 일자**: 2026-07-06
- **대상 브랜치**: `red-main`
- **근거 계획**: `docs/plan/plan-20260706-theming-semantic-tokens-v2.md`
- **구현 산출물**: `docs/write/write-20260706-theming-semantic-tokens-v2.md`(인프라) + `step4`~`step9`(6개 배치)
- **목적**: 실제 구현이 최초 계획과 어디서·왜 달라졌는지 정리하고, 릴리스 전 잔여 리스크를 명확히 한다.

---

## 결론 먼저

**계획의 핵심 메커니즘(단일 상수 `APP_THEME`로 라이트↔다크 전환 + semantic 토큰/CSS 변수)은 의도대로 달성됐고, 라이브 코드의 색상 `dark:` 유틸은 0건이 됐다.** 다만 계획의 **4·5단계 스코프가 대표 디렉토리 열거에 그쳐 라이브 파일 224건/30파일을 누락**했고, 이는 구현 중(6단계)에야 발견돼 계획에 없던 후속 배치 3개(A/B/C)로 메꿨다. 즉 목표는 달성했으나 **범위 산정이 부정확**했다. 남은 게이트는 **다크 실사용 육안/접근성 QA**다.

---

## 1. 계획대로 된 것 ✅

| 항목 | 계획 | 결과 |
|---|---|---|
| 색 추상화 | CSS 변수(RGB 채널) + Tailwind semantic 매핑 | `tailwind.config.ts`·`app/globals.css` 그대로 구현, `bg-surface/50` alpha 유틸 동작 |
| 전환 메커니즘 | `.dark` 클래스 상수 고정(대안 A) | `src/shared/config/theme.ts`의 `APP_THEME` 한 줄 → `<html>` 정적 적용 |
| 런타임 분기 제거 | localStorage/`prefers-color-scheme`/토글 제거 | layout 초기화 스크립트·providers 동기화 effect·`useThemeStore` persist 제거 |
| 다크 팔레트 | #141414/#0F0F0F/#3A3A3A/#FF2E7E 등 확정값 | `.dark` 변수에 그대로 반영 |
| 폰트 | Noto Sans KR(latin subset+swap) | `app/layout.tsx` 도입, `fontFamily.sans` 폴백 등록 |
| 검증 | 단계별 build/tsc | 전 배치 `tsc --noEmit`·`build`(24 라우트) 통과 |

---

## 2. 계획과 틀린 것 🔴 (핵심)

### 2-1. [범위 산정 오류] 4·5단계가 라이브 파일을 대량 누락
- **계획 가정**: 4단계=`src/shared/ui`+`components/elements`+`components/modal`, 5단계=`views/*`+결제. "원시유틸 425회/114파일, HEX 55회" 카운트에 근거.
- **실제**: 6단계 전수 grep에서 **위 디렉토리 밖 라이브 구 다크 팔레트 224건/30파일** 잔존 발견. 누락 계층:
  - `components/common/*` — header/footer/MobileGNB (**전 페이지 크롬**, 영향 최대)
  - `components/form/character/*` — 캐릭터 생성/편집 폼 전체(BasicInfoForm 49, DetailInfoForm 36 등)
  - `components/main/*`·`recommend/*` — 홈 추천 섹션
  - `components/chat/*` — 채팅 리스트류(단, 오펀으로 판명)
  - `components/elements/{navigation,tabs,tags,list,selectbox}`, `src/features/edit-character/ui/EditStory.tsx`, `app/(routes)/chat/[id]/page.tsx`
- **근본 원인**: 계획이 **디렉토리 열거를 코드베이스 전수 grep으로 교차검증하지 않음**. "425회/114파일"이라는 총량은 알았지만, 그 114파일이 어느 디렉토리에 분포하는지를 스코프 디렉토리와 대조하지 않아 `components/common`·`components/form/character`·`components/main` 계층이 통째로 빠졌다.
- **조치**: 계획 밖 후속 배치 A(9파일)/B(11파일)/C(11파일) 추가. 최종 라이브 색상 `dark:` **0건**.
- **교훈**: 대량 치환 계획은 "대표 디렉토리"가 아니라 **대상 패턴의 전수 grep 결과 = 파일 목록 자체**를 스코프로 삼아야 한다. (→ code-planner 에이전트에 반영)

### 2-2. [세부 결정 차이] 매핑·값 판단
- 라이트 `surface-sunken`/`surface-elevated`를 "현행 대응값" 대신 **흰색 계열로 채움**(회귀 0 우선). 다크에서만 스왑.
- "더보기" 링크류: 계획표 `primary-600`→`brand-hover` 대신 `CardGrid` 선례 우선 `text-brand hover:text-brand-hover`.
- `useThemeStore`: "제거/중립화 택일" 중 **중립화** 채택(소비처 호환).

### 2-3. [계획 밖 발견]
- **오펀 컴포넌트**: `components/chat/*`, `components/elements/badge/Badge.tsx`, `components/form/ToggleSwitch.tsx`, `views/chat/home.tsx`(전체 주석) — 미사용. 삭제는 범위 밖으로 보류.
- **최종 잔량 76건/12파일**: 전량 죽은 코드·오펀 → 방치 가능.

---

## 3. 릴리스 전 잔여 리스크 / 후속 (게이트)

1. 🔴 **다크 실사용 육안 + 접근성(WCAG AA) QA 미수행** — 코드 레벨 검토만 완료. `APP_THEME='dark'`로 홈·검색·캐릭터생성·채팅·결제·설정 실렌더 회귀(흰 배경 튐 0, 대비) 필수. **다크 릴리스 게이트.**
2. 🟡 **"확인 필요" 제품 컨펌** (각 write 문서 집계): 결제 CTA blue→brand 통일, `RecommendSection` 앱다운로드 배지색, `like-level` 다색 유지, 삭제(X) 버튼 danger 승격, 소셜 로그인 브랜드색 유지 여부.
3. 🟢 **오펀 컴포넌트 정리**(별도 이슈): Badge/ToggleSwitch/chat/*·views/chat/home.tsx 삭제 검토.
4. 🟢 잔여 브랜드색 소수(`chat/[id]/page.tsx` 스피너 `border-primary-500` 등) 정리.
5. 🟢 계획 범위 밖 유지분: `primary/secondary/v2.*` 레거시 토큰 정의 존치(대량 참조 보호), `styles/globals.css` 데드 파일, 오렌지 실드 뱃지.

---

## 4. 프로세스 개선 제안

- **계획 단계**: 대량/횡단(cross-cutting) 치환은 스코프를 "디렉토리 열거"가 아니라 **`grep` 산출 파일 목록**으로 고정하고, 그 목록을 계획서에 그대로 첨부한다. 누락 계층 방지.
- **6단계형 "전수 재조사"를 마지막이 아니라 계획 직후(0단계)에도** 1회 수행해 스코프를 확정하면, 후속 배치 3개가 애초에 계획 배치로 흡수됐을 것.
