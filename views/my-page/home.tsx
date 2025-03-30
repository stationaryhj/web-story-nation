'use client'

import {
  faChartSimple,
  faChevronRight,
  faCoins,
  faDownload,
  faMoneyBillWave,
  faPen,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccountStore } from '@/store/useStoreData'
import { bridgeLoginDataToUserInfo } from '@/lib/utils/storyNationUtil'
import { ReqGetCoinChargeUseHistory, GetSettlementList } from '@/services/hooks/DataListManager'

export default function MyPageView() {
  const [activeTab, setActiveTab] = useState<'income' | 'withdrawal'>('income')

  const userInfo = bridgeLoginDataToUserInfo(useAccountStore.getState().data || null)

  if(userInfo === null) {
    return <div>로그인 후 이용해주세요.</div>
  }




  const incomeHistory = [
    { date: '25.03.17', source: '캐릭터 채팅', amount: 170.5, character: '캐릭터1' },
    { date: '25.03.15', source: '캐릭터 채팅', amount: 215.8, character: '캐릭터2' },
    { date: '25.03.12', source: '캐릭터 채팅', amount: 89.3, character: '캐릭터3' },
    { date: '25.03.10', source: '캐릭터 채팅', amount: 125.7, character: '캐릭터1' },
    { date: '25.03.05', source: '캐릭터 채팅', amount: 77.2, character: '캐릭터2' },
    { date: '25.03.02', source: '캐릭터 채팅', amount: 193.6, character: '캐릭터3' },
    { date: '25.02.28', source: '캐릭터 채팅', amount: 110.9, character: '캐릭터1' },
  ]

  const withdrawalHistory = [
    { date: '25.03.05', amount: 1500, status: '완료' },
    { date: '25.02.03', amount: 2500, status: '완료' },
  ]

  const totalIncome = incomeHistory.reduce((sum, item) => sum + item.amount, 0)
  const totalWithdrawal = withdrawalHistory.reduce((sum, item) => sum + item.amount, 0)

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'income' | 'withdrawal') => {
    setActiveTab(tab)
  }

  // 차트 데이터 (더미)
  const chartData = [25, 40, 60, 30, 65, 45, 80]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 pt-10 pb-16 px-4 md:px-6 lg:px-8 text-white">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="text-3xl font-bold mb-3 flex items-center">
            <FontAwesomeIcon icon={faWallet} className="mr-3 text-violet-200" />
            My 정산
          </h1>
          <p className="text-violet-100 mb-1 text-lg">내가 만든 캐릭터로 수익을 창출하세요!</p>
          <p className="text-violet-200 opacity-90">확실한 보상! 채팅 수익은 현금으로 정산해 드립니다.</p>
        </div>
      </div>

      {/* 메인 콘텐츠 컨테이너 */}
      <div className="max-w-[1280px] mx-auto w-full px-4 md:px-6 lg:px-8 -mt-10">
        {/* 프로필 카드 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between mb-6"
        >
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-full flex items-center justify-center overflow-hidden mr-4 border-2 border-white shadow-md">
              <Image
                src="/images/character1.jpg"
                alt="프로필"
                width={64}
                height={64}
                className="object-cover"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.src =
                    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+'
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{userInfo.nickname}</h2>
              <p className="text-gray-500">크리에이터</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 py-2 px-4 rounded-full text-violet-800 font-medium border border-violet-100">
            내 캐릭터 관리
          </div>
        </motion.div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-10 mb-6">
          {/* 쌓인 금액 카드 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-700 font-medium flex items-center">
                  <FontAwesomeIcon icon={faCoins} className="mr-2 text-amber-500" />
                  쌓인 금액
                </h3>
                <button className="text-xs bg-violet-50 hover:bg-violet-100 transition-colors py-1.5 px-3 rounded-full text-violet-700">
                  정산 안내 <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-xs" />
                </button>
              </div>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-gray-800">{userInfo?.getBalance().toLocaleString()}</span>
                <span className="text-gray-500 text-lg ml-2 mb-0.5">펜</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">≈ {(userInfo?.getBalance() * 10).toLocaleString()}원</p>
            </div>
            <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-3 border-t border-violet-100">
              <div className="flex items-center text-sm text-violet-700">
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full"
                    style={{ width: `${Math.min((userInfo?.getBalance() / 1500) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="whitespace-nowrap ml-3">{userInfo?.getBalance()} / 1,500 펜</div>
              </div>
            </div>
          </motion.div>

          {/* 수익 트렌드 카드 */}
          {/* <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700 font-medium flex items-center">
                <FontAwesomeIcon icon={faChartSimple} className="mr-2 text-emerald-500" />
                수익 트렌드
              </h3>
              <span className="text-xs bg-emerald-50 py-1 px-2 rounded-full text-emerald-700">+12.5%</span>
            </div>

            <div className="flex-1 flex items-end mt-4 space-x-1">
              {chartData.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-t-sm"
                    style={{ height: `${value}px` }}
                  ></div>
                  <div className="text-xs text-gray-400 mt-1">{index + 1}일</div>
                </div>
              ))}
            </div>
          </motion.div> */}

          {/* 지급 계좌 카드 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700 font-medium flex items-center">
                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-blue-500" />
                지급 계좌
              </h3>
              <button className="text-xs bg-blue-50 hover:bg-blue-100 transition-colors py-1.5 px-3 rounded-full text-blue-700">
                <FontAwesomeIcon icon={faPen} className="mr-1" /> 변경
              </button>
            </div>
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200 mb-4">
              <div className="space-y-1.5">
                <p className="text-gray-700 font-medium">{userInfo.bank}</p>
                <p className="text-gray-700">{userInfo.accountHolder}</p>
                <p className="text-gray-700">{userInfo.accountNumber}</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-3 px-4 rounded-xl w-full transition-all shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              출금 신청하기
            </button>
          </motion.div>
        </div>

        {/* 안내사항 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 p-5 rounded-2xl border border-violet-100 shadow-sm">
            <h3 className="font-medium text-violet-800 mb-3">출금 안내</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 rounded-full bg-violet-200 text-violet-800 flex-shrink-0 flex items-center justify-center text-xs mr-2 mt-0.5">
                  1
                </span>
                출금은 <span className="font-semibold">1,500펜</span>부터 가능하며, 매달 1회씩, 1~5일에 출금 신청이
                가능합니다.
              </li>
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 rounded-full bg-violet-200 text-violet-800 flex-shrink-0 flex items-center justify-center text-xs mr-2 mt-0.5">
                  2
                </span>
                출금액은 <span className="font-semibold">1펜당 10원</span>으로 계산됩니다.
              </li>
              <li className="flex items-start">
                <span className="inline-block w-5 h-5 rounded-full bg-violet-200 text-violet-800 flex-shrink-0 flex items-center justify-center text-xs mr-2 mt-0.5">
                  3
                </span>
                출금 신청한 금액은 6~10일에 순차적으로 지급됩니다.
              </li>
            </ul>
          </div>
        </motion.div>

        {/* 내역 탭 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10"
        >
          <div className="flex p-1 border-b bg-gray-50">
            <button
              className={`flex-1 py-3 text-center transition-all relative rounded-xl ${
                activeTab === 'income'
                  ? 'bg-white text-violet-700 font-medium shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('income')}
            >
              수익 내역
            </button>
            <button
              className={`flex-1 py-3 text-center transition-all relative rounded-xl ${
                activeTab === 'withdrawal'
                  ? 'bg-white text-violet-700 font-medium shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('withdrawal')}
            >
              출금 내역
            </button>
          </div>

          {/* 총 금액 섹션 */}
          <div className="p-5 border-b">
            {activeTab === 'income' ? (
              <div className="flex items-center justify-between">
                <div className="text-gray-600">총 수익</div>
                <div className="font-semibold text-lg">{totalIncome.toLocaleString()} 펜</div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-gray-600">총 출금 금액</div>
                <div className="font-semibold text-lg">{totalWithdrawal.toLocaleString()} 펜</div>
              </div>
            )}
          </div>

          {/* 내역 리스트 */}
          <div className="max-h-[500px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'income' ? (
                <motion.div
                  key="income"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {incomeHistory.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">{item.source}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {item.date} · {item.character}
                          </div>
                        </div>
                        <div className="font-semibold text-violet-700">{item.amount.toLocaleString()} 펜</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="withdrawal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {withdrawalHistory.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">출금</div>
                          <div className="text-sm text-gray-500 mt-1">{item.date}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="font-semibold text-violet-700 mr-3">{item.amount.toLocaleString()} 펜</div>
                          <span className="bg-emerald-100 text-emerald-700 text-xs py-1 px-2 rounded-full">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
