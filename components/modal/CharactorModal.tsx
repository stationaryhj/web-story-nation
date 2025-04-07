'use client'

import { useModalStore } from '@/store/useStoreModal'
import { faComment, faHeart, faTimes, faShieldHalved, faMessage, faUser, faPlus, faUserEdit } from '@fortawesome/free-solid-svg-icons'
import { Siren } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { bridgeCharbotDataToCharacter } from '@/lib/utils/storyNationUtil'
import BaseModal from './BaseModal'
import { ReqGetChatBot } from '@/services/hooks/DataListManager'
import { Character } from '@/store/useStoreData'
import { contentApi } from '@/services/api/storyNationApi'
import { CharbotLikeResponse } from '@/types/api'
import { useAccountStore } from '@/store/useStoreData'
import ReportModal from './ReportModal'


interface ExampleData {
  title: string
  User: string
  Character: string
}

// 목업 데이터
const mockFirstMessage = {
  situation: '어두운 밤, 비가 내리는 거리에서',
  message:
    '안녕하세요. 저는 도시의 수호자입니다. 이 도시에서 일어나는 모든 사건을 조사하고 있죠. 당신과 함께 이 도시의 비밀을 파헤치고 싶습니다.',
}

interface CharactorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CharactorModal({ isOpen, onClose }: CharactorModalProps) {
  const router = useRouter()
  const { selectedCharacter, setSelectedCharacter, openModal, modalProps } = useModalStore()
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const { isLogin } = useAccountStore()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportSubmitted, setReportSubmitted] = useState(false)


  const variant = modalProps?.variant || 'default'

  const { 
    data: chatBotData,
    isLoading: chatBotLoading,
    error: chatBotError,
    refetch,
  } = ReqGetChatBot(Number(selectedCharacter?.id))

  const bridgeExampleData = (exampleData: string) => {
    try {
      if (!exampleData) return []

      // 예시 데이터를 더블 개행으로 분리
      const exampleDataArray = exampleData.split('\n\n').filter(Boolean)

      // 빈 배열 체크
      if (!exampleDataArray.length) return []

      return exampleDataArray.map(item => {
        const lines = item.split('\n').filter(Boolean)
        let title = '',
          user = '',
          character = ''

        // 각 줄을 순회하며 데이터 형식 확인
        lines.forEach(line => {
          if (line.startsWith('Title: ')) {
            title = line.replace('Title: ', '')
          } else if (line.startsWith('User: ')) {
            user = line.replace('User: ', '')
          } else if (line.startsWith('Character: ')) {
            character = line.replace('Character: ', '')
          }
        })

        // 값이 없을 경우 기본값 설정
        return {
          title: title || '제목 없음',
          User: user || '',
          Character: character || '',
        }
      })
    } catch (error) {
      console.error('대화 예시 파싱 에러:', error)
      return [] // 에러 발생 시 빈 배열 반환
    }
  }

  const exampleDatas = chatBotData?.chrbot?.example ? bridgeExampleData(chatBotData.chrbot.example) : []
  const isExampleShow = chatBotData?.chrbot?.example_show_yn

  const content = chatBotData?.chrbot?.content
  const isContentShow = chatBotData?.chrbot?.content_show_yn

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
  const handleStartChat = () => {
    if (selectedCharacter && selectedCharacter.id) {
      if (!isLogin) {
        openModal('login')
        return
      }

      handleClose()
      const chatId = String(selectedCharacter.id).trim()
      if (chatId) {
        router.push(`/chat/${chatId}`)
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
      openModal('login')
      return
    }
    setIsReportModalOpen(true)
  }

  const handleReportSubmit = async (reportData: any) => {
    try {
      // 여기에 실제 신고 API 호출 로직 구현
      console.log('Report submitted:', reportData)

      const response = await contentApi.ReportChatBot(10, Number(selectedCharacter?.id), 67, reportData, 'KR')
      const responseData = response.data

      console.log('responseData : ', responseData)

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

  if (!selectedCharacter) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      className="mx-auto w-full h-[90vh] flex flex-col"
      showCloseButton={false}
      hideHeader={true}
    >
      {/* 모달 헤더 */}
      <div className="flex items-center justify-between border-b border-secondary-100 dark:border-dark-secondary-800 pb-4 px-4">
        <h1 className="text-xl font-bold text-secondary-900 dark:text-dark-secondary-100">
          {selectedCharacter.name || '이름 없음'}
        </h1>
        <div className="flex items-center gap-2">
          {variant === 'default' ? (
            <button
              onClick={handleReport}
              className="w-9 h-9 rounded-full bg-secondary-100 dark:bg-dark-secondary-800 text-secondary-500 dark:text-dark-secondary-400 hover:bg-secondary-200 dark:hover:bg-dark-secondary-700 transition-colors flex items-center justify-center"
            >
              <Siren className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCreateCharacter}
              className="w-9 h-9 rounded-full bg-secondary-100 dark:bg-dark-secondary-800 text-secondary-500 dark:text-dark-secondary-400 hover:bg-secondary-200 dark:hover:bg-dark-secondary-700 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faUserEdit} className="h-4 w-4" />
            </button>
          )}
          <div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-secondary-100 dark:bg-dark-secondary-800 text-secondary-500 dark:text-dark-secondary-400 hover:bg-secondary-200 dark:hover:bg-dark-secondary-700 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        {/* 좌측: 캐릭터 이미지와 기본 정보 (PC 레이아웃) */}
        <div className="md:w-[40%] p-5 overflow-y-auto">
          <div className="h-full flex flex-col items-start">
            {/* 이미지 영역 */}
            <div className="h-full min-h-[650px] relative mb-6 w-full flex items-center justify-center">
              {selectedCharacter.imageUrl && (
                <>
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-secondary-100 dark:bg-dark-secondary-800 transition-opacity duration-300 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/50 to-transparent dark:from-primary-900/20 dark:to-transparent rounded-2xl opacity-70 z-0"></div>
                    <Image
                      src={selectedCharacter.imageUrl}
                      alt={selectedCharacter.name || '캐릭터 이미지'}
                      fill
                      priority
                      style={{ objectFit: 'fill' }}
                      className="transition-opacity duration-300 z-10 opacity-100"
                      onLoadingComplete={() => setIsImageLoaded(true)}
                    />
                  </div>
                  {/* 19세 이상 뱃지 */}
                  {selectedCharacter.isAdult && (
                    <div className="absolute top-3 left-3 z-20 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center shadow-md backdrop-blur-sm">
                      <FontAwesomeIcon icon={faShieldHalved} className="mr-1.5 h-3.5 w-3.5" />
                      19+
                    </div>
                  )}
                </>
              )}
            </div>
            {/* 좋아요 & 댓글 수 */}
            <div className="flex justify-end items-end w-full mb-6 gap-6">
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
            </div>

            {/* 해시태그 */}
            <div className="flex flex-wrap justify-start gap-2 mb-4">
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
            <div className="w-full mt-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-primary-900/70 dark:to-dark-secondary-900/70 rounded-lg border border-secondary-100 dark:border-dark-secondary-800/30">
              <div className="p-4">
                <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-700 dark:from-dark-primary-300 dark:to-dark-secondary-300">
                    캐릭터 소개
                  </span>
                </h3>
                <p className="text-secondary-800 dark:text-dark-secondary-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {selectedCharacter.description || '캐릭터에 대한 간략한 설명이 없습니다.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 캐릭터 상세 설명 및 대화 예시 */}
        <div className="md:w-[60%] h-full overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* 첫 번째 섹션: 캐릭터 소개 */}
            {isContentShow == 1 && (
              <div className="bg-white dark:bg-dark-secondary-900/30 rounded-lg p-5 shadow-sm mb-5 border border-secondary-100 dark:border-dark-secondary-800/30">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center">
                  <span className="w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block"></span>
                  상세 설명
                </h3>
                <p className="text-secondary-700 dark:text-dark-secondary-300 text-sm leading-relaxed">
                  {content || '설명이 없습니다.'}
                </p>
              </div>
            )}
            {/* 대화 예시 섹션 */}
            {isExampleShow == 1 && (
              <div className="bg-white dark:bg-dark-secondary-900/30 rounded-lg p-5 shadow-sm mb-5 border border-secondary-100 dark:border-dark-secondary-800/30">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center">
                  <span className="w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block"></span>
                  대화 예시
                </h3>
                <div className="space-y-4">
                  {exampleDatas.map((data, index) => (
                    <div
                      key={index}
                      className="border-b border-secondary-100 dark:border-dark-secondary-800 last:border-0 pb-4 last:pb-0"
                    >
                      <h4 className="text-sm font-medium text-secondary-800 dark:text-dark-secondary-200 mb-2">
                        {data.title}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-secondary-100 dark:bg-dark-secondary-700 flex items-center justify-center flex-shrink-0 text-secondary-500">
                            <FontAwesomeIcon icon={faUser} className="w-3 h-3" />
                          </div>
                          <div className="p-2 bg-secondary-50 dark:bg-dark-secondary-800/50 rounded-lg text-sm">
                            {data.Character}
                          </div>
                        </div>
                        <div className="flex items-start justify-end space-x-2">
                          <div className="p-2 bg-primary-50 dark:bg-dark-primary-900/30 rounded-lg text-sm text-end">
                            {data.User}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 세 번째 섹션: 첫 메시지 */}
            <div className="h-full bg-white dark:from-dark-secondary-800/50 dark:to-dark-primary-900/30 rounded-lg p-5 shadow-sm border border-secondary-100 dark:border-dark-secondary-800/30">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 flex items-center">
                <span className="w-1.5 h-5 bg-primary-500 rounded-full mr-2 inline-block"></span>첫 메시지
              </h3>
              <div className="flex flex-col justify-between h-full">
                <div className="p-4 flex flex-col justify-between bg-white/80 dark:bg-dark-secondary-900/50 rounded-lg h-full">
                  <div>
                    {mockFirstMessage.situation && (
                      <p className="text-xs text-secondary-500 dark:text-dark-secondary-400 mb-2 italic">
                        {mockFirstMessage.situation}
                      </p>
                    )}
                    <div className="flex items-start mb-6">
                      <div className="relative flex-shrink-0 mr-3">
                        {/* 캐릭터 프로필 이미지 */}
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-800 shadow-sm">
                          {selectedCharacter.imageUrl ? (
                            <Image
                              src={selectedCharacter.imageUrl}
                              alt={selectedCharacter.name || '캐릭터'}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                              <FontAwesomeIcon icon={faUser} className="text-primary-500 dark:text-primary-400" />
                            </div>
                          )}
                        </div>

                        {/* 온라인 상태 표시 (녹색 점) */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-background"></div>
                      </div>

                      {/* 말풍선 */}
                      <div className="relative max-w-[85%]">
                        {/* 캐릭터 이름 */}
                        <div className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
                          {selectedCharacter.name || '캐릭터'}
                        </div>

                        {/* 말풍선 내용 */}
                        <div className="bg-primary-50 dark:bg-primary-900/30 text-secondary-800 dark:text-secondary-200 p-3 rounded-lg rounded-tl-none shadow-sm border border-primary-100 dark:border-primary-800/50">
                          <p className="text-sm leading-relaxed">
                            {selectedCharacter?.first_talk || '첫 메시지가 없습니다.'}
                          </p>
                        </div>

                        {/* 시간 표시 */}
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={handleStartChat}
                      className="w-full flex items-center justify-center rounded-lg bg-primary-500 px-6 py-4 font-medium text-white transition-all hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600"
                    >
                      <FontAwesomeIcon icon={faComment} className="mr-2" />
                      대화 시작하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 레이아웃 */}
        {/* 상단: 이미지 섹션 */}
        <div className="md:hidden w-full h-[40vh] relative bg-gradient-to-b from-primary-100 to-primary-50 dark:from-dark-primary-900 dark:to-dark-primary-800">
          {selectedCharacter.imageUrl && (
            <>
              <div
                className={`absolute inset-0 flex items-center justify-center bg-secondary-100 dark:bg-dark-secondary-800 transition-opacity duration-300 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
              >
                <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
              </div>
              <Image
                src={selectedCharacter.imageUrl}
                alt={selectedCharacter.name || '캐릭터 이미지'}
                fill
                priority
                style={{ objectFit: 'fill' }}
                className={`transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoadingComplete={() => setIsImageLoaded(true)}
              />
              {/* 19세 이상 뱃지 */}
              {selectedCharacter.isAdult && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center shadow-md">
                  <FontAwesomeIcon icon={faShieldHalved} className="mr-1.5 h-3.5 w-3.5" />
                  19+
                </div>
              )}
            </>
          )}
        </div>

        {/* 하단: 캐릭터 정보 및 콘텐츠 */}
        <div className="md:hidden flex-1 overflow-y-auto p-4">
          {/* 좋아요 & 댓글 수 */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLike}>
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

          {/* 해시태그 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCharacter.hashtags?.slice(0, 5).map((tag: string, index: number) => (
              <span
                key={`tag-${index}`}
                className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs text-primary-700 dark:bg-dark-primary-900 dark:text-dark-primary-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 캐릭터 소개 */}
          <div className="mb-4 w-full bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-primary-900/70 dark:to-dark-secondary-900/70 rounded-lg border border-secondary-100 dark:border-dark-secondary-800/30 overflow-hidden">
            <div className="p-4 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-3 flex items-center">
                <span className="w-1.5 h-5 bg-primary-500 dark:bg-dark-primary-400 rounded-full mr-2 inline-block"></span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-700 dark:from-dark-primary-300 dark:to-dark-secondary-300">
                  캐릭터 소개
                </span>
              </h3>
              <p className="text-secondary-800 dark:text-dark-secondary-200 text-sm pl-3 border-l-2 border-primary-200 dark:border-dark-primary-700">
                {selectedCharacter.detailDescription || selectedCharacter.description || '설명이 없습니다.'}
              </p>
            </div>
          </div>

          {/* 첫 메시지 미리보기 */}
          <div className="mb-4 bg-secondary-50 dark:bg-dark-secondary-800 rounded-lg p-4">
            <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-2 flex items-center">
              <span className="w-1.5 h-4 bg-primary-500 rounded-full mr-2 inline-block"></span>첫 메시지
            </h3>
            <div className="p-3 bg-white/80 dark:bg-dark-secondary-900/50 rounded-lg">
              {mockFirstMessage.situation && (
                <p className="text-xs text-secondary-500 dark:text-dark-secondary-400 mb-2">
                  {mockFirstMessage.situation}
                </p>
              )}
              <p className="text-secondary-700 dark:text-dark-secondary-300 text-sm">{selectedCharacter?.first_talk}</p>
            </div>
          </div>

          {/* 대화 시작 버튼 */}
          <button
            onClick={handleStartChat}
            className="w-full flex items-center justify-center rounded-lg bg-primary-500 px-6 py-3.5 font-medium text-white transition-colors hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600 shadow-sm"
          >
            <FontAwesomeIcon icon={faComment} className="mr-2" />
            대화 시작하기
          </button>
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
