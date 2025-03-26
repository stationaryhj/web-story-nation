'use client'

import { useState, useEffect } from 'react'
import { BaseButton } from '@/components/elements/button/BaseButton'
import { useSearchParams } from 'next/navigation'

const tabs = [
  { id: 'terms', name: '서비스 이용약관' },
  { id: 'privacy', name: '개인정보 처리방침' },
  { id: 'paid', name: '유료 서비스 이용약관' },
  { id: 'policy', name: '운영 정책' },
]

// 약관 내용
const termsContent = {
  terms: `서비스 이용약관

1. 서비스 이용
본 서비스는 이용자가 본 약관에 동의하는 것을 전제로 제공됩니다.

2. 개인정보 보호
서비스 제공자는 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수합니다.

3. 이용자의 의무
이용자는 서비스 이용 시 관련 법령과 본 약관을 준수해야 합니다.

4. 서비스 변경 및 중단
서비스 제공자는 필요한 경우 서비스의 내용을 변경하거나 중단할 수 있습니다.

5. 책임 제한
서비스 제공자는 천재지변, 기술적 결함 등 불가항력적인 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.`,

  privacy: `개인정보 처리방침

1. 수집하는 개인정보
이메일 주소, 이름, 프로필 사진 등 서비스 이용에 필요한 최소한의 정보를 수집합니다.

2. 개인정보의 이용
수집된 개인정보는 서비스 제공, 이용자 식별, 서비스 개선 등을 위해 사용됩니다.

3. 개인정보의 보유 기간
개인정보는 서비스 제공 목적 달성 시까지 보유하며, 이용자가 탈퇴하는 경우 즉시 파기됩니다.

4. 개인정보의 제3자 제공
이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.

5. 정보주체의 권리
이용자는 언제든지 자신의 개인정보에 대한 접근, 정정, 삭제를 요청할 수 있습니다.`,

  paid: `유료 서비스 이용약관

1. 결제 및 환불
서비스 이용료는 선불로 결제되며, 구체적인 환불 정책은 각 서비스별로 상이할 수 있습니다.

2. 구독 서비스
구독 서비스는 자동 갱신되며, 이용자는 언제든지 구독을 해지할 수 있습니다.

3. 콘텐츠 이용 제한
결제한 콘텐츠는 개인 사용 목적으로만 이용 가능하며, 상업적 이용은 금지됩니다.

4. 가격 변경
서비스 제공자는 필요시 가격을 변경할 수 있으며, 변경 사항은 사전에 공지됩니다.

5. 미성년자 결제
미성년자의 결제는 법정대리인의 동의가 필요하며, 동의 없이 이루어진 결제는 취소될 수 있습니다.`,

  policy: `운영 정책

1. 서비스 운영 원칙
공정하고 투명한 서비스 운영을 위해 노력합니다.

2. 콘텐츠 정책
불법적이거나 타인에게 해를 끼치는 콘텐츠는 제한됩니다.

3. 계정 정지 및 제재
서비스 약관을 위반하는 경우 계정이 정지되거나 제한될 수 있습니다.

4. 신고 및 제보
불량 콘텐츠 발견 시 신고해주시면 신속히 처리하겠습니다.

5. 정책 변경
운영 정책은 필요에 따라 변경될 수 있으며, 변경 사항은 공지됩니다.`,
}

export default function TermsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'paid' | 'policy'>('terms')

  // URL 쿼리에서 탭 파라미터 읽기
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['terms', 'privacy', 'paid', 'policy'].includes(tabParam)) {
      setActiveTab(tabParam as 'terms' | 'privacy' | 'paid' | 'policy')
    }
  }, [searchParams])

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'terms' | 'privacy' | 'paid' | 'policy') => {
    setActiveTab(tab)
    // URL 업데이트 (새로고침 없이)
    window.history.pushState({}, '', `/terms?tab=${tab}`)
  }

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">스토리네이션 약관</h1>

      <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-dark-background">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as 'terms' | 'privacy' | 'paid' | 'policy')}
            className={`flex-1 rounded-md py-2.5 px-3 text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow dark:bg-dark-background-light dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-dark-background-light">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {tabs.find(tab => tab.id === activeTab)?.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">최종 수정일: 2024년 6월 1일</p>

          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <pre className="whitespace-pre-wrap font-sans">{termsContent[activeTab]}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
