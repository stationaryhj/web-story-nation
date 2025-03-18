import axios from 'axios';

const HEADER_NAME_AUTH_TOKEN = 'ca' as const;

// 공통 axios 인스턴스
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request 인터셉터
api.interceptors.request.use(
  (config) => {
    // URL이 /admin/v2를 포함하면 토큰 추가
    if (config.url?.includes('/admin/v2')) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers[HEADER_NAME_AUTH_TOKEN] = token;
        console.log('토큰', config.headers);
      }
    }
    return config;
  },
  // 에러 처리
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => {
    // 성공 응답 처리
    return response.data;
  },
  (error) => {
    // 에러 응답 처리
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('Network Error:', error.request);
      return Promise.reject({ message: '네트워크 오류가 발생했습니다.' });
    } else {
      // 요청 설정 중 오류가 발생한 경우
      console.error('Request Error:', error.message);
      return Promise.reject({ message: '요청 중 오류가 발생했습니다.' });
    }
  },
);

//토큰 만료시

export { api, HEADER_NAME_AUTH_TOKEN };
