'use client';

import { faAngleRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { cn } from '@/shared/lib/utils/cn';
import { useSaveInProgress } from '@/src/features/edit-character/api/characterFormApi';
import type { BridgedCharacterData } from '@/src/features/edit-character/lib/characterFormBridge';
import type { CharacterFormData } from '@/src/features/edit-character/model/characterFormStore';
import { useCharacterFormStore } from '@/src/features/edit-character/model/characterFormStore';
import { Tab } from '@/src/shared/ui/tab';
import { CharacterSettingForm, IntroForm, MediaForm, ProfileForm, RegisterForm } from './forms';

const buttonBase = 'rounded-lg px-4 py-2.5 text-sm transition-colors duration-200 text-center';

const buttonVariants = {
  primary: 'bg-primary-500 font-medium text-white hover:bg-primary-600',
  secondary: 'bg-secondary-100 font-semibold text-black hover:bg-secondary-200 dark:text-gray-300',
};

const TAB_LIST = [
  {
    label: '프로필',
    value: 'profile',
    required: true,
    fields: ['imgUrl', 'name', 'gender', 'bio'] as const,
    content: <ProfileForm />,
  },
  { label: '미디어', value: 'media', fields: [] as const, content: <MediaForm /> },
  {
    label: '인트로',
    value: 'advanced',
    required: true,
    fields: ['subject', 'firstMessage'] as const,
    content: <IntroForm />,
  },
  {
    label: '캐릭터 설정',
    value: 'character',
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
];

interface EditDmProps {
  data: BridgedCharacterData;
}

export default function EditDm({ data }: EditDmProps) {
  const router = useRouter();
  const setFormField = useCharacterFormStore((s) => s.setFormField);

  const methods = useForm<CharacterFormData>({
    defaultValues: {
      imgUrl: '',
      name: '',
      gender: 'unspecified',
      bio: '',
    },
  });

  useEffect(() => {
    Object.entries(data).forEach(([key, value]) => {
      setFormField(key as keyof CharacterFormData, value);
    });

    methods.reset(data);
  }, [data]);

  const [currentTab, setCurrentTab] = useState('profile');
  const { mutateAsync: saveInProgress, isPending: isSaving } = useSaveInProgress();

  const { errors } = methods.formState;

  const hasTabError = (fields: readonly string[]) => fields.some((field) => field in errors);

  const currentTabIndex = TAB_LIST.findIndex((t) => t.value === currentTab);
  const isLastTab = currentTabIndex === TAB_LIST.length - 1;
  const isFirstTab = currentTabIndex === 0;

  const handleSave = async (finishYn = 0) => {
    const formData = methods.getValues();
    console.log('formData', formData);
    await saveInProgress({ formData, finishYn });
  };

  const handleNext = async () => {
    if (isLastTab) return;
    setCurrentTab(TAB_LIST[currentTabIndex + 1].value);
    handleSave().catch((e) => console.error('임시저장 실패:', e));
  };

  const handlePrevious = () => {
    if (currentTabIndex > 0) {
      setCurrentTab(TAB_LIST[currentTabIndex - 1].value);
    }
  };

  const onSubmit = methods.handleSubmit(async () => {
    try {
      await handleSave(1);
      console.log('등록 완료');
    } catch (e) {
      console.error('등록 실패:', e);
    }
  });

  const HEADER_BUTTONS = [
    {
      label: '임시저장',
      variant: 'secondary' as const,
      onClick: () => console.log('임시저장', methods.getValues()),
    },
    {
      label: '등록하기',
      variant: 'primary' as const,
      onClick: onSubmit,
    },
  ];

  return (
    <FormProvider {...methods}>
      <div className='h-screen flex flex-col bg-white dark:bg-dark-background overflow-hidden'>
        {/* 헤더 */}
        <header className='max-w-[1280px] w-full mx-auto flex items-center justify-between bg-white px-4 py-3 dark:bg-dark-background'>
          <div className='flex items-center gap-5'>
            <button type='button' onClick={() => router.back()}>
              <FontAwesomeIcon icon={faArrowLeft} size='lg' />
            </button>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white'>캐릭터 만들기</h1>
          </div>
          <div className='flex items-center gap-3'>
            {HEADER_BUTTONS.map((button) => (
              <button
                key={button.label}
                type='button'
                className={cn(buttonBase, buttonVariants[button.variant])}
                onClick={button.onClick}
              >
                {button.label}
              </button>
            ))}
          </div>
        </header>

        <main className='flex flex-col flex-1 min-h-0 max-md:pb-16 overflow-y-auto'>
          <Tab value={currentTab} onTabChange={setCurrentTab} className='flex-1'>
            <div className='sticky top-0 z-10 bg-white border-b'>
              <Tab.List
                className='flex h-[52px] max-w-[1280px] w-full mx-auto px-4 overflow-x-auto'
                showIndicator={true}
                indicatorClassName='bg-black'
              >
                {TAB_LIST.map((tab) => {
                  const tabHasError = hasTabError(tab.fields);
                  return (
                    <Tab.Item
                      key={tab.value}
                      value={tab.value}
                      className='px-4 shrink-0 duration-200 hover:bg-[#F4F5F5]'
                    >
                      {({ isActive }) => (
                        <span className='relative inline-block leading-[1.4] pt-2'>
                          <span
                            className='invisible font-semibold whitespace-nowrap flex items-start gap-x-0.5'
                            aria-hidden='true'
                          >
                            {tab.label}
                            {tab.required && <span className='text-sm leading-none'>*</span>}
                          </span>
                          <span
                            className={cn(
                              'absolute inset-0 flex items-center justify-center font-semibold whitespace-nowrap',
                              tabHasError
                                ? 'text-red-500'
                                : isActive
                                  ? 'text-black'
                                  : 'text-[#6B7280]'
                            )}
                          >
                            <span className='flex items-start gap-x-0.5 pt-0.5'>
                              {tab.label}
                              {tab.required && (
                                <span
                                  className={cn(
                                    'text-sm leading-none pt-0.5',
                                    tabHasError ? 'text-red-500' : 'text-primary-500'
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
                  );
                })}
              </Tab.List>
            </div>
            <div className='relative z-0 max-w-[1280px] w-full mx-auto px-4 py-[25px] flex-1'>
              {TAB_LIST.map((tab) => (
                <Tab.Panel key={tab.value} value={tab.value} className='flex-1'>
                  {tab.content}
                </Tab.Panel>
              ))}
            </div>
          </Tab>
          {/* 푸터 */}
          <div
            className={cn(
              'py-4 px-4 max-w-[1280px] w-full mx-auto flex items-center justify-end ',
              isFirstTab ? 'justify-end' : 'justify-between'
            )}
          >
            {!isFirstTab && (
              <button
                type='button'
                onClick={handlePrevious}
                className={cn(
                  'bg-[#F4F5F5] hover:bg-secondary-200 w-[108px] py-[11px] rounded-[10px] transition-colors  duration-100 flex items-center justify-center gap-1'
                )}
              >
                <span className='text-black font-semibold leading-[1.4]'>이전</span>
              </button>
            )}

            <button
              type='button'
              disabled={isSaving}
              onClick={isLastTab ? onSubmit : handleNext}
              className={cn(
                'pl-8 w-[108px] pr-[22px] py-[11px] rounded-[10px] transition-colors duration-100 flex items-center justify-center gap-1 disabled:opacity-50',
                isLastTab
                  ? 'bg-black hover:bg-black/90 px-0'
                  : 'bg-primary-500 hover:bg-primary-600'
              )}
            >
              <span className='text-white font-semibold leading-[1.4]'>
                {isLastTab ? '등록' : '다음'}
              </span>
              {!isLastTab && (
                <div className='w-5 h-5 flex items-center justify-center'>
                  <FontAwesomeIcon icon={faAngleRight} className='text-white' size='sm' />
                </div>
              )}
            </button>
          </div>
        </main>
      </div>
    </FormProvider>
  );
}
