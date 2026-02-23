'use client';

import { faCheck, faPlus, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import type { ChangeEvent } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getImageUri, uploadImages } from '@/lib/utils/storyNationUtil';
import { contentApi } from '@/services/api';
import { useAccountStore } from '@/store/useAccountStore';
import { Tag, useCreateCharacterData } from '@/store/useCreateCharacterData';
import { useModalStore } from '@/store/useStoreModal';
import { FormInput, FormTextarea } from '@/shared/ui/form';
import ConfirmActionModal from '../../modal/ConfirmActionModal';
import { RequiredLabel } from '../CharacterForm';

const MAX_FIRST_MESSAGE_LENGTH = 700;

interface BasicInfoFormProps {
  availableTags: Tag[];
  isLoadingTags: boolean;
  invalidFields?: { [key: string]: boolean };
  privateOpenCharacterCount?: number;
  onValidationChange?: (isValid: boolean) => void;
}

export default function BasicInfoForm({
  availableTags,
  isLoadingTags,
  invalidFields = {},
  privateOpenCharacterCount = 0,
  onValidationChange,
}: BasicInfoFormProps) {
  const { isVaild, formData, setFormField, addHashtag, removeHashtag, saveHashtags, fetchTagList } =
    useCreateCharacterData();
  const { isAdult } = useAccountStore();
  const { openModal } = useModalStore();

  const [visibleWarnigModal, setVisibleWarnigModal] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  // 태그 데이터 로드
  useEffect(() => {
    fetchTagList();
  }, [fetchTagList]);

  // 그룹별로 태그 정리하기
  const allAvailableTags = useMemo(() => {
    // 모든 그룹의 태그를 하나의 배열로 합치기
    const allTags = [...availableTags];

    // 정렬 (그룹 순서로 정렬, 같은 그룹 내에서는 sort 값으로 정렬)
    allTags.sort((a, b) => {
      if (a.group !== b.group) {
        return a.group - b.group;
      }
      return a.sort - b.sort;
    });

    return allTags;
  }, [availableTags]);

  // 유효성 검사
  useEffect(() => {
    if (onValidationChange) {
      // 기본 정보 탭은 필수 입력 항목이 많음
      const isValid = !!(
        formData.name?.trim() &&
        formData.bio?.trim() &&
        formData.firstMessage?.trim()
      );
      onValidationChange(isValid);
    }
  }, [formData, onValidationChange]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // 글자 수 제한 검사
    if (name === 'name' && value.length > 25) return;
    if (name === 'subject' && value.length > 25) return;
    if (name === 'bio' && value.length > 80) return;
    if (name === 'firstMessage' && value.length > MAX_FIRST_MESSAGE_LENGTH) return;

    setFormField(name as any, value);
  };

  // 성별 선택 핸들러
  const handleGenderSelect = (gender: 'male' | 'female' | 'unspecified') => {
    setFormField('gender', gender);
  };

  // 게시 범위 선택 핸들러
  const handleVisibilitySelect = (visibility: 'public' | 'private') => {
    // 이미 공개된 캐릭터라면 비공개로 변경 불가능
    if (formData.isVisibilityLock) {
      toast.error('공개된 캐릭터는 비공개로 전환할 수 없어요!');
      return;
    }

    if (visibility === 'private' && privateOpenCharacterCount >= 3) {
      console.log('더이상 만들지 못함!!!!!! ');
      return;
    }

    setFormField('visibility', visibility);
  };

  // 해시태그 토글 핸들러
  const handleHashtagToggle = async (tag: string) => {
    try {
      if (formData.hashtags.includes(tag)) {
        // 태그 제거
        await removeHashtag(tag);
      } else {
        // 태그 추가 (최대 7개 제한)
        if (formData.hashtags.length < 7) {
          await addHashtag(tag);
        } else {
          toast.error('최대 7개의 태그만 선택할 수 있습니다.');
          return;
        }
      }

      // 태그 변경 후 API 호출하여 저장
      if (formData.world_list_detail_chrbot_key) {
        await saveHashtags();
      }
    } catch (error) {
      console.error('태그 처리 중 오류:', error);
    }
  };

  // 사용자 정의 태그 추가 핸들러
  const handleAddCustomTag = async () => {
    if (customTagInput.trim()) {
      const success = await addHashtag(customTagInput.trim());
      if (success) {
        setCustomTagInput(''); // 성공 시 입력 필드 초기화
      }
    } else {
      toast.error('태그를 입력해주세요');
    }
  };

  // 커스텀 태그 입력 핸들러
  const handleCustomTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomTagInput(e.target.value);
  };

  // Enter 키 핸들러
  const handleCustomTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 확인 (10MB 이하)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB 이하여야 합니다');
      return;
    }

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const contentType = file.type;

      if (!contentType.startsWith('image/')) {
        toast.error('이미지 파일만 업로드할 수 있습니다');
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
      console.log('완료');

      setFormField('imgUrl', s3FilePath);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log('@@@@ isVaild :: ', isVaild);
  }, [isVaild]);

  return (
    <>
      <ConfirmActionModal
        isOpen={visibleWarnigModal}
        onClose={() => setVisibleWarnigModal(false)}
        title='캐릭터 공개 시 주의사항'
        description='한 번 공개한 캐릭터는 비공개로 전환할 수 없어요!'
        confirmText='확인했어요'
        cancelText='돌아갈래요'
        onConfirm={() => {
          setVisibleWarnigModal(false);
          setFormField('visibility', 'public');
        }}
        onCancel={() => {
          setVisibleWarnigModal(false);
          setFormField('visibility', 'private');
        }}
      />
      <div className='space-y-8'>
        {/* 기본 설정 */}
        <div className='space-y-6'>
          {/* 기본이미지 */}
          <div className='flex flex-col justify-center w-full'>
            <RequiredLabel>
              <label className='block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400'>
                기본 이미지
              </label>
            </RequiredLabel>

            <div
              className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-primary-500 dark:border-dark-primary-500 w-full md:max-w-[300px] mx-auto ${
                isVaild && !formData.imgUrl
                  ? 'border-red-500 bg-red-50 dark:border-red-500/70 dark:bg-red-950/20'
                  : ''
              }`}
            >
              {/* 이미지 표시 */}
              {formData.imgUrl ? (
                <label className='cursor-pointer block'>
                  <Image
                    src={getImageUri(formData.imgUrl)}
                    alt='캐릭터 일반 이미지'
                    fill
                    className='object-cover'
                  />

                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleImageUpload(e)}
                    className='hidden'
                  />
                </label>
              ) : (
                <label
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden w-full md:max-w-[300px] mx-auto
                    ${
                      'border-red-500 bg-red-50 dark:border-red-500/70 dark:bg-red-950/20'
                      // isVaild ?
                      // 'border-red-500 bg-red-50 dark:border-red-500/70 dark:bg-red-950/20' :
                      // 'border-secondary-300 dark:border-dark-secondary-300/20'
                    }
                  cursor-pointer`}
                >
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleImageUpload(e)}
                    className='hidden'
                  />
                  <div className='h-full flex flex-col items-center justify-center text-secondary-500 dark:text-dark-secondary-500 p-2 text-center'>
                    <FontAwesomeIcon
                      icon={faUpload}
                      className='w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2'
                    />
                    <span className='text-xs sm:text-sm'>
                      {formData.imgUrl ? '이미지 교체' : '이미지 업로드'}
                    </span>
                  </div>
                </label>
              )}
            </div>

            <div className='flex justify-center items-center'>
              <span className='text-xs text-secondary-500 dark:text-dark-secondary-500 mt-2'>
                *초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.
              </span>
            </div>
          </div>

          {/* 이름 */}
          <FormInput
            label='캐릭터 이름'
            required
            name='name'
            value={formData.name}
            onChange={handleInputChange}
            placeholder='캐릭터의 이름을 입력하세요'
            maxLength={25}
            hasError={isVaild && !formData.name}
          />

          {/* 제목 */}
          <FormInput
            label='제목(선택)'
            description='캐릭터 목록에서 이름 대신 출력되는 제목이에요!'
            name='subject'
            value={formData.subject}
            onChange={handleInputChange}
            placeholder='제목을 입력하세요. 예) 영화관 데이트'
            maxLength={25}
          />

          {/* 성별 */}
          <div>
            <RequiredLabel>
              <label className='block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400'>
                성별
              </label>
            </RequiredLabel>
            <div className='mt-2 grid grid-cols-3 gap-4'>
              <button
                type='button'
                onClick={() => handleGenderSelect('male')}
                className={`rounded-lg px-4 py-3 text-center transition-colors text-xs sm:text-base ${
                  formData.gender === 'male'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                남성
              </button>
              <button
                type='button'
                onClick={() => handleGenderSelect('female')}
                className={`rounded-lg px-4 py-3 text-center transition-colors text-xs sm:text-base ${
                  formData.gender === 'female'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                여성
              </button>
              <button
                type='button'
                onClick={() => handleGenderSelect('unspecified')}
                className={`rounded-lg px-4 py-3 text-center transition-colors text-xs sm:text-base ${
                  formData.gender === 'unspecified'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                알 수 없음
              </button>
            </div>
          </div>

          {/* 게시 범위 */}
          <div>
            <div className='flex flex-col gap-2'>
              <div>
                <RequiredLabel>
                  <label className='block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400'>
                    게시 범위
                  </label>
                </RequiredLabel>
              </div>
              <div>
                <p className='text-md dark:text-dark-secondary-500 mb-2'>
                  생성 가능한 비공개 캐릭터 {3 - privateOpenCharacterCount} / 3
                </p>
              </div>
            </div>
            <div className='mt-2 grid grid-cols-2 gap-4'>
              <button
                type='button'
                onClick={() => handleVisibilitySelect('private')}
                className={`rounded-lg px-4 py-3 text-center transition-colors text-xs sm:text-base ${
                  formData.visibility === 'private'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                비공개
              </button>
              <button
                type='button'
                onClick={() => handleVisibilitySelect('public')}
                className={`rounded-lg px-4 py-3 text-center transition-colors text-xs sm:text-base ${
                  formData.visibility === 'public'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                공개
              </button>
            </div>

            {/* 게시 범위 설명 */}
            <div className='mt-4 rounded-lg bg-secondary-50 p-4 dark:bg-dark-secondary-800/10'>
              <h4 className='text-md font-bold text-secondary-800 dark:text-dark-secondary-200 mb-2 '>
                게시 범위에 따라 무엇이 달라지나요?
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h5 className='text-sm font-medium text-primary-600 dark:text-primary-400 mb-1'>
                    공개
                  </h5>
                  <ul className='text-xs space-y-1 text-secondary-600 dark:text-dark-secondary-400'>
                    <li className='flex items-start'>
                      <span className='text-primary-500 mr-1 mt-0.5'>•</span>
                      <span>모든 유저가 캐릭터와 대화할 수 있어요.</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-red-500 mr-1 mt-0.5'>•</span>
                      <span>생성한 공개 캐릭터는 비공개로 바꿀 수 없어요.</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className='text-sm font-medium text-primary-600 dark:text-primary-400 mb-1'>
                    비공개
                  </h5>
                  <ul className='text-xs space-y-1 text-secondary-600 dark:text-dark-secondary-400'>
                    <li className='flex items-start'>
                      <span className='text-primary-500 mr-1 mt-0.5'>•</span>
                      <span>나만 캐릭터와 대화할 수 있어요.</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-primary-500 mr-1 mt-0.5'>•</span>
                      <span>캐릭터가 검색되지 않아요.</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='text-primary-500 mr-1 mt-0.5'>•</span>
                      <span>최대 3개만 보유할 수 있어요.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 한줄 소개 */}
          <FormTextarea
            label='한줄 소개'
            required
            description='내 캐릭터를 간단히 소개해 보세요!'
            name='bio'
            value={formData.bio}
            onChange={handleInputChange}
            placeholder='예시)까칠한 뱀파이어'
            rows={12}
            maxLength={80}
            hasError={isVaild && !formData.bio}
          />

          {/* 첫 메시지 */}
          <FormTextarea
            label='첫 메세지'
            required
            description='재미있는 선톡으로 유저의 답장을 이끌어내 보세요!'
            name='firstMessage'
            value={formData.firstMessage}
            onChange={handleInputChange}
            placeholder='캐릭터가 보내는 첫 메세지를 입력하세요'
            rows={12}
            maxLength={MAX_FIRST_MESSAGE_LENGTH}
            hasError={isVaild && !formData.firstMessage}
          />

          {/* 캐릭터 태그 */}
          <div>
            <div className='flex justify-between items-center mb-2'>
              <RequiredLabel>
                <label className='block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400'>
                  캐릭터 태그
                </label>
              </RequiredLabel>
              <span className='text-xs text-secondary-500 dark:text-dark-secondary-500'>
                {formData.hashtags.length}/7
              </span>
            </div>
            <p className='text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2'>
              내 캐릭터를 태그로 설명한다면? (최대7개)
            </p>
            <div className='relative w-full'>
              <div
                className={`flex flex-wrap gap-1.5 items-center w-full px-3 py-2 min-h-[52px] rounded-lg border ${
                  isVaild && formData.hashtags.length === 0
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
                    : 'border-secondary-200 focus-within:border-primary-500 focus-within:ring-primary-500'
                } dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light`}
              >
                {formData.hashtags.length > 0 ? (
                  formData.hashtags.map((tag: string) => (
                    <div
                      key={tag}
                      className='inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-primary-100 text-primary-700 dark:bg-dark-primary-900/20 dark:text-dark-primary-400'
                    >
                      <span>{tag}</span>
                      <button
                        type='button'
                        className='ml-1.5 text-primary-500 hover:text-primary-700 dark:text-dark-primary-400 dark:hover:text-dark-primary-300'
                        onClick={() => handleHashtagToggle(tag)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className='text-secondary-400 dark:text-dark-secondary-600'>
                    캐릭터의 특징을 나타내는 태그를 선택하세요!
                  </span>
                )}
              </div>
            </div>

            <div className='flex flex-wrap gap-2 mt-3'>
              {isLoadingTags ? (
                <div className='w-full py-4 text-center text-secondary-500 dark:text-dark-secondary-400'>
                  태그 목록을 불러오는 중...
                </div>
              ) : allAvailableTags.length > 0 ? (
                allAvailableTags.map((tagItem) => (
                  <button
                    key={tagItem.c_chrbot_tag_key}
                    type='button'
                    onClick={() => handleHashtagToggle(tagItem.tag)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      formData.hashtags.includes(tagItem.tag)
                        ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                        : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                    }`}
                  >
                    {tagItem.tag}
                    {formData.hashtags.includes(tagItem.tag) && (
                      <FontAwesomeIcon icon={faCheck} className='ml-1' />
                    )}
                  </button>
                ))
              ) : (
                <div className='w-full py-4 text-center text-secondary-500 dark:text-dark-secondary-400'>
                  사용 가능한 태그가 없습니다.
                </div>
              )}
            </div>

            {/* 사용자 정의 태그 입력 */}
            <div className='mt-3 flex border-t border-secondary-200 dark:border-dark-secondary-200/10 pt-3 text-xs sm:text-base'>
              <input
                type='text'
                value={customTagInput}
                onChange={handleCustomTagInputChange}
                onKeyPress={handleCustomTagKeyPress}
                placeholder='직접 태그 입력'
                className='flex-1 px-4 py-2 rounded-l-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400'
                maxLength={20}
              />
              <button
                type='button'
                onClick={handleAddCustomTag}
                disabled={formData.hashtags.length >= 7}
                className={`px-4 py-2 rounded-r-lg bg-primary-500 text-white dark:bg-dark-primary-500 flex items-center justify-center ${
                  formData.hashtags.length >= 7
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-primary-600 dark:hover:bg-dark-primary-600'
                }`}
              >
                <FontAwesomeIcon icon={faPlus} className='mr-1' />
                추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
