'use client';

import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import PageTransition from '@/components/motion/PageTransition';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faArrowLeft, faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

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
      'PAY_PROCESS_CANCELED': '결제가 취소되었습니다.',
      'PAY_PROCESS_ABORTED': '결제가 중단되었습니다.',
      'INVALID_CARD_COMPANY': '올바르지 않은 카드 정보입니다.',
      'INVALID_CARD_NUMBER': '올바르지 않은 카드 번호입니다.',
      'INVALID_CARD_EXPIRY': '올바르지 않은 카드 유효기간입니다.',
      'INVALID_CARD_INSTALL_PLAN': '올바르지 않은 할부 정보입니다.',
      'INVALID_CARD_CVV': '올바르지 않은 CVV 번호입니다.',
      'INVALID_CARD_PASSWORD': '올바르지 않은 카드 비밀번호입니다.',
      'EXCEED_MAX_CARD_INSTALL_PLAN': '최대 할부 개월 수를 초과했습니다.',
      'CARD_PAYMENT_NOT_SUPPORTED': '해당 카드로 결제할 수 없습니다.',
      'INVALID_PAYMENT_METHOD': '올바르지 않은 결제 수단입니다.',
    };
    
    return errorMessages[code] || '결제 중 오류가 발생했습니다.';
  };

  const handleRetry = () => {
    setIsLoading(true);
    router.push('/payment');
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-dark-background-light rounded-xl shadow-md p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">결제에 실패했습니다</h2>
        <p className="text-secondary-600 dark:text-dark-secondary-500 mb-1">
          {getErrorMessage(errorCode || null)}
        </p>
        {errorMsg && (
          <p className="text-sm text-secondary-500 dark:text-dark-secondary-500 mb-4">
            {errorMsg}
          </p>
        )}
        {orderId && (
          <p className="text-sm text-secondary-500 dark:text-dark-secondary-500 mt-2">
            주문번호: {orderId}
          </p>
        )}
      </div>

      <div className="border-t border-secondary-200 dark:border-dark-secondary-300/20 pt-4 mb-4">
        <p className="text-sm text-secondary-600 dark:text-dark-secondary-500 mb-4">
          다시 시도하시거나 다른 결제 수단을 이용해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.
        </p>
      </div>

      <div className="flex justify-between">
        <Link href="/" className="inline-flex items-center px-4 py-2 border border-secondary-300 dark:border-dark-secondary-300/30 text-secondary-700 dark:text-dark-secondary-400 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-secondary-300/10 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          홈으로
        </Link>
        
        <button
          onClick={handleRetry}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faRedoAlt} className="mr-2" />
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
      <main className="min-h-screen pb-20">
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8 text-center">결제 실패</h1>
          
          <Suspense fallback={
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <PaymentFailContent />
          </Suspense>
        </div>
        
        <Footer />
      </main>
    </PageTransition>
  );
}
