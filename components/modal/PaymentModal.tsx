'use client'

import React, { useEffect, useState } from 'react'
import BaseModal from './BaseModal'
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk'
import { useAccountStore } from '@/store/useAccountStore'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  clientKey: string
  orderId: string
  orderName: string
  customerName?: string
  onSuccess?: (result: any) => void
  onFail?: (error: any) => void
}

// 토스페이먼츠 결제 위젯 Promise 객체 선언
let paymentWidgetPromise: Promise<any> | null = null

const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  clientKey,
  orderId,
  orderName,
  customerName,
  onSuccess,
  onFail,
}: PaymentModalProps) => {
  const [paymentMethodsWidget, setPaymentMethodsWidget] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('카드')
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 모바일 화면 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // 초기 실행
    handleResize()

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize)

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 사용자 데이터
  const accountData = useAccountStore(state => state.data)
  const customerEmail = accountData?.email || undefined

  // 토스페이먼츠 결제 위젯 초기화
  const initPaymentWidget = async () => {
    if (!clientKey || !amount) return

    // 처음 호출시 위젯 초기화
    if (!paymentWidgetPromise) {
      paymentWidgetPromise = loadPaymentWidget(clientKey, customerEmail ?? '')
    }

    // 위젯 인스턴스 생성
    const paymentWidget = await paymentWidgetPromise
    const methodsWidget = paymentWidget.renderPaymentMethods(
      '#payment-widget',
      { value: amount },
      { variantKey: 'DEFAULT' }
    )

    setPaymentMethodsWidget(methodsWidget)
  }

  // 모달이 열릴 때 결제 위젯 초기화
  useEffect(() => {
    if (isOpen && clientKey) {
      initPaymentWidget()
    }
  }, [isOpen, clientKey, amount])

  // 결제 메서드 변경 핸들러
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method)
  }

  // 결제 요청 처리
  const handlePaymentRequest = async () => {
    if (!paymentMethodsWidget || !orderId) {
      console.error('결제 위젯이 준비되지 않았거나 주문 ID가 없습니다.')
      return
    }

    setIsPaymentProcessing(true)

    try {
      await paymentMethodsWidget.requestPayment({
        orderId: orderId,
        orderName: orderName,
        customerName: customerName || '사용자',
        customerEmail: customerEmail,
        successUrl: window.location.origin + '/payment/success',
        failUrl: window.location.origin + '/payment/fail',
      })

      if (onSuccess) {
        onSuccess({ orderId, amount })
      }
    } catch (error) {
      console.error('결제 요청 오류:', error)
      if (onFail) {
        onFail(error)
      }
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="결제하기"
      size={isMobile ? 'sm' : 'lg'}
      position="center"
      contentClassName={isMobile ? 'max-h-[90vh] overflow-auto' : ''}
      bodyClassName="py-4"
      footerContent={
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-3'} w-full`}>
          <button
            type="button"
            className={`${isMobile ? 'w-full' : 'w-auto'} px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
            onClick={onClose}
            disabled={isPaymentProcessing}
          >
            취소
          </button>
          <button
            type="button"
            className={`${isMobile ? 'w-full' : 'w-auto'} px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed`}
            onClick={handlePaymentRequest}
            disabled={isPaymentProcessing || !paymentMethodsWidget}
          >
            {isPaymentProcessing ? '처리 중...' : `${amount.toLocaleString()}원 결제하기`}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 결제 방법 선택 */}
        <div>
          <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-700 mb-2`}>결제 방법</h3>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['카드', '계좌이체', '가상계좌', '휴대폰'].map(method => (
              <button
                key={method}
                type="button"
                className={`px-3 py-1.5 rounded-md text-sm ${
                  paymentMethod === method
                    ? 'bg-primary-100 text-primary-700 border-primary-200 border'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handlePaymentMethodChange(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* 결제 금액 정보 */}
        <div className={`bg-gray-50 p-${isMobile ? '3' : '4'} rounded-lg`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>상품명</span>
            <span className="font-medium">{orderName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>결제 금액</span>
            <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-primary-600`}>
              {amount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 토스페이먼츠 결제 위젯 */}
        <div id="payment-widget" className={`${isMobile ? 'mt-3' : 'mt-4'} rounded-lg overflow-hidden`}></div>

        {/* 결제 안내 */}
        <div className={`text-${isMobile ? 'xs' : 'sm'} text-gray-500 mt-2`}>
          <p>※ 결제 후 즉시 충전됩니다.</p>
          <p>※ 결제 관련 문의는 고객센터로 연락해 주세요.</p>
        </div>
      </div>
    </BaseModal>
  )
}

export default PaymentModal
