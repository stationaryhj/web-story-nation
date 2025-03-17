/** 문자열 관련 유틸 */
export const strUtil = {
    /** 문자열이 비어있는지 확인 */
    isEmpty: (value: any) => {
        return value === undefined || value === null || (value + "").length < 1;
    },
    /** 문자열이 영어만 포함되어 있는지 확인 */
    isOnlyEnglish: (value: any) => {
        const regex = /^[A-Za-z]+$/;
        return regex.test(value);
    },
};