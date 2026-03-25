'use client'

import { faAngleRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm, type FieldPath } from 'react-hook-form'
import { cn } from '@/shared/lib/utils/cn'
import { useDmSave } from '@/src/features/edit-character/lib/useDmSave'
import type { BridgedCharacterData } from '@/src/features/edit-character/lib/characterFormBridge'
import { defaultDmFormValues, type DmFormValues } from '@/src/features/edit-character/model/dmFormTypes'
import { Tab } from '@/src/shared/ui/tab'
import { CharacterSettingForm, IntroForm, MediaForm, ProfileForm, RegisterForm } from './forms'
import useModalStore from '@/src/shared/model/stores/useModalStore'

const buttonBase =
  'rounded-lg px-4 py-2.5 py-1.5 px-[10px] text-sm max-md:text-xs transition-colors duration-200 text-center'

const buttonVariants = {
  primary: 'bg-primary-500 font-medium text-white hover:bg-primary-600',
  secondary: 'bg-secondary-100 font-semibold text-black hover:bg-secondary-200 dark:text-gray-300',
}

interface TabConfig {
  label: string
  value: string
  required?: boolean
  fields: readonly FieldPath<DmFormValues>[]
  content: ReactNode
}

const TAB_LIST: readonly TabConfig[] = [
  {
    label: '프로필',
    value: 'profile',
    required: true,
    fields: ['imgUrl', 'name', 'gender', 'bio'] as const,
    content: <ProfileForm />,
  },
  { label: '미디어', value: 'media', required: false, fields: ['multi_images'] as const, content: <MediaForm /> },
  {
    label: '인트로',
    value: 'advanced',
    required: true,
    fields: ['introBubbles'] as const,
    content: <IntroForm />,
  },
  {
    label: '캐릭터 설정',
    value: 'character',
    required: false,
    fields: [] as const,
    content: <CharacterSettingForm />,
  },
  {
    label: '등록',
    value: 'register',
    required: true,
    fields: [] as const,
    content: <RegisterForm />,
  },
]

interface EditDmProps {
  data: BridgedCharacterData
}

