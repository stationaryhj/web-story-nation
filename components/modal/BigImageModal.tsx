'use client'

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
          zIndex: 100,
        }}
      >
        <Image src={imgUrl} alt="big image" fill className="object-contain" />
      </div>
    </div>
  )
}
