'use client'

import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons'
import { Character } from '@/store/useStoreData'
import { CardTransition } from '@/components/ui/motion/PageTransition'

interface MyCharacterCardProps {
  character: Character
  index?: number
  onCardClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function MyCharacterCard({ character, index = 0, onCardClick, onEdit, onDelete }: MyCharacterCardProps) {
  const { name, description, imageUrl, commentCount, hashtags, isAdult } = character

  // 수정 버튼 클릭 처리
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    onEdit()
  }

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    onDelete()
  }

  return (
    <CardTransition index={index}>
      <div
        className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-dark-background-light dark:border dark:border-dark-secondary-200/10 cursor-pointer"
        onClick={onCardClick}
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

            {isAdult && (
              <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                19+
              </div>
            )}

            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center backdrop-blur-sm">
              <FontAwesomeIcon icon={faComment} className="mr-1" />
              {commentCount}
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-secondary-900 dark:text-dark-secondary-700 mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-dark-primary-600 transition-colors">
              {name}
            </h3>

            <div className="mb-2 flex flex-wrap gap-1">
              {hashtags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xs text-secondary-600 dark:text-dark-secondary-500 mb-3 line-clamp-2 h-8 group-hover:text-secondary-800 dark:group-hover:text-dark-secondary-400 transition-colors">
              {description}
            </p>

            {/* 수정/삭제 버튼 */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={handleEditClick}
                className="py-1.5 px-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 text-xs rounded flex items-center justify-center transition-colors dark:bg-dark-secondary-100/10 dark:hover:bg-dark-secondary-100/20 dark:text-dark-secondary-500"
              >
                <FontAwesomeIcon icon={faPencilAlt} className="mr-1" />
                수정
              </button>
              <button
                onClick={handleDeleteClick}
                className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded flex items-center justify-center transition-colors dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-1" />
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </CardTransition>
  )
}
