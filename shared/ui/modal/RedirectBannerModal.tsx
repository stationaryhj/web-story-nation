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
      userInfo?.user_key?.toString() || '0',
      'https://qausapi.universestationery.com',
      'https://qa.storynation.co.kr/character/chat',
      'qauschat.storynation.io',
      '443'
    );
    // api_server?: string,
    // chat_address?: string,
    // chat_server?: string,
    // chat_server_port?: string
    console.log('chrbotKey :: ', chrbotKey);
    console.log('userInfo?.coin_user :: ', userInfo?.coin_user);
    console.log('freePen :: ', freePen);
    console.log('nsfw :: ', nsfw);
    console.log('userInfo?.persona :: ', userInfo?.persona);
    console.log('userInfo?.access_token :: ', userInfo?.access_token);
    console.log('userInfo?.user_key :: ', userInfo?.user_key);
    console.log('encryptedData :: ', encryptedData);
    router.push(`https://qa.storynation.co.kr/character/chat?info=${encryptedData}`);
  };

  return (
    <Modal className='pointer-events-none'>
      <motion.div
        className='absolute cursor-pointer  pointer-events-auto translate-x-0 bottom-0 left-0 w-full bg-primary py-[11px] rounded-none'
        onClick={handleClick}
        {...SLIDE_UP_ANIMATION}
      >
        <div className=' max-w-[1280px] w-full px-4 mx-auto flex items-center justify-between'>
          <div className='flex items-center justify-between gap-x-3'>
            <span className='font-bold text-white'>방금 대화한 채팅방으로 이동하기</span>
            <FontAwesomeIcon icon={faAngleRight} size='sm' className='text-white' />
          </div>
          <Modal.Close onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClose(e)}>
            <FontAwesomeIcon icon={faClose} size='lg' className='text-white' />
          </Modal.Close>
        </div>
      </motion.div>
    </Modal>
  );
};

export default RedirectBannerModal;
