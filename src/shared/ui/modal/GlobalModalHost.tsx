'use client';

import { AnimatePresence } from 'framer-motion';
import { useCallback } from 'react';
import ReactDOM from 'react-dom';

import { useEscapeClose, useModalHistoryManager } from '@/shared/lib/hooks';
import useModalStore from '@/shared/model/stores/useModalStore';
import type { ModalComponent } from '@/shared/model/types/modal';
import { ModalTypeContext, ModalZIndexContext } from '@/shared/ui/modal/base/modalContexts';
import ChatModeSelectModal from './ChatModeSelectModal';
import ConfirmModal from './ConfirmModal';
import RedirectBannerModal from './RedirectBannerModal';
import SignupModal from './SignupModal';
import SocialLoginModal from './SocialLoginModal';

// 모달 설정 타입
type ModalConfig = {
  component: ModalComponent<any> | null;
  usePortal?: boolean;
  escapeClose?: boolean;
};

const MODAL_COMPONENTS: Record<string, ModalConfig> = {
  // 여기에 모달 컴포넌트 등록
  // 예시:
  // loading: { component: LoadingModal },
  socialLogin: { component: SocialLoginModal },
  signup: { component: SignupModal },
  confirm: { component: ConfirmModal },
  redirectBanner: { component: RedirectBannerModal },
  chatModeSelect: { component: ChatModeSelectModal },
};

export default function GlobalModalHost() {
  // 모달 히스토리 관리
  useModalHistoryManager();

  const modals = useModalStore((s) => s.modals);
  const closeModal = useModalStore((s) => s.closeModal);

  // 현재 가장 위에 있는 모달이 escapeClose를 허용하는지 확인
  const topModal = modals[modals.length - 1];
  const topModalConfig = topModal ? MODAL_COMPONENTS[topModal.type] : null;
  const canEscapeClose = topModalConfig?.escapeClose === true;

  const handleEscapeClose = useCallback(() => {
    if (window.history.state?.modal) {
      window.history.back();
    } else {
      closeModal();
    }
  }, [closeModal]);

  // ESC 키로 모달 닫기
  useEscapeClose({ enabled: canEscapeClose, onEscape: handleEscapeClose });

  // Portal 사용하는 모달과 사용하지 않는 모달 분리
  const portalModals = modals.filter((modal) => MODAL_COMPONENTS[modal.type]?.usePortal !== false);

  // 등록되지 않은 모달은 렌더링하지 않음
  // 기본 z-index를 충분히 높여 페이지 콘텐츠와 충돌을 방지
  const BASE_Z_INDEX = 20000;

  const renderModal = (modal: (typeof modals)[0], index: number) => {
    const config = MODAL_COMPONENTS[modal.type];
    if (!config) return null;
    const Component = config.component;
    if (!Component) return null;
    const zIndex = BASE_Z_INDEX + index * 10;
    return (
      <div key={modal.id || modal.type}>
        <ModalZIndexContext.Provider value={zIndex}>
          <ModalTypeContext.Provider value={modal.type}>
            <Component {...modal.props} />
          </ModalTypeContext.Provider>
        </ModalZIndexContext.Provider>
      </div>
    );
  };

  // SSR에서는 portal 렌더링하지 않음
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <>
      {/* Portal로 document.body에 렌더링 */}
      {ReactDOM.createPortal(
        <AnimatePresence mode='popLayout'>{portalModals.map(renderModal)}</AnimatePresence>,
        document.body
      )}
    </>
  );
}
