import { ChatMode } from '@/components/modal/ChatModeModal'
import { requestConnectedChatRoomData } from '@/services/interface'
import { useAccountStore } from '@/store/useAccountStore'
import {
  CharbotChatData,
  CharbotChatListData,
  CharbotMineData,
  ChatModeData,
  ChrbotData,
  IncomeData,
  InquiryData,
  LoginResponse,
  ModuleCharacter,
  ModuleCreater,
} from '@/types/api'

const PI_ADDRESS = process.env.NEXT_PUBLIC_PI_ADDRESS
const CHAT_FRONTEND_ADDRESS = process.env.NEXT_PUBLIC_CHAT_FRONTEND_ADDRESS
const CHAT_SERVER_ADDRESS = process.env.NEXT_PUBLIC_CHAT_SERVER_ADDRESS
const CHAT_SERVER_PORT = process.env.NEXT_PUBLIC_CHAT_SERVER_PORT

import CryptoJS from 'crypto-js'

const encryptionKey = '12345678901234567890123456789012' // 32바이트 키 (256비트)

// 백엔드 서버가 가지고있는 데이터
export interface ConversationExampleJSON {
  text_counts: number[]
  titles: string[]
  examples: {
    example: ExampleData[]
  }[]
}

export interface exampleDatas {
  index: number
  title: string
  userMsg: string
  characterMsg: string
  textLength: number
}

export const exampleDatasToConversationJson = (data: exampleDatas[]) => {
  const rValue: ConversationExampleJSON = {
    text_counts: [],
    titles: [],
    examples: [],
  }

  data.forEach(exampleData => {
    rValue.text_counts.push(exampleData.textLength || 0)
    rValue.titles.push(exampleData.title || `대화 예시 ${exampleData.index + 1}`)
    rValue.examples.push({
      example: [
        {
          speaker: '{{char}}',
          message: exampleData.characterMsg || '',
        },
        {
          speaker: '{{user}}',
          message: exampleData.userMsg || '',
        },
      ],
    })
  })
  return rValue
}

interface ExampleData {
  speaker: string
  message: string
}

// ─── DM 인트로 버블 변환 ───

export interface IntroBubbleMessage {
  id: string
  text: string
}

export interface IntroBubbleGroup {
  id: string
  speaker: 'character' | 'user'
  messages: IntroBubbleMessage[]
}

/** introBubbles → example JSON (서버 저장용) */
export const introBubblesToExampleJson = (bubbles: IntroBubbleGroup[]): ConversationExampleJSON => {
  const allMessages: ExampleData[] = []
  let totalLength = 0

  bubbles.forEach(group => {
    const speaker = group.speaker === 'character' ? '{{char}}' : '{{user}}'
    const combined = group.messages.map(msg => msg.text).join('\n')
    allMessages.push({ speaker, message: combined })
    totalLength += combined.length
  })

  return {
    text_counts: [totalLength],
    titles: ['intro'],
    examples: [{ example: allMessages }],
  }
}

/** example JSON 문자열 → introBubbles (로드 복원용) */
export const parseExampleJsonToIntroBubbles = (exampleText: string): IntroBubbleGroup[] => {
  if (!exampleText) return []

  try {
    const parsed = JSON.parse(exampleText) as ConversationExampleJSON
    if (!parsed.examples?.[0]?.example) return []

    const messages = parsed.examples[0].example
    const bubbles: IntroBubbleGroup[] = []

    messages.forEach(msg => {
      const speaker: 'character' | 'user' = msg.speaker === '{{char}}' ? 'character' : 'user'
      const lines = msg.message.split('\n')
      const groupMessages = lines.map(line => ({ id: crypto.randomUUID(), text: line }))

      const last = bubbles[bubbles.length - 1]
      if (last && last.speaker === speaker) {
        last.messages.push(...groupMessages)
      } else {
        bubbles.push({
          id: crypto.randomUUID(),
          speaker,
          messages: groupMessages,
        })
      }
    })

    return bubbles
  } catch {
    return []
  }
}

/**
  get image Uri
 */
