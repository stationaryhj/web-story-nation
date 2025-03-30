'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PassFailed() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return

      if (!searchParams) {
        setError('검색 파라미터를 찾을 수 없습니다')
        return
      }
      
      // searchParams에서 enc_data 파라미터 가져오기
      const enc_data = searchParams.get('EncodeData')
      
      if (!enc_data) {
        setError('인증 데이터를 찾을 수 없습니다')
        return
      }
      
      // 부모 창에 메시지 전달
      if (window.opener) {
        try {
          window.opener.postMessage({
            type: 'PASS_FAILED',
            encData: enc_data
          }, window.location.origin)
          
          // 메시지 전송 후 2초 후 창 닫기
          setTimeout(() => {
            window.close()
          }, 2000)
        } catch (err) {
          console.error('메시지 전송 중 오류:', err)
          setError('본인인증 결과 전송 중 오류가 발생했습니다')
        }
      } else {
        setError('부모 창을 찾을 수 없습니다')
      }
    } catch (err) {
      console.error('본인인증 실패 처리 중 오류:', err)
      setError('본인인증 처리 중 오류가 발생했습니다')
    }
  }, [searchParams])
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
            <p className="text-gray-700 mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-primary-600 text-white rounded-md"
              onClick={() => window.close()}
            >
              창 닫기
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">본인인증 실패</h1>
            <p className="text-gray-700 mb-4">본인인증에 실패했습니다.</p>
            <p className="text-gray-500 text-sm">이 창은 자동으로 닫힙니다.</p>
          </>
        )}
      </div>
    </div>
  )
} 