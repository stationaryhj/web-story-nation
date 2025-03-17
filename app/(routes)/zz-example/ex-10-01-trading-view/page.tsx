'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useChartStore } from '@/store/useChartStore'
import { bithumbCryptoApi, transformCandleData, sortCandlesByTime } from '@/services/api/bithumbApi'
import { UTCTimestamp } from 'lightweight-charts'
import { TIME_UNITS } from '@/services/defineData/bithumb'
import { ChartCandle } from '@/services/defineType/bithumb'

export default function TradingViewTest() {
  const [selectedUnit, setSelectedUnit] = useState<string>('30')
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const { initChart, setChartData, resizeChart, cleanup, isInitChart } = useChartStore()

  // 무한 스크롤을 위한 쿼리
  const { 
    data: chartData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading 
  } = useInfiniteQuery({
    queryKey: ['bitcoin-chart', selectedUnit],
    queryFn: async ({ pageParam }) => {
      const data = await bithumbCryptoApi.getCandles(selectedUnit, pageParam as UTCTimestamp)
      const transformedData = data.map(transformCandleData)
      return transformedData
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined
      const oldestCandle = lastPage[lastPage.length - 1]
      return oldestCandle.time
    },
    initialPageParam: null as UTCTimestamp | null,
    select: (data) => {
      const allData = data.pages.flat() as ChartCandle[]
      return sortCandlesByTime(allData)
    },
  })

  // 차트 초기화
  useEffect(() => {
    if (!chartContainerRef.current) return
    
    initChart(chartContainerRef.current)

    return () => cleanup()
  }, [initChart, cleanup])

  // 페이징 처리 위한 이벤트 리스너 설정
  const handleLoadMore = useCallback(async (event: Event) => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage()
    }
  // hasNextPage, isFetchingNextPage 가 변경되면  
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // 새로 변경된 hasNextPage, isFetchingNextPage 로 이벤트 리스너(handleLoadMore) 를 갱신한다
  useEffect(() => {
    if (!chartContainerRef.current) return

    chartContainerRef.current.addEventListener('loadMoreCandles', handleLoadMore)

    return () => {
      chartContainerRef.current?.removeEventListener('loadMoreCandles', handleLoadMore)
    }
  }, [handleLoadMore])

  // api 데이터 업데이트
  useEffect(() => {
    if (!chartData || !isInitChart) return
    setChartData(chartData)
  }, [chartData, setChartData, isInitChart])

  // 반응형 처리
  const handleResize = useCallback(() => {
    if (chartContainerRef.current) {
      resizeChart(chartContainerRef.current.clientWidth)
    }
  }, [resizeChart])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">비트코인(BTC) 시세</h1>
      
      {/* 시간 단위 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          시간 단위
        </label>
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="w-48 p-2 border rounded"
        >
          {TIME_UNITS.map(unit => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>

      {/* 차트 컨테이너 */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div ref={chartContainerRef} className="w-full h-[400px]">
          {isLoading && (
            <div className="h-full flex items-center justify-center">
              로딩 중...
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 