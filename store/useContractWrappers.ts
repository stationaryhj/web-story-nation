// stores/contractWrappers.ts
import { create } from 'zustand'
import { useMetamaskStore } from './useMetamaskStore'
import { ABI } from '@/services/contract/abi/simpleStorage'
import { AbiItem } from 'web3-utils'

interface ContractWrappersState {
  setStoredData: (x: number) => Promise<string | null>
  getStoredData: () => Promise<number | null>
}

const CONTRACT_ADDRESS = "0x04a746013Cd5bC73BCe1a11251157dC809B8Ab41"

export const useContractWrappersStore = create<ContractWrappersState>(() => ({
  /**
   * set 메서드를 호출하는 래핑 함수
   */
  setStoredData: async (x: number) => {
    try {
      console.log('setStoredData - x :', x)
      const { sendTransaction, web3 } = useMetamaskStore.getState()

      if (!web3) {
        throw new Error('Web3 인스턴스가 없습니다.')
      }

      const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS)
      const data = contract.methods.set(x).encodeABI()
      console.log('Contract data:', data)

      // 트랜잭션 발송 (순서 수정: to, value, data)
      const txHash = await sendTransaction(CONTRACT_ADDRESS, '0', data)
      return txHash
    } catch (error) {
      console.error('setStoredData 호출 실패:', error)
      return null
    }
  },

  /**
   * get 메서드를 호출하는 래핑 함수
   */
  getStoredData: async () => {
    try {
      const { web3, account } = useMetamaskStore.getState()
      if (!web3 || !account) return null

      const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS)
      const data = await contract.methods.get().call()
      return Number(data)
    } catch (error) {
      console.error('getStoredData 호출 실패:', error)
      return null
    }
  }
}))
