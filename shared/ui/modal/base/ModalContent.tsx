'use client';

import { type HTMLMotionProps, motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils/cn';

interface ModalContentProps extends HTMLMotionProps<'div'> {
  className?: string;
  children: React.ReactNode;
}

const ModalContent: React.FC<ModalContentProps> = ({ className, children, ...props }) => {
  // flexbox 중앙 정렬 사용 - transform 충돌 방지
  // relative: 내부 absolute 요소(Modal.Close 등)의 기준점
  const modalContentCls = `absolute z-[2] bg-white pointer-events-auto touch-auto rounded-[20px] py-[26px] px-[clamp(15px,2vw,32px)] shadow-md`;

  return (
    <motion.div className={cn(modalContentCls, className)} {...props}>
      {children}
    </motion.div>
  );
};

export default ModalContent;