export function getImageUri(url: string | undefined | null): string {
  // 기본 이미지 경로 (이미지가 없거나 로드에 실패한 경우 사용)
  const defaultImageUrl = '/images/placeholders/default-avatar.svg'

  if (!url) return defaultImageUrl // url이 없을 경우 기본 이미지 반환

  try {
    if (url.indexOf('kr/') > -1) {
      return url.replace('kr/', 'https://d287ta38o0t5x8.cloudfront.net/')
    } else if (url.indexOf('image/') > -1) {
      return 'https://d2gimcyf1gz7jq.cloudfront.net/' + url
    } else if (url.indexOf('promotion/') > -1) {
      return 'https://d287ta38o0t5x8.cloudfront.net/' + url
    }
    return url
  } catch (error) {
    console.error('Error processing image URL:', error)
    return defaultImageUrl // 에러 발생 시 기본 이미지 반환
  }
}

/**
 * 소셜 타입 번호 반환 함수
 * @param provider - 소셜 타입 문자열
 * @returns 소셜 타입 번호
 */
export function getSnsTypeNumber(provider: string): number {
  switch (provider.toUpperCase()) {
    case 'GUEST':
      return 0
    case 'KAKAO':
      return 1
    case 'NAVER':
      return 2
    case 'GOOGLE':
      return 3
    case 'APPLE':
      return 4

    case 'GOOGLEPLAYGAMES':
      return 7
    case 'FACEBOOK':
      return 8
    default:
      return 0
  }
}

/**
 * 탑 10 데이터 브릿지
 * @param dataList - 탑 10 데이터 리스트
 * @returns 탑 10 데이터 리스트
 */
export function bridgeTop10DataToModuleCharacter(dataList: Array<ModuleCharacter>) {
  const characters = dataList?.map(item => {
    // 태그 분리 및 정제
    const rawTags = item.tags ? item.tags.split(',') : []
    // 태그 정제 - 중복 제거 및 빈 문자열 제거
    const uniqueTags = Array.from(new Set(rawTags))
      .filter(tag => tag.trim() !== '')
      .map(tag => tag.trim()) // 공백 제거

    return {
      id: item.world_list_detail_chrbot_key.toString(),
      name: item.title,
      subject: item.subject,
      description: item.intro,
      imageUrl: getImageUri(item.img_url),
      commentCount: item.msg_cnt,
      likeCount: item.like_cnt,
      hashtags: uniqueTags,
      isAdult: item.nsfw === 1,
      category: 'unspecified',
      gender: 'unknown',
      createdAt: item.create_dt,
      creator: {
        id: item.world_list_detail_chrbot_key.toString(),
        nickname: item.nick_nm || '',
        username: item.nick_nm || '',
        profileImageUrl: null,
        isActive: true,
      },
      likeability_max_lv: item.likeability_max_lv,
      likeability_yn: item.likeability_yn,
      multi_image_count: item.multi_image_count,
    }
  })

  return characters
}

export function bridgeModuleCreatorToCharacter(dataList: Array<ModuleCreater>) {
  const creaters = dataList?.map(item => {
    return {
      id: item.user_key.toString(),
      name: item.nick_nm || '',
      nickname: item.nick_nm || '',
      description: item.intro || '',
      profileImageUrl: getImageUri(item.profile_url),
      characterCount: 0,
      moduleType: item.module_type,
      isVerified: true,
    }
  })

  return creaters
}

export function bridgeCharbotGetListMineDataToCharacter(dataList: Array<CharbotMineData>) {
  console.log('bridgeCharbotGetListMineDataToCharacter :: ', dataList)
  const characters = dataList?.map(item => ({
    id: item.world_list_detail_chrbot_key.toString(),
    name: item.title,
    subject: item.subject,
    description: item.intro,
    imageUrl: getImageUri(item.img_url),
    commentCount: item.msg_cnt,
    likeCount: item.like_cnt,
    chatCount: item.chat_cnt,
    level: 0,
    createDate: item.create_dt,
    hashtags: item.tags ? item.tags.split(',') : [],
    isAdult: item.nsfw === 1,
    creator: {
      id: item.world_list_detail_chrbot_key.toString(),
    },
    category: 'unspecified',
    finish_yn: item.finish_yn,
    show_yn: item.show_yn,
    block_type: item.block_type,
    likeability_max_lv: item.likeability_max_lv,
    likeability_yn: item.likeability_yn,
    multi_image_count: item.multi_image_count,
    writer_note: item.writer_note,
  }))

  return characters
}

