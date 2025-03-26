'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faXmarkCircle, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 애니메이션 후 완전히 제거
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`flex items-center px-4 py-3 rounded-lg shadow-lg ${
              type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            <FontAwesomeIcon
              icon={type === 'success' ? faCheckCircle : faXmarkCircle}
              className={`mr-2 ${type === 'success' ? 'text-green-500' : 'text-red-500'}`}
            />
            <span className="font-medium">{message}</span>
            <button onClick={() => setIsVisible(false)} className="ml-4 text-gray-500 hover:text-gray-700">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
