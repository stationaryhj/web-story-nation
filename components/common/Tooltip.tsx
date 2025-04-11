'use client'

import React, { ReactElement } from 'react'
import Tippy, { TippyProps } from '@tippyjs/react'
import { followCursor } from 'tippy.js'
import type { Placement } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import 'tippy.js/animations/scale.css'

interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
  theme?: 'light' | 'dark' | 'translucent'
  animation?: 'scale' | 'shift-away' | 'shift-toward' | 'perspective'
  delay?: [number, number] // [지연시간, 사라짐 지연시간]
  maxWidth?: number | 'none'
  interactive?: boolean
  allowHtml?: boolean
  followCursor?: boolean | 'horizontal' | 'vertical' | 'initial'
  offset?: [number, number] // [skid, distance]
}

const Tooltip = ({
  content,
  children,
  position = 'top',
  theme = 'dark',
  animation = 'scale',
  delay = [300, 100],
  maxWidth = 300,
  interactive = false,
  allowHtml = false,
  followCursor: follow = false,
  offset = [0, 8],
}: TooltipProps) => {
  // tippy 라이브러리에서 사용하는 placement 값으로 매핑
  const placementMap: Record<string, Placement> = {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
  }

  // HTML 컨텐츠 생성
  const getContent = () => {
    if (allowHtml && typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />
    }

    // ReactNode를 ReactElement로 변환 (null이나 undefined인 경우 빈 span 반환)
    if (!content) {
      return <span />
    }

    // 문자열인 경우 span으로 래핑
    if (typeof content === 'string') {
      return <span>{content}</span>
    }

    // React 요소인 경우 그대로 반환
    return content as React.ReactElement
  }

  return (
    <Tippy
      content={getContent()}
      placement={placementMap[position]}
      theme={theme}
      animation={animation}
      delay={delay}
      maxWidth={maxWidth}
      interactive={interactive}
      arrow={true}
      offset={offset}
      plugins={follow ? [followCursor] : []}
      followCursor={follow}
    >
      {children}
    </Tippy>
  )
}

export default Tooltip
