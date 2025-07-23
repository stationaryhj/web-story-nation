'use client'


import { useState } from 'react'
import BaseModal from './BaseModal'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useModalStore } from '@/store/useStoreModal'

interface GalleryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GalleryModal({ isOpen, onClose }: GalleryModalProps) {
  const { selectedCharacter, openModal, modalProps } = useModalStore()

  console.log('@@ selectedCharacter :: ' , selectedCharacter)
  

  const isMobile = window.innerWidth < 768
  const variant = modalProps?.variant || 'default'


  if (!selectedCharacter) return null

  const handleClose = () => {
    onClose()
    setTimeout(() => {
    }, 300)
  }

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
      <div className="sticky top-0 z-[102] bg-white dark:bg-dark-background-light border-b border-secondary-100 dark:border-dark-secondary-800">
        {/* header */}
        <div className="flex items-center justify-between py-4 px-4">
          <div className='flex items-center justify-center w-full'>
            <h1 className="text-md md:text-xl font-bold text-secondary-900 dark:text-dark-secondary-100">
              갤러리
            </h1>
          </div>
          <div className="flex items-center justify-end gap-2">
            <div>
              <button
                onClick={handleClose}
                className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-secondary-100 dark:bg-dark-secondary-800 text-secondary-500 dark:text-dark-secondary-400 hover:bg-secondary-200 dark:hover:bg-dark-secondary-700 transition-colors flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4 md:h-6 md:w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* body */}
        <div className='flex items-center justify-between w-full'>
          <div className='p-2'>
            <span>
              캐릭터의 답장에 따라 해금됩니다!
            </span>
          </div>

          <div>
            <span>
              n/{selectedCharacter.multi_image_count}
            </span>
          </div>
        </div>

        {/* image grid */}
        <div className='grid grid-cols-3 md:grid-cols-5 gap-2 p-2'>
          {Array.from({ length: selectedCharacter.multi_image_count }).map((_, index) => (
            <div key={index} className='w-full h-full bg-secondary-100 dark:bg-dark-secondary-800 rounded-lg aspect-square'>
              이미지
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  )
}
