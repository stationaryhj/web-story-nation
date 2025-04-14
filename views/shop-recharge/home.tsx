'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PageTransition from '@/components/motion/PageTransition'
import Image from 'next/image'

// 더미 상품 데이터
const penPackages = [
  {
    id: 1,
    pen: 100,
    bonusPen: 20,
    discountRate: 20,
    originalPrice: '2,000',
    price: '1,600',
    image: '/images/pen1.png',
  },
  {
    id: 2,
    pen: 200,
    bonusPen: 50,
    discountRate: 20,
    originalPrice: '4,000',
    price: '3,200',
    image: '/images/pen2.png',
  },
  {
    id: 3,
    pen: 420,
    bonusPen: 100,
    discountRate: 20,
    originalPrice: '7,500',
    price: '6,000',
    image: '/images/pen3.png',
  },
  {
    id: 4,
    pen: 750,
    bonusPen: 150,
    discountRate: 25,
    originalPrice: '13,200',
    price: '9,900',
    image: '/images/pen4.png',
  },
  {
    id: 5,
    pen: 1350,
    bonusPen: 250,
    discountRate: 25,
    originalPrice: '22,700',
    price: '17,000',
    image: '/images/pen5.png',
  },
  {
    id: 6,
    pen: 2100,
    bonusPen: 400,
    discountRate: 30,
    originalPrice: '37,000',
    price: '25,900',
    image: '/images/pen6.png',
  },
]
import { useAccountStore } from '@/store/useAccountStore'
import { useCoinStore } from '@/store/useStoreData'
import { CoinData, OrderIdResponse, UseHistoryData } from '@/types/api'
import { settlementApi } from '@/services/api/storyNationApi'
import PaymentModal from '@/components/modal/PaymentModal'
import { ReqGetCoinChargeUseHistory } from '@/services/hooks/DataListManager'

