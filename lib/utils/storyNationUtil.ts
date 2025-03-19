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
