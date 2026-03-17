'use client'

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
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Siren } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  bridgeCharbotDataToCharacter,
  exampleDatas,
  getChangeNameTag,
  getChatRoomEncryptData,
  getImageUri,
  parseConversationExamples,
  parseExampleJsonToIntroBubbles,
  rijndaelEncrypt,
} from '@/lib/utils/storyNationUtil'
import { contentApi, createApi } from '@/services/api/storyNationApi'
import { ReqGetChatBot } from '@/services/hooks/DataListManager'
import useNewModalStore from '@/shared/model/stores/useModalStore'
import { Character, useAccountStore } from '@/store/useStoreData'
import { useModalStore } from '@/store/useStoreModal'
import { CharbotLikeResponse } from '@/types/api'
import VoiceBubble from '@/src/features/edit-character/ui/VoiceBubble'
import BaseModal from './BaseModal'
import ReportModal from './ReportModal'

const VOICE_PREFIX = '[voice]'

const PI_ADDRESS = process.env.NEXT_PUBLIC_PI_ADDRESS
const CHAT_FRONTEND_ADDRESS = process.env.NEXT_PUBLIC_CHAT_FRONTEND_ADDRESS
const CHAT_SERVER_ADDRESS = process.env.NEXT_PUBLIC_CHAT_SERVER_ADDRESS
const CHAT_SERVER_PORT = process.env.NEXT_PUBLIC_CHAT_SERVER_PORT

interface ExampleData {
  title: string
  User: string
  Character: string
}

interface CharactorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CharactorModal({ isOpen, onClose }: CharactorModalProps) {
  const router = useRouter()
  const { selectedCharacter, setSelectedCharacter, openModal, modalProps } = useModalStore()
  const { openModal: openNewModal } = useNewModalStore()
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const { isLogin, isAdult, data: userInfo, writerInfo } = useAccountStore()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const isMobile = window.innerWidth < 768
  const variant = modalProps?.variant || 'default'

  const {
    data: chatBotData,
    isLoading: chatBotLoading,
    error: chatBotError,
    refetch,
  } = ReqGetChatBot(Number(selectedCharacter?.id))

  const firstTalk = chatBotData?.chrbot?.first_talk
  const isDmMode = (() => {
    try {
      const parsed = JSON.parse(firstTalk || '')
      return typeof parsed === 'object' && parsed !== null
    } catch {
      return false
    }
  })()
  const introBubbles = isDmMode ? parseExampleJsonToIntroBubbles(firstTalk ?? '') : []

  // 멀티이미지 데이터 가져오기 (인트로 말풍선에서 [키] 형태의 이미지 참조용)
  const { data: multiImageResponse, isLoading: isMultiImageLoading } = useQuery({
    queryKey: ['multiImage', chatBotData?.chrbot?.world_list_detail_chrbot_key],
    queryFn: () =>
      contentApi.GetMultiImageData(
        chatBotData?.chrbot?.world_list_detail_chrbot_key ?? 0,
        chatBotData?.chrbot?.likeability_yn ?? 0
      ),
    enabled: !!chatBotData?.chrbot,
  })
  console.log('@@ multiImageResponse :: ', multiImageResponse)
  console.log('@@ chatBotData full ::', chatBotData)
  const multiImages = multiImageResponse?.data?.multi_image_data ?? []
  console.log('@@ multiImages :: ', multiImages)

  // [123] 패턴에서 멀티이미지 키로 img_url 찾기
  const getMultiImageUrl = (text: string): string | null => {
    const match = text.match(/^\[(\d+)\]$/)
    if (!match) return null
    const key = Number(match[1])
    const found = multiImages.find((img: any) => img.chrbot_multi_image_key === key)
    return found ? getImageUri(found.img_url) : null
  }

  const exampleDatas = chatBotData?.chrbot?.example ? parseConversationExamples(chatBotData.chrbot.example) : []
  const isExampleShow = chatBotData?.chrbot?.example_show_yn === 1 && exampleDatas.length > 0 ? 1 : 0

