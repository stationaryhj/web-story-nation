'use client';

import { ReqGetTags } from "@/services/hooks/DataListManager";

interface TagsProps {
  categoryType: string;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}

export default function Tags({ categoryType, selectedTag, setSelectedTag }: TagsProps) {
  const { data: tagRankingData, isLoading: isLoadingTags, error: errorTags } = ReqGetTags(Number(categoryType));

  if(isLoadingTags || errorTags) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-2 pb-2 px-2">
          {tagRankingData?.charbot_tag?.map((tag: { c_chrbot_tag_key: number; tag: string }) => (
            <button
              key={tag.c_chrbot_tag_key}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 ${
                selectedTag === tag.tag
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSelectedTag(tag.c_chrbot_tag_key.toString())}
            >
              {tag.tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}