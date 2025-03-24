'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faPen, faGift, faHistory, faCoins } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { useModalStore } from '@/store/useStoreModal'
import { useCoinStore, useAccountStore } from '@/store/useStoreData'
import List, { ListItem } from '@/components/elements/list/List'
import { CoinData } from '@/types/api'
import PaymentModal from '@/components/modal/PaymentModal';

interface CreditSidebarProps {}

export default function CreditSidebar({}: CreditSidebarProps) {
  const { isOpen, modalType, closeModal } = useModalStore()
  const { coinList } = useCoinStore(state => ({ coinList: state.coinList }))
  const accountData = useAccountStore(state => state.data)
  const [activeTab, setActiveTab] = useState<'charge' | 'history'>('charge')

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentOrderId, setPaymentOrderId] = useState(0)
  const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
  
  // 계정 데이터에서 펜 정보 가져오기
  const freePenCount = accountData?.coin_free ?? 0
  const paidPenCount = accountData?.coin_register ?? 0

  if (!isOpen || modalType !== 'credit') {
    return null
  }

  // 예시 펜 사용 내역 데이터
  const penUsageHistory: ListItem[] = [
    {
      id: '1',
      content: '짜릿모드 2.0 사용',
      secondaryContent: '2023-06-15 14:32',
      leading: (
        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-dark-primary-900/50 flex items-center justify-center text-primary-600 dark:text-dark-primary-400">
          <FontAwesomeIcon icon={faPen} />
        </div>
      ),
      trailing: <span className="text-sm font-medium text-secondary-800 dark:text-dark-secondary-300">-7 펜</span>,
    },
    {
      id: '2',
      content: '스토리모드 사용',
      secondaryContent: '2023-06-14 16:22',
      leading: (
        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-dark-primary-900/50 flex items-center justify-center text-primary-600 dark:text-dark-primary-400">
          <FontAwesomeIcon icon={faPen} />
        </div>
      ),
      trailing: <span className="text-sm font-medium text-secondary-800 dark:text-dark-secondary-300">-3 펜</span>,
    },
    {
      id: '3',
      content: '가성비모드 사용',
      secondaryContent: '2023-06-13 10:15',
      leading: (
        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-dark-primary-900/50 flex items-center justify-center text-primary-600 dark:text-dark-primary-400">
          <FontAwesomeIcon icon={faPen} />
        </div>
      ),
      trailing: <span className="text-sm font-medium text-secondary-800 dark:text-dark-secondary-300">-1 펜</span>,
    },
    {
      id: '4',
      content: '무료 펜 충전',
      secondaryContent: '2023-06-12 09:05',
      leading: (
        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <FontAwesomeIcon icon={faGift} />
        </div>
      ),
      trailing: <span className="text-sm font-medium text-green-600 dark:text-green-400">+50 펜</span>,
    },
    {
      id: '5',
      content: '펜 패키지 구매',
      secondaryContent: '2023-06-10 17:45',
      leading: (
        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <FontAwesomeIcon icon={faCoins} />
        </div>
      ),
      trailing: <span className="text-sm font-medium text-green-600 dark:text-green-400">+200 펜</span>,
    },
  ]

  const handlePackageClick = (coinData: CoinData) => {
    console.log('@@ coinKey :: ', coinData)

    const amount = coinData.price
    const orderId = coinData.coin_key

    setPaymentAmount(amount)
    setPaymentOrderId(orderId)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = (result: any) => {
    console.log('@@ result :: ', result)
  }

  const handlePaymentFail = (error: any) => {
    console.log('@@ error :: ', error)
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/30 dark:bg-black/60 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
      />
      <motion.div
        className="fixed top-0 right-0 w-80 sm:w-96 h-full bg-white dark:bg-dark-background-light z-50 shadow-xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* 사이드바 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100 dark:border-dark-secondary-800">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-dark-secondary-100">펜 관리</h2>
          <button
            onClick={closeModal}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary-100 dark:hover:bg-dark-secondary-800 text-secondary-500 dark:text-dark-secondary-400"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* 탭 버튼 */}
        <div className="flex border-b border-secondary-100 dark:border-dark-secondary-800">
          <button
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'charge'
                ? 'text-primary-600 dark:text-dark-primary-400 border-b-2 border-primary-600 dark:border-dark-primary-400'
                : 'text-secondary-600 dark:text-dark-secondary-400 hover:text-secondary-900 dark:hover:text-dark-secondary-200'
            }`}
            onClick={() => setActiveTab('charge')}
          >
            펜 충전
          </button>
          <button
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'history'
                ? 'text-primary-600 dark:text-dark-primary-400 border-b-2 border-primary-600 dark:border-dark-primary-400'
                : 'text-secondary-600 dark:text-dark-secondary-400 hover:text-secondary-900 dark:hover:text-dark-secondary-200'
            }`}
            onClick={() => setActiveTab('history')}
          >
            펜 사용내역
          </button>
        </div>

        {/* 펜 충전 탭 */}
        {activeTab === 'charge' && (
          <div className="p-6">
            <div className="bg-secondary-50 dark:bg-dark-secondary-800/30 rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-200 mb-4">보유 펜</h3>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mr-3">
                    <FontAwesomeIcon icon={faGift} />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400">무료 펜</p>
                    <p className="text-lg font-bold text-secondary-900 dark:text-dark-secondary-200">
                      {freePenCount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button className="text-sm text-primary-600 dark:text-dark-primary-400 hover:text-primary-700 dark:hover:text-dark-primary-300 font-medium">
                  받기
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                    <FontAwesomeIcon icon={faCoins} />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400">유료 펜</p>
                    <p className="text-lg font-bold text-secondary-900 dark:text-dark-secondary-200">
                      {paidPenCount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-sm font-medium transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700">
                  충전하기
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-200 mb-4">패키지</h3>
              <div className="space-y-3">
                {/* coinList 데이터를 사용하여 패키지 렌더링 */}
                {coinList && coinList.length > 0 ? (
                  coinList.map((coin) => (
                    <div 
                      key={coin.coin_key}
                      className="border border-secondary-200 dark:border-dark-secondary-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-dark-primary-600 transition-colors cursor-pointer"
                      onClick={() => handlePackageClick(coin)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-secondary-900 dark:text-dark-secondary-200">
                          {coin.coin_nm}
                        </span>
                        {coin.sort > 0 && (
                          <span className="bg-primary-100 dark:bg-dark-primary-900/60 text-primary-700 dark:text-dark-primary-400 text-xs font-medium px-2 py-1 rounded-full">
                            인기
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faPen} className="text-primary-600 dark:text-dark-primary-400 mr-1.5" />
                          <span className="text-secondary-800 dark:text-dark-secondary-300">{coin.cnt} 펜</span>
                        </div>
                        <span className="text-secondary-900 dark:text-dark-secondary-200 font-bold">
                          ₩{coin.price.toLocaleString()}
                        </span>
                      </div>
                      {coin.content && (
                        <p className="text-xs text-secondary-500 dark:text-dark-secondary-400 mt-2">
                          {coin.content}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-secondary-500 dark:text-dark-secondary-400">
                    패키지 정보를 불러오는 중입니다...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 펜 사용내역 탭 */}
        {activeTab === 'history' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-200 mb-4">
              최근 사용 내역
            </h3>
            <List items={penUsageHistory} bordered divided />
          </div>
        )}
      </motion.div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={paymentAmount}
        clientKey={clientKey}
        orderId={paymentOrderId}
        orderName="펜 충전"
        customerName={accountData?.nick_nm}
        onSuccess={handlePaymentSuccess}
        onFail={handlePaymentFail}
      />
    </>
  )
}