/**
 * 일반 캐릭터 데이터를 Character 타입으로 변환하는 함수
 * @param dataList - ModuleCharacter 데이터 리스트
 * @returns Character 타입으로 변환된 데이터 리스트
 */
export function bridgeCharacterDataToCharacter(dataList: Array<ModuleCharacter>) {
  const characters = dataList?.map(item => {
    // 태그 처리 로직 추가
    const rawTags = item.tags ? item.tags.split(',') : []
    const uniqueTags = Array.from(new Set(rawTags))
      .filter(tag => tag.trim() !== '')
      .map(tag => tag.trim())

    return {
      id: item.world_list_detail_chrbot_key.toString(),
      name: item.title,
      subject: item.subject,
      description: item.intro,
      imageUrl: getImageUri(item.img_url),
      commentCount: item.msg_cnt,
      likeCount: item.like_cnt,
      chatCount: item.chat_cnt,
      level: item.lv,
      createDate: item.create_dt,
      hashtags: uniqueTags,
      isAdult: item.nsfw === 1,
      creator: {
        id: item.world_list_detail_chrbot_key.toString(),
        nickname: item.nick_nm || 'Unknown',
        username: item.nick_nm || 'Unknown',
        profileImageUrl: null,
        isActive: true,
      },
      category: 'unspecified' as 'male' | 'female' | 'unspecified',
      likeability_max_lv: item.likeability_max_lv,
      likeability_yn: item.likeability_yn,
      multi_image_count: item.multi_image_count,
    }
  })

  return characters
}

export function bridgeCharbotDataToCharacter(data: ChrbotData) {
  return {
    id: data.world_list_detail_chrbot_key.toString(),
    name: data.title,
    subject: data.subject,
    description: data.intro,
    example: data.example,
    first_talk: data.first_talk,
    imageUrl: getImageUri(data.img_url),
    imageUrlNsfw: getImageUri(data.img_url_nsfw),
    commentCount: data.msg_cnt,
    hashtags: data.tags ? data.tags.split(',') : [],
    isAdult: data.nsfw === 1,
    creator: {
      id: data.world_list_detail_chrbot_key.toString(),
      nickname: data.nick_nm || '',
      username: '',
      profileImageUrl: null,
      isActive: true,
    },
    likeCount: data.like_cnt,
    category: getCategory(Number(data.gender)),
    likeability_max_lv: data.likeability_max_lv,
    likeability_yn: data.likeability_yn,
    multi_image_count: data.multi_image_count,
    writer_note: data.writer_note,
  }
}

export function bridgeCharbotChatDataToChatList(data: Array<CharbotChatData>) {
  return data.map(item => ({
    id: item.chrbot_chat_key.toString(),
    characterId: item.world_list_detail_chrbot_key.toString(),
    name: item.title,
    lastMessage: item.last_msg,
    time: '',
    imageUrl: getImageUri(item.img_url),
    fixed: item.fixed,
  }))
}

export function bridgeLoginDataToUserInfo(data: LoginResponse | null) {
  if (!data) {
    return null
  }

  return {
    nickname: data.nick_nm,
    balance_free: data.coin_free,
    balance_free_dt: data.coin_free_dt,
    balance_register: data.coin_register,
    balance_user: data.coin_user,
    bank: '신한 은행',
    accountHolder: '이윤재',
    accountNumber: '3333-05-9090944',
    imgUrl: data.profile_url,
    persona: data.persona,
    persona_gender: data.persona_gender,
    getBalance: (): number => {
      return Number(data.coin_free) + Number(data.coin_free_dt) + Number(data.coin_register)
    },
  }
}

