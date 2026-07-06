'use client';

import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import Footer from '@/components/common/footer';
import Header from '@/components/common/header';
import PageTransition from '@/components/motion/PageTransition';

// 토스페이먼츠 타입 정의
declare global {
  interface Window {
    TossPayments?: any;
  }
}

export default function PaymentTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 토스페이먼츠 스크립트 로드
  useEffect(() => {
    // 이미 로드된 경우 스킵
    if (document.getElementById('toss-payments-script')) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'toss-payments-script';
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('toss-payments-script');
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, []);

  // 토스 결제 요청 함수
  const handlePaymentRequest = () => {
    setIsLoading(true);

    // 주문 번호 생성 (실제 서비스에서는 서버에서 생성하는 것이 좋음)
    const orderId = nanoid();

    // 토스페이먼츠 결제창 호출
    if (!window.TossPayments) {
      alert('TossPayments 스크립트를 로드해주세요');
      setIsLoading(false);
      return;
    }

    const tossPayments = window.TossPayments('test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq');

    // 결제 요청 정보
    tossPayments
      .requestPayment('카드', {
        amount: 1000,
        orderId: orderId,
        orderName: '테스트 결제',
        customerName: '테스트 고객',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
      .catch((error: unknown) => {
        console.error('결제 요청 에러:', error);
        setIsLoading(false);
      });
  };

  return (
    <PageTransition>
      <main className='min-h-screen pb-20'>
        <Header />

        <div className='container mx-auto px-4 py-12'>
          <h1 className='text-3xl font-bold mb-8 text-center text-text-primary'>
            토스 결제 테스트
          </h1>

          <div className='max-w-md mx-auto bg-surface-elevated rounded-xl shadow-md p-6'>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-semibold mb-2 text-text-primary'>테스트 상품</h2>
              <p className='text-text-muted mb-4'>금액: 1,000원</p>
              <p className='text-sm text-text-muted mb-6'>
                이 페이지는 토스 페이먼츠 테스트 모드로 작동합니다. 실제 결제는 진행되지 않습니다.
              </p>
            </div>

            <button
              onClick={handlePaymentRequest}
              disabled={isLoading || !scriptLoaded}
              className='w-full py-3 px-4 bg-brand hover:bg-brand-hover text-text-inverse font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? '처리 중...' : scriptLoaded ? '결제하기' : '스크립트 로딩 중...'}
            </button>

            <div className='mt-4 text-sm text-text-muted'>
              <p>테스트 카드 정보:</p>
              <p>카드번호: 4111-1111-1111-1111</p>
              <p>만료일: 12/25</p>
              <p>생년월일/사업자등록번호: 900101</p>
              <p>비밀번호: 00</p>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </PageTransition>
  );
}
