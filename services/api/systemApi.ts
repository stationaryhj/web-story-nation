import { api } from "./axiosInstance"


// 시스템 정보 조회
export const systemApi = {
  // 시스템 정보 조회
  getSystemInfo: async () => {
    const response = await api.get('/api/system_info')
    return response.data
  }
}
