'use client';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SignupForm from '@/components/form/SignupForm';
import PageTransition from '@/components/motion/PageTransition';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = (formData: {
    nickname: string;
    birthday: string;
    termsAgreed: boolean;
    marketingAgreed: boolean;
  }) => {
    setLoading(true);
    setError(null);

    // 실제 구현 시 회원가입 API 호출
    console.log('회원가입 시도:', formData);

    // 임시: 홈페이지로 리다이렉트
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <PageTransition>
      <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-surface'>
        <div className='w-full max-w-md bg-surface-elevated p-8 rounded-lg shadow-md relative'>
          <button
            onClick={handleClose}
            className='absolute top-4 right-4 text-text-muted hover:text-text-primary'
            aria-label='닫기'
          >
            <FontAwesomeIcon icon={faTimes} size='lg' />
          </button>

          <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-text-primary'>회원가입</h1>
          </div>

          {error && (
            <div className='mb-6 bg-danger/10 border border-danger/40 text-danger px-4 py-3 rounded'>
              {error}
            </div>
          )}

          <SignupForm onSubmit={handleSignup} disabled={loading} />

          {loading && (
            <div className='fixed inset-0 flex items-center justify-center bg-overlay/50 z-50'>
              <div className='bg-surface-elevated p-6 rounded-md shadow-md'>
                <div className='text-center'>
                  <p className='mb-4 text-text-primary'>처리 중입니다...</p>
                  <div className='relative w-16 h-16 mx-auto'>
                    <div className='w-full h-full rounded-full border-4 border-brand/20 border-t-brand animate-spin'></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
