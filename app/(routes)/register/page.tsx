'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { contentApi } from '@/services/api';
import { LoginResponse } from '@/types/api';

export default function RegisterPage() {
  const searchParams = useSearchParams();

  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [agreements, setAgreements] = useState({
    all: false,
    service: false,
    privacy: false,
    marketing: false,
    age: false
  });

  const [snsauth, setSnsauth] = useState('');
  const [snstype, setSnstype] = useState(0);
  const [snsid, setSnsid] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const processAuth = async () => {
      const state = searchParams.get('state');

      const provider = JSON.parse(decodeURIComponent(state || '{}')).provider;
      const snsauth = JSON.parse(decodeURIComponent(state || '{}')).snsauth;
      const snstype = JSON.parse(decodeURIComponent(state || '{}')).snstype;
      const snsid = JSON.parse(decodeURIComponent(state || '{}')).snsid;
      const accessToken = JSON.parse(decodeURIComponent(state || '{}')).accessToken;

      console.log('provider ::: ' , provider);
      console.log('snsauth ::: ' , snsauth);
      console.log('snstype ::: ' , snstype);
      console.log('snsid ::: ' , snsid);
      console.log('accessToken ::: ' , accessToken);


      setSnsauth(snsauth);
      setSnstype(snstype);
      setSnsid(snsid);
      setAccessToken(accessToken);
    }

    processAuth();
  }, [searchParams, router]);

  const handleAllAgreements = (checked: boolean) => {
    setAgreements({
      all: checked,
      service: checked,
      privacy: checked,
      marketing: checked,
      age: checked
    });
  };

  const handleSingleAgreement = (key: keyof typeof agreements, checked: boolean) => {
    const newAgreements = {
      ...agreements,
      [key]: checked
    };
    
    // 모든 약관이 체크되었는지 확인
    const allChecked = Object.entries(newAgreements)
      .filter(([key]) => key !== 'all')
      .every(([_, value]) => value);
    
    setAgreements({
      ...newAgreements,
      all: allChecked
    });
  };



    // YYYYMMDD를 YYYY-MM-DD로 변환
  const formatBirthdate = (date: string) => {
    if (date.length !== 8) return '';
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  };

  const handleSubmit = async () => {
    // TODO: 회원가입 로직 구현
    console.log('회원가입 시도:', { nickname, birthdate, agreements });

    const formattedBirthdate = formatBirthdate(birthdate);
    console.log('formatted birthdate ::: ', formattedBirthdate);

    if(nickname === '' || birthdate === '') {
      alert('닉네임과 생년월일을 입력해주세요.');
      return;
    }

    if(agreements.all === false) {  
      alert('모든 약관에 동의해주세요.');
      return;
    }

    const responseRegist = await contentApi.register4(
      snsauth,
      snstype,
      snsid,
      nickname,
      formattedBirthdate,
      accessToken, 1);

    console.log('responseRegist ::: ' , responseRegist);

    if(responseRegist.data.result.err === 0) {
      const responseUserInfo = await contentApi.userinfo(responseRegist.data.access_token);
      console.log('responseUserInfo ::: ' , responseUserInfo);

      loginData(responseUserInfo.data);

      alert('회원가입이 완료되었습니다.');
      router.push('/login');
    }
  };


  const loginData = (data: LoginResponse) => {
    const { token_type, access_token, user_key } = data;

      console.log('access_token :: ', access_token);
      
      localStorage.setItem('authorization', JSON.stringify(token_type + ' ' + access_token));
      localStorage.setItem('authorizationKey', JSON.stringify(token_type));
      localStorage.setItem('deviceId', user_key?.toString());
      localStorage.setItem('loginInfo', JSON.stringify(data));

      // JWT 토큰을 쿠키에 저장
      document.cookie = `jwt_token=${access_token}; path=/`;
      router.push('/');
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">회원가입</h1>
        <button onClick={() => router.back()} className="p-2">
            x
        </button>
      </div>

      {/* 입력 폼 */}
      <div className="space-y-6">
        {/* 닉네임 입력 */}
        <div>
          <label className="block text-sm font-medium mb-2">닉네임</label>
          <div className="relative">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요. (20자 이내)"
              className="w-full p-3 border border-gray-300 rounded-lg pr-20"
              maxLength={20}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-100 rounded text-sm">
              중복확인
            </button>
          </div>
        </div>

        {/* 생년월일 입력 */}
        <div>
          <label className="block text-sm font-medium mb-2">생년월일</label>
          <input
            type="text"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            placeholder="ex. 19970320 (숫자 8자리)"
            className="w-full p-3 border border-gray-300 rounded-lg"
            maxLength={8}
          />
        </div>

        <div className="text-sm text-gray-500">
          스토리네이션은 만14세 이상 이용 가능합니다.
        </div>

        {/* 약관 동의 */}
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={agreements.all}
              onChange={(e) => handleAllAgreements(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="text-sm font-medium">모두 동의</span>
          </label>

          <div className="space-y-2 ml-1">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={agreements.service}
                  onChange={(e) => handleSingleAgreement('service', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm">서비스 이용약관(필수)</span>
              </label>
              <button className="text-sm text-gray-400">보기</button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={(e) => handleSingleAgreement('privacy', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm">개인정보 수집 및 이용(필수)</span>
              </label>
              <button className="text-sm text-gray-400">보기</button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={agreements.marketing}
                  onChange={(e) => handleSingleAgreement('marketing', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm">마케팅 정보 수신 동의(선택)</span>
              </label>
              <button className="text-sm text-gray-400">보기</button>
            </div>
          </div>
        </div>
      </div>

      {/* 확인 버튼 */}
      <button
        onClick={handleSubmit}
        className="fixed bottom-4 left-4 right-4 bg-gray-300 text-white py-4 rounded-lg font-medium"
        disabled={!agreements.service || !agreements.privacy || !nickname || !birthdate}
      >
        확인
      </button>
    </div>
  );
} 