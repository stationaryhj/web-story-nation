import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// 커스텀 Tailwind 클래스를 위한 확장된 merge 함수
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'text-color': [
        'text-text-web-muted-color',
        'text-text-primary',
        'text-text-muted',
        'text-text-inverse',
        'text-primary',
        'text-brand',
      ],
      'bg-color': [
        'bg-primary',
        'bg-surface',
        'bg-surface-sunken',
        'bg-surface-elevated',
        'bg-surface-elevated-hover',
        'bg-brand',
        'bg-brand-hover',
        'bg-danger',
        'bg-overlay',
      ],
      'border-color': ['border-border-default', 'border-brand'],
    },
  },
});

// clsx와 tailwind-merge를 결합한 유틸리티 함수
export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
