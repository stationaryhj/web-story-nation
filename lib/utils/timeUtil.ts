interface TimeUtil {

  /** await 방식으로 ms 동안 멈추기 */
  sleep: (ms: number) => Promise<void>;

  /** 현재 시간의 유닉스 타임스탬프를 초단위로 반환 (UTC)*/
  getNowUnixTimestamp: () => number;

  /** 현재 시간의 유닉스 타임스탬프를 밀리초단위로 반환 (UTC)*/
  getNowUnixTimestampMs: () => number;

  /** 현재 시간과 시작 시간의 차이를 반환 */
  fromNow: (startUnixTimestampMs: number) => string;

  /** 시작 시간을 ISOString으로 받아서 현재 시간과 시작 시간의 차이를 반환 */
  fromNowIsoString: (startIsoString: string) => string;

  /**  아이템빗에서 사용할 MIN값 */
  dateToItemBitMin: () => string;

  /**  아이템빗에서 사용할 MAX값 */
  dateToItemBitMax: () => string;

  /**  timeStamp 을 Date 객체로 반환 */
  timeStampToDate: (timeStamp: number) => Date;

  /**  ISOString("2024-10-01T12:34:56Z") 을 Date 객체로 반환 */
  isoStringToDate: (isoString: string) => Date;

  /**  ISOString("2024-10-01T12:34:56Z") 을 TimeStamp로 반환 */
  isoStringToTimeStamp: (isoString: string) => number;

  /**  Date 객체를 받아서 timeStamp로 반환 */
  dateToTimeStamp: (date: Date) => number;

  /**  Date 객체를 받아서 밀리초를 버린 ISOString 로 반환 ("2024-10-01T12:34:56Z")*/
  dateToISOStringSS: (date: Date) => string;

  /**  TimeStamp를 받아서 밀리초를 버린 ISOString 로 반환 ("2024-10-01T12:34:56Z")*/
  timeStampToISOStringSS: (timeStamp: number) => string;

  /**  Date 객체를 받아서 밀리초를 포함하는 ISOString 로 반환 ("2024-10-01T12:34:56Z")*/
  dateToISOStringmm: (date: Date) => string;

  /** date 에서 시간정보를 완전히 제외하고 날만 반환 */
  dateToOnlyDate: (date: Date) => Date;

  /** date 에서 시간정보를 완전히 제외하고 시간만 반환 */
  dateToOnlyHours: (date: Date) => Date;

  /** date 에서 년을 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddYear: (date: Date, year: number) => Date;

  /** date 에서 월을 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddMonth: (date: Date, month: number) => Date;

  /** date 에서 일을 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddDay: (date: Date, day: number) => Date;

  /** date 에서 시를 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddHour: (date: Date, hour: number) => Date;

  /** date 에서 분을 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddMinute: (date: Date, minute: number) => Date;

  /** date 에서 초를 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddSecond: (date: Date, second: number) => Date;

  /** date 객체를 받아서 로컬 시간으로 반환 */
  dateToLocal: (date: Date) => string;

  /** timeStamp를 받아서 로컬 시간으로 반환 */
  timeStampToLocal: (timeStamp: number) => string;

  /** date 객체를 받아서 UTC 시간으로 반환 */
  dateToUTC0: (date: Date) => string;

  /** timeStamp를 받아서 UTC 시간으로 반환 */
  timeStampToUTC0: (timeStamp: number) => string;

  /** ISOString("2024-10-01T12:34:56Z") 을 YMD 포맷으로 반환 */
  isoStringToYMD: (isoString: string) => number;

  /** ISOString("2024-10-01T12:34:56Z") 을 YM 포맷으로 반환 */
  isoStringToYM: (isoString: string) => number;

  /** date 객체를 YMD 포맷으로 반환 */
  dateToYMD: (date: Date) => number;

  /** date 객체를 받아서 포맷된 YMD 포맷으로 반환 */
  dateToFormattedYMD: (date: Date) => string;

  /** date 객체를 YM 포맷으로 반환 */
  dateToYM: (date: Date) => number;

  /** timeStamp를 받아서 년도를 반환 */
  dateToYear: (timeStamp: number) => number;

  /** ymd 값을 받아서 하이픈(-)으로 포맷된 문자열로 반환 */
  ymdAddHyphen: (ymd: number) => string;

  /** ymd 값을 받아서 년도만 반환 */
  onlyYear: (ymd: number) => string;

  /** unixTime을 YMDHM 포맷으로 반환 */
  unixTimeToYMDHM: (value: number) => string;

  /** unixTime을 YMDHMCondition 포맷으로 반환 */
  unixTimeToYMDHMCondition: (value: number) => string;

  /** date 객체를 받아서 국가별 시간으로 반환 */
  countryTimeByDate: (date: Date, countryCode: string, format: string) => string;

  /** timeStamp를 받아서 국가별 시간으로 반환 */
  countryTime: (timestamp: number, countryCode: keyof typeof timeUtil.countryTimezoneTable, format: string) => string;

  /** 국가별 시간대 테이블 */
  countryTimezoneTable: Record<string, string>;
}

