'use client';

import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccountStore } from '@/store/useAccountStore';
import { useBankStore } from '@/store/useGlobalStore';
import { BaseButton } from '../elements/button/BaseButton';
import BaseModal from './BaseModal';
import 'react-toastify/dist/ReactToastify.css';

interface BankInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankInfo: {
    bank: string;
    accountNumber: string;
    accountHolder: string;
  };
  onBankInfoChange: (bankInfo: {
    bank: string;
    accountNumber: string;
    accountHolder: string;
  }) => void;
}

const BankInfoModal = ({ isOpen, onClose, bankInfo, onBankInfoChange }: BankInfoModalProps) => {
  // 모달 내부 상태
  const [bank, setBank] = useState(bankInfo.bank);
  const [accountNumber, setAccountNumber] = useState(bankInfo.accountNumber);
  const [accountHolder, setAccountHolder] = useState(bankInfo.accountHolder);
  const [showBankList, setShowBankList] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 은행 드롭다운 ref
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  // 은행 리스트 가져오기
  const { bankList, isLoading, error, getBankList } = useBankStore();

  // 컴포넌트 마운트 시 은행 리스트 가져오기
  useEffect(() => {
    getBankList().catch((error) => {
      console.error('은행 리스트를 가져오는 중 오류 발생:', error);
    });
  }, [getBankList]);

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

  // 모달이 열릴 때마다 초기값 설정
  useEffect(() => {
    if (isOpen) {
      setBank(bankInfo.bank);
      setAccountNumber(bankInfo.accountNumber);
      setAccountHolder(bankInfo.accountHolder);
    }
  }, [isOpen, bankInfo]);

  // 은행 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setShowBankList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 은행 선택 핸들러
  const handleBankSelect = (selectedBank: string) => {
    setBank(selectedBank);
    setShowBankList(false);
  };

  // 계좌번호 입력 핸들러 (숫자만 입력 가능)
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 허용, 최대 14자리
    if (/^\d*$/.test(value) && value.length <= 14) {
      setAccountNumber(value);
    }
  };

  // 예금주 입력 핸들러 (한글만 입력 가능)
  const handleAccountHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAccountHolder(value);
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      // useAccountStore의 updateBankAccount 함수 사용
      const { updateBankAccount } = useAccountStore.getState();

      const result = await updateBankAccount(bank, accountNumber, accountHolder);

      if (result.success) {
        // 성공 시 부모 컴포넌트에 변경 사항 알림
        onBankInfoChange({
          bank,
          accountNumber,
          accountHolder,
        });

        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('계좌 정보 저장 중 오류 발생:', error);
      toast.error('계좌 정보 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title='계좌 정보 수정'
      size={isMobile ? 'sm' : 'md'}
      contentClassName={isMobile ? 'max-h-[80vh] overflow-auto' : ''}
      bodyClassName={isMobile ? 'py-3' : 'py-4'}
      position={isMobile ? 'center' : 'center'}
      footerContent={
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-3'} w-full`}>
          <BaseButton onClick={onClose} color='secondary' className={isMobile ? 'w-full' : ''}>
            취소
          </BaseButton>
          <BaseButton onClick={handleSave} color='primary' className={isMobile ? 'w-full' : ''}>
            저장
          </BaseButton>
        </div>
      }
    >
      <div className='space-y-4'>
        {/* 은행 선택 */}
        <div className='relative' ref={bankDropdownRef}>
          <label className='block text-sm font-medium text-text-primary mb-2'>은행</label>
          <button
            className='w-full px-4 py-3 border border-border-default rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-brand hover:bg-brand/10'
            onClick={() => setShowBankList(!showBankList)}
            disabled={isLoading}
          >
            <span>{bank || '은행 선택'}</span>
            <FontAwesomeIcon icon={faChevronDown} className='text-text-muted' />
          </button>
          {showBankList && (
            <div className='absolute mt-1 w-full bg-surface-elevated border border-border-default rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto'>
              {isLoading ? (
                <div className='px-4 py-2 text-text-muted'>은행 목록을 불러오는 중...</div>
              ) : error ? (
                <div className='px-4 py-2 text-danger'>은행 목록을 불러오지 못했습니다</div>
              ) : (
                bankList.map((bankData) => (
                  <div
                    key={bankData.bank_key}
                    className='px-4 py-2 hover:bg-brand/10 cursor-pointer'
                    onClick={() => handleBankSelect(bankData.bank_nm)}
                  >
                    {bankData.bank_nm}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 계좌번호 */}
        <div>
          <label className='block text-sm font-medium text-text-primary mb-2'>
            계좌번호 <span className='text-xs text-text-muted'>(숫자만 입력)</span>
          </label>
          <input
            type='text'
            value={accountNumber}
            onChange={handleAccountNumberChange}
            className='w-full px-4 py-3 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-surface'
            placeholder='계좌번호'
            maxLength={14}
          />
        </div>

        {/* 예금주 */}
        <div>
          <label className='block text-sm font-medium text-text-primary mb-2'>
            예금주 <span className='text-xs text-text-muted'>(한글, 영문 가능)</span>
          </label>
          <input
            type='text'
            value={accountHolder}
            onChange={handleAccountHolderChange}
            className='w-full px-4 py-3 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-surface'
            placeholder='예금주'
            maxLength={8}
          />
        </div>

        <div className='bg-danger/10 p-3 rounded-lg mt-2'>
          <p className='text-sm text-danger font-medium leading-tight'>
            입력하신 계좌번호와 예금주를 정확히 확인해 주세요. 잘못된 정보 입력으로 인한 문제는
            책임지지 않습니다.
          </p>
        </div>
      </div>
    </BaseModal>
  );
};

export default BankInfoModal;
