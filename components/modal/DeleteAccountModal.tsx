import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { contentApi } from '@/services/api/storyNationApi';
import { useAccountStore } from '@/store/useAccountStore';
import BaseModal from './BaseModal';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userNickname: string;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userNickname,
}: DeleteAccountModalProps) {
  const [inputNickname, setInputNickname] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState('');

  const { logout } = useAccountStore();

  const handleDelete = async () => {
    if (inputNickname !== userNickname) {
      setError('닉네임이 일치하지 않습니다.');
      return;
    }

    // api
    const response = await contentApi.Signout();
    console.log('response :: ', response);

    if (response.data.result.err === 0) {
      // 실제 API 호출 대신 상태 변경
      logout();

      setIsDeleted(true);
      setError('');
    }
  };

  const handleConfirmDeletion = () => {
    onClose();
    // 여기서 로그아웃 처리 및 홈으로 리다이렉트
    window.location.href = '/';
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isDeleted ? '계정 삭제 완료' : '계정 삭제 확인'}
      size='sm'
      showCloseButton={!isDeleted}
      preventBackdropClose={isDeleted}
    >
      {!isDeleted ? (
        <div className='flex flex-col space-y-6'>
          <div className='space-y-2 text-center'>
            <p className='text-text-primary font-medium'>정말 계정을 삭제하시겠습니까?</p>
            <p className='text-sm text-text-muted leading-relaxed'>
              계정 삭제를 원하시면 본인 확인을 위해
              <br />
              아래에 닉네임을 입력한 뒤 삭제 버튼을 눌러주세요.
            </p>
          </div>

          <div className='space-y-2'>
            <div className='relative'>
              <input
                type='text'
                value={inputNickname}
                onChange={(e) => {
                  setInputNickname(e.target.value);
                  setError('');
                }}
                placeholder={`닉네임을 입력하세요`}
                className={`w-full px-4 py-3 border rounded-lg bg-surface focus:outline-none focus:ring-2 transition-all
                  ${
                    error
                      ? 'border-danger focus:ring-danger/20'
                      : 'border-border-default focus:ring-brand/20'
                  }`}
              />
              {error && <p className='absolute -bottom-6 left-0 text-sm text-danger'>{error}</p>}
            </div>
          </div>

          <div className='flex space-x-3 pt-2'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-3 bg-surface-elevated text-text-primary rounded-lg hover:bg-surface-elevated-hover transition-colors font-medium'
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              className='flex-1 px-4 py-3 bg-danger text-text-inverse rounded-lg hover:bg-danger/90 transition-colors font-medium'
            >
              계정 삭제하기
            </button>
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center space-y-6 py-4'>
          <p className='text-lg text-text-primary font-medium'>계정이 영구적으로 삭제되었어요.</p>
          <button
            onClick={handleConfirmDeletion}
            className='w-32 px-6 py-3 bg-brand text-text-inverse rounded-lg hover:bg-brand-hover transition-colors font-medium'
          >
            확인
          </button>
        </div>
      )}
    </BaseModal>
  );
}
