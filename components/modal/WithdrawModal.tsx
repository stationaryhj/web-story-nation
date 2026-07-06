'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BaseButton } from '../elements/button/BaseButton';
import BaseModal from './BaseModal';

interface BankAccount {
  bank: string;
  accountNumber: string;
  accountHolder: string;
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccount: BankAccount;
  availableAmount: number;
  requestAmount: number;
  accountNo1: string;
  accountNo2: string;
  name: string;
  onRequestAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAccountNo1Change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAccountNo2Change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
}

const WithdrawModal = ({
  isOpen,
  onClose,
  bankAccount,
  availableAmount,
  requestAmount,
  accountNo1,
  accountNo2,
  name,
  onRequestAmountChange,
  onAccountNo1Change,
  onAccountNo2Change,
  onNameChange,
  onConfirm,
}: WithdrawModalProps) => {
  // 모바일 상태 추가
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지하여 모바일/PC 모드 설정
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 초기 실행
    handleResize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 금액 포맷 함수 - 펜 단위로 변경
  const formatPen = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title='출금 신청'
      size={isMobile ? 'sm' : 'md'}
      contentClassName={isMobile ? 'max-h-[80vh] overflow-auto' : ''}
      bodyClassName={isMobile ? 'py-3' : 'py-4'}
      position={isMobile ? 'center' : 'center'}
      footerContent={
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-3'} w-full`}>
          <BaseButton onClick={onClose} color='secondary' className={isMobile ? 'w-full' : ''}>
            취소
          </BaseButton>
          <BaseButton onClick={onConfirm} color='primary' className={isMobile ? 'w-full' : ''}>
            출금 신청
          </BaseButton>
        </div>
      }
    >
      <div className='space-y-3'>
        <div>
          <div className='mb-3'>
            <div className='text-sm font-medium text-text-muted mb-1'>계좌 정보</div>
            <div
              className={`p-${isMobile ? '2' : '3'} bg-surface-elevated rounded-lg text-${isMobile ? 'xs sm:text-sm' : 'sm'}`}
            >
              <p className='py-0.5'>
                <span className='font-medium'>은행:</span> {bankAccount.bank}
              </p>
              <p className='py-0.5'>
                <span className='font-medium'>계좌번호:</span> {bankAccount.accountNumber}
              </p>
              <p className='py-0.5'>
                <span className='font-medium'>예금주:</span> {bankAccount.accountHolder}
              </p>
            </div>
          </div>

          <div className='mb-3'>
            <div className='text-sm font-medium text-text-muted mb-1'>출금 가능 펜</div>
            <div
              className={`${isMobile ? 'text-base sm:text-lg' : 'text-lg'} font-semibold flex items-center`}
            >
              {formatPen(availableAmount)}{' '}
              <Image
                src='/images/pen/pen_black.svg'
                alt='pen'
                width={18}
                height={18}
                className='ml-1'
              />
            </div>
          </div>

          <div className='mb-1'>
            <label
              className={`block text-sm font-medium text-text-primary ${isMobile ? 'mb-1' : ''}`}
            >
              출금 신청할 금액
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <input
                type='text'
                value={requestAmount}
                onChange={onRequestAmountChange}
                className={`border-border-default focus:border-violet-300 block w-full pr-12 rounded-md
                  focus:ring focus:ring-violet-200 focus:ring-opacity-50
                  ${isMobile ? 'h-9 text-sm' : 'h-10'}`}
                placeholder='최소 1500펜'
              />
              <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                <Image src='/images/pen/pen_secondary.svg' alt='pen' width={18} height={18} />
              </div>
            </div>
            <p className='text-xs text-text-muted mt-1'>최소 1500펜부터 출금 가능합니다.</p>
          </div>

          {/* 주민등록번호 */}
          <div className='py-4 mb-4'>
            <input
              type='text'
              value={name}
              onChange={onNameChange}
              maxLength={6}
              placeholder='실명'
              className='w-[100px] md:w-[120px] rounded-lg border border-border-default px-3 py-2 text-text-primary placeholder-secondary-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand bg-surface'
            />
            <label className='block text-sm font-medium text-text-muted mb-2'>주민등록번호</label>
            <div className='flex items-center w-full'>
              <div className='flex-1'>
                <input
                  type='text'
                  value={accountNo1}
                  onChange={onAccountNo1Change}
                  maxLength={6}
                  placeholder='앞 6자리'
                  className='w-full rounded-lg border border-border-default px-3 py-2 text-text-primary placeholder-secondary-400 focus:border-brand focus:outline-none focus:ring-brand bg-surface'
                />
              </div>
              <span className='mx-2 text-text-muted font-medium'>-</span>
              <div className='flex-1'>
                <input
                  type='password'
                  value={accountNo2}
                  onChange={onAccountNo2Change}
                  maxLength={7}
                  placeholder='뒤 7자리'
                  className='w-full rounded-lg border border-border-default px-3 py-2 text-text-primary placeholder-secondary-400 focus:border-brand focus:outline-none focus:ring-brand bg-surface'
                />
              </div>
            </div>

            <div className='text-xs text-text-muted mt-1'>개인정보는 안전하게 보호됩니다</div>
          </div>
        </div>

        <div className={`bg-danger/10 p-${isMobile ? '2' : '3'} rounded-lg mt-2`}>
          <p
            className={`${isMobile ? 'text-xs' : 'text-sm'} text-danger font-medium leading-tight`}
          >
            입력하신 계좌번호와 예금주를 정확히 확인해 주세요. 잘못된 정보 입력으로 인한 출금 오류는
            책임지지 않습니다.
          </p>
        </div>
      </div>
    </BaseModal>
  );
};

export default WithdrawModal;
