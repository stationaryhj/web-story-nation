'use client'

import { faCreditCard, faHistory, faPen, faPlus, faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useModalStore } from '@/store/useStoreModal'

// 펜 패키지 인터페이스
interface PenPackage {
  id: string
  amount: number
  price: number
  isPopular: boolean
  bonusAmount: number
}

// 충전 내역 인터페이스
interface ChargeHistory {
  id: string
  date: Date
  amount: number
  price: number
  method: string
  status: 'completed' | 'pending' | 'failed'
}

// 샘플 펜 패키지 데이터
const samplePackages: PenPackage[] = [
  {
    id: 'basic',
    amount: 100,
    price: 5000,
    isPopular: false,
    bonusAmount: 0,
  },
  {
    id: 'standard',
    amount: 300,
    price: 12000,
    isPopular: true,
    bonusAmount: 50,
  },
  {
    id: 'premium',
    amount: 600,
    price: 20000,
    isPopular: false,
    bonusAmount: 100,
  },
  {
    id: 'ultimate',
    amount: 1000,
    price: 30000,
    isPopular: false,
    bonusAmount: 200,
  },
]

// 샘플 충전 내역
const sampleHistory: ChargeHistory[] = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3일 전
    amount: 300,
    price: 12000,
    method: '신용카드',
    status: 'completed',
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10일 전
    amount: 100,
    price: 5000,
    method: '카카오페이',
    status: 'completed',
  },
]

