'use client'

import { ChangeEvent, useState } from 'react'
import type { PriSignedUrlInfo, MultiImageData } from '@/services/define'
import { useCreateCharacterData } from '@/store/useCreateCharacterData'
import { contentApi } from '@/services/api'
import { uploadImages } from '@/lib/utils/storyNationUtil'

import ImageSlot from './image-slot'

const MAX_IMAGE_COUNT = 100

interface PresignedUrlInfoCustom extends PriSignedUrlInfo {
	file: File
	path: string
}

interface AddImageSectionProps {
	selectedLevel: number
}

export default function AddImageSection({ selectedLevel }: AddImageSectionProps) {
	const { formData, addMultiImageDatas } = useCreateCharacterData()
	const [level] = useState(selectedLevel)
	const [world_list_detail_chrbot_key] = useState(formData.world_list_detail_chrbot_key || 0)

	const imageDatas = formData.multi_images.filter((item: any) => item.lv === level)
	const sumImageCount = formData.multi_images?.length || 0

	const handleImageUpload = async ( e: ChangeEvent<HTMLInputElement> ) => {
		const files = e.target.files
		if(!files) return

		let presignedUrlInfo: PresignedUrlInfoCustom[] = []
		let presignedUrlData: PriSignedUrlInfo[] = []
		let index = imageDatas.length + 1
		Array.from(files).map(async (file) => {
			const extension = file.name.split('.').pop()?.toLowerCase()
			const contentType = file.type

			const fileName = `chatbot_multi_image_${world_list_detail_chrbot_key}_${level}.${extension}`

			presignedUrlInfo.push({
				idx: index,
				file_name: fileName,
				file_type: contentType,
				file: file,
				path: ''
			})

			presignedUrlData.push({
				idx: index,
				file_name: fileName,
				file_type: contentType,
			})

			index++
		})


		// 업로드
		const presignedResponse = await contentApi.GetPresignedUrlMulti(6, presignedUrlData)
		if (presignedResponse.data.result.err !== 0 || !presignedResponse.data.files) {
			throw new Error('이미지 업로드를 위한 URL을 받아오지 못했습니다')
		}

		const result_files = presignedResponse.data?.files

		// ✅ 모든 업로드 작업을 Promise 배열로 생성
		const uploadPromises = Array.from(result_files).map(async (_data) => {
			const {idx, path, presignedUrl} = _data

			const findData = presignedUrlInfo.find((item) => item.idx === idx)
			if(!findData) return

			await uploadImages(findData.file, presignedUrl)
			findData.path = path
		})

		// ✅ 모든 업로드가 완료될 때까지 기다림
		await Promise.all(uploadPromises)
		
		// ✅ 모든 업로드 완료 후 presignedUrlInfo 확인
		console.log('presignedUrlInfo :: ', presignedUrlInfo)


		const newMultiImageDatas: MultiImageData[] = []
		presignedUrlInfo.map((item) => {
			newMultiImageDatas.push({
				idx: item.idx,
				chrbot_multi_image_key: 0,
				default_yn: 0,
				img_url: item.path,
				lv: level,
				rules: '',
				show_yn: 0,
				world_list_detail_chrbot_key: Number(world_list_detail_chrbot_key),
			})
		})

		if(level < 2) {
			const isDefaultImg = imageDatas.find(item => item.default_yn === 1)
			if(!isDefaultImg) {
				newMultiImageDatas[0].default_yn = 1
			}	
		}
		
		addMultiImageDatas(newMultiImageDatas)
	}


  return (
    <div>
			{level > 0 &&
				<div className='w-full flex items-center justify-center px-2 py-1 rounded mb-2 border border-secondary-200'>
					<span className='font-semibold'>
						{`Lv.${level}`}
					</span>
				</div>
			}

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'>
				{imageDatas.map((item) => (
					<div key={item.img_url + item.idx + item.chrbot_multi_image_key}>
						<ImageSlot data={item} />
					</div>
				))}
      </div>
			
			<div className="w-full flex justify-center">
				<input
					id={`imageUpload_${level}`}
					multiple
					type="file"
					accept="image/*"
					onChange={e => handleImageUpload(e)}
					className="hidden"  // input 숨김
				/>
				
				<label 
					htmlFor={`imageUpload_${level}`}
					className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md w-full cursor-pointer transition-colors duration-200 flex items-center justify-center"
				>
					<span className="flex items-center justify-center gap-2">
						이미지 업로드
						<div className="text-xs text-secondary-400 dark:text-dark-secondary-400">{sumImageCount}/{MAX_IMAGE_COUNT}</div>
					</span>
				</label>
      </div>
    </div>
  )
}