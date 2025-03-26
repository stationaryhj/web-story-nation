'use client'

import React, { ReactNode, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots, faPen } from '@fortawesome/free-solid-svg-icons'
import DraggableButton from '../elements/button/DraggableButton'
import IdeaShareModal from '../modal/IdeaShareModal'
import RewardModal from '../modal/RewardModal'

type DraggableButtonGridProps = {
  buttonsCount?: number
  primaryColor?: string
  secondaryColor?: string
  primaryContent?: ReactNode
  secondaryContent?: ReactNode
}

// buttonIndex는 0부터 시작
// buttonsCount는 버튼의 총 개수
// color는 버튼의 색상

export default function DraggableButtonGrid({
  buttonsCount = 2,
  // 색상 기본값 설정
  primaryColor = 'bg-[#ff90ff]',
  secondaryColor = 'bg-[#c177ff]',
  // 버튼 내용 (기본값은 아이콘)
  primaryContent,
  secondaryContent,
}: DraggableButtonGridProps) {
  // 모달 상태 관리
  const [ideaModalOpen, setIdeaModalOpen] = useState(false)
  const [rewardModalOpen, setRewardModalOpen] = useState(false)

  // 아이디어 공유 모달 열기
  const onPrimaryClick = () => {
    setIdeaModalOpen(true)
  }

  // 아이디어 제출 처리
  const handleIdeaSubmit = (idea: string) => {
    console.log('제출된 아이디어:', idea)
    // TODO: 여기에 API 호출 추가
  }

  // 보상 모달 열기
  const onSecondaryClick = () => {
    setRewardModalOpen(true)
  }

  // 기본 아이콘 컨텐츠
  const defaultPrimaryContent = (
    <div className="flex flex-col items-center justify-center">
      <FontAwesomeIcon
        icon={faCommentDots}
        className="text-[25px] lg:text-[25px] sm:text-[15px] text-[#f200b9] sm:text-[15px]"
      />
    </div>
  )

  const defaultSecondaryContent = (
    <div className="flex flex-col items-center justify-center">
      <FontAwesomeIcon icon={faPen} className="text-[25px] lg:text-[25px] sm:text-[15px] text-[#7c3aed]" />
    </div>
  )

  return (
    <>
      <DraggableButton buttonIndex={0} buttonsCount={buttonsCount} color={primaryColor} onClick={onPrimaryClick}>
        {primaryContent || defaultPrimaryContent}
      </DraggableButton>

      <DraggableButton buttonIndex={1} buttonsCount={buttonsCount} color={secondaryColor} onClick={onSecondaryClick}>
        {secondaryContent || defaultSecondaryContent}
      </DraggableButton>

      <IdeaShareModal isOpen={ideaModalOpen} onClose={() => setIdeaModalOpen(false)} onSubmit={handleIdeaSubmit} />

      <RewardModal isOpen={rewardModalOpen} onClose={() => setRewardModalOpen(false)} />
    </>
  )
}