  const __content =
    chatBotData?.chrbot?.content_show_yn === 2
      ? chatBotData?.chrbot?.content_public || ''
      : chatBotData?.chrbot?.content || ''
  const content = getChangeNameTag(__content, selectedCharacter?.name || '')
  const isContentShow = (chatBotData?.chrbot?.content_show_yn || 0) > 0 && content !== '' ? 1 : 0

  useEffect(() => {
    if (chatBotData) {
      setSelectedCharacter(bridgeCharbotDataToCharacter(chatBotData?.chrbot) as Character)
    }
  }, [chatBotData])

  // 모달 열릴 때 이미지 미리 로딩
  useEffect(() => {
    if (selectedCharacter && selectedCharacter?.imageUrl) {
      const img = new window.Image()
      img.src = selectedCharacter?.imageUrl
      img.onload = () => setIsImageLoaded(true)
    }
  }, [selectedCharacter])

  // 모달이 닫힐 때 선택된 캐릭터 초기화
  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSelectedCharacter(null)
      setIsImageLoaded(false)
    }, 300)
  }

  // 대화 시작 버튼 클릭 시 채팅 페이지로 이동
  const handleStartChat = async () => {
    if (selectedCharacter && selectedCharacter.id) {
      if (!isLogin) {
        openNewModal({ type: 'socialLogin' })
        handleClose()
        return
      }

      if (!isAdult() && selectedCharacter.isAdult) {
        openModal('adultVerification')
        return
      }

      handleClose()
      const chatId = String(selectedCharacter.id).trim()
      const response = await createApi.GetChatBot(Number(chatId))

      if (response.data.result.err == 0) {
        if (response.data.chrbot.block_type !== 0) {
          toast.error('정책 위반 사항이 포함되어 비공개된 캐릭터입니다.')
          return
        }
        if (response.data.chrbot.delete_yn !== 0) {
          toast.error('삭제된 캐릭터입니다.')
          return
        }

        const chrbotKey = response.data.chrbot.world_list_detail_chrbot_key.toString()
        const nsfw = response.data.chrbot.nsfw.toString() || '0'
        const freePen = Number(userInfo?.coin_free || 0) + Number(userInfo?.coin_register || 0)

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
        )

        const chatRoomPath = `${CHAT_FRONTEND_ADDRESS}?info=${encryptedData}`
        router.push(chatRoomPath)

        // if (chatId) {
        //   router.push(`/chat/${chatId}`)
        // }
      }
    }
  }

  const handleLike = async () => {
    const response = await contentApi.CharBotLike(Number(selectedCharacter?.id))
    const responseData = response.data as CharbotLikeResponse
    if (responseData.result.err === 0) {
      refetch()
    }
  }

  const handleReport = () => {
    if (!isLogin) {
      openNewModal({ type: 'socialLogin' })
      return
    }
    setIsReportModalOpen(true)
  }

  const handleReportSubmit = async (reason: number | null, description: string) => {
    try {
      // 여기에 실제 신고 API 호출 로직 구현
      const response = await contentApi.ReportChatBot(10, Number(selectedCharacter?.id), reason || 0, description, 'KR')
      const responseData = response.data

      if (responseData.result.err === 0) {
        toast.success('신고가 접수되었습니다.')
      }

      // 성공 시 상태 업데이트
      setReportSubmitted(true)
      // 신고 모달 닫기 (또는 유지할 수도 있음)
      setTimeout(() => {
        setIsReportModalOpen(false)
        // 일정 시간 후 submitted 상태 초기화
        setTimeout(() => setReportSubmitted(false), 500)
      }, 2000)
    } catch (error) {
      console.error('Error submitting report:', error)
    }
  }

  const handleCreateCharacter = async () => {
    router.push(`/my-characters/edit/${selectedCharacter?.id}`)
    onClose()
  }

  const handleSelectCreator = () => {
    router.push(`/author/${selectedCharacter?.creator.nickname}`)
    onClose()
  }

  const handleOpenGallery = () => {
    console.log('handleOpenGallery')
    // onClose()
    // openModal('charactorgallery')
  }

  if (!selectedCharacter) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      className="mx-auto w-full"
      showCloseButton={false}
      hideHeader={true}
      bodyClassName="p-0 max-h-[90vh] overflow-hidden"
    >
      {/* 모달 헤더 */}
      <div className="sticky top-0 z-[102] border-b border-secondary-100 bg-white dark:border-dark-secondary-800 dark:bg-dark-background-light">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-md font-bold text-secondary-900 dark:text-dark-secondary-100 md:text-xl">
            {selectedCharacter.subject || selectedCharacter.name}
          </h1>
          <div className="flex items-center gap-2">
            {variant === 'default' ? (
              <button
                onClick={handleReport}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-100 text-secondary-500 transition-colors hover:bg-secondary-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-700 md:h-9 md:w-9"
              >
                <Siren className="h-4 w-4 md:h-6 md:w-6" />
              </button>
            ) : (
              <button
                onClick={handleCreateCharacter}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-100 text-secondary-500 transition-colors hover:bg-secondary-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-700 md:h-9 md:w-9"
              >
                <FontAwesomeIcon icon={faUserEdit} className="h-4 w-4 md:h-6 md:w-6" />
              </button>
            )}
            <div>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-100 text-secondary-500 transition-colors hover:bg-secondary-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-700 md:h-9 md:w-9"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4 md:h-6 md:w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-[calc(90vh-88px)] flex-col overflow-hidden md:flex-row">
        {/* PC 레이아웃 */}
        <div className="hidden h-full overflow-y-auto p-5 md:block md:w-[40%]">
          <div className="flex flex-col items-start">
            {/* 이미지 영역 */}
            <div className="relative mb-6 flex w-full items-center justify-center">
              {selectedCharacter.imageUrl && (
                <>
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-secondary-100 transition-opacity duration-300 dark:bg-dark-secondary-800 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                  </div>

                  {/* PC 이미지 컨테이너 */}
                  <div
                    id="image_container"
                    className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl bg-secondary-50 dark:bg-dark-secondary-900/30"
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={selectedCharacter.imageUrl}
                        alt={selectedCharacter.name || '캐릭터 이미지'}
                        priority
                        fill
                        className="z-10 rounded-xl opacity-100 drop-shadow-md transition-opacity duration-300"
                        onLoadingComplete={() => setIsImageLoaded(true)}
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center center',
                        }}
                      />

                      {/* 19세 이상 뱃지 - 이미지에 직접 배치 */}
                      {selectedCharacter.isAdult && (
                        <div className="absolute z-30 flex items-center" style={{ top: '15px', right: '15px' }}>
                          <Image src="/images/flames.png" alt="성인인증" width={27.7} height={35.3} />
                        </div>
                      )}

                      {/* 갤러리 버튼 */}
                      <div className="absolute bottom-2 left-2 z-30 flex items-center justify-center gap-4">
                        {selectedCharacter.multi_image_count > 0 && (
                          <button
                            onClick={handleOpenGallery}
                            className="rounded-full bg-gray-500/50 px-2 py-1 text-xs text-white"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <FontAwesomeIcon icon={faImage} className="text-[14px] md:text-[20px]" />
                              <span className="text-[14px] md:text-[20px]">
                                {selectedCharacter.multi_image_count || 0}
                              </span>
                            </div>
                          </button>
                        )}

                        {/* Level */}
                        {selectedCharacter.likeability_yn === 1 && (
                          <div className="flex items-center justify-center gap-2 rounded-full bg-gray-500/50 px-2 py-1 text-xs text-white">
                            <Image
                              src="/images/icons/like_icon_white.png"
                              alt="레벨 아이콘"
                              width={isMobile ? 14 : 20}
                              height={isMobile ? 14 : 20}
                              className="m-0 p-0"
                            />
                            <span className="text-[14px] md:text-[20px]">
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

            <div className="mb-6 flex w-full items-center justify-between">
              {/* 작가 이름 (왼쪽) */}
              <div className="flex cursor-pointer items-center" onClick={handleSelectCreator}>
                {/* 작가 섬네일 */}
                <div className="mr-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                  <Image
                    src={getImageUri(selectedCharacter.creator.profileImageUrl)}
                    alt={selectedCharacter.creator.nickname || '작가 이미지'}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-medium text-secondary-700 dark:text-dark-secondary-300">
                  {selectedCharacter.creator.nickname || '작가명'}
                </span>
              </div>

              {/* 기존 좋아요/댓글 카운트 (오른쪽) */}
              <div className="flex items-end gap-6">
                <div
                  className="flex cursor-pointer items-center space-x-2 transition-colors hover:text-red-600"
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
              </div>
            </div>

            {/* 해시태그 */}
            <div className="mb-4 flex flex-wrap justify-start gap-2">
              {selectedCharacter.hashtags?.slice(0, 7).map((tag: string, index: number) => (
                <span
                  key={`tag-${index}`}
                  className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700 dark:bg-dark-primary-900 dark:text-dark-primary-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 간략한 캐릭터 설명 */}
            <div className="mt-4 w-full rounded-lg border border-secondary-100 bg-gradient-to-r from-primary-50 to-secondary-50 dark:border-dark-secondary-800/30 dark:from-dark-primary-900/70 dark:to-dark-secondary-900/70">
              <div className="p-4">
                <h3 className="mb-3 flex items-center text-base font-semibold text-secondary-900 dark:text-dark-secondary-100">
                  <span className="bg-gradient-to-r from-primary-700 to-secondary-700 bg-clip-text text-transparent dark:from-dark-primary-300 dark:to-dark-secondary-300">
                    캐릭터 소개
                  </span>
                </h3>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary-800 dark:text-dark-secondary-200">
                  {getChangeNameTag(selectedCharacter.description || '', selectedCharacter.name)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PC 레이아웃 우측 섹션 */}
        <div className={`${isMobile ? 'hidden' : 'relative flex h-full flex-col md:w-[60%]'}`}>
          {/* <div className="md:w-[60%] h-full flex flex-col relative"> */}
          <div className="overflow-y-auto pb-20">
            <div className="p-5">
              {/* 첫 번째 섹션: 캐릭터 소개 */}
              {isContentShow == 1 && (
                <div className="mb-4 rounded-lg border border-secondary-100 bg-white p-5 shadow-sm dark:border-dark-secondary-800/30 dark:bg-dark-secondary-900/30">
                  <h3 className="mb-3 flex items-center text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100">
                    <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-primary-500"></span>
                    상세 설명
                  </h3>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary-700 dark:text-dark-secondary-300">
                    {content}
                  </p>
                </div>
              )}
              {/* 대화 예시 섹션 */}
              {isExampleShow == 1 && (
                <div className="mb-4 rounded-lg border border-secondary-100 bg-white p-5 shadow-sm dark:border-dark-secondary-800/30 dark:bg-dark-secondary-900/30">
                  <h3 className="mb-3 flex items-center text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100">
                    <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-primary-500"></span>
                    대화 예시
                  </h3>
                  <div className="space-y-4">
                    {exampleDatas.map((data: exampleDatas, index: number) => (
                      <div
                        key={index}
                        className="border-b border-secondary-100 pb-4 last:border-0 last:pb-0 dark:border-dark-secondary-800"
                      >
                        <h4 className="mb-2 text-sm font-medium text-secondary-800 dark:text-dark-secondary-200">
                          {data.title}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-500 dark:bg-dark-secondary-700">
                              <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                            </div>
                            <div className="overflow-hidden whitespace-pre-wrap whitespace-pre-wrap break-words break-words rounded-lg bg-secondary-50 p-2 text-sm dark:bg-dark-secondary-800/50">
                              {getChangeNameTag(data.characterMsg, selectedCharacter.name)}
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <div className="overflow-hidden whitespace-pre-wrap break-words rounded-lg bg-primary-50 p-2 text-start text-sm dark:bg-dark-primary-900/30">
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
              <div className="rounded-lg border border-secondary-100 bg-white p-5 shadow-sm dark:border-dark-secondary-800/30 dark:from-dark-secondary-800/50 dark:to-dark-primary-900/30">
                <h3 className="flex items-center text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100">
                  <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-primary-500"></span>첫 메시지
                </h3>
                <div className="flex flex-col justify-between">
                  <div className="flex flex-col rounded-lg bg-white/80 p-4 dark:bg-dark-secondary-900/50">
                    {isDmMode ? (
                      <div className="space-y-3">
                        {introBubbles
                          .filter(group => group.messages.length > 0)
                          .map(group => (
                            <div
                              key={group.id}
                              className={`flex ${group.speaker === 'user' ? 'justify-end' : 'items-start'}`}
                            >
                              {group.speaker === 'character' && (
                                <div className="relative mr-3 flex-shrink-0">
                                  <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-200 shadow-sm dark:border-primary-800">
                                    {selectedCharacter.imageUrl ? (
                                      <Image
                                        src={selectedCharacter.imageUrl}
                                        alt={selectedCharacter.name || '캐릭터'}
                                        width={40}
                                        height={40}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                                        <FontAwesomeIcon
                                          icon={faUser}
                                          className="text-primary-500 dark:text-primary-400"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className={`max-w-[85%] ${group.speaker === 'user' ? '' : ''}`}>
                                {group.speaker === 'character' && (
                                  <div className="mb-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                                    {selectedCharacter.name || '캐릭터'}
                                  </div>
                                )}
                                <div className="space-y-2">
                                  {group.messages.map(m => {
                                    const isImageToken = /^\[\d+\]$/.test(m.text)
                                    const imageUrl = getMultiImageUrl(m.text)
                                    const isVoice = m.text.startsWith(VOICE_PREFIX)
                                    if (isImageToken) {
                                      return imageUrl ? (
                                        <div key={m.id} className="h-[160px] w-[160px] overflow-hidden rounded-lg">
                                          <Image
                                            src={imageUrl}
                                            alt="인트로 이미지"
                                            width={160}
                                            height={160}
                                            className="h-full w-full rounded-lg object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          key={m.id}
                                          className="h-[160px] w-[160px] animate-pulse rounded-lg bg-secondary-100 dark:bg-dark-secondary-800"
                                        />
                                      )
                                    }
                                    if (isVoice) {
                                      return (
                                        <VoiceBubble
                                          key={m.id}
                                          text={m.text.slice(VOICE_PREFIX.length)}
                                          className="rounded-lg rounded-tl-none border border-primary-100 bg-primary-50 text-secondary-800 dark:border-primary-800/50 dark:bg-primary-900/30 dark:text-secondary-200"
                                        />
                                      )
                                    }
                                    return (
                                      <div
                                        key={m.id}
                                        className={`rounded-lg p-3 text-sm shadow-sm ${
                                          group.speaker === 'character'
                                            ? 'rounded-tl-none border border-primary-100 bg-primary-50 text-secondary-800 dark:border-primary-800/50 dark:bg-primary-900/30 dark:text-secondary-200'
                                            : 'rounded-tr-none border border-secondary-200 bg-white text-secondary-800 dark:border-dark-secondary-700 dark:bg-dark-secondary-800 dark:text-secondary-200'
                                        }`}
                                      >
                                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                                          {getChangeNameTag(m.text, selectedCharacter.name)}
                                        </p>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <div className="relative mr-3 flex-shrink-0">
                          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-200 shadow-sm dark:border-primary-800">
                            {selectedCharacter.imageUrl ? (
                              <Image
                                src={selectedCharacter.imageUrl}
                                alt={selectedCharacter.name || '캐릭터'}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                                <FontAwesomeIcon icon={faUser} className="text-primary-500 dark:text-primary-400" />
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark-background"></div>
                        </div>
                        <div className="relative max-w-[85%]">
                          <div className="mb-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                            {selectedCharacter.name || '캐릭터'}
                          </div>
                          <div className="rounded-lg rounded-tl-none border border-primary-100 bg-primary-50 p-3 text-secondary-800 shadow-sm dark:border-primary-800/50 dark:bg-primary-900/30 dark:text-secondary-200">
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {getChangeNameTag(firstTalk || '', selectedCharacter.name)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 네 번째 섹션: 작가의 말 */}
              {selectedCharacter.writer_note && selectedCharacter.writer_note.length > 0 && (
                <div className="mb-4 rounded-lg border border-secondary-100 bg-white p-5 shadow-sm dark:border-dark-secondary-800/30 dark:bg-dark-secondary-900/30">
                  <h3 className="mb-3 flex items-center text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100">
                    <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-primary-500"></span>
                    작가의 말
                  </h3>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary-700 dark:text-dark-secondary-300">
                    {selectedCharacter.writer_note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 대화 시작 버튼 - 항상 하단에 고정 */}
          <div className="absolute bottom-0 left-0 right-0 w-full bg-white p-4 dark:bg-dark-background-light">
            <button
              onClick={handleStartChat}
              className="flex w-full items-center justify-center rounded-lg bg-primary-500 px-6 py-4 font-medium text-white transition-all hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600"
            >
              <FontAwesomeIcon icon={faComment} className="mr-2" />
              대화 시작하기
            </button>
          </div>
        </div>

        {/* 모바일 레이아웃 */}
        <div className="relative h-full w-full md:hidden">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 overflow-y-auto pb-20">
              <div className="space-y-4 p-5">
                {/* 이미지 영역 */}
                <div className="relative mb-6 flex w-full items-center justify-center">
                  {selectedCharacter.imageUrl && (
                    <>
                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-secondary-100 transition-opacity duration-300 dark:bg-dark-secondary-800 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                      >
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
                      </div>

                      {/* 모바일 이미지 컨테이너 */}
                      <div
                        id="mobile_image_container"
                        className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl bg-secondary-50 dark:bg-dark-secondary-900/30"
                      >
                        <div className="relative h-full w-full">
                          <Image
                            src={selectedCharacter.imageUrl}
                            alt={selectedCharacter.name || '캐릭터 이미지'}
                            priority
                            fill
                            className="z-10 rounded-xl opacity-100 drop-shadow-md transition-opacity duration-300"
                            style={{
                              objectFit: 'cover',
                              objectPosition: 'center center',
                            }}
                            onLoadingComplete={() => setIsImageLoaded(true)}
                          />

                          {/* 19세 이상 뱃지 - 이미지에 직접 배치 */}
                          {selectedCharacter.isAdult && (
                            <div className="absolute z-30 flex items-center" style={{ top: '15px', right: '15px' }}>
                              <Image src="/images/flames.png" alt="성인인증" width={27.7} height={35.3} />
                            </div>
                          )}

                          {/* 갤러리 버튼 */}
                          <div className="absolute bottom-2 left-2 z-30 flex items-center justify-center gap-4">
                            {selectedCharacter.multi_image_count > 0 && (
                              <button
                                onClick={handleOpenGallery}
                                className="rounded-full bg-gray-500/50 px-2 py-1 text-xs text-white"
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <FontAwesomeIcon icon={faImage} className="text-[14px] md:text-[20px]" />
                                  <span className="text-[14px] md:text-[20px]">
                                    {selectedCharacter.multi_image_count || 0}
                                  </span>
                                </div>
                              </button>
                            )}

                            {/* Level */}
                            {selectedCharacter.likeability_yn === 1 && (
                              <div className="flex items-center justify-center gap-2 rounded-full bg-gray-500/50 px-2 py-1 text-xs text-white">
                                <Image
                                  src="/images/icons/like_icon_white.png"
                                  alt="레벨 아이콘"
                                  width={isMobile ? 14 : 20}
                                  height={isMobile ? 14 : 20}
                                  className="m-0 p-0"
                                />
                                <span className="text-[14px] md:text-[20px]">
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

                <div className="mb-6 flex w-full items-center justify-between">
                  {/* 작가 이름 (왼쪽) */}
                  <div className="flex cursor-pointer items-center" onClick={handleSelectCreator}>
                    {/* 작가 섬네일 */}
                    <div className="mr-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                      <Image
                        src={getImageUri(selectedCharacter.creator.profileImageUrl)}
                        alt={selectedCharacter.creator.nickname || '작가 이미지'}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="font-medium text-secondary-700 dark:text-dark-secondary-300">
                      {selectedCharacter.creator.nickname || '작가명'}
                    </span>
                  </div>

                  {/* 기존 좋아요/댓글 카운트 (오른쪽) */}
                  <div className="flex items-end gap-6">
                    <div
                      className="flex cursor-pointer items-center space-x-2 transition-colors hover:text-red-600"
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
                  </div>
                </div>

                {/* 해시태그 */}
                <div className="mb-4 flex flex-wrap justify-start gap-2">
                  {selectedCharacter.hashtags?.slice(0, 7).map((tag: string, index: number) => (
                    <span
                      key={`tag-${index}`}
                      className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700 dark:bg-dark-primary-900 dark:text-dark-primary-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 간략한 캐릭터 설명 */}
                <div className="mt-4 w-full rounded-lg border border-secondary-100 bg-gradient-to-r from-primary-50 to-secondary-50 dark:border-dark-secondary-800/30 dark:from-dark-primary-900/70 dark:to-dark-secondary-900/70">
                  <div className="p-4">
                    <h3 className="mb-3 flex items-center text-base font-semibold text-secondary-900 dark:text-dark-secondary-100">
                      <span className="bg-gradient-to-r from-primary-700 to-secondary-700 bg-clip-text text-transparent dark:from-dark-primary-300 dark:to-dark-secondary-300">
                        캐릭터 소개
                      </span>
                    </h3>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary-800 dark:text-dark-secondary-200">
                      {getChangeNameTag(selectedCharacter.description || '', selectedCharacter.name)}
                    </p>
                  </div>
                </div>

                {/* 상세 설명 */}
                {isContentShow == 1 && (
                  <div className="rounded-lg border border-secondary-100 bg-white p-5 shadow-sm dark:border-dark-secondary-800/30 dark:bg-dark-secondary-900/30">
                    <h3 className="mb-3 flex items-center text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100">
                      <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-primary-500"></span>
                      상세 설명
                    </h3>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary-700 dark:text-dark-secondary-300">
                      {content}
                    </p>
                  </div>
                )}

                {/* 대화 예시 */}
                {isExampleShow == 1 && (
                  <div className="rounded-lg border border-secondary-100 bg-white p-5 shadow-sm dark:border-dark-secondary-800/30 dark:bg-dark-secondary-900/30">
                    <h3 className="mb-3 flex items-center text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100">
                      <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-primary-500"></span>
                      대화 예시
                    </h3>
                    <div className="space-y-4">
                      {exampleDatas.map((data: any, index: number) => (
                        <div
                          key={index}
                          className="border-b border-secondary-100 pb-4 last:border-0 last:pb-0 dark:border-dark-secondary-800"
                        >
                          <h4 className="mb-2 text-sm font-medium text-secondary-800 dark:text-dark-secondary-200">
                            {data.title}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary-100 text-secondary-500 dark:bg-dark-secondary-700">
                                <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                              </div>
                              <div className="whitespace-pre-wrap break-words rounded-lg bg-secondary-50 p-2 text-sm dark:bg-dark-secondary-800/50">
                                {getChangeNameTag(data.characterMsg, selectedCharacter.name)}
                              </div>
                            </div>
                            <div className="flex items-start justify-end space-x-2">
                              <div className="whitespace-pre-wrap break-words rounded-lg bg-primary-50 p-2 text-end text-sm dark:bg-dark-primary-900/30">
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
                <div className="rounded-lg border border-secondary-100 bg-white p-5 shadow-sm dark:border-dark-secondary-800/30 dark:bg-dark-secondary-900/30">
                  <h3 className="mb-3 flex items-center text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100">
                    <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-primary-500"></span>첫 메시지
                  </h3>
                  {isDmMode ? (
                    <div className="space-y-3">
                      {introBubbles
                        .filter(group => group.messages.length > 0)
                        .map(group => (
                          <div
                            key={group.id}
                            className={`flex ${group.speaker === 'user' ? 'justify-end' : 'items-start'}`}
                          >
                            {group.speaker === 'character' && (
                              <div className="relative mr-3 flex-shrink-0">
                                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-200 shadow-sm dark:border-primary-800">
                                  {selectedCharacter.imageUrl ? (
                                    <Image
                                      src={selectedCharacter.imageUrl}
                                      alt={selectedCharacter.name || '캐릭터'}
                                      width={40}
                                      height={40}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                                      <FontAwesomeIcon
                                        icon={faUser}
                                        className="text-primary-500 dark:text-primary-400"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="max-w-[85%]">
                              {group.speaker === 'character' && (
                                <div className="mb-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                                  {selectedCharacter.name || '캐릭터'}
                                </div>
                              )}
                              <div className="space-y-2">
                                {group.messages.map(m => {
                                  const isImageToken = /^\[\d+\]$/.test(m.text)
                                  const imageUrl = getMultiImageUrl(m.text)
                                  const isVoice = m.text.startsWith(VOICE_PREFIX)
                                  if (isImageToken) {
                                    return imageUrl ? (
                                      <div key={m.id} className="overflow-hidden rounded-lg">
                                        <Image
                                          src={imageUrl}
                                          alt="인트로 이미지"
                                          width={300}
                                          height={300}
                                          className="h-auto w-full rounded-lg object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        key={m.id}
                                        className="h-[160px] w-[160px] animate-pulse rounded-lg bg-secondary-100 dark:bg-dark-secondary-800"
                                      />
                                    )
                                  }
                                  if (isVoice) {
                                    return (
                                      <VoiceBubble
                                        key={m.id}
                                        text={m.text.slice(VOICE_PREFIX.length)}
                                        className="rounded-lg rounded-tl-none border border-primary-100 bg-primary-50 text-secondary-800 dark:border-primary-800/50 dark:bg-primary-900/30 dark:text-secondary-200"
                                      />
                                    )
                                  }
                                  return (
                                    <div
                                      key={m.id}
                                      className={`rounded-lg p-3 text-sm shadow-sm ${
                                        group.speaker === 'character'
                                          ? 'rounded-tl-none border border-primary-100 bg-primary-50 text-secondary-800 dark:border-primary-800/50 dark:bg-primary-900/30 dark:text-secondary-200'
                                          : 'rounded-tr-none border border-secondary-200 bg-white text-secondary-800 dark:border-dark-secondary-700 dark:bg-dark-secondary-800 dark:text-secondary-200'
                                      }`}
                                    >
                                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                                        {getChangeNameTag(m.text, selectedCharacter.name)}
                                      </p>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="mb-4 flex items-start">
                      <div className="relative mr-3 flex-shrink-0">
                        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-200 shadow-sm dark:border-primary-800">
                          {selectedCharacter.imageUrl ? (
                            <Image
                              src={selectedCharacter.imageUrl}
                              alt={selectedCharacter.name || '캐릭터'}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                              <FontAwesomeIcon icon={faUser} className="text-primary-500 dark:text-primary-400" />
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-dark-background"></div>
                      </div>
                      <div className="relative max-w-[85%]">
                        <div className="mb-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                          {selectedCharacter.name || '캐릭터'}
                        </div>
                        <div className="rounded-lg rounded-tl-none border border-primary-100 bg-primary-50 p-3 text-secondary-800 shadow-sm dark:border-primary-800/50 dark:bg-primary-900/30 dark:text-secondary-200">
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {getChangeNameTag(firstTalk || '', selectedCharacter.name)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 네 번째 섹션: 작가의 말 */}
                {selectedCharacter.writer_note && selectedCharacter.writer_note.length > 0 && (
                  <div className="mb-4 rounded-lg border border-secondary-100 bg-white p-5 shadow-sm dark:border-dark-secondary-800/30 dark:bg-dark-secondary-900/30">
                    <h3 className="mb-3 flex items-center text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100">
                      <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-primary-500"></span>
                      작가의 말
                    </h3>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary-700 dark:text-dark-secondary-300">
                      {selectedCharacter.writer_note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 대화 시작 버튼 - 모바일 */}
            <div className="absolute bottom-0 left-0 right-0 z-[103] border-t border-secondary-100 bg-white p-2 dark:border-dark-secondary-800 dark:bg-dark-background-light">
              <button
                onClick={handleStartChat}
                className="flex w-full items-center justify-center rounded-lg bg-primary-500 px-6 py-3.5 font-medium text-white shadow-sm transition-colors hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600"
              >
                <FontAwesomeIcon icon={faComment} className="mr-2" />
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
        reportType="character"
      />
    </BaseModal>
  )
}
