'use client';

import {
  faArrowLeft,
  faChevronDown,
  faChevronRight,
  faCircleUser,
  faImage,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccountStore } from '@/store/useStoreData';
import 'react-toastify/dist/ReactToastify.css';
import { BaseButton } from '@/components/elements/button/BaseButton';

export default function MyAccountView() {
  const router = useRouter();
  const [isEdited, setIsEdited] = useState(false);
  const [isNicknameVerified, setIsNicknameVerified] = useState(true); // 초기값은 true로 설정 (기존 닉네임은 검증됨)
  const [isNicknameChanged, setIsNicknameChanged] = useState(false); // 닉네임이 변경되었는지 추적
  const [originalNickname, setOriginalNickname] = useState('닉네임'); // 초기 닉네임 저장
  const [activeTab, setActiveTab] = useState<'support' | 'terms' | 'privacy' | 'paid' | 'policy'>(
    'support'
  );

  // 사용자 정보 상태
  const [profile, setProfile] = useState({
    nickname: '닉네임',
    email: 'user@example.com',
    platform: 'Google',
    bank: '',
    accountNumber: '',
    accountHolder: '',
    language: 'ko', // 'ko' 또는 'en'
    profileImage: null as string | null,
  });

  const { data: userInfo } = useAccountStore();

  console.log('@@ userInfo :: ', userInfo);

  // 페르소나 설정
  const [persona, setPersona] = useState({
    name: '',
    gender: '남성' as '남성' | '여성' | '알 수 없음',
  });

  // 이미지 업로드를 위한 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 은행 목록
  const [showBankList, setShowBankList] = useState(false);
  const bankList = [
    '국민은행',
    '신한은행',
    '우리은행',
    '하나은행',
    '농협은행',
    '기업은행',
    '새마을금고',
    '카카오뱅크',
    '토스뱅크',
  ];

  // 닉네임 중복 체크 핸들러
  const handleDuplicateCheck = () => {
    // 여기에 실제 API 호출 로직이 들어갈 수 있음
    const isAvailable = Math.random() > 0.3; // 임시로 랜덤하게 결과 생성

    if (isAvailable) {
      toast.success('사용 가능한 닉네임입니다.');
      setIsNicknameVerified(true);
      setIsNicknameChanged(false); // 중복 체크 통과 후 상태 초기화
    } else {
      toast.error('사용할 수 없는 닉네임입니다.');
      setIsNicknameVerified(false);
    }
  };

  // 닉네임이 원래 닉네임과 같은지 확인
  useEffect(() => {
    if (profile.nickname === originalNickname) {
      setIsNicknameVerified(true);
      setIsNicknameChanged(false);
    } else {
      setIsNicknameChanged(true);
    }
  }, [profile.nickname, originalNickname]);

  // 저장 핸들러
  const handleSave = () => {
    // 닉네임이 변경되었고 중복 확인을 하지 않은 경우
    if (isNicknameChanged && !isNicknameVerified) {
      toast.error('닉네임 중복 확인이 필요합니다.');
      return;
    }

    // 여기에 실제 API 호출 로직이 들어갈 수 있음
    toast.success('정보가 성공적으로 저장되었습니다.');
    setIsEdited(false);
    setOriginalNickname(profile.nickname); // 저장 후 원래 닉네임 업데이트
    setIsNicknameVerified(true); // 저장 후 닉네임 검증 상태 업데이트
    setIsNicknameChanged(false); // 저장 후 닉네임 변경 상태 초기화
  };

  // 입력 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, field: keyof typeof profile) => {
    // 계좌번호는 숫자만 입력 가능하도록 처리
    if (field === 'accountNumber' && !/^\d*$/.test(e.target.value)) {
      return;
    }

    // 예금주는 한글만 입력 가능하도록 처리
    if (field === 'accountHolder' && !/^[가-힣]*$/.test(e.target.value)) {
      return;
    }

    // 계좌번호는 최대 14자리
    if (field === 'accountNumber' && e.target.value.length > 14) {
      return;
    }

    // 예금주는 최대 8자리
    if (field === 'accountHolder' && e.target.value.length > 8) {
      return;
    }

    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
    setIsEdited(true);
  };

  // 페르소나 입력 핸들러
  const handlePersonaChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof typeof persona
  ) => {
    if (field === 'name' && e.target.value.length > 25) {
      return;
    }

    setPersona((prev) => ({ ...prev, [field]: e.target.value }));
    setIsEdited(true);
  };

  // 성별 변경 핸들러
  const handleGenderChange = (gender: '남성' | '여성' | '알 수 없음') => {
    setPersona((prev) => ({ ...prev, gender }));
    setIsEdited(true);
  };

  // 언어 변경 핸들러
  const handleLanguageChange = (language: 'ko' | 'en') => {
    setProfile((prev) => ({ ...prev, language }));
    setIsEdited(true);
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, profileImage: reader.result as string }));
        setIsEdited(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 삭제 핸들러
  const handleDeleteImage = () => {
    setProfile((prev) => ({ ...prev, profileImage: null }));
    setIsEdited(true);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    // 여기에 실제 로그아웃 로직이 들어갈 수 있음
    router.push('/');
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (isEdited) {
      const confirm = window.confirm('변경 사항이 저장되지 않았습니다. 그래도 나가시겠습니까?');
      if (confirm) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'support' | 'terms' | 'privacy' | 'paid' | 'policy') => {
    setActiveTab(tab);

    // 각 탭에 따라 다른 페이지로 이동
    switch (tab) {
      case 'support':
        window.open('https://pf.kakao.com/_xoIvlxj', '_blank');
        break;
      case 'terms':
        window.open('/terms?tab=terms', '_blank');
        break;
      case 'privacy':
        window.open('/terms?tab=privacy', '_blank');
        break;
      case 'paid':
        window.open('/terms?tab=paid', '_blank');
        break;
      case 'policy':
        window.open('/terms?tab=policy', '_blank');
        break;
    }
  };

  // 은행 선택 핸들러
  const handleBankSelect = (bank: string) => {
    setProfile((prev) => ({ ...prev, bank }));
    setShowBankList(false);
    setIsEdited(true);
  };

  // 창 외부 클릭 감지를 위한 참조
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setShowBankList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 가상의 펜 사용 내역
  const penUsageHistory = [
    { date: '2023.05.15', type: '캐릭터 생성', amount: 100 },
    { date: '2023.05.12', type: '채팅 사용', amount: 50 },
    { date: '2023.05.10', type: '이미지 생성', amount: 200 },
    { date: '2023.05.05', type: '캐릭터 수정', amount: 30 },
    { date: '2023.05.01', type: '채팅 사용', amount: 45 },
  ];

  return (
    <div className='flex flex-col min-h-screen bg-surface'>
      {/* 헤더 */}
      <div className='bg-surface-elevated shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10'>
        <div className='max-w-[1300px] mx-auto w-full flex items-center justify-between'>
          <div className='flex items-center'>
            <button
              onClick={handleBack}
              className='w-10 h-10 flex items-center justify-center text-text-muted hover:bg-surface-elevated-hover rounded-full mr-2'
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h1 className='text-xl font-semibold text-text-primary'>내 정보</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={!isEdited}
            className={`px-4 py-2 rounded-lg ${isEdited ? 'bg-brand text-text-inverse' : 'bg-surface-elevated-hover text-text-muted'}`}
          >
            저장
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='max-w-[1300px] mx-auto w-full p-4 pb-16'>
        {/* 프로필 이미지 섹션 */}
        <div className='bg-surface-elevated rounded-2xl shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-6 text-text-primary'>프로필</h2>
          <div className='flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='w-24 h-24 rounded-full overflow-hidden bg-surface-elevated-hover flex items-center justify-center'>
                {profile.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt='프로필'
                    width={96}
                    height={96}
                    className='object-cover w-full h-full'
                  />
                ) : (
                  <FontAwesomeIcon icon={faCircleUser} className='text-5xl text-text-muted' />
                )}
              </div>
              <div className='absolute bottom-0 right-0 flex space-x-1'>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='w-8 h-8 rounded-full bg-brand text-text-inverse flex items-center justify-center shadow-md hover:bg-brand-hover'
                >
                  <FontAwesomeIcon icon={faImage} className='text-sm' />
                </button>
                {profile.profileImage && (
                  <button
                    onClick={handleDeleteImage}
                    className='w-8 h-8 rounded-full bg-danger text-text-inverse flex items-center justify-center shadow-md hover:bg-danger/90'
                  >
                    <FontAwesomeIcon icon={faTrash} className='text-sm' />
                  </button>
                )}
              </div>
              <input
                type='file'
                ref={fileInputRef}
                className='hidden'
                accept='image/*'
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>

        {/* 계정 정보 섹션 */}
        <div className='bg-surface-elevated rounded-2xl shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4 text-text-primary'>계정 정보</h2>
          <div className='space-y-5'>
            {/* 연동된 플랫폼 */}
            <div>
              <label className='block text-sm font-medium text-text-primary mb-2'>
                연동된 플랫폼
              </label>
              <div className='px-4 py-3 bg-surface-elevated-hover rounded-lg text-text-primary'>
                {profile.platform}
              </div>
            </div>

            {/* 닉네임 */}
            <div>
              <label className='block text-sm font-medium text-text-primary mb-2'>
                닉네임
                {isNicknameChanged && (
                  <span className='text-danger ml-2 text-xs'>중복 확인이 필요합니다</span>
                )}
              </label>
              <div className='flex space-x-2'>
                <input
                  type='text'
                  value={profile.nickname}
                  onChange={(e) => handleInputChange(e, 'nickname')}
                  className='flex-1 px-4 py-3 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-surface'
                  placeholder='닉네임을 입력하세요'
                />
                <button
                  onClick={handleDuplicateCheck}
                  className='px-4 py-2 bg-brand text-text-inverse rounded-lg whitespace-nowrap hover:bg-brand-hover'
                >
                  중복 확인
                </button>
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className='block text-sm font-medium text-text-primary mb-2'>이메일</label>
              <div className='px-4 py-3 bg-surface-elevated-hover rounded-lg text-text-primary'>
                {profile.email}
              </div>
            </div>
          </div>
        </div>

        {/* 정산 정보 섹션 */}
        <div className='bg-surface-elevated rounded-2xl shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4 text-text-primary'>정산 정보</h2>
          <div className='space-y-5'>
            {/* 은행 선택 */}
            <div className='relative' ref={bankDropdownRef}>
              <label className='block text-sm font-medium text-text-primary mb-2'>은행</label>
              <button
                className='w-full px-4 py-3 border border-border-default rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-brand hover:bg-brand/10'
                onClick={() => setShowBankList(!showBankList)}
              >
                <span className='text-text-primary'>{profile.bank || '은행 선택'}</span>
                <FontAwesomeIcon icon={faChevronDown} className='text-text-muted' />
              </button>
              {showBankList && (
                <div className='absolute mt-1 w-full bg-surface-elevated border border-border-default rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto'>
                  {bankList.map((bank) => (
                    <div
                      key={bank}
                      className='px-4 py-2 text-text-primary hover:bg-brand/10 cursor-pointer'
                      onClick={() => handleBankSelect(bank)}
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 계좌번호 */}
            <div>
              <label className='block text-sm font-medium text-text-primary mb-2'>
                계좌번호 <span className='text-xs text-text-muted'>(숫자만 입력)</span>
              </label>
              <input
                type='text'
                value={profile.accountNumber}
                onChange={(e) => handleInputChange(e, 'accountNumber')}
                className='w-full px-4 py-3 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-surface'
                placeholder='계좌번호'
                maxLength={14}
              />
            </div>

            {/* 예금주 */}
            <div>
              <label className='block text-sm font-medium text-text-primary mb-2'>
                예금주 <span className='text-xs text-text-muted'>(이름만 입력)</span>
              </label>
              <input
                type='text'
                value={profile.accountHolder}
                onChange={(e) => handleInputChange(e, 'accountHolder')}
                className='w-full px-4 py-3 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-surface'
                placeholder='예금주'
                maxLength={8}
              />
            </div>
          </div>
        </div>

        {/* 페르소나 설정 섹션 */}
        <div className='bg-surface-elevated rounded-2xl shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4 text-text-primary'>페르소나 설정</h2>
          <div className='space-y-5'>
            {/* 페르소나 이름 */}
            <div>
              <label className='block text-sm font-medium text-text-primary mb-2'>
                이름 (최대 25자)
              </label>
              <input
                type='text'
                value={persona.name}
                onChange={(e) => handlePersonaChange(e, 'name')}
                className='w-full px-4 py-3 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-surface'
                placeholder='페르소나 이름'
                maxLength={25}
              />
            </div>

            {/* 페르소나 성별 - BaseButton 사용 */}
            <div>
              <label className='block text-sm font-medium text-text-primary mb-2'>성별</label>
              <div className='flex space-x-3'>
                <BaseButton
                  onClick={() => handleGenderChange('남성')}
                  color='primary'
                  className={
                    persona.gender === '남성' ? '!bg-brand !text-text-inverse !border-brand' : ''
                  }
                >
                  남성
                </BaseButton>
                <BaseButton
                  onClick={() => handleGenderChange('여성')}
                  color='primary'
                  className={
                    persona.gender === '여성' ? '!bg-brand !text-text-inverse !border-brand' : ''
                  }
                >
                  여성
                </BaseButton>
                <BaseButton
                  onClick={() => handleGenderChange('알 수 없음')}
                  color='primary'
                  className={
                    persona.gender === '알 수 없음'
                      ? '!bg-brand !text-text-inverse !border-brand'
                      : ''
                  }
                >
                  알 수 없음
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        {/* 언어 설정 섹션 */}
        <div className='bg-surface-elevated rounded-2xl shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4 text-text-primary'>언어 설정</h2>
          <div className='flex space-x-3'>
            <button
              onClick={() => handleLanguageChange('ko')}
              className={`flex-1 py-3 px-3 rounded-lg border ${
                profile.language === 'ko'
                  ? 'bg-brand border-brand text-text-inverse font-bold'
                  : 'bg-surface text-text-primary border-border-default hover:bg-surface-elevated-hover'
              }`}
            >
              한국어
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 py-3 px-3 rounded-lg border ${
                profile.language === 'en'
                  ? 'bg-brand border-brand text-text-inverse font-bold'
                  : 'bg-surface text-text-primary border-border-default hover:bg-surface-elevated-hover'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* 펜 사용 내역 섹션 */}
        <div className='bg-surface-elevated rounded-2xl shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4 text-text-primary'>펜 사용 내역</h2>
          <div className='space-y-3'>
            {penUsageHistory.map((item, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-3 border-b border-border-default last:border-0'
              >
                <div>
                  <div className='font-medium text-text-primary'>{item.type}</div>
                  <div className='text-sm text-text-muted'>{item.date}</div>
                </div>
                <div className='font-semibold text-brand'>{item.amount} 펜</div>
              </div>
            ))}
          </div>
        </div>

        {/* 고객 지원 및 법적 정보 섹션 */}
        <div className='bg-surface-elevated rounded-2xl shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4 text-text-primary'>고객 지원 및 약관</h2>

          {/* 세로 버튼 목록으로 변경 */}
          <div className='space-y-3'>
            <button
              onClick={() => handleTabChange('support')}
              className='w-full text-left px-4 py-3 rounded-lg flex items-center justify-between bg-surface-elevated-hover text-text-primary hover:bg-brand/10 border border-border-default focus:outline-none'
            >
              <span>카카오톡 문의</span>
              <FontAwesomeIcon icon={faChevronRight} className='text-text-muted' />
            </button>
            <button
              onClick={() => handleTabChange('terms')}
              className='w-full text-left px-4 py-3 rounded-lg flex items-center justify-between bg-surface-elevated-hover text-text-primary hover:bg-brand/10 border border-border-default focus:outline-none'
            >
              <span>서비스 이용약관</span>
              <FontAwesomeIcon icon={faChevronRight} className='text-text-muted' />
            </button>
            <button
              onClick={() => handleTabChange('privacy')}
              className='w-full text-left px-4 py-3 rounded-lg flex items-center justify-between bg-surface-elevated-hover text-text-primary hover:bg-brand/10 border border-border-default focus:outline-none'
            >
              <span>개인정보 처리방침</span>
              <FontAwesomeIcon icon={faChevronRight} className='text-text-muted' />
            </button>
            <button
              onClick={() => handleTabChange('paid')}
              className='w-full text-left px-4 py-3 rounded-lg flex items-center justify-between bg-surface-elevated-hover text-text-primary hover:bg-brand/10 border border-border-default focus:outline-none'
            >
              <span>유료 서비스 이용약관</span>
              <FontAwesomeIcon icon={faChevronRight} className='text-text-muted' />
            </button>
            <button
              onClick={() => handleTabChange('policy')}
              className='w-full text-left px-4 py-3 rounded-lg flex items-center justify-between bg-surface-elevated-hover text-text-primary hover:bg-brand/10 border border-border-default focus:outline-none'
            >
              <span>운영 정책</span>
              <FontAwesomeIcon icon={faChevronRight} className='text-text-muted' />
            </button>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className='w-full py-3 text-danger font-medium border border-danger/40 rounded-lg bg-surface hover:bg-danger/10 focus:ring-2 focus:ring-danger focus:ring-offset-2 focus:outline-none'
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
