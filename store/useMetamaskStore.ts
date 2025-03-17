// stores/metamaskStore.ts
import { create } from 'zustand'
import { MetaMaskSDK } from '@metamask/sdk'
import Web3 from 'web3'

interface MetamaskState {
  account: string
  chainId: string
  isConnected: boolean
  sdk: MetaMaskSDK | null
  web3: Web3 | null
  loading: boolean

  // Actions
  initSDK: () => void
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToArbitrumTestnet: () => Promise<void>
  sendTransaction: (to: string, value: string, data?: string) => Promise<string | null>

  // Event Handlers
  handleAccountsChanged: (accounts: string[]) => void
  handleChainChanged: (chainId: string) => void

  // Set loading state
  setLoading: (loading: boolean) => void

  // New actions
  callContract: (params: { contractAddress: string; abi: any; method: string; args?: any[]; value?: string }) => Promise<string | null>
}

export const useMetamaskStore = create<MetamaskState>((set, get) => ({
  // 초기 상태값
  account: '',
  chainId: '',
  isConnected: false,
  sdk: null,
  web3: null,
  loading: false,

  /**
   * MetaMask SDK를 초기화하고 이벤트 리스너를 설정하는 함수
   */
  initSDK: () => {
    const sdk = new MetaMaskSDK({
      dappMetadata: {
        name: "Next.js Metamask Example",
        url: window.location.href,
      }
    })

    // Web3 인스턴스 초기화
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      set({ sdk, web3 })
    } else {
      set({ sdk })
    }
    
    if (window.ethereum) {
      // 계정 변경 이벤트 감지
      window.ethereum.on('accountsChanged', (accounts: any) => {
        get().handleAccountsChanged(accounts as string[])
      })
      // 체인 변경 이벤트 감지
      window.ethereum.on('chainChanged', (chainId: any) => {
        get().handleChainChanged(chainId as string)
      })
    }
  },

  /**
   * MetaMask 지갑 연결을 처리하는 함수
   */
  connectWallet: async () => {
    try {
      if (!window.ethereum) {
        alert('메타마스크를 설치해주세요!')
        return
      }

      // 사용자 계정 접근 권한 요청
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[]

      // 현재 체인 ID 조회
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      }) as string

      if (accounts[0]) {
        set({
          account: accounts[0],
          chainId,
          isConnected: true
        })
      }
    } catch (error) {
      console.error('연결 실패:', error)
    }
  },

  /**
   * MetaMask 지갑 연결을 해제하는 함수
   */
  disconnectWallet: () => {
    set({
      account: '',
      chainId: '',
      isConnected: false
    })
  },

  /**
   * Arbitrum Sepolia 테스트넷으로 네트워크를 변경하는 함수
   */
  switchToArbitrumTestnet: async () => {
    if (!window.ethereum) return

    try {
      // 기존 네트워크로 전환 시도
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x66eee' }]
      })
    } catch (error: any) {
      // 네트워크가 없는 경우 (에러 코드 4902)
      if (error.code === 4902) {
        try {
          // 새로운 네트워크 추가
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x66eee',
                chainName: 'Arbitrum Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://arbitrum-sepolia.infura.io/v3/5d6176beb4f94ad28467b8698db58bfd'],
                blockExplorerUrls: ['https://sepolia.arbiscan.io']
              }
            ]
          })
        } catch (addError) {
          console.error('네트워크 추가 실패:', addError)
        }
      }
      console.error('네트워크 변경 실패:', error)
    }
  },

  /**
   * MetaMask 계정 변경 이벤트 핸들러
   */
  handleAccountsChanged: (accounts: string[]) => {
    if (accounts.length === 0) {
      // 연결된 계정이 없는 경우
      set({
        isConnected: false,
        account: ''
      })
    } else {
      // 새로운 계정으로 업데이트
      set({ account: accounts[0] })
    }
  },

  /**
   * MetaMask 체인 변경 이벤트 핸들러
   */
  handleChainChanged: (chainId: string) => {
    set({ chainId })
  },

  /**
   * 트랜잭션을 발송하는 함수 (ETH 전송 및 스마트 컨트랙트 호출 지원)
   */
  sendTransaction: async (to: string, value: string, data?: string) => {
    try {
      console.log('sendTransaction params:', { to, value, data })

      const { web3, account } = get()
      if (!web3 || !account) return null

      set({ loading: true })

      try {
        // 트랜잭션 객체 구성
        const txParams: any = {
          from: account,
          to,
          value: value === '0' ? '0x0' : `0x${BigInt(web3.utils.toWei(value, 'ether')).toString(16)}`,
        }

        // 컨트랙트 호출인 경우
        if (data) {
          txParams.data = data
          txParams.value = '0x0' // 컨트랙트 호출 시 value는 0으로 설정
        }

        console.log('txParams before gas:', txParams)

        // 가스 예상치 계산
        const gasEstimate = await web3.eth.estimateGas(txParams)
        const gasWithBuffer = Math.round(Number(gasEstimate) * 1.2)

        // 가스 가격 조회
        const gasPrice = await web3.eth.getGasPrice()

        // 가스 관련 파라미터 추가
        txParams.gas = `0x${gasWithBuffer.toString(16)}`
        txParams.gasPrice = `0x${BigInt(gasPrice).toString(16)}`

        console.log('txParams final:', txParams)

        // 트랜잭션 전송
        const txHash = await window.ethereum!.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        }) as string

        set({ loading: false })
        return txHash
      } catch (error) {
        throw error
      }
    } catch (error: any) {
      set({ loading: false })
      console.error('전송 실패:', error)

      let errorMessage = '전송 중 오류가 발생했습니다.'
      if (error.code === 4001) {
        errorMessage = '사용자가 트랜잭션을 거부했습니다.'
      } else if (error.code === -32603) {
        errorMessage = '네트워크 오류가 발생했습니다. 잔액과 가스비를 확인해주세요.'
      } else if (error.message.includes('잔액이 부족합니다')) {
        errorMessage = error.message
      }

      alert(errorMessage)
      return null
    }
  },

  /**
   * 컨트랙트 호출 함수
   */
  callContract: async ({ contractAddress, abi, method, args = [], value = '0' }) => {
    try {
      const { web3, account } = get()
      if (!web3 || !account) return null

      set({ loading: true })

      // 컨트랙트 인스턴스 생성
      const contract = new web3.eth.Contract(abi as any, contractAddress)

      // 메서드 호출 데이터 생성
      const data = contract.methods[method](...args).encodeABI()
      console.log('Contract call data:', data)

      // 트랜잭션 전송
      const txHash = await get().sendTransaction(contractAddress, value, data)
      
      set({ loading: false })
      return txHash
    } catch (error: any) {
      set({ loading: false })
      console.error('컨트랙트 호출 실패:', error)
      return null
    }
  },

  /**
   * Set loading 상태를 변경하는 함수
   */
  setLoading: (loading: boolean) => set({ loading }),
}))
