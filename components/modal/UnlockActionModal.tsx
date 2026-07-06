'use client';

import { faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getImageUri } from '@/lib/utils/storyNationUtil';

interface UnlockActionModalProps {
  isOpen: boolean;
  imgUrl: string;
  onClose: () => void;
  onAnimationEnd?: () => void;
}

type AnimationStage = 'shaking' | 'breaking' | 'revealing' | 'showing';

export default function UnlockActionModal({
  isOpen,
  imgUrl,
  onClose,
  onAnimationEnd,
}: UnlockActionModalProps) {
  const [animationStage, setAnimationStage] = useState<AnimationStage>('shaking');

  useEffect(() => {
    if (!isOpen) return;

    // 애니메이션 시퀀스 시작
    setAnimationStage('shaking');

    const timer1 = setTimeout(() => {
      setAnimationStage('breaking');
    }, 800); // 0.8초 후 깨지기 시작

    const timer2 = setTimeout(() => {
      setAnimationStage('revealing');
    }, 1200); // 1.2초 후 이미지 등장

    const timer3 = setTimeout(() => {
      setAnimationStage('showing');
    }, 2000); // 2초 후 이미지 보여주기

    const timer4 = setTimeout(() => {
      onAnimationEnd?.();
      onClose();
    }, 3000); // 3초 후 자동 닫기

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (!imgUrl) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-overlay/80 z-[110]'>
      <div className='relative w-full h-full flex items-center justify-center'>
        {/* 자물쇠 단계 */}
        {(animationStage === 'shaking' || animationStage === 'breaking') && (
          <div
            className={`
            ${animationStage === 'shaking' ? 'animate-unlock-shake' : 'animate-unlock-break'}
          `}
          >
            <FontAwesomeIcon
              icon={faLock}
              className='h-16 w-16 md:h-20 md:w-20 text-yellow-400 drop-shadow-2xl'
            />
          </div>
        )}

        {/* 이미지 등장 단계 */}
        {(animationStage === 'revealing' || animationStage === 'showing') && (
          <div className='relative'>
            {/* 배경 빛 효과 */}
            <div
              className={`
              absolute inset-0 bg-gradient-radial from-yellow-400/30 via-orange-400/20 to-transparent 
              rounded-full blur-xl scale-150
              ${animationStage === 'revealing' ? 'animate-glow-pulse' : 'opacity-60'}
            `}
            />

            {/* 메인 이미지 */}
            <div
              className={`
              relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden
              ${animationStage === 'revealing' ? 'animate-unlock-zoom-in' : 'animate-unlock-final-show'}
            `}
            >
              <Image
                src={getImageUri(imgUrl)}
                alt='해금된 이미지'
                fill
                className='object-cover'
                priority
              />

              {/* 이미지 테두리 효과 */}
              <div className='absolute inset-0 rounded-2xl border-4 border-yellow-400/60 shadow-2xl' />

              {/* 반짝이는 효과 */}
              <div
                className={`
                absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent
                ${animationStage === 'revealing' ? 'animate-shine' : ''}
              `}
              />
            </div>
          </div>
        )}

        {/* 성공 메시지 - 전체 너비로 완벽한 중앙 정렬 */}
        {animationStage === 'showing' && (
          <div className='absolute bottom-20 left-0 right-0 animate-fade-in-up'>
            <div className='text-text-inverse text-xl md:text-2xl font-bold text-center drop-shadow-lg'>
              ✨ 해금 완료! ✨
            </div>
          </div>
        )}

        {/* 파티클 효과 (이미지 등장 시) */}
        {animationStage === 'revealing' && (
          <div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`
                  absolute w-2 h-2 bg-yellow-400 rounded-full
                  animate-particle-${i % 4}
                `}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
