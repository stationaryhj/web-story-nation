import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type FieldError, useFormContext } from 'react-hook-form'
import { getImageUri } from '@/lib/utils/storyNationUtil'
import type { DmFormValues } from '@/src/features/edit-character/model/dmFormTypes'
import useModalStore from '@/src/shared/model/stores/useModalStore'
import { useTabContext } from '@/src/shared/ui/tab/Tab'
import {
  MAX_INPUT_LENGTH,
  uid,
  groupsToFlat,
  flatToGroups,
  groupForRender,
  createImageToken,
  type FlatMessage,
  type BubbleGroup,
  type Speaker,
  type MessageType,
} from '@/src/features/edit-character/model/intro/introMessage'

export function useIntroMessages() {
  const { openModal, closeModalByType } = useModalStore()
  const { setSelectedTab } = useTabContext()
  const [inputText, setInputText] = useState('')
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null)
  const [cursorAfterMsgId, setCursorAfterMsgId] = useState<string | null>(null)
  const [ttsMode, setTtsMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    watch,
    setValue,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<DmFormValues>()

  register('introBubbles', {
    validate: (value: BubbleGroup[]) => value?.length > 0 || '캐릭터 이름이 보내는 메시지를 입력해 주세요.',
  })

  const characterName = watch('name')
  const profileUrl = getImageUri(watch('imgUrl'))
  const bubbleGroups: BubbleGroup[] = watch('introBubbles') ?? []
  const multiImages = watch('multi_images') ?? []
  const activeSpeaker: Speaker = watch('introActiveSpeaker') ?? 'character'
  const introBubblesError = errors.introBubbles as FieldError | undefined

  const messages = useMemo(() => groupsToFlat(bubbleGroups), [bubbleGroups])
  const grouped = useMemo(() => groupForRender(messages), [messages])

  useEffect(() => {
    console.log('@@ intro messages :: ', messages)
  }, [messages])

  const setMessages = (updater: FlatMessage[] | ((prev: FlatMessage[]) => FlatMessage[])) => {
    const next = typeof updater === 'function' ? updater(messages) : updater
    setValue('introBubbles', flatToGroups(next), { shouldValidate: true })
  }

  const lastMsgId = messages.at(-1)?.id ?? null
  useEffect(() => {
    if (cursorAfterMsgId === null && lastMsgId) {
      setCursorAfterMsgId(lastMsgId)
    }
  }, [lastMsgId])

  const setActiveSpeaker = (speaker: Speaker) => {
    setValue('introActiveSpeaker', speaker)
    setTtsMode(false)
  }

  const speakers = useMemo(
    () => [
      { key: 'character' as const, label: characterName || '캐릭터 이름' },
      { key: 'user' as const, label: '사용자' },
    ],
    [characterName]
  )

  const messagesLength = useMemo(
    () => messages.reduce((sum, msg) => (msg.type === 'image' ? sum : sum + msg.text.length), 0),
    [messages]
  )
  const editingDelta = editing
    ? editing.text.length - (messages.find(m => m.id === editing.id)?.text.length ?? 0)
    : 0
  const totalLength = messagesLength + inputText.length + editingDelta

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const remaining = MAX_INPUT_LENGTH - messagesLength - editingDelta
      const value = e.target.value.slice(0, Math.max(0, remaining))
      setInputText(value)
    },
    [messagesLength, editingDelta]
  )

  // ─── 편집 ───

  const handleEdit = (msgId: string, text: string) => {
    setEditing({ id: msgId, text })
  }

  const handleEditChange = (text: string) => {
    if (!editing) return
    const otherLength = messagesLength - (messages.find(m => m.id === editing.id)?.text.length ?? 0)
    const remaining = MAX_INPUT_LENGTH - otherLength - inputText.length
    setEditing({ ...editing, text: text.slice(0, Math.max(0, remaining)) })
  }

  const handleEditConfirm = () => {
    if (!editing) return
    const trimmed = editing.text.trim()
    if (!trimmed) return
    setMessages(prev => prev.map(msg => (msg.id === editing.id ? { ...msg, text: trimmed } : msg)))
    setEditing(null)
  }

  const handleEditCancel = () => {
    setEditing(null)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEditConfirm()
    }
    if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const handleEditImage = (msgId: string) => {
    openModal({
      type: 'characterMedia',
      props: {
        onUpload: (key: number) => {
          if (!key) return
          setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, text: createImageToken(String(key)) } : m)))
        },
        images: getValues('multi_images'),
        mode: 'edit',
      },
    })
  }

  // ─── 버블 액션 ───

  const handleBubbleAction = (key: string, msgId: string, text: string) => {
    const msg = messages.find(m => m.id === msgId)
    switch (key) {
      case 'edit':
        if (msg?.type === 'image') {
          handleEditImage(msgId)
        } else {
          handleEdit(msgId, text)
        }
        break
      case 'delete':
        handleDelete(msgId)
        break
      case 'confirm':
        handleEditConfirm()
        break
      case 'cancel':
        handleEditCancel()
        break
    }
  }

  const handleDelete = (msgId: string) => {
    if (cursorAfterMsgId === msgId) {
      const idx = messages.findIndex(m => m.id === msgId)
      setCursorAfterMsgId(idx > 0 ? messages[idx - 1].id : null)
    }
    setMessages(prev => prev.filter(msg => msg.id !== msgId))
  }

  // ─── 이미지 업로드 ───

  const handleUploadImage = (keys: number[]) => {
    const newMessages: FlatMessage[] = keys.map(key => ({
      id: uid(),
      speaker: activeSpeaker,
      text: createImageToken(String(key)),
      type: 'image' as MessageType,
    }))

    setMessages(prev => {
      if (cursorAfterMsgId === null) return [...prev, ...newMessages]
      const idx = prev.findIndex(m => m.id === cursorAfterMsgId)
      if (idx === -1) return [...prev, ...newMessages]
      const next = [...prev]
      next.splice(idx + 1, 0, ...newMessages)
      return next
    })

    const lastId = newMessages.at(-1)?.id
    if (lastId) setCursorAfterMsgId(lastId)
  }

  const handleTabChange = () => {
    setSelectedTab('media')
    closeModalByType('characterMedia')
  }

  // ─── 액션 버튼 ───

  const handleActionButton = (key: string) => {
    switch (key) {
      case 'image':
        openModal({
          type: 'characterMedia',
          props: { onUpload: handleUploadImage, onTabChange: handleTabChange, images: getValues('multi_images') },
        })
        break
      case 'tts':
        setTtsMode(prev => !prev)
        textareaRef.current?.focus()
        break
      case 'userVar': {
        const tag = '{{user}}'
        const remaining = MAX_INPUT_LENGTH - messagesLength - inputText.length
        if (remaining >= tag.length) {
          setInputText(prev => `${prev}${tag}`)
        }
        textareaRef.current?.focus()
        break
      }
    }
  }

  const displayText = useCallback((text: string) => text, [])

  // ─── 전송 ───

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return
    const lines = text.split('\n').filter(line => line.trim() !== '')
    const newMessages: FlatMessage[] = lines.map(line => ({
      id: uid(),
      speaker: activeSpeaker,
      text: line.trim(),
      type: (ttsMode ? 'voice' : 'text') as MessageType,
    }))
    const lastNewMsgId = newMessages[newMessages.length - 1].id

    setMessages(prev => {
      if (cursorAfterMsgId === null) return [...prev, ...newMessages]
      const idx = prev.findIndex(m => m.id === cursorAfterMsgId)
      if (idx === -1) return [...prev, ...newMessages]
      const next = [...prev]
      next.splice(idx + 1, 0, ...newMessages)
      return next
    })

    setCursorAfterMsgId(lastNewMsgId)
    setInputText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    if (introBubblesError) {
      setInputText('')
    }
  }, [introBubblesError])

  return {
    // 상태
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

    // 핸들러
    setCursorAfterMsgId,
    setActiveSpeaker,
    handleChange,
    handleEditChange,
    handleEditConfirm,
    handleEditCancel,
    handleEditKeyDown,
    handleBubbleAction,
    handleActionButton,
    handleSend,
    handleKeyDown,
    displayText,
  }
}