export const parseConversationExamples = (exampleText: string) => {
  // 대화 예시가 없으면 빈 배열 반환
  if (!exampleText) return []

  try {
    let dataList: exampleDatas[] = []
    const parseData = JSON.parse(exampleText) as ConversationExampleJSON

    for (let i = 0; i < parseData.text_counts.length; i++) {
      const index = i
      const title = parseData.titles[i]
      const userMsg = parseData.examples[i].example.find(item => item.speaker === '{{user}}')?.message || ''
      const characterMsg = parseData.examples[i].example.find(item => item.speaker === '{{char}}')?.message || ''
      const length = parseData.text_counts[i]

      if (userMsg.length > 0 || characterMsg.length > 0) {
        const data: exampleDatas = {
          index: index,
          title: title,
          userMsg: userMsg,
          characterMsg: characterMsg,
          textLength: length,
        }

        dataList.push(data)
      }
    }
    return dataList
  } catch (e) {
    return []
  }

  // // 대화 예시들을 분리 (빈 줄 두 개로 구분)
  // const examples = exampleText.split('\n\n').filter(ex => ex.trim() !== '')

  // return examples.map((example, index) => {
  //   // Title 포맷 확인: "Title: 제목\n내용" 형태로 되어 있는지 확인
  //   const titleMatch = example.match(/^Title:\s*(.+?)\n([\s\S]*)$/)
  //   let title = ''
  //   let text = example

  //   if (titleMatch) {
  //     // Title이 있는 경우, title과 text 분리
  //     title = titleMatch[1].trim()
  //     text = titleMatch[2].trim()
  //   }

  //   // ConversationExample 객체 생성
  //   return {
  //     id: `example-${index}-${Math.random().toString(36).substring(2, 11)}`,
  //     title,
  //     text,
  //     visibility: data.example_show_yn === 1 ? 'public' : 'private',
  //     isEditing: false,
  //   }
  // })
}

/**
 * 진행 중인 캐릭터 생성 데이터를 Character 타입으로 변환하는 함수
 * @param data - 진행 중인 캐릭터 생성 데이터
 * @returns Character 타입으로 변환된 데이터
 */
export function bridgeCharacterInProgressToCharacter(data: any) {
  // 대화 예시를 파싱하는 함수
  console.log('bridgeCharacterInProgressToCharacter >> ', data)

  let __content = ''
  let __content_public = ''
  if (data.content_show_yn === 2) {
    if (data.content_public) {
      __content_public = data.content_public
    }

    if (data.content) {
      __content = data.content
    }
  } else {
    if (data.content_show_yn === 1) {
      __content_public = data.content
    } else {
      __content = data.content
    }
  }

  return {
    id: data.world_list_detail_chrbot_key?.toString() || '',
    name: data.title || '',
    subject: data.subject || '',
    gender: getCategory(Number(data.gender)) || 'unspecified',
    bio: data.intro || '',
    firstMessage: data.first_talk || '',
    content: __content || '',
    content_public: __content_public || '',
    content_show_yn: data.content_show_yn || 0,

    // 대화 예시 파싱
    conversationExamples: parseConversationExamples(data.example || ''),
    // 태그 처리
    hashtags: data.tags
      ? data.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag !== '')
      : [],
    // 이미지 URL
    img_url: data.img_url || '',
    img_url_nsfw: data.img_url_nsfw || '',
    img_web_url: data.img_web_url || '',
    // 가시성 및 등급
    visibility: data.show_yn === 1 ? 'public' : 'private',
    examplesVisibility: data.example_show_yn === 1 ? 'public' : 'private',
    rating: data.nsfw === 1 ? 'adult' : 'all',
    // 추가 데이터
    finish_yn: data.finish_yn || 0,
    writer_note: data.writer_note || '',

    // 추가 ( 2025-07-18 :: 호감도 관련, 이미지 관련, 프로퍼티 )
    likeabilities: data.likeabilities || [],
    likeability_max_lv: data.likeability_max_lv || 0,
    likeability_yn: data.likeability_yn || 0,
    multi_image_count: data.multi_image_count || 0,
    multi_images: data.multi_images || [],
    multi_images_original: data.multi_images || [],
    property: data.property || '',

    // 공개 + 공개 일시에 비공개로 변경 불가능
    isVisibilityLock: data.finish_yn === 1 && data.show_yn === 1 ? true : false,
  }
}

