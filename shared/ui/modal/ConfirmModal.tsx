import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils/cn';
import Modal from './base/Modal';

export interface ConfirmModalProps {
  title: string;
  description?: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmModal = ({
  title,
  description,
  content,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const buttons = [
    {
      text: cancelText,
      onClick: onCancel,
      className:
        'text-chat-ai-text-desktop active:bg-color-color-web-muted-color bg-web-bg-surface hover:bg-[#f1f2f2]',
    },
    {
      text: confirmText,
      onClick: onConfirm,
      className: 'text-white bg-primary active:bg-active-btn-color hover:bg-active-btn-color',
    },
  ];

  return (
    <Modal className='z-[51]'>
      <Modal.Backdrop className='pointer-events-none' />
      <Modal.Content
        className={cn(
          'left-1/2 w-[calc(100vw-40px)] max-w-[400px] bg-white p-5 -translate-x-1/2 overflow-hidden rounded-xl'
        )}
      >
        <div
          className={cn(
            'flex min-h-[180px] flex-col items-center justify-center gap-y-2 text-center'
          )}
        >
          <h3
            className={cn(
              'text-lg leading-[1.4] p-2.5 font-bold break-keep whitespace-break-spaces text-black'
            )}
          >
            {title}
          </h3>
          {description && (
            <p className={cn('text-sm font-normal p-2.5 whitespace-break-spaces text-black')}>
              {description}
            </p>
          )}
          {content && <div className='mt-4 w-full'>{content}</div>}
        </div>
        <div className={cn('flex justify-center')}>
          {buttons.map(
            (button, index) =>
              button.text && (
                <button
                  key={`${button.text}-${index}`}
                  type='button'
                  onClick={button.onClick}
                  className={cn(
                    'w-full py-3.5 font-bold tracking-wide rounded-[10px]',
                    button.className
                  )}
                >
                  {button.text}
                </button>
              )
          )}
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default ConfirmModal;