export default function ShopRecharge() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge')
  const { coinList } = useCoinStore(state => ({ coinList: state.coinList }))
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

  // 결제 모달 관련 상태
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentOrderId, setPaymentOrderId] = useState('')
  const [tossClientKey, setTossClientKey] = useState('')

  // 디바운스 및 API 중복 호출 방지를 위한 refs
  const isProcessing = useRef(false)
  const selectedCoinRef = useRef<CoinData | null>(null)

  // user Data
  const accountData = useAccountStore(state => state.data)
  const freePen = Number(accountData?.coin_free || 0) + Number(accountData?.coin_register || 0)
  const paidPen = Number(accountData?.coin_user || 0)

  const {
    data: coinChargeUseHistoryData,
    isLoading: coinChargeUseHistoryLoading,
    error: coinChargeUseHistoryError,
    refetch: coinChargeUseHistoryRefetch,
  } = ReqGetCoinChargeUseHistory(0, 1, 50)

  console.log('@@ coinChargeUseHistoryData :: ', coinChargeUseHistoryData)

  const coinChargeUseHistoryDataList = (coinChargeUseHistoryData?.historyList?.data as UseHistoryData[]) || []

  // 날짜 형식 변환 함수 (시분초 제거)
  const formatDate = (dateString: string) => {
    // 공백을 기준으로 분리하여 첫 번째 부분(날짜)만 반환
    return dateString.split(' ')[0]
  }

  // 콘텐츠 텍스트 변환 함수
  const getContentText = (content: string) => {
    // "Changing your nickname"인 경우 "닉네임 변경"으로 변경
    if (content === 'Changing your nickname') {
      return '닉네임 변경'
    }
    return content
  }

  // 안전한 content 파싱 함수
  const getWebPrice = useCallback((content: string | undefined): number => {
    if (!content) return 0
    try {
      const contentData = JSON.parse(content)
      return contentData.web_price || 0
    } catch (e) {
      console.error('JSON 파싱 오류:', e)
      return 0
    }
  }, [])

  // OrderId 가져오기 (재사용 가능한 함수로 분리)
  const fetchOrderId = useCallback(async (coinKey: number) => {
    console.log('@@@@@@ ::: coinKey ::: ', coinKey)
    try {
      const response = await settlementApi.GetOrderId(coinKey.toString())
      return response.data as OrderIdResponse
    } catch (error) {
      console.error('OrderId 가져오기 실패:', error)
      throw error
    }
  }, [])

  // 패키지 클릭 핸들러 (useCallback으로 메모이제이션)
  const handlePackageClick = useCallback(
    async (coinKey: number, amount: number) => {
      // 이미 처리 중이면 중복 호출 방지
      if (isProcessing.current) {
        console.log('이미 처리 중입니다.')
        return
      }

      // 처리 상태 설정
      isProcessing.current = true

      try {
        console.log('@@ coinKey :: ', coinKey)

        // API 호출로 주문 ID 가져오기
        const orderIdData = await fetchOrderId(coinKey)
        console.log('@@ orderIdData :: ', orderIdData)

        // 상태 업데이트 (한 번에 모아서)
        setPaymentAmount(amount)
        setPaymentOrderId(orderIdData.orderId)
        setTossClientKey(orderIdData.toss_client_key)
        setIsPaymentModalOpen(true)
      } catch (error) {
        console.error('패키지 처리 중 오류 발생:', error)
      } finally {
        // 300ms 후에 처리 상태 해제 (디바운스)
        setTimeout(() => {
          isProcessing.current = false
        }, 300)
      }
    },
    [fetchOrderId]
  )

  const handlePaymentSuccess = (result: any) => {
    console.log('@@ result :: ', result)
  }

  const handlePaymentFail = (error: any) => {
    console.log('@@ error :: ', error)
  }

  // 모바일 환경에서 거래 내역을 카드 형태로 렌더링
  const renderMobileHistoryCard = (transaction: UseHistoryData, index: number) => {
    let typeInfo
    try {
      // JSON 문자열 파싱
      const propertyData = JSON.parse(transaction.property || '{}')
      const chatMode = propertyData.chat_mode

      // chat_mode에 따른 스타일과 텍스트 지정
      let styleClass = ''
      let modeText = ''

      if (chatMode === '1') {
        styleClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        modeText = '가성비모드'
      } else if (chatMode === '2') {
        styleClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        modeText = '스토리모드'
      } else if (chatMode === '3') {
        styleClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
        modeText = '짜릿모드 1'
      } else if (chatMode === '4') {
        styleClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        modeText = '짜릿모드 2'
      } else {
        styleClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        modeText = getContentText(transaction.content || '기타')
      }

      typeInfo = <span className={`px-2 py-1 rounded-full text-xs font-medium ${styleClass}`}>{modeText}</span>
    } catch (e) {
      // JSON 파싱 오류 시 기본값 표시
      typeInfo = (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            transaction.property === '충전' || transaction.property === '보너스'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {getContentText(transaction.content || '오류')}
        </span>
      )
    }

    return (
      <div
        key={index}
        className="bg-white dark:bg-dark-background-light rounded-lg shadow p-3 mb-3 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(transaction.create_dt)}</div>
          {typeInfo}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-300">{getContentText(transaction.content)}</div>
          <div
            className={`font-medium ${
              transaction.coin > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {transaction.coin > 0 ? '+' : ''}
            {transaction.coin}
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background pb-20">
        {/* 헤더 */}
        <div className="bg-white dark:bg-dark-background-light shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-3 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">펜 충전</h1>
            </div>
          </div>

          {/* 탭 메뉴 */}
          <div className="container mx-auto px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                className={`flex-1 py-2 sm:py-3 text-sm sm:text-base font-medium text-center relative ${
                  activeTab === 'recharge'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setActiveTab('recharge')}
              >
                펜 충전
                {activeTab === 'recharge' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 dark:bg-primary-400"></div>
                )}
              </button>
              <button
                className={`flex-1 py-2 sm:py-3 text-sm sm:text-base font-medium text-center relative ${
                  activeTab === 'history'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setActiveTab('history')}
              >
                펜 사용 내역
                {activeTab === 'history' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 dark:bg-primary-400"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="container mx-auto px-4 py-4 sm:py-6">
          {/* 보유 펜 정보 */}
          <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex flex-wrap gap-4'} mb-5 sm:mb-6`}>
            <div
              className={`${isMobile ? 'w-full' : 'flex-1 min-w-[250px]'} bg-white dark:bg-dark-background-light rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center">
                <div className="bg-primary-100 dark:bg-dark-primary-900/30 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                  <Image src="/images/pen/pen_primary.svg" alt="pen" width={24} height={24} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">유료 펜</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{paidPen}</p>
                </div>
              </div>
            </div>

            <div
              className={`${isMobile ? 'w-full' : 'flex-1 min-w-[250px]'} bg-white dark:bg-dark-background-light rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                  <Gift className="h-[25px] w-[25px] sm:h-6 sm:w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">무료 펜</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{freePen}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 충전 탭 콘텐츠 */}
          {activeTab === 'recharge' && (
            <div>
              <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">펜 패키지</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {coinList &&
                  coinList.map(coin => {
                    const webPrice = getWebPrice(coin.content)

                    return (
                      <motion.div
                        key={coin.coin_key}
                        whileHover={{ scale: isMobile ? 1.01 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white dark:bg-dark-background-light rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
                        onClick={() => handlePackageClick(coin.coin_key, webPrice)}
                      >
                        <div className="p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="bg-primary-100 dark:bg-dark-primary-900/30 px-2 sm:px-3 py-1 rounded-full">
                              <span className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400">
                                {coin.cnt} 펜
                              </span>
                            </div>
                            <span className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                              ₩ {webPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="aspect-square relative bg-gray-100 dark:bg-dark-background-accent rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                              <Image
                                src={`/images/pen/coin_${coin.cnt}.png`}
                                alt={`${coin.cnt}개 펜 이미지`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* 사용 내역 탭 콘텐츠 */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                펜 사용 내역
              </h2>

              {/* 모바일 화면에서는 카드 형태로 표시 */}
              {isMobile ? (
                <div className="space-y-2">
                  {coinChargeUseHistoryDataList?.map((transaction, index) =>
                    renderMobileHistoryCard(transaction, index)
                  )}
                </div>
              ) : (
                /* 데스크톱에서는 테이블 형태로 표시 */
                <div className="bg-white dark:bg-dark-background-light rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-dark-background-accent">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            날짜
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            유형
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            양
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            상세
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-dark-background-light divide-y divide-gray-200 dark:divide-gray-700">
                        {coinChargeUseHistoryDataList?.map((transaction, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              {formatDate(transaction.create_dt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {(() => {
                                try {
                                  // JSON 문자열 파싱
                                  const propertyData = JSON.parse(transaction.property || '{}')
                                  const chatMode = propertyData.chat_mode

                                  // chat_mode에 따른 스타일과 텍스트 지정
                                  let styleClass = ''
                                  let modeText = ''

                                  if (chatMode === '1') {
                                    styleClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    modeText = '가성비모드'
                                  } else if (chatMode === '2') {
                                    styleClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    modeText = '스토리모드'
                                  } else if (chatMode === '3') {
                                    styleClass =
                                      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    modeText = '짜릿모드 1'
                                  } else if (chatMode === '4') {
                                    styleClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    modeText = '짜릿모드 2'
                                  } else {
                                    styleClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                    modeText = getContentText(transaction.content || '기타')
                                  }

                                  return (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styleClass}`}>
                                      {modeText}
                                    </span>
                                  )
                                } catch (e) {
                                  // JSON 파싱 오류 시 기본값 표시
                                  return (
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        transaction.property === '충전' || transaction.property === '보너스'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                      }`}
                                    >
                                      {getContentText(transaction.content || '오류')}
                                    </span>
                                  )
                                }
                              })()}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                transaction.coin > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {transaction.coin > 0 ? '+' : ''}
                              {transaction.coin}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {getContentText(transaction.content)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={paymentAmount}
        clientKey={tossClientKey}
        orderId={paymentOrderId}
        orderName="펜 충전"
        customerName={accountData?.nick_nm}
        onSuccess={handlePaymentSuccess}
        onFail={handlePaymentFail}
      />
    </PageTransition>
  )
}
