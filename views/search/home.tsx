'use client'

import PageTransition from '@/components/motion/PageTransition'
import React, { useState } from 'react'
import Header from '@/components/common/header'
import SearchBar from '@/components/elements/searchBar/SearchBar'
import CardGrid from '@/components/elements/card/CardGrid'
import Dropdown from '@/components/elements/dropdown/Dropdown'

type Props = {}

export default function searchPage({}: Props) {
  const [sortType, setSortType] = useState('popularity')

  const handleSearch = (query: string, option?: string) => {
    console.log('@@ query :: ', query)
    console.log('@@ option :: ', option)
  }

  return (
    <PageTransition>
      <Header />

      <div className="container mx-auto px-4 pt-6 relative">
        <div>
          <SearchBar onSearch={handleSearch} placeholder="캐릭터나 작가를 검색해보세요" />
        </div>
        <div className="flex justify-between items-center py-4">
          <div className="text-xl text-gray-700 font-bold">7개의 검색결과</div>
          <div>
            <Dropdown
              value={sortType}
              onChange={setSortType}
              options={[
                { label: '인기순', value: 'popularity' },
                { label: '최신순', value: 'latest' },
              ]}
            />
          </div>
        </div>
        <div>
          <CardGrid />
        </div>
      </div>
    </PageTransition>
  )
}
