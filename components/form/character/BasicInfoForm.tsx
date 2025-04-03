'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { faCheck, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ChangeEvent } from 'react'

import { RequiredLabel } from '../CharacterForm'
import { useAccountStore } from '@/store/useAccountStore'
import { useModalStore } from '@/store/useStoreModal'
import { Tag } from '@/store/useCreateCharacterData'
import ConfirmActionModal from '../../modal/ConfirmActionModal'
import { toast } from 'react-toastify'

interface BasicInfoFormProps {
  formData: any;
  setFormField: (name: string, value: any) => void;
  addHashtag: (tag: string) => Promise<boolean>;
  removeHashtag: (tag: string) => Promise<boolean>;
  addCustomTag: (tag: string) => Promise<boolean>;
  fetchTagList: () => Promise<void>;
  saveHashtags: () => Promise<boolean>;
  availableTags: Tag[];
  isLoadingTags: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export default function BasicInfoForm({
  formData,
  setFormField,
  addHashtag,
  removeHashtag,
  addCustomTag,
  fetchTagList,
  saveHashtags,
  availableTags,
  isLoadingTags,
  onValidationChange
}: BasicInfoFormProps) {
  const [visibleWarnigModal, setVisibleWarnigModal] = useState(false)
  const [customTagInput, setCustomTagInput] = useState('')
  const { isAdult } = useAccountStore()
  const isAdultModeEnabled = isAdult()

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
      )
      onValidationChange(isValid)
    }
  }, [formData, onValidationChange])

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // 글자 수 제한 검사
    if (name === 'name' && value.length > 25) return
    if ((name === 'bio' || name === 'firstMessage') && value.length > 80) return

    setFormField(name as any, value)
  }

  // 성별 선택 핸들러
  const handleGenderSelect = (gender: 'male' | 'female' | 'unspecified') => {
    setFormField('gender', gender)
  }

  // 게시 범위 선택 핸들러
  const handleVisibilitySelect = (visibility: 'public' | 'private') => {
    setFormField('visibility', visibility)
    if (visibility === 'public') {
      setVisibleWarnigModal(true)
    }
  }

  // 이용등급 선택 핸들러
  const handleRatingSelect = (rating: 'all' | 'adult') => {
    if (rating === 'adult' && !isAdultModeEnabled) {
      setVisibleWarnigModal(true)
      return
    }
    setFormField('rating', rating)
  }

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
          toast.error('최대 7개의 태그만 선택할 수 있습니다.')
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
  }

  // 사용자 정의 태그 추가 핸들러
  const handleAddCustomTag = async () => {
    if (customTagInput.trim()) {
      const success = await addCustomTag(customTagInput.trim())
      if (success) {
        setCustomTagInput('') // 성공 시 입력 필드 초기화
      }
    } else {
      toast.error('태그를 입력해주세요')
    }
  }

  // 커스텀 태그 입력 핸들러
  const handleCustomTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomTagInput(e.target.value)
  }

  // Enter 키 핸들러
  const handleCustomTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomTag()
    }
  }

  return (
    <>
      <ConfirmActionModal
        isOpen={visibleWarnigModal}
        onClose={() => setVisibleWarnigModal(false)}
        title="캐릭터 공개 시 주의사항"
        description="한 번 공개한 캐릭터는 비공개로 전환할 수 없어요!"
        confirmText="확인했어요"
        cancelText="돌아갈래요"
        onConfirm={() => {
          setVisibleWarnigModal(false)
          setFormField('visibility', 'public')
        }}
        onCancel={() => {
          setVisibleWarnigModal(false)
          setFormField('visibility', 'private')
        }}
      />
      <div className="space-y-8">
        {/* 기본 설정 */}
        <div className="space-y-6">
          {/* 이용등급 */}
          <div>
            <RequiredLabel>
              <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                이용등급
              </label>
            </RequiredLabel>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRatingSelect('all')}
                className={`rounded-lg px-4 py-3 text-center transition-colors ${
                  formData.rating === 'all'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                전체 이용가
              </button>
              <button
                type="button"
                onClick={() => handleRatingSelect('adult')}
                disabled={!isAdultModeEnabled}
                className={`rounded-lg px-4 py-3 text-center transition-colors ${
                  formData.rating === 'adult'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                } ${!isAdultModeEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                성인 전용
              </button>
            </div>
            {!isAdultModeEnabled && formData.rating === 'adult' && (
              <p className="mt-2 text-sm text-red-500">성인 인증이 필요합니다.</p>
            )}
          </div>
          {/* 이름 */}
          <div>
            <RequiredLabel>
              <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                캐릭터 이름
              </label>
            </RequiredLabel>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="캐릭터의 이름을 입력하세요"
              className="mt-1 block w-full rounded-lg border border-secondary-200 px-4 py-3 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-secondary-200/10 dark:bg-dark-background-light dark:text-dark-secondary-200 dark:placeholder-dark-secondary-500"
              maxLength={25}
            />
          </div>

          {/* 성별 */}
          <div>
            <RequiredLabel>
              <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                성별
              </label>
            </RequiredLabel>
            <div className="mt-2 grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleGenderSelect('male')}
                className={`rounded-lg px-4 py-3 text-center transition-colors ${
                  formData.gender === 'male'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => handleGenderSelect('female')}
                className={`rounded-lg px-4 py-3 text-center transition-colors ${
                  formData.gender === 'female'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                여성
              </button>
              <button
                type="button"
                onClick={() => handleGenderSelect('unspecified')}
                className={`rounded-lg px-4 py-3 text-center transition-colors ${
                  formData.gender === 'unspecified'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                미정
              </button>
            </div>
          </div>

          {/* 게시 범위 */}
          <div>
            <RequiredLabel>
              <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                게시 범위
              </label>
            </RequiredLabel>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleVisibilitySelect('private')}
                className={`rounded-lg px-4 py-3 text-center transition-colors ${
                  formData.visibility === 'private'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                비공개
              </button>
              <button
                type="button"
                onClick={() => handleVisibilitySelect('public')}
                className={`rounded-lg px-4 py-3 text-center transition-colors ${
                  formData.visibility === 'public'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                공개
              </button>
            </div>
          </div>

          {/* 한줄 소개 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <RequiredLabel>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400"
                >
                  한줄 소개
                </label>
              </RequiredLabel>
              <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                {formData.bio.length}/80
              </span>
            </div>
            <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2">
              내 캐릭터를 간단히 소개해 보세요!
            </p>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="예시)까칠한 뱀파이어"
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
              maxLength={80}
            />
          </div>

          {/* 첫 메시지 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <RequiredLabel>
                <label
                  htmlFor="firstMessage"
                  className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400"
                >
                  첫 메세지
                </label>
              </RequiredLabel>

              <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                {formData.firstMessage.length}/80
              </span>
            </div>
            <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2">
              재미있는 선톡으로 유저의 답장을 이끌어내 보세요!
            </p>
            <textarea
              id="firstMessage"
              name="firstMessage"
              value={formData.firstMessage}
              onChange={handleInputChange}
              placeholder="캐릭터가 보내는 첫 메세지를 입력하세요"
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
              maxLength={80}
            />
          </div>

          {/* 캐릭터 태그 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <RequiredLabel>
                <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                  캐릭터 태그
                </label>
              </RequiredLabel>
              <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                {formData.hashtags.length}/7
              </span>
            </div>
            <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2">
              내 캐릭터를 태그로 설명한다면? (최대7개)
            </p>
            <div className="relative w-full">
              <div className="flex flex-wrap gap-1.5 items-center w-full px-3 py-2 min-h-[52px] rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light">
                {formData.hashtags.length > 0 ? (
                  formData.hashtags.map((tag: string) => (
                    <div
                      key={tag}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-primary-100 text-primary-700 dark:bg-dark-primary-900/20 dark:text-dark-primary-400"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        className="ml-1.5 text-primary-500 hover:text-primary-700 dark:text-dark-primary-400 dark:hover:text-dark-primary-300"
                        onClick={() => handleHashtagToggle(tag)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-secondary-400 dark:text-dark-secondary-600">
                    캐릭터의 특징을 나타내는 태그를 선택하세요!
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {isLoadingTags ? (
                <div className="w-full py-4 text-center text-secondary-500 dark:text-dark-secondary-400">
                  태그 목록을 불러오는 중...
                </div>
              ) : allAvailableTags.length > 0 ? (
                allAvailableTags.map(tagItem => (
                  <button
                    key={tagItem.c_chrbot_tag_key}
                    type="button"
                    onClick={() => handleHashtagToggle(tagItem.tag)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      formData.hashtags.includes(tagItem.tag)
                        ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                        : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                    }`}
                  >
                    {tagItem.tag}
                    {formData.hashtags.includes(tagItem.tag) && <FontAwesomeIcon icon={faCheck} className="ml-1" />}
                  </button>
                ))
              ) : (
                <div className="w-full py-4 text-center text-secondary-500 dark:text-dark-secondary-400">
                  사용 가능한 태그가 없습니다.
                </div>
              )}
            </div>

            {/* 사용자 정의 태그 입력 */}
            <div className="mt-3 flex border-t border-secondary-200 dark:border-dark-secondary-200/10 pt-3">
              <input
                type="text"
                value={customTagInput}
                onChange={handleCustomTagInputChange}
                onKeyPress={handleCustomTagKeyPress}
                placeholder="직접 태그 입력"
                className="flex-1 px-4 py-2 rounded-l-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400"
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={formData.hashtags.length >= 7}
                className={`px-4 py-2 rounded-r-lg bg-primary-500 text-white dark:bg-dark-primary-500 flex items-center justify-center ${
                  formData.hashtags.length >= 7 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-600 dark:hover:bg-dark-primary-600'
                }`}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" />
                추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 