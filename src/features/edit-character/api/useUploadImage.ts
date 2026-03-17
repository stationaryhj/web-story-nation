import { useMutation } from '@tanstack/react-query'
import { instance } from '@/shared/api/instance/instance'
import { apiRoute } from '@/shared/config/apiRoute'
import { uploadImages } from '@/lib/utils/storyNationUtil'
import type { GetPresignedUrlMultiResponse, GetPresignedUrlResponse } from '@/types/api'

interface UploadImageResult {
  path: string
}

export const useUploadImage = () => {
  return useMutation<UploadImageResult, Error, File>({
    mutationFn: async file => {
      const extension = file.name.split('.').pop()
      console.log('extension', extension)
      const response = await instance.post(apiRoute.s3.presignedUrl, {
        file_name: file.name,
        file_type: `.${extension || 'jpg'}`,
        type: 5,
      })

      const data = response.data as GetPresignedUrlResponse

      if (data.result.err !== 0 || !data.presignedUrl) {
        throw new Error('이미지 업로드를 위한 URL을 받아오지 못했습니다')
      }

      await uploadImages(file, data.presignedUrl)

      return { path: data.path }
    },
  })
}

/**
 * 여러 이미지를 한번에 S3에 업로드
 */
export const useUploadImages = () => {
  return useMutation<UploadImageResult[], Error, File[]>({
    mutationFn: async files => {
      const filesInfo = files.map((file, index) => {
        const extension = file.name.split('.').pop()?.toLowerCase()
        return {
          idx: index,
          file_name: file.name,
          file_type: `.${extension || 'jpg'}`,
        }
      })

      const response = await instance.post(apiRoute.s3.presignedUrlMulti, {
        files: JSON.stringify(filesInfo),
        type: 6,
      })

      const data = response.data as GetPresignedUrlMultiResponse

      if (data.result.err !== 0 || !data.files) {
        throw new Error('이미지 업로드를 위한 URL을 받아오지 못했습니다')
      }

      await Promise.all(
        data.files.map(async fileData => {
          const file = files[fileData.idx]
          if (file) await uploadImages(file, fileData.presignedUrl)
        })
      )

      return data.files.map(fileData => ({ path: fileData.path }))
    },
  })
}