export default function EditDm({ data }: EditDmProps) {
  const router = useRouter()
  const { openModal } = useModalStore()
  const methods = useForm<DmFormValues>({
    defaultValues: defaultDmFormValues,
  })

  useEffect(() => {
    methods.reset(data)
  }, [data])

  const [currentTab, setCurrentTab] = useState('profile')
  const { handleSave, handleSubmit } = useDmSave(methods)

  const { errors } = methods.formState

  const handleHasTabError = (fields: readonly FieldPath<DmFormValues>[]) => fields.some(field => field in errors)

  const currentTabIndex = TAB_LIST.findIndex(t => t.value === currentTab)
  const isLastTab = currentTabIndex === TAB_LIST.length - 1
  const isFirstTab = currentTabIndex === 0

  const handleNext = async () => {
    if (isLastTab) return

    setCurrentTab(TAB_LIST[currentTabIndex + 1].value)
    handleSave().catch(e => console.error('임시저장 실패:', e))
  }

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setCurrentTab(TAB_LIST[currentTabIndex - 1].value)
    }
  }

  const handleTabChange = (nextTab: string) => {
    const nextTabIndex = TAB_LIST.findIndex(tab => tab.value === nextTab)
    if (nextTabIndex === -1 || nextTabIndex === currentTabIndex) return
    setCurrentTab(nextTab)
  }

  const HEADER_BUTTONS = [
    {
      label: '임시저장',
      variant: 'secondary' as const,
      onClick: () =>
        handleSave()
          .then(() => openModal({ type: 'alert', props: { message: '임시저장을 완료했어요.' } }))
          .catch(e => console.error('임시저장 실패:', e)),
    },
    {
      label: '등록하기',
      variant: 'primary' as const,
      onClick: handleSubmit,
    },
  ]

  return (
    <FormProvider {...methods}>
      <div className="flex h-screen flex-col overflow-hidden bg-white dark:bg-dark-background">
        {/* 헤더 */}
        <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between bg-white px-4 py-3 dark:bg-dark-background">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faArrowLeft}
              size="lg"
              className="cursor-pointer max-md:h-4 max-md:w-4"
              onClick={() => router.push('/my-characters')}
            />

            <h1 className="text-xl font-bold leading-[1.4] text-gray-900 dark:text-white max-md:text-base">
              캐릭터 만들기
            </h1>
          </div>
          <div className="flex items-center gap-3 max-md:gap-2">
            {HEADER_BUTTONS.map(button => (
              <button
                key={button.label}
                type="button"
                className={cn(buttonBase, buttonVariants[button.variant])}
                onClick={button.onClick}
              >
                {button.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col max-md:pb-12">
          <Tab value={currentTab} onTabChange={handleTabChange} className="flex min-h-0 flex-1 flex-col">
            <div className="sticky top-0 z-10 border-b bg-white">
              <Tab.List
                className="mx-auto flex h-[52px] w-full max-w-[1280px] overflow-x-auto px-4 max-md:h-11"
                showIndicator={true}
                indicatorClassName="bg-black"
              >
                {TAB_LIST.map(tab => {
                  const tabHasError = handleHasTabError(tab.fields)
                  return (
                    <Tab.Item
                      key={tab.value}
                      value={tab.value}
                      className="shrink-0 px-3 duration-200 hover:bg-[#F4F5F5]"
                    >
                      {({ isActive }) => (
                        <span className="relative inline-block pt-2 leading-[1.4]">
                          <span
                            className="invisible flex items-start gap-x-0.5 whitespace-nowrap font-semibold"
                            aria-hidden="true"
                          >
                            {tab.label}
                            {tab.required && <span className="text-sm leading-none">*</span>}
                          </span>
                          <span
                            className={cn(
                              'absolute inset-0 flex items-center justify-center whitespace-nowrap font-semibold',
                              tabHasError ? 'text-v2-red' : isActive ? 'text-black' : 'text-v2-gray-700'
                            )}
                          >
                            <span className="flex items-start gap-x-0.5 pt-0.5 max-md:text-sm">
                              {tab.label}
                              {tab.required && (
                                <span
                                  className={cn(
                                    'pt-0.5 text-sm leading-none',
                                    tabHasError ? 'text-v2-red' : 'text-primary-500'
                                  )}
                                >
                                  *
                                </span>
                              )}
                            </span>
                          </span>
                        </span>
                      )}
                    </Tab.Item>
                  )
                })}
              </Tab.List>
            </div>

            <div className="relative z-0 mx-auto min-h-0 w-full max-w-[832px] flex-1 overflow-y-auto">
              {TAB_LIST.map(tab => (
                <Tab.Panel key={tab.value} value={tab.value}>
                  {tab.content}
                </Tab.Panel>
              ))}
            </div>
          </Tab>
          {/* 푸터 */}
          <div
            className={cn(
              'mx-auto flex w-full max-w-[1280px] shrink-0 items-center justify-end px-4 py-4',
              isFirstTab ? 'justify-end' : 'justify-between'
            )}
          >
            {!isFirstTab && (
              <button
                type="button"
                onClick={handlePrevious}
                className={cn(
                  'flex w-[108px] items-center justify-center gap-1 rounded-[10px]  bg-[#F4F5F5] py-[11px] transition-colors duration-100 hover:bg-secondary-200 active:bg-secondary-200'
                )}
              >
                <span className="font-semibold leading-[1.4] text-black">이전</span>
              </button>
            )}

            <button
              type="button"
              onClick={isLastTab ? handleSubmit : handleNext}
              className={cn(
                'flex w-[108px] items-center justify-center gap-1 rounded-[10px] bg-primary-500 py-[11px] pl-8 pr-[22px] transition-colors duration-100 hover:bg-primary-600 active:bg-primary-600 max-md:text-sm',
                isLastTab && 'px-0'
              )}
            >
              <span className="font-semibold text-white">{isLastTab ? '등록' : '다음'}</span>
              {!isLastTab && (
                <div className="flex h-5 w-5 items-center justify-center ">
                  <FontAwesomeIcon icon={faAngleRight} className="text-white" size="sm" />
                </div>
              )}
            </button>
          </div>
        </main>
      </div>
    </FormProvider>
  )
}
