import { ModuleCharacter } from '@/types/api';

/**
  get image Uri
 */
export function getImageUri(
  url: string | undefined | null,
): string {
  if (!url) return ''; // url이 없을 경우 빈 문자열 반환

  try {
    if (url.indexOf('kr/') > -1) {
      return url.replace('kr/', 'https://universestationery.s3.amazonaws.com/');
    } else if (url.indexOf('image/') > -1) {
      return 'https://s3.amazonaws.com/en.universestationery.imgs/' + url;
    }
    return url;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return ''; // 에러 발생 시 빈 문자열 반환
  }
};

/**
 * 소셜 타입 번호 반환 함수
 * @param provider - 소셜 타입 문자열
 * @returns 소셜 타입 번호
 */
export function getSnsTypeNumber(provider: string): number {
  switch (provider) {
    case 'guest': return 0;
    case 'kakao': return 1;
    case 'naver': return 2;
    case 'google': return 3;
    case 'apple': return 4;

    case 'googleplaygames': return 7;
    case 'facebook': return 8;

    default:
      return 0;
  }
};



/**
 * 탑 10 데이터 브릿지
 * @param dataList - 탑 10 데이터 리스트
 * @returns 탑 10 데이터 리스트
 */
export function bridgeTop10DataToModuleCharacter(dataList: Array<ModuleCharacter>) {
  const characters = dataList?.map((item) => ({
    id: item.world_list_detail_chrbot_key.toString(),
    name: item.title,
    description: item.intro,
    imageUrl: item.img_url,
    commentCount: item.msg_cnt,
    hashtags: item.tags.split(','),
    isAdult: item.nsfw === 1,
    creator: {
      id: item.world_list_detail_chrbot_key.toString(),
    }
  }));

  return characters;
}