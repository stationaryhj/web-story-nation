import { ChatModeData, CoinData, CoinListResponse, InquiryData } from '@/types/api'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { settlementApi } from '@/services/api/storyNationApi'

// 캐릭터 타입 정의
export interface Character {
  id: string
  name: string
  subject?: string
  description: string
  detailDescription?: string
  example?: string
  first_talk?: string
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
  finish_yn?: number | 0
  show_yn?: number | any
  block_type?: number | any
  likeability_max_lv?: number | any
  likeability_yn?: number | any
  multi_image_count?: number | any
  writer_note?: string | any
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

// 이미지 URL 배열 (랜덤 이미지 사용을 위한)
const characterImages = [
  '/images/character1.jpg',
  '/images/placeholders/default-character.jpg',
  '/images/placeholders/author_default_img.jpg',
  '/images/character1.jpg',
  '/images/placeholders/default-character.jpg',
  '/images/placeholders/author_default_img.jpg',
]

// 해시태그 목록 (랜덤 해시태그 생성용)
const allHashtags = [
  '#로맨스',
  '#판타지',
  '#SF',
  '#미스터리',
  '#스릴러',
  '#호러',
  '#액션',
  '#어드벤처',
  '#코미디',
  '#드라마',
  '#역사',
  '#전쟁',
  '#범죄',
  '#첩보',
  '#음악',
  '#댄스',
  '#요리',
  '#스포츠',
  '#학원',
  '#직장',
  '#의학',
  '#법정',
  '#정치',
  '#군사',
  '#마법',
  '#초능력',
  '#좀비',
  '#뱀파이어',
  '#외계인',
  '#로봇',
  '#인공지능',
  '#가상현실',
  '#타임트래블',
  '#대체역사',
  '#디스토피아',
  '#유토피아',
  '#사이버펑크',
  '#스팀펑크',
]

// 랜덤 날짜 생성 함수
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

// 랜덤 해시태그 선택 함수
const getRandomHashtags = (count: number) => {
  const shuffled = [...allHashtags].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// 랜덤 숫자 생성 함수
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 랜덤 이미지 URL 가져오기
const getRandomImage = () => {
  return characterImages[Math.floor(Math.random() * characterImages.length)]
}

// 임시 데이터 (기존 데이터)
const dummyCharacters: Array<Character> = [
  {
    id: '1',
    name: '에단 카터',
    subject: '미식축구도, 사랑도 전력 질주가 원칙. 목표는 단 하나, 내 심장을 터치다운하는 것.',
    description: '미식축구도, 사랑도 전력 질주가 원칙. 목표는 단 하나, 내 심장을 터치다운하는 것.',
    imageUrl: getRandomImage(),
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
    subject: '낮에는 평범한 대학생, 밤에는 사이버 세계의 정의를 실현하는 비밀 요원.',
    description: '한국계 미국인 천재 해커. 낮에는 평범한 대학생, 밤에는 사이버 세계의 정의를 실현하는 비밀 요원.',
    imageUrl: getRandomImage(),
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
    subject: '이탈리아 출신의 미스터리한 셰프. 그의 요리에는 사람의 마음을 사로잡는 마법 같은 비밀이 있다.',
    description: '이탈리아 출신의 미스터리한 셰프. 그의 요리에는 사람의 마음을 사로잡는 마법 같은 비밀이 있다.',
    imageUrl: getRandomImage(),
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
    subject: '도쿄의 밤을 지배하는 언더그라운드 DJ. 음악으로 사람들의 영혼을 움직이는 능력을 가졌다.',
    description: '도쿄의 밤을 지배하는 언더그라운드 DJ. 음악으로 사람들의 영혼을 움직이는 능력을 가졌다.',
    imageUrl: getRandomImage(),
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
    subject: '전직 러시아 특수부대 요원. 과거의 그림자에서 벗어나 평범한 삶을 꿈꾸지만, 과거는 그를 쉽게 놓아주지 않는다.',
    description:
      '전직 러시아 특수부대 요원. 과거의 그림자에서 벗어나 평범한 삶을 꿈꾸지만, 과거는 그를 쉽게 놓아주지 않는다.',
    imageUrl: getRandomImage(),
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
    subject: '뉴욕의 야심 찬 패션 디자이너. 화려한 패션계의 이면에 숨겨진 어두운 비밀을 파헤친다.',
    description: '뉴욕의 야심 찬 패션 디자이너. 화려한 패션계의 이면에 숨겨진 어두운 비밀을 파헤친다.',
    imageUrl: getRandomImage(),
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
    subject: '정체를 알 수 없는 미스터리한 인물. 과거도, 성별도 알려진 바 없지만 놀라운 능력을 가지고 있다.',
    description: '정체를 알 수 없는 미스터리한 인물. 과거도, 성별도 알려진 바 없지만 놀라운 능력을 가지고 있다.',
    imageUrl: getRandomImage(),
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
    subject: '성별에 구애받지 않는 자유로운 영혼. 예술과 음악을 통해 자신의 정체성을 표현한다.',
    description: '성별에 구애받지 않는 자유로운 영혼. 예술과 음악을 통해 자신의 정체성을 표현한다.',
    imageUrl: getRandomImage(),
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

  // 추가 남성 캐릭터 데이터
  {
    id: '9',
    name: '유진 리',
    subject: '천재적인 프로그래머이자 화이트 해커. 가상 세계에서는 그 누구보다 강력한 존재이다.',
    description: '천재적인 프로그래머이자 화이트 해커. 가상 세계에서는 그 누구보다 강력한 존재이다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: false,
    creator: {
      id: '6f20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'CodeMaster',
      username: 'CodeMaster',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'male',
    gender: 'male',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: '10',
    name: '다니엘 강',
    subject: '이중 스파이로 활동하는 국제적인 첩보원. 누구도 그의 진짜 정체성을 알지 못한다.',
    description: '이중 스파이로 활동하는 국제적인 첩보원. 누구도 그의 진짜 정체성을 알지 못한다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: true,
    creator: {
      id: 'bf20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'SpyMaster',
      username: 'SpyMaster',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'male',
    gender: 'male',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: '11',
    name: '마이클 존슨',
    subject: '유명한 록 밴드의 리더. 음악을 통해 세상을 바꾸려는 뜨거운 열정을 가진 인물.',
    description: '유명한 록 밴드의 리더. 음악을 통해 세상을 바꾸려는 뜨거운 열정을 가진 인물.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: false,
    creator: {
      id: 'af20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'RockStar',
      username: 'RockStar',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'male',
    gender: 'male',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: '12',
    name: '토마스 워커',
    subject: '인류의 미래를 구하기 위해 시간을 여행하는 과학자. 과거를 바꾸면 미래도 바뀐다는 것을 알고 있다.',
    description: '인류의 미래를 구하기 위해 시간을 여행하는 과학자. 과거를 바꾸면 미래도 바뀐다는 것을 알고 있다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: false,
    creator: {
      id: 'cf20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'TimeTraveler',
      username: 'TimeTraveler',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'male',
    gender: 'male',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },

  // 추가 여성 캐릭터 데이터
  {
    id: '13',
    name: '소피아 로드리게스',
    subject: '세계적인 발레리나. 완벽주의적 성격으로 극한의 연습을 거듭하며 자신의 한계를 시험한다.',
    description: '세계적인 발레리나. 완벽주의적 성격으로 극한의 연습을 거듭하며 자신의 한계를 시험한다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: false,
    creator: {
      id: 'df20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'BalletQueen',
      username: 'BalletQueen',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'female',
    gender: 'female',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: '14',
    name: '에밀리 왕',
    subject: '화학 재해로 특수한 능력을 갖게 된 과학자. 분자 구조를 변형시키는 능력으로 범죄와 싸운다.',
    description: '화학 재해로 특수한 능력을 갖게 된 과학자. 분자 구조를 변형시키는 능력으로 범죄와 싸운다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: false,
    creator: {
      id: 'ef20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'ScienceHero',
      username: 'ScienceHero',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'female',
    gender: 'female',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: '15',
    name: '나탈리 벤소니',
    subject: '17세기의 해적선 선장으로 바다의 공포로 불리는 여성. 대양을 항해하며 끝없는 모험을 찾는다.',
    description: '17세기의 해적선 선장으로 바다의 공포로 불리는 여성. 대양을 항해하며 끝없는 모험을 찾는다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: true,
    creator: {
      id: 'ff20beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'PirateQueen',
      username: 'PirateQueen',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'female',
    gender: 'female',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: '16',
    name: '클로이 파크',
    subject: '천재적인 게임 개발자이자 프로 게이머. 가상 세계와 현실 세계의 경계를 허무는 게임을 개발 중이다.',
    description: '천재적인 게임 개발자이자 프로 게이머. 가상 세계와 현실 세계의 경계를 허무는 게임을 개발 중이다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: false,
    creator: {
      id: '0f30beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'GameDev',
      username: 'GameDev',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'female',
    gender: 'female',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },

  // 추가 미확정 성별 캐릭터 데이터
  {
    id: '17',
    name: '에이든',
    description: '초자연적인 능력을 가진 존재. 시간과 공간을 초월하여 다양한 시대를 여행하며 인류의 역사를 관찰한다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: false,
    creator: {
      id: '1f30beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'TimeWatcher',
      username: 'TimeWatcher',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'unspecified',
    gender: 'unknown',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: '18',
    name: '리버',
    description: '다차원 세계에서 온 방문자. 현실을 꿈처럼 바라보며 인간의 감정과 행동에 깊은 관심을 가지고 있다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: false,
    creator: {
      id: '2f30beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'DreamWalker',
      username: 'DreamWalker',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'unspecified',
    gender: 'unknown',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: '19',
    name: '모르간',
    description: '마법의 숲에 사는 정령. 자연과 하나가 되어 식물을 조종하고 동물들과 대화하는 능력을 가졌다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: false,
    creator: {
      id: '3f30beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'NatureSpirit',
      username: 'NatureSpirit',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'unspecified',
    gender: 'unknown',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
  {
    id: '20',
    name: '퀸',
    description:
      '인공지능이 진화하여 자아를 가지게 된 존재. 디지털 세계와 현실 세계 사이에서 새로운 삶의 방식을 모색한다.',
    imageUrl: getRandomImage(),
    commentCount: getRandomNumber(50, 300),
    likeCount: getRandomNumber(100, 500),
    hashtags: getRandomHashtags(3),
    isAdult: true,
    creator: {
      id: '4f30beae-23ed-4ebe-a786-6174d4e7224d',
      nickname: 'DigitalBeing',
      username: 'DigitalBeing',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'unspecified',
    gender: 'unknown',
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
  },
]

// 추천 캐릭터 ID 목록 (실제로는 알고리즘에 의해 결정될 수 있음)
const recommendedIds = ['1', '4', '5', '7', '10', '15', '17', '19']

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

    // 데이터가 없으면 먼저 로드
    await get().fetchCharacters()

    // 로드 후 다시 분류하여 반환
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
  initializeTheme: () => void
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
      initializeTheme: () => {
        const savedTheme = localStorage.getItem('theme-storage')
        if (!savedTheme) {
          set({ isDarkMode: false })
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
    }
  )
)

interface CoinStore {
  coinList: Array<CoinData>
  orderId: string
  setCoinList: (coinList: Array<CoinData>) => void
  setOrderId: (orderId: string) => void
  initCoinList: () => Promise<void>
}

export const useCoinStore = create<CoinStore>()(
  persist(
    (set, get) => ({
      coinList: [],
      orderId: '',
      setCoinList: (coinList: Array<CoinData>) => set({ coinList }),
      setOrderId: (orderId: string) => set({ orderId }),

      initCoinList: async () => {
        if(get().coinList.length > 0) return
        const response = await settlementApi.GetCoinList()
        set({ coinList: response.data.coinList })
      }
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

interface InquiryStore {
  inquiryList: Array<InquiryData>
  setInquiryList: (inquiryList: Array<InquiryData>) => void
}

export const useInquiryStore = create<InquiryStore>()(
  persist(
    set => ({
      inquiryList: [],
      setInquiryList: (inquiryList: Array<InquiryData>) => set({ inquiryList }),
    }),
    {
      name: 'inquiry-storage',
      storage: createJSONStorage(() => safeStorage),
      // skipHydration: true, // 서버 사이드 렌더링 시 하이드레이션 건너뛰기
    }
  )
)

// login Data 통합
export { useAccountStore } from './useAccountStore'
