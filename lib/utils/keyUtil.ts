/** 키 관련 유틸 */
export const keyUtil = {

  /** 전달받은 인자들을 _ (언더스코어) 문자로 연결하여 문자열로 반환 */
  makeKey: (...values: Array<string>): string => values.join('_'),
};
