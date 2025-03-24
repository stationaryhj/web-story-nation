'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import BaseModal from './BaseModal'
import { BaseButton } from '../elements/button/BaseButton'

interface BankAccount {
  bank: string
  accountNumber: string
  accountHolder: string
}

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  bankAccount: BankAccount
  availableAmount: number
  requestAmount: number
  onRequestAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onConfirm: () => void
}

const WithdrawModal = ({
  isOpen,
  onClose,
  bankAccount,
  availableAmount,
  requestAmount,
  onRequestAmountChange,
  onConfirm,
}: WithdrawModalProps) => {
  // 금액 포맷 함수 - 펜 단위로 변경
  const formatPen = (amount: number) => {
    return amount.toLocaleString('ko-KR')
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="출금 신청"
      size="md"
      footerContent={
        <div className="flex justify-end space-x-3">
          <BaseButton onClick={onClose} color="secondary">
            취소
          </BaseButton>
          <BaseButton onClick={onConfirm} color="primary">
            출금 신청
          </BaseButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 mb-1">계좌 정보</div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p>
                <span className="font-medium">은행:</span> {bankAccount.bank}
              </p>
              <p>
                <span className="font-medium">계좌번호:</span> {bankAccount.accountNumber}
              </p>
              <p>
                <span className="font-medium">예금주:</span> {bankAccount.accountHolder}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 mb-1">출금 가능 펜</div>
            <div className="text-lg font-semibold flex items-center">
              {formatPen(availableAmount)} <FontAwesomeIcon icon={faPen} className="ml-1" />
            </div>
          </div>

          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700">출금 신청할 금액</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                value={requestAmount}
                onChange={onRequestAmountChange}
                className="border-gray-300 focus:border-violet-300 block w-full pr-12 rounded-md focus:ring focus:ring-violet-200 focus:ring-opacity-50"
                placeholder="최소 1500펜"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faPen} className="text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">최소 1500펜부터 출금 가능합니다.</p>
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-sm text-red-600 font-medium">
            입력하신 계좌번호와 예금주를 정확히 확인해 주세요. 잘못된 정보 입력으로 인한 출금 오류는 책임지지 않습니다.
          </p>
        </div>
      </div>
    </BaseModal>
  )
}

export default WithdrawModal
