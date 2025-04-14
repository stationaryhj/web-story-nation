'use client'

import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { createPortal } from 'react-dom'

export function ToastPortal() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <ToastContainer
      position="top-center"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      theme="light"
      style={{ zIndex: 999999 }}
    />,
    document.body
  )
}
