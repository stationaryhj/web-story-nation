'use client'

import { useState, useEffect } from 'react'
import { BaseButton } from '@/components/elements/button/BaseButton'
import { useSearchParams } from 'next/navigation'

const tabs = [
  { id: 'service', name: '서비스 이용약관' },
  { id: 'privacy', name: '개인정보 수집 및 이용' },
  { id: 'paid', name: '유료 이용약관' },
  { id: 'marketing', name: '마케팅 정보 수신' },
]

export default function TermsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('service')

  // URL 파라미터에서 탭 설정 가져오기
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">스토리네이션 약관</h1>

      <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-dark-background">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
        {activeTab === 'service' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">서비스 이용약관</h2>
            <p className="text-gray-600 dark:text-gray-300">최종 수정일: 2023년 12월 1일</p>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                스토리네이션(이하 '회사')이 제공하는 서비스를 이용해 주셔서 감사합니다. 본 약관은 회사가 제공하는 모든
                서비스(이하 '서비스')의 이용 조건 및 절차, 회사와 회원 간의 권리, 의무, 책임 등 기본적인 사항을
                규정합니다.
              </p>

              <h3 className="text-lg font-semibold">1. 약관의 적용 및 변경</h3>
              <p>
                1.1 본 약관은 회사가 제공하는 모든 서비스에 적용됩니다.
                <br />
                1.2 회사는 합리적인 사유가 있는 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해
                공지합니다.
                <br />
                1.3 회원은 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있으며, 변경된 약관 시행일 이후
                서비스를 계속 이용하는 경우 약관 변경에 동의한 것으로 간주합니다.
              </p>

              <h3 className="text-lg font-semibold">2. 서비스 이용 계약의 성립</h3>
              <p>
                2.1 서비스 이용 계약은 회원이 본 약관에 동의하고 회사가 제공하는 회원가입 양식에 따라 회원정보를 기입한
                후 회사의 승인으로 성립됩니다.
                <br />
                2.2 회사는 다음 각 호에 해당하는 신청에 대해서는 승인을 하지 않거나 사후에 이용 계약을 해지할 수
                있습니다.
                <br />
                &nbsp;&nbsp;- 실명이 아니거나 타인의 명의를 이용한 경우
                <br />
                &nbsp;&nbsp;- 허위 정보를 기재하거나 회사가 요구하는 정보를 제공하지 않은 경우
                <br />
                &nbsp;&nbsp;- 만 14세 미만인 경우
                <br />
                &nbsp;&nbsp;- 이전에 회원 자격을 상실한 적이 있는 경우
                <br />
                &nbsp;&nbsp;- 기타 회원으로 등록하는 것이 회사의 서비스 운영에 현저히 지장이 있다고 판단되는 경우
              </p>

              <h3 className="text-lg font-semibold">3. 회원의 의무</h3>
              <p>
                3.1 회원은 본 약관 및 관계 법령을 준수해야 합니다.
                <br />
                3.2 회원은 회원가입 시 기재한 개인정보의 변경이 있을 경우, 즉시 수정해야 합니다.
                <br />
                3.3 회원은 자신의 계정과 비밀번호를 관리할 책임이 있으며, 이를 제3자가 이용하도록 해서는 안 됩니다.
                <br />
                3.4 회원은 다음 각 호에 해당하는 행위를 해서는 안 됩니다.
                <br />
                &nbsp;&nbsp;- 타인의 정보를 도용하거나 허위 정보를 등록하는 행위
                <br />
                &nbsp;&nbsp;- 회사가 제공하는 서비스를 이용하여 불법적인 행위를 하는 경우
                <br />
                &nbsp;&nbsp;- 회사의 서비스를 방해하는 행위
                <br />
                &nbsp;&nbsp;- 타인의 명예를 훼손하거나 모욕하는 행위
                <br />
                &nbsp;&nbsp;- 타인의 지적재산권 등을 침해하는 행위
                <br />
                &nbsp;&nbsp;- 음란, 저속한 정보를 교류, 게재하거나 음란사이트를 연결하는 행위
                <br />
                &nbsp;&nbsp;- 회사의 동의 없이 영리를 목적으로 서비스를 사용하는 행위
              </p>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">개인정보 수집 및 이용</h2>
            <p className="text-gray-600 dark:text-gray-300">최종 수정일: 2023년 12월 1일</p>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                스토리네이션(이하 '회사')은 이용자의 개인정보를 중요시하며, 「정보통신망 이용촉진 및 정보보호 등에 관한
                법률」, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다. 회사는 개인정보처리방침을 통하여 회사가
                이용자로부터 수집하는 개인정보의 항목, 개인정보의 수집 및 이용목적, 개인정보의 보유 및 이용기간,
                정보주체의 권리 등에 대하여 안내해 드립니다.
              </p>

              <h3 className="text-lg font-semibold">1. 수집하는 개인정보 항목</h3>
              <p>
                회사는 서비스 제공을 위해 다음의 개인정보 항목을 수집하고 있습니다.
                <br />
                <br />
                1.1 필수항목
                <br />
                &nbsp;&nbsp;- 회원가입 시: 이메일, 비밀번호, 닉네임, 생년월일
                <br />
                &nbsp;&nbsp;- 소셜 로그인 시: 소셜 계정 정보(이메일, 이름), 닉네임, 생년월일
                <br />
                <br />
                1.2 선택항목
                <br />
                &nbsp;&nbsp;- 프로필 이미지, 성별, 관심 장르
                <br />
                <br />
                1.3 서비스 이용 과정에서 자동으로 생성되어 수집되는 정보
                <br />
                &nbsp;&nbsp;- IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 기기정보
              </p>

              <h3 className="text-lg font-semibold">2. 개인정보의 수집 및 이용 목적</h3>
              <p>
                회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.
                <br />
                <br />
                2.1 서비스 제공 및 운영
                <br />
                &nbsp;&nbsp;- 회원 관리 및 서비스 제공
                <br />
                &nbsp;&nbsp;- 콘텐츠 제공, 특정 맞춤 서비스 제공
                <br />
                &nbsp;&nbsp;- 서비스 이용 기록과 접속 빈도 분석, 서비스 이용에 대한 통계
                <br />
                <br />
                2.2 회원관리
                <br />
                &nbsp;&nbsp;- 회원제 서비스 이용에 따른 본인확인, 개인식별
                <br />
                &nbsp;&nbsp;- 불량회원의 부정 이용 방지와 비인가 사용 방지
                <br />
                &nbsp;&nbsp;- 가입의사 확인, 연령확인, 만14세 미만 아동의 개인정보 수집 시 법정 대리인 동의여부 확인
                <br />
                &nbsp;&nbsp;- 불만처리 등 민원처리, 공지사항 전달
              </p>

              <h3 className="text-lg font-semibold">3. 개인정보의 보유 및 이용기간</h3>
              <p>
                회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단,
                관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안
                회원정보를 보관합니다.
                <br />
                <br />
                3.1 회사 내부 방침에 의한 정보보유 사유
                <br />
                &nbsp;&nbsp;- 부정이용기록 : 부정 가입 및 이용 방지를 위해 탈퇴 후 1년간 보관
                <br />
                <br />
                3.2 관련법령에 의한 정보보유 사유
                <br />
                &nbsp;&nbsp;- 계약 또는 청약철회 등에 관한 기록 : 5년 (전자상거래등에서의 소비자보호에 관한 법률)
                <br />
                &nbsp;&nbsp;- 대금결제 및 재화 등의 공급에 관한 기록 : 5년 (전자상거래등에서의 소비자보호에 관한 법률)
                <br />
                &nbsp;&nbsp;- 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년 (전자상거래등에서의 소비자보호에 관한 법률)
                <br />
                &nbsp;&nbsp;- 방문에 관한 기록 : 3개월 (통신비밀보호법)
              </p>
            </div>
          </div>
        )}

        {activeTab === 'paid' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">유료 이용약관</h2>
            <p className="text-gray-600 dark:text-gray-300">최종 수정일: 2023년 12월 1일</p>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                본 약관은 스토리네이션(이하 '회사')이 제공하는 유료 서비스의 이용 조건 및 절차, 회사와 회원 간의 권리,
                의무, 책임 등 기본적인 사항을 규정합니다.
              </p>

              <h3 className="text-lg font-semibold">1. 유료 서비스의 이용</h3>
              <p>
                1.1 회사가 제공하는 유료 서비스를 이용하기 위해서는 서비스 이용요금을 지불해야 합니다.
                <br />
                1.2 유료 서비스의 종류, 이용요금, 결제방법, 환불정책 등에 관한 사항은 서비스 내 해당 안내 페이지에서
                확인할 수 있습니다.
                <br />
                1.3 회사는 필요한 경우 유료 서비스의 내용, 이용요금, 이용시간 등을 변경할 수 있으며, 변경 사항은 시행
                전에 서비스 내 공지사항을 통해 공지합니다.
              </p>

              <h3 className="text-lg font-semibold">2. 결제 및 환불</h3>
              <p>
                2.1 결제
                <br />
                &nbsp;&nbsp;- 결제는 신용카드, 계좌이체, 휴대폰 결제 등 회사가 제공하는 결제 수단을 통해 이루어집니다.
                <br />
                &nbsp;&nbsp;- 미성년자가 결제하는 경우, 법정대리인의 동의 없이 결제한 경우 법정대리인이 취소를 요청할 수
                있습니다.
                <br />
                <br />
                2.2 환불
                <br />
                &nbsp;&nbsp;- 회원이 단순 변심으로 환불을 요청하는 경우, 사용 기간 또는 사용량에 따라 일정 금액을 차감한
                후 환불됩니다.
                <br />
                &nbsp;&nbsp;- 회사의 서비스 중단, 장애 등으로, 회원이 유료 서비스를 이용할 수 없는 경우 이용하지 못한
                기간에 해당하는 금액을 환불합니다.
                <br />
                &nbsp;&nbsp;- 구체적인 환불 규정은 각 유료 서비스별 안내에 따르며, 「전자상거래 등에서의 소비자보호에
                관한 법률」 등 관련법령에 따라 처리됩니다.
              </p>

              <h3 className="text-lg font-semibold">3. 회원의 의무</h3>
              <p>
                3.1 회원은 유료 서비스 이용 시 결제와 관련하여 본인의 정보를 정확하게 입력해야 하며, 타인의 정보를
                도용하거나 허위 정보를 입력해서는 안 됩니다.
                <br />
                3.2 회원은 유료 서비스 이용 중 결제와 관련하여 문제가 발생한 경우, 즉시 회사에 통보해야 합니다.
                <br />
                3.3 회원은 유료 서비스 이용권을 타인에게 양도하거나 대여할 수 없으며, 상업적 목적으로 이용할 수
                없습니다.
              </p>

              <h3 className="text-lg font-semibold">4. 서비스 이용제한</h3>
              <p>
                4.1 회사는 회원이 본 약관을 위반하거나 유료 서비스를 불법적으로 이용하는 경우, 해당 회원의 서비스 이용을
                제한할 수 있습니다.
                <br />
                4.2 서비스 이용제한으로 인해 회원이 유료 서비스를 이용하지 못하게 된 경우, 이에 대한 환불은 본 약관 및
                관련법령에 따라 처리됩니다.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">마케팅 정보 수신 동의</h2>
            <p className="text-gray-600 dark:text-gray-300">최종 수정일: 2023년 12월 1일</p>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                스토리네이션(이하 '회사')은 회원님께 보다 나은 서비스와 혜택을 제공하기 위해 마케팅 정보를 발송하고
                있습니다. 이메일, 문자메시지, 앱 푸시 알림 등을 통해 회사의 새로운 서비스, 이벤트, 프로모션 등의 정보를
                받아보실 수 있습니다.
              </p>

              <h3 className="text-lg font-semibold">1. 마케팅 정보 수신 동의의 내용</h3>
              <p>
                1.1 수신 동의 항목
                <br />
                &nbsp;&nbsp;- 이메일, 문자메시지(SMS/MMS), 앱 푸시 알림
                <br />
                <br />
                1.2 수신 정보 내용
                <br />
                &nbsp;&nbsp;- 회사의 새로운 서비스 및 기능 안내
                <br />
                &nbsp;&nbsp;- 이벤트, 프로모션, 특별 혜택 안내
                <br />
                &nbsp;&nbsp;- 맞춤형 콘텐츠 및 서비스 추천
                <br />
                &nbsp;&nbsp;- 유료 서비스 및 결제 관련 혜택 정보
              </p>

              <h3 className="text-lg font-semibold">2. 수신 동의의 철회</h3>
              <p>
                2.1 마케팅 정보 수신 동의는 언제든지 철회하실 수 있습니다.
                <br />
                2.2 수신 동의 철회 방법
                <br />
                &nbsp;&nbsp;- 이메일: 수신된 이메일 하단의 '수신거부' 링크 클릭
                <br />
                &nbsp;&nbsp;- 문자메시지: 수신된 메시지 내 안내된 방법에 따라 '수신거부' 회신
                <br />
                &nbsp;&nbsp;- 앱 푸시 알림: 앱 설정 메뉴 내 알림 설정에서 변경
                <br />
                &nbsp;&nbsp;- 웹사이트: 마이페이지 {'>'} 설정 {'>'} 알림 설정에서 변경
                <br />
                <br />
                2.3 마케팅 정보 수신 동의를 철회하더라도 서비스 이용에 필요한 필수 안내 정보는 계속해서 발송됩니다.
              </p>

              <h3 className="text-lg font-semibold">3. 개인정보 보호</h3>
              <p>
                3.1 회사는 마케팅 목적으로 수집한 개인정보를 안전하게 관리하며, 동의 받은 목적 외로는 사용하지 않습니다.
                <br />
                3.2 마케팅 정보 수신 동의 철회 시, 관련 개인정보는 즉시 파기됩니다.
                <br />
                3.3 개인정보 보호에 관한 자세한 사항은 '개인정보 처리방침'을 참고하시기 바랍니다.
              </p>

              <h3 className="text-lg font-semibold">4. 미동의시 불이익</h3>
              <p>
                마케팅 정보 수신에 동의하지 않으셔도 회사의 서비스 이용에는 제한이 없습니다. 다만, 이벤트, 프로모션 등의
                혜택 정보를 받아보실 수 없어 일부 혜택에서 제외될 수 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <BaseButton color="primary" size="lg" onClick={() => window.history.back()}>
          이전 페이지로 돌아가기
        </BaseButton>
      </div>
    </div>
  )
}
