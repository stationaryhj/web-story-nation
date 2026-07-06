'use client';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import GuestLoginForm from '@/components/form/GuestLoginForm';
import { getChatRoomEncryptData, getPlatform } from '@/lib/utils/storyNationUtil';
import { authService } from '@/services/auth';
import { SocialLoginProvider } from '@/services/auth/types';
import { CENTER_FADE_EXPAND_ANIMATION } from '@/shared/config/animations';
import useModalStore from '@/shared/model/stores/useModalStore';
import Modal from '@/shared/ui/modal/base/Modal';
import { useAccountStore } from '@/store/useAccountStore';

// 소셜 로그인 버튼 설정
const SOCIAL_LOGIN_BUTTONS: {
  provider: SocialLoginProvider;
  icon: string;
  alt: string;
  label: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    provider: 'GOOGLE',
    icon: '/images/symbol/google.svg',
    alt: '구글',
    label: '구글 계정으로 로그인',
    bgColor: 'bg-[#F2F2F2]',
    textColor: 'text-[#1F1F1F]',
  },
  {
    provider: 'KAKAO',
    icon: '/images/social_logo/kakao.svg',
    alt: '카카오',
    label: '카카오 계정으로 로그인',
    bgColor: 'bg-[#FEE500]',
    textColor: 'text-[#000000D9]',
  },
  {
    provider: 'APPLE',
    icon: '/images/social_logo/apple.png',
    alt: '애플',
    label: '애플 계정으로 로그인',
    bgColor: 'bg-black',
    textColor: 'text-white',
  },
  {
    provider: 'NAVER',
    icon: '/images/symbol/naver.svg',
    alt: '네이버',
    label: '네이버 계정으로 로그인',
    bgColor: 'bg-[#03C75A]',
    textColor: 'text-white',
  },
];

const CHAT_FRONTEND_ADDRESS = process.env.NEXT_PUBLIC_CHAT_FRONTEND_ADDRESS;

