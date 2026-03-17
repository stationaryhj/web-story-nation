import { useMutation } from '@tanstack/react-query'
import { instance } from '@/shared/api/instance/instance'
import { apiRoute } from '@/shared/config/apiRoute'
import { uploadImages } from '@/lib/utils/storyNationUtil'
import type { GetPresignedUrlResponse } from '@/types/api'

interface UploadImageResult {
  path: string
}

export const useUploadImage = () => {
  return useMutation<UploadImageResult, Error, File>({
    mutationFn: async (file) => {
      const extension = file.name.split('.').pop()

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
