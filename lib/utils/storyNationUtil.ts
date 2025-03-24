
import { CharbotChatData, CharbotChatListData, CharbotMineData, ChrbotData, LoginResponse, ModuleCharacter } from '@/types/api';


/**
  get image Uri
 */
export function getImageUri(url: string | undefined | null): string {
  // 기본 이미지 경로 (이미지가 없거나 로드에 실패한 경우 사용)
  const defaultImageUrl = '/images/placeholders/default-character.jpg'

  if (!url) return defaultImageUrl // url이 없을 경우 기본 이미지 반환

  try {
    if (url.indexOf('kr/') > -1) {
      return url.replace('kr/', 'https://universestationery.s3.amazonaws.com/')
    } else if (url.indexOf('image/') > -1) {
      return 'https://s3.amazonaws.com/en.universestationery.imgs/' + url
    }

    return url;

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
  switch (provider) {

    case 'GUEST': return 0;
    case 'KAKAO': return 1;
    case 'NAVER': return 2;
    case 'GOOGLE': return 3;
    case 'APPLE': return 4;

    case 'GOOGLEPLAYGAMES': return 7;
    case 'FACEBOOK': return 8;
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
      description: item.intro,
      imageUrl: item.img_url,
      commentCount: item.msg_cnt,
      hashtags: uniqueTags,
      isAdult: item.nsfw === 1,
      creator: {
        id: item.world_list_detail_chrbot_key.toString(),
      },
    }
  })

  return characters
}



export function bridgeCharbotGetListMineDataToCharacter(dataList: Array<CharbotMineData>) {
  const characters = dataList?.map((item) => ({
    id: item.world_list_detail_chrbot_key.toString(),
    name: item.title,
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
    category: 'unspecified'
  }));

  return characters;
}


/**
 * 일반 캐릭터 데이터를 Character 타입으로 변환하는 함수
 * @param dataList - ModuleCharacter 데이터 리스트
 * @returns Character 타입으로 변환된 데이터 리스트
 */
export function bridgeCharacterDataToCharacter(dataList: Array<ModuleCharacter>) {

  const characters = dataList?.map((item) => ({
    id: item.world_list_detail_chrbot_key.toString(),
    name: item.title,
    description: item.intro,
    imageUrl: getImageUri(item.img_url),
    commentCount: item.msg_cnt,
    likeCount: item.like_cnt,
    chatCount: item.chat_cnt,
    level: item.lv,
    createDate: item.create_dt,
    hashtags: item.tags ? item.tags.split(',') : [],
    isAdult: item.nsfw === 1,
    creator: {

      id: item.world_list_detail_chrbot_key.toString(),
      name: item.title,
      description: item.intro,
      imageUrl: item.img_url,
      commentCount: item.msg_cnt,
      likeCount: item.like_cnt,
      chatCount: item.chat_cnt,
      level: item.lv,
      createDate: item.create_dt,
      hashtags: uniqueTags,
      isAdult: item.nsfw === 1,
      creator: {
        id: item.world_list_detail_chrbot_key.toString(),
        nickname: item.nick_nm || '',
        username: '',
        profileImageUrl: null,
        isActive: true,
      },
      category: 'unspecified' as const,
    }
  })


  return characters;
}


export function bridgeCharbotDataToCharacter(data: ChrbotData) {
  return {
    id: data.world_list_detail_chrbot_key.toString(),
    name: data.title,
    description: data.intro,
    imageUrl: getImageUri(data.img_url),
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
    category: getCategory(Number(data.gender))
  };
}


export function bridgeCharbotChatDataToChatList(data: Array<CharbotChatData>) {
  return data.map((item) => ({
    id: item.chrbot_chat_key.toString(),
    characterId: item.world_list_detail_chrbot_key.toString(),
    name: item.title,
    lastMessage: item.last_msg,
    time: '',
    imageUrl: getImageUri(item.img_url),
    fixed: item.fixed,
  }));
}


export function bridgeLoginDataToUserInfo(data: LoginResponse | null) {
  if (!data) {
    return null;
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
      return Number(data.coin_free) + Number(data.coin_free_dt) + Number(data.coin_register);
    },
  };
}

function getCategory(gender: number) {
  if (gender === 1) {
    return 'male';
  } else if (gender === 2) {
    return 'female';
  } else {
    return 'unspecified';
  }
}


