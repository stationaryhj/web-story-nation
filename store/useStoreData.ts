import { ChatModeData, CoinData, LoginResponse } from '@/types/api'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 캐릭터 타입 정의
export interface Character {
  id: string
  name: string
  description: string
  detailDescription?: string
  imageUrl: string
  commentCount: number
  likeCount?: number
  hashtags: Array<string>
  isAdult: boolean
  creator: {
    id: string
    nickname: string
    username: string
    profileImageUrl: string | null
    isActive: boolean
  }
  category: 'male' | 'female' | 'unspecified' // 카테고리 추가
  gender?: 'male' | 'female' | 'unknown' // 성별 추가
  createdAt?: string // 생성 날짜 추가
}

// 스토어 타입 정의
interface DataStore {
  characters: Array<Character>
  maleCharacters: Array<Character>
  femaleCharacters: Array<Character>
  unspecifiedCharacters: Array<Character>
  recommendedCharacters: Array<Character>
  isLoading: boolean
  error: string | null
  fetchCharacters: () => Promise<void>
  fetchCategoryCharacters: (category: string) => Promise<Array<Character>>
}

// 임시 데이터
const dummyCharacters: Array<Character> = [
  {
    id: '1',
    name: '에단 카터',
    description: '미식축구도, 사랑도 전력 질주가 원칙. 목표는 단 하나, 내 심장을 터치다운하는 것.',
    imageUrl: '/images/character1.jpg',
    commentCount: 151,
    likeCount: 320,
    hashtags: ['#스포츠', '#로맨스', '#미식축구'],
    isAdult: false,
    creator: {
      id: '8f20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'CroakySled1251',
      username: 'CroakySled1251',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'male',
    gender: 'male',
    createdAt: '2023-05-15T09:12:34Z',
  },
  {
    id: '2',
    name: '리아 김',
    description: '한국계 미국인 천재 해커. 낮에는 평범한 대학생, 밤에는 사이버 세계의 정의를 실현하는 비밀 요원.',
    imageUrl: '/images/character1.jpg',
    commentCount: 89,
    likeCount: 245,
    hashtags: ['#액션', '#스릴러', '#해커'],
    isAdult: false,
    creator: {
      id: '7a30beae-45ed-4ebe-a786-6174d4e7224d',
      nickname: 'CyberNinja',
      username: 'CyberNinja',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'female',
    gender: 'female',
    createdAt: '2023-07-22T15:42:10Z',
  },
  {
    id: '3',
    name: '마르코 발렌티',
    description: '이탈리아 출신의 미스터리한 셰프. 그의 요리에는 사람의 마음을 사로잡는 마법 같은 비밀이 있다.',
    imageUrl: '/images/character1.jpg',
    commentCount: 210,
    likeCount: 412,
    hashtags: ['#요리', '#로맨스', '#판타지'],
    isAdult: false,
    creator: {
      id: '5f20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'ChefMaster',
      username: 'ChefMaster',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'male',
    gender: 'male',
    createdAt: '2023-06-03T11:25:47Z',
  },
  {
    id: '4',
    name: '아야 나카무라',
    description: '도쿄의 밤을 지배하는 언더그라운드 DJ. 음악으로 사람들의 영혼을 움직이는 능력을 가졌다.',
    imageUrl: '/images/character1.jpg',
    commentCount: 175,
    likeCount: 289,
    hashtags: ['#음악', '#드라마', '#도쿄'],
    isAdult: false,
    creator: {
      id: '9f20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'BeatMaster',
      username: 'BeatMaster',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'female',
    gender: 'female',
    createdAt: '2023-08-11T18:09:22Z',
  },
  {
    id: '5',
    name: '알렉산더 볼코프',
    description:
      '전직 러시아 특수부대 요원. 과거의 그림자에서 벗어나 평범한 삶을 꿈꾸지만, 과거는 그를 쉽게 놓아주지 않는다.',
    imageUrl: '/images/character1.jpg',
    commentCount: 132,
    likeCount: 367,
    hashtags: ['#액션', '#스릴러', '#첩보'],
    isAdult: true,
    creator: {
      id: '3f20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'ShadowAgent',
      username: 'ShadowAgent',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'male',
    gender: 'male',
    createdAt: '2023-09-04T13:51:38Z',
  },
  {
    id: '6',
    name: '엘리자베스 파커',
    description: '뉴욕의 야심 찬 패션 디자이너. 화려한 패션계의 이면에 숨겨진 어두운 비밀을 파헤친다.',
    imageUrl: '/images/character1.jpg',
    commentCount: 98,
    likeCount: 215,
    hashtags: ['#패션', '#미스터리', '#뉴욕'],
    isAdult: false,
    creator: {
      id: '2f20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'FashionQueen',
      username: 'FashionQueen',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'female',
    gender: 'female',
    createdAt: '2023-05-29T10:17:53Z',
  },
  {
    id: '7',
    name: '미스터리 X',
    description: '정체를 알 수 없는 미스터리한 인물. 과거도, 성별도 알려진 바 없지만 놀라운 능력을 가지고 있다.',
    imageUrl: '/images/character1.jpg',
    commentCount: 245,
    likeCount: 478,
    hashtags: ['#미스터리', '#판타지', '#초능력'],
    isAdult: false,
    creator: {
      id: '1f20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'MysteryCreator',
      username: 'MysteryCreator',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'unspecified',
    gender: 'unknown',
    createdAt: '2023-07-14T22:43:19Z',
  },
  {
    id: '8',
    name: '제이든 스미스',
    description: '성별에 구애받지 않는 자유로운 영혼. 예술과 음악을 통해 자신의 정체성을 표현한다.',
    imageUrl: '/images/character1.jpg',
    commentCount: 178,
    likeCount: 301,
    hashtags: ['#예술', '#음악', '#자유'],
    isAdult: false,
    creator: {
      id: '4f20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'ArtisticSoul',
      username: 'ArtisticSoul',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'unspecified',
    gender: 'unknown',
    createdAt: '2023-10-01T16:36:05Z',
  },
]

// 추천 캐릭터 ID 목록 (실제로는 알고리즘에 의해 결정될 수 있음)
const recommendedIds = ['1', '4', '5', '7']

// Zustand 스토어 생성
export const useStoreData = create<DataStore>((set, get) => ({
  characters: [],
  maleCharacters: [],
  femaleCharacters: [],
  unspecifiedCharacters: [],
  recommendedCharacters: [],
  isLoading: false,
  error: null,

  fetchCharacters: async () => {
    set({ isLoading: true, error: null })

    try {
      // 실제 API 호출 대신 임시 데이터 사용
      // 실제 구현에서는 axios 등을 사용하여 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)) // 로딩 시뮬레이션

      // 카테고리별로 캐릭터 분류
      const maleChars = dummyCharacters.filter(char => char.category === 'male')
      const femaleChars = dummyCharacters.filter(char => char.category === 'female')
      const unspecifiedChars = dummyCharacters.filter(char => char.category === 'unspecified')
      const recommendedChars = dummyCharacters.filter(char => recommendedIds.includes(char.id))

      set({
        characters: dummyCharacters,
        maleCharacters: maleChars,
        femaleCharacters: femaleChars,
        unspecifiedCharacters: unspecifiedChars,
        recommendedCharacters: recommendedChars,
        isLoading: false,
      })
    } catch (error) {
      set({ error: '캐릭터 데이터를 불러오는데 실패했습니다.', isLoading: false })
    }
  },

  fetchCategoryCharacters: async (category: string) => {
    // 이미 데이터가 있으면 바로 반환
    if (get().characters.length > 0) {
      switch (category) {
        case 'male':
          return get().maleCharacters
        case 'female':
          return get().femaleCharacters
        case 'unspecified':
          return get().unspecifiedCharacters
        case 'recommended':
          return get().recommendedCharacters
        default:
          return get().characters
      }
    }

    // 데이터가 없으면 먼저 불러오기
    await get().fetchCharacters()

    // 불러온 후 카테고리에 맞는 데이터 반환
    switch (category) {
      case 'male':
        return get().maleCharacters
      case 'female':
        return get().femaleCharacters
      case 'unspecified':
        return get().unspecifiedCharacters
      case 'recommended':
        return get().recommendedCharacters
      default:
        return get().characters
    }
  },
}))

// 다크모드 스토어 타입 정의
interface ThemeStore {
  isDarkMode: boolean
  toggleDarkMode: () => void
  enableDarkMode: () => void
  disableDarkMode: () => void
}

// 안전한 localStorage 접근을 위한 커스텀 스토리지 객체
const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(name)
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value)
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(name)
    }
  },
}

// 다크모드 스토어 생성 (로컬 스토리지에 저장)
export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      isDarkMode: false,
      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),
      enableDarkMode: () => set({ isDarkMode: true }),
      disableDarkMode: () => set({ isDarkMode: false }),
    }),
    {
      name: 'theme-storage', // 로컬 스토리지 키 이름
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true, // 서버 사이드 렌더링 시 하이드레이션 건너뛰기
    }
  )
)

