'use client'

import Image from 'next/image'
import { getImageUri } from '@/lib/utils/storyNationUtil'
import { cn } from '@/src/shared/lib/utils/cn'
import { TextBubble } from '@/src/shared/ui/chat-bubble'
import VoiceBubble from '@/src/shared/ui/chat-bubble/VoiceBubble'
import CheckIcon from '@/src/shared/ui/icons/CheckIcon'
import CloseIcon from '@/src/shared/ui/icons/CloseIcon'
import DeleteIcon from '@/src/shared/ui/icons/DeleteIcon'
import EditIcon from '@/src/shared/ui/icons/EditIcon'
import type { FlatMessage } from '../../../model/intro/introMessage'
import type { MultiImageData } from '@/services/interface'

const BUBBLE_ACTIONS = [
  { key: 'delete', icon: DeleteIcon },
  { key: 'edit', icon: EditIcon },
] as const

const EDIT_ACTIONS = [
  { key: 'cancel', icon: CloseIcon },
  { key: 'confirm', icon: CheckIcon },
] as const

interface BubbleItemProps {
  msg: FlatMessage
  isCharacter: boolean
  isEditing: boolean
  editingText: string
  showMarker: boolean
  multiImages: MultiImageData[]
  onAction: (key: string, msgId: string, text: string) => void
  onEditChange: (text: string) => void
  onEditKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onCursorSet: (msgId: string) => void
  displayText: (text: string) => string
}

export default function BubbleItem({
  msg,
  isCharacter,
  isEditing,
  editingText,
  showMarker,
  multiImages,
  onAction,
  onEditChange,
  onEditKeyDown,
  onCursorSet,
  displayText,
}: BubbleItemProps) {
  const actions = isEditing ? EDIT_ACTIONS : BUBBLE_ACTIONS

  const actionButtons = (
    <div className="flex gap-x-1.5">
      {actions.map(action => {
        const Icon = action.icon
        return (
          <button
            key={action.key}
            type="button"
            className="rounded-full p-1 hover:bg-v2-gray-400"
            onClick={e => {
              e.stopPropagation()
              onAction(action.key, msg.id, msg.text)
            }}
          >
            <Icon className="text-v2-gray-700" size={16} />
          </button>
        )
      })}
    </div>
  )

  const renderBubble = () => {
    if (isEditing) {
      return (
        <div
          className={cn(
            'flex flex-1 rounded-xl px-[11px] py-2',
            isCharacter ? 'bg-v2-gray-200 text-black' : 'bg-v2-purple text-white'
          )}
          style={{ maxWidth: '252px' }}
        >
          <textarea
            className={cn(
              'w-full resize-none whitespace-pre-wrap text-left text-[15px] leading-[1.4] outline-none [field-sizing:content]',
              isCharacter ? 'bg-white text-black' : 'bg-[#3C309E] text-white'
            )}
            value={editingText}
            rows={1}
            onChange={e => onEditChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
        </div>
      )
    }
    switch (msg.type) {
      case 'image': {
        const key = Number(msg.text.replace(/[[\]]/g, ''))
        const imgData = multiImages.find(img => img.chrbot_multi_image_key === key)
        if (!imgData) return <TextBubble text={msg.text} isUser={!isCharacter} />
        return (
          <div className="h-[160px] w-[160px] overflow-hidden rounded-xl">
            <Image
              src={getImageUri(imgData.img_url)}
              alt={`image-${key}`}
              width={160}
              height={160}
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>
        )
      }
      case 'voice':
        return <VoiceBubble text={msg.text} />
      default:
        return <TextBubble text={displayText(msg.text)} isUser={!isCharacter} />
    }
  }

  const bubbleContent = renderBubble()

  return (
    <div className="w-full">
      <div
        className={cn(
          'flex w-full cursor-pointer items-center gap-x-3 hover:bg-v2-gray-50',
          isCharacter ? 'rounded-l-2xl rounded-r-xl' : 'justify-end rounded-l-xl rounded-r-2xl'
        )}
        onClick={() => onCursorSet(msg.id)}
      >
        {isCharacter ? (
          <>
            {bubbleContent}
            {actionButtons}
          </>
        ) : (
          <>
            {actionButtons}
            {bubbleContent}
          </>
        )}
      </div>
      {showMarker && (
        <div className="flex w-full items-center justify-center py-3">
          <div className="h-px flex-1 border-t border-dashed border-v2-black-50" />
          <div className="w-fit rounded-full bg-v2-black-50 px-[8px] py-[3px] text-[11px] font-semibold text-white">
            현재위치
          </div>
          <div className="h-px flex-1 border-t border-dashed border-v2-black-50" />
        </div>
      )}
    </div>
  )
}
