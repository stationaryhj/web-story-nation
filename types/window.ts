// Window 인터페이스 확장
declare global {
  interface Window {
    resizeTimer?: NodeJS.Timeout
  }
}

export {} // 모듈로 인식되기 위한 빈 export
