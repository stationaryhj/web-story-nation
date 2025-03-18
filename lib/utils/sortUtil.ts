/** 정렬 관련 유틸 */
export const sortUtil = {

  /** 오름차순 정렬 */
  asc: (a: number, b: number) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  },

  /** 내림차순 정렬 */
  desc: (a: number, b: number) => {
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  },
};
