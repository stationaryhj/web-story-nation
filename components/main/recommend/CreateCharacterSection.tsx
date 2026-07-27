'use client';

import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import useModalStore from '@/shared/model/stores/useModalStore';
import { useAccountStore } from '@/store/useStoreData';

// 캐릭터 생성 유도 섹션 컴포넌트
const CreateCharacterSection = memo(() => {
  const router = useRouter();
  const isLogin = useAccountStore((state) => state.isLogin);
  const openModal = useModalStore((state) => state.openModal);

  const onClickCreateCharacterBtn = () => {
    if (isLogin) {
      router.push('/my-characters/create');
    } else {
      openModal({ type: 'socialLogin' });
    }
  };

  return (
    <section className='py-10 md:py-20 bg-brand/10 mb-20'>
      <div className='container mx-auto px-4 text-center'>
        <h2 className='text-xl md:text-3xl font-bold text-text-primary mb-4'>
          내가 원하는 캐릭터를 만들어 보세요!
        </h2>
        <p className='text-sm md:text-lg text-text-muted max-w-2xl mx-auto mb-8'>
          당신만의 독특한 캐릭터를 만들고 다른 사용자들과 공유해보세요. 러브챗은 당신의
          창의력을 펼칠 수 있는 완벽한 공간입니다.
        </p>
        <button
          onClick={onClickCreateCharacterBtn}
          className='inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-brand hover:bg-brand-hover text-text-inverse rounded-lg transition-colors font-medium'
        >
          캐릭터 만들기
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </section>
  );
});

CreateCharacterSection.displayName = 'CreateCharacterSection';

export default CreateCharacterSection;
