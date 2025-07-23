'use client'

import React from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getImageUri, uploadImages } from '@/lib/utils/storyNationUtil'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import { contentApi } from '@/services/api'
import { useCreateCharacterData } from '@/store/useCreateCharacterData'

const DEFAULT_DESCRIPTION = '캐릭터가 레벨업을 했을 때 자동으로 해금되는 이미지입니다.'
const PLACEHOLDER = '공개 조건을 입력하세요.\n예시: {{char}}가 {{user}}에게 인사를 건낸다.'


interface ImageSlotProps {
	data: any
}

export default function ImageSlot({ 
	data,
}: ImageSlotProps) {
	const { deleteMultiImageData, changeMultiImageShow, changeMultiImageDefault, changeMultiImageRules, changeMultiImageImage } = useCreateCharacterData()

	const _chrbot_multi_image_key = data.chrbot_multi_image_key
	const _imageUrl = data.img_url
	const _rules = data.rules
	const _isDefault = data.default_yn === 1
	const _imageKey = data.chrbot_multi_image_key.toString()
	const _index = data.idx
	const _show_yn = data.show_yn
	const _lv = data.lv

	const handleDelete = () => {
		deleteMultiImageData(_index, _lv, _chrbot_multi_image_key, _imageUrl)
	}

	const handleChangeShow = () => {
		changeMultiImageShow(_index, _lv, _chrbot_multi_image_key, _imageUrl)
	}


	const handleChangeDefault = () => {
		changeMultiImageDefault(_index, _lv, _chrbot_multi_image_key, _imageUrl)
	}

	const handleChangeRules = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		changeMultiImageRules(_index, _lv, _chrbot_multi_image_key, _imageUrl, e.target.value)
	}

	const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 확인 (10MB 이하)
    if (file.size > 10 * 1024 * 1024) {
      return
    }

    try {
      const extension = file.name.split('.').pop()?.toLowerCase()
      const contentType = file.type

      if (!contentType.startsWith('image/')) {
        return
      }

      const presignedResponse = await contentApi.GetPresignedUrl(file.name, `.${extension || 'jpg'}`, 5)
      if (presignedResponse.data.result.err !== 0 || !presignedResponse.data.presignedUrl) {
        throw new Error('이미지 업로드를 위한 URL을 받아오지 못했습니다')
      }

      const presignedUrl = presignedResponse.data.presignedUrl
      const s3FilePath = presignedResponse.data.path


      await uploadImages(file, presignedUrl)
      changeMultiImageImage(_index, _lv, _chrbot_multi_image_key, _imageUrl, s3FilePath)
    }
    catch(error) {
      console.error(error)
    }
	}
	
	return (
		<div
			className='flex gap-3 bg-white dark:bg-dark-secondary-800 dark:border-dark-secondary-600'
		>
			{/* 이미지 영역 */}
			<div className='flex-shrink-0 relative'>
			<input
				id={`imageUpload_${_imageKey + _index + _imageUrl}`}
				type="file"
				accept="image/*"
				onChange={e => {
					handleChangeImage(e)
					e.target.value = ''
				}}
				className="hidden"
			/>

			<label 
				htmlFor={`imageUpload_${_imageKey + _index + _imageUrl}`}
				className="cursor-pointer block"
			>
				<Image
					src={getImageUri(_imageUrl || '') || '/images/sft_icon_on.png'} 
					alt='이미지' 
					width={120} 
					height={120} 
					className='rounded-lg object-cover outline outline-1 outline-secondary-200 p-2 hover:outline-2 hover:outline-primary-500 transition-all duration-200'
				/>
			</label>

				{_isDefault &&
					<div className="absolute top-1 left-1 flex items-center justify-center">
						<span className='bg-primary-500 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm'>
							기본
						</span>
					</div>
				}

				{/* show 버튼 */}
				{!_isDefault &&
					<button
						onClick={() => handleChangeShow()}
						className="absolute top-1 right-1 flex items-center justify-center">
						<span className='text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm'>
							{_show_yn === 1 ? (
								<FontAwesomeIcon icon={faEye} />
							) : (
								<FontAwesomeIcon icon={faEyeSlash} />
							)}
						</span>
					</button>
				}
			</div>

			{/* 설명 영역 */}
			<div className='flex-1 flex flex-col gap-2'>
				<div className='flex-1 flex-shrink-0 relative'>
					<textarea 
						className='w-full h-full p-2 border border-secondary-200 rounded-md resize-none text-sm'
						placeholder={_isDefault ? DEFAULT_DESCRIPTION : PLACEHOLDER}
						onChange={e => handleChangeRules(e)}
						value={_isDefault ? '' : _rules || ''}
						disabled={_isDefault}
					/>
					
					{!_isDefault &&
						<div className='absolute bottom-0 right-1 flex items-end justify-end'>
							{_rules.length}/1000
						</div>
					}
				</div>

				<div className='flex items-center justify-between gap-2'>
					{/* 삭제 */}
					{_chrbot_multi_image_key === 0 &&
						<button className='px-2 bg-primary-500 rounded-full' onClick={() => handleDelete()}>
							<span className='text-xs text-white p-1'>X</span>
						</button>
					}

					{/* 디폴트 변경 */}
					{!_isDefault &&
						<button className='px-2 bg-primary-500 rounded-full' onClick={() => handleChangeDefault()}>
							<span className='text-xs text-white p-1'>기본 이미지로 선택</span>
						</button>
					}
				</div>
			</div>
		</div>
	)
}
