'use client';

import { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'framer-motion';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

// 결제 모달 Props 정의
export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  clientKey: string;
  successUrl?: string;
  failUrl?: string;
  orderName?: string;
  customerName?: string;
  onSuccess?: (paymentResult: any) => void;
  onFail?: (error: any) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  clientKey,
  successUrl = window.location.origin + "/payment/success",
  failUrl = window.location.origin + "/payment/fail",
  orderName = "테스트 결제",
  customerName = "테스트 고객",
  onSuccess,
  onFail
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const widgetsRef = useRef<any>(null);
  const initialized = useRef(false);
  
  // 페이지 마운트 시 토스페이먼츠 초기화
  useEffect(() => {
    // 모달이 열리면 위젯 초기화
    if (isOpen && !initialized.current) {
      initializePaymentWidget();
    }
    
    // 모달이 닫히면 위젯 참조 초기화
    return () => {
      if (!isOpen) {
        widgetsRef.current = null;
        initialized.current = false;
      }
    };
  }, [isOpen, clientKey, amount]);
  
  // 결제 위젯 초기화
  const initializePaymentWidget = async () => {
    if (isProcessing || initialized.current) return;
    
    try {
      setIsProcessing(true);
      
      // 토스페이먼츠 SDK 로드
      const tossPayments = await loadTossPayments(clientKey);
      
      // 위젯 초기화
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
      widgetsRef.current = widgets;
      
      // 금액 설정
      widgets.setAmount({
        currency: "KRW",
        value: amount
      });
      
      // 결제수단 위젯 렌더링
      widgets.renderPaymentMethods({
        selector: '#payment-methods',
        variantKey: 'DEFAULT' 
      });
      
      // 이용약관 렌더링
      widgets.renderAgreement({
        selector: '#agreement',
        variantKey: 'AGREEMENT'
      });
      
      initialized.current = true;
    } catch (err) {
      console.error('위젯 초기화 오류:', err);
      if (onFail) onFail(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 실제 결제 요청
  const handleRequestPayment = async () => {
    if (!widgetsRef.current) {
      alert('결제 위젯이 초기화되지 않았습니다.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // 결제 요청에 필요한 정보
      const orderId = nanoid();
      
      // 결제 요청
      const paymentResult = await widgetsRef.current.requestPayment({
        orderId,
        orderName,
        customerName,
        successUrl,
        failUrl,
        card: {
          // 카드 결제 옵션 (필요시)
        },
      });
      
      // 결제 성공 시 콜백 호출
      if (onSuccess) {
        onSuccess(paymentResult);
      }
      
    } catch (err: any) {
      console.error('결제 오류:', err);
      if (err.message !== '사용자가 결제를 취소하였습니다.') {
        alert(err.message || '결제 처리 중 오류가 발생했습니다.');
      }
      if (onFail) {
        onFail(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 배경 오버레이 */}
          <motion.div 
            className="absolute inset-0 bg-black/50" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessing && onClose()}
          />
          
          {/* 모달 컨텐츠 */}
          <motion.div 
            className="relative z-10 w-full max-w-md bg-white dark:bg-dark-background-light rounded-xl shadow-lg p-6 mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">결제 진행</h2>
              <button 
                onClick={() => !isProcessing && onClose()}
                disabled={isProcessing}
                className="text-secondary-500 hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:text-dark-secondary-200 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-medium mb-1">결제 정보</p>
                <p className="text-sm text-secondary-600 dark:text-dark-secondary-400">금액: {amount.toLocaleString()}원</p>
                <p className="text-sm text-secondary-600 dark:text-dark-secondary-400">주문명: {orderName}</p>
              </div>
              
              {/* 이용약관 영역 */}
              <div id="agreement" className="border border-secondary-200 dark:border-dark-secondary-300/20 rounded-lg"></div>
              
              {/* 결제수단 선택 영역 */}
              <div id="payment-methods" className="border border-secondary-200 dark:border-dark-secondary-300/20 rounded-lg"></div>
              
              {/* 테스트 카드 정보 */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-xs text-secondary-500 dark:text-dark-secondary-400">
                <p className="font-medium mb-1">테스트 카드 정보</p>
                <ul className="space-y-1">
                  <li>• 카드번호: 4000 0000 0000 0000</li>
                  <li>• 만료일: 12/25</li>
                  <li>• CVC: 123</li>
                  <li>• 비밀번호: 아무 6자리 숫자</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-secondary-300 dark:border-dark-secondary-300/30 text-secondary-700 dark:text-dark-secondary-400 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-secondary-300/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소하기
                </button>
                
                <button 
                  onClick={handleRequestPayment}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '처리 중...' : '결제하기'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 