'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import GuestLoginForm from '@/components/form/GuestLoginForm';
import SocialLoginButton from '@/components/form/SocialLoginButton';
import SignupModal from '@/components/modal/SignupModal';
import PageTransition from '@/components/motion/PageTransition';
import { useAccountStore } from '@/store/useAccountStore';
import { OAuthProvider } from '@/types/login';

export default function LoginPage() {
  const router = useRouter();
  const [showSignup, setShowSignup] = useState(false);
  const { loading, error, guestLogin, socialLogin, setError } = useAccountStore();

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (type: OAuthProvider) => {
    try {
      await socialLogin(
        type,
        // 회원가입이 필요한 경우
        () => {
          setShowSignup(true);
        },
        // 로그인 성공 시
        () => {
          router.push('/');
        }
      );
    } catch (err) {
      console.error('소셜 로그인 오류:', err);
    }
  };

  // 게스트 로그인 핸들러
  const handleGuestLogin = async (nickname: string) => {
    try {
      const isSuccess = await guestLogin(nickname);
      if (isSuccess) {
        router.push('/');
      }
    } catch (err) {
      console.error('게스트 로그인 오류:', err);
    }
  };

  // 회원가입 페이지 이동
  const handleSignupClick = () => {
    router.push('/login/signup');
  };

  // 회원가입 모달 닫기
  const handleSignupClose = () => {
    setShowSignup(false);
  };

  // 회원가입 성공 시 처리
  const handleSignupSuccess = () => {
    setShowSignup(false);
    router.push('/');
  };

  return (
    <PageTransition>
      <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-surface'>
        <div className='w-full max-w-md space-y-8'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-text-primary'>로그인</h1>
            <p className='mt-2 text-sm text-text-muted'>러브챗에 오신 것을 환영합니다</p>
          </div>

          {error && (
            <div className='bg-danger/10 border border-danger/40 text-danger px-4 py-3 rounded'>
              {error}
            </div>
          )}

          <div className='mt-8 space-y-6'>
            <div className='space-y-3'>
              <SocialLoginButton type='KAKAO' onClick={handleSocialLogin} disabled={loading} />
              <SocialLoginButton type='NAVER' onClick={handleSocialLogin} disabled={loading} />
              <SocialLoginButton type='GOOGLE' onClick={handleSocialLogin} disabled={loading} />
              <SocialLoginButton type='APPLE' onClick={handleSocialLogin} disabled={loading} />
            </div>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-border-default'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-surface text-text-muted'>또는</span>
              </div>
            </div>

            <GuestLoginForm onSubmit={handleGuestLogin} disabled={loading} />

            <div className='text-center'>
              <p className='text-sm text-text-muted'>
                아직 계정이 없으신가요?{' '}
                <button
                  type='button'
                  onClick={handleSignupClick}
                  className='font-medium text-brand hover:text-brand-hover'
                >
                  회원가입
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSignup && (
        <SignupModal
          isOpen={showSignup}
          onClose={handleSignupClose}
          onSuccess={handleSignupSuccess}
          state={'signup'}
        />
      )}
    </PageTransition>
  );
}
