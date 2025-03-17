import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faGlobe, faPlus, faLaptopCode, faUser, faHome, faHeart } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  
  // 현재 경로에 따라 활성화된 링크 확인
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }
  
  return (
    <>
      {/* 모바일 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-background-light border-t border-secondary-100 dark:border-dark-secondary-200 py-2 px-4 md:hidden z-40">
        <div className="flex justify-around items-center">
          <Link href="/" className={`flex flex-col items-center ${isActive('/') ? 'text-primary-600 dark:text-dark-primary-600' : 'text-secondary-500 dark:text-dark-secondary-500'}`}>
            <FontAwesomeIcon icon={faHome} className="text-xl mb-1" />
            <span className="text-xs">홈</span>
          </Link>
          
          <Link href="/chat-list" className={`flex flex-col items-center ${isActive('/chat') ? 'text-primary-600 dark:text-dark-primary-600' : 'text-secondary-500 dark:text-dark-secondary-500'}`}>
            <FontAwesomeIcon icon={faComment} className="text-xl mb-1" />
            <span className="text-xs">대화</span>
          </Link>
          
          <Link href="/create" className="flex flex-col items-center">
            <div className="bg-primary-500 dark:bg-dark-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center -mt-5 shadow-lg">
              <FontAwesomeIcon icon={faPlus} className="text-xl" />
            </div>
            <span className="text-xs mt-1 text-secondary-500 dark:text-dark-secondary-500">생성</span>
          </Link>
          
          <Link href="/favorites" className={`flex flex-col items-center ${isActive('/favorites') ? 'text-primary-600 dark:text-dark-primary-600' : 'text-secondary-500 dark:text-dark-secondary-500'}`}>
            <FontAwesomeIcon icon={faHeart} className="text-xl mb-1" />
            <span className="text-xs">즐겨찾기</span>
          </Link>
          
          <Link href="/my" className={`flex flex-col items-center ${isActive('/my') ? 'text-primary-600 dark:text-dark-primary-600' : 'text-secondary-500 dark:text-dark-secondary-500'}`}>
            <FontAwesomeIcon icon={faUser} className="text-xl mb-1" />
            <span className="text-xs">내 정보</span>
          </Link>
        </div>
      </div>
      
      {/* 기존 푸터 - 모바일에서는 패딩 추가 */}
      <footer className="bg-white dark:bg-dark-background-light border-t border-secondary-100 dark:border-dark-secondary-200 py-8 md:pb-8 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-lg font-bold text-primary-600 dark:text-dark-primary-600 mb-4">스토리네이션</h3>
              <p className="text-sm text-secondary-600 dark:text-dark-secondary-500 max-w-md">
                스토리네이션은 캐릭터 기반 서비스로, 다양한 캐릭터를 만들고 공유할 수 있는 플랫폼입니다.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 dark:text-dark-secondary-700 mb-3">서비스</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about" className="text-sm text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600 transition-colors">
                      소개
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-sm text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600 transition-colors">
                      요금제
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-sm text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600 transition-colors">
                      자주 묻는 질문
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-secondary-900 dark:text-dark-secondary-700 mb-3">법적 정보</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/terms" className="text-sm text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600 transition-colors">
                      이용약관
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-sm text-secondary-600 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600 transition-colors">
                      개인정보처리방침
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-secondary-100 dark:border-dark-secondary-200 text-center text-sm text-secondary-500 dark:text-dark-secondary-500">
            &copy; {new Date().getFullYear()} 스토리네이션. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}