"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import BaseModal from "./BaseModal";
import SignupModal from "./SignupModal";
import { useAccountStore } from "@/store/useAccountStore";
import { OAuthProvider } from "@/types/login";
import GuestLoginForm from "@/components/form/GuestLoginForm";
import { toast } from "react-toastify";
import { authService } from "@/services/auth";
import { SpeechBubble } from "@/components/animation/SpeechBubble";
import Image from "next/image";
import { getChatRoomEncryptData } from "@/lib/utils/storyNationUtil";

import DuplicateLoginModal from "./duplicateLoginModal";
import { getPlatform } from "@/lib/utils/storyNationUtil";

const CHAT_FRONTEND_ADDRESS = process.env.NEXT_PUBLIC_CHAT_FRONTEND_ADDRESS;

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	chrbot_key?: string | null;
}

export default function LoginModal({
	isOpen,
	onClose,
	chrbot_key,
}: LoginModalProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
	const [showSignup, setShowSignup] = useState(false);
	const [isDuplicateLogin, setIsDuplicateLogin] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isNewUserMode, setIsNewUserMode] = useState(false);
	const [isReward, setIsReward] = useState(false);
	// 이벤트 처리 중인지 추적하는 ref (중복 메시지 처리 방지)
	const processingCallback = useRef(false);

	// 모달이 열리면 authService 초기화
	useEffect(() => {
		if (isOpen) {
			authService.init().catch((err) => {
				console.error("인증 서비스 초기화 오류:", err);
			});
		}
	}, [isOpen]);

	// 로그인 타임아웃 핸들러
	const handleLoginTimeout = useCallback(() => {
		setLoading(false);

		// 타임아웃 관련 데이터 정리
		const timeoutId = localStorage.getItem("naver_login_timeout");
		if (timeoutId) {
			clearTimeout(parseInt(timeoutId));
			localStorage.removeItem("naver_login_timeout");
		}
		// localStorage.removeItem('social_login_state')
		localStorage.removeItem("social_login_type");

		// 콜백 처리 상태 초기화
		processingCallback.current = false;
	}, []);

	// 소셜 로그인 콜백 메시지 처리 함수
	useEffect(() => {
		if (!isOpen) return;

		const handleCallbackMessage = async (event: MessageEvent) => {
			console.log("@@ handleCallbackMessage :: ", event);

			// 출처 확인 (보안)
			if (event.origin !== window.location.origin) {
				console.warn("알 수 없는 출처의 메시지 무시됨:", event.origin);
				return;
			}

			// 메시지 데이터 확인
			let loginType = null;
			const data = event.data;
			if (!data || typeof data !== "object") return;

			console.log("로그인 콜백 메시지 수신:", data);

			// 소셜 로그인 데이터 확인
			if (data.code || data.error) {
				// 이미 처리 중인 경우 중복 처리 방지
				if (processingCallback.current) {
					console.log("이미 콜백을 처리 중입니다. 중복 처리 방지");
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
					const timeoutId = localStorage.getItem("naver_login_timeout");
					if (timeoutId) {
						clearTimeout(parseInt(timeoutId));
						localStorage.removeItem("naver_login_timeout");
					}

					// 콜백 파라미터 준비
					const callbackParams = {
						code: data.code,
						state: data.state,
					};

					// id_token이 있는 경우 (Apple 로그인) 추가
					if (data.id_token) {
						console.log("id_token 감지됨 (Apple 로그인)");
						Object.assign(callbackParams, { id_token: data.id_token });
					}

					// authService.handleCallback 호출
					const result = await authService.handleCallback(callbackParams);
					console.log("@@@@@@@ result :: ", result);

					if (result.success) {
						// 로그인 성공 시 상태 업데이트 (useAccountStore)
						if (result.data) {
							useAccountStore
								.getState()
								.setLoginState(true, result.data, loginType);
							await useAccountStore.getState().updateUserInfoFromUserInfo2();
							await useAccountStore.getState().fetchWriterInfo();

							const { data, logout } = useAccountStore.getState();
							if (data && data.user_block_type === 1) {
								toast.error("정지된 계정입니다.");
								logout();
								onClose();
								return;
							}

							// 성공 시에만 모달 닫기
							onClose();

							if (chrbot_key) {
								handleConnectedChatRoom(chrbot_key);
							}
						}
					} else if (result.signupRequired || result.needSignup) {
						setShowSignup(true);

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
						setIsDuplicateLogin(true);
					} else {
						// 기타 오류
						// toast.error(result.error || '로그인에 실패했습니다.')
					}
				} catch (error) {
					console.error("콜백 처리 중 오류 발생:", error);
				} finally {
					setLoading(false);
					// 처리 완료 후 상태 초기화
					processingCallback.current = false;
				}
			}
		};

		// 이벤트 리스너 등록
		window.addEventListener("message", handleCallbackMessage);

		// cleanup 함수
		return () => {
			window.removeEventListener("message", handleCallbackMessage);
			// 모달이 닫힐 때 처리 상태 초기화
			processingCallback.current = false;
		};
	}, [isOpen, onClose]);

	const handleSignupClick = () => {
		setShowSignup(true);
	};

	const handleSignupClose = () => {
		setShowSignup(false);
		onClose();

		const { isLogin } = useAccountStore.getState();

		console.log("@@ signup close :: ", isLogin);

		if (isLogin) {
			if (chrbot_key) {
				handleConnectedChatRoom(chrbot_key);
			}
		}
	};

	const { guestLogin } = useAccountStore();

	// 통합된 소셜 로그인 처리 함수
	const handleSocialLogin = async (provider: OAuthProvider) => {
		try {
			setLoading(true);

			const result = await authService.socialLogin(provider, {
				onLoginTimeout: handleLoginTimeout,
			});

			if (!result.success && result.error) {
				// toast.error(result.error)
			}
		} catch (error) {
			console.error("소셜 로그인 오류:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleGuestLogin = async (nickname: string) => {
		try {
			setLoading(true);
			let isSuccess = await guestLogin(nickname);
			if (isSuccess) {
				onClose();

				if (chrbot_key) {
					handleConnectedChatRoom(chrbot_key);
					return;
				}

				router.push("/");
			}
		} catch (err) {
			console.error("게스트 로그인 오류:", err);
		} finally {
			setLoading(false);
		}
	};

	// 회원가입 성공 시 모달 닫기
	const handleSignupSuccess = () => {
		// 임시 저장 데이터 정리
		// localStorage.removeItem('social_login_state')
		localStorage.removeItem("social_login_type");
		setIsReward(true);

		// loginType 최종 변경 //
		const { data } = useAccountStore.getState();
		const login_sns_state = localStorage.getItem("social_login_state") || "";
		const loginType =
			getPlatform(JSON.parse(login_sns_state)?.snstype || 0) || "";
		useAccountStore.getState().setLoginState(true, null, loginType);

		// setShowSignup(false)
		// onClose()
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
		const nsfw = "0";
		const freePen =
			Number(userInfo?.coin_free || 0) + Number(userInfo?.coin_register || 0);

		const encryptedData = await getChatRoomEncryptData(
			chrbotKey,
			userInfo?.coin_user?.toString() || "0",
			"KR",
			freePen?.toString() || "0",
			null,
			nsfw,
			userInfo?.persona || "",
			userInfo?.access_token || "",
			userInfo?.user_key?.toString() || "0",
		);

		const chatRoomPath = `${CHAT_FRONTEND_ADDRESS}?info=${encryptedData}`;
		router.push(chatRoomPath);
		// router.push(`https://qa.storynation.co.kr/character/chat?info=${encryptedData}`)
	};

	// 소셜 로그인 이어서하기 //
	const handleDuplicateLoginConfirm = async () => {
		setIsDuplicateLogin(false);

		// 로그인 이어서 진행 //
		const duplicateLoginData = localStorage.getItem("duplicate_login_data");
		console.log("@@ duplicateLoginData :: ", duplicateLoginData);

		if (duplicateLoginData) {
			const duplicateLoginDataJson = JSON.parse(duplicateLoginData);
			const { snstype, snsauth, snsid, kr_gb, access_token } =
				duplicateLoginDataJson;
			const isSuccess = await useAccountStore
				.getState()
				.guestToSocialLogin(snstype, snsauth, snsid, kr_gb, access_token);

			localStorage.removeItem("duplicate_login_data");
			localStorage.removeItem("social_login_type");

			if (isSuccess) {
				await useAccountStore.getState().updateUserInfoFromUserInfo2();
				await useAccountStore.getState().fetchWriterInfo();

				const { data, logout } = useAccountStore.getState();
				if (data && data.user_block_type === 1) {
					toast.error("정지된 계정입니다.");
					logout();
				}

				onClose();
				return;
			}
		}

		// login2 -> updateUserInfoFromUserInfo2() -> fetchWriterInfo

		onClose();
	};

	const handleDuplicateLoginCancel = () => {
		localStorage.removeItem("duplicate_login_data");
		setIsDuplicateLogin(false);
	};

	return (
		<>
			{/* 로그인 모달 - 회원가입 모달이 표시 중일 때 숨김 */}
			<BaseModal isOpen={isOpen && !showSignup} onClose={onClose} size="md">
				<div className="flex flex-col pb-6">
					{/* 신규 가입 모드일 때만 보여줄 헤더 */}

					<div className="flex flex-col justify-center items-center gap-4 mb-4 mt-6">
						<div>
							<Image
								src="/images/logo.png"
								alt="logo"
								width={250}
								height={100}
							/>
						</div>
						<div className="text-md text-gray-500">
							함께 만드는 세계관 & 캐릭터
						</div>
					</div>
					<div className="mt-2">
						<SpeechBubble
							text="3초만에 가입하고 30펜 받으세요!"
							position="center"
						/>
					</div>

					<div className="space-y-4 my-4">
						<button
							type="button"
							onClick={() => handleSocialLogin("GOOGLE")}
							disabled={loading}
							className="flex w-full h-12 items-center justify-start rounded-full bg-[#F2F2F2] px-[71px] font-medium text-white transition-colors"
						>
							<div className="flex items-center justify-center gap-4">
								<span>
									<Image
										src="/images/symbol/google.svg"
										alt="구글"
										width={20}
										height={20}
									/>
								</span>
								<span className="text-[#1F1F1F]">구글 계정으로 로그인</span>
							</div>
						</button>
						<button
							type="button"
							onClick={() => handleSocialLogin("KAKAO")}
							disabled={loading}
							className="flex w-full h-12 items-center justify-center rounded-full bg-[#FEE500] font-medium text-yellow-900 shadow transition-colors"
						>
							<div className="flex items-center justify-center gap-4">
								<span>
									<Image
										src="/images/social_logo/kakao.svg"
										alt="카카오"
										width={20}
										height={20}
									/>
								</span>
								<span className="text-[#000000D9]">카카오 계정으로 로그인</span>
							</div>
						</button>
						<button
							type="button"
							onClick={() => handleSocialLogin("APPLE")}
							disabled={loading}
							className="flex w-full h-12 items-center justify-start rounded-full px-[71px] bg-black font-medium text-white shadow transition-colors"
						>
							<div className="flex items-center justify-center gap-4">
								<span>
									<Image
										src="/images/social_logo/apple.png"
										alt="애플"
										width={20}
										height={20}
									/>
								</span>
								<span>애플 계정으로 로그인</span>
							</div>
						</button>

						<button
							type="button"
							onClick={() => handleSocialLogin("NAVER")}
							disabled={loading}
							className="flex w-full h-12 items-center justify-center rounded-full bg-[#03C75A] py-1 font-medium text-white shadow transition-colors"
						>
							<div className="flex items-center justify-center gap-4">
								<span>
									<Image
										src="/images/symbol/naver.svg"
										alt="네이버"
										width={20}
										height={20}
									/>
								</span>
								<span>네이버 계정으로 로그인</span>
							</div>
						</button>
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

					<GuestLoginForm onSubmit={handleGuestLogin} disabled={loading} />
					{/* 신규 가입 모드일 때만 약관 동의 문구 표시 */}

					<div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 px-4">
						<p>
							계속 진행하면 이용약관 및 개인정보 처리방침에 동의하는 것으로
							간주됩니다.
						</p>
					</div>
				</div>
			</BaseModal>

			{/* 회원가입 모달 - isOpen 조건만 체크하여 로그인 모달과 독립적으로 표시 */}
			{showSignup && (
				<SignupModal
					isOpen={isOpen}
					onClose={handleSignupClose}
					onSuccess={handleSignupSuccess}
					state={isReward ? "reward" : "signup"}
				/>
			)}

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
