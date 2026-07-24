'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ListGridSectionView from '@/components/main/list-grid/ListGridSectionView';
import { bridgeCharacterDataToCharacter } from '@/lib/utils/storyNationUtil';
import { contentApi } from '@/services/api/storyNationApi';
import type { Character } from '@/store/useStoreData';
import { useSettingsStore } from '@/store/useStoreSettings';
import type { ModuleCharacter } from '@/types/api';

// /api/charbot/getlist — type=0(전체), nsfw=1(성인). order·chrbot_tag_keys는 탭별로 다름
// (1=인기, 2=생성순 / 태그 탭은 chrbot_tag_keys로 필터링)
const LIST_TYPE = '0';
const NSFW = 1;
// 남/여 탭(useCharacterGridStoreData.GetList paginate)과 동일
const PAGE_SIZE = 10;

interface CharbotListItemLike {
  world_list_detail_chrbot_key: number;
  title: string;
  intro: string;
  img_url: string;
  img_web_url?: string;
  lv: number;
  tags: string;
  chat_cnt: number;
  msg_cnt: number;
  like_cnt: number;
  create_dt: string;
  nick_nm: string;
  nsfw: number;
  likeability_max_lv: number;
  likeability_yn: number;
  multi_image_count: number;
}

function mapAndMerge(
  before: Character[],
  list: Array<CharbotListItemLike> | undefined
): Character[] {
  const moduleData = (list ?? []).map((item) => ({
    world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
    title: item.title,
    intro: item.intro,
    img_url: item.img_url,
    img_web_url: item.img_web_url || item.img_url,
    lv: item.lv,
    tags: item.tags,
    chat_cnt: item.chat_cnt,
    msg_cnt: item.msg_cnt,
    like_cnt: item.like_cnt,
    create_dt: item.create_dt,
    nick_nm: item.nick_nm,
    nsfw: item.nsfw,
    module_id: 0,
    sort: 0,
    likeability_max_lv: item.likeability_max_lv,
    likeability_yn: item.likeability_yn,
    multi_image_count: item.multi_image_count,
  })) as ModuleCharacter[];

  const mapped = bridgeCharacterDataToCharacter(moduleData);
  const uniqueMap = new Map(before.map((item) => [item.id, item]));
  for (const item of mapped) {
    uniqueMap.set(item.id, item);
  }
  return Array.from(uniqueMap.values());
}

export interface GetListGridSectionProps {
  /** GetList order — 1: 인기순, 2: 생성순 */
  order: 1 | 2;
  /** GetList chrbot_tag_keys — 태그 탭 필터링용(미전달 시 전체) */
  tagKeys?: string;
  title: string;
  description: string;
  emptyTitle: string;
}

// 컨테이너: GetList 페이지네이션. 최신/인기/태그 탭이 order·tagKeys·문구만 다르게 재사용.
export default function GetListGridSection({
  order,
  tagKeys = '',
  title,
  description,
  emptyTitle,
}: GetListGridSectionProps) {
  const { isAdultModeEnabled } = useSettingsStore();

  const requestIdRef = useRef(0);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setPage(1);

    contentApi
      .GetList(LIST_TYPE, tagKeys, NSFW, order, 1, PAGE_SIZE)
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const list = response?.data?.chrbotList;
        const merged = mapAndMerge([], list?.data);
        setCharacters(merged);
        const more = list != null ? list.current_page < list.last_page : merged.length >= PAGE_SIZE;
        setHasMore(more);
        setIsLoading(false);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setIsLoading(false);
      });
  }, [isAdultModeEnabled, order, tagKeys]);

  const handleLoadMore = useCallback(() => {
    const requestId = ++requestIdRef.current;
    const nextPage = page + 1;
    setIsLoading(true);

    contentApi
      .GetList(LIST_TYPE, tagKeys, NSFW, order, nextPage, PAGE_SIZE)
      .then((response) => {
        if (requestId !== requestIdRef.current) return;
        const list = response?.data?.chrbotList;
        const merged = mapAndMerge(characters, list?.data);
        const more =
          list != null ? list.current_page < list.last_page : merged.length > characters.length;
        setHasMore(more);
        setCharacters(merged);
        setPage(nextPage);
        setIsLoading(false);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setIsLoading(false);
      });
  }, [characters, page, order, tagKeys]);

  return (
    <ListGridSectionView
      characters={characters}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      title={title}
      description={description}
      emptyTitle={emptyTitle}
    />
  );
}
