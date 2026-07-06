'use client';

import { faCheck, faExpand, faLock, faThumbtack, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useState } from 'react';
import BigImageModal from '@/components/modal/BigImageModal';
import { getImageUri } from '@/lib/utils/storyNationUtil';
import { useMultiImageStore } from '@/store/useMultiImageStore';
import { useModalStore } from '@/store/useStoreModal';
import BaseModal from './BaseModal';
import ConfirmActionModal from './ConfirmActionModal';
import UnlockActionModal from './UnlockActionModal';

const unLockDesc = '50펜을 사용해 이미지를 잠금 해제 할까요?';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryModal({ isOpen, onClose }: GalleryModalProps) {
  const { selectedCharacter, modalProps } = useModalStore();
  const {
    selectedMultiImageData,
    multiImages,
    openImageCount,
    unlockMultiImage,
    fetchMultiImageData,
    chatImageSave,
  } = useMultiImageStore();

  const [imgUnlockAction, setImgUnlockAction] = useState<boolean>(false);
  const [rewardImgUrl, setRewardImgUrl] = useState<string>('');

  const [confirmActionOpen, setConfirmActionOpen] = useState<boolean>(false);
  const [selectedMultiImageKey, setSelectedMultiImageKey] = useState<number>(0);

  const [isPinned, setIsPinned] = useState<boolean>(false);

  // bigger
  const [isBigImageModalOpen, setIsBigImageModalOpen] = useState<boolean>(false);
  const [bigImageUrl, setBigImageUrl] = useState<string>('');

  const isMobile = window.innerWidth < 768;
  const variant = modalProps?.variant || 'default';

  if (!selectedCharacter) return null;
  if (!multiImages) return null;

  const bgImageKey = selectedMultiImageData.img_selected_key;

  const handleClose = () => {
    onClose();
    setTimeout(() => {}, 300);
  };

  const handleOpenImage = async (chrbot_multi_image_key: number) => {
    setSelectedMultiImageKey(chrbot_multi_image_key);
    setConfirmActionOpen(true);
  };

  const handleUnlockMultiImage = async () => {
    setConfirmActionOpen(false);

    const result = await unlockMultiImage(selectedMultiImageKey);
    if (result !== null && result !== 0) {
      alert(result);
    } else {
      // 보상 이미지 설정
      const rewardImgUrl =
        multiImages.find((item) => item.chrbot_multi_image_key === selectedMultiImageKey)
          ?.img_url || '';
      setRewardImgUrl(rewardImgUrl);

      // 연출
      setImgUnlockAction(true);
    }
  };

  const handleSelectedBgImage = async (chrbot_multi_image_key: number) => {
    await handleSelectedHoldingBgImage(chrbot_multi_image_key, 0);
  };

  const handleSelectedHoldingBgImage = async (
    chrbot_multi_image_key: number,
    img_fixed?: number | 0
  ) => {
    await chatImageSave(chrbot_multi_image_key, img_fixed);
  };

  // 이미지 확대
  const handleOnImageBigger = (imageUrl: string) => {
    setBigImageUrl(imageUrl);
    setIsBigImageModalOpen(true);
  };

  // 레벨별로 그룹핑
  const groupedByLevel = multiImages.reduce(
    (acc, item) => {
      const level = item.lv;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push({
        ...item,
        img_url: getImageUri(item.img_url),
      });
      return acc;
    },
    {} as Record<number, typeof multiImages>
  );

  // 레벨 순서대로 정렬
  const sortedLevels = Object.keys(groupedByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size='full'
      className='mx-auto w-full'
      showCloseButton={false}
      hideHeader={true}
      bodyClassName='p-0 max-h-[90vh] overflow-hidden'
      zIndex={100}
    >
      {/* header - 스크롤 시에도 상단 고정 */}
      <div className='sticky top-0 z-[103] bg-surface-elevated flex items-center justify-between py-4 px-4 border-b border-border-default'>
        <div className='flex items-center justify-center w-full'>
          <h1 className='text-md md:text-xl font-bold text-text-primary'>갤러리</h1>
        </div>
        <div className='flex items-center justify-end gap-2'>
          <div>
            <button
              onClick={handleClose}
              className='w-7 h-7 md:w-9 md:h-9 rounded-full bg-surface-elevated text-text-muted hover:bg-surface-elevated-hover transition-colors flex items-center justify-center'
            >
              <FontAwesomeIcon icon={faTimes} className='h-4 w-4 md:h-6 md:w-6' />
            </button>
          </div>
        </div>
      </div>

      <div className='h-full overflow-y-auto z-[102] bg-surface-elevated'>
        {/* body */}
        <div className='flex items-center justify-between w-full'>
          <div className='p-2'>
            <span>캐릭터의 답장에 따라 해금됩니다!</span>
          </div>

          <div>
            <span className='text-sm'>
              {openImageCount}/{multiImages?.length || 0}
            </span>
          </div>
        </div>

        {/* image grid - 레벨별로 구분 */}
        <div className='p-2 space-y-8'>
          {sortedLevels.map((level) => (
            <div key={level} className='space-y-2'>
              {/* 레벨 헤더 */}
              {level > 0 && (
                <div className='flex items-center gap-2'>
                  <h3 className='text-sm font-semibold text-text-muted'>lv.{level}</h3>
                  <div className='flex-1 h-px bg-border-default'></div>
                </div>
              )}

              {/* 해당 레벨의 이미지들 */}
              <div className='grid grid-cols-3 md:grid-cols-5 gap-2'>
                {groupedByLevel[level].map((item, index) => (
                  <div
                    key={`${level}-${index}`}
                    className='w-full h-full bg-surface-elevated rounded-lg aspect-[3/4]'
                  >
                    {item.default_yn !== 1 && item.show_yn !== 1 ? (
                      <div className='w-full h-full bg-surface-elevated rounded-lg aspect-[3/4] flex items-center justify-center relative'>
                        {/* <Image
                          src={'/images/character1.jpg'}
                          alt={`레벨 ${level} 이미지 ${index + 1}`}
                          width={100}
                          height={100}
                          className='w-full h-full object-cover rounded-lg blur-lg'
                          quality={10}
                        /> */}
                        <Image
                          src={item.img_url + '?anim=false,f=auto,fit=crop,g=top,h=180,w=120'}
                          alt={`레벨 ${level} 이미지 ${index + 1}`}
                          width={100}
                          height={100}
                          className='w-full h-full object-cover rounded-lg blur-lg'
                          quality={10}
                        />

                        <button
                          className='absolute bottom-0 left-0 w-full h-full text-text-muted text-xs'
                          onClick={() => handleOpenImage(item.chrbot_multi_image_key)}
                        >
                          <div className='text-text-inverse p-1 rounded-lg'>
                            <FontAwesomeIcon
                              icon={faLock}
                              className='h-14 w-14 md:h-14 md:w-14 text-text-inverse drop-shadow-2xl bg-overlay/50 rounded-full p-2'
                            />
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className='w-full h-full relative'>
                        <Image
                          src={item.img_url}
                          alt={`레벨 ${level} 이미지 ${index + 1}`}
                          width={100}
                          height={100}
                          className='w-full h-full object-cover rounded-lg'
                          quality={30}
                        />

                        {/* 동그란 모양의 체크박스 */}
                        <div className='absolute top-2 left-2'>
                          <button
                            onClick={() => handleSelectedBgImage(item.chrbot_multi_image_key)}
                            className='w-6 h-6 rounded-full bg-surface-elevated text-text-muted hover:bg-surface-elevated-hover transition-colors flex items-center justify-center'
                          >
                            {bgImageKey === item.chrbot_multi_image_key && (
                              <FontAwesomeIcon icon={faCheck} className='h-4 w-4 md:h-6 md:w-6' />
                            )}
                          </button>
                        </div>

                        {/* 핀셋 이미지 */}
                        {/* {bgImageKey === item.chrbot_multi_image_key && ( */}
                        <div className='absolute top-2 right-2'>
                          <button
                            onClick={() =>
                              handleSelectedHoldingBgImage(item.chrbot_multi_image_key, 1)
                            }
                            className='w-6 h-6 rounded-full bg-surface-elevated text-text-muted hover:bg-surface-elevated-hover transition-colors flex items-center justify-center'
                          >
                            {/* <FontAwesomeIcon icon={faThumbTack} className='h-4 w-4 md:h-6 md:w-6' /> */}

                            <FontAwesomeIcon
                              icon={isPinned ? faThumbtack : faTimes}
                              className={'text-blue-500'}
                            />
                          </button>
                        </div>
                        {/* )} */}

                        {/* 확대 이미지 */}
                        <div className='absolute bottom-2 right-2'>
                          <button
                            onClick={() => handleOnImageBigger(item.img_url)}
                            className='w-6 h-6 rounded-full bg-surface-elevated text-text-muted hover:bg-surface-elevated-hover transition-colors flex items-center justify-center'
                          >
                            <FontAwesomeIcon icon={faExpand} className='h-4 w-4 md:h-4 md:w-4' />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <UnlockActionModal
        isOpen={imgUnlockAction}
        imgUrl={rewardImgUrl}
        onClose={() => setImgUnlockAction(false)}
        onAnimationEnd={() => {
          // background image 변경
          setImgUnlockAction(false);
          fetchMultiImageData(multiImages);
        }}
      />
      <ConfirmActionModal
        isOpen={confirmActionOpen}
        onClose={() => setConfirmActionOpen(false)}
        title='확인'
        description={unLockDesc}
        onConfirm={handleUnlockMultiImage}
      />

      {isBigImageModalOpen && bigImageUrl && (
        <BigImageModal
          isOpen={isBigImageModalOpen}
          imgUrl={bigImageUrl}
          onClose={() => setIsBigImageModalOpen(false)}
        />
      )}
    </BaseModal>
  );
}
