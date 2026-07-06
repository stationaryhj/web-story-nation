'use client';

import Image from 'next/image';
import React from 'react';
import { getImageUri, uploadImages } from '@/lib/utils/storyNationUtil';

import { contentApi } from '@/services/api';
import { useCreateCharacterData } from '@/store/useCreateCharacterData';
import { useModalStore } from '@/store/useStoreModal';

const DEFAULT_DESCRIPTION = '캐릭터가 첫 메시지를 보냈을 때 자동으로 해금되는 이미지입니다.';
const DEFAULT_DESCRIPTION_ETC = '캐릭터가 레벨업을 했을 때 자동으로 해금되는 이미지입니다.';
const PLACEHOLDER = '공개 조건을 입력하세요.\n예시: {{char}}가 {{user}}에게 인사를 건낸다.';

interface ImageSlotProps {
  data: any;
}

export default function ImageSlot({ data }: ImageSlotProps) {
  const { openModal, closeModal } = useModalStore();
  const {
    isVaild,
    formData,
    deleteMultiImageData,
    changeMultiImageShow,
    changeMultiImageDefault,
    changeMultiImageRules,
    changeMultiImageImage,
  } = useCreateCharacterData();

  const _hash = data?.hash || '';
  const _isDeleteCondition = data?.isDeleteCondition || false;
  const _chrbot_multi_image_key = data.chrbot_multi_image_key;
  const _imageUrl = data.img_url;
  const _rules = data.rules;
  const _isDefault = data.default_yn === 1;
  const _imageKey = data.chrbot_multi_image_key.toString();
  const _index = data.idx;
  const _show_yn = data.show_yn;
  const _lv = data.lv;

  const DefaultDescription = _lv < 2 ? DEFAULT_DESCRIPTION : DEFAULT_DESCRIPTION_ETC;
  const isFinish = formData.finish_yn || 0;

  const handleDelete = () => {
    openModal('confirmAction', {
      title: '이미지를 삭제할까요?',
      description: '입력한 내용과 이미지가 모두 삭제되며 복구할 수 없어요',
      confirmText: '삭제',
      onConfirm: () => {
        deleteMultiImageData(_hash, _index, _lv, _chrbot_multi_image_key, _imageUrl);
        closeModal();
      },
    });
  };

  const handleChangeShow = () => {
    changeMultiImageShow(_index, _lv, _chrbot_multi_image_key, _imageUrl);
  };

  const handleChangeDefault = () => {
    changeMultiImageDefault(_index, _lv, _chrbot_multi_image_key, _imageUrl);
  };

  const handleChangeRules = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    changeMultiImageRules(_index, _lv, _chrbot_multi_image_key, _imageUrl, e.target.value);
  };

  const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 확인 (10MB 이하)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const contentType = file.type;

      if (!contentType.startsWith('image/')) {
        return;
      }

      const presignedResponse = await contentApi.GetPresignedUrl(
        file.name,
        `.${extension || 'jpg'}`,
        5
      );
      if (presignedResponse.data.result.err !== 0 || !presignedResponse.data.presignedUrl) {
        throw new Error('이미지 업로드를 위한 URL을 받아오지 못했습니다');
      }

      const presignedUrl = presignedResponse.data.presignedUrl;
      const s3FilePath = presignedResponse.data.path;

      await uploadImages(file, presignedUrl);
      changeMultiImageImage(_index, _lv, _chrbot_multi_image_key, _imageUrl, s3FilePath);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='flex gap-3 bg-surface-elevated'>
      {/* 이미지 영역 */}
      <div className='relative flex-shrink-0'>
        <input
          id={`imageUpload_${_imageKey + _index + _imageUrl}`}
          type='file'
          accept='image/*'
          onChange={(e) => {
            handleChangeImage(e);
            e.target.value = '';
          }}
          className='hidden'
        />

        <label
          htmlFor={`imageUpload_${_imageKey + _index + _imageUrl}`}
          className='block cursor-pointer'
        >
          <Image
            src={getImageUri(_imageUrl || '') || '/images/sft_icon_on.png'}
            alt='이미지'
            width={120}
            height={120}
            className='rounded-lg object-cover outline outline-1 outline-border-default transition-all duration-200 hover:outline-2 hover:outline-brand'
          />
        </label>

        {_isDefault && (
          <div className='absolute left-1 top-1 flex items-center justify-center'>
            <span className='rounded-full bg-brand px-2 py-1 text-xs text-text-inverse backdrop-blur-sm'>
              기본
            </span>
          </div>
        )}

        {/* show 버튼 */}
        {(!_isDefault || _lv > 1) && (
          <button
            onClick={() => handleChangeShow()}
            className='absolute right-1 top-1 flex items-center justify-center'
          >
            <span
              className={`rounded-full px-1 py-1 text-xs text-text-inverse ${_show_yn ? 'backdrop-blur-sm' : 'bg-brand'}`}
            >
              {_show_yn === 1 ? (
                <Image src='/images/icons/img_lock_on.png' alt='show' width={18} height={18} />
              ) : (
                <Image src='/images/icons/img_lock_off.png' alt='hide' width={18} height={18} />
              )}
            </span>
          </button>
        )}
      </div>

      {/* 설명 영역 */}
      <div className='flex flex-1 flex-col gap-2'>
        <div className='relative flex-1 flex-shrink-0'>
          <textarea
            className={`h-full w-full resize-none rounded-md border p-2 text-sm ${
              !_isDefault && isVaild && _rules.length === 0
                ? 'border-danger bg-danger/10'
                : 'border-border-default'
            }`}
            placeholder={_isDefault ? DefaultDescription : PLACEHOLDER}
            onChange={(e) => handleChangeRules(e)}
            value={_isDefault ? '' : _rules || ''}
            disabled={_isDefault}
            maxLength={100}
          />

          {!_isDefault && (
            <div className='absolute bottom-0 right-1 flex items-end justify-end'>
              {_rules.length}/100
            </div>
          )}
        </div>

        <div className='flex w-full items-center justify-between gap-2'>
          {/* 삭제 */}

          <div className='flex items-center justify-start'>
            {(_isDeleteCondition || isFinish === 0) && (
              <button className='rounded-full bg-danger px-2' onClick={() => handleDelete()}>
                <span className='p-1 text-xs text-text-inverse'>X</span>
              </button>
            )}
          </div>

          {/* 디폴트 변경 */}
          <div className='flex items-center justify-end'>
            {!_isDefault && (
              <button className='rounded-full bg-brand px-2' onClick={() => handleChangeDefault()}>
                <span className='p-1 text-xs text-text-inverse'>기본 이미지로 선택</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
