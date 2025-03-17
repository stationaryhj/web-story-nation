'use client'

import React, { useState, useEffect } from 'react'
import Skeleton, {
  TextSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  TableSkeleton,
  ProfileSkeleton,
  GridSkeleton,
  SkeletonThemeProvider
} from '@/components/elements/skeleton'

// 가상의 데이터 로딩 지연을 시뮬레이션하는 함수
const useDelayedData = <T,>(data: T, delay: number = 2000): { data: T | null; isLoading: boolean } => {
  const [loadedData, setLoadedData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadedData(data)
      setIsLoading(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [data, delay])

  return { data: loadedData, isLoading }
}

// 예제 데이터
const exampleCardData = {
  title: '블록체인 기술의 미래',
  description: '블록체인 기술이 어떻게 금융, 공급망, 의료 등 다양한 산업을 변화시키고 있는지 알아봅니다.',
  image: 'https://via.placeholder.com/400x200',
  price: '₩15,000',
  rating: '4.5/5'
}

const exampleListData = Array(5).fill(0).map((_, i) => ({
  id: i,
  name: `사용자 ${i + 1}`,
  description: `사용자 ${i + 1}의 간단한 설명입니다.`,
  avatar: `https://i.pravatar.cc/100?img=${i + 1}`
}))

const exampleTableData = {
  headers: ['이름', '이메일', '역할', '상태'],
  rows: Array(5).fill(0).map((_, i) => [
    `사용자 ${i + 1}`,
    `user${i + 1}@example.com`,
    i % 2 === 0 ? '관리자' : '사용자',
    i % 3 === 0 ? '활성' : '비활성'
  ])
}

const exampleProfileData = {
  name: '홍길동',
  role: '시니어 개발자',
  avatar: 'https://i.pravatar.cc/200',
  bio: '10년 경력의 블록체인 및 웹 개발자입니다. 다양한 프로젝트에서 기술 리더로 활동했으며, 오픈 소스 커뮤니티에 기여하고 있습니다.'
}

const exampleGridData = Array(6).fill(exampleCardData)

// 테마 옵션
const themeOptions = [
  { 
    name: '기본 테마', 
    baseColor: '#E5E7EB', 
    highlightColor: '#F3F4F6', 
    borderRadius: '0.25rem' 
  },
  { 
    name: '다크 테마', 
    baseColor: '#374151', 
    highlightColor: '#4B5563', 
    borderRadius: '0.25rem' 
  },
  { 
    name: '블루 테마', 
    baseColor: '#DBEAFE', 
    highlightColor: '#EFF6FF', 
    borderRadius: '0.5rem' 
  },
  { 
    name: '그린 테마', 
    baseColor: '#D1FAE5', 
    highlightColor: '#ECFDF5', 
    borderRadius: '0.75rem' 
  },
]

export default function SkeletonExamplePage() {
  // 각 컴포넌트에 대한 데이터 로딩 시뮬레이션
  const { data: cardData, isLoading: isCardLoading } = useDelayedData(exampleCardData, 2000)
  const { data: listData, isLoading: isListLoading } = useDelayedData(exampleListData, 3000)
  const { data: tableData, isLoading: isTableLoading } = useDelayedData(exampleTableData, 4000)
  const { data: profileData, isLoading: isProfileLoading } = useDelayedData(exampleProfileData, 2500)
  const { data: gridData, isLoading: isGridLoading } = useDelayedData(exampleGridData, 3500)
  
  // 테마 상태
  const [selectedTheme, setSelectedTheme] = useState(themeOptions[0])

  // 모든 스켈레톤 다시 로드 버튼
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <SkeletonThemeProvider
      baseColor={selectedTheme.baseColor}
      highlightColor={selectedTheme.highlightColor}
      borderRadius={selectedTheme.borderRadius}
    >
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">스켈레톤 UI 컴포넌트 예제</h1>
        <p className="mb-6">
          이 페이지는 다양한 스켈레톤 로딩 컴포넌트를 보여줍니다. 각 컴포넌트는 데이터가 로드되는 동안 표시되며,
          일정 시간 후에 실제 데이터로 대체됩니다.
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            모든 스켈레톤 다시 로드
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">테마:</span>
            <select
              value={selectedTheme.name}
              onChange={(e) => {
                const theme = themeOptions.find(t => t.name === e.target.value)
                if (theme) setSelectedTheme(theme)
              }}
              className="px-3 py-2 border rounded"
            >
              {themeOptions.map((theme) => (
                <option key={theme.name} value={theme.name}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-12">
          {/* 텍스트 스켈레톤 예제 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">텍스트 스켈레톤</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {isCardLoading ? (
                <TextSkeleton lines={4} />
              ) : (
                <div className="space-y-2">
                  <h3 className="text-xl font-medium">{cardData?.title}</h3>
                  <p>{cardData?.description}</p>
                  <p>{cardData?.description}</p>
                  <p>{cardData?.description}</p>
                </div>
              )}
            </div>
          </section>

          {/* 카드 스켈레톤 예제 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">카드 스켈레톤</h2>
            <div className="max-w-sm">
              {isCardLoading ? (
                <CardSkeleton />
              ) : (
                <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <img src={cardData?.image} alt={cardData?.title} className="w-full h-[200px] object-cover" />
                  <div className="p-4 space-y-3">
                    <h3 className="text-xl font-medium">{cardData?.title}</h3>
                    <p className="text-gray-600">{cardData?.description}</p>
                    <div className="flex justify-between pt-2">
                      <span className="font-bold">{cardData?.price}</span>
                      <span className="text-yellow-500">{cardData?.rating}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 리스트 아이템 스켈레톤 예제 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">리스트 아이템 스켈레톤</h2>
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {isListLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4">
                    <ListItemSkeleton />
                  </div>
                ))
              ) : (
                listData?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4">
                    <div className="flex-shrink-0">
                      <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div>
                      <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                        보기
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 테이블 스켈레톤 예제 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">테이블 스켈레톤</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {isTableLoading ? (
                <div className="p-4">
                  <TableSkeleton rows={5} columns={4} />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {tableData?.headers.map((header, i) => (
                        <th
                          key={i}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData?.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* 프로필 스켈레톤 예제 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">프로필 스켈레톤</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {isProfileLoading ? (
                <ProfileSkeleton />
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={profileData?.avatar}
                    alt={profileData?.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <h3 className="text-xl font-bold">{profileData?.name}</h3>
                  <p className="text-gray-500">{profileData?.role}</p>
                  <div className="w-full max-w-md space-y-2 mt-4">
                    <p className="text-gray-700">{profileData?.bio}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 그리드 스켈레톤 예제 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">그리드 스켈레톤</h2>
            {isGridLoading ? (
              <GridSkeleton items={6} columns={3} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gridData?.map((card, i) => (
                  <div key={i} className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <img src={card.image} alt={card.title} className="w-full h-[200px] object-cover" />
                    <div className="p-4 space-y-3">
                      <h3 className="text-xl font-medium">{card.title}</h3>
                      <p className="text-gray-600">{card.description}</p>
                      <div className="flex justify-between pt-2">
                        <span className="font-bold">{card.price}</span>
                        <span className="text-yellow-500">{card.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </SkeletonThemeProvider>
  )
} 