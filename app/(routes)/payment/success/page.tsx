'use client';

import {
  faArrowLeft,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { trackEvent } from '@/app/firebase';
import Footer from '@/components/common/footer';
import Header from '@/components/common/header';
import PageTransition from '@/components/motion/PageTransition';
import { settlementApi } from '@/services/api/storyNationApi';
import { useAccountStore } from '@/store/useAccountStore';
import { ConfirmTossPaymentResponse } from '@/types/api';

// 실제 콘텐츠를 처리하는 컴포넌트
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { updateAccountData, data: accountData } = useAccountStore();

  const [success, setSuccess] = useState<boolean>(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const paymentKey = searchParams?.get('paymentKey');
  const orderId = searchParams?.get('orderId');
  const amount = searchParams?.get('amount');

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
          receiptUrl: `https://dashboard.tosspayments.com/receipt/${paymentKey}`,
        });

        const response = await settlementApi.ConfirmTossPayment(
          paymentKey,
          orderId,
          Number(amount)
        );

        if (response.data.result.err === 0) {
          const { coin_user, coin_free, coin_register } =
            response.data as ConfirmTossPaymentResponse;
          updateAccountData(coin_free, accountData?.coin_free_dt || 0, coin_register, coin_user);
          setResultMsg('주문이 성공적으로 처리되었습니다.');
          setSuccess(true);

          trackEvent('purchase_success', {
            value: Number(amount),
          });
        } else {
          setResultMsg(response.data.result.msg);
          setSuccess(false);
        }

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
      <div className='flex justify-center items-center py-12'>
        <div className='w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <div className='text-danger mb-4 text-lg'>{error}</div>
        <Link
          href='/payment'
          className='inline-flex items-center px-4 py-2 bg-brand hover:bg-brand-hover text-text-inverse rounded-lg'
        >
          <FontAwesomeIcon icon={faArrowLeft} className='mr-2' />
          결제 페이지로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className='max-w-md mx-auto bg-surface-elevated rounded-xl shadow-md p-6'>
      <div className='text-center mb-6'>
        {success ? (
          <div className='w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FontAwesomeIcon icon={faCheckCircle} className='text-green-500 text-3xl' />
          </div>
        ) : (
          <div className='w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FontAwesomeIcon icon={faExclamationTriangle} className='text-danger text-3xl' />
          </div>
        )}
        <h2 className='text-2xl font-bold text-green-600 dark:text-green-400 mb-2'>
          {success ? '결제가 완료되었습니다' : '결제에 실패했습니다'}
        </h2>
        <p className='text-text-muted'>{resultMsg}</p>
      </div>

      <div className='border-t border-border-default pt-4 mb-6'>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div className='text-text-muted'>주문번호</div>
          <div className='text-right font-medium text-text-primary'>{paymentData?.orderId}</div>

          <div className='text-text-muted'>결제금액</div>
          <div className='text-right font-medium text-text-primary'>{paymentData?.amount}원</div>

          <div className='text-text-muted'>결제수단</div>
          <div className='text-right font-medium text-text-primary'>{paymentData?.method}</div>

          <div className='text-text-muted'>결제일시</div>
          <div className='text-right font-medium text-text-primary'>{paymentData?.approvedAt}</div>
        </div>
      </div>

      <div className='flex justify-between'>
        <Link
          href='/'
          className='px-4 py-2 border border-border-default text-text-muted rounded-lg hover:bg-surface-elevated-hover transition-colors'
        >
          홈으로
        </Link>

        <Link
          href='/chat-list'
          className='px-4 py-2 bg-brand hover:bg-brand-hover text-text-inverse rounded-lg transition-colors'
        >
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
      <main className='min-h-screen pb-20'>
        <Header />

        <div className='container mx-auto px-4 py-12'>
          <h1 className='text-3xl font-bold mb-8 text-center text-text-primary'>결제 완료</h1>

          <Suspense
            fallback={
              <div className='flex justify-center items-center py-12'>
                <div className='w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin'></div>
              </div>
            }
          >
            <PaymentSuccessContent />
          </Suspense>
        </div>

        <Footer />
      </main>
    </PageTransition>
  );
}
