import Image from 'next/image';
import { useState } from 'react';
import { getImageUri } from '@/lib/utils/storyNationUtil';
import { MultiImageData } from '@/services/interface';
import { CENTER_FADE_EXPAND_ANIMATION } from '../../config/animations';
import { cn } from '../../lib/utils/cn';
import useModalStore from '../../model/stores/useModalStore';
import CheckIcon from '../icons/CheckIcon';
import CloseIcon from '../icons/CloseIcon';
import ImagePlaceholderIcon from '../icons/ImagePlaceholderIcon';
import Modal from './base/Modal';

type UploadModeProps = {
  mode?: 'upload';
  onUpload: (keys: number[]) => void;
  onTabChange: () => void;
};

type EditModeProps = {
  mode: 'edit';
  onUpload: (key: number) => void;
  onTabChange?: never;
};

type CharacterMediaModalProps = {
  images: MultiImageData[];
} & (UploadModeProps | EditModeProps);

const CharacterMediaModal = (props: CharacterMediaModalProps) => {
  const { onUpload, images, mode = 'upload' } = props;
  const { closeModalByType } = useModalStore();
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set());

  const handleSelectImage = (key: number) => {
    if (mode === 'edit') {
      setSelectedKeys(new Set(selectedKeys.has(key) ? [] : [key]));
      return;
    }
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectedOrderMap = new Map(Array.from(selectedKeys).map((key, i) => [key, i + 1]));

  return (
    <Modal>
      <Modal.Backdrop />
      <Modal.Content
        {...CENTER_FADE_EXPAND_ANIMATION}
        className='flex h-[60vh] w-full max-w-[600px] flex-col overflow-y-hidden rounded-[20px] px-6 py-5 shadow-none'
      >
        <div className='flex flex-col gap-y-5'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xl font-bold'>미디어 {mode === 'upload' ? '전송' : '수정'}</h3>
            <button
              type='button'
              onClick={() => closeModalByType('characterMedia')}
              className='rounded-full p-1 hover:bg-v2-gray-200'
            >
              <CloseIcon className='h-6 w-6' />
            </button>
          </div>
          <p className='text-sm font-medium text-text-muted'>
            전송 버튼을 누르면 선택한 미디어가 현재 위치에 올라가요.
          </p>
        </div>
        <div className='mt-6 h-full flex-1 overflow-y-auto'>
          {images.length > 0 ? (
            <div className='grid grid-cols-4 gap-2 max-md:grid-cols-3'>
              {images.map((image) => {
                const order = selectedOrderMap.get(image.chrbot_multi_image_key);
                return (
                  <div
                    key={image.chrbot_multi_image_key}
                    className={cn(
                      'group relative aspect-[132/220] h-full w-full cursor-pointer overflow-hidden rounded-[10px] border-2 border-transparent',
                      order ? 'border-2 border-brand' : ''
                    )}
                    onClick={() => handleSelectImage(image.chrbot_multi_image_key)}
                  >
                    {order && mode === 'upload' && (
                      <div className='absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand font-semibold text-text-inverse'>
                        {order}
                      </div>
                    )}
                    {order && mode === 'edit' && (
                      <div className='absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand font-semibold text-text-inverse'>
                        <CheckIcon className='bg-brand text-text-inverse' size={18} />
                      </div>
                    )}
                    <Image
                      src={getImageUri(image.img_url)}
                      alt={image.img_url}
                      width={132}
                      height={200}
                      draggable={false}
                      className='h-full w-full select-none object-cover duration-100  group-hover:brightness-75'
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='flex h-full flex-col items-center justify-center gap-y-3'>
              <ImagePlaceholderIcon className='h-12 w-12 text-v2-gray-600' />
              <p className='cursor-default text-2xl font-bold text-v2-gray-600'>
                업로드된 이미지가 없어요.
              </p>
              {mode === 'upload' && (
                <button
                  type='button'
                  className='mt-2 rounded-[10px] bg-v2-black-50 px-3 py-[11px] font-medium leading-[1.4] text-text-inverse active:bg-opacity-90'
                  onClick={props.onTabChange}
                >
                  이미지 업로드
                </button>
              )}
            </div>
          )}
        </div>
        <div className='pt-5'>
          <button
            type='button'
            disabled={selectedKeys.size === 0}
            className={cn(
              'w-full rounded-[10px] bg-brand px-3 py-[11px] font-medium leading-[1.4] text-text-inverse hover:bg-opacity-90 active:bg-opacity-90',
              selectedKeys.size > 0 ? 'opacity-100' : 'opacity-50'
            )}
            onClick={() => {
              if (mode === 'edit') {
                (onUpload as (key: number) => void)(Array.from(selectedKeys)[0]);
              } else {
                (onUpload as (keys: number[]) => void)(Array.from(selectedKeys));
              }
              closeModalByType('characterMedia');
            }}
          >
            <span>전송</span>
          </button>
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default CharacterMediaModal;
