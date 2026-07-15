'use client';

/**
 * `LimitCharacterModal`(components/modal/LimitCharacterModal.tsx, isOpen/onClose 로컬 패턴)을
 * 전역 모달 레지스트리(GlobalModalHost)에 등록하기 위한 얇은 어댑터.
 *
 * 근거 계획: docs/plan/plan-20260710-home-sidebar-integration.md (7단계, 옵션 A, 담당: writer)
 *
 * GlobalModalHost는 store의 `modals` 배열에 존재하는 항목만 렌더하므로, 이 컴포넌트가
 * 렌더된다는 것 자체가 "열려 있음"을 의미한다 → `isOpen`은 항상 true로 고정하고,
 * `onClose`만 store의 `closeModal`로 연결한다.
 */

import LimitCharacterModal from '@/components/modal/LimitCharacterModal';
import useModalStore from '@/shared/model/stores/useModalStore';

export default function GlobalLimitCharacterModal() {
  const closeModal = useModalStore((s) => s.closeModal);

  return <LimitCharacterModal isOpen onClose={closeModal} />;
}
