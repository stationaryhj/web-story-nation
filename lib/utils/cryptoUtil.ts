import CryptoJS from 'crypto-js';

/**
 * AES-256-ECB 암호화/복호화 유틸리티
 * 채팅방과 동일한 암호화 방식 사용
 *
 * 백엔드 스펙:
 * - 알고리즘: Rijndael (AES)
 * - 키 길이: 256비트
 * - 모드: ECB
 * - 패딩: PKCS7
 * - 암호화 후 Base64 인코딩
 */

// 백엔드와 공유하는 암호화 키 (32바이트 = 256비트)
const ENCRYPTION_KEY = '12345678901234567890123456789012';

/**
 * 객체를 JSON으로 변환 후 AES 암호화
 * @param data 암호화할 데이터
 * @returns Base64로 인코딩된 암호화 문자열
 */
export function encryptData(data: any): string {
  // 1. JSON 문자열로 변환
  const jsonString = JSON.stringify(data);

  // 2. AES-256-ECB 암호화
  const encrypted = CryptoJS.AES.encrypt(jsonString, CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
    keySize: 8,
  });

  // 3. Base64 문자열로 변환
  const base64String = encrypted.toString();
  return base64String;
}

/**
 * AES 암호화된 문자열을 복호화
 * @param encryptedData Base64로 인코딩된 암호화 문자열
 * @returns 복호화된 객체
 */
export function decryptData<T = any>(encryptedData: string): T {
  try {
    // 1단계: Base64 디코딩
    const decodedEncryptedData = atob(encryptedData);

    // 2단계: AES 복호화
    const decrypted = CryptoJS.AES.decrypt(
      decodedEncryptedData,
      CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY),
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
        keySize: 8,
      }
    );

    // 3단계: UTF-8 문자열로 변환
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!jsonString || jsonString.length === 0) {
      console.error('복호화 실패: 빈 문자열 | 암호화 키가 틀렸을 가능성이 높습니다.');
      throw new Error('복호화 실패: 결과가 비어있습니다.');
    }

    // 4단계: JSON 파싱
    const result = JSON.parse(jsonString);

    return result;
  } catch (error) {
    console.error('복호화 중 에러 발생:', error);

    if (error instanceof SyntaxError) {
      throw new Error(
        `JSON 파싱 실패: 복호화는 성공했으나 결과가 유효한 JSON이 아닙니다. 원인: ${error.message}`
      );
    }

    throw new Error(`복호화 실패: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 토큰 전용 복호화 함수
 * 채팅방에서 encryptData(token)으로 토큰 문자열을 직접 암호화해서 보냄
 * @param encryptedToken 암호화된 토큰 문자열
 * @returns 복호화된 토큰 문자열
 */
export function decryptToken(encryptedToken: string): string {
  // 토큰 문자열이 직접 암호화된 경우
  const data = decryptData<string>(encryptedToken);
  return data;
}

/**
 * 토큰 전용 암호화 함수
 * @param token 토큰 문자열
 * @returns 암호화된 토큰 문자열
 */
export function encryptToken(token: string): string {
  return encryptData(token);
}
