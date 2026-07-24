# 홈 탭 — '남자'/'여자'/'성별모름' 메뉴 제외 (main 직접 수정)

- 작성 일자: 2026-07-24
- 담당: main (`views/main/home.tsx`는 writer/main 담당 파일 — 자명한 배열 항목 제거라 별도 계획 없이 직접 수정)
- 관련 문서: [`docs/publish/publish-20260724-home-chip-tabs-mobile-single-row.md`](../publish/publish-20260724-home-chip-tabs-mobile-single-row.md) (동일 칩 탭 영역의 선행 작업)

## 요약

사용자 요청에 따라 홈 칩 탭 메뉴에서 성별 필터 탭 3개(`남자`/`여자`/`성별모름`)를 제외했다. 정적 탭은 `추천`/`랭킹`/`최신`/`인기` 4개만 남고, 뒤에 태그 랭킹 탭(최대 10개)이 이어진다(최대 4+10=14칩).

## 변경 파일

- `views/main/home.tsx:20-26` — `navigationTabs` 배열에서 `male`/`female`/`unknown` 3개 항목 제거. 다른 로직은 무변경.

```diff
  const navigationTabs: TabItem[] = [
    { id: 'all', label: '추천', shouldUpdateUrl: true },
    { id: 'ranking', label: '랭킹', shouldUpdateUrl: true },
    { id: 'latest', label: '최신', shouldUpdateUrl: true },
    { id: 'popular', label: '인기', shouldUpdateUrl: true },
-   { id: 'male', label: '남자', shouldUpdateUrl: true },
-   { id: 'female', label: '여자', shouldUpdateUrl: true },
-   { id: 'unknown', label: '성별모름', shouldUpdateUrl: true },
  ];
```

## 영향 범위 확인

- 렌더링 분기(`home.tsx:100-125`)의 마지막 else 분기(`CharacterGridSection`)는 그대로 유지 — 사용자가 URL로 직접 `?tab=male` 등에 접근하는 기존 링크는 여전히 해당 카테고리 그리드가 폴백으로 렌더링된다(탭 메뉴에서만 제외, 라우팅 자체는 깨지지 않음).
- 칩 탭 레이아웃(모바일 1줄 / md+ 2줄 분할)은 `ButtonTabs` 내부에서 `tabs.length` 기준으로 동적 계산(`Math.ceil(tabs.length / 2)`)되므로 탭 수 감소에 자동 대응(코드 변경 불필요).
- 폴백(태그 로딩 전/실패) 상태의 정적 탭이 7개 → 4개로 줄어 md+ 2줄 분할은 2/2로 나뉜다(기존 4/3과 동일한 규칙).

## 검증

- `npx tsc --noEmit` — 통과(에러 없음).

## 미완 · 후속

- `CharacterGridSection`의 `male`/`female`/`unknown` 카테고리 처리 코드는 남아 있음(직접 URL 접근 폴백용으로 유지). 성별 카테고리 기능 자체를 완전히 제거하려면 별도 작업 필요(요청 범위 밖).
