import { Variants } from 'framer-motion';

/**
 * 중앙에서 페이드인 + 확장 애니메이션
 * tween 사용으로 정확히 scale: 1에서 종료 (spring 진동으로 인한 서브픽셀 재계산 방지)
 */
export const CENTER_FADE_EXPAND_ANIMATION: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'tween',
      duration: 0.2,
      ease: [0.32, 0.72, 0, 1],
    },
  },
};
