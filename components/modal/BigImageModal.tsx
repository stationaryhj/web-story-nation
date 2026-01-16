'use client'

import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
export default function BigImageModal({isOpen, imgUrl, onClose}: {isOpen: boolean, imgUrl: string, onClose: () => void}) {
  const handleClose = () => {
    onClose()
  }

  return (
    <div onClick={handleClose} style={{
      display: isOpen ? 'block' : 'none'
    }}>
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-none transition-all duration-300"
        style={{
          minHeight: '100vh',
          top: 0,
          left: 0,
          right: 0,
          position: 'fixed',
          zIndex: 200,
        }}
      >
        <Image src={imgUrl} alt="big image" fill className="object-contain" />

        <div className={`relative flex justify-end p-3 pb-0 flex-shrink-0`}>
          <button
            onClick={onClose}
            className="text-white transition-colors hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:text-dark-secondary-300 "
            aria-label="닫기"
          >
            <FontAwesomeIcon icon={faTimes} className="h-8 w-8" />
          </button>
        </div>
      </div>
    </div>
  )
}
