'use client'

import { useRouter } from 'next/navigation'
import BaseModal from './BaseModal'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { PromotionItem } from '@/types/provider'
import { getImageUri } from '@/lib/utils/storyNationUtil'
import { useMainConfigStore } from '@/store/useMainConfigStore'

interface NoticeModalProps {
  isOpen: boolean
  notice: PromotionItem
  onClose: () => void
}

export default function NoticeModal({ isOpen, notice, onClose }: NoticeModalProps) {
  const router = useRouter()
  const [noticeKey, setNoticeKey] = useState(0)
  const [imgUrl, setImgUrl] = useState('')
  const [openUrl, setOpenUrl] = useState('')
  const [isNewOpen, setIsNewOpen] = useState(false)

  // 오늘 하루 보지 않기 처리를 위한 함수
  const handleDontShowToday = () => {
    // 스토어의 함수 사용하여 해당 공지 숨김 처리
    useMainConfigStore.getState().markNoticeHiddenForToday(noticeKey)
    
    // 모달 닫기
    onClose()
  }

  useEffect(() => {
    if(notice) {
      setImgUrl(getImageUri(notice.img_url_ko))
      setNoticeKey(notice.key)
      setOpenUrl(notice.link_url_ko || '')

      setIsNewOpen(notice.action_type === 2)
    }
  }, [notice])
  
  const handleOpenUrlClick = () => {
    window.open(openUrl, '_blank')
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
      animation="fade"
      backdropColor="bg-black/70 backdrop-blur-sm"
      showCloseButton={false}
      preventBackdropClose={false}
      footerContent={null}
    >
      <div className="flex flex-col items-center py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="relative">
              <Image 
                src={imgUrl} 
                alt="스토리네이션 공지사항" 
                width={500} 
                height={800}
                className="w-full h-auto"
              />
              
              {/* 새 창 열기 클릭 영역 - 하단 버튼 영역을 제외한 전체 */}
              {isNewOpen && (
                <div 
                  className="absolute left-0 top-0 w-full h-[calc(100%-60px)] cursor-pointer" 
                  onClick={handleOpenUrlClick}
                />
              )}
              
              {/* 오늘 하루 보지 않기 클릭 영역 */}
              <div 
                className="absolute left-0 bottom-0 w-[70%] h-[60px] cursor-pointer" 
                onClick={handleDontShowToday}
              />
              
              {/* 닫기 클릭 영역 */}
              <div 
                className="absolute right-0 bottom-0 w-[30%] h-[60px] cursor-pointer" 
                onClick={onClose}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </BaseModal>
  )
}