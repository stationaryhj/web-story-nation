'use client';

import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils/cn';
import { getImageUri } from '@/src/shared/lib/utils/getImageUri';
import FormFieldHeader from './FormFieldHeader';

interface FormImageUploadProps {
  label?: string;
  required?: boolean;
  description?: string;
  accept?: string;
  value?: string | null;
  onChange?: (file: File | null) => void;
  errorMessage?: string;
  wrapperClassName?: string;
  className?: string;
  notice?: string[];
}

export default function FormImageUpload({
  label,
  required,
  description,
  accept = 'image/jpg,image/jpeg,image/png,image/webp',
  value,
  onChange,
  errorMessage,
  wrapperClassName,
  className,
  notice,
}: FormImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
        onChange?.(file);
      }
    },
    [onChange]
  );

  const displayUrl = previewUrl || (value ? getImageUri(value) : null);

  return (
    <div className={wrapperClassName}>
      {label && <FormFieldHeader label={label} required={required} description={description} />}

      {displayUrl ? (
        <div className='relative w-40 h-40'>
          <Image src={displayUrl} alt='업로드된 이미지' fill className='rounded-[10px] object-cover' />
          <div className='absolute bottom-3 right-3 hover:bg-black duration-100 py-1 px-[7px] gap-1 rounded-lg bg-black/80'>
            <label
              htmlFor='form-image-upload'
              className='cursor-pointer flex items-center justify-center gap-1'
            >
              <div className='w-5 h-5 flex items-center justify-center'>
                <FontAwesomeIcon icon={faArrowUpFromBracket} className='text-white text-sm' />
              </div>
              <p className='text-white text-xs font-regular'>업로드</p>
              <input
                ref={inputRef}
                type='file'
                id='form-image-upload'
                className='hidden'
                accept={accept}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>
      ) : (
        <label
          htmlFor='form-image-upload'
          className={cn(
            'flex flex-col items-center justify-center bg-[#F4F5F5] hover:bg-[#D9D9D9] duration-100 gap-3 w-40 h-40 rounded-[10px] cursor-pointer',
            errorMessage && 'border border-red-500',
            className
          )}
        >
          <Image src='/images/image_thumbnail.svg' alt='이미지 업로드' width={68} height={70} />
          <p className='text-[#A6A6A6] text-xs font-medium'>클릭해서 이미지 업로드</p>
          <input
            ref={inputRef}
            type='file'
            id='form-image-upload'
            className='hidden'
            accept={accept}
            onChange={handleChange}
          />
        </label>
      )}

      {errorMessage && <p className='mt-2 text-sm text-red-500'>{errorMessage}</p>}

      {notice && (
        <div className='mt-3'>
          {notice.map((text: string) => (
            <p key={text} className='text-xs text-[#6B7280]'>
              {text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
