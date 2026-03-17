'use client';

import { useFormContext } from 'react-hook-form';
import type { CharacterFormData } from '@/src/features/edit-character/model/characterFormStore';

export default function IntroForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CharacterFormData>();

  return <div className='flex flex-col gap-8 pl-4'></div>;
}
