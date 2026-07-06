'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { uploadImages } from '@/lib/utils/storyNationUtil';
import { contentApi } from '@/services/api';
import type { MultiImageData, PriSignedUrlInfo } from '@/services/define';
import { useCreateCharacterData } from '@/store/useCreateCharacterData';
import { useModalStore } from '@/store/useStoreModal';

import ImageSlot from './image-slot';

const MAX_IMAGE_COUNT = 100;

interface PresignedUrlInfoCustom extends PriSignedUrlInfo {
  file: File;
  path: string;
}

interface AddImageSectionProps {
  selectedLevel: number;
}

export default function AddImageSection({ selectedLevel }: AddImageSectionProps) {
  const { formData, addMultiImageDatas } = useCreateCharacterData();
  const { openModal, closeModal } = useModalStore();
  const [level] = useState(selectedLevel);
  const [world_list_detail_chrbot_key] = useState(formData.world_list_detail_chrbot_key || 0);

  const imageDatas = formData.multi_images.filter((item: any) => item.lv === level);
  const sumImageCount = formData.multi_images?.length || 0;

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // ✅ 파일 개수 제한 체크
    const remainingSlots = MAX_IMAGE_COUNT - sumImageCount;
    if (files.length > remainingSlots) {
      openModal('confirmAction', {
        title: '확인',
        description: `이미지는 ${MAX_IMAGE_COUNT}장을 초과해 업로드할 수 없습니다.`,
        onConfirm: () => {
          closeModal();
        },
        confirmText: '확인',
        cancelText: '취소',
      });
      e.target.value = ''; // input 초기화
      return;
    }

    const presignedUrlInfo: PresignedUrlInfoCustom[] = [];
    const presignedUrlData: PriSignedUrlInfo[] = [];
    let index = imageDatas.length + 1;

    Array.from(files).map(async (file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const contentType = file.type;

      const fileName = `chatbot_multi_image_${world_list_detail_chrbot_key}_${level}.${extension}`;

      presignedUrlInfo.push({
        idx: index,
        file_name: fileName,
        file_type: contentType,
        file: file,
        path: '',
      });

      presignedUrlData.push({
        idx: index,
        file_name: fileName,
        file_type: contentType,
      });

      index++;
    });

    // 업로드
    const presignedResponse = await contentApi.GetPresignedUrlMulti(6, presignedUrlData);
    if (presignedResponse.data.result.err !== 0 || !presignedResponse.data.files) {
      throw new Error('이미지 업로드를 위한 URL을 받아오지 못했습니다');
    }

    const result_files = presignedResponse.data?.files;

    const uploadPromises = Array.from(result_files).map(async (_data) => {
      const { idx, path, presignedUrl } = _data;

      const findData = presignedUrlInfo.find((item) => item.idx === idx);
      if (!findData) return;

      await uploadImages(findData.file, presignedUrl);
      findData.path = path;
    });

    await Promise.all(uploadPromises);

    const newMultiImageDatas: MultiImageData[] = [];
    presignedUrlInfo.map((item) => {
      newMultiImageDatas.push({
        hash: uuidv4(),
        isDeleteCondition: true,

        idx: item.idx,
        chrbot_multi_image_key: 0,
        default_yn: 0,
        img_url: item.path,
        lv: level,
        rules: '',
        show_yn: 0,
        world_list_detail_chrbot_key: Number(world_list_detail_chrbot_key),
      });
    });

    const isDefaultImg = imageDatas.find((item) => item.default_yn === 1);

    if (!isDefaultImg) {
      newMultiImageDatas[0].default_yn = 1;

      if (level === 0 || level === 1) {
        newMultiImageDatas[0].show_yn = 1;
      }
    }

    addMultiImageDatas(newMultiImageDatas);
    e.target.value = '';
  };

  return (
    <div>
      {level > 0 && (
        <div className='w-full flex items-center justify-center px-2 py-1 rounded mb-2 border border-border-default'>
          <span className='font-semibold'>{`Lv.${level}`}</span>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'>
        {imageDatas.map((item, index) => (
          <div
            key={`${item?.hash || ''}_${item.lv}_${item.idx}_${item.chrbot_multi_image_key}_${index}_${item.img_url}`}
          >
            <ImageSlot data={item} />
          </div>
        ))}
      </div>

      {sumImageCount < MAX_IMAGE_COUNT && (
        <div className='w-full flex justify-center'>
          <input
            id={`imageUpload_${level}`}
            multiple
            type='file'
            accept='image/*'
            onChange={(e) => handleImageUpload(e)}
            className='hidden' // input 숨김
            disabled={sumImageCount >= MAX_IMAGE_COUNT}
          />

          <label
            htmlFor={`imageUpload_${level}`}
            className={`px-4 py-2 rounded-md w-full transition-colors duration-200 flex items-center justify-center ${
              sumImageCount >= MAX_IMAGE_COUNT
                ? 'bg-surface-elevated cursor-not-allowed text-text-muted'
                : 'bg-brand hover:bg-brand-hover text-text-inverse cursor-pointer'
            }`}
          >
            <span className='flex items-center justify-center gap-2'>
              이미지 업로드
              <div className='text-xs text-text-muted'>
                {sumImageCount}/{MAX_IMAGE_COUNT}
              </div>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
