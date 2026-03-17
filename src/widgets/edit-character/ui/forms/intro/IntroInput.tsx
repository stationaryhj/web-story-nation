'use client'

import type { FieldError } from 'react-hook-form'
import { cn } from '@/src/shared/lib/utils/cn'
import SendIcon from '@/src/shared/ui/icons/SendIcon'
import TTSPlayIcon from '@/src/shared/ui/icons/TTSPlayIcon'
import UploadGalleryIcon from '@/src/shared/ui/icons/UploadGalleryIcon'
import { MAX_INPUT_LENGTH } from '@/src/widgets/edit-character/ui/forms/intro/model/introMessage'
import type { Speaker } from '@/src/widgets/edit-character/ui/forms/intro/model/introMessage'

const ACTION_BUTTONS = [
  { key: 'image', label: '이미지', icon: UploadGalleryIcon },
  { key: 'tts', label: '음성', icon: TTSPlayIcon },
  { key: 'userVar', label: '{{user}}', icon: null },
] as const

interface IntroInputProps {
  inputText: string
  ttsMode: boolean
  activeSpeaker: Speaker
  speakers: { key: Speaker; label: string }[]
  totalLength: number
  introBubblesError: FieldError | undefined
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  onActionButton: (key: string) => void
  onSpeakerChange: (speaker: Speaker) => void
}

export default function IntroInput({
  inputText,
  ttsMode,
  activeSpeaker,
  speakers,
  totalLength,
  introBubblesError,
  textareaRef,
  onChange,
  onKeyDown,
  onSend,
  onActionButton,
  onSpeakerChange,
}: IntroInputProps) {
  return (
    <div className="px-4">
      <div className="py-3 text-right">
        <p className="text-xs text-v2-gray-700">
          {totalLength}/{MAX_INPUT_LENGTH}
        </p>
      </div>
      <div
        className={cn(
          'flex flex-col gap-y-4 rounded-2xl border border-v2-gray-50 px-4 py-[15px] shadow-[0_3px_3px_0_rgba(0,0,0,0.03)]',
          introBubblesError && 'border-v2-red'
        )}
      >
        <div className="flex items-center gap-x-2">
          {speakers.map(speaker => {
            const isActive = activeSpeaker === speaker.key
            return (
              <button
                key={speaker.key}
                type="button"
                className={cn(
                  'h-7 rounded-lg px-[10px] py-[6px] text-xs font-semibold leading-[1.4] active:opacity-70',
                  isActive
                    ? 'bg-v2-black-50 text-white hover:bg-[#444444]'
                    : 'bg-v2-gray-100 text-black hover:bg-[#E9EAEB]'
                )}
                onClick={() => onSpeakerChange(speaker.key)}
              >
                {speaker.label}
              </button>
            )
          })}
        </div>
        <textarea
          ref={textareaRef}
          className={cn(
            'max-h-[calc(1.4em*8)] w-full resize-none overflow-y-auto leading-[1.4] outline-none [field-sizing:content] placeholder:text-v2-gray-700',
            introBubblesError && 'placeholder:text-v2-red'
          )}
          spellCheck={false}
          rows={1}
          placeholder={
            introBubblesError
              ? introBubblesError.message
              : ttsMode
                ? '음성으로 변환할 대사를 입력해주세요.'
                : '대사를 입력해주세요.'
          }
          maxLength={MAX_INPUT_LENGTH}
          value={inputText}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
        <div className="flex justify-between">
          <div className="flex gap-x-2">
            {ACTION_BUTTONS.filter(action => (activeSpeaker === 'user' ? action.key === 'userVar' : true)).map(
              action => {
                const Icon = action.icon
                const isTtsActive = action.key === 'tts' && ttsMode
                return (
                  <button
                    key={action.key}
                    type="button"
                    className={cn(
                      'flex h-7 items-center gap-x-1 rounded-full border px-[10px] py-[5.5px] text-xs font-medium',
                      isTtsActive
                        ? 'border-v2-black-50 bg-v2-black-50 text-white'
                        : 'border-v2-gray-50 text-black hover:bg-v2-gray-100'
                    )}
                    onClick={() => onActionButton(action.key)}
                  >
                    {Icon && <Icon size={16} className={isTtsActive ? 'text-white' : 'text-black'} />}
                    {action.label}
                  </button>
                )
              }
            )}
          </div>
          <button type="button" onClick={onSend}>
            <SendIcon size={24} className="text-v2-purple hover:opacity-70 active:opacity-70" />
          </button>
        </div>
      </div>
    </div>
  )
}
