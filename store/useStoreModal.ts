import { create } from 'zustand'

type ModalType = 'wallet' | 'token' | 'network' | 'provider' | 'slippage' | 'liquidity'

interface ModalState {
  isOpen: boolean
  modalType: ModalType | null
  openModal: (type: ModalType, props?: Record<string, any>) => void
  closeModal: () => void
  modalProps: any
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  openModal: (type, props) => set({ isOpen: true, modalType: type, modalProps: props }),
  closeModal: () => set({ isOpen: false, modalType: null }),
  modalProps: {},
})) 