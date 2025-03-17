		- project_guide
			- Group 36
				- ### 0.인덱스 https://zeta-ai.io/ko  ### 1.프로필 https://zeta-ai.io/ko/characters/2c01419d-27f2-4aa5-abc1-e83593e49216/profile -> profile 제거하면 2f5397ec-e089-4d06-aa36-d5ae253fe835에 해당하는 캐릭터 채팅으로 이동 아마도 고유 토큰 접근 시 채팅 뱉는듯? ### 2.내 채팅 리스트 https://zeta-ai.io/ko/rooms ### 2.캐릭터 채팅 https://zeta-ai.io/ko/rooms/732ac588-b960-497b-a263-b14aae6c7c31 ### 3. 인덱스 탭 https://zeta-ai.io/ko/?locale=ko&tab=ranking&type=REALTIME ### 4.회원가입 https://zeta-ai.io/ko/signup?token=토큰주소 ### 5.캐릭터 제작 https://zeta-ai.io/ko/characters/create ### 5.1 캐릭터 이미지 생성 https://zeta-ai.io/ko/characters/5ac146cd-6d46-4ca7-aef6-def69eb08a36/profile-image/generation ### 5.2 캐릭터 이미지 선택 https://zeta-ai.io/ko/characters/b871ad9f-91ca-4588-a51b-7f793e59397d/profile-image/review ### 5.3 캐릭터 이름 설정 https://zeta-ai.io/ko/characters/b871ad9f-91ca-4588-a51b-7f793e59397d/edit#tab=name ### 5.4 캐릭터 목소리 설정 https://zeta-ai.io/ko/characters/b871ad9f-91ca-4588-a51b-7f793e59397d/edit#tab=voice ### 5.1 캐릭터 이미지 생성 ### 5.1 캐릭터 이미지 생성 ### 6.마이페이지 https://zeta-ai.io/ko/my-page ### 7.더보기 https://zeta-ai.io/ko/more ### 8.검색 https://zeta-ai.io/ko/rooms?query=
					• ### 0.인덱스
					• https://zeta-ai.io/ko
					• ### 1.프로필
					• https://zeta-ai.io/ko/characters/2c01419d-27f2-4aa5-abc1-e83593e49216/profile
					• -> profile 제거하면 2f5397ec-e089-4d06-aa36-d5ae253fe835에 해당하는 캐릭터 채팅으로 이동
					• 아마도 고유 토큰 접근 시 채팅 뱉는듯?
					• ### 2.내 채팅 리스트
					• https://zeta-ai.io/ko/rooms
					• ### 2.캐릭터 채팅
					• https://zeta-ai.io/ko/rooms/732ac588-b960-497b-a263-b14aae6c7c31 ### 3. 인덱스 탭
					• https://zeta-ai.io/ko/?locale=ko&tab=ranking&type=REALTIME
					• ### 4.회원가입
					• https://zeta-ai.io/ko/signup?token=토큰주소
					• ### 5.캐릭터 제작
					• https://zeta-ai.io/ko/characters/create ### 5.1 캐릭터 이미지 생성 https://zeta-ai.io/ko/characters/5ac146cd-6d46-4ca7-aef6-def69eb08a36/profile-image/generation
					• ### 5.2 캐릭터 이미지 선택 https://zeta-ai.io/ko/characters/b871ad9f-91ca-4588-a51b-7f793e59397d/profile-image/review ### 5.3 캐릭터 이름 설정 https://zeta-ai.io/ko/characters/b871ad9f-91ca-4588-a51b-7f793e59397d/edit#tab=name ### 5.4 캐릭터 목소리 설정 https://zeta-ai.io/ko/characters/b871ad9f-91ca-4588-a51b-7f793e59397d/edit#tab=voice ### 5.1 캐릭터 이미지 생성 ### 5.1 캐릭터 이미지 생성 ### 6.마이페이지
					• https://zeta-ai.io/ko/my-page
					• ### 7.더보기
					• https://zeta-ai.io/ko/more
					• ### 8.검색
					• https://zeta-ai.io/ko/rooms?query=
				- zeta 페이지 접근 url 및 엔드포인트
					• zeta 페이지 접근 url 및 엔드포인트
			- 준비사항 덕 -페이지 컨테이너 뷰사이즈 1280px 작아지면 리스트들 좌우 스크롤 5 갭 20 카드 1280 이하로 작아지면 스크롤형태로 바뀐다. 로판 -페이지 컨테이너 뷰사이즈 1152px 애초에 스크롤뷰
				• 준비사항
				• 덕
				• -페이지 컨테이너 뷰사이즈 1280px 작아지면 리스트들 좌우 스크롤 5 갭 20 카드 1280 이하로 작아지면 스크롤형태로 바뀐다.
				• 로판
				• -페이지 컨테이너 뷰사이즈 1152px 애초에 스크롤뷰
			- 필요한 라이브러리
				• 필요한 라이브러리
			- 이거 pwa 추후에 이용해도 좋을듯. 카테고리 많아서 1.config 파일 2.스와이퍼 3.통신 데이터 pending 상태일 경우 스켈레톤 처리. 4.**Intersection Observer API** -스크립트 **Google Tag Manager** -**Next.js** -**Tailwind CSS** -react skeleton 사용하여 통신데이터 관리 -zustand -1~999k 처리 -0개 처리 -토스트 팝업 -카테고리 분류 -부드러운 애니메이션 처리 ( 라이브러리 아무거나) react-framer -스타일 라이브러리 - 통제 가능하면 -lodash.debounce 검색 api 및 debounce 기능 최적화 라이브러리 -캐싱 질문사항) -반응형 지원인지? - 제타처럼 아예 pc에서도 모바일 뷰로 보여줄 것인지? -url공유기능 필요 -소셜로그인 지원 플랫폼
				• 이거 pwa 추후에 이용해도 좋을듯.
				• 카테고리 많아서
				• 1.config 파일
				• 2.스와이퍼
				• 3.통신 데이터 pending 상태일 경우 스켈레톤 처리.
				• 4.**Intersection Observer API**
				• -스크립트 **Google Tag Manager**
				• -**Next.js**
				• -**Tailwind CSS**
				• -react skeleton 사용하여 통신데이터 관리
				• -zustand
				• -1~999k 처리
				• -0개 처리
				• -토스트 팝업
				• -카테고리 분류
				• -부드러운 애니메이션 처리 ( 라이브러리 아무거나) react-framer
				• -스타일 라이브러리 - 통제 가능하면
				• -lodash.debounce 검색 api 및 debounce 기능 최적화 라이브러리
				• -캐싱
				• 질문사항
				• -반응형 지원인지? - 제타처럼 아예 pc에서도 모바일 뷰로 보여줄 것인지?
				• -url공유기능 필요
				• -소셜로그인 지원 플랫폼
			- "creator": { "id": "8f20beae-23ed-4ebe-a786-6174d4e7224d", "nickname": "CroakySled1251", "username": "CroakySled1251", "profileImageUrl": null, "isActive": true },
				• "creator": {
				• "id": "8f20beae-23ed-4ebe-a786-6174d4e7224d",
				• "nickname": "CroakySled1251",
				• "username": "CroakySled1251",
				• "profileImageUrl": null,
				• "isActive": true
				• },
