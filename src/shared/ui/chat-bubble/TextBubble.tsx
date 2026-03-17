import { cn } from '@/src/shared/lib/utils/cn';

interface TextBubbleProps {
  text: string;
  isUser: boolean;
  maxWidth?: string;
  className?: string;
}

export const TextBubble = ({ text, isUser, maxWidth = '252px', className }: TextBubbleProps) => {
  return (
    <div className={cn('flex flex-col', isUser && 'items-end')}>
      <p
        className={cn(
          'whitespace-pre-wrap py-2 px-[11px] rounded-xl text-[15px] w-fit text-left leading-[1.4] [overflow-wrap:anywhere]',
          isUser ? 'bg-v2-purple text-white' : 'bg-v2-gray-200 text-black',
          className
        )}
        style={{ maxWidth }}
      >
        {text || '\u00A0'}
      </p>
    </div>
  );
};
