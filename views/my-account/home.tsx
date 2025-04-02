'use client'

import {
  faArrowLeft,
  faChevronRight,
  faCreditCard,
  faMoneyBillWave,
  faCalendarAlt,
  faBuildingColumns,
  faPencilAlt,
  faCheck,
  faPen,
  faInfoCircle,
  faCoins,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BaseButton } from '@/components/elements/button/BaseButton'
import WithdrawModal from '@/components/modal/WithdrawModal'
import { useAccountStore } from '@/store/useAccountStore'
import {
  GetSettlementList,
  GetWithdrawRequestList,
  GetWriterWithdrawStatus,
  GetMonthlyIncome,
} from '@/services/hooks/DataListManager'
import { settlementApi } from '@/services/api/storyNationApi'
import { bridgeIncomeDataToEarningItems, bridgeWithdrawDataToWithdrawItems } from '@/lib/utils/storyNationUtil'
import { useModalStore } from '@/store/useStoreModal'

export default function MyEarningsView() {
  const router = useRouter()
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [profile, setProfile] = useState({
    bank: '',
    accountNumber: '',
    accountHolder: '',
  })

  const { data: userInfo, writerInfo, fetchWriterInfo } = useAccountStore()
  const { openModal } = useModalStore()

  // 월별 수익 내역 ( 1: 이번달, 2: 지난달 )
  const {
    data: monthlyIncomeV1,
    isLoading: monthlyIncomeV1Loading,
    error: monthlyIncomeV1Error,
    refetch: monthlyIncomeV1Refetch,
  } = GetMonthlyIncome(2)

  // 수익 내역
  const {
    data: settlementListData,
    isLoading: settlementListLoading,
    error: settlementListError,
    refetch: settlementListRefetch,
  } = GetSettlementList(1, currentPage, 50)

  // 수익 내역 데이터 처리
  const [earningItems, setEarningItems] = useState<Array<any>>([])

  // 출금 상태
  const { data: writerWithdrawStatus } = GetWriterWithdrawStatus()

  // 출금 내역
  const {
    data: withdrawRequestList,
    isLoading: withdrawRequestListLoading,
    error: withdrawRequestListError,
    refetch: withdrawRequestListRefetch,
  } = GetWithdrawRequestList(1, 50)

  // 출금 내역 데이터 처리
  const [withdrawItems, setWithdrawItems] = useState<
    Array<{
      id: number
      date: string
      amount: number
      status: string
    }>
  >([])

  // 정산 관련 상태
  const [totalEarnings, setTotalEarnings] = useState(userInfo?.coin_user || 0) // 총 수익 (펜 단위)
  const [thisMonthEarnings, setThisMonthEarnings] = useState(monthlyIncomeV1?.monthlyIncome || 0) // 이번달 수익 (펜 단위)
  const [lastMonthEarnings, setLastMonthEarnings] = useState(35000) // 지난달 수익 (펜 단위)
  const [totalPayouts, setTotalPayouts] = useState(withdrawRequestList?.sum_price || 0) // 총 정산액 (펜 단위)
  const [availableAmount, setAvailableAmount] = useState(writerWithdrawStatus?.withdraw_pen || 0) // 정산 가능 금액 (펜 단위)
  const [requestAmount, setRequestAmount] = useState(1500) // 요청 금액 (펜 단위, 최소 1500펜)

  // 무한 스크롤을 위한 관찰자 ref
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 수익 내역 데이터 로드 및 처리
  useEffect(() => {
    if (settlementListData?.IncomeList && !settlementListLoading) {
      try {
        // 응답 구조에 맞게 데이터 처리
        const newItems = bridgeIncomeDataToEarningItems(settlementListData.IncomeList.data || [], currentPage * 50)

        if (currentPage === 1) {
          setEarningItems(newItems)
        } else {
          setEarningItems(prev => [...prev, ...newItems])
        }

        // 페이지네이션 정보 추출
        if (settlementListData.IncomeList) {
          const currPage = Number(settlementListData.IncomeList.current_page) || 1
          const lastPage = Number(settlementListData.IncomeList.last_page) || 1
          setHasMore(currPage < lastPage)
        }
      } catch (error) {
        console.error('수익 내역 데이터 처리 오류:', error)
      }
    }
  }, [settlementListData, settlementListLoading, currentPage])

  // 출금 내역 데이터 로드 및 처리
  useEffect(() => {
    if (withdrawRequestList?.withdrawrequest?.data && !withdrawRequestListLoading) {
      try {
        const newItems = bridgeWithdrawDataToWithdrawItems(withdrawRequestList.withdrawrequest.data)
        setWithdrawItems(newItems)
      } catch (error) {
        console.error('출금 내역 데이터 처리 오류:', error)
      }
    }
  }, [withdrawRequestList, withdrawRequestListLoading])

  // 무한 스크롤 설정
  useEffect(() => {
    // 이전 observer 해제
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // 새 observer 생성
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !settlementListLoading) {
          loadMoreItems()
        }
      },
      { threshold: 0.5 }
    )

    // ref에 observer 연결
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, settlementListLoading])

  // 추가 아이템 로드 함수
  const loadMoreItems = useCallback(() => {
    if (!settlementListLoading && hasMore) {
      setCurrentPage(prev => prev + 1)
    }
  }, [settlementListLoading, hasMore])

  // 계좌 정보
  const [bankAccount, setBankAccount] = useState({
    bank: writerInfo?.bank_nm || '',
    accountNumber: writerInfo?.account_no || '',
    accountHolder: writerInfo?.user_nm || '',
  })

  // 모달 상태
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  // 뒤로가기 핸들러
  const handleBack = () => {
    router.push('/')
  }

  const handleOpenBankInfoModal = () => {
    openModal('bankInfo', {
      bankInfo: {
        bank: bankAccount.bank,
        accountNumber: bankAccount.accountNumber,
        accountHolder: bankAccount.accountHolder,
      },
      onBankInfoChange: (bankInfo: { bank: string; accountNumber: string; accountHolder: string }) => {
        setBankAccount({
          bank: bankInfo.bank,
          accountNumber: bankInfo.accountNumber,
          accountHolder: bankInfo.accountHolder,
        })
      },
    })
  }
  // 출금 요청 핸들러
  const handleWithdrawRequest = () => {
    if (availableAmount < 1500) {
      toast.error('최소 1500펜 이상부터 출금 가능합니다.')
      return
    }
    setRequestAmount(1500) // 기본값 설정
    setIsWithdrawModalOpen(true)
  }

  // 출금 요청 확인 핸들러
  const handleConfirmWithdraw = async () => {
    if (requestAmount < 1500) {
      toast.error('최소 1500펜 이상부터 출금 가능합니다.')
      return
    }

    if (requestAmount > availableAmount) {
      toast.error('출금 가능 금액을 초과할 수 없습니다.')
      return
    }

    const response = await settlementApi.WithdrawRequest(requestAmount, 0, userInfo?.nick_nm || '', '', '')

    if (response.data.result.err === 0) {
      toast.success('출금 요청이 접수되었습니다.')
    } else {
      toast.error('출금 요청에 실패했습니다.')
    }

    setIsWithdrawModalOpen(false)
  }

  // 요청 금액 변경 핸들러
  const handleRequestAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
    setRequestAmount(value)
  }

  // 금액 포맷 함수 - 펜 단위로 변경
  const formatPen = (amount: number) => {
    return amount.toLocaleString('ko-KR')
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="max-w-[1300px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full mr-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h1 className="text-xl font-semibold">수익 관리</h1>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[1300px] mx-auto w-full p-4 pb-16">
        {/* 안내 문구 */}
        <div className="bg-violet-50 rounded-xl p-4 mb-6 border border-violet-200">
          <p className="text-violet-800 flex items-center">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
            <span className="font-medium">확실한 보상! 채팅 수익은 현금으로 정산해 드립니다.</span>
          </p>
        </div>

        {/* 총 수익 & 계좌 정보 섹션 - 2열 그리드로 변경 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 총 수익 섹션 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">쌓은 펜</h2>
            <div className="text-3xl font-bold text-violet-700 mb-4 flex items-center">
              {formatPen(totalEarnings)}
              <FontAwesomeIcon icon={faPen} className="ml-2 text-violet-700" />
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">출금 가능 펜</div>
              <div className="text-lg font-semibold text-gray-800 flex items-center">
                {formatPen(availableAmount)}
                <FontAwesomeIcon icon={faPen} className="ml-1 text-gray-500" />
              </div>
            </div>
            <div className="mt-4">
              <BaseButton
                onClick={handleWithdrawRequest}
                color="gradient"
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 !text-white hover:from-violet-700 hover:to-fuchsia-700 !border-transparent"
                disabled={availableAmount < 1500}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                출금 신청하기
              </BaseButton>
              {availableAmount < 1500 && (
                <p className="text-sm text-red-500 mt-2">* 최소 1500펜 이상부터 출금 가능합니다.</p>
              )}
            </div>
          </div>

          {/* 지급 계좌 정보 섹션 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">지급 계좌 정보</h2>
              <button
                className="px-4 py-2 mr-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
                onClick={handleOpenBankInfoModal}
              >
                수정하기
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faBuildingColumns} className="text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">은행</div>
                  <div className="font-medium">{bankAccount.bank}</div>
                </div>
              </div>
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faCreditCard} className="text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">계좌번호</div>
                  <div className="font-medium">{bankAccount.accountNumber}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">예금주</div>
                  <div className="font-medium">{bankAccount.accountHolder}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 출금 관련 안내문 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <ul className="space-y-1 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>출금은 1500펜부터 가능하며, 매달 1회씩 1~5일에 출금 가능합니다.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>출금액은 1펜당 10원으로 계산됩니다.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>출금 신청한 금액은 6~10일에 순차적으로 지급됩니다.</span>
            </li>
          </ul>
        </div>

        {/* 수익 요약 & 출금 내역 - 2열 그리드로 변경 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 수익 요약 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">수익 요약</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-gray-700">지난달까지 총 수익</div>
              <div className="font-semibold text-xl flex items-center mt-1">
                {formatPen(thisMonthEarnings)} <FontAwesomeIcon icon={faPen} className="ml-1" />
              </div>
            </div>

            {/* 수익 내역 리스트 - 스크롤 가능한 영역으로 변경 */}
            <div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto pr-2">
              {settlementListLoading && earningItems.length === 0 ? (
                <div className="py-4 text-center text-gray-500">로딩 중...</div>
              ) : earningItems.length > 0 ? (
                earningItems.map(item => (
                  <div key={item.id} className="py-3 flex justify-between">
                    <div>
                      <div className="text-sm text-gray-500">{item.date}</div>
                      <div className="font-medium">{item.description}</div>
                    </div>
                    <div className="flex items-center font-medium">
                      {formatPen(item.amount)} <FontAwesomeIcon icon={faPen} className="ml-1" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">수익 내역이 없습니다.</div>
              )}

              {/* 무한 스크롤을 위한 로딩 표시기 */}
              {hasMore && (
                <div ref={loadMoreRef} className="py-2 text-center text-gray-400 text-sm">
                  {settlementListLoading ? '로딩 중...' : '스크롤하여 더 보기'}
                </div>
              )}
            </div>
          </div>

          {/* 출금 내역 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">출금 내역</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-gray-700">총 출금 금액</div>
              <div className="font-semibold text-xl flex items-center mt-1">
                {formatPen(Number(withdrawRequestList?.sum_price || 0))}{' '}
                <FontAwesomeIcon icon={faPen} className="ml-1" />
              </div>
            </div>
            {withdrawRequestListLoading ? (
              <div className="text-center text-gray-500 py-6">로딩 중...</div>
            ) : withdrawItems.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {withdrawItems.map(request => (
                  <div key={request.id} className="py-3 flex justify-between">
                    <div className="text-sm text-gray-500">{request.date}</div>
                    <div className="flex items-center font-medium">
                      {formatPen(request.amount)} <FontAwesomeIcon icon={faPen} className="ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">출금 내역이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 출금 신청 모달 */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        bankAccount={bankAccount}
        availableAmount={availableAmount}
        requestAmount={requestAmount}
        onRequestAmountChange={handleRequestAmountChange}
        onConfirm={handleConfirmWithdraw}
      />

      {/* react-toastify 컨테이너 */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  )
}
