import { create } from 'zustand';

interface TooltipState {
  showInfo: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  setShowInfo: (show: boolean) => void;
  setPosition: (position: 'top' | 'bottom' | 'left' | 'right') => void;
}

export const useTooltipStore = create<TooltipState>((set) => ({
  showInfo: false,
  position: 'top',
  setShowInfo: (show) => set({ showInfo: show }),
  setPosition: (position) => set({ position })
})); 