export const timeUtil: TimeUtil = {

  /** await 방식으로 ms 동안 멈추기 */
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /** 현재 시간의 유닉스 타임스탬프를 초단위로 반환 (UTC)*/
  getNowUnixTimestamp: () =>
    Math.floor(timeUtil.getNowUnixTimestampMs() / 1000),

  /** 현재 시간의 유닉스 타임스탬프를 밀리초단위로 반환 (UTC)*/
  getNowUnixTimestampMs: () => Date.now(),

  /** 현재 시간과 시작 시간의 차이를 반환 */
  fromNow: (startUnixTimestampMs: number) => {
    const nowMs = Date.now(); // 현재 시간 (밀리초 단위)
    const diffInSeconds = Math.floor((nowMs - startUnixTimestampMs) / 1000); // 현재 시간과 start_date의 차이 (초 단위)

    if (diffInSeconds < 0) {
      return `0S`; // 과거의 시간을 나타내는 경우 0초로 처리
    } else if (diffInSeconds < 60) {
      // 60초 미만일 경우 초 단위로 표기
      return `${ diffInSeconds }S`;
    } else if (diffInSeconds < 3600) {
      // 60분 미만일 경우 분 단위로 표기
      return `${ Math.floor(diffInSeconds / 60) }M`;
    } else if (diffInSeconds < 86400) {
      // 24시간 미만일 경우 시간 단위로 표기
      return `${ Math.floor(diffInSeconds / 3600) }H`;
    } else if (diffInSeconds < 31536000) {
      // 365일 미만일 경우 일 단위로 표기
      return `${ Math.floor(diffInSeconds / 86400) }D`;
    } else {
      // 그 이상일 경우 년 단위로 표기
      return `${ Math.floor(diffInSeconds / 31536000) }Y`;
    }
  },

  /** 시작 시간을 ISOString으로 받아서 현재 시간과 시작 시간의 차이를 반환 */
  fromNowIsoString: (startIsoString: string) =>
    timeUtil.fromNow(new Date(startIsoString).getTime()),

  /**  아이템빗에서 사용할 MIN값 */
  dateToItemBitMin: (): string => {
    return '1970-01-01T00:00:00Z';
  },

  /**  아이템빗에서 사용할 MAX값 */
  dateToItemBitMax: (): string => {
    return '2099-01-01T00:00:00Z';
  },

  /**  timeStamp 을 Date 객체로 반환 */
  timeStampToDate: (timeStamp: number): Date => {
    return new Date(Math.floor(timeStamp) * 1000);
  },

  /**  ISOString("2024-10-01T12:34:56Z") 을 Date 객체로 반환 */
  isoStringToDate: (isoString: string): Date => {
    return new Date(isoString);
  },

  /**  ISOString("2024-10-01T12:34:56Z") 을 TimeStamp로 반환 */
  isoStringToTimeStamp: (isoString: string): number => {
    return Math.floor(new Date(isoString).getTime() / 1000);
  },

  /**  Date 객체를 받아서 timeStamp로 반환 */
  dateToTimeStamp: (date: Date): number => {
    return Math.floor(date.getTime() / 1000);
  },

  /**  Date 객체를 받아서 밀리초를 버린 ISOString 로 반환 ("2024-10-01T12:34:56Z")*/
  dateToISOStringSS: (date: Date): string => {
    return date.toISOString().slice(0, -5) + 'Z';
  },

  /**  TimeStamp를 받아서 밀리초를 버린 ISOString 로 반환 ("2024-10-01T12:34:56Z")*/
  timeStampToISOStringSS: (timeStamp: number): string => {
    return timeUtil.dateToISOStringSS(timeUtil.timeStampToDate(timeStamp));
  },

  /**  Date 객체를 받아서 밀리초를 포함하는 ISOString 로 반환 ("2024-10-01T12:34:56Z")*/
  dateToISOStringmm: (date: Date): string => {
    return date.toISOString();
  },

  /** date 에서 시간정보를 완전히 제외하고 날만 반환 */
  dateToOnlyDate: (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  },

  /** date 에서 시간정보를 완전히 제외하고 시간만 반환 */
  dateToOnlyHours: (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setMinutes(0, 0, 0);
    return newDate;
  },

  /** date 에서 년을 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddYear: (date: Date, year: number): Date => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + year);
    return newDate;
  },

  /** date 에서 월을 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddMonth: (date: Date, month: number): Date => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + month);
    return newDate;
  },

  /** date 에서 일을 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddDay: (date: Date, day: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDay() + day);
    return newDate;
  },

  /** date 에서 시를 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddHour: (date: Date, hour: number): Date => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hour);
    return newDate;
  },

  /** date 에서 분을 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddMinute: (date: Date, minute: number): Date => {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minute);
    return newDate;
  },

  /** date 에서 초를 더하여 새로 반환 (인자로 넣은 date는 변경하지 않음) */
  getAddSecond: (date: Date, second: number): Date => {
    const newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + second);
    return newDate;
  },

  /** date 객체를 받아서 로컬 시간으로 반환 */
  dateToLocal: (date: Date): string => {
    return timeUtil.timeStampToLocal(Math.floor(date.getTime() / 1000));
  },

  /** timeStamp를 받아서 로컬 시간으로 반환 */
  timeStampToLocal: (timeStamp: number): string => {
    let ret = '';
    const d = new Date(timeStamp * 1000);

    ret += d.getFullYear();
    ret += '-';
    ret += (d.getMonth() + 1).toString().padStart(2, '0');
    ret += '-';
    ret += d.getDate().toString().padStart(2, '0');
    ret += ' ';
    ret += d.getHours().toString().padStart(2, '0');
    ret += ':';
    ret += d.getMinutes().toString().padStart(2, '0');
    ret += ':';
    ret += d.getSeconds().toString().padStart(2, '0');
    return ret;
  },

  /** date 객체를 받아서 UTC 시간으로 반환 */
  dateToUTC0: (date: Date): string => {
    // date를 UTC 기준 타임스탬프로 변환
    return timeUtil.timeStampToUTC0(Math.floor(date.getTime() / 1000));
  },

  /** timeStamp를 받아서 UTC 시간으로 반환 */
  timeStampToUTC0: (timeStamp: number): string => {
    let ret = '';
    const d = new Date(timeStamp * 1000); // 타임스탬프를 Date 객체로 변환 (UTC 기준)

    // UTC 기준으로 연도, 월, 일, 시, 분, 초를 추출
    ret += d.getUTCFullYear();
    ret += '-';
    ret += (d.getUTCMonth() + 1).toString().padStart(2, '0');
    ret += '-';
    ret += d.getUTCDate().toString().padStart(2, '0');
    ret += ' ';
    ret += d.getUTCHours().toString().padStart(2, '0');
    ret += ':';
    ret += d.getUTCMinutes().toString().padStart(2, '0');
    ret += ':';
    ret += d.getUTCSeconds().toString().padStart(2, '0');
    return ret;
  },

  /** ISOString("2024-10-01T12:34:56Z") 을 YMD 포맷으로 반환 */
  isoStringToYMD: (isoString: string): number => {
    return timeUtil.dateToYMD(timeUtil.isoStringToDate(isoString));
  },

  /** ISOString("2024-10-01T12:34:56Z") 을 YM 포맷으로 반환 */
  isoStringToYM: (isoString: string): number => {
    return timeUtil.dateToYM(timeUtil.isoStringToDate(isoString));
  },

  /** date 객체를 YMD 포맷으로 반환 */
  dateToYMD: (date: Date): number => {
    let ret = date.getFullYear() + '';
    ret += '';
    ret += (date.getMonth() + 1).toString().padStart(2, '0');
    ret += '';
    ret += date.getDate().toString().padStart(2, '0');
    return Number(ret);
  },

  /** date 객체를 받아서 포맷된 YMD 포맷으로 반환 */
  dateToFormattedYMD: (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${ year }-${ month }-${ day }`;
  },

  /** date 객체를 받아서 YM 포맷으로 반환 */
  dateToYM: (date: Date): number => {
    let ret = date.getFullYear() + '';
    ret += '';
    ret += (date.getMonth() + 1).toString().padStart(2, '0');
    return Number(ret);
  },

  /** timeStamp를 받아서 년도를 반환 */
  dateToYear: (timeStamp: number): number => {
    const date = new Date(timeStamp * 1000); // 타임스탬프를 Date 객체로 변환
    return date.getFullYear(); // 년도를 반환
  },

  /** ymd 값을 받아서 하이픈(-)으로 포맷된 문자열로 반환 */
  ymdAddHyphen: (ymd: number): string => {
    const dateString = ymd + '';
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);

    return `${ year }-${ month }-${ day }`;
  },

  /** ymd 값을 받아서 년도만 반환 */
  onlyYear: (ymd: number): string => {
    const dateString = ymd + '';
    const year = dateString.slice(0, 4);
    return year;
  },

  /** unixTime을 YMDHM 포맷으로 반환 */
  unixTimeToYMDHM: (value: number): string => {
    const nowTime = Date.now(); // 현재 시간을 ms 단위로 가져옵니다.
    const diff = value - nowTime; // 입력된 시간과 현재 시간의 차이를 ms 단위로 계산합니다.

    // ms 단위 차이를 Date 객체로 변환
    const diffDate = new Date(diff);

    // 각 시간 단위 계산
    const years = diffDate.getUTCFullYear() - 1970;
    const months = diffDate.getUTCMonth();
    const days = diffDate.getUTCDate() - 1;
    const hours = diffDate.getUTCHours();
    const minutes = diffDate.getUTCMinutes();
    const seconds = diffDate.getUTCSeconds();

    // 배열로 변환하여 0이 아닌 값만 필터링
    const timeParts = [
      { unit: 'Y', value: years },
      { unit: 'M', value: months },
      { unit: 'D', value: days },
      { unit: 'H', value: hours },
      { unit: 'M', value: minutes },
      { unit: 'S', value: seconds },
    ]
      .filter((part) => part.value !== 0)
      .map((part) => `${ part.value }${ part.unit }`)
      .join(' ');

    return timeParts; // 필터링된 시간 포맷을 문자열로 조합
  },

  /** unixTime을 YMDHMCondition 포맷으로 반환 */
  unixTimeToYMDHMCondition: (value: number): string => {
    const nowTime = Date.now();
    const diff = value - nowTime;

    const diffDate = new Date(diff);

    const days = diffDate.getUTCDate() - 1;
    const hours = diffDate.getUTCHours();
    const minutes = diffDate.getUTCMinutes();
    const seconds = diffDate.getUTCSeconds();

    if (days > 0) {
      return `${ days }D`;
    } else if (hours > 0) {
      return `${ hours }H`;
    } else if (minutes > 0) {
      return `${ minutes }M`;
    } else {
      return `${ seconds }S`;
    }
  },

  /** date 객체를 받아서 국가별 시간으로 반환 */
  countryTimeByDate: (
    date: Date,
    countryCode: string,
    format: string,
  ): string => {
    return timeUtil.countryTime(date.getTime() / 1000, countryCode, format);
  },

  /** timeStamp를 받아서 국가별 시간으로 반환 */
  countryTime: (
    timestamp: number,
    countryCode: keyof typeof timeUtil.countryTimezoneTable,
    format: string,
  ): string => {
    const timezone = timeUtil.countryTimezoneTable[countryCode] ?
      timeUtil.countryTimezoneTable[countryCode] :
      timeUtil.countryTimezoneTable.KR;

    if (!timeUtil.countryTimezoneTable[countryCode]) {
      console.error(
        '[국가코드 찾기 실패] 지원하지 않는 국가코드입니다 : ',
        countryCode,
      );
    }

    const date = new Date(timestamp * 1000);

    // Use Intl.DateTimeFormat to get the timezone-specific date and time parts
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    };

    // Format the date
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(date);

    // Extract individual parts from the formatted result
    const dateParts: { [key: string]: string } = {};
    parts.forEach((part) => {
      if (part.type !== 'literal') {
        dateParts[part.type] = part.value;
      }
    });
    const padZero = (num: number): string => {
      return num < 10 ? '0' + num : num.toString();
    };
    const formatTimezoneName = (timezoneName: string): string => {
      // return timezoneName.replace("GMT", "UTC").replace("UTC", "UTC ");
      return timezoneName.replace('GMT', 'UTC');
    };
    // Format the date and replace "GMT" with "UTC"
    const YYYY = dateParts.year;
    const MM = padZero(Number(dateParts.month));
    const DD = padZero(Number(dateParts.day));
    const HH = padZero(Number(dateParts.hour));
    const mm = padZero(Number(dateParts.minute));
    const ss = padZero(Number(dateParts.second));
    const utc = `${ formatTimezoneName(dateParts.timeZoneName) }`;
    return format
      .replace('YYYY', YYYY)
      .replace('MM', MM)
      .replace('YYYY', YYYY)
      .replace('DD', DD)
      .replace('HH', HH)
      .replace('mm', mm)
      .replace('ss', ss)
      .replace('utc', utc);
  },

  /** 국가별 시간대 테이블 */
  countryTimezoneTable: {
    AF: 'Asia/Kabul',
    AX: 'Europe/Helsinki',
    AL: 'Europe/Tirane',
    DZ: 'Africa/Algiers',
    AS: 'Pacific/Pago_Pago',
    AD: 'Europe/Andorra',
    AO: 'Africa/Luanda',
    AI: 'America/Anguilla',
    AQ: 'Antarctica/Palmer',
    AG: 'America/Antigua',
    AR: 'America/Argentina/Buenos_Aires',
    AM: 'Asia/Yerevan',
    AW: 'America/Aruba',
    AU: 'Australia/Sydney',
    AT: 'Europe/Vienna',
    AZ: 'Asia/Baku',
    BS: 'America/Nassau',
    BH: 'Asia/Bahrain',
    BD: 'Asia/Dhaka',
    BB: 'America/Barbados',
    BY: 'Europe/Minsk',
    BE: 'Europe/Brussels',
    BZ: 'America/Belize',
    BJ: 'Africa/Porto-Novo',
    BM: 'Atlantic/Bermuda',
    BT: 'Asia/Thimphu',
    BO: 'America/La_Paz',
    BQ: 'America/Kralendijk',
    BA: 'Europe/Sarajevo',
    BW: 'Africa/Gaborone',
    BR: 'America/Sao_Paulo',
    IO: 'Indian/Chagos',
    BN: 'Asia/Brunei',
    BG: 'Europe/Sofia',
    BF: 'Africa/Ouagadougou',
    BI: 'Africa/Bujumbura',
    KH: 'Asia/Phnom_Penh',
    CM: 'Africa/Douala',
    CA: 'America/Toronto',
    CV: 'Atlantic/Cape_Verde',
    KY: 'America/Cayman',
    CF: 'Africa/Bangui',
    TD: 'Africa/Ndjamena',
    CL: 'America/Santiago',
    CN: 'Asia/Shanghai',
    CO: 'America/Bogota',
    KM: 'Indian/Comoro',
    CG: 'Africa/Brazzaville',
    CD: 'Africa/Kinshasa',
    CR: 'America/Costa_Rica',
    HR: 'Europe/Zagreb',
    CU: 'America/Havana',
    CW: 'America/Curacao',
    CY: 'Asia/Nicosia',
    CZ: 'Europe/Prague',
    DK: 'Europe/Copenhagen',
    DJ: 'Africa/Djibouti',
    DM: 'America/Dominica',
    DO: 'America/Santo_Domingo',
    EC: 'America/Guayaquil',
    EG: 'Africa/Cairo',
    SV: 'America/El_Salvador',
    GQ: 'Africa/Malabo',
    ER: 'Africa/Asmara',
    EE: 'Europe/Tallinn',
    ET: 'Africa/Addis_Ababa',
    FI: 'Europe/Helsinki',
    FR: 'Europe/Paris',
    GA: 'Africa/Libreville',
    GM: 'Africa/Banjul',
    GE: 'Asia/Tbilisi',
    DE: 'Europe/Berlin',
    GH: 'Africa/Accra',
    GR: 'Europe/Athens',
    GL: 'America/Nuuk',
    GD: 'America/Grenada',
    GU: 'Pacific/Guam',
    GT: 'America/Guatemala',
    GG: 'Europe/Guernsey',
    GN: 'Africa/Conakry',
    GW: 'Africa/Bissau',
    GY: 'America/Guyana',
    HT: 'America/Port-au-Prince',
    HN: 'America/Tegucigalpa',
    HK: 'Asia/Hong_Kong',
    HU: 'Europe/Budapest',
    IS: 'Atlantic/Reykjavik',
    IN: 'Asia/Kolkata',
    ID: 'Asia/Jakarta',
    IR: 'Asia/Tehran',
    IQ: 'Asia/Baghdad',
    IE: 'Europe/Dublin',
    IM: 'Europe/Isle_of_Man',
    IL: 'Asia/Jerusalem',
    IT: 'Europe/Rome',
    JM: 'America/Jamaica',
    JP: 'Asia/Tokyo',
    JE: 'Europe/Jersey',
    JO: 'Asia/Amman',
    KZ: 'Asia/Almaty',
    KE: 'Africa/Nairobi',
    KI: 'Pacific/Tarawa',
    KR: 'Asia/Seoul',
    KW: 'Asia/Kuwait',
    KG: 'Asia/Bishkek',
    LA: 'Asia/Vientiane',
    LV: 'Europe/Riga',
    LB: 'Asia/Beirut',
    LS: 'Africa/Maseru',
    LR: 'Africa/Monrovia',
    LY: 'Africa/Tripoli',
    LI: 'Europe/Vaduz',
    LT: 'Europe/Vilnius',
    LU: 'Europe/Luxembourg',
    MO: 'Asia/Macau',
    MK: 'Europe/Skopje',
    MG: 'Indian/Antananarivo',
    MW: 'Africa/Blantyre',
    MY: 'Asia/Kuala_Lumpur',
    MV: 'Indian/Maldives',
    ML: 'Africa/Bamako',
    MT: 'Europe/Malta',
    MH: 'Pacific/Majuro',
    MQ: 'America/Martinique',
    MR: 'Africa/Nouakchott',
    MU: 'Indian/Mauritius',
    MX: 'America/Mexico_City',
    FM: 'Pacific/Pohnpei',
    MD: 'Europe/Chisinau',
    MC: 'Europe/Monaco',
    MN: 'Asia/Ulaanbaatar',
    ME: 'Europe/Podgorica',
    MA: 'Africa/Casablanca',
    MZ: 'Africa/Maputo',
    MM: 'Asia/Yangon',
    NA: 'Africa/Windhoek',
    NR: 'Pacific/Nauru',
    NP: 'Asia/Kathmandu',
    NL: 'Europe/Amsterdam',
    NC: 'Pacific/Noumea',
    NZ: 'Pacific/Auckland',
    NI: 'America/Managua',
    NE: 'Africa/Niamey',
    NG: 'Africa/Lagos',
    NU: 'Pacific/Niue',
    NO: 'Europe/Oslo',
    OM: 'Asia/Muscat',
    PK: 'Asia/Karachi',
    PW: 'Pacific/Palau',
    PA: 'America/Panama',
    PG: 'Pacific/Port_Moresby',
    PY: 'America/Asuncion',
    PE: 'America/Lima',
    PH: 'Asia/Manila',
    PL: 'Europe/Warsaw',
    PT: 'Europe/Lisbon',
    PR: 'America/Puerto_Rico',
    QA: 'Asia/Qatar',
    RO: 'Europe/Bucharest',
    RU: 'Europe/Moscow',
    RW: 'Africa/Kigali',
    SA: 'Asia/Riyadh',
    SN: 'Africa/Dakar',
    RS: 'Europe/Belgrade',
    SC: 'Indian/Mahe',
    SG: 'Asia/Singapore',
    SK: 'Europe/Bratislava',
    SI: 'Europe/Ljubljana',
    SB: 'Pacific/Guadalcanal',
    ZA: 'Africa/Johannesburg',
    ES: 'Europe/Madrid',
    LK: 'Asia/Colombo',
    SD: 'Africa/Khartoum',
    SR: 'America/Paramaribo',
    SE: 'Europe/Stockholm',
    CH: 'Europe/Zurich',
    SY: 'Asia/Damascus',
    TW: 'Asia/Taipei',
    TH: 'Asia/Bangkok',
    TT: 'America/Port_of_Spain',
    TN: 'Africa/Tunis',
    TR: 'Europe/Istanbul',
    TM: 'Asia/Ashgabat',
    TV: 'Pacific/Funafuti',
    UG: 'Africa/Kampala',
    UA: 'Europe/Kiev',
    AE: 'Asia/Dubai',
    GB: 'Europe/London',
    US: 'America/New_York',
    UY: 'America/Montevideo',
    UZ: 'Asia/Tashkent',
    VU: 'Pacific/Efate',
    VE: 'America/Caracas',
    VN: 'Asia/Ho_Chi_Minh',
    YE: 'Asia/Aden',
    ZM: 'Africa/Lusaka',
    ZW: 'Africa/Harare',
    BV: 'UTC', // Bouvet Island, UTC
    TL: 'Asia/Dili', // Timor-Leste
    PM: 'America/Miquelon', // Saint Pierre and Miquelon
    PN: 'Pacific/Pitcairn', // Pitcairn Islands
  },
};
