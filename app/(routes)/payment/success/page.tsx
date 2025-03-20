'use client';

import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import PageTransition from '@/components/motion/PageTransition';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

// 실제 콘텐츠를 처리하는 컴포넌트
function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setError('올바르지 않은 결제 정보입니다.');
      setIsLoading(false);
      return;
    }

    // 결제 검증 및 결과 조회
    const verifyPayment = async () => {
      try {
        setIsLoading(true);
        
        // 실제 구현에서는 서버에 검증 요청을 보내야 합니다
        // 지금은 클라이언트에서 임시로 처리
        
        // 서버에 결제 검증 요청 예시:
        // const response = await fetch('/api/payment/verify', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ paymentKey, orderId, amount }),
        // });
        // const data = await response.json();
        
        // 임시 데이터
        setPaymentData({
          paymentKey,
          orderId,
          amount: Number(amount).toLocaleString(),
          method: '카드',
          approvedAt: new Date().toLocaleString(),
          receiptUrl: `https://dashboard.tosspayments.com/receipt/${paymentKey}`
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('결제 검증 오류:', err);
        setError('결제 검증 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [paymentKey, orderId, amount]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4 text-lg">{error}</div>
        <Link href="/payment" className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          결제 페이지로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-dark-background-light rounded-xl shadow-md p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">결제가 완료되었습니다</h2>
        <p className="text-secondary-600 dark:text-dark-secondary-500">
          주문이 성공적으로 처리되었습니다.
        </p>
      </div>

      <div className="border-t border-secondary-200 dark:border-dark-secondary-300/20 pt-4 mb-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-secondary-500 dark:text-dark-secondary-500">주문번호</div>
          <div className="text-right font-medium text-secondary-700 dark:text-dark-secondary-300">{paymentData?.orderId}</div>
          
          <div className="text-secondary-500 dark:text-dark-secondary-500">결제금액</div>
          <div className="text-right font-medium text-secondary-700 dark:text-dark-secondary-300">{paymentData?.amount}원</div>
          
          <div className="text-secondary-500 dark:text-dark-secondary-500">결제수단</div>
          <div className="text-right font-medium text-secondary-700 dark:text-dark-secondary-300">{paymentData?.method}</div>
          
          <div className="text-secondary-500 dark:text-dark-secondary-500">결제일시</div>
          <div className="text-right font-medium text-secondary-700 dark:text-dark-secondary-300">{paymentData?.approvedAt}</div>
        </div>
      </div>

      <div className="flex justify-between">
        <Link href="/" className="px-4 py-2 border border-secondary-300 dark:border-dark-secondary-300/30 text-secondary-700 dark:text-dark-secondary-400 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-secondary-300/10 transition-colors">
          홈으로
        </Link>
        
        <Link href="/chat-list" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
          대화 시작하기
        </Link>
      </div>
    </div>
  );
}

// 메인 컴포넌트
export default function PaymentSuccessPage() {
  return (
    <PageTransition>
      <main className="min-h-screen pb-20">
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8 text-center">결제 완료</h1>
          
          <Suspense fallback={
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <PaymentSuccessContent />
          </Suspense>
        </div>
        
        <Footer />
      </main>
    </PageTransition>
  );
}
