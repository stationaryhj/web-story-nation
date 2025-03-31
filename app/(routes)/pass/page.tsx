export default function PassPage() {
  // 이 페이지는 /pass 경로로 접근할 때 표시됩니다.
  // 실제로는 NextAuth 또는 다른 인증 시스템으로 리다이렉트됩니다.
  // pass_success.tsx와 pass_failed.tsx는 콜백 페이지로 직접 접근됩니다.
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-primary-600 mb-4">본인인증 처리 중</h1>
        <p className="text-gray-700 mb-4">본인인증이 처리 중입니다. 자동으로 리다이렉트됩니다.</p>
      </div>
    </div>
  )
} 