export function bridgeChatModeDataToChatMode(data: ChatModeData, customData: ChatMode) {
  return {
    ...customData,
    id: data.chat_mode,
    penCost: data.coin,
    discount: data.discount,
    original_coin: data.original_coin,
  }
}

export function bridgeInquiryDataToNotification(data: InquiryData) {
  return {
    id: data.notice_key.toString(),
    title: data.title,
    message: data.content,
    type: 'info',
    isRead: true,
    date: new Date(data.create_dt),
    sort: data.sort,
  }
}

/**
 * 수익 내역 데이터를 UI에 표시할 형식으로 변환하는 함수
 * @param data - API에서 받아온 IncomeData 배열
 * @returns 수익 내역 UI에 표시할 데이터 배열
 */
export function bridgeIncomeDataToEarningItems(data: Array<IncomeData>, lastIndex: number | 1) {
  // 데이터가 없거나 배열이 아닌 경우 빈 배열 반환
  if (!data || !Array.isArray(data)) {
    console.warn('Invalid income data:', data)
    return []
  }

  return data.map((item, index) => ({
    id: index + 1 + lastIndex * 50, // 고유 ID 생성
    date: item.create_dt, // 날짜 형식 그대로 사용
    description: item.content, // 내용 (예: 캐릭터 채팅)
    amount: parseFloat(item.pen), // pen 값을 숫자로 변환하고 10000을 곱해 펜 단위로 표시
    cnt: item.cnt, // 횟수 정보 추가
    title: item.title, // 제목 정보 추가
  }))
}

// 출금 내역 데이터를 UI에 맞게 변환하는 함수
export const bridgeWithdrawDataToWithdrawItems = (data: any[], page: number = 1) => {
  return data.map((item, index) => ({
    id: item.withdraw_request_key,
    date: new Date(item.create_dt)
      .toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(/\. /g, '.')
      .replace('.', ''),
    amount: item.pen,
    status: '완료', // API에서 상태 정보가 없어서 기본값으로 '완료' 설정
  }))
}

export function getChangeNameTag(script: string, charName: string) {
  let changeScript = ''
  const userName = useAccountStore.getState().isLogin
    ? useAccountStore.getState().data?.persona || useAccountStore.getState().data?.nick_nm || '정보없음'
    : '아무개'

  changeScript = script
    .replaceAll('{{character}}', charName)
    .replaceAll('{{user}}', userName)
    .replaceAll('{{char}}', charName)
  return changeScript
}

// 이미지 URL 유효성 체크 함수 추가
export const getValidImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/placeholders/author_default_img.jpg'

  try {
    // URL 유효성 체크 (상대 경로는 그대로 통과, 절대 경로는 유효한 URL인지 확인)
    if (url.startsWith('/')) return url // 상대 경로는 그대로 사용
    new URL(url) // 절대 URL인 경우 유효성 체크
    return url
  } catch (e) {
    console.warn('Invalid image URL:', url)
    return '/images/placeholders/author_default_img.jpg'
  }
}

function getCategory(gender: number) {
  if (gender === 1) {
    return 'male'
  } else if (gender === 2) {
    return 'female'
  } else {
    return 'unspecified'
  }
}

/** Animated WebP 여부를 바이너리에서 ANIM 청크로 판별 */
async function isAnimatedWebP(file: File): Promise<boolean> {
  if (file.type !== 'image/webp') return false
  const buffer = await file.slice(0, 40000).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length - 3; i++) {
    if (bytes[i] === 0x41 && bytes[i + 1] === 0x4e && bytes[i + 2] === 0x49 && bytes[i + 3] === 0x4d) {
      return true
    }
  }
  return false
}

