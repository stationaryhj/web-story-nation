import Image from 'next/image';
import { cn } from '../../lib/utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
}

const DEFAULT_AVATAR = '/images/placeholders/default-avatar.svg';

export const Avatar = ({ src, alt = '', className }: AvatarProps) => {
  return (
    <div className={cn('shrink-0', className)}>
      <Image
        className='h-full w-full rounded-full object-cover'
        src={src ?? DEFAULT_AVATAR}
        alt={alt}
        width={26}
        height={26}
      />
    </div>
  );
};
