import type { DmSpeaker } from '@/src/features/edit-character/model/dmFormTypes'

// ─── 타입 ───

export type Speaker = DmSpeaker
export type MessageType = 'text' | 'voice' | 'image'

export interface FlatMessage {
  id: string
  speaker: Speaker
  text: string
  type: MessageType
}

export interface BubbleGroup {
  id: string
  speaker: Speaker
  messages: { id: string; text: string }[]
}

export interface RenderGroup {
  speaker: Speaker
  messages: FlatMessage[]
}

// ─── 상수 ───

export const MAX_INPUT_LENGTH = 700
export const VOICE_PREFIX = '[voice]'
export const IMAGE_PATTERN = /^\[(\d+|hash:[^\]]+)\]$/

export const createImageToken = (id: string) => `[${id}]`

export const parseImageToken = (text: string) => {
  const match = text.match(/^\[(.+)\]$/)
  return match ? match[1] : null
}

// ─── 유틸 ───

/** 고유 ID 생성 */
export const uid = () => crypto.randomUUID()

/** 저장용 버블 그룹을 개별 메시지 배열로 펼침. voice/image 접두사를 파싱하여 타입을 분리*/
export const groupsToFlat = (groups: BubbleGroup[]): FlatMessage[] =>
  groups.flatMap(g =>
    g.messages.map(m => {
      const isVoice = m.text.startsWith(VOICE_PREFIX)
      const isImage = IMAGE_PATTERN.test(m.text)
      return {
        id: m.id,
        speaker: g.speaker,
        text: isVoice ? m.text.slice(VOICE_PREFIX.length) : m.text,
        type: (isVoice ? 'voice' : isImage ? 'image' : 'text') as MessageType,
      }
    })
  )

/** 개별 메시지 배열을 저장용 버블 그룹으로 묶음. 같은 speaker의 연속 메시지를 하나의 그룹으로 합치고, voice 타입은 접두사를 복원함 */
export const flatToGroups = (msgs: FlatMessage[]): BubbleGroup[] => {
  const result: BubbleGroup[] = []
  for (const msg of msgs) {
    const storedText = msg.type === 'voice' ? `${VOICE_PREFIX}${msg.text}` : msg.text
    const last = result.at(-1)
    if (last && last.speaker === msg.speaker) {
      last.messages.push({ id: msg.id, text: storedText })
    } else {
      result.push({ id: uid(), speaker: msg.speaker, messages: [{ id: msg.id, text: storedText }] })
    }
  }
  return result
}

/** 개별 메시지 배열을 화면 표시용 그룹으로 묶는다. 같은 speaker의 연속 메시지를 하나의 채팅 블록으로 합친다. */
export const groupForRender = (msgs: FlatMessage[]): RenderGroup[] => {
  const result: RenderGroup[] = []
  for (const msg of msgs) {
    const last = result.at(-1)
    if (last && last.speaker === msg.speaker) {
      last.messages.push(msg)
    } else {
      result.push({ speaker: msg.speaker, messages: [msg] })
    }
  }
  return result
}