function getMimeType(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png': return 'image/png'
    case 'webp': return 'image/webp'
    case 'gif': return 'image/gif'
    default: return 'image/jpeg'
  }
}

export async function uploadImages(file: File, presignedUrl: string): Promise<void> {
  // Animated WebP는 Canvas를 거치면 애니메이션이 사라지므로 원본 업로드
  const animated = await isAnimatedWebP(file)
  if (animated) {
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': 'image/webp' },
    })
    return
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = async event => {
      const img = new window.Image()
      img.src = event.target?.result as string

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          const MAX_SIZE = 1024
          let width = img.width
          let height = img.height

          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width)
            width = MAX_SIZE
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height)
            height = MAX_SIZE
          }

          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)

          const mimeType = getMimeType(file)
          const quality = mimeType === 'image/png' ? undefined : 0.8
          const dataUrl = canvas.toDataURL(mimeType, quality)

          const base64Data = dataUrl.split(',')[1]
          const binaryData = atob(base64Data)
          const arrayBuffer = new ArrayBuffer(binaryData.length)
          const uint8Array = new Uint8Array(arrayBuffer)

          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i)
          }

          const blob = new Blob([uint8Array], { type: mimeType })

          await fetch(presignedUrl, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': mimeType },
          })

          resolve()
        } catch (error) {
          console.error('이미지 업로드 중 오류:', error)
          reject(error)
        }
      }

      img.onerror = () => reject(new Error('이미지 로딩 실패'))
    }

    reader.onerror = () => reject(new Error('파일 읽기 실패'))
  })
}

export async function rijndaelEncrypt(data: string): Promise<string> {
  const keyParsed = CryptoJS.enc.Utf8.parse(encryptionKey)
  const encrypted = CryptoJS.AES.encrypt(data, keyParsed, {
    mode: CryptoJS.mode.ECB, // ECB 모드
    padding: CryptoJS.pad.Pkcs7, // PKCS7 패딩
    keySize: 8, // 256비트 = 8 * 32비트 워드
  })

  // Base64로 인코딩하여 반환
  return encrypted.toString() // CryptoJS는 자동으로 Base64로 인코딩
}

export async function getChatRoomEncryptData(
  chrbotKey: string,
  coin: string,
  country_code: string,
  freeCoin: string,
  info: any,
  nsfw: string,
  persona: string,
  token: string,
  userKey: string,

  api_server?: string,
  chat_address?: string,
  chat_server?: string,
  chat_server_port?: string
): Promise<string> {
  const reqData: requestConnectedChatRoomData = {
    api_server: api_server || PI_ADDRESS || 'https://qausapi.universestationery.com',
    chat_address: chat_address || CHAT_FRONTEND_ADDRESS || 'https://qa.storynation.co.kr/character/chat',
    chat_server: chat_server || CHAT_SERVER_ADDRESS || 'qauschat.storynation.io',
    chat_server_port: chat_server_port || CHAT_SERVER_PORT?.toString() || '443',

    chrbotKey: chrbotKey || '',
    coin: coin || '',
    country_code: country_code || '',
    freeCoin: freeCoin || '',
    info: info,
    nsfw: nsfw || '',
    persona: persona || '',
    token: token || '',
    userKey: userKey || '',
  }

  console.log('@@ reqData :: ', reqData)

  // reqData 를 AES-256-ECB 암호화
  const encryptedData = await rijndaelEncrypt(JSON.stringify(reqData))
  console.log('encryptedData :: ', encryptedData)

  // encryptedData 를 base64 인코딩
  const base64EncodedData = btoa(encryptedData)
  return base64EncodedData
}

export const getPlatform = (sns_type: number) => {
  switch (sns_type) {
    case 0:
      return 'Guest'
    case 1:
      return 'Kakao'
    case 2:
      return 'Naver'
    case 3:
      return 'Google'
    case 4:
      return 'Apple'
    case 7:
      return 'GooglePlayGames'
    case 8:
      return 'Facebook'
    default:
      return ''
  }
}
