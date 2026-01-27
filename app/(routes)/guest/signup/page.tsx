'use client'

import LoginModal from '@/components/modal/LoginModal'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GuestSignupPage() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const handleClose = () => {
    setIsOpen(false)
    window.history.back()
  }

  return (
   <LoginModal
    isOpen={isOpen}
    onClose={handleClose}
    chrbot_key={null}
   />
  )
}