import { create } from 'zustand';

import type { Character } from './useStoreData';

type ModalType = 'wallet' | 'token' | 'network' | 'provider' | 'slippage' | 'liquidity' | 'character' | 'login';

interface ModalState {
  isOpen: boolean;
  modalType: ModalType | null;
  openModal: (type: ModalType, props?: Record<string, any>) => void;
  closeModal: () => void;
  modalProps: any;
  selectedCharacter: Character | null;
  setSelectedCharacter: (character: Character | null) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  openModal: (type, props) => set({ isOpen: true, modalType: type, modalProps: props }),
  closeModal: () => set({ isOpen: false, modalType: null }),
  modalProps: {},
  selectedCharacter: null,
  setSelectedCharacter: (character) => set({ selectedCharacter: character }),
}));
