# 파비콘 교체: 분홍 'S' 아이콘 (2026-07-27)

## 요약
브라우저 탭 파비콘을 기존 `storyNation_thumb.png`(구 아이콘)에서 헤더 로고와 동일한 분홍 'S' 아이콘으로 교체했다.

## 작업 내용
1. **아이콘 파일 생성**: `public/images/logo.svg`(헤더 로고, 비트맵 임베드형 SVG)에서 임베드된 원본 PNG(293×293, RGBA)를 추출해 `public/images/lovechat_icon.png`로 저장. SVG 파비콘은 Safari/일부 웹뷰 미지원이라 PNG로 추출함.
2. **`app/layout.tsx` 수정**: `metadata.icons.icon`을 `/images/lovechat_icon.png`로 변경하고 `apple`(apple-touch-icon)도 추가.

## 검증
- localhost:3000 응답에서 `<link rel="icon" href="/images/lovechat_icon.png"/>` + apple-touch-icon 확인.
- `/images/lovechat_icon.png` 200 응답 확인.
- `app/favicon.ico` 파일 없음(우선순위 충돌 없음).

## 참고
- 브라우저가 파비콘을 강하게 캐시하므로, 탭에서 안 바뀌면 강력 새로고침(Ctrl+Shift+R) 필요.
- 구 파일 `public/images/storyNation_thumb.png`은 삭제하지 않음(다른 참조 가능성, OG 이미지는 별도 `sn-thumb.jpg`).
- 관련: `docs/write/write-20260727-rename-lovechat.md`
