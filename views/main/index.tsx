'use client';

import CardGrid from '@/components/elements/card/CardGrid';
import Navigation from '@/components/elements/navigation/Navigation';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import PageTransition, { SectionTransition } from '@/components/motion/PageTransition';
import { ReqTop10Characters } from '@/services/hooks/DataListManager';
import { useStoreData } from '@/store/useStoreData';
import { useState, useEffect } from 'react';


export default function Home() {
  const [ activeCategory, setActiveCategory ] = useState('recommended');
  const [ searchQuery, setSearchQuery ] = useState('');
  const { fetchCharacters } = useStoreData();

  const {
    data: top10Data,
    isLoading: top10Loading,
    error: top10Error,
    refetch: top10Refetch,
  } = ReqTop10Characters();

  useEffect(() => {
    // 페이지 로드 시 모든 캐릭터 데이터 미리 로드
    fetchCharacters();
  }, [ fetchCharacters ]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);

    if(categoryId === 'all') {
      top10Refetch();
    }
  };

  const handleSearch = (query: string) => {
    console.log('@@@@query : ', query);
    setSearchQuery(query);
    // 여기서 검색 로직 구현
    console.log('검색어:', query);
  };

  // 검색 중일 때는 검색 결과만 표시
  if (searchQuery) {
    return (
      <PageTransition>
        <main className="min-h-screen pb-20">
          <Header/>
          <Navigation onCategoryChange={ handleCategoryChange } onSearch={ handleSearch }/>
          <SectionTransition className="py-10 bg-gradient-to-b from-white via-background-light to-white dark:from-dark-background-light dark:via-dark-background-DEFAULT dark:to-dark-background-light">
            <CardGrid title={ `'${ searchQuery }' 검색 결과` } categoryId={ activeCategory }/>
          </SectionTransition>
          <Footer/>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen pb-20">
        <Header/>
        <Navigation onCategoryChange={ handleCategoryChange } onSearch={ handleSearch }/>

        { /* 추천 캐릭터 섹션 */ }
        <SectionTransition className="py-12 bg-white dark:bg-dark-background-light" delay={ 0.1 }>
          <CardGrid title="추천 캐릭터" categoryId="recommended"/>
        </SectionTransition>

        { /* 남성 캐릭터 섹션 */ }
        <SectionTransition className="py-12 bg-white dark:bg-dark-background-light" delay={ 0.2 }>
          <CardGrid title="남성 캐릭터" categoryId="male"/>
        </SectionTransition>

        { /* 여성 캐릭터 섹션 */ }
        <SectionTransition className="py-12 bg-white dark:bg-dark-background-light" delay={ 0.3 }>
          <CardGrid title="여성 캐릭터" categoryId="female"/>
        </SectionTransition>

        { /* 성별 미지정 캐릭터 섹션 */ }
        <SectionTransition className="py-12 bg-white dark:bg-dark-background-light" delay={ 0.4 }>
          <CardGrid title="성별 미지정 캐릭터" categoryId="unspecified"/>
        </SectionTransition>

        <Footer/>
      </main>
    </PageTransition>
  );
}
