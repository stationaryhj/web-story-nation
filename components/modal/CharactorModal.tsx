'use client';

import {
  faComment,
  faHeart,
  faImage,
  faMessage,
  faPlus,
  faShieldHalved,
  faTimes,
  faUser,
  faUserEdit,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Siren } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  bridgeCharbotDataToCharacter,
  exampleDatas,
  getChangeNameTag,
  getChatRoomEncryptData,
  getImageUri,
  parseConversationExamples,
  rijndaelEncrypt,
} from '@/lib/utils/storyNationUtil';
import { contentApi, createApi } from '@/services/api/storyNationApi';
import { ReqGetChatBot } from '@/services/hooks/DataListManager';
import useNewModalStore from '@/shared/model/stores/useModalStore';
import { Character, useAccountStore } from '@/store/useStoreData';
import { useModalStore } from '@/store/useStoreModal';
import { CharbotLikeResponse } from '@/types/api';
import BaseModal from './BaseModal';
import ReportModal from './ReportModal';

const PI_ADDRESS = process.env.NEXT_PUBLIC_PI_ADDRESS;
const CHAT_FRONTEND_ADDRESS = process.env.NEXT_PUBLIC_CHAT_FRONTEND_ADDRESS;
const CHAT_SERVER_ADDRESS = process.env.NEXT_PUBLIC_CHAT_SERVER_ADDRESS;
const CHAT_SERVER_PORT = process.env.NEXT_PUBLIC_CHAT_SERVER_PORT;

interface ExampleData {
  title: string;
  User: string;
  Character: string;
}

// 목업 데이터
const mockFirstMessage = {
  situation: '캐릭터의 첫 메세지가 도착했습니다.',
  message:
    '안녕하세요. 저는 도시의 수호자입니다. 이 도시에서 일어나는 모든 사건을 조사하고 있죠. 당신과 함께 이 도시의 비밀을 파헤치고 싶습니다.',
};

interface CharactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CharactorModal({ isOpen, onClose }: CharactorModalProps) {
  const router = useRouter();
  const { selectedCharacter, setSelectedCharacter, openModal, modalProps } = useModalStore();
  const { openModal: openNewModal } = useNewModalStore();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { isLogin, isAdult, data: userInfo, writerInfo } = useAccountStore();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const isMobile = window.innerWidth < 768;
  const variant = modalProps?.variant || 'default';

  const {
    data: chatBotData,
    isLoading: chatBotLoading,
    error: chatBotError,
    refetch,
  } = ReqGetChatBot(Number(selectedCharacter?.id));

  const exampleDatas = chatBotData?.chrbot?.example
    ? parseConversationExamples(chatBotData.chrbot.example)
    : [];
  const isExampleShow =
    chatBotData?.chrbot?.example_show_yn === 1 && exampleDatas.length > 0 ? 1 : 0;

  const __content =
    chatBotData?.chrbot?.content_show_yn === 2
      ? chatBotData?.chrbot?.content_public || ''
      : chatBotData?.chrbot?.content || '';
  const content = getChangeNameTag(__content, selectedCharacter?.name || '');
  const isContentShow = (chatBotData?.chrbot?.content_show_yn || 0) > 0 && content !== '' ? 1 : 0;

  useEffect(() => {
    if (chatBotData) {
      setSelectedCharacter(bridgeCharbotDataToCharacter(chatBotData?.chrbot) as Character);
    }
  }, [chatBotData]);

  // 모달 열릴 때 이미지 미리 로딩
  useEffect(() => {
    if (selectedCharacter && selectedCharacter?.imageUrl) {
      const img = new window.Image();
      img.src = selectedCharacter?.imageUrl;
      img.onload = () => setIsImageLoaded(true);
    }
  }, [selectedCharacter]);

