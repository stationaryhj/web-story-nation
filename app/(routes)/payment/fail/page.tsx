'use client';

import { faArrowLeft, faExclamationTriangle, faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Footer from '@/components/common/footer';
import PageTransition from '@/components/motion/PageTransition';

// 실제 콘텐츠를 처리하는 컴포넌트
function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // 토스페이먼츠 실패 응답 파라미터
  const errorCode = searchParams?.get('code');
  const errorMsg = searchParams?.get('message');
  const orderId = searchParams?.get('orderId');

  // 에러 코드별 사용자 친화적인 메시지
  const getErrorMessage = (code: string | null) => {
    if (!code) return '알 수 없는 오류가 발생했습니다.';

    const errorMessages: Record<string, string> = {
      PAY_PROCESS_CANCELED: '결제가 취소되었습니다.',
      PAY_PROCESS_ABORTED: '결제가 중단되었습니다.',
      INVALID_CARD_COMPANY: '올바르지 않은 카드 정보입니다.',
      INVALID_CARD_NUMBER: '올바르지 않은 카드 번호입니다.',
      INVALID_CARD_EXPIRY: '올바르지 않은 카드 유효기간입니다.',
      INVALID_CARD_INSTALL_PLAN: '올바르지 않은 할부 정보입니다.',
      INVALID_CARD_CVV: '올바르지 않은 CVV 번호입니다.',
      INVALID_CARD_PASSWORD: '올바르지 않은 카드 비밀번호입니다.',
      EXCEED_MAX_CARD_INSTALL_PLAN: '최대 할부 개월 수를 초과했습니다.',
      CARD_PAYMENT_NOT_SUPPORTED: '해당 카드로 결제할 수 없습니다.',
      INVALID_PAYMENT_METHOD: '올바르지 않은 결제 수단입니다.',
    };

    return errorMessages[code] || '결제 중 오류가 발생했습니다.';
  };

  const handleRetry = () => {
    setIsLoading(true);
    router.push('/payment');
  };

  return (
    <div className='max-w-md mx-auto bg-surface-elevated rounded-xl shadow-md p-6'>
      <div className='text-center mb-6'>
        <div className='w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
          <FontAwesomeIcon icon={faExclamationTriangle} className='text-danger text-3xl' />
        </div>
        <h2 className='text-2xl font-bold text-danger mb-2'>결제에 실패했습니다</h2>
        <p className='text-text-muted mb-1'>{getErrorMessage(errorCode || null)}</p>
        {errorMsg && <p className='text-sm text-text-muted mb-4'>{errorMsg}</p>}
        {orderId && <p className='text-sm text-text-muted mt-2'>주문번호: {orderId}</p>}
      </div>

      <div className='border-t border-border-default pt-4 mb-4'>
        <p className='text-sm text-text-muted mb-4'>
          다시 시도하시거나 다른 결제 수단을 이용해 주세요. 문제가 계속되면 고객센터로 문의해
          주세요.
        </p>
      </div>

      <div className='flex justify-between'>
        <Link
          href='/'
          className='inline-flex items-center px-4 py-2 border border-border-default text-text-muted rounded-lg hover:bg-surface-elevated-hover transition-colors'
        >
          <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
          홈으로
        </Link>

        <button
          onClick={handleRetry}
          disabled={isLoading}
          className='inline-flex items-center px-4 py-2 bg-brand hover:bg-brand-hover text-text-inverse rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <FontAwesomeIcon icon={faRedoAlt} className='mr-2' />
          {isLoading ? '이동 중...' : '다시 시도하기'}
        </button>
      </div>
    </div>
  );
}

// 메인 컴포넌트
export default function PaymentFailPage() {
  return (
    <PageTransition>
      <main className='min-h-screen pb-20'>
        <div className='container mx-auto px-4 py-12'>
          <h1 className='text-3xl font-bold mb-8 text-center text-text-primary'>결제 실패</h1>

          <Suspense
            fallback={
              <div className='flex justify-center items-center py-12'>
                <div className='w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin'></div>
              </div>
            }
          >
            <PaymentFailContent />
          </Suspense>
        </div>

        <Footer />
      </main>
    </PageTransition>
  );
}
