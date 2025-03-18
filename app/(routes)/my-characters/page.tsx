'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useStoreData, Character } from '@/store/useStoreData'
import Card from '@/components/ui/features/card/Card'
import DeleteConfirmModal from '@/components/modal/DeleteConfirmModal'
import { SectionTransition } from '@/components/ui/motion/PageTransition'

export default function MyCharacterPage() {
  const router = useRouter()
  const { characters } = useStoreData()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null)

  // 캐릭터 카드 클릭 처리
  const handleCardClick = (character: Character) => {
    router.push(`/chat/${character.id}`)
  }

  // 수정 버튼 클릭 처리
  const handleEditClick = (character: Character) => {
    router.push(`/my-characters/edit/${character.id}`)
  }

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = (character: Character) => {
    setCharacterToDelete(character)
    setIsDeleteModalOpen(true)
  }

  // 캐릭터 삭제 확인
  const confirmDelete = () => {
    if (characterToDelete) {
      // 실제로는 API 호출 등으로 삭제 처리
      console.log('캐릭터 삭제:', characterToDelete.id)
      // 삭제 후 모달 닫기
      setIsDeleteModalOpen(false)
      setCharacterToDelete(null)
    }
  }

  return (
    <SectionTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-dark-secondary-700">내 캐릭터</h1>
          <Link
            href="/my-characters/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>캐릭터 생성</span>
          </Link>
        </div>

        {characters.length === 0 ? (
          <div className="bg-white dark:bg-dark-background-light rounded-xl p-8 text-center">
            <p className="text-secondary-500 dark:text-dark-secondary-500 mb-4">아직 생성한 캐릭터가 없습니다.</p>
            <Link
              href="/my-characters/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>첫 캐릭터 만들기</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {characters.map((character, index) => (
              <Card
                key={character.id}
                character={character}
                index={index}
                variant="my-character"
                onCardClick={() => handleCardClick(character)}
                onEdit={() => handleEditClick(character)}
                onDelete={() => handleDeleteClick(character)}
              />
            ))}
          </div>
        )}

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="캐릭터 삭제"
          entityName={characterToDelete?.name}
          onConfirm={confirmDelete}
        />
      </div>
    </SectionTransition>
  )
}
