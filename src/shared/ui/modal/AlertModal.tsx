import { motion } from 'framer-motion';
import { useEffect } from 'react';
import useModalStore from '../../model/stores/useModalStore';
import Modal from './base/Modal';

interface AlertModalProps {
  message: string;
  icons?: React.ReactNode;
  duration?: number;
}

const MODAL_ANIMATION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 40,
  },
};

const AlertModal = ({ message, icons, duration = 3000 }: AlertModalProps) => {
  const { closeModalByType } = useModalStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      closeModalByType('alert');
    }, duration);

    return () => clearTimeout(timer);
  }, [closeModalByType, duration]);

  return (
    <Modal className='pointer-events-none z-[51]'>
      <motion.div
        {...MODAL_ANIMATION}
        className='pointer-events-auto fixed top-[90px] left-1/2 min-h-[65px] w-[calc(100vw-40px)] max-w-[400px] -translate-x-1/2 overflow-hidden '
      >
        <div className='w-full rounded-[10px] bg-black/80 py-5 text-center'>
          <div className='flex w-full items-center justify-center gap-2 px-5 text-white'>
            {icons && <span className='flex-shrink-0'>{icons}</span>}
            <p className='text-sm font-semibold break-keep'>{message}</p>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};

export default AlertModal;
