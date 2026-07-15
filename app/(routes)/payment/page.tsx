'use client';

import { useState } from 'react';
import Footer from '@/components/common/footer';
import PaymentModal from '@/components/modal/PaymentModal';
import PageTransition from '@/components/motion/PageTransition';

// 토스페이먼츠 테스트 클라이언트 키
const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

export default function PaymentTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 결제 금액 (테스트용 1,000원)
  const [amount] = useState(1000);

  // 결제 성공 처리
  const handlePaymentSuccess = (result: any) => {
    console.log('결제 성공:', result);
    alert('결제가 성공적으로 완료되었습니다!');
  };

  // 결제 실패 처리
  const handlePaymentFail = (error: any) => {
    console.error('결제 실패:', error);
    // 사용자 취소는 별도 처리하지 않음
    if (error.message !== '사용자가 결제를 취소하였습니다.') {
      alert(`결제 오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
    }
  };

  return (
    <PageTransition>
      <main className='min-h-screen pb-20'>
        <div className='container mx-auto px-4 py-12'>
          <div className='max-w-lg mx-auto'>
            <div className='p-4 bg-surface-elevated rounded-xl shadow-md'>
              <h1 className='text-2xl font-bold mb-6 text-center text-text-primary'>
                토스페이먼츠 결제 테스트
              </h1>

              <div className='p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                <h2 className='font-medium text-lg mb-2 text-text-primary'>결제 테스트</h2>
                <p className='text-sm text-text-muted mb-4'>
                  토스페이먼츠 테스트 모드로 결제를 테스트할 수 있습니다. 실제 결제는 이루어지지
                  않으니 안심하세요.
                </p>
                <div className='text-sm text-text-muted'>
                  <p className='font-semibold'>테스트 결제 정보</p>
                  <ul className='list-disc pl-5 mt-1 space-y-1'>
                    <li>결제 금액: {amount.toLocaleString()}원</li>
                    <li>결제 방식: 신용카드</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isProcessing}
                className='w-full px-6 py-3 bg-brand text-text-inverse rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                결제 모달 열기
              </button>
            </div>
          </div>
        </div>

        {/* 결제 모달 */}
        <PaymentModal
          isOpen={isModalOpen}
          orderId={''}
          onClose={() => setIsModalOpen(false)}
          amount={amount}
          clientKey={clientKey}
          orderName='테스트 상품 결제'
          customerName='테스트 고객'
          onSuccess={handlePaymentSuccess}
          onFail={handlePaymentFail}
        />

        <Footer />
      </main>
    </PageTransition>
  );
}
