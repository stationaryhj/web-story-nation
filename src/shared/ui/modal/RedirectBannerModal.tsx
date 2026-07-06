import { faAngleRight, faArrowRight, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getChatRoomEncryptData } from '@/lib/utils/storyNationUtil';
import { SLIDE_UP_ANIMATION } from '@/shared/config/animations';
import useModalStore from '@/shared/model/stores/useModalStore';
import Modal from '@/shared/ui/modal/base/Modal';
import { useAccountStore } from '@/store/useAccountStore';

const RedirectBannerModal = ({ charboyKey }: { charboyKey: string }) => {
  const router = useRouter();
  const { closeModalByType } = useModalStore();

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    closeModalByType('redirectBanner');
  };

  const handleClick = async () => {
    const { data: userInfo } = useAccountStore.getState();

    if (!userInfo || !charboyKey) {
      return;
    }

    const chrbotKey = charboyKey;
    const nsfw = '0';
    const freePen = Number(userInfo?.coin_free || 0) + Number(userInfo?.coin_register || 0);

    const encryptedData = await getChatRoomEncryptData(
      chrbotKey,
      userInfo?.coin_user?.toString() || '0',
      'KR',
      freePen?.toString() || '0',
      null,
      nsfw,
      userInfo?.persona || '',
      userInfo?.access_token || '',
      userInfo?.user_key?.toString() || '0'
    );
    // api_server?: string,
    // chat_address?: string,
    // chat_server?: string,
    // chat_server_port?: string
    router.push(`${process.env.NEXT_PUBLIC_CHAT_FRONTEND_ADDRESS}?info=${encryptedData}`);
  };

  return (
    <Modal className='pointer-events-none'>
      <motion.div
        className='absolute cursor-pointer  pointer-events-auto translate-x-0 bottom-0 left-0 w-full bg-brand py-[11px] rounded-none'
        onClick={handleClick}
        {...SLIDE_UP_ANIMATION}
      >
        <div className=' max-w-[1280px] w-full px-4 mx-auto flex items-center justify-between'>
          <div className='flex items-center justify-between gap-x-3'>
            <span className='font-bold text-text-inverse'>방금 대화한 채팅방으로 이동하기</span>
            <FontAwesomeIcon icon={faAngleRight} size='sm' className='text-text-inverse' />
          </div>
          <Modal.Close onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClose(e)}>
            <FontAwesomeIcon icon={faClose} size='lg' className='text-text-inverse' />
          </Modal.Close>
        </div>
      </motion.div>
    </Modal>
  );
};

export default RedirectBannerModal;
