'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export interface ChatItemProps {
  id: string;
  characterId: string;
  name: string;
  lastMessage: string;
  time: string;
  imageUrl: string;
  isSelected?: boolean;
}

export default function ChatItem({ id, characterId, name, lastMessage, time, imageUrl, isSelected }: ChatItemProps) {
  const router = useRouter();

  return (
    <motion.div
      key={id}
      className={`flex items-center p-3 rounded-lg cursor-pointer ${
        isSelected
          ? 'bg-brand/10'
          : 'hover:bg-surface-elevated-hover'
      }`}
      whileHover={{ scale: 1.02 }}
      onClick={() => router.push(`/chat/${id}`)}
    >
      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
        <Image 
          src={imageUrl} 
          alt={`${name}의 프로필 이미지`} 
          fill 
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-text-primary truncate">
            {name}
          </h3>
          <span className="text-xs text-text-muted whitespace-nowrap ml-2">
            {time}
          </span>
        </div>
        <p className="text-sm text-text-muted truncate">
          {lastMessage}
        </p>
      </div>
    </motion.div>
  );
} 