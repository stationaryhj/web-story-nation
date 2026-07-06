import type { TextareaHTMLAttributes } from 'react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { autoResize as autoResizeUtil } from '@/shared/lib/utils/autoResize';
import { cn } from '@/shared/lib/utils/cn';

import FormFieldHeader from './FormFieldHeader';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  description?: string;
  errorMessage?: string;
  showCount?: boolean;
  wrapperClassName?: string;
  autoResize?: { maxRows?: number };
}

const textareaBase =
  'w-full resize-none rounded-[10px] border bg-surface px-3.5 py-[13px] text-sm text-text-primary placeholder:text-[#909090] placeholder-secondary-400 focus:outline-none focus:ring-0.5';

const textareaVariants = {
  default: 'border-border-default focus:border-brand focus:ring-brand',
  error: 'border-danger focus:border-danger focus:ring-danger',
};

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      required,
      description,
      errorMessage,
      showCount = false,
      wrapperClassName,
      className,
      maxLength,
      value,
      rows = 4,
      onChange,
      autoResize,
      ...rest
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const autoResizeRef = useRef(autoResize);
    autoResizeRef.current = autoResize;
    const currentLength = typeof value === 'string' ? value.length : 0;

    const handleRef = useCallback(
      (el: HTMLTextAreaElement | null) => {
        internalRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      },
      [ref]
    );

    // value 변경 시 높이 맞추기
    useEffect(() => {
      const opts = autoResizeRef.current;
      if (!opts || !internalRef.current) return;
      autoResizeUtil(internalRef.current, opts);
    }, [value]);

    // 입력 시 높이 맞추기
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const opts = autoResizeRef.current;
        if (opts) {
          autoResizeUtil(e.target, opts);
        }
        onChange?.(e);
      },
      [onChange]
    );

    return (
      <div className={wrapperClassName}>
        {label && <FormFieldHeader label={label} required={required} description={description} />}
        <div className='flex flex-col items-end gap-y-2'>
          <textarea
            ref={handleRef}
            value={value}
            rows={rows}
            maxLength={maxLength}
            spellCheck={false}
            onChange={handleChange}
            className={cn(
              textareaBase,
              errorMessage ? textareaVariants.error : textareaVariants.default,
              className
            )}
            {...rest}
          />
          <div className='flex w-full items-center justify-between'>
            {errorMessage ? <span className='text-sm text-danger'>{errorMessage}</span> : <span />}
            {showCount && maxLength !== undefined && (
              <span className='text-sm text-text-muted max-md:text-[12px]'>
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
