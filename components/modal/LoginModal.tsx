'use client'

import BaseModal from './BaseModal'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="로그인"
      size="md"
      animation="fade"
      backdropColor="bg-black/70 backdrop-blur-sm"
    >
      <div className="flex flex-col space-y-6 py-4">
        <div className="space-y-4">
          <button className="flex w-full items-center justify-center rounded-full bg-yellow-400 py-3 px-4 font-medium text-yellow-900 shadow transition-colors hover:bg-yellow-500">
            카카오로 로그인
          </button>
          <button className="flex w-full items-center justify-center rounded-full bg-green-500 py-3 px-4 font-medium text-white shadow transition-colors hover:bg-green-600">
            네이버로 로그인
          </button>
          <button className="flex w-full items-center justify-center rounded-full bg-black py-3 px-4 font-medium text-white shadow transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100">
            애플로 로그인
          </button>
          <button className="flex w-full items-center justify-center rounded-full bg-blue-500 py-3 px-4 font-medium text-white shadow transition-colors hover:bg-blue-600">
            구글로 로그인
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>또는</p>
        </div>

        <div className="space-y-4">
          <button className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white py-3 px-4 font-medium text-gray-700 shadow transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-dark-background dark:text-gray-300 dark:hover:bg-dark-background-light">
            게스트로 계속하기
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>계속 진행하면 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.</p>
        </div>
      </div>
    </BaseModal>
  )
}
