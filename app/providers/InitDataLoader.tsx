'use client';

import { useEffect } from 'react';
import { useCoinStore, useChatModeStore } from '@/store/useStoreData';
import { useQuery } from '@tanstack/react-query';
import { CoinListResponse, CharbotChatModeResponse } from '@/types/api';
import { settlementApi, contentApi } from '@/services/api/storyNationApi';
import { useAccountStore } from '@/store/useAccountStore';

interface InitDataLoaderProps {
  children: React.ReactNode;
}

export function InitDataLoader({ children }: InitDataLoaderProps) {
  // Zustand 스토어의 setter 함수와 데이터 가져오기
  const { coinList, setCoinList } = useCoinStore(state => ({
    coinList: state.coinList,
    setCoinList: state.setCoinList
  }));
  
  const { chatMode, setChatMode } = useChatModeStore(state => ({
    chatMode: state.chatMode,
    setChatMode: state.setChatMode
  }));
  
  const version = 1.0;
  
  // 데이터가 비어있는지 확인
  const shouldFetchCoinList = !coinList || coinList.length === 0;
  const shouldFetchChatMode = !chatMode || chatMode.length === 0;
  
  // 코인 리스트 가져오기
  const { 
    data: coinListData, 
    isLoading: coinListLoading 
  } = useQuery<CoinListResponse>({
    queryKey: ['coinList'],
    queryFn: async () => {
      const response = await settlementApi.GetCoinList();
      return response.data as CoinListResponse;
    },
    enabled: shouldFetchCoinList, // coinList가 비어있을 때만 API 호출
    staleTime: 24 * 60 * 60 * 1000, // 1일 동안 데이터 신선하게 유지
    gcTime: 24 * 60 * 60 * 1000 // 1일 동안 캐시 유지 (cacheTime → gcTime)
  });
  
  // 채팅 모드 가져오기
  // const {
  //   data: chatModeData,
  //   isLoading: chatModeLoading
  // } = useQuery<CharbotChatModeResponse>({
  //   queryKey: ['chatMode'],
  //   queryFn: async () => {
  //     const response = await contentApi.GetChatMode();
  //     return response.data as CharbotChatModeResponse;
  //   },
  //   enabled: shouldFetchChatMode, // chatMode가 비어있을 때만 API 호출
  //   staleTime: 24 * 60 * 60 * 1000, // 1일 동안 데이터 신선하게 유지
  //   gcTime: 24 * 60 * 60 * 1000 // 1일 동안 캐시 유지
  // });
  
  // // CoinList 데이터가 로드되면 Zustand 스토어에 저장
  // useEffect(() => {
  //   if (coinListData && coinListData.coinList) {
  //     console.log('CoinList 데이터 스토어에 저장:', coinListData);
  //     setCoinList(coinListData.coinList);
  //   }
  // }, [coinListData, setCoinList]);
  
  // ChatMode 데이터가 로드되면 Zustand 스토어에 저장
  // useEffect(() => {
  //   if (chatModeData && chatModeData.chat_mode) {
  //     console.log('ChatMode 데이터 스토어에 저장:', chatModeData);
  //     setChatMode(chatModeData.chat_mode);
  //   }
  // }, [chatModeData, setChatMode]);
  
  // 하이드레이션 처리 (persist 스토어 사용 시 필요)
  useEffect(() => {
    // persist 스토어 하이드레이션
    useCoinStore.persist.rehydrate();
    useChatModeStore.persist.rehydrate();
  }, []);
  
  // 로딩 상태 처리 - 데이터를 가져와야 하고 아직 로딩 중일 때만 표시
  if ((shouldFetchCoinList && coinListLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return <>{children}</>;
} 