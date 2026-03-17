'use client'

import { AIMessageLayout, Avatar, UserMessageLayout } from '@/src/shared/ui/chat-bubble'
import { useIntroMessages } from '@/src/widgets/edit-character/ui/forms/intro/model/useIntroMessages'
import BubbleItem from './intro/BubbleItem'
import IntroInput from './intro/IntroInput'

export default function IntroForm() {
  const {
    inputText,
    editing,
    cursorAfterMsgId,
    ttsMode,
    textareaRef,
    messages,
    grouped,
    multiImages,
    activeSpeaker,
    characterName,
    profileUrl,
    speakers,
    totalLength,
    introBubblesError,
    setCursorAfterMsgId,
    setActiveSpeaker,
    handleChange,
    handleEditChange,
    handleEditKeyDown,
    handleBubbleAction,
    handleActionButton,
    handleSend,
    handleKeyDown,
    displayText,
  } = useIntroMessages()

  return (
    <div className="inset-0 mx-auto flex h-full max-w-[830px] flex-col">
      {/* 채팅 영역 */}
      <div className="show-scrollbar flex flex-1 flex-col gap-y-3 overflow-y-auto px-4 py-[25px]">
        {messages.length === 0 && (
          <>
            <AIMessageLayout avatar={<Avatar className="h-[26px] w-[26px]" />}>
              <div
                className="w-fit whitespace-pre-wrap rounded-xl bg-v2-gray-100 px-[11px] py-2 text-left text-[15px] leading-[1.4] text-black"
                style={{ maxWidth: '252px' }}
              >
                하단 입력창에서 <span className="font-bold text-v2-red">{characterName || '캐릭터 이름'}</span>을
                선택하고 메시지를 전송해 보세요.
              </div>
            </AIMessageLayout>
            <UserMessageLayout>
              <div
                className="w-fit whitespace-pre-wrap rounded-xl bg-v2-purple px-[11px] py-2 text-left text-[15px] leading-[1.4] text-white"
                style={{ maxWidth: '252px' }}
              >
                하단 입력창에서 <span className="font-bold">사용자</span>를 선택하고 메시지를 전송해 보세요.
              </div>
            </UserMessageLayout>
          </>
        )}
        {grouped.map(group => {
          const isCharacter = group.speaker === 'character'
          const Layout = isCharacter ? AIMessageLayout : UserMessageLayout
          const layoutProps = isCharacter ? { avatar: <Avatar className="h-[26px] w-[26px]" src={profileUrl} /> } : {}

          return (
            <div key={group.messages[0].id}>
              <Layout {...layoutProps}>
                {group.messages.map(msg => (
                  <BubbleItem
                    key={msg.id}
                    msg={msg}
                    isCharacter={isCharacter}
                    isEditing={editing?.id === msg.id}
                    editingText={editing?.id === msg.id ? editing.text : ''}
                    showMarker={cursorAfterMsgId === msg.id}
                    multiImages={multiImages}
                    onAction={handleBubbleAction}
                    onEditChange={handleEditChange}
                    onEditKeyDown={handleEditKeyDown}
                    onCursorSet={setCursorAfterMsgId}
                    displayText={displayText}
                  />
                ))}
              </Layout>
            </div>
          )
        })}
      </div>

      {/* 입력 영역 */}
      <IntroInput
        inputText={inputText}
        ttsMode={ttsMode}
        activeSpeaker={activeSpeaker}
        speakers={speakers}
        totalLength={totalLength}
        introBubblesError={introBubblesError}
        textareaRef={textareaRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
        onActionButton={handleActionButton}
        onSpeakerChange={setActiveSpeaker}
      />
    </div>
  )
}
