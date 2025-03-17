'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
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
            onClick={onClose}
          />
          
          {/* 모달 컨테이너 */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div 
              className="relative w-full max-w-md mx-auto bg-white dark:bg-dark-background-light rounded-xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* 헤더 - 닫기 버튼 */}
              <div className="absolute top-2 right-2 z-10">
                <button 
                  onClick={onClose}
                  className="text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors p-2"
                  aria-label="닫기"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              </div>
              
              {/* 로그인 버튼 컨테이너 */}
              <div className="p-8">
                <div className="space-y-4">
                  {/* Google 로그인 */}
                  <button 
                    className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-300 transition-colors flex items-center justify-center"
                    onClick={() => console.log('Google 로그인')}
                  >
                    Google 계정으로 로그인
                  </button>
                  
                  {/* Apple 로그인 */}
                  <button 
                    className="w-full py-3 px-4 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => console.log('Apple 로그인')}
                  >
                    Apple 계정으로 로그인
                  </button>
                  
                  {/* Kakao 로그인 */}
                  <button 
                    className="w-full py-3 px-4 bg-[#FEE500] hover:bg-[#FDD835] text-[#3A1D1D] font-medium rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => console.log('Kakao 로그인')}
                  >
                    Kakao 계정으로 로그인
                  </button>
                  
                  {/* Naver 로그인 */}
                  <button 
                    className="w-full py-3 px-4 bg-[#03C75A] hover:bg-[#02B350] text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => console.log('Naver 로그인')}
                  >
                    Naver 계정으로 로그인
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
