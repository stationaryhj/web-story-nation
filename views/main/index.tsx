'use client';

import CardGrid from '@/components/elements/card/CardGrid';
import Navigation from '@/components/elements/navigation/Navigation';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import PageTransition, { SectionTransition } from '@/components/motion/PageTransition';
import { ReqTop10Characters } from '@/services/hooks/DataListManager';
import { useStoreData } from '@/store/useStoreData';
import { useState, useEffect } from 'react';
import { bridgeTop10DataToModuleCharacter } from '@/lib/utils/storyNationUtil';

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

  if(top10Loading) {
  }


  if(top10Error) {
    return <div>Error: { top10Error.message }</div>;
  }


  // 모든 모듈 데이터 처리 (module_1 ~ module_7)
  const moduleData = [
    { id: 1, title: "아이돌 스캔들의 주인공들",
      subtitle: "캐릭터와 채팅하고 오리지널 스토리도 읽어보세요!",
      data: bridgeTop10DataToModuleCharacter(top10Data?.module_1 || []) },

    { id: 2, title: "남친 삼고픈 '진짜' 알파메일",
      subtitle: "깊은 대화로 그 남자의 숨겨진 매력을 발견하세요!",
      data: bridgeTop10DataToModuleCharacter(top10Data?.module_2 || []) },

    { id: 3, title: "취향저녁 판타지 캐릭터!",
      subtitle: "독특한 세계관 속 로맨스와 모험이 펼쳐집니다 :)",
      data: bridgeTop10DataToModuleCharacter(top10Data?.module_3 || []) },

    { id: 4, title: "평범한 고등학생은 없습니다.",
      subtitle: "일진녀부터 마법사까지... 누구랑 엮일래?",
      data: bridgeTop10DataToModuleCharacter(top10Data?.module_4 || []) },

    { id: 5, title: "1분만에 손절? 레전드 소개팅!",
      subtitle: "상상도 못한 매칭, 레전드 썰 제조기 등장",
      data: bridgeTop10DataToModuleCharacter(top10Data?.module_5 || []) },

    { id: 6, title: "천사의 위로 vs 악마의 복수",
      subtitle: "상처받은 날엔 랜선엄마, 빡친 날엔 저주인형",
      data: bridgeTop10DataToModuleCharacter(top10Data?.module_6 || []) },

    { id: 7, title: "당신을 사로잡을 여신들",
      subtitle: "당신과 그녀, 둘 만의 은밀한 이야기를 즐겨보세요!",
      data: bridgeTop10DataToModuleCharacter(top10Data?.module_7 || []) }
  ];


  return (
    <PageTransition>
      <main className="min-h-screen pb-20">
        <Header/>
        <Navigation onCategoryChange={ handleCategoryChange } onSearch={ handleSearch }/>

        {/* 모듈 데이터 기반으로 섹션 생성 */}
        {moduleData.map((module, index) => (
          // 데이터가 있는 모듈만 출력
          module.data.length > 0 && (
            <SectionTransition 
              key={`module-${module.id}`} 
              className="py-12 bg-white dark:bg-dark-background-light" 
              delay={0.1 * (index + 1)}
            >
              <CardGrid title={module.title} subtitle={module.subtitle} categoryId={`module-${module.id}`} customData={module.data} />
            </SectionTransition>
          )
        ))}

        <Footer/>
      </main>
    </PageTransition>
  );
}
