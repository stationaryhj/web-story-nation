import BigNumber from 'bignumber.js';

/** 숫자 관련 유틸 */

export const numFormatter = {

  /** 값에 해당하는 포맷을 반환하는 함수 */
  formatValue: (val: number | string, decimalUnit: number, isUnit = false) => {
    let before = val;
    if (isUnit) {
      if (val && Number(val) > 0) {
        const formats = [
          { unit: 'm', decimals: 2, limit: 1000000 },
          { unit: 'k', decimals: 2, limit: 1000 },
        ];

        for (const format of formats) {
          if (numFormatter.comparedTo(before, format.limit) >= 0) {
            before = numFormatter.getDisplayFixedNumber(
              new BigNumber(before).dividedBy(format.limit),
              format.decimals,
              true,
            );
            return before + format.unit;
          }
        }
      } else {
        before = 0;
      }
    }

    return numFormatter.getDisplayFixedNumber(
      new BigNumber(before),
      decimalUnit,
      true,
    );
  },

  /** 값을 고정 소수점으로 변환하고 필요시 콤마 추가 */
  getDisplayFixedNumber: (val: BigNumber | number, unit = 2, isComma = true) => {
    if (val instanceof BigNumber) {
      const result = val.toFixed(unit);
      return isComma ? numFormatter.numberWithCommas(result) : result;
    }

    if (isNaN(val as number)) {
      return '0';
    }
    const result = (val as number).toFixed(unit);
    return isComma ? numFormatter.numberWithCommas(result) : result;
  },

  /** 두 수를 비교 */
  comparedTo: (a: BigNumber | number | string, b: BigNumber | number | string) => {
    const bnA = numFormatter.convertToBigNumber(a);
    const bnB = numFormatter.convertToBigNumber(b);
    return bnA.comparedTo(bnB);
  },

  /** BigNumber로 변환, 이미 BigNumber인 경우 변환하지 않음 */
  convertToBigNumber: (value: BigNumber | number | string): BigNumber => {
    return BigNumber.isBigNumber(value) ? value : new BigNumber(value);
  },

  numberWithCommas: (x: string | number | null | undefined): string => {
    if (x === undefined || x === null) return '0';
    const parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },

  /** 데이터 검증 boolean */
  checkNumberOverCount: (...values: Array<number | string>): boolean => {
    const converts = [
      { limited: 1000000 }, // 'm'이 붙는 최소값
      { limited: 1000 }, // 'k'가 붙는 최소값
    ];

    return values.some((val) => {
      const numericValue = Number(val);
      return converts.some((convert) => {
        return numericValue >= convert.limited;
      });
    });
  },

  /** 문자열에서 숫자만 추출하여 반환 */
  onlyNumber: (str: string, len: number): string => {
    if (str === undefined) return '';
    // 숫자와 소수점만 허용하고, 소수점은 하나만 허용
    str = str.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    // 첫 문자가 소수점이면 제거
    str = str.replace(/^\./, '');
    if (len > 0) return str.substring(0, len);
    return str;
  },
};
