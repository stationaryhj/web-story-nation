import type { ComponentType } from 'react';

export type ModalComponent<Props = Record<string, unknown>> = ComponentType<Props>;

export type ModalRegistry = Record<string, ModalComponent<any>>;

export type ModalItem = {
  type: string;
  props?: Record<string, unknown>;
  id?: string; // 고유 ID (AnimatePresence를 위한)
};
