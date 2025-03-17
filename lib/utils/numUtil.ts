import BigNumber from "bignumber.js";

export const numUtil = {
    /** BigNumber 가 아니면 BigNumber 로 변환 */
    convertToBigNumber: (value:BigNumber | number | string) =>
        value instanceof BigNumber ? value : new BigNumber(value),

    /** 모든 인자를 BigNumber로 변환 후 배열로 반환 */
    convertToBigNumbers: (...values: (BigNumber | number | string)[]) =>
        values.map((value) => numUtil.convertToBigNumber(value)),

    /** 모든 인자를 BigNumber로 변환 후 최소값을 찾음 */
    minBigNumber: (...values: (BigNumber | number | string)[]) =>
        numUtil
            .convertToBigNumbers(...values)
            .reduce((min, current) =>
                min.comparedTo(current) < 0 ? min : current,
            ),

    /** 모든 인자를 BigNumber로 변환 후 최댓값을 찾음 */
    maxBigNumber: (...values: (BigNumber | number | string)[]) =>
        numUtil
            .convertToBigNumbers(...values)
            .reduce((max, current) =>
                max.comparedTo(current) > 0 ? max : current,
            ),

    /** BigNumber 와 일반 숫자 상관없이 전부 string 로 변환 */
    allNumberTypeToString: (value: BigNumber | number | string) =>
        value instanceof BigNumber ? value.toString() : value + "",

    /** 모든 인자를 BigNumber로 변환 후 min ~ max 랜덤값을 구함 */
    randBigNumber: (min: BigNumber | number | string, max: BigNumber | number | string) => {
        min = numUtil.convertToBigNumber(min);
        max = numUtil.convertToBigNumber(max);
        return max.minus(min).multipliedBy(Math.random()).plus(min);
    },

    /** 랜덤 정수 얻기 */
    randInt: (min: BigNumber | number | string, max: BigNumber | number | string) =>
        Math.floor(Math.random() * (Number(max) - Number(min) + 1)) +
        Number(min),

    /** total 기준 확률이 true 인지 (60% 확률로 true 를 내고 싶으면 numUtil.randSuccess(60, 100)) */
    randSuccess: (prob: BigNumber | number | string, total: BigNumber | number | string) =>
        numUtil
            .convertToBigNumber(prob)
            .dividedBy(total)
            .comparedTo(Math.random()) >= 0,

    /** 객체 안에 가중치가 있는 변수의 가중치를 반영한 랜덤 필드값을 반환 */
    randDiceObj: (obj: { [key: string]: BigNumber | number | string }) => {
        const keys = Object.keys(obj);
        const totalWeight = keys.reduce(
            (sum, key) => Number(sum) + Number(obj[key]),
            0,
        );
        let randomValue = numUtil.randInt(1, totalWeight);
        let accumulatedWeight = 0;

        for (const key of keys) {
            accumulatedWeight += Number(obj[key]);
            if (randomValue <= accumulatedWeight) {
                return key;
            }
        }
    },
    /** 배열 안의 가중치를 반영한 랜덤 인덱스를 반환 */
    randDiceArr: (arr: number[]) => {
        const totalWeight = arr.reduce((sum, val) => sum + val, 0);
        let randomValue = Math.random() * totalWeight;
        let accumulatedWeight = 0;

        for (let i = 0; i < arr.length; i++) {
            accumulatedWeight += arr[i];
            if (randomValue <= accumulatedWeight) {
                return i;
            }
        }
    },
    /** value 의 percent% 증가값 (value * (1 + percent / 100)) */
    incPercentBigNumber: (value: BigNumber | number | string, percent: BigNumber | number | string) =>
        numUtil
            .convertToBigNumber(value)
            .multipliedBy(
                numUtil
                    .convertToBigNumber(1)
                    .plus(numUtil.convertToBigNumber(percent).dividedBy(100)),
            ),
    /** value 의 percent% 감소값 (value * (1 - percent / 100)) */
    decPercentBigNumber: (value: BigNumber | number | string, percent: BigNumber | number | string) =>
        numUtil
            .convertToBigNumber(value)
            .multipliedBy(
                numUtil
                    .convertToBigNumber(1)
                    .minus(numUtil.convertToBigNumber(percent).dividedBy(100)),
            ),
    /** 주소를 받아서 앞부분과 뒷부분을 잘라서 반환 */
    simpleText: (address: string, front: number, end: number) => {
        if (address && address.length > 5) {
            let frontStr = address.substr(0, front);
            let endStr = address.substr(address.length - end, address.length);
            return frontStr + "..." + endStr;
        }
        return address;
    },
};