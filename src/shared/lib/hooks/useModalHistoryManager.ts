import { useEffect } from 'react';

import useModalStore from '@/shared/model/stores/useModalStore';

export function useModalHistoryManager() {
  const modals = useModalStore((s) => s.modals);
  const closeModal = useModalStore((s) => s.closeModal);

  useEffect(() => {
    const handlePopState = () => {
      if (modals.length > 0) {
        closeModal();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [modals.length, closeModal]);

  // 모달이 열릴 때 history state 추가
  useEffect(() => {
    if (modals.length > 0) {
      const currentModal = modals[modals.length - 1];
      if (!window.history.state?.modal) {
        window.history.pushState({ modal: currentModal.type }, '');
      }
    }
  }, [modals]);
}
