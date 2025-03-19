'use client';

import { ReqTop10Characters } from '@/services/hooks/DataListManager';
import type { Character } from '@/store/useStoreData';
import { useState } from 'react';

import { contentApi, chatApi } from '../services/api';
import Card from './elements/card/Card';

import { ModuleCharacter, CharbotTop10Response } from '@/types/api';
import { bridgeTop10DataToModuleCharacter } from '@/lib/utils/storyNationUtil';

export default function ApiTest() {
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState<string | null>(null);
  const [ data, setData ] = useState<Array<ModuleCharacter> | null>(null);

  const {
    data: top10Data,
    isLoading: top10Loading,
    error: top10Error,
    refetch: top10Refetch,
  } = ReqTop10Characters();

  console.log('@@@@top10Data : ', top10Data);

  const bridgeTop10Data = (data: CharbotTop10Response) => {
    // parse ModuleCharacter to Character
    const characters = data.module_1.map((item) => ({
      id: item.world_list_detail_chrbot_key.toString(),
      name: item.title,
      description: item.intro,
      imageUrl: item.img_url,
      commentCount: item.chat_cnt,
      hashtags: item.tags.split(','),
      isAdult: item.nsfw === 1,
      creator: {
        id: item.world_list_detail_chrbot_key.toString(),
      },
    }));

    // setCharacters(characters);

    return characters;
  };

  if(!top10Data) {
    return <div>로딩중...</div>;
  }


  const characters = bridgeTop10DataToModuleCharacter(top10Data.module_1);
  // if(top10Data) {
  //   bridgeTop10Data(top10Data);
  // }
  

  const handleTop10 = async() => {
    setLoading(true);
    setError(null);

    try {
      const response = await contentApi.GetTop10();
      console.log('Top10 응답:', response);

      if (response?.result?.err === 0) {
        // module_1의 데이터를 사용
        setData(response.module_1 || []);

        // parse ModuleCharacter to Character
        const characters = response.module_1.map((item) => ({
          id: item.world_list_detail_chrbot_key.toString(),
          name: item.title,
          description: item.intro,
          imageUrl: item.img_url,
          commentCount: item.chat_cnt,
          hashtags: item.tags.split(','),
          isAdult: item.nsfw === 1,
          creator: {
            id: item.world_list_detail_chrbot_key.toString(),
          },
        }));

        // setCharacters(characters);
      } else {
        setError(response?.result?.msg || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('API 오류:', err);
      setError('API 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetTagList = async() => {
    setLoading(true);
    setError(null);

    try {
      const response = await contentApi.GetTagList();
      console.log('태그 리스트 응답:', response);

      if (response?.result?.err === 0) {
        // 데이터가 있다면 표시
        alert('태그 리스트를 콘솔에서 확인하세요.');
      } else {
        setError(response?.result?.msg || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('API 오류:', err);
      setError('API 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  // if(!top10Data) {
  //   return <div>로딩중...</div>;
  // }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">스토리네이션 API 테스트</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={ handleTop10 }
          disabled={ loading }
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Top10 가져오기
        </button>
        <button
          onClick={ handleGetTagList }
          disabled={ loading }
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          태그 리스트 가져오기
        </button>
      </div>

      { loading && <div className="text-center my-4">로딩 중...</div> }

      { error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          { error }
        </div>
      ) }

      { characters && characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          { characters.map((item, index) => (
            <Card character={ item } index={ index }/>
          )) }
        </div>
      ) : characters && characters.length === 0 ? (
        <div className="text-center my-4">데이터가 없습니다.</div>
      ) : null }
    </div>
  );
}
