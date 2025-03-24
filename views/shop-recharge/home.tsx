'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faPen, faHistory, faCrown } from '@fortawesome/free-solid-svg-icons'
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

// 더미 거래 내역 데이터
const transactions = [
  { id: 1, date: '2023-12-01', type: '충전', amount: 520, details: '펜 패키지 구매' },
  { id: 2, date: '2023-12-02', type: '사용', amount: -20, details: '캐릭터 대화' },
  { id: 3, date: '2023-12-03', type: '사용', amount: -15, details: '캐릭터 대화' },
  { id: 4, date: '2023-12-04', type: '사용', amount: -25, details: '이미지 생성' },
  { id: 5, date: '2023-12-05', type: '충전', amount: 900, details: '펜 패키지 구매' },
  { id: 6, date: '2023-12-06', type: '사용', amount: -30, details: '캐릭터 대화' },
  { id: 7, date: '2023-12-07', type: '사용', amount: -40, details: '캐릭터 대화' },
  { id: 8, date: '2023-12-08', type: '보너스', amount: 100, details: '출석 보상' },
]

export default function ShopRecharge() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>('recharge')
  const [paidPen, setPaidPen] = useState(600)
  const [freePen, setFreePen] = useState(121)

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-background">
        {/* 헤더 */}
        <div className="bg-white dark:bg-dark-background-light shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">펜 충전</h1>
            </div>
          </div>

          {/* 탭 메뉴 */}
          <div className="container mx-auto px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                className={`flex-1 py-3 font-medium text-center relative ${
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
                className={`flex-1 py-3 font-medium text-center relative ${
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
        <div className="container mx-auto px-4 py-6">
          {/* 보유 펜 정보 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[250px] bg-white dark:bg-dark-background-light rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="bg-primary-100 dark:bg-dark-primary-900/30 p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faPen} className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">유료 펜</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{paidPen}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-[250px] bg-white dark:bg-dark-background-light rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faCrown} className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">무료 펜</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{freePen}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 충전 탭 콘텐츠 */}
          {activeTab === 'recharge' && (
            <div>
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">펜 패키지</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {penPackages.map(pkg => (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white dark:bg-dark-background-light rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
                  >
                    <div className="p-4">
                      {/* 헤더 영역 - 할인률 표시 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="bg-primary-100 dark:bg-dark-primary-900/30 px-3 py-1 rounded-full">
                          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            {pkg.discountRate}% 할인
                          </span>
                        </div>
                      </div>

                      {/* 정보 영역 */}
                      <div className="flex items-center space-x-3 mb-3">
                        {/* 이미지 (크기 축소) */}
                        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-background-accent rounded-lg flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon icon={faPen} className="h-8 w-8 text-primary-500 dark:text-primary-400" />
                        </div>

                        {/* 획득 정보 */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-1">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  {pkg.pen + pkg.bonusPen}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">펜</span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                기본 {pkg.pen} + 보너스 {pkg.bonusPen}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 가격 정보 */}
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs line-through text-gray-400 dark:text-gray-500">
                            ₩ {pkg.originalPrice}
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">₩ {pkg.price}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 사용 내역 탭 콘텐츠 */}
          {activeTab === 'history' && (
            <div>
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">펜 사용 내역</h2>
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
                      {transactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {transaction.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.type === '충전' || transaction.type === '보너스'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              transaction.amount > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {transaction.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
