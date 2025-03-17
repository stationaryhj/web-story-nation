'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useChartStore } from '@/store/useChartStore'
import { bithumbCryptoApi, transformCandleData, sortCandlesByTime, transformBithumbTickerData } from '@/services/api/bithumbApi'
import { UTCTimestamp } from 'lightweight-charts'
import { bithumbWebSocket, convertTickerToUTCTimestamp } from '@/services/ws/bithumbTicker'
import { TIME_UNITS } from '@/services/defineData/bithumb'
import { ChartCandle, BithumbTickerData } from '@/services/defineType/bithumb'

export default function TradingViewTest() {
  const [selectedUnit, setSelectedUnit] = useState<string>('30')
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const { initChart, setChartData, updateChartData, resizeChart, cleanup, isInitChart } = useChartStore()

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
      // 마지막 데이터가 가장 오래된 데이터로 가정
      const oldestCandle = lastPage[lastPage.length - 1]
      return oldestCandle.time
    },
    initialPageParam: null as UTCTimestamp | null,
    // select 옵션을 사용해 전체 페이지 데이터를 하나의 배열로 평탄화하고 시간순(오름차순)으로 정렬
    select: (data) => {
      // data.pages는 각 페이지의 데이터 배열을 포함하는 배열
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

  // 웹소켓 연결 관리 (차트 초기화와 분리)
  useEffect(() => {
    if (!isInitChart || !updateChartData) return

    bithumbWebSocket.connect()
    bithumbWebSocket.addSubscriber((data: BithumbTickerData) => {
      updateChartData(transformBithumbTickerData(data))
    })
    return () => {
      bithumbWebSocket.disconnect()
    }
  }, [isInitChart, updateChartData])

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
    // chartData는 select 에 의해 이미 flatten & 정렬된 배열입니다.
    setChartData(chartData)
  }, [chartData, setChartData, isInitChart])

  // 반응형 처리
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current) {
        resizeChart(chartContainerRef.current.clientWidth)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [resizeChart])

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