const SocialLoginModal = ({ chrbot_key }: { chrbot_key?: string | null }) => {
  const router = useRouter();
  const { closeModal, openModal, closeModalByType, closeAllModals } = useModalStore();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showSignup, setShowSignup] = useState(false);
  const [isDuplicateLogin, setIsDuplicateLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNewUserMode, setIsNewUserMode] = useState(false);

  // 이벤트 처리 중인지 추적하는 ref (중복 메시지 처리 방지)
  const processingCallback = useRef(false);

  // 모달이 열리면 authService 초기화
  useEffect(() => {
    authService.init().catch((err) => {
      console.error('인증 서비스 초기화 오류:', err);
    });
  }, []);

  // 로그인 타임아웃 핸들러
  const handleLoginTimeout = useCallback(() => {
    setLoading(false);

    // 타임아웃 관련 데이터 정리
    const timeoutId = localStorage.getItem('naver_login_timeout');
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      localStorage.removeItem('naver_login_timeout');
    }
    // localStorage.removeItem('social_login_state')
    localStorage.removeItem('social_login_type');

    // 콜백 처리 상태 초기화
    processingCallback.current = false;
  }, []);

  // 소셜 로그인 콜백 메시지 처리 함수
  useEffect(() => {
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
          console.log('@@ callbackParams :: ', callbackParams);
          // authService.handleCallback 호출
          const result = await authService.handleCallback(callbackParams);
          console.log('@@@@@@@ result :: ', result);

          if (result.success) {
            // 로그인 성공 시 상태 업데이트 (useAccountStore)
            if (result.data) {
              // 게스트→유저 전환인지 확인 (띠배너 표시 여부 결정)
              const { loginType: prevLoginType } = useAccountStore.getState();
              const isGuestToUserConversion =
                prevLoginType === ('Guest' as SocialLoginProvider) && chrbot_key;

              useAccountStore.getState().setLoginState(true, result.data, loginType);
              await useAccountStore.getState().updateUserInfoFromUserInfo2();
              await useAccountStore.getState().fetchWriterInfo();

              const { data, logout } = useAccountStore.getState();
              if (data && data.user_block_type === 1) {
                toast.error('정지된 계정입니다.');
                logout();
                closeModal();
                return;
              }

              // 성공 시에만 모달 닫기
              closeModal();

              // 게스트→유저 전환 시에만 띠배너 표시
              if (isGuestToUserConversion) {
                openModal({ type: 'redirectBanner', props: { charboyKey: chrbot_key } });
              }
            }
          } else if (result.signupRequired || result.needSignup) {
            openModal({
              type: 'signup',
              props: { onSuccess: handleSignupSuccess, chrbot_key },
            });

            // const { isLogin, data, loginType, registerWithSocialData } = useAccountStore.getState()
            // if(isLogin && data && loginType === 'Guest' as SocialLoginProvider) {
            //   const nickname = data.nick_nm
            //   const response = await contentApi.NicknmCheckToGuest(nickname, data.access_token)
            //   if(response.data.result.err === 0) {
            //     await registerWithSocialData(nickname, '19700101', true, () => {
            //       localStorage.removeItem('social_login_type')
            //       onClose()
            //     })
            //   }
            // }
            // else {
            //   // 회원가입 필요 - 모달 닫지 않고 회원가입 모달로 전환
            //   setShowSignup(true)
            // }
          } else if (result.isDuplicateLogin) {
            openModal({
              type: 'confirm',
              props: {
                title: '기존에 가입된 계정이 있습니다. 그대로 로그인하시겠습니까?',
                description:
                  '기존 계정으로 로그인할 경우 지금까지 대화한 내용은 저장되지 않습니다.',
                confirmText: '로그인',
                cancelText: '취소',
                onConfirm: handleDuplicateLoginConfirm,
                onCancel: handleDuplicateLoginCancel,
              },
            });
          } else {
            // 기타 오류
            // toast.error(result.error || '로그인에 실패했습니다.')
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
  }, [openModal, closeModal]);

  const { guestLogin } = useAccountStore();

  // 통합된 소셜 로그인 처리 함수
  const handleSocialLogin = async (provider: SocialLoginProvider) => {
    try {
      setLoading(true);

      const result = await authService.socialLogin(provider, {
        onLoginTimeout: handleLoginTimeout,
      });

      if (!result.success && result.error) {
        // toast.error(result.error)
      }
    } catch (error) {
      console.error('소셜 로그인 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async (nickname: string) => {
    try {
      setLoading(true);
      const isSuccess = await guestLogin(nickname);
      if (isSuccess) {
        closeModal();

        if (chrbot_key) {
          handleConnectedChatRoom(chrbot_key);
          return;
        }

        router.push('/');
      }
    } catch (err) {
      console.error('게스트 로그인 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 성공 시 - SocialLoginModal만 닫고 SignupModal은 보상 화면으로 전환됨
  // 띠배너는 SignupModal에서 "확인" 버튼 클릭 시 열림
  const handleSignupSuccess = () => {
    console.log('[SocialLoginModal] 회원가입 성공! - handleSignupSuccess 호출됨');

    // 임시 저장 데이터 정리
    localStorage.removeItem('social_login_type');

    // loginType 최종 변경
    const { data } = useAccountStore.getState();
    const login_sns_state = localStorage.getItem('social_login_state') || '';
    const loginType = getPlatform(JSON.parse(login_sns_state)?.snstype || 0) || '';
    useAccountStore.getState().setLoginState(true, null, loginType);

    console.log('[SocialLoginModal] 회원가입 완료 - loginType:', loginType, 'userData:', data);

    // SocialLoginModal만 닫기 (SignupModal은 isCompleted=true가 되어 보상 화면 표시)
    closeModalByType('socialLogin');
  };

  const handleNewUserClick = () => {
    setIsNewUserMode(true);
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
    // router.push(`https://qa.storynation.co.kr/character/chat?info=${encryptedData}`)
  };

  // 소셜 로그인 이어서하기 //
  const handleDuplicateLoginConfirm = async () => {
    setIsDuplicateLogin(false);

    // 로그인 이어서 진행 //
    const duplicateLoginData = localStorage.getItem('duplicate_login_data');
    console.log('@@ duplicateLoginData :: ', duplicateLoginData);

    if (duplicateLoginData) {
      const duplicateLoginDataJson = JSON.parse(duplicateLoginData);
      const { snstype, snsauth, snsid, kr_gb, access_token } = duplicateLoginDataJson;
      console.log('@@ snstype :: ', snstype);
      console.log('@@ snsauth :: ', snsauth);
      console.log('@@ snsid :: ', snsid);
      console.log('@@ kr_gb :: ', kr_gb);
      console.log('@@ access_token :: ', access_token);
      const isSuccess = await useAccountStore
        .getState()
        .guestToSocialLogin(snstype, snsauth, snsid, kr_gb, access_token);

      localStorage.removeItem('duplicate_login_data');
      localStorage.removeItem('social_login_type');

      if (isSuccess) {
        console.log('[SocialLoginModal] 기존 유저 연동 성공! - guestToSocialLogin 완료');
        closeAllModals();

        // 띠배너 모달 팝업 (chrbot_key가 있을 경우)
        if (chrbot_key) {
          openModal({ type: 'redirectBanner', props: { charboyKey: chrbot_key } });
        }

        await useAccountStore.getState().updateUserInfoFromUserInfo2();
        await useAccountStore.getState().fetchWriterInfo();

        const { data, logout } = useAccountStore.getState();
        console.log('[SocialLoginModal] 기존 유저 연동 완료 - userData:', data);

        if (data && data.user_block_type === 1) {
          toast.error('정지된 계정입니다.');
          logout();
          closeModalByType('redirectBanner');
        }

        return;
      }
    }

    // 실패 시 confirm 모달만 닫기
    closeModalByType('confirm');
  };

  const handleDuplicateLoginCancel = () => {
    localStorage.removeItem('duplicate_login_data');
    closeModalByType('confirm');
  };

  return (
    <Modal>
      <Modal.Backdrop />
      <Modal.Content
        {...CENTER_FADE_EXPAND_ANIMATION}
        className='w-[calc(100%-32px)] max-w-[400px] px-6 pb-[27px] pt-20'
      >
        <Modal.Close
          className='absolute right-6 top-5 z-10 flex-shrink-0'
          onClick={() => closeModalByType('socialLogin')}
        >
          <FontAwesomeIcon icon={faTimes} size='lg' className='h-6 w-6 text-text-muted' />
        </Modal.Close>
        <div className='mx-auto flex w-full max-w-[320px] flex-col items-start gap-y-[100px]'>
          <div className='flex w-full flex-col items-center justify-center gap-y-3'>
            <Image src='/images/logo.png' alt='logo' width={220} height={100} />
            <div className='text-sm font-medium text-text-primary'>함께 만드는 세계관 & 캐릭터</div>
          </div>

          <div className='relative w-full'>
            <div className='absolute bottom-[calc(100%+16px)] left-1/2 w-[183px] -translate-x-1/2 rounded-[10px] py-3 shadow-[0_2px_7px_1px_rgba(0,0,0,0.15)]'>
              <p className='font-regular text-center text-[13px] text-brand'>
                3초만에 가입하면 30펜 지급!
              </p>
              <div
                className={`absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-surface-elevated`}
              />
            </div>
            <div className='w-full space-y-1.5'>
              {SOCIAL_LOGIN_BUTTONS.map((button) => (
                <button
                  key={button.provider}
                  type='button'
                  onClick={() => handleSocialLogin(button.provider)}
                  disabled={loading}
                  className={`flex h-11 w-full items-center justify-center gap-4 rounded-full px-6 font-medium transition-colors ${button.bgColor}`}
                >
                  <Image src={button.icon} alt={button.alt} width={20} height={20} />
                  <span className={`text-[15px] ${button.textColor}`}>{button.label}</span>
                </button>
              ))}
            </div>
            <div className='font-regular mt-5 text-left text-xs text-text-muted'>
              <p className='whitespace-pre-wrap text-center'>{`계속 진행하면 이용약관 및 개인정보 처리방침에\n동의하는 것으로 간주됩니다.`}</p>
            </div>
          </div>

          {/* <div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white dark:bg-dark-background text-gray-500">
								또는
							</span>
						</div>
					</div> */}

          {/*     <GuestLoginForm onSubmit={handleGuestLogin} disabled={loading} /> */}
          {/* 신규 가입 모드일 때만 약관 동의 문구 표시 */}
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default SocialLoginModal;
