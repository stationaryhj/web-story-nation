'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState, useEffect } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 섹션 애니메이션 컴포넌트
export function SectionTransition({ 
  children, 
  className = '',
  delay = 0
}: PageTransitionProps & { delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: delay
      }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// 카드 애니메이션 컴포넌트
export function CardTransition({ 
  children, 
  className = '',
  index = 0
}: PageTransitionProps & { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 페이드인 애니메이션 컴포넌트
export function FadeIn({ 
  children, 
  className = '',
  delay = 0,
  direction = 'up'
}: PageTransitionProps & { 
  delay?: number,
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div className="opacity-0">{children}</div>
  }

  const directionVariants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {}
  }
  
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        ...directionVariants[direction]
      }}
      animate={{ 
        opacity: 1,
        x: 0,
        y: 0
      }}
      transition={{
        duration: 0.3,
        delay: delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
} 