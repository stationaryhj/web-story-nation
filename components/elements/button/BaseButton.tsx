'use client';

import cn from 'classnames';
import React from 'react';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'tertiary' | 'gradient';
  loading?: boolean;
}

export const BaseButton = ({
  children,
  className,
  onClick,
  size = 'md',
  color = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}: BaseButtonProps) => {
  // 기본 스타일 클래스
  const baseStyles =
    'flex items-center justify-center rounded-full font-medium transition-all duration-300';

  // 크기에 따른 스타일
  const sizeStyles = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-2.5 px-5 text-lg',
  };

  // 색상에 따른 스타일
  const colorStyles = {
    primary:
      'bg-surface text-text-primary border border-border-default hover:bg-brand-hover hover:text-text-inverse hover:border-brand-hover focus:bg-brand-hover focus:text-text-inverse focus:border-brand-hover shadow-sm',
    secondary:
      'bg-surface text-text-primary border border-border-default hover:bg-surface-elevated focus:bg-surface-elevated-hover shadow-sm focus:ring-border-default',
    tertiary:
      'bg-surface border border-border-default text-text-primary hover:bg-surface-elevated focus:bg-surface-elevated shadow-sm focus:ring-border-default',
    gradient:
      'bg-surface text-text-primary border border-border-default hover:bg-surface-elevated focus:bg-gradient-to-r focus:from-brand focus:to-fuchsia-500 focus:text-text-inverse focus:border-brand shadow-sm',
  };

  // 비활성화 스타일
  const disabledStyles =
    'opacity-60 cursor-not-allowed focus:ring-0 bg-surface-elevated text-text-muted border border-border-default';

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        sizeStyles[size],
        !disabled && colorStyles[color],
        disabled && disabledStyles,
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent' />
      ) : (
        children
      )}
    </button>
  );
};