interface AccountStore {
  isLogin: boolean
  data: LoginResponse | null
  setAccountInfo: (accountInfo: AccountStore) => void
  removeAccountInfo: () => void
}

export const useAccountStore = create<AccountStore>()(
  persist(
    set => ({
      isLogin: false,
      data: null,
      setAccountInfo: (accountInfo: AccountStore) => set(accountInfo),
      removeAccountInfo: () =>
        set({
          isLogin: false,
          data: null,
        }),
    }),
    {
      name: 'account-storage',
      storage: createJSONStorage(() => safeStorage),

      skipHydration: true, // 서버 사이드 렌더링 시 하이드레이션 건너뛰기
    }
  )
)

interface CoinStore {
  coinList: Array<CoinData>
  orderId: string
  setCoinList: (coinList: Array<CoinData>) => void
  setOrderId: (orderId: string) => void
}

export const useCoinStore = create<CoinStore>()(
  persist(
    set => ({
      coinList: [],
      orderId: '',
      setCoinList: (coinList: Array<CoinData>) => set({ coinList }),
      setOrderId: (orderId: string) => set({ orderId }),
    }),
    {
      name: 'coin-storage',
      storage: createJSONStorage(() => safeStorage),
      // skipHydration: true, // 서버 사이드 렌더링 시 하이드레이션 건너뛰기
    }
  )
)

interface ChatModeStore {
  chatMode: Array<ChatModeData>
  setChatMode: (chatMode: Array<ChatModeData>) => void
}

export const useChatModeStore = create<ChatModeStore>()(
  persist(
    set => ({
      chatMode: [],
      setChatMode: (chatMode: Array<ChatModeData>) => set({ chatMode }),
    }),
    {
      name: 'chatMode-storage',
      storage: createJSONStorage(() => safeStorage),
      // skipHydration: true, // 서버 사이드 렌더링 시 하이드레이션 건너뛰기
    }
  )
)
