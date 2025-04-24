'use client'

import Image from 'next/image'
import { useMainConfigStore } from '@/store/useMainConfigStore'

export default function InspectionPage() {
  const { webConfig } = useMainConfigStore()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* 로고 */}
      <div className="mb-8">
          <Image 
          src="/images/logo.png" 
          alt="Story Nation" 
          width={200} 
          height={40}
          priority
          />
      </div>

      {/* 점검 메시지 */}
      <h1 className="text-center space-y-2">
        <pre>
          {webConfig?.pm_desc_ko}
        </pre>

        <pre>
          {webConfig?.pm_desc}
        </pre>

        <pre>
          {webConfig?.pm_period}
        </pre>
      </h1>
    </div>
  )
}