export default function CreditSidebar() {
  const { isOpen, modalType, closeModal } = useModalStore()
  const [currentTab, setCurrentTab] = useState<'charge' | 'history'>('charge')

  // 모달이 열려있고, 타입이 credit인 경우에만 렌더링
  if (!isOpen || modalType !== 'credit') {
    return null
  }

  // 현재 펜 충전량
  const currentCredits = 1000

  // 충전 내역 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // 상태에 따른 색상 클래스
  const getStatusColorClass = (status: ChargeHistory['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      default:
        return ''
    }
  }

  // 상태에 따른 텍스트
  const getStatusText = (status: ChargeHistory['status']) => {
    switch (status) {
      case 'completed':
        return '결제 완료'
      case 'pending':
        return '처리 중'
      case 'failed':
        return '결제 실패'
      default:
        return ''
    }
  }

  return (
    <AnimatePresence>
      {/* 오버레이 */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
      />

      {/* 사이드바 */}
      <motion.div
        className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-dark-background-light shadow-xl z-50 overflow-hidden flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-secondary-200 dark:border-dark-secondary-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-200">펜 충전</h2>
          <button
            className="rounded-full p-1 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800 dark:hover:text-dark-secondary-300"
            onClick={closeModal}
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        {/* 현재 펜 수량 */}
        <div className="p-4 bg-primary-50 dark:bg-dark-primary-900/20 flex items-center justify-between">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faPen} className="h-4 w-4 text-primary-600 dark:text-dark-primary-400 mr-2" />
            <span className="text-primary-900 dark:text-dark-primary-200 font-medium">현재 펜</span>
          </div>
          <div className="text-xl font-bold text-primary-600 dark:text-dark-primary-400">
            {currentCredits.toLocaleString()}
            <span className="ml-1 text-sm font-normal">펜</span>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-secondary-200 dark:border-dark-secondary-700">
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              currentTab === 'charge'
                ? 'text-primary-600 dark:text-dark-primary-400 border-b-2 border-primary-500 dark:border-dark-primary-500'
                : 'text-secondary-600 dark:text-dark-secondary-400 hover:text-primary-600 dark:hover:text-dark-primary-400'
            }`}
            onClick={() => setCurrentTab('charge')}
          >
            충전하기
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              currentTab === 'history'
                ? 'text-primary-600 dark:text-dark-primary-400 border-b-2 border-primary-500 dark:border-dark-primary-500'
                : 'text-secondary-600 dark:text-dark-secondary-400 hover:text-primary-600 dark:hover:text-dark-primary-400'
            }`}
            onClick={() => setCurrentTab('history')}
          >
            충전 내역
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          {/* 충전 탭 */}
          {currentTab === 'charge' && (
            <div className="p-4">
              <p className="text-sm text-secondary-600 dark:text-dark-secondary-400 mb-4">
                펜을 충전하여 AI 캐릭터와 더 많은 대화를 나눠보세요.
              </p>

              {/* 패키지 목록 */}
              <div className="space-y-3">
                {samplePackages.map(pkg => (
                  <div
                    key={pkg.id}
                    className={`relative border rounded-lg p-4 transition-all ${
                      pkg.isPopular
                        ? 'border-primary-500 dark:border-dark-primary-500 shadow-sm'
                        : 'border-secondary-200 dark:border-dark-secondary-700 hover:border-primary-300 dark:hover:border-dark-primary-700'
                    }`}
                  >
                    {pkg.isPopular && (
                      <div className="absolute -top-2 right-4 bg-primary-500 text-white text-xs font-semibold py-0.5 px-2 rounded-full dark:bg-dark-primary-500">
                        인기
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faPen}
                            className="h-3.5 w-3.5 text-primary-600 dark:text-dark-primary-400 mr-2"
                          />
                          <span className="font-medium text-secondary-900 dark:text-dark-secondary-200">
                            {pkg.amount.toLocaleString()} 펜
                          </span>
                        </div>
                        {pkg.bonusAmount > 0 && (
                          <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                            +{pkg.bonusAmount.toLocaleString()} 펜 보너스
                          </div>
                        )}
                        <div className="mt-2 text-secondary-600 dark:text-dark-secondary-400 text-sm">
                          {pkg.price.toLocaleString()}원
                        </div>
                      </div>
                      <button className="bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-dark-primary-900 dark:text-dark-primary-300 dark:hover:bg-dark-primary-800 rounded-full p-2 transition-colors">
                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 결제 수단 */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-secondary-900 dark:text-dark-secondary-200 mb-3">결제 수단</h3>
                <div className="border border-secondary-200 dark:border-dark-secondary-700 rounded-lg">
                  <button className="w-full py-3 px-4 flex items-center justify-between text-secondary-800 dark:text-dark-secondary-300 hover:bg-secondary-50 dark:hover:bg-dark-secondary-800/50 transition-colors">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faCreditCard}
                        className="h-4 w-4 text-secondary-600 dark:text-dark-secondary-400 mr-2"
                      />
                      <span>신용카드</span>
                    </div>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="h-3 w-3 text-secondary-400 dark:text-dark-secondary-600"
                    />
                  </button>
                  <div className="border-t border-secondary-200 dark:border-dark-secondary-700"></div>
                  <button className="w-full py-3 px-4 flex items-center justify-between text-secondary-800 dark:text-dark-secondary-300 hover:bg-secondary-50 dark:hover:bg-dark-secondary-800/50 transition-colors">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 bg-yellow-400 rounded mr-2"></span>
                      <span>카카오페이</span>
                    </div>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="h-3 w-3 text-secondary-400 dark:text-dark-secondary-600"
                    />
                  </button>
                </div>
              </div>

              {/* 안내 사항 */}
              <div className="mt-6 p-3 bg-secondary-50 dark:bg-dark-secondary-800/30 rounded-lg text-xs text-secondary-600 dark:text-dark-secondary-400">
                <ul className="list-disc list-inside space-y-1">
                  <li>충전된 펜은 환불이 불가능합니다.</li>
                  <li>펜은 캐릭터와의 대화 및 다양한 서비스에 사용됩니다.</li>
                  <li>결제 관련 문의는 고객센터로 연락해주세요.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 충전 내역 탭 */}
          {currentTab === 'history' && (
            <div className="p-4">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon
                  icon={faHistory}
                  className="h-4 w-4 text-secondary-600 dark:text-dark-secondary-400 mr-2"
                />
                <h3 className="text-sm font-medium text-secondary-900 dark:text-dark-secondary-200">최근 충전 내역</h3>
              </div>

              {sampleHistory.length === 0 ? (
                <div className="py-8 text-center text-secondary-500 dark:text-dark-secondary-400">
                  <p>충전 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sampleHistory.map(item => (
                    <div
                      key={item.id}
                      className="border border-secondary-200 dark:border-dark-secondary-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-secondary-900 dark:text-dark-secondary-200 mb-1">
                            {item.amount.toLocaleString()} 펜 충전
                          </div>
                          <div className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                            {formatDate(item.date)}
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${getStatusColorClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-secondary-100 dark:border-dark-secondary-800 flex justify-between text-xs">
                        <div className="text-secondary-600 dark:text-dark-secondary-400">
                          결제금액: {item.price.toLocaleString()}원
                        </div>
                        <div className="text-secondary-600 dark:text-dark-secondary-400">{item.method}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button className="mt-4 w-full py-2 text-sm text-primary-600 dark:text-dark-primary-400 hover:text-primary-700 dark:hover:text-dark-primary-300 border border-primary-200 dark:border-dark-primary-800 rounded-lg transition-colors">
                전체 내역 보기
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
