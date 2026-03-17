import type { TextareaHTMLAttributes } from 'react';
import { forwardRef, useCallback, useRef } from 'react';

import { cn } from '@/shared/lib/utils/cn';

import FormFieldHeader from './FormFieldHeader';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  description?: string;
  errorMessage?: string;
  autoResize?: boolean;
  showCount?: boolean;
  wrapperClassName?: string;
}

const textareaBase =
  'w-full resize-none rounded-[10px] border bg-white px-3.5 py-[13px] text-sm text-secondary-900 placeholder:text-[#909090] placeholder-secondary-400 focus:outline-none focus:ring-0.5 dark:border-dark-secondary-200/10 dark:bg-dark-background-light dark:text-dark-secondary-400 dark:focus:ring-dark-primary-500';

const textareaVariants = {
  default: 'border-[#A6A6A6] focus:border-primary-500 focus:ring-primary-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
};

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      required,
      description,
      errorMessage,
      autoResize = false,
      showCount = false,
      wrapperClassName,
      className,
      maxLength,
      value,
      rows = 4,
      onChange,
      ...rest
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const currentLength = typeof value === 'string' ? value.length : 0;

    const handleResize = useCallback((el: HTMLTextAreaElement) => {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, []);

    const handleRef = useCallback(
      (el: HTMLTextAreaElement | null) => {
        internalRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      },
      [ref]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (autoResize) handleResize(e.target);
        onChange?.(e);
      },
      [autoResize, handleResize, onChange]
    );

    return (
      <div className={wrapperClassName}>
        {label && <FormFieldHeader label={label} required={required} description={description} />}
        <div className='flex flex-col items-end gap-y-2'>
          <textarea
            ref={handleRef}
            value={value}
            rows={autoResize ? 1 : rows}
            maxLength={maxLength}
            onChange={handleChange}
            className={cn(
              textareaBase,
              errorMessage ? textareaVariants.error : textareaVariants.default,
              autoResize && 'overflow-hidden',
              className
            )}
            {...rest}
          />
          <div className='flex items-center justify-between w-full'>
            {errorMessage ? <span className='text-sm text-red-500'>{errorMessage}</span> : <span />}
            {showCount && maxLength !== undefined && (
              <span className='text-sm text-[#6B7280]'>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
