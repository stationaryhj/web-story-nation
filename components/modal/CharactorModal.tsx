'use client'

import { useRouter } from 'next/navigation'
import { useModalStore } from '@/store/useStoreModal'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faHeart, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons'

interface CharactorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CharactorModal({ isOpen, onClose }: CharactorModalProps) {
  const router = useRouter()
  const { selectedCharacter, setSelectedCharacter } = useModalStore()
  
  // 모달이 닫힐 때 선택된 캐릭터 초기화
  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSelectedCharacter(null)
    }, 300) // 애니메이션 종료 후 상태 초기화
  }
  
  // 대화 시작 버튼 클릭 시 채팅 페이지로 이동
  const handleStartChat = () => {
    if (selectedCharacter) {
      handleClose()
      router.push(`/chat/${selectedCharacter.id}`)
    }
  }
  
  if (!selectedCharacter) return null
  
  // 테스트용 더미 텍스트 생성
  const dummyText = Array(20).fill(
    "이것은 스크롤 테스트를 위한 더미 텍스트입니다. 모달 내용이 많을 때 스크롤이 제대로 작동하는지 확인하기 위한 용도입니다. "
  ).join('')
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* 배경 오버레이 */}
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          {/* 모달 컨테이너 - 전체 화면 높이와 최대 너비 1248px */}
          <div className="flex items-center justify-center min-h-screen p-2 md:p-4">
            <motion.div 
              className="relative w-full max-w-[1248px] h-[95vh] md:h-[90vh] mx-auto bg-white dark:bg-dark-background-light rounded-xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* 헤더 - 배경 추가하여 가시성 향상 */}
              <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-30 bg-gradient-to-b from-black/90 via-black/70 to-transparent h-20 md:h-24">
                <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                  {selectedCharacter.name}
                </h2>
                <button 
                  onClick={handleClose}
                  className="text-white hover:text-primary-300 transition-colors p-2"
                  aria-label="닫기"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl md:text-2xl" />
                </button>
              </div>
              
              {/* 모바일 뷰에서 컨텐츠 스크롤 영역 */}
              <div className="flex flex-col md:flex-row h-full">
                {/* 왼쪽 사이드바 - 캐릭터 정보 */}
                <div className="w-full md:w-1/3 bg-secondary-50 dark:bg-dark-secondary-100/5 p-6 md:p-8 pt-20 md:pt-24 h-[40vh] md:h-full overflow-y-auto border-b md:border-b-0 md:border-r border-secondary-200 dark:border-dark-secondary-200/10">
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                    <Image
                      src={selectedCharacter.imageUrl}
                      alt={selectedCharacter.name}
                      fill
                      className="object-cover"
                    />
                    
                    {selectedCharacter.isAdult && (
                      <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        19+
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-secondary-600 dark:text-dark-secondary-400 mb-4">
                    {selectedCharacter.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedCharacter.hashtags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center text-secondary-500 dark:text-dark-secondary-500">
                      <FontAwesomeIcon icon={faComment} className="text-sm mr-1" />
                      <span className="text-sm">{selectedCharacter.commentCount}</span>
                    </div>
                    
                    <div className="flex items-center text-secondary-500 dark:text-dark-secondary-500">
                      <FontAwesomeIcon icon={faHeart} className="text-sm mr-1" />
                      <span className="text-sm">151</span>
                    </div>
                  </div>
                  
                  {/* 추가 컨텐츠 - 스크롤 테스트용 */}
                  <div className="mt-6 border-t border-secondary-200 dark:border-dark-secondary-200/10 pt-6">
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-dark-secondary-700 mb-3">추가 정보</h3>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400">
                      {dummyText.substring(0, 500)}
                    </p>
                  </div>
                </div>
                
                {/* 오른쪽 메인 컨텐츠 */}
                <div className="w-full md:w-2/3 p-6 md:p-8 pt-6 md:pt-6 h-[50vh] md:h-full overflow-y-auto">
                  {/* 세계관 설명 */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-dark-secondary-700">세계관</h3>
                      <button className="text-secondary-500 dark:text-dark-secondary-500">
                        <FontAwesomeIcon icon={faChevronDown} />
                      </button>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400">
                      {selectedCharacter.description}의 세계관에 대한 자세한 설명이 여기에 표시됩니다. 
                      캐릭터가 살아가는 배경과 환경, 시대적 배경 등을 포함합니다.
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400 mt-2">
                      {dummyText.substring(0, 800)}
                    </p>
                  </div>
                  
                  {/* 캐릭터 소개 */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-dark-secondary-700">캐릭터 소개</h3>
                      <button className="text-secondary-500 dark:text-dark-secondary-500">
                        <FontAwesomeIcon icon={faChevronDown} />
                      </button>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400">
                      {selectedCharacter.description}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400 mt-2">
                      {dummyText.substring(0, 600)}
                    </p>
                  </div>
                  
                  {/* 캐릭터 배경 */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-dark-secondary-700">캐릭터 배경</h3>
                      <button className="text-secondary-500 dark:text-dark-secondary-500">
                        <FontAwesomeIcon icon={faChevronDown} />
                      </button>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400">
                      {selectedCharacter.name}의 과거와 현재, 그리고 미래에 대한 이야기입니다.
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400 mt-2">
                      {dummyText.substring(0, 1000)}
                    </p>
                  </div>
                  
                  {/* 캐릭터 관계 */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-dark-secondary-700">캐릭터 관계</h3>
                      <button className="text-secondary-500 dark:text-dark-secondary-500">
                        <FontAwesomeIcon icon={faChevronDown} />
                      </button>
                    </div>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400">
                      {selectedCharacter.name}와 관련된 다른 캐릭터들과의 관계입니다.
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-dark-secondary-400 mt-2">
                      {dummyText.substring(0, 700)}
                    </p>
                  </div>
                  
                  {/* 첫 메시지 */}
                  <div className="mb-6">
                    <div className="bg-secondary-50 dark:bg-dark-secondary-100/10 p-4 rounded-lg">
                      <div className="flex items-start mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                          <Image
                            src={selectedCharacter.imageUrl}
                            alt={selectedCharacter.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <p className="text-sm text-secondary-700 dark:text-dark-secondary-300">
                          안녕하세요! 저는 {selectedCharacter.name}입니다. 당신과 대화하게 되어 기쁩니다. 
                          어떤 이야기를 나누고 싶으신가요?
                        </p>
                      </div>
                      
                      <motion.button
                        onClick={handleStartChat}
                        className="w-full py-3 bg-primary-500 hover:bg-primary-600 dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700 text-white font-medium rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        대화 시작
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
