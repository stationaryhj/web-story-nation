export const etcUtil = {
    /** 하나의 배열 array를 chunkSize 단위의 여러개 배열로 반환
    예를 들자면 array.length가 10000이고 chunkSize 가 1000인 경우 1000개짜리 배열 10개를 반환 */
    splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
        let result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            const chunk = array.slice(i, i + chunkSize);
            result.push(chunk);
        }
        return result;
    }
}