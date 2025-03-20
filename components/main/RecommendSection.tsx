'use client'

import { bridgeTop10DataToModuleCharacter } from '@/lib/utils/storyNationUtil'
import { SectionTransition } from '@/components/motion/PageTransition'
import CardGrid from '@/components/elements/card/CardGrid'
import { Character } from '@/store/useStoreData'
import { ReqTop10Characters } from '@/services/hooks/DataListManager'
import { useSettingsStore } from '@/store/useStoreSettings' // 짜릿모드 상태 확인을 위한 추가

interface RecommendSectionProps {
  onSearchTrigger?: (query: string) => void
}

// ModuleCharacter 데이터를 Character 타입에 맞게 변환하는 함수
const transformToCharacter = (data: ReturnType<typeof bridgeTop10DataToModuleCharacter>): Character[] => {
  return data.map(item => ({
    ...item,
    creator: {
      ...item.creator,
      nickname: '',
      username: '',
      profileImageUrl: null,
      isActive: true,
    },
    category: 'unspecified', // 기본값 설정
  }))
}

export default function RecommendSection({ onSearchTrigger }: RecommendSectionProps) {
  // 짜릿모드 상태 가져오기
  const { isAdultModeEnabled } = useSettingsStore()

  // 컴포넌트 내부에서 직접 데이터 로드
  const { data: top10Data, isLoading, error, refetch } = ReqTop10Characters()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!top10Data) {
    return <div>No data available</div>
  }

  // 모듈 데이터 정의
  const moduleData = [
    {
      id: 1,
      title: '아이돌 스캔들의 주인공들',
      subtitle: '캐릭터와 채팅하고 오리지널 스토리도 읽어보세요!',
      data: transformToCharacter(bridgeTop10DataToModuleCharacter(top10Data?.module_1 || [])),
    },

    {
      id: 2,
      title: "남친 삼고픈 '진짜' 알파메일",
      subtitle: '깊은 대화로 그 남자의 숨겨진 매력을 발견하세요!',
      data: transformToCharacter(bridgeTop10DataToModuleCharacter(top10Data?.module_2 || [])),
    },

    {
      id: 3,
      title: '취향저녁 판타지 캐릭터!',
      subtitle: '독특한 세계관 속 로맨스와 모험이 펼쳐집니다 :)',
      data: transformToCharacter(bridgeTop10DataToModuleCharacter(top10Data?.module_3 || [])),
    },

    {
      id: 4,
      title: '평범한 고등학생은 없습니다.',
      subtitle: '일진녀부터 마법사까지... 누구랑 엮일래?',
      data: transformToCharacter(bridgeTop10DataToModuleCharacter(top10Data?.module_4 || [])),
    },

    {
      id: 5,
      title: '1분만에 손절? 레전드 소개팅!',
      subtitle: '상상도 못한 매칭, 레전드 썰 제조기 등장',
      data: transformToCharacter(bridgeTop10DataToModuleCharacter(top10Data?.module_5 || [])),
    },

    {
      id: 6,
      title: '천사의 위로 vs 악마의 복수',
      subtitle: '상처받은 날엔 랜선엄마, 빡친 날엔 저주인형',
      data: transformToCharacter(bridgeTop10DataToModuleCharacter(top10Data?.module_6 || [])),
    },

    {
      id: 7,
      title: '당신을 사로잡을 여신들',
      subtitle: '당신과 그녀, 둘 만의 은밀한 이야기를 즐겨보세요!',
      data: transformToCharacter(bridgeTop10DataToModuleCharacter(top10Data?.module_7 || [])),
    },
  ]

  // 짜릿모드가 활성화되지 않은 경우 isAdult가 true인 캐릭터 필터링
  const filteredModuleData = moduleData.map(module => ({
    ...module,
    data: isAdultModeEnabled ? module.data : module.data.filter(character => !character.isAdult),
  }))

  // 데이터가 있는 모듈만 필터링
  const filteredModules = filteredModuleData.filter(module => module.data.length > 0)

  return (
    <div>
      {filteredModules.map((module, index) => (
        <SectionTransition
          key={`module-${module.id}`}
          className="py-12 bg-white dark:bg-dark-background-light"
          delay={0.1 * (index + 1)}
        >
          <CardGrid
            title={module.title}
            subtitle={module.subtitle}
            categoryId={`module-${module.id}`}
            customData={module.data}
          />
        </SectionTransition>
      ))}
    </div>
  )
}
