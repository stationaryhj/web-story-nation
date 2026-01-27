'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { SpeechBubble } from '@/components/animation/SpeechBubble';
import { getChatRoomEncryptData } from '@/lib/utils/storyNationUtil';
import { authService } from '@/services/auth';
import { useAccountStore } from '@/store/useAccountStore';
import { OAuthProvider } from '@/types/login';
import BaseModal from './BaseModal';
import DuplicateLoginModal from './duplicateLoginModal';

const CHAT_FRONTEND_ADDRESS = process.env.NEXT_PUBLIC_CHAT_FRONTEND_ADDRESS;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  chrbot_key?: string | null;
  callbackUrl?: string | null;
}

export default function LoginModal({ isOpen, onClose, chrbot_key, callbackUrl }: LoginModalProps) {
  const router = useRouter();
  const [showSignup, setShowSignup] = useState(false);
  const [isDuplicateLogin, setIsDuplicateLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  // 이벤트 처리 중인지 추적하는 ref (중복 메시지 처리 방지)
  const processingCallback = useRef(false);

  // 모달이 열리면 authService 초기화
  useEffect(() => {
    if (isOpen) {
      authService.init().catch((err) => {
        console.error('인증 서비스 초기화 오류:', err);
      });
    }
  }, [isOpen]);

  // 로그인 타임아웃 핸들러
  const handleLoginTimeout = useCallback(() => {
    setLoading(false);

    // 타임아웃 관련 데이터 정리
    const timeoutId = localStorage.getItem('naver_login_timeout');
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      localStorage.removeItem('naver_login_timeout');
    }
    localStorage.removeItem('social_login_type');

    // 콜백 처리 상태 초기화
    processingCallback.current = false;
  }, []);

  // 소셜 로그인 콜백 메시지 처리 함수
  useEffect(() => {
    if (!isOpen) return;

    const handleCallbackMessage = async (event: MessageEvent) => {
      console.log('@@ handleCallbackMessage :: ', event);

      // 출처 확인 (보안)
      if (event.origin !== window.location.origin) {
        console.warn('알 수 없는 출처의 메시지 무시됨:', event.origin);
        return;
      }

      // 메시지 데이터 확인
      let loginType = null;
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      console.log('로그인 콜백 메시지 수신:', data);

      // 소셜 로그인 데이터 확인
      if (data.code || data.error) {
        // 이미 처리 중인 경우 중복 처리 방지
        if (processingCallback.current) {
          console.log('이미 콜백을 처리 중입니다. 중복 처리 방지');
          return;
        }

        // 처리 중 상태로 설정
        processingCallback.current = true;

        // 에러 처리
        if (data.error) {
          setLoading(false);
          processingCallback.current = false;
          return;
        }

        if (data.login_type) {
          loginType = data.login_type;
        }

        // 콜백 처리
        try {
          setLoading(true);

          // 타임아웃 클리어
          const timeoutId = localStorage.getItem('naver_login_timeout');
          if (timeoutId) {
            clearTimeout(parseInt(timeoutId));
            localStorage.removeItem('naver_login_timeout');
          }

          // 콜백 파라미터 준비
          const callbackParams = {
            code: data.code,
            state: data.state,
          };

          // id_token이 있는 경우 (Apple 로그인) 추가
          if (data.id_token) {
            console.log('id_token 감지됨 (Apple 로그인)');
            Object.assign(callbackParams, { id_token: data.id_token });
          }

          // authService.handleCallback 호출
          const result = await authService.handleCallback(callbackParams);

          if (result.success) {
            // 로그인 성공 시 상태 업데이트 (useAccountStore)
            if (result.data) {
              useAccountStore.getState().setLoginState(true, result.data, loginType);
              await useAccountStore.getState().updateUserInfoFromUserInfo2();
              await useAccountStore.getState().fetchWriterInfo();

              const { data, logout } = useAccountStore.getState();
              if (data && data.user_block_type === 1) {
                toast.error('정지된 계정입니다.');
                logout();
                onClose();
                return;
              }

              // 성공 시 리다이렉트 처리
              if (chrbot_key) {
                onClose();
                handleConnectedChatRoom(chrbot_key);
              } else if (callbackUrl) {
                router.push(callbackUrl);
              }
            }
          } else if (result.signupRequired || result.needSignup) {
            setShowSignup(true);
          } else if (result.isDuplicateLogin) {
            setIsDuplicateLogin(true);
          }
        } catch (error) {
          console.error('콜백 처리 중 오류 발생:', error);
        } finally {
          setLoading(false);
          // 처리 완료 후 상태 초기화
          processingCallback.current = false;
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('message', handleCallbackMessage);

    // cleanup 함수
    return () => {
      window.removeEventListener('message', handleCallbackMessage);
      // 모달이 닫힐 때 처리 상태 초기화
      processingCallback.current = false;
    };
  }, [isOpen, onClose, callbackUrl, chrbot_key, router]);

  // 통합된 소셜 로그인 처리 함수
  const handleSocialLogin = async (provider: OAuthProvider) => {
    try {
      setLoading(true);

      const result = await authService.socialLogin(provider, {
        onLoginTimeout: handleLoginTimeout,
      });

      if (!result.success && result.error) {
      }
    } catch (error) {
      console.error('소셜 로그인 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectedChatRoom = async (_chrbotKey: string) => {
    const { data: userInfo } = useAccountStore.getState();

    if (!userInfo || !_chrbotKey) {
      return;
    }

    const chrbotKey = _chrbotKey;
    const nsfw = '0';
    const freePen = Number(userInfo?.coin_free || 0) + Number(userInfo?.coin_register || 0);

    const encryptedData = await getChatRoomEncryptData(
      chrbotKey,
      userInfo?.coin_user?.toString() || '0',
      'KR',
      freePen?.toString() || '0',
      null,
      nsfw,
      userInfo?.persona || '',
      userInfo?.access_token || '',
      userInfo?.user_key?.toString() || '0'
    );

    const chatRoomPath = `${CHAT_FRONTEND_ADDRESS}?info=${encryptedData}`;
    router.push(chatRoomPath);
  };

  const handleDuplicateLoginConfirm = async () => {
    setIsDuplicateLogin(false);

    const duplicateLoginData = localStorage.getItem('duplicate_login_data');

    if (duplicateLoginData) {
      const duplicateLoginDataJson = JSON.parse(duplicateLoginData);
      const { snstype, snsauth, snsid, kr_gb, access_token } = duplicateLoginDataJson;
      const isSuccess = await useAccountStore
        .getState()
        .guestToSocialLogin(snstype, snsauth, snsid, kr_gb, access_token);

      localStorage.removeItem('duplicate_login_data');
      localStorage.removeItem('social_login_type');

      if (isSuccess) {
        await useAccountStore.getState().updateUserInfoFromUserInfo2();
        await useAccountStore.getState().fetchWriterInfo();

        const { data, logout } = useAccountStore.getState();
        if (data && data.user_block_type === 1) {
          toast.error('정지된 계정입니다.');
          logout();
        }

        onClose();

        return;
      }
    }

    onClose();
  };

  const handleDuplicateLoginCancel = () => {
    localStorage.removeItem('duplicate_login_data');
    setIsDuplicateLogin(false);
  };

  return (
    <>
      <BaseModal isOpen={isOpen && !showSignup} onClose={onClose} size='md'>
        <div className='flex flex-col pb-6'>
          <div className='flex flex-col justify-center items-center gap-4 mb-4 mt-6'>
            <div>
              <Image src='/images/logo.png' alt='logo' width={250} height={100} />
            </div>
            <div className='text-md text-gray-500'>함께 만드는 세계관 & 캐릭터</div>
          </div>
          <div className='mt-2'>
            <SpeechBubble text='3초만에 가입하고 30펜 받으세요!' position='center' />
          </div>

          <div className='space-y-4 my-4'>
            <button
              type='button'
              onClick={() => handleSocialLogin('GOOGLE')}
              disabled={loading}
              className='flex w-full h-12 items-center justify-start rounded-full bg-[#F2F2F2] px-[71px] font-medium text-white transition-colors'
            >
              <div className='flex items-center justify-center gap-4'>
                <span>
                  <Image src='/images/symbol/google.svg' alt='구글' width={20} height={20} />
                </span>
                <span className='text-[#1F1F1F]'>구글 계정으로 로그인</span>
              </div>
            </button>
            <button
              type='button'
              onClick={() => handleSocialLogin('KAKAO')}
              disabled={loading}
              className='flex w-full h-12 items-center justify-center rounded-full bg-[#FEE500] font-medium text-yellow-900 shadow transition-colors'
            >
              <div className='flex items-center justify-center gap-4'>
                <span>
                  <Image src='/images/social_logo/kakao.svg' alt='카카오' width={20} height={20} />
                </span>
                <span className='text-[#000000D9]'>카카오 계정으로 로그인</span>
              </div>
            </button>
            <button
              type='button'
              onClick={() => handleSocialLogin('APPLE')}
              disabled={loading}
              className='flex w-full h-12 items-center justify-start rounded-full px-[71px] bg-black font-medium text-white shadow transition-colors'
            >
              <div className='flex items-center justify-center gap-4'>
                <span>
                  <Image src='/images/social_logo/apple.png' alt='애플' width={20} height={20} />
                </span>
                <span>애플 계정으로 로그인</span>
              </div>
            </button>

            <button
              type='button'
              onClick={() => handleSocialLogin('NAVER')}
              disabled={loading}
              className='flex w-full h-12 items-center justify-center rounded-full bg-[#03C75A] py-1 font-medium text-white shadow transition-colors'
            >
              <div className='flex items-center justify-center gap-4'>
                <span>
                  <Image src='/images/symbol/naver.svg' alt='네이버' width={20} height={20} />
                </span>
                <span>네이버 계정으로 로그인</span>
              </div>
            </button>
          </div>

          <div className='text-center text-sm text-gray-500 dark:text-gray-400 mt-6 px-4'>
            <p>계속 진행하면 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.</p>
          </div>
        </div>
      </BaseModal>

      {isDuplicateLogin && (
        <DuplicateLoginModal
          isOpen={true}
          onClose={() => setIsDuplicateLogin(false)}
          onConfirm={handleDuplicateLoginConfirm}
          onCancel={handleDuplicateLoginCancel}
        />
      )}
    </>
  );
}
