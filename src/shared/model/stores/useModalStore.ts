import { create } from 'zustand';

import type { ModalItem } from '@/shared/model/types/modal';

interface ModalState {
  modals: ModalItem[];
  openModal: (modal: ModalItem) => void;
  closeModal: () => void;
  closeModalByType: (type: string) => void;
  closeAllModals: () => void;
}

const useModalStore = create<ModalState>((set) => ({
  modals: [],

  openModal: ({ type, props }) =>
    set((state) => {
      const existingIndex = state.modals.findIndex((modal) => modal.type === type);

      let nextModals: ModalItem[];

      if (existingIndex !== -1) {
        const filtered = state.modals.filter((modal) => modal.type !== type);
        nextModals = [...filtered, { type, props, id: `${type}-${Date.now()}` }];
      } else {
        nextModals = [...state.modals, { type, props, id: `${type}-${Date.now()}` }];
      }

      return { modals: nextModals };
    }),

  closeModal: () =>
    set((state) => {
      if (state.modals.length === 0) {
        return state;
      }

      return {
        modals: state.modals.slice(0, -1),
      };
    }),

  closeModalByType: (type) =>
    set((state) => ({
      modals: state.modals.filter((modal) => modal.type !== type),
    })),

  closeAllModals: () => set({ modals: [] }),
}));

export default useModalStore;
