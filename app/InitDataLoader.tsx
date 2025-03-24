'use client';

import { useEffect } from 'react';
import { useCoinStore } from '@/store/useStoreData';
import { ReqGetCoinList } from '@/services/hooks/DataListManager';
import { useQuery } from '@tanstack/react-query';
import { CoinListResponse } from '@/types/api';

interface InitDataLoaderProps {
  children: React.ReactNode;
}

export function InitDataLoader({ children }: InitDataLoaderProps) {
  // Zustand 스토어의 setter 함수와 데이터 가져오기
  const { coinList, setCoinList } = useCoinStore(state => ({
    coinList: state.coinList,
    setCoinList: state.setCoinList
  }));
  
  // coinList가 비어있는지 확인
  const shouldFetchCoinList = !coinList || coinList.length === 0;

  console.log('shouldFetchCoinList', shouldFetchCoinList, coinList);
  
  // 직접 useQuery 사용하여 enabled 옵션 적용
  const { 
    data: coinListData, 
    isLoading: coinListLoading 
  } = useQuery<CoinListResponse>({
    queryKey: ['coinList'],
    queryFn: async () => {
      const response = await ReqGetCoinList();
      return response.data as CoinListResponse;
    },
    enabled: shouldFetchCoinList, // coinList가 비어있을 때만 API 호출
    staleTime: 24 * 60 * 60 * 1000, // 1일 동안 데이터 신선하게 유지
    gcTime: 24 * 60 * 60 * 1000 // 1일 동안 캐시 유지 (cacheTime → gcTime)
  });
  
  // CoinList 데이터가 로드되면 Zustand 스토어에 저장
  useEffect(() => {
    if (coinListData && coinListData.coinList) {
      console.log('CoinList 데이터 스토어에 저장:', coinListData);
      setCoinList(coinListData.coinList);
    }
  }, [coinListData, setCoinList]);
  
  // 하이드레이션 처리 (persist 스토어 사용 시 필요)
  useEffect(() => {
    // persist 스토어 하이드레이션
    useCoinStore.persist.rehydrate();
  }, []);
  
  // 로딩 상태 처리 - 데이터를 가져와야 하고 아직 로딩 중일 때만 표시
  if (shouldFetchCoinList && coinListLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return <>{children}</>;
} 