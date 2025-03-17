import { numUtil } from './numUtil'

interface JsonMap {
  [key: string]: boolean
}

/** 체크 관련 유틸 */
export const checkUtil = {
    /** 중복된 데이터 체크 */
    duplicatValue: (objArray: Record<string, any>[], keys: string[]) => {
        const json: JsonMap = {};
        for (let i = 0; i < objArray.length; i++) {
            const tb = objArray[i];
            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                const value = tb[key];
                if (value === undefined) continue;
                if (json[value.toString()]) {
                    return "데이터중복(" + key + ") : " + value;
                }
                json[value.toString()] = true;
            }
        }
        return undefined;
    },

    /** 중복된 데이터 체크 */
    duplicatKeyValue: (objArray: Record<string, any>[], keys: Record<string, string>[]) => {
        const json: JsonMap = {};
        for (let i = 0; i < objArray.length; i++) {
            const tb = objArray[i];
            for (let j = 0; j < keys.length; j++) {
                const js = keys[j];
                for (const key in js) {
                    const vKey = js[key];
                    const value1 = tb[key];
                    const value2 = tb[vKey];
                    if (value1 === undefined) continue;
                    if (value2 === undefined) continue;
                    const value = value1.toString() + value2.toString();
                    if (json[value]) {
                        return (
                            "데이터중복(" +
                            key +
                            "," +
                            vKey +
                            ") : " +
                            value1 +
                            " , " +
                            value2
                        );
                    }
                    json[value] = true;
                }
            }
        }
        return undefined;
    },

    /** 빈 문자열이면 true */
    isEmptyString: (value: unknown): boolean => {
        if (value === undefined || value === null) {
            return true;
        }
        return value.toString().trim().length === 0;
    },
    /** 0이면 true (빈값 허용 여부 결정가능) */
    isZero: (value: string | number, allowEmpty?: boolean): boolean => {
        if (allowEmpty && checkUtil.isEmptyString(value)) {
            return true;
        }
        return numUtil.convertToBigNumber(value.toString()).comparedTo(0) === 0;
    },
    /** 0 포함한 양의 소수면 true (빈값, 0 허용 여부 결정가능) 
     places 미 입력 시 소숫점 자리 무제한. 입력 시 소숫점 자릿수가 places 이하이면 true */
    isPositiveDecimal: (
        value: string | number, 
        places?: number, 
        allowEmpty?: boolean, 
        allowZero?: boolean
    ): boolean => {
        if (allowEmpty && checkUtil.isEmptyString(value)) {
            return true;
        }
        if (allowZero && checkUtil.isZero(value, allowEmpty)) {
            return true;
        }
        const strValue = value.toString();
        if (!places) {
            return /^(0(\.\d*)?|\.\d*|[1-9]\d*(\.\d*)?)$/.test(strValue);
        } else {
            return new RegExp(
                `^(0|0\\.\\d{0,${places}}|\\d+\\.?\\d{0,${places}})$`,
            ).test(strValue);
        }
    },
    /** 양의 정수면 true (빈값, 0 허용 여부 결정가능) */
    isPositiveInteger: (
        value: string | number, 
        allowEmpty?: boolean, 
        allowZero?: boolean
    ): boolean => {
        if (allowEmpty && checkUtil.isEmptyString(value)) {
            return true;
        }
        if (allowZero && checkUtil.isZero(value, allowEmpty)) {
            return true;
        }
        return /^\d+$/.test(value.toString());
    },
    /** a가 b와 같으면 true */
    isEqual: (a: string | number, b: string | number): boolean => 
        numUtil.convertToBigNumber(a).comparedTo(b) === 0,
    /** a가 b보다 낮으면 true */
    isLower: (a: string | number, b: string | number): boolean => 
        numUtil.convertToBigNumber(a).comparedTo(b) < 0,
    /** a가 b보다 낮거나 같으면 true */
    isLowerOrEqual: (a: string | number, b: string | number): boolean => 
        numUtil.convertToBigNumber(a).comparedTo(b) <= 0,
    /** a가 b보다 높으면 true */
    isHigher: (a: string | number, b: string | number): boolean => 
        numUtil.convertToBigNumber(a).comparedTo(b) > 0,
    /** a가 b보다 높거나 같으면 true */
    isHigherOrEqual: (a: string | number, b: string | number): boolean => 
        numUtil.convertToBigNumber(a).comparedTo(b) >= 0,

    /** 현재가 만료 시간인지 확인 */
    isExpiredIsoString: (expiredTime: string): boolean =>
        new Date() > new Date(expiredTime),
};