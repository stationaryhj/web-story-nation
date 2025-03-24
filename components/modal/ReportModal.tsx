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
  userName: string
  onSubmit: (reason: string) => void
  onClose: () => void
  submitted: boolean
}

// 신고 모달 내용 컴포넌트
function ReportModalContent({ userName, onSubmit, onClose, submitted }: ReportModalContentProps) {
  const [reason, setReason] = useState('')

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <p className="text-green-600 dark:text-green-400 mb-4">신고가 성공적으로 접수되었습니다.</p>
        <p className="text-gray-600 dark:text-gray-400">빠른 시일 내에 검토하겠습니다.</p>
      </div>
    )
  }

  return (
    <>
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">신고하시는 이유를 선택해주세요:</p>
        <div className="space-y-2">
          {REPORT_REASONS.map(r => (
            <div key={r} className="flex items-center">
              <input
                type="radio"
                id={r}
                name="reportReason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="mr-2"
              />
              <label htmlFor={r} className="text-gray-700 dark:text-gray-300">
                {r}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 mr-2">
          취소
        </button>
        <button
          onClick={() => reason && onSubmit(reason)}
          disabled={!reason}
          className={`px-4 py-2 rounded-md ${
            reason
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          신고하기
        </button>
      </div>
    </>
  )
}

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  onSubmit: (reason: string) => void
  submitted: boolean
}

export default function ReportModal({ isOpen, onClose, userName, onSubmit, submitted }: ReportModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={submitted ? '신고가 접수되었습니다' : `'${userName}' 사용자 신고하기`}
      size="md"
      backdropColor="bg-black/10"
      animation="scale"
    >
      <ReportModalContent userName={userName} onSubmit={onSubmit} onClose={onClose} submitted={submitted} />
    </BaseModal>
  )
}