  // 모달이 닫힐 때 선택된 캐릭터 초기화
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSelectedCharacter(null);
      setIsImageLoaded(false);
    }, 300);
  };

  // 대화 시작 버튼 클릭 시 채팅 페이지로 이동
  const handleStartChat = async () => {
    if (selectedCharacter && selectedCharacter.id) {
      if (!isLogin) {
        openNewModal({ type: 'socialLogin' });
        handleClose();
        return;
      }

      if (!isAdult() && selectedCharacter.isAdult) {
        openModal('adultVerification');
        return;
      }

      handleClose();
      const chatId = String(selectedCharacter.id).trim();
      const response = await createApi.GetChatBot(Number(chatId));

      if (response.data.result.err == 0) {
        if (response.data.chrbot.block_type !== 0) {
          toast.error('정책 위반 사항이 포함되어 비공개된 캐릭터입니다.');
          return;
        }
        if (response.data.chrbot.delete_yn !== 0) {
          toast.error('삭제된 캐릭터입니다.');
          return;
        }

        const chrbotKey = response.data.chrbot.world_list_detail_chrbot_key.toString();
        const nsfw = response.data.chrbot.nsfw.toString() || '0';
        const freePen = Number(userInfo?.coin_free || 0) + Number(userInfo?.coin_register || 0);

        const encryptedData = await getChatRoomEncryptData(
          chrbotKey,
          userInfo?.coin_user?.toString() || '0',
          'KR',
          freePen.toString() || '0',
          null,
          nsfw,
          userInfo?.persona || '',
          userInfo?.access_token || '',
          userInfo?.user_key?.toString() || '0'
        );

        const chatRoomPath = `${CHAT_FRONTEND_ADDRESS}?info=${encryptedData}`;
        router.push(chatRoomPath);

        // if (chatId) {
        //   router.push(`/chat/${chatId}`)
        // }
      }
    }
  };

  const handleLike = async () => {
    const response = await contentApi.CharBotLike(Number(selectedCharacter?.id));
    const responseData = response.data as CharbotLikeResponse;
    if (responseData.result.err === 0) {
      refetch();
    }
  };

  const handleReport = () => {
    if (!isLogin) {
      openNewModal({ type: 'socialLogin' });
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reason: number | null, description: string) => {
    try {
      // 여기에 실제 신고 API 호출 로직 구현
      const response = await contentApi.ReportChatBot(
        10,
        Number(selectedCharacter?.id),
        reason || 0,
        description,
        'KR'
      );
      const responseData = response.data;

      if (responseData.result.err === 0) {
        toast.success('신고가 접수되었습니다.');
      }

      // 성공 시 상태 업데이트
      setReportSubmitted(true);
      // 신고 모달 닫기 (또는 유지할 수도 있음)
      setTimeout(() => {
        setIsReportModalOpen(false);
        // 일정 시간 후 submitted 상태 초기화
        setTimeout(() => setReportSubmitted(false), 500);
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleCreateCharacter = async () => {
    router.push(`/my-characters/edit/${selectedCharacter?.id}`);
    onClose();
  };

  const handleSelectCreator = () => {
    router.push(`/author/${selectedCharacter?.creator.nickname}`);
    onClose();
  };

  const handleOpenGallery = () => {
    console.log('handleOpenGallery');
    // onClose()
    // openModal('charactorgallery')
  };

  if (!selectedCharacter) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size='full'
      className='mx-auto w-full'
      showCloseButton={false}
      hideHeader={true}
      bodyClassName='p-0 max-h-[90vh] overflow-hidden'
    >
      {/* 모달 헤더 */}
      <div className='sticky top-0 z-[102] bg-white dark:bg-dark-background-light border-b border-secondary-100 dark:border-dark-secondary-800'>
        <div className='flex items-center justify-between py-4 px-4'>
          <h1 className='text-md md:text-xl font-bold text-secondary-900 dark:text-dark-secondary-100'>
            {selectedCharacter.subject || selectedCharacter.name}
          </h1>
          <div className='flex items-center gap-2'>
            {variant === 'default' ? (
              <button
                onClick={handleReport}
                className='w-7 h-7 md:w-9 md:h-9 rounded-full bg-secondary-100 dark:bg-dark-secondary-800 text-secondary-500 dark:text-dark-secondary-400 hover:bg-secondary-200 dark:hover:bg-dark-secondary-700 transition-colors flex items-center justify-center'
              >
                <Siren className='h-4 w-4 md:h-6 md:w-6' />
              </button>
            ) : (
              <button
                onClick={handleCreateCharacter}
                className='w-7 h-7 md:w-9 md:h-9 rounded-full bg-secondary-100 dark:bg-dark-secondary-800 text-secondary-500 dark:text-dark-secondary-400 hover:bg-secondary-200 dark:hover:bg-dark-secondary-700 transition-colors flex items-center justify-center'
              >
                <FontAwesomeIcon icon={faUserEdit} className='h-4 w-4 md:h-6 md:w-6' />
              </button>
            )}
            <div>
              <button
                onClick={handleClose}
                className='w-7 h-7 md:w-9 md:h-9 rounded-full bg-secondary-100 dark:bg-dark-secondary-800 text-secondary-500 dark:text-dark-secondary-400 hover:bg-secondary-200 dark:hover:bg-dark-secondary-700 transition-colors flex items-center justify-center'
              >
                <FontAwesomeIcon icon={faTimes} className='h-4 w-4 md:h-6 md:w-6' />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col md:flex-row h-[calc(90vh-88px)] overflow-hidden'>
        {/* PC 레이아웃 */}
        <div className='hidden md:block md:w-[40%] p-5 h-full overflow-y-auto'>
          <div className='flex flex-col items-start'>
            {/* 이미지 영역 */}
            <div className='relative mb-6 w-full flex items-center justify-center'>
              {selectedCharacter.imageUrl && (
                <>
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-secondary-100 dark:bg-dark-secondary-800 transition-opacity duration-300 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <div className='w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin'></div>
                  </div>

                  {/* PC 이미지 컨테이너 */}
                  <div
                    id='image_container'
                    className='w-full aspect-[3/4] relative rounded-xl overflow-hidden flex items-center justify-center bg-secondary-50 dark:bg-dark-secondary-900/30'
                  >
                    <div className='relative w-full h-full'>
                      <Image
                        src={selectedCharacter.imageUrl}
                        alt={selectedCharacter.name || '캐릭터 이미지'}
                        priority
                        fill
                        className='transition-opacity duration-300 z-10 opacity-100 drop-shadow-md rounded-xl'
                        onLoadingComplete={() => setIsImageLoaded(true)}
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center center',
                        }}
                      />

                      {/* 19세 이상 뱃지 - 이미지에 직접 배치 */}
                      {selectedCharacter.isAdult && (
                        <div
                          className='absolute z-30 flex items-center'
                          style={{ top: '15px', right: '15px' }}
                        >
                          <Image
                            src='/images/flames.png'
                            alt='성인인증'
                            width={27.7}
                            height={35.3}
                          />
                        </div>
                      )}

                      {/* 갤러리 버튼 */}
                      <div className='absolute bottom-2 left-2 flex items-center justify-center gap-4 z-30'>
                        {selectedCharacter.multi_image_count > 0 && (
                          <button
                            onClick={handleOpenGallery}
                            className='text-white text-xs px-2 py-1 rounded-full bg-gray-500/50'
                          >
                            <div className='flex items-center justify-center gap-2'>
                              <FontAwesomeIcon
                                icon={faImage}
                                className='text-[14px] md:text-[20px]'
                              />
                              <span className='text-[14px] md:text-[20px]'>
                                {selectedCharacter.multi_image_count || 0}
                              </span>
                            </div>
                          </button>
                        )}

                        {/* Level */}
                        {selectedCharacter.likeability_yn === 1 && (
                          <div className='flex items-center justify-center gap-2 text-white text-xs px-2 py-1 rounded-full bg-gray-500/50'>
                            <Image
                              src='/images/icons/like_icon_white.png'
                              alt='레벨 아이콘'
                              width={isMobile ? 14 : 20}
                              height={isMobile ? 14 : 20}
                              className='p-0 m-0'
                            />
                            <span className='text-[14px] md:text-[20px]'>
                              Lv.{selectedCharacter.likeability_max_lv || 0}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* 좋아요 & 댓글 수 */}
            {/* <div className="flex justify-end items-end w-full mb-6 gap-6">
              <div
                className="flex items-center space-x-2 cursor-pointer transition-colors hover:text-red-600"
                onClick={handleLike}
              >
                <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-red-500" />
                <span className="text-secondary-700 dark:text-dark-secondary-300">
                  {selectedCharacter.likeCount || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faMessage} className="h-5 w-5 text-primary-500" />
                <span className="text-secondary-700 dark:text-dark-secondary-300">
                  {selectedCharacter.commentCount || 0}
                </span>
              </div>
            </div> */}

            <div className='flex justify-between items-center w-full mb-6'>
              {/* 작가 이름 (왼쪽) */}
              <div className='flex items-center cursor-pointer' onClick={handleSelectCreator}>
                {/* 작가 섬네일 */}
                <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mr-2'>
                  <Image
                    src={getImageUri(selectedCharacter.creator.profileImageUrl)}
                    alt={selectedCharacter.creator.nickname || '작가 이미지'}
                    width={32}
                    height={32}
                    className='object-cover w-full h-full'
                  />
                </div>
                <span className='text-secondary-700 dark:text-dark-secondary-300 font-medium'>
                  {selectedCharacter.creator.nickname || '작가명'}
                </span>
              </div>

              {/* 기존 좋아요/댓글 카운트 (오른쪽) */}
              <div className='flex items-end gap-6'>
                <div
                  className='flex items-center space-x-2 cursor-pointer transition-colors hover:text-red-600'
                  onClick={handleLike}
                >
                  <FontAwesomeIcon icon={faHeart} className='h-5 w-5 text-red-500' />
                  <span className='text-secondary-700 dark:text-dark-secondary-300'>
                    {selectedCharacter.likeCount || 0}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <FontAwesomeIcon icon={faMessage} className='h-5 w-5 text-primary-500' />
                  <span className='text-secondary-700 dark:text-dark-secondary-300'>
                    {selectedCharacter.commentCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* 해시태그 */}
            <div className='flex flex-wrap justify-start gap-2 mb-4'>
              {selectedCharacter.hashtags?.slice(0, 7).map((tag: string, index: number) => (
                <span
                  key={`tag-${index}`}
                  className='rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700 dark:bg-dark-primary-900 dark:text-dark-primary-300'
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 간략한 캐릭터 설명 */}
            <div className='w-full mt-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-primary-900/70 dark:to-dark-secondary-900/70 rounded-lg border border-secondary-100 dark:border-dark-secondary-800/30'>
              <div className='p-4'>
                <h3 className='text-base font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center'>
                  <span className='bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-700 dark:from-dark-primary-300 dark:to-dark-secondary-300'>
                    캐릭터 소개
                  </span>
                </h3>
                <p className='text-secondary-800 dark:text-dark-secondary-200 text-sm leading-relaxed whitespace-pre-wrap break-words'>
                  {getChangeNameTag(selectedCharacter.description || '', selectedCharacter.name)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PC 레이아웃 우측 섹션 */}
        <div className={`${isMobile ? 'hidden' : 'md:w-[60%] h-full flex flex-col relative'}`}>
          {/* <div className="md:w-[60%] h-full flex flex-col relative"> */}
          <div className='overflow-y-auto pb-20'>
            <div className='p-5'>
              {/* 첫 번째 섹션: 캐릭터 소개 */}
              {isContentShow == 1 && (
                <div className='bg-white dark:bg-dark-secondary-900/30 rounded-lg p-5 shadow-sm mb-4 border border-secondary-100 dark:border-dark-secondary-800/30'>
                  <h3 className='text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center'>
                    <span className='w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block'></span>
                    상세 설명
                  </h3>
                  <p className='text-secondary-700 dark:text-dark-secondary-300 text-sm leading-relaxed whitespace-pre-wrap break-words'>
                    {content}
                  </p>
                </div>
              )}
              {/* 대화 예시 섹션 */}
              {isExampleShow == 1 && (
                <div className='bg-white dark:bg-dark-secondary-900/30 rounded-lg p-5 shadow-sm mb-4 border border-secondary-100 dark:border-dark-secondary-800/30'>
                  <h3 className='text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center'>
                    <span className='w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block'></span>
                    대화 예시
                  </h3>
                  <div className='space-y-4'>
                    {exampleDatas.map((data: exampleDatas, index: number) => (
                      <div
                        key={index}
                        className='border-b border-secondary-100 dark:border-dark-secondary-800 last:border-0 pb-4 last:pb-0'
                      >
                        <h4 className='text-sm font-medium text-secondary-800 dark:text-dark-secondary-200 mb-2'>
                          {data.title}
                        </h4>
                        <div className='space-y-2'>
                          <div className='flex items-start space-x-2'>
                            <div className='w-6 h-6 rounded-full bg-secondary-100 dark:bg-dark-secondary-700 flex items-center justify-center flex-shrink-0 text-secondary-500'>
                              <FontAwesomeIcon icon={faUser} className='w-3 h-3' />
                            </div>
                            <div className='p-2 break-words whitespace-pre-wrap overflow-hidden bg-secondary-50 dark:bg-dark-secondary-800/50 rounded-lg text-sm whitespace-pre-wrap break-words'>
                              {getChangeNameTag(data.characterMsg, selectedCharacter.name)}
                            </div>
                          </div>
                          <div className='flex justify-end space-x-2'>
                            <div className='p-2 break-words whitespace-pre-wrap overflow-hidden bg-primary-50 dark:bg-dark-primary-900/30 rounded-lg text-sm text-start'>
                              {getChangeNameTag(data.userMsg, selectedCharacter.name)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 세 번째 섹션: 첫 메시지 */}
              <div className='bg-white dark:from-dark-secondary-800/50 dark:to-dark-primary-900/30 rounded-lg p-5 shadow-sm border border-secondary-100 dark:border-dark-secondary-800/30'>
                <h3 className='text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 flex items-center'>
                  <span className='w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block'></span>
                  첫 메시지
                </h3>
                <div className='flex flex-col justify-between'>
                  <div className='p-4 flex flex-col bg-white/80 dark:bg-dark-secondary-900/50 rounded-lg'>
                    <div>
                      {mockFirstMessage.situation && (
                        <p className='text-xs text-secondary-500 dark:text-dark-secondary-400 mb-2 italic'>
                          {mockFirstMessage.situation}
                        </p>
                      )}
                      <div className='flex items-start mb-6'>
                        <div className='relative flex-shrink-0 mr-3'>
                          {/* 캐릭터 프로필 이미지 */}
                          <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-800 shadow-sm'>
                            {selectedCharacter.imageUrl ? (
                              <Image
                                src={selectedCharacter.imageUrl}
                                alt={selectedCharacter.name || '캐릭터'}
                                width={40}
                                height={40}
                                className='w-full h-full'
                              />
                            ) : (
                              <div className='w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center'>
                                <FontAwesomeIcon
                                  icon={faUser}
                                  className='text-primary-500 dark:text-primary-400'
                                />
                              </div>
                            )}
                          </div>

                          {/* 온라인 상태 표시 (녹색 점) */}
                          <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-background'></div>
                        </div>

                        {/* 말풍선 */}
                        <div className='relative max-w-[85%]'>
                          {/* 캐릭터 이름 */}
                          <div className='text-xs font-medium text-primary-600 dark:text-primary-400 mb-1'>
                            {selectedCharacter.name || '캐릭터'}
                          </div>

                          {/* 말풍선 내용 */}
                          <div className='bg-primary-50 dark:bg-primary-900/30 text-secondary-800 dark:text-secondary-200 p-3 rounded-lg rounded-tl-none shadow-sm border border-primary-100 dark:border-primary-800/50'>
                            <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                              {getChangeNameTag(
                                selectedCharacter?.first_talk || '',
                                selectedCharacter.name
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 네 번째 섹션: 작가의 말 */}
              {selectedCharacter.writer_note && selectedCharacter.writer_note.length > 0 && (
                <div className='bg-white dark:bg-dark-secondary-900/30 rounded-lg p-5 shadow-sm mb-4 border border-secondary-100 dark:border-dark-secondary-800/30'>
                  <h3 className='text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center'>
                    <span className='w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block'></span>
                    작가의 말
                  </h3>
                  <p className='text-secondary-700 dark:text-dark-secondary-300 text-sm leading-relaxed whitespace-pre-wrap break-words'>
                    {selectedCharacter.writer_note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 대화 시작 버튼 - 항상 하단에 고정 */}
          <div className='p-4 bg-white dark:bg-dark-background-light absolute bottom-0 left-0 right-0 w-full'>
            <button
              onClick={handleStartChat}
              className='w-full flex items-center justify-center rounded-lg bg-primary-500 px-6 py-4 font-medium text-white transition-all hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600'
            >
              <FontAwesomeIcon icon={faComment} className='mr-2' />
              대화 시작하기
            </button>
          </div>
        </div>

        {/* 모바일 레이아웃 */}
        <div className='md:hidden w-full h-full relative'>
          <div className='absolute inset-0 flex flex-col'>
            <div className='flex-1 overflow-y-auto pb-20'>
              <div className='p-5 space-y-4'>
                {/* 이미지 영역 */}
                <div className='relative mb-6 w-full flex items-center justify-center'>
                  {selectedCharacter.imageUrl && (
                    <>
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-secondary-100 dark:bg-dark-secondary-800 transition-opacity duration-300 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                      >
                        <div className='w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin'></div>
                      </div>

                      {/* 모바일 이미지 컨테이너 */}
                      <div
                        id='mobile_image_container'
                        className='w-full aspect-[3/4] relative rounded-xl overflow-hidden flex items-center justify-center bg-secondary-50 dark:bg-dark-secondary-900/30'
                      >
                        <div className='relative w-full h-full'>
                          <Image
                            src={selectedCharacter.imageUrl}
                            alt={selectedCharacter.name || '캐릭터 이미지'}
                            priority
                            fill
                            className='transition-opacity duration-300 z-10 opacity-100 drop-shadow-md rounded-xl'
                            style={{
                              objectFit: 'cover',
                              objectPosition: 'center center',
                            }}
                            onLoadingComplete={() => setIsImageLoaded(true)}
                          />

                          {/* 19세 이상 뱃지 - 이미지에 직접 배치 */}
                          {selectedCharacter.isAdult && (
                            <div
                              className='absolute z-30 flex items-center'
                              style={{ top: '15px', right: '15px' }}
                            >
                              <Image
                                src='/images/flames.png'
                                alt='성인인증'
                                width={27.7}
                                height={35.3}
                              />
                            </div>
                          )}

                          {/* 갤러리 버튼 */}
                          <div className='absolute bottom-2 left-2 flex items-center justify-center gap-4 z-30'>
                            {selectedCharacter.multi_image_count > 0 && (
                              <button
                                onClick={handleOpenGallery}
                                className='text-white text-xs px-2 py-1 rounded-full bg-gray-500/50'
                              >
                                <div className='flex items-center justify-center gap-2'>
                                  <FontAwesomeIcon
                                    icon={faImage}
                                    className='text-[14px] md:text-[20px]'
                                  />
                                  <span className='text-[14px] md:text-[20px]'>
                                    {selectedCharacter.multi_image_count || 0}
                                  </span>
                                </div>
                              </button>
                            )}

                            {/* Level */}
                            {selectedCharacter.likeability_yn === 1 && (
                              <div className='flex items-center justify-center gap-2 text-white text-xs px-2 py-1 rounded-full bg-gray-500/50'>
                                <Image
                                  src='/images/icons/like_icon_white.png'
                                  alt='레벨 아이콘'
                                  width={isMobile ? 14 : 20}
                                  height={isMobile ? 14 : 20}
                                  className='p-0 m-0'
                                />
                                <span className='text-[14px] md:text-[20px]'>
                                  Lv.{selectedCharacter.likeability_max_lv || 0}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 좋아요 & 댓글 수 */}
                {/* <div className="flex justify-end items-end w-full mb-6 gap-6">
                  <div
                    className="flex items-center space-x-2 cursor-pointer transition-colors hover:text-red-600"
                    onClick={handleLike}
                  >
                    <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-red-500" />
                    <span className="text-secondary-700 dark:text-dark-secondary-300">
                      {selectedCharacter.likeCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faMessage} className="h-5 w-5 text-primary-500" />
                    <span className="text-secondary-700 dark:text-dark-secondary-300">
                      {selectedCharacter.commentCount || 0}
                    </span>
                  </div>
                </div> */}

                <div className='flex justify-between items-center w-full mb-6'>
                  {/* 작가 이름 (왼쪽) */}
                  <div className='flex items-center cursor-pointer' onClick={handleSelectCreator}>
                    {/* 작가 섬네일 */}
                    <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mr-2'>
                      <Image
                        src={getImageUri(selectedCharacter.creator.profileImageUrl)}
                        alt={selectedCharacter.creator.nickname || '작가 이미지'}
                        width={32}
                        height={32}
                        className='object-cover w-full h-full'
                      />
                    </div>
                    <span className='text-secondary-700 dark:text-dark-secondary-300 font-medium'>
                      {selectedCharacter.creator.nickname || '작가명'}
                    </span>
                  </div>

                  {/* 기존 좋아요/댓글 카운트 (오른쪽) */}
                  <div className='flex items-end gap-6'>
                    <div
                      className='flex items-center space-x-2 cursor-pointer transition-colors hover:text-red-600'
                      onClick={handleLike}
                    >
                      <FontAwesomeIcon icon={faHeart} className='h-5 w-5 text-red-500' />
                      <span className='text-secondary-700 dark:text-dark-secondary-300'>
                        {selectedCharacter.likeCount || 0}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <FontAwesomeIcon icon={faMessage} className='h-5 w-5 text-primary-500' />
                      <span className='text-secondary-700 dark:text-dark-secondary-300'>
                        {selectedCharacter.commentCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 해시태그 */}
                <div className='flex flex-wrap justify-start gap-2 mb-4'>
                  {selectedCharacter.hashtags?.slice(0, 7).map((tag: string, index: number) => (
                    <span
                      key={`tag-${index}`}
                      className='rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700 dark:bg-dark-primary-900 dark:text-dark-primary-300'
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 간략한 캐릭터 설명 */}
                <div className='w-full mt-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-primary-900/70 dark:to-dark-secondary-900/70 rounded-lg border border-secondary-100 dark:border-dark-secondary-800/30'>
                  <div className='p-4'>
                    <h3 className='text-base font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center'>
                      <span className='bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-700 dark:from-dark-primary-300 dark:to-dark-secondary-300'>
                        캐릭터 소개
                      </span>
                    </h3>
                    <p className='text-secondary-800 dark:text-dark-secondary-200 text-sm leading-relaxed whitespace-pre-wrap break-words'>
                      {getChangeNameTag(
                        selectedCharacter.description || '',
                        selectedCharacter.name
                      )}
                    </p>
                  </div>
                </div>

                {/* 상세 설명 */}
                {isContentShow == 1 && (
                  <div className='bg-white dark:bg-dark-secondary-900/30 rounded-lg p-5 shadow-sm border border-secondary-100 dark:border-dark-secondary-800/30'>
                    <h3 className='text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center'>
                      <span className='w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block'></span>
                      상세 설명
                    </h3>
                    <p className='text-secondary-700 dark:text-dark-secondary-300 text-sm leading-relaxed whitespace-pre-wrap break-words'>
                      {content}
                    </p>
                  </div>
                )}

                {/* 대화 예시 */}
                {isExampleShow == 1 && (
                  <div className='bg-white dark:bg-dark-secondary-900/30 rounded-lg p-5 shadow-sm border border-secondary-100 dark:border-dark-secondary-800/30'>
                    <h3 className='text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center'>
                      <span className='w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block'></span>
                      대화 예시
                    </h3>
                    <div className='space-y-4'>
                      {exampleDatas.map((data: any, index: number) => (
                        <div
                          key={index}
                          className='border-b border-secondary-100 dark:border-dark-secondary-800 last:border-0 pb-4 last:pb-0'
                        >
                          <h4 className='text-sm font-medium text-secondary-800 dark:text-dark-secondary-200 mb-2'>
                            {data.title}
                          </h4>
                          <div className='space-y-2'>
                            <div className='flex items-start space-x-2'>
                              <div className='w-6 h-6 rounded-full bg-secondary-100 dark:bg-dark-secondary-700 flex items-center justify-center flex-shrink-0 text-secondary-500'>
                                <FontAwesomeIcon icon={faUser} className='w-3 h-3' />
                              </div>
                              <div className='p-2 bg-secondary-50 dark:bg-dark-secondary-800/50 rounded-lg text-sm whitespace-pre-wrap break-words'>
                                {getChangeNameTag(data.characterMsg, selectedCharacter.name)}
                              </div>
                            </div>
                            <div className='flex items-start justify-end space-x-2'>
                              <div className='p-2 bg-primary-50 dark:bg-dark-primary-900/30 rounded-lg text-sm text-end whitespace-pre-wrap break-words'>
                                {getChangeNameTag(data.userMsg, selectedCharacter.name)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 첫 메시지 */}
                <div className='bg-white dark:bg-dark-secondary-900/30 rounded-lg p-5 shadow-sm border border-secondary-100 dark:border-dark-secondary-800/30'>
                  <h3 className='text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center'>
                    <span className='w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block'></span>
                    첫 메시지
                  </h3>
                  <div className='flex items-start mb-4'>
                    <div className='relative flex-shrink-0 mr-3'>
                      <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-800 shadow-sm'>
                        {selectedCharacter.imageUrl ? (
                          <Image
                            src={selectedCharacter.imageUrl}
                            alt={selectedCharacter.name || '캐릭터'}
                            width={40}
                            height={40}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center'>
                            <FontAwesomeIcon
                              icon={faUser}
                              className='text-primary-500 dark:text-primary-400'
                            />
                          </div>
                        )}
                      </div>
                      <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-background'></div>
                    </div>
                    <div className='relative max-w-[85%]'>
                      <div className='text-xs font-medium text-primary-600 dark:text-primary-400 mb-1'>
                        {selectedCharacter.name || '캐릭터'}
                      </div>
                      <div className='bg-primary-50 dark:bg-primary-900/30 text-secondary-800 dark:text-secondary-200 p-3 rounded-lg rounded-tl-none shadow-sm border border-primary-100 dark:border-primary-800/50'>
                        <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                          {getChangeNameTag(
                            selectedCharacter?.first_talk || '',
                            selectedCharacter.name
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 네 번째 섹션: 작가의 말 */}
                {selectedCharacter.writer_note && selectedCharacter.writer_note.length > 0 && (
                  <div className='bg-white dark:bg-dark-secondary-900/30 rounded-lg p-5 shadow-sm mb-4 border border-secondary-100 dark:border-dark-secondary-800/30'>
                    <h3 className='text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center'>
                      <span className='w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block'></span>
                      작가의 말
                    </h3>
                    <p className='text-secondary-700 dark:text-dark-secondary-300 text-sm leading-relaxed whitespace-pre-wrap break-words'>
                      {selectedCharacter.writer_note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 대화 시작 버튼 - 모바일 */}
            <div className='absolute bottom-0 left-0 right-0 bg-white p-2 dark:bg-dark-background-light border-t border-secondary-100 dark:border-dark-secondary-800 z-[103]'>
              <button
                onClick={handleStartChat}
                className='w-full flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3.5 font-medium text-white transition-colors hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600 shadow-sm'
              >
                <FontAwesomeIcon icon={faComment} className='mr-2' />
                대화 시작하기
              </button>
            </div>
          </div>
        </div>
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        submitted={reportSubmitted}
        reportType='character'
      />
    </BaseModal>
  );
}
