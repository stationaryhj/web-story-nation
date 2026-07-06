import { motion } from 'framer-motion';

interface SpeechBubbleProps {
  text: string;
  className?: string;
  position?: 'left' | 'center' | 'right';
}

export const SpeechBubble = ({ text, className = '', position = 'center' }: SpeechBubbleProps) => {
  const positionStyles = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0',
  };

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{
        y: [0, -8, 0],
        rotateX: 5,
        transition: {
          y: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        },
      }}
      className={`relative bg-surface-elevated rounded-lg shadow-lg p-3 text-sm ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <div
        className={`absolute -bottom-2 ${positionStyles[position]} w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-surface-elevated`}
      />
      <p className='text-primary-500 font-medium text-center'>{text}</p>
    </motion.div>
  );
};
