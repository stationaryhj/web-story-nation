'use client';

import { useContractWrappersStore } from '@/store/useContractWrappers';
import { useMetamaskStore } from '@/store/useMetamaskStore';
import { useEffect, useState } from 'react';

export default function MetamaskExample() {
  const {
    account,
    chainId,
    isConnected,
    initSDK,
    connectWallet,
    disconnectWallet,
    switchToArbitrumTestnet,
    sendTransaction,
  } = useMetamaskStore();

  const { setStoredData, getStoredData } = useContractWrappersStore();

  const [ toAddress, setToAddress ] = useState('');
  const [ amount, setAmount ] = useState('');
  const [ txHash, setTxHash ] = useState<string | null>(null);
  const [ testNumber, setTestNumber ] = useState(0);
  const [ storedNumber, setStoredNumber ] = useState<number | null>(null);

  useEffect(() => {
    initSDK();
  }, [ initSDK ]);

  // 저장된 값을 주기적으로 조회
  useEffect(() => {
    if (!isConnected) return;

    const fetchStoredData = async() => {
      const value = await getStoredData();
      setStoredNumber(value);
    };

    fetchStoredData();
    // 3초마다 값을 갱신
    const interval = setInterval(fetchStoredData, 3000);

    return () => clearInterval(interval);
  }, [ isConnected, getStoredData ]);

  const handleSend = async() => {
    if (!toAddress || !amount) {
      alert('주소와 금액을 입력해주세요');
      return;
    }

    const hash = await sendTransaction(toAddress, amount);
    if (hash) {
      setTxHash(hash);
      alert('전송 성공!');
    }
  };

  const handleSetStoredData = async() => {
    const result = await setStoredData(testNumber);

    if (result) {
      alert('컨트랙트 호출 성공!');
      // 즉시 새로운 값 조회
      const newValue = await getStoredData();
      setStoredNumber(newValue);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">메타마스크 연동 예제</h1>

      <div className="space-y-4">
        { !isConnected ? (
          <button
            onClick={ connectWallet }
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            지갑 연결하기
          </button>
        ) : (
          <>
            <div className="p-4 bg-gray-100 rounded">
              <p><strong>연결된 계정:</strong> { account }</p>
              <p><strong>체인 ID:</strong> { chainId }</p>
            </div>

            <div className="p-4 bg-white border rounded">
              <h2 className="text-xl font-semibold mb-4">ETH 전송</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    받는 주소
                  </label>
                  <input
                    type="text"
                    value={ toAddress }
                    onChange={ (e) => setToAddress(e.target.value) }
                    className="w-full p-2 border rounded"
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    금액 (ETH)
                  </label>
                  <input
                    type="number"
                    value={ amount }
                    onChange={ (e) => setAmount(e.target.value) }
                    className="w-full p-2 border rounded"
                    placeholder="0.01"
                    step="0.000000000000000001"
                  />
                </div>
                <button
                  onClick={ handleSend }
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  전송하기
                </button>
              </div>
              { txHash && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    트랜잭션 해시: { txHash }
                  </p>
                </div>
              ) }
            </div>

            <div className="space-x-4">
              <button
                onClick={ switchToArbitrumTestnet }
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                아비트럼 테스트넷으로 변경
              </button>

              <button
                onClick={ disconnectWallet }
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                연결 해제
              </button>
            </div>
          </>
        ) }
      </div>

      { isConnected && (
        <div className="p-4 bg-white border rounded mt-4">
          <h2 className="text-xl font-semibold mb-4">테스트 컨트랙트 호출</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                저장된 값
              </label>
              <p className="text-lg font-semibold">
                { storedNumber !== null ? storedNumber : '로딩 중...' }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설정할 숫자
              </label>
              <input
                type="number"
                value={ testNumber }
                onChange={ (e) => setTestNumber(Number(e.target.value)) }
                className="w-full p-2 border rounded"
                placeholder="100"
              />
            </div>
            <button
              onClick={ handleSetStoredData }
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              값 설정하기
            </button>
          </div>
        </div>
      ) }
    </div>
  );
}
