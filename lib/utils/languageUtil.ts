import i18n from 'i18next';

/** 언어 관련 유틸 */
export const languageUtil = {

  /** 현재 언어 반환 */
  transLanguage: () => i18n.language,

  /** 언어에 맞는 값을 반환 */
  getLocalizedValue: (item: any, key: string) => {
    const lang = languageUtil.transLanguage();

    const localizedKey = lang === 'en' ? `${ key }_en` : key;
    return item[localizedKey];
  },

  /** 한국어를 받아서 '를' 또는 '을' 반환 */
  koreanParticleUlLul: (noun: string) => {
    const lastChar = noun.charAt(noun.length - 1);
    return lastChar.match(/[가-힣]/) ?
      (lastChar.charCodeAt(0) - 0xac00) % 28 > 0 ?
        '을' :
        '를' :
      '';
  },

  /** 한국어를 받아서 '이' 또는 '가' 반환 */
  koreanParticleIGa: (noun: string) => {
    const lastChar = noun.charAt(noun.length - 1);
    return lastChar.match(/[가-힣]/) ?
      (lastChar.charCodeAt(0) - 0xac00) % 28 > 0 ?
        '이' :
        '가' :
      '';
  },

};
