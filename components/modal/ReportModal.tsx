'use client'

import { useState } from 'react'
import BaseModal from './BaseModal'

const REPORT_REASONS_KR = [
  {
    id: 67,
    desc: '스팸홍보/도배글입니다.',
  },
  {
    id: 68,
    desc: '음란물입니다. (성인모드 캐릭터는 신고 대상 아님)',
  },
  {
    id: 69,
    desc: '청소년에게 유해한 내용입니다.',
  },
  {
    id: 70,
    desc: '불법 정보를 포함하고 있습니다.',
  },
  {
    id: 71,
    desc: '개인정보가 노출되어 있습니다.',
  },
  {
    id: 72,
    desc: '명예 훼손/저작권 침해를 포함하고 있습니다.',
  },
  {
    id: 0,
    desc: '기타',
  },
]

interface ReportModalContentProps {
  onSubmit: (reason: number | null, description: string) => void
  onClose: () => void
  submitted: boolean
  reportType: 'writer' | 'character'
}

// 신고 모달 내용 컴포넌트
function ReportModalContent({ onSubmit, onClose, submitted, reportType }: ReportModalContentProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportTypeText = reportType === 'writer' ? '작가' : '캐릭터'

  if (submitted) {
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">신고가 접수되었습니다</h3>
        <p className="text-gray-600 dark:text-gray-400">빠른 시일 내에 검토 후 적절한 조치를 취하겠습니다.</p>
      </div>
    )
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    console.log(selectedReasonId, description)
    onSubmit(selectedReasonId, description)
  }

  return (
    <>
      <div className="p-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {reportTypeText} 신고는 스토리네이션 운영정책에 따라 처리됩니다. 신고된 {reportTypeText}는 관리자 검토 후
            운영정책에 따라 적절한 조치가 취해질 예정입니다. 신중한 신고 부탁드립니다.
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">
            신고사유와 무관한 내용을 반복 접수하면 스토리네이션 이용에 제한을 받으실 수 있습니다.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <span className="inline-block w-5 h-5 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs mr-2">
              1
            </span>
            사유 선택
          </h3>
          <div className="space-y-2">
            {REPORT_REASONS_KR.map(reason => (
              <div
                key={reason.id}
                className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                  reason.id === selectedReasonId ? 'border-blue-400 shadow-sm' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <button
                  onClick={() => setSelectedReasonId(reason.id === selectedReasonId ? null : reason.id)}
                  className={`w-full px-5 py-3 text-left flex justify-between items-center transition-colors ${
                    reason.id === selectedReasonId
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                  }`}
                >
                  <span className="font-medium">{reason.desc}</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      reason.id === selectedReasonId ? 'text-blue-500 rotate-180' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {reason.id === selectedReasonId && (
                  <div className="p-4 bg-white dark:bg-gray-800/50">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                      <span className="inline-block w-5 h-5 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs mr-2">
                        2
                      </span>
                      상세 내용 작성
                    </h3>
                    <textarea
                      placeholder="신고 내용을 자세히 작성해주세요."
                      value={description}
                      onChange={e => setDescription(e.target.value.slice(0, 100))}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-h-[120px] focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 outline-none transition-all"
                      maxLength={100}
                    />
                    <div className="flex justify-end mt-2">
                      <span className={`text-xs ${description.length >= 90 ? 'text-red-500' : 'text-gray-500'}`}>
                        {description.length}/100
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 flex justify-center">
        <button
          onClick={handleSubmit}
          className={`px-8 py-3 rounded-lg font-medium transition-all ${
            selectedReasonId !== null
              ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm hover:shadow'
              : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              처리 중...
            </div>
          ) : (
            '신고하기'
          )}
        </button>
      </div>
    </>
  )
}

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: number | null, description: string) => void
  submitted: boolean
  reportType: 'writer' | 'character'
}

export default function ReportModal({ isOpen, onClose, onSubmit, submitted, reportType }: ReportModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={submitted ? undefined : `${reportType === 'writer' ? '작가' : '캐릭터'} 신고하기`}
      size="md"
      className="max-h-[60vh]"
    >
      <ReportModalContent onSubmit={onSubmit} onClose={onClose} submitted={submitted} reportType={reportType} />
    </BaseModal>
  )
}
