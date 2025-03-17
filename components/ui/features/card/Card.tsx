// components/ui/card/Card.tsx
'use client'

import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faFire } from '@fortawesome/free-solid-svg-icons'
import { Character } from '@/store/useStoreData'
import { CardTransition } from '@/components/ui/motion/PageTransition'
import { useModalStore } from '@/store/useStoreModal'

interface CardProps {
  character: Character;
  index?: number;
}

export default function Card({ character, index = 0 }: CardProps) {
  const { id, name, description, imageUrl, commentCount, hashtags, isAdult, creator } = character
  const { openModal, setSelectedCharacter } = useModalStore()
  
  // 카드 클릭 시 캐릭터 모달 열기
  const handleCardClick = () => {
    setSelectedCharacter(character)
    openModal('character')
  }
  
  return (
    <CardTransition index={index}>
      <div 
        className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-dark-background-light dark:border dark:border-dark-secondary-200/10 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="block">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="absolute top-3 left-3 bg-primary-500/90 dark:bg-dark-primary-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              스토리네이션
            </div>
            
            {isAdult && (
              <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                19+
              </div>
            )}
            
            {commentCount > 100 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center backdrop-blur-sm">
                <FontAwesomeIcon icon={faFire} className="mr-1 text-red-400" />
                인기
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-bold text-secondary-900 dark:text-dark-secondary-700 mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-dark-primary-600 transition-colors">{name}</h3>
            
            <div className="mb-2 flex flex-wrap gap-1">
              {hashtags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
            
            <p className="text-xs text-secondary-600 dark:text-dark-secondary-500 mb-3 line-clamp-2 h-8 group-hover:text-secondary-800 dark:group-hover:text-dark-secondary-400 transition-colors">
              {description}
            </p>
            
            <div className="flex items-center justify-between pt-2 border-t border-secondary-100 dark:border-dark-secondary-200/10">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-secondary-200 dark:bg-dark-secondary-300 flex items-center justify-center overflow-hidden">
                  {creator.profileImageUrl ? (
                    <Image 
                      src={creator.profileImageUrl} 
                      alt={creator.nickname}
                      width={20}
                      height={20}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-[8px] text-secondary-500 dark:text-dark-secondary-400">
                      {creator.nickname.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="ml-1 text-xs text-secondary-500 dark:text-dark-secondary-500 truncate max-w-[80px]">
                  {creator.nickname}
                </span>
              </div>
              
              <div className="flex items-center text-secondary-500 dark:text-dark-secondary-500">
                <FontAwesomeIcon icon={faComment} className="text-xs" />
                <span className="ml-1 text-xs">{commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardTransition>
  )
}