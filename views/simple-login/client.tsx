'use client';

import cn from 'classnames';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { BaseButton } from '@/components/elements/button/BaseButton';
import BaseModal from '@/components/modal/BaseModal';

import { getChatRoomEncryptData } from '@/lib/utils/storyNationUtil';
import { useAccountStore } from '@/store/useAccountStore';
import { useModalStore } from '@/store/useStoreModal';

const CHAT_FRONTEND_ADDRESS = process.env.NEXT_PUBLIC_CHAT_FRONTEND_ADDRESS;

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

export default function SimpleLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { openModal } = useModalStore();
  const { guestLogin2 } = useAccountStore();

  const [chrbotKey, setChrbotKey] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  useEffect(() => {
    const _chrbotKey = searchParams.get('chrbot_key');
    if (_chrbotKey) {
      setChrbotKey(_chrbotKey);
    }
  }, [searchParams]);

  const handleChangeGendeer = (_gender: Gender) => {
    if (gender === _gender) {
      setGender(null);
    } else {
      setGender(_gender);
    }
  };

  const handleChatClick = async () => {
    const persona = name;
    const persona_gender = gender === Gender.MALE ? 1 : gender === Gender.FEMALE ? 2 : 3;

    const result = await guestLogin2(persona, persona_gender as number);

    if (result.success && result.data) {
      toast.success('무료펜 30개가 충전됐어요!');

      const encryptedData = await getChatRoomEncryptData(
        chrbotKey,
        result.data?.coin?.toString() || '0',
        'KR',
        result.data?.freeCoin?.toString() || '0',
        null,
        result.data?.nsfw?.toString() || '0',
        result.data?.persona || '',
        result.data?.token || '',
        result.data?.userKey?.toString() || '0',

        result.data?.api_server || '',
        result.data?.chat_address || '',
        result.data?.chat_server || '',
        result.data?.chat_server_port || ''
      );

      const chatRoomPath = `${CHAT_FRONTEND_ADDRESS}?info=${encryptedData}`;
      router.push(chatRoomPath);

      // router.push(`https://qa.storynation.co.kr/character/chat?info=${encryptedData}`)
    }
  };

  const handleSocialLoginClick = () => {
    openModal('login', { chrbot_key: chrbotKey });
  };

  const baseStyles =
    'flex items-center justify-center rounded-full font-medium transition-all duration-300';
  const primaryStyles = 'text-gray-700 shadow-sm';

  return (
    <BaseModal
      isOpen={true}
      showCloseButton={false}
      onClose={() => {}}
      className='w-full max-w-[400px]'
      style={{
        padding: '0px',
        minWidth: 'auto',
      }}
    >
      <div className={cn('flex flex-col items-start justify-start h-full p-4', 'md:m-[20px]')}>
        {/* header */}
        <div className='flex flex-col items-start justify-start font-bold text-lg'>
          <span>캐릭터가 불러줄</span>

          <span>내 이름을 입력해 주세요.</span>
        </div>

        {/* content */}
        <div className='flex flex-col items-start justify-start w-full border-b border-gray-200 pb-4 gap-4'>
          {/* name */}
          <div className='flex flex-col items-start justify-start w-full gap-2 mt-4'>
            <span className='font-bold text-sm'>이름 *</span>

            <div className='w-full'>
              <input
                type='text'
                className='w-full rounded-lg border border-gray-200 p-3 my-2'
                placeholder='이름을 입력해 주세요.'
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 25))}
                maxLength={25}
              />

              <div className='text-right text-sm text-gray-500'>{name.length} / 25</div>
            </div>
          </div>

          {/* gender */}
          <div className='flex flex-col items-start justify-start w-full mb-10 mt-4 gap-2'>
            <span className='font-bold text-sm'>성별 *</span>

            <div className='w-full flex flex-row items-center justify-center gap-2 my-2'>
              <button
                className={cn(
                  baseStyles,
                  primaryStyles,
                  'w-full rounded-lg py-2 text-base',
                  gender === Gender.MALE ? 'bg-[#432DF1] text-white' : 'bg-[#F1F2F2] opacity-50'
                )}
                onClick={() => handleChangeGendeer(Gender.MALE)}
              >
                남성
              </button>

              <button
                className={cn(
                  baseStyles,
                  primaryStyles,
                  'w-full rounded-lg py-2 text-base',
                  gender === Gender.FEMALE ? 'bg-[#432DF1] text-white' : 'bg-[#F1F2F2] opacity-50'
                )}
                color='primary'
                onClick={() => handleChangeGendeer(Gender.FEMALE)}
              >
                여성
              </button>

              <button
                className={cn(
                  baseStyles,
                  primaryStyles,
                  'w-full rounded-lg py-2 text-base',
                  gender === Gender.UNKNOWN ? 'bg-[#432DF1] text-white' : 'bg-[#F1F2F2] opacity-50'
                )}
                color='primary'
                onClick={() => handleChangeGendeer(Gender.UNKNOWN)}
              >
                알 수 없음
              </button>
            </div>
          </div>

          {/* button */}
          <div className='flex flex-col items-start justify-start w-full'>
            <div className='w-full'>
              <button
                className={cn(
                  'w-full rounded-lg py-2 px-4 text-base',
                  !name || !gender
                    ? 'bg-[#E9EAEB] opacity-50'
                    : 'bg-[#432DF1] text-[#FFFFFF] opacity-100'
                )}
                color='primary'
                onClick={handleChatClick}
                disabled={!name || !gender}
              >
                채팅하기
              </button>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className='flex flex-col items-start justify-start gap-1 mt-4'>
          <span className=' text-gray-500 text-sm'>이미 스토리네이션 계정이 있다면?</span>
          <button
            onClick={handleSocialLoginClick}
            className='flex flex-row items-center justify-center gap-2'
          >
            <span className='font-bold text-sm'>소셜 계정으로 로그인 {'>'}</span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
