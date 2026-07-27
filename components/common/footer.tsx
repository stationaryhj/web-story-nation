import { faDiscord, faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import {
  faBookOpen,
  faCoins,
  faComment,
  faHeart,
  faHome,
  faPlus,
  faUser,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // 현재 경로에 따라 활성화된 링크 확인
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* 기존 푸터 - 모바일에서는 패딩 추가 */}
      <footer className='bg-surface-sunken border-t border-border-default py-8 md:pb-8 pb-10'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col md:flex-row justify-between'>
            <div className='mb-6 md:mb-0'>
              <h3 className='text-lg font-bold text-brand-hover mb-2'>러브챗</h3>
              <p className='text-text-muted font-bold mb-4'>주식회사 우주문방구</p>
              <ul className='text-sm text-text-muted/80 space-y-2'>
                <li>경기도 부천시 원미구 길주로 17 웹툰융합센터 606호 607호</li>
                <li>대표자: 박호준 | 사업자 등록번호: 465-87-02166</li>
                <li>통신판매업신고번호: 제 2024-서울관악-0165 호</li>
                <li>전화번호: 032-321-0331</li>
                <li>
                  이메일:{' '}
                  <a
                    href='mailto:storynation@universestationery.co.kr'
                    className='hover:text-brand transition-colors'
                  >
                    storynation@universestationery.co.kr
                  </a>
                </li>
              </ul>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-8'>
              {/* <div>
                <h4 className="text-sm font-semibold text-secondary-900 dark:text-dark-secondary-700 mb-3">서비스</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600 transition-colors"
                    >
                      소개
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="text-sm text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600 transition-colors"
                    >
                      요금제
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq"
                      className="text-sm text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600 transition-colors"
                    >
                      자주 묻는 질문
                    </Link>
                  </li>
                </ul>
              </div> */}

              <div>
                <h4 className='text-sm font-semibold text-text-primary mb-3'>법적 정보</h4>
                <ul className='space-y-2'>
                  <li>
                    <Link
                      target='_blank'
                      href='/terms'
                      className='text-sm text-text-muted hover:text-brand transition-colors'
                    >
                      이용약관
                    </Link>
                  </li>
                  <li>
                    <Link
                      target='_blank'
                      href='/terms?tab=privacy'
                      className='text-sm text-text-muted hover:text-brand transition-colors'
                    >
                      개인정보처리방침
                    </Link>
                  </li>
                </ul>
              </div>

              {/* <div>
                <h4 className="text-sm font-semibold text-secondary-900 dark:text-dark-secondary-700 mb-3">소셜</h4>
                <ul className="flex space-x-4">
                  <li>
                    <a
                      href="https://www.instagram.com/storynation_official/?igsh=MWtrcHBnOGtseHJtYg%3D%3D#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                    >
                      <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
                      <span className="sr-only">Instagram</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://x.com/storynationkr?s=21"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                    >
                      <FontAwesomeIcon icon={faXTwitter} className="w-5 h-5" />
                      <span className="sr-only">X (Twitter)</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://discord.com/login?redirect_to=%2Fchannels%2F662267976984297473%2F981832774157762570"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                    >
                      <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
                      <span className="sr-only">Discord</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://pf.kakao.com/_lMJmb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                    >
                      <FontAwesomeIcon icon={faComment} className="w-5 h-5" />
                      <span className="sr-only">KakaoTalk Channel</span>
                    </a>
                  </li>
                </ul>
              </div> */}
            </div>
          </div>

          <div className='mt-8 pt-8 border-t border-border-default text-center text-sm text-text-muted'>
            &copy; {new Date().getFullYear()} 러브챗. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
