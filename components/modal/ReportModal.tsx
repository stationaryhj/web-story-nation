'use client'

import { useState } from 'react'
import BaseModal from './BaseModal'

// 신고 사유 목록
const REPORT_REASONS = [
  '불쾌감을 주는 내용',
  '스팸 또는 광고성 내용',
  '욕설/비하',
  '성적인 내용',
  '폭력적인 내용',
  '기타',
]

interface ReportModalContentProps {
  onSubmit: (reason: string, description: string) => void
  onClose: () => void
  submitted: boolean
}

// 신고 모달 내용 컴포넌트
function ReportModalContent({ onSubmit, onClose, submitted }: ReportModalContentProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (!selectedReason || !description.trim()) return

    setIsSubmitting(true)
    onSubmit(selectedReason, description)
  }

  return (
    <>
      <div className="p-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            스토리네이션은 모든 사용자의 즐거운 창작 활동 및 콘텐츠 소비를 바랍니다. 스토리네이션 운영정책에 위배된다고
            생각되는 콘텐츠는 아래 제시된 사유 선택 후 신고해주시기 바랍니다. 신고된 콘텐츠는 관리자가 확인한 후
            스토리네이션 운영정책에 따라 적절한 조치를 취할 예정입니다.
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
            {REPORT_REASONS.map(reason => (
              <div
                key={reason}
                className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                  reason === selectedReason ? 'border-blue-400 shadow-sm' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <button
                  onClick={() => setSelectedReason(reason === selectedReason ? null : reason)}
                  className={`w-full px-5 py-3 text-left flex justify-between items-center transition-colors ${
                    reason === selectedReason
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                  }`}
                >
                  <span className="font-medium">{reason}</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      reason === selectedReason ? 'text-blue-500 rotate-180' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {reason === selectedReason && (
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
          disabled={!selectedReason || !description.trim() || isSubmitting}
          className={`px-8 py-3 rounded-lg font-medium transition-all ${
            selectedReason && description.trim() && !isSubmitting
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
  onSubmit: (reason: string, description: string) => void
  submitted: boolean
}

export default function ReportModal({ isOpen, onClose, onSubmit, submitted }: ReportModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={submitted ? undefined : '신고하기'}
      size="md"
      backdropColor="bg-black/60"
      animation="scale"
    >
      <ReportModalContent onSubmit={onSubmit} onClose={onClose} submitted={submitted} />
    </BaseModal>
  )
}
