// NakamaContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { chatApi } from '@/services/api/storyNationApi';
import { ChrbotData } from '@/types/api';
import { useAccountStore } from '@/store/useAccountStore';

// Nakama 컨텍스트 타입 정의
interface NakamaContextType {
  client: Client | null;
  socket: Socket | null;
  session: Session | null;
  isConnected: boolean;
  isConnecting: boolean;
  currentChatMode: number;
  chrBotChatKey: number;
  channelId: string | null;  // 채널 ID 추가
  roomName: string | null;   // 룸 이름 추가
  isInitRoom: boolean;       // 룸 초기화 상태 추가
  charbotData: ChrbotData | null; // 캐릭터 데이터 추가
  
  // 새로운 채팅 메시지 관련 필드
  chatMessages: ChatMessage[]; // 채팅 메시지 배열
  
  // 메서드들
  setSession: (session: Session) => void;
  chatRoomInit: (userKey: string, chatBotId: string, chatMode: number) => Promise<{
    success: boolean;
    channelId?: string;
    roomName?: string;
    error?: string;
  }>;
  connectSocket: (session: Session) => Promise<boolean>;
  disconnectSocket: () => Promise<void>;
  joinChat: (roomId: string, persistence?: boolean, hidden?: boolean) => Promise<any>;
  leaveChat: (channelId: string) => Promise<boolean>;
  sendMessage: (channelId: string, message: string, isMy?: boolean) => Promise<boolean>;
  addChannelMessageListener: (channelId: string, listener: (message: any) => void) => void;
  removeChannelMessageListener: (channelId: string, listener: (message: any) => void) => void;
  addConnectionListener: (listener: () => void) => void;
  removeConnectionListener: (listener: () => void) => void;
  addDisconnectionListener: (listener: (evt: any) => void) => void;
  removeDisconnectionListener: (listener: (evt: any) => void) => void;
  
  // 새로운 채팅 메시지 메서드들
  sendChatMessage: (message: string) => Promise<boolean>; // 메시지 전송
  refreshLastAIMessage: () => Promise<boolean>;           // 마지막 AI 메시지 재생성
  clearChatHistory: () => void;                          // 채팅 기록 초기화
  addChatMessage: (message: ChatMessage) => void;         // 메시지 추가

  updateChatMode: (mode: number) => void;
}

// 채팅 메시지 인터페이스
export interface ChatMessage {
  id: string;
  sender: 'user' | 'character';
  message: string;
  timestamp: Date;
}

// 상태 그룹화를 위한 인터페이스들
interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isInitRoom: boolean;
}

interface ChatRoomState {
  channelId: string | null;
  roomName: string | null;
  chrBotChatKey: number;
  currentChatMode: number;
}

interface ApiState {
  sendPrompt_key: string;
  nsfw: number;
}

// 기본 컨텍스트 값
const defaultContextValue: NakamaContextType = {
  client: null,
  socket: null,
  session: null,
  isConnected: false,
  isConnecting: false,
  currentChatMode: 1,
  chrBotChatKey: 0,
  channelId: null,     // 채널 ID 추가
  roomName: null,      // 룸 이름 추가
  isInitRoom: false,   // 룸 초기화 상태 추가
  charbotData: null,   // 캐릭터 데이터 추가
  chatMessages: [],    // 채팅 메시지 배열
  
  setSession: () => {},
  chatRoomInit: async () => ({ success: false }),
  connectSocket: async () => false,
  disconnectSocket: async () => {},
  joinChat: async () => ({}),
  leaveChat: async () => false,
  sendMessage: async () => false,
  addChannelMessageListener: () => {},
  removeChannelMessageListener: () => {},
  addConnectionListener: () => {},
  removeConnectionListener: () => {},
  addDisconnectionListener: () => {},
  removeDisconnectionListener: () => {},
  
  // 새로운 메시지 메서드들
  sendChatMessage: async () => false,
  refreshLastAIMessage: async () => false,
  clearChatHistory: () => {},
  addChatMessage: () => {},

  updateChatMode: () => {}
};

// Nakama 컨텍스트 생성
const NakamaContext = createContext<NakamaContextType>(defaultContextValue);

interface NakamaProviderProps {
  children: React.ReactNode;
  serverUrl: string;
  serverPort: string;
  serverKey?: string;
  useSSL?: boolean;
  autoConnect?: boolean;
  defaultSession?: Session | null;
  charbotData?: ChrbotData | null; // charbotData 속성 추가
}

// Nakama Provider 컴포넌트
export const NakamaProvider: React.FC<NakamaProviderProps> = ({ 
  children, 
  serverUrl, 
  serverPort, 
  serverKey = 'defaultkey',
  useSSL = true,
  autoConnect = false,
  defaultSession = null,
  charbotData = null, // charbotData 기본값 추가
}) => {
  // 클라이언트 및 세션 상태
  const [client, setClient] = useState<Client | null>(null);
  const [session, setSession] = useState<Session | null>(defaultSession);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // 연결 상태 그룹화
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    isInitRoom: false,
  });
  
  // 채팅방 상태 그룹화
  const [chatRoomState, setChatRoomState] = useState<ChatRoomState>({
    channelId: null,
    roomName: null,
    chrBotChatKey: 0,
    currentChatMode: 1,
  });
  
  // API 관련 상태 그룹화
  const [apiState, setApiState] = useState<ApiState>({
    sendPrompt_key: '',
    nsfw: 0,
  });
  
  // 채팅 메시지 상태
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // 초기화 중인지 확인하는 Ref
  const isInitializingChatRoom = useRef(false);
  
  // 리스너 관리용 Ref
  const channelListenersRef = useRef<Map<string, Set<(message: any) => void>>>(new Map());
  const connectionListenersRef = useRef<Set<() => void>>(new Set());
  const disconnectionListenersRef = useRef<Set<(evt: any) => void>>(new Set());

  const { updateAccountData } = useAccountStore();

  // 상태 업데이트 함수들 - 단일 속성 업데이트를 위한 도우미 함수들
  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    setConnectionState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateChatRoomState = useCallback((updates: Partial<ChatRoomState>) => {
    setChatRoomState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateApiState = useCallback((updates: Partial<ApiState>) => {
    setApiState(prev => ({ ...prev, ...updates }));
  }, []);

  // 채팅방 초기화를 위한 모듈화된 함수들
  const authenticateUser = useCallback(async (
    userKey: string, 
    _client: Client
  ): Promise<Session | null> => {
    const deviceId = `chatbot_jackpot_${userKey}`;
    
    // 이미 유효한 세션이 있는지 확인
    if (session && !session.isexpired(new Date().getTime() / 1000)) {
      console.log('🔑 유효한 세션이 이미 존재함, 인증 과정 스킵');
      return session;
    }
    
    console.log('🔑 새 인증 프로세스 시작');
    try {
      const newSession = await _client.authenticateDevice(deviceId, true, userKey?.toString());
      console.log('🔑 인증 성공');
      return newSession;
    } catch (error) {
      console.error('인증 실패:', error);
      return null;
    }
  }, [session]);
  
  const setupSocket = useCallback(async (
    currentSession: Session, 
    _client: Client
  ): Promise<Socket | null> => {
    // 이미 연결된 소켓이 있는지 확인
    if (socketRef.current && connectionState.isConnected) {
      console.log('🔌 이미 연결된 소켓 재사용');
      return socketRef.current;
    }
    
    console.log('🔌 새 소켓 연결 시작');
    try {
      const newSocket = _client.createSocket(useSSL);
      
      // 소켓 이벤트 리스너 설정
      newSocket.ondisconnect = (evt) => {
        console.log('Nakama 소켓 연결 해제:', evt);
        updateConnectionState({ isConnected: false });
        
        // 연결 해제 리스너 호출
        disconnectionListenersRef.current.forEach(listener => {
          try {
            listener(evt);
          } catch (err) {
            console.error('연결 해제 리스너 오류:', err);
          }
        });
      };
      
      newSocket.onerror = (err) => {
        console.error('Nakama 소켓 오류:', err);
        updateConnectionState({ isConnecting: false });
      };
      
      await newSocket.connect(currentSession, false);
      console.log('🔌 소켓 연결 성공');
      return newSocket;
    } catch (error) {
      console.error('소켓 연결 실패:', error);
      return null;
    }
  }, [connectionState.isConnected, useSSL, updateConnectionState]);
  
  const joinChatRoom = useCallback(async (
    socket: Socket,
    userKey: string,
    chatBotId: string
  ): Promise<{ channelId: string; roomName: string } | null> => {
    const roomName = `chat_${userKey}_${chatBotId}`;
    console.log('💬 채팅방 참여 시도:', roomName);
    
    try {
      const channel = await socket.joinChat(roomName, 1, true, false);
      console.log('💬 채팅방 참여 성공:', channel);
      
      // 채널 객체에서 room_name 가져오기 (타입 캐스팅으로 에러 방지)
      const actualRoomName = (channel as any).room_name || roomName;
      return { channelId: channel.id, roomName: actualRoomName };
    } catch (error) {
      console.error('채팅방 참여 실패:', error);
      return null;
    }
  }, []);
  
  const extractChatKey = useCallback((roomName: string): number => {
    console.log('🔑 채팅 키 추출 시도:', roomName);
    
    // room_name이 없으면 0 반환
    if (!roomName) {
      console.error('❌ 채팅 키 추출 실패: roomName이 없음');
      return 0;
    }
    
    const roomNameStr = String(roomName);
    const split = roomNameStr.split('|') || [];
    console.log('🔑 채팅 키 추출 룸네임 분할:', split);
    
    let chatKey = 0;
    
    if (split.length >= 2) {
      chatKey = parseInt(split[1]);
      console.log('🔑 채팅 키 추출 결과:', chatKey);
    } else {
      console.error('❌ 채팅 키 추출 실패: 분할 결과 부족', split);
    }
    
    return chatKey;
  }, []);
  
  const initializeChat = useCallback(async (
    chatKey: number,
    chatMode: number
  ): Promise<{ promptKey: string; nsfwValue: number } | null> => {
    try {
      const response = await chatApi.OpenChat(chatKey, chatMode, 1);
      
      if (response && response.data.result.err === 0) {
        const promptKey = response.data.prompt_key;
        const nsfwValue = response.data.world_list_detail_chrbot?.nsfw || 0;
        
        console.log('💾 채팅 초기화 성공:', { promptKey, nsfwValue });
        return { promptKey, nsfwValue };
      } else {
        console.error('❌ 채팅 초기화 실패:', response?.data);
        return null;
      }
    } catch (error) {
      console.error('채팅 초기화 API 호출 실패:', error);
      return null;
    }
  }, []);
  
  const fetchMessages = useCallback(async (
    _client: Client,
    currentSession: Session,
    channelId: string
  ): Promise<void> => {
    try {
      let max_count = 50;
      let cursor = '';
      let fetchRetries = 0;
      const maxRetries = 3;

      while(max_count > 0 && fetchRetries < maxRetries) {
        try {
          const result = await _client.listChannelMessages(
            currentSession, channelId, max_count, true, cursor
          );
          
          if (!result || !result.messages) {
            console.warn('⚠️ 메시지 목록이 비어있거나 응답이 없습니다. 재시도 중...');
            fetchRetries++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          console.log(`💬 채팅 메시지 ${result.messages.length}개 수신`);

          // 메시지 처리 로직...
          const processedIds = new Set<string>();

          console.log(result.messages)

          result.messages.forEach((message) => {
            const messageContent = message.content as any;
            const senderId = message.sender_id || 
              `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const createTime = message.create_time ? 
              new Date(message.create_time) : new Date();
            
            // if (processedIds.has(senderId)) {
            //   console.log('⚠️ 중복 ID 감지, 메시지 건너뜀:', senderId);
            //   return;
            // }
            
            processedIds.add(senderId);
            
            addChatMessage({
              id: senderId,
              sender: messageContent?.type === 'user' ? 'user' : 'character',
              message: messageContent?.content || '',
              timestamp: createTime
            });
          });

          cursor = result.next_cursor || '';
          
          if (result.messages.length < max_count) {
            max_count = -1; // 모든 메시지를 가져왔으므로 루프 종료
          } else {
            max_count = 50;
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error("⚠️ 메시지 조회 중 오류:", error);
          fetchRetries++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error("❌ 메시지 목록 조회 실패:", error);
    }
  }, []);
  
  // 메인 채팅방 초기화 함수 리팩토링
  const chatRoomInit = useCallback(async (
    userKey: string, 
    chatBotId: string, 
    chatMode: number
  ): Promise<{
    success: boolean;
    channelId?: string;
    roomName?: string;
    error?: string;
  }> => {
    // 이미 초기화 중이면 중복 호출 방지
    if (isInitializingChatRoom.current) {
      console.log('🚫 이미 채팅방 초기화 중입니다');
      return { success: false, error: 'ALREADY_INITIALIZING' };
    }
    
    // 이미 초기화된 경우, 기존 정보 반환
    if (connectionState.isInitRoom && chatRoomState.channelId && chatRoomState.roomName) {
      console.log('✅ 채팅방이 이미 초기화되어 있습니다. 기존 정보 반환:', {
        channelId: chatRoomState.channelId,
        roomName: chatRoomState.roomName
      });
      
      return {
        success: true,
        channelId: chatRoomState.channelId,
        roomName: chatRoomState.roomName
      };
    }
    
    console.log('🚀 채팅방 초기화 프로세스 시작:', {
      userKey, 
      chatBotId, 
      chatMode,
      isInitRoom: connectionState.isInitRoom,
      currentChannelId: chatRoomState.channelId
    });
    
    isInitializingChatRoom.current = true;
    
    try {
      // 단계 1: 클라이언트 확인
      const _client = client || await createClient();
      if (!_client) {
        throw new Error('클라이언트 생성 실패');
      }
      
      // 단계 2: 사용자 인증
      const currentSession = await authenticateUser(userKey, _client);
      if (!currentSession) {
        throw new Error('인증 실패');
      }
      
      // 로컬 변수로 세션 설정 (React 상태 업데이트에 의존하지 않음)
      setSession(currentSession);
      
      // 단계 3: 소켓 설정
      const newSocket = await setupSocket(currentSession, _client);
      if (!newSocket) {
        throw new Error('소켓 연결 실패');
      }
      
      // 소켓 참조 및 상태 업데이트
      socketRef.current = newSocket;
      setSocket(newSocket);
      updateConnectionState({ isConnecting: true });
      
      // 단계 4: 채팅방 참여
      const roomData = await joinChatRoom(newSocket, userKey, chatBotId);
      if (!roomData) {
        throw new Error('채팅방 참여 실패');
      }
      
      const { channelId, roomName } = roomData;
      
      // 채널ID와 룸네임 로깅
      console.log('📝 채팅방 정보:', {
        channelId,
        roomName
      });
      
      updateChatRoomState({ 
        channelId, 
        roomName,
        currentChatMode: chatMode
      });
      
      // 단계 5: 채팅 키 추출 - roomName에서 직접 추출
      const chatKey = extractChatKey(roomName);
      if (chatKey === 0) {
        console.warn('⚠️ 채팅 키 추출 실패, 기본값 0 사용');
      }
      updateChatRoomState({ chrBotChatKey: chatKey });
      
      // 단계 6: 채팅 초기화
      const chatInitData = await initializeChat(chatKey, chatMode);
      if (!chatInitData) {
        throw new Error('채팅 초기화 API 호출 실패');
      }
      
      const { promptKey, nsfwValue } = chatInitData;
      updateApiState({ 
        sendPrompt_key: promptKey,
        nsfw: nsfwValue
      });
      
      // 단계 7: 연결 상태 업데이트
      updateConnectionState({
        isConnected: true,
        isConnecting: false,
        isInitRoom: true
      });
      
      // 단계 8: 메시지 목록 가져오기
      await fetchMessages(_client, currentSession, channelId);
      
      console.log('✅ 채팅방 초기화 완료: ', {
        success: true,
        channelId,
        roomName,
        chatKey
      });
      
      return {
        success: true,
        channelId,
        roomName
      };
    } catch (error: any) {
      console.error('❌ 채팅방 초기화 중 오류 발생:', error);
      updateConnectionState({
        isConnecting: false,
        isConnected: false,
        isInitRoom: false
      });
      return { success: false, error: error.message || '알 수 없는 오류' };
    } finally {
      isInitializingChatRoom.current = false;
    }
  }, [
    client, 
    connectionState.isInitRoom, 
    chatRoomState, 
    authenticateUser, 
    setupSocket, 
    joinChatRoom, 
    extractChatKey, 
    initializeChat, 
    fetchMessages,
    updateConnectionState,
    updateChatRoomState,
    updateApiState
  ]);

  // 클라이언트 초기화
  useEffect(() => {
    const nakamaClient = new Client(serverKey, serverUrl, serverPort, useSSL);
    setClient(nakamaClient);
    
    // 컴포넌트 언마운트 시 소켓 정리
    return () => {
      // 소켓 연결 해제 함수 호출
      if (socketRef.current) {
        socketRef.current.disconnect(true);
        socketRef.current = null;
        setSocket(null);
        updateConnectionState({ 
          isConnected: false,
          isInitRoom: false
        });
      }
    };
  }, [serverUrl, serverPort, serverKey, useSSL, updateConnectionState]);

  // 리스너 알림 도우미 함수들
  const notifyConnectionListeners = useCallback(() => {
    connectionListenersRef.current.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('연결 리스너 오류:', err);
      }
    });
  }, []);

  const notifyDisconnectionListeners = useCallback((evt: any) => {
    disconnectionListenersRef.current.forEach((listener) => {
      try {
        listener(evt);
      } catch (err) {
        console.error('연결 해제 리스너 오류:', err);
      }
    });
  }, []);

  // 소켓 연결 해제 함수
  const disconnectSocket = useCallback(async (): Promise<void> => {
    try {
      if (socketRef.current) {
        await socketRef.current.disconnect(true);
        socketRef.current = null;
        setSocket(null);
        updateConnectionState({ 
          isConnected: false,
          isInitRoom: false
        });
        console.log('소켓 연결이 성공적으로 해제되었습니다.');
      }
    } catch (error) {
      console.error('소켓 연결 해제 중 오류:', error);
    }
  }, [updateConnectionState]);

  // 자동 재연결 로직 수정 - 무한 루프 방지
  useEffect(() => {
    // 소켓이 null이고, 세션이 있고, 이미 연결 중이 아닐 때만 재연결 시도
    if (session && !connectionState.isConnected && !connectionState.isConnecting && client && !socketRef.current) {
      let isMounted = true; // 컴포넌트 마운트 상태 추적
      
      const attemptReconnect = async () => {
        // 이미 연결 시도 중이거나 컴포넌트가 언마운트되었으면 무시
        if (connectionState.isConnecting || !isMounted) return;
        
        console.log('🔄 자동 재연결 시도 중...');
        updateConnectionState({ isConnecting: true });
        
        try {
          // 클라이언트로 접근
          if (!client) {
            console.error('클라이언트가 없어 재연결할 수 없습니다.');
            if (isMounted) updateConnectionState({ isConnecting: false });
            return;
          }

          // 새 소켓 생성
          const newSocket = client.createSocket(useSSL);
          socketRef.current = newSocket;
          
          // 소켓 이벤트 리스너 설정
          newSocket.ondisconnect = (evt) => {
            console.log('Nakama 소켓 연결 해제:', evt);
            if (isMounted) updateConnectionState({ isConnected: false });
            
            // 연결 해제 리스너 호출
            disconnectionListenersRef.current.forEach(listener => {
              try {
                listener(evt);
              } catch (err) {
                console.error('연결 해제 리스너 오류:', err);
              }
            });
          };
          
          newSocket.onerror = (err) => {
            console.error('Nakama 소켓 오류:', err);
            if (isMounted) updateConnectionState({ isConnecting: false });
          };
          
          // 소켓 연결
          await newSocket.connect(session, true);
          if (isMounted) {
            setSocket(newSocket);
            updateConnectionState({ isConnected: true });
            updateConnectionState({ isConnecting: false });
          }
          console.log('🔌 소켓 재연결 성공!');
        } catch (error) {
          console.error('재연결 중 오류 발생:', error);
          if (isMounted) {
            updateConnectionState({ isConnecting: false });
            socketRef.current = null; // 연결 실패 시 참조 초기화
          }
        }
      };
      
      // 3초 후 재연결 시도 (즉시 시도하지 않고 약간의 딜레이 후 시도)
      const timeoutId = setTimeout(attemptReconnect, 3000);
      
      return () => {
        isMounted = false; // 컴포넌트 언마운트 시 상태 업데이트 방지
        clearTimeout(timeoutId);
      };
    }
  }, [session, connectionState.isConnected, connectionState.isConnecting, client, useSSL, updateConnectionState]);

  // 클라이언트 생성 함수
  const createClient = async (): Promise<Client> => {
    const nakamaClient = new Client(serverKey, serverUrl, serverPort, useSSL);
    setClient(nakamaClient);
    return nakamaClient;
  };

  // 메시지 내부 처리 함수
  const handleMessage = useCallback((message: any) => {
    try {
      // 메시지 객체 유효성 확인
      if (!message || typeof message !== 'object') {
        console.error('유효하지 않은 메시지 형식:', message);
        return;
      }

      console.log('✉️ 메시지 수신:', message);
      
      // 메시지 내용 파싱
      let contentObj;
      try {
        if (typeof message.content === 'string') {
          contentObj = JSON.parse(message.content);
        } else if (typeof message.content === 'object') {
          contentObj = message.content;
        } else {
          console.error('메시지 내용이 문자열이나 객체가 아님');
          return;
        }
      } catch (parseError) {
        console.error('메시지 파싱 실패:', parseError);
        return;
      }
      
      // content와 type만 있는지 확인
      if (!contentObj || !contentObj.content || !contentObj.type) {
        console.error('메시지 형식이 올바르지 않음:', contentObj);
        return;
      }
      
      // type이 user나 ai가 아닌 경우 무시
      if (contentObj.type !== 'user' && contentObj.type !== 'ai') {
        console.error('지원하지 않는 메시지 타입:', contentObj.type);
        return;
      }
      
      // 메시지 ID 확인
      const messageId = message.message_id || Date.now().toString();
      
      // 생성 시간 확인
      let timestamp;
      try {
        timestamp = message.create_time ? new Date(message.create_time * 1000) : new Date();
      } catch (timeError) {
        console.warn('타임스탬프 변환 오류:', timeError);
        timestamp = new Date();
      }
      
      // 메시지 객체 생성
      const newMessage: ChatMessage = {
        id: messageId,
        sender: contentObj.type === 'user' ? 'user' : 'character',
        message: contentObj.content,
        timestamp: timestamp
      };
      
      console.log('✉️ 채팅 히스토리에 추가될 메시지:', newMessage);
      
      // 채팅 메시지 배열에 추가
      setChatMessages(prev => {
        // 임시 메시지 대체 로직 (사용자가 보낸 메시지인 경우)
        if (contentObj.type === 'user') {
          const tempMessage = prev.find(msg => 
            msg.sender === 'user' && 
            msg.message === contentObj.content && 
            msg.id.startsWith('temp_')
          );
          
          if (tempMessage) {
            console.log('✅ 임시 메시지를 실제 메시지로 대체:', tempMessage.id, '->', messageId);
            return prev.map(msg => 
              msg.id === tempMessage.id ? newMessage : msg
            );
          }
        }
        
        // 중복 메시지 방지
        const isDuplicate = prev.some(msg => msg.id === messageId);
        if (isDuplicate) {
          console.log('⚠️ 중복 메시지 무시:', messageId);
          return prev;
        }
        
        // 기존 메시지에 추가
        const newMessages = [...prev, newMessage];
        console.log(`✅ 메시지 추가됨 (총 ${newMessages.length}개)`, { 
          메시지ID: newMessage.id, 
          보낸사람: newMessage.sender
        });
        return newMessages;
      });
      
      // 기존 리스너에게도 메시지 전달
      const messageChannelId = message.channel_id;
      if (channelListenersRef.current.has(messageChannelId)) {
        const listeners = channelListenersRef.current.get(messageChannelId);
        listeners?.forEach(listener => {
          try {
            listener(message);
          } catch (err) {
            console.error('채널 메시지 리스너 오류:', err);
          }
        });
      }
    } catch (error) {
      console.error('메시지 내부 처리 중 오류:', error);
    }
  }, []);

  // 메시지 전송 함수
  const sendMessage = async (channelId: string, message: string, isMy: boolean = true): Promise<boolean> => {
    if (!socketRef.current) {
      console.error('소켓 참조가 없습니다.');
      throw new Error('소켓이 초기화되지 않았습니다');
    }

    try {
      // 단순화된 메시지 형식 - content와 type만 포함
      const content = { 
        content: message, 
        type: isMy ? 'user' : 'ai' 
      };
      await socketRef.current.writeChatMessage(channelId, content);
      return true;
    } catch (error) {
      console.error('Nakama 메시지 전송 실패:', error);
      throw error;
    }
  };

  // 채널 메시지 리스너 설정
  useEffect(() => {
    if (!socketRef.current) return;
    
    // 이전 메시지 핸들러 저장
    const prevHandler = socketRef.current.onchannelmessage;
    
    // 메시지 핸들러 설정
    socketRef.current.onchannelmessage = async (message) => {
      try {
        console.log('📨 소켓 메시지 수신:', { 
          channel_id: message.channel_id,
          message_id: message.message_id,
          content_type: typeof message.content
        });
        
        // 내부 메시지 처리 함수 호출하여 UI에 메시지 표시
        handleMessage(message);
        
        // 메시지 내용 파싱
        let contentObj;
        try {
          if (typeof message.content === 'string') {
            contentObj = JSON.parse(message.content);
          } else if (typeof message.content === 'object') {
            contentObj = message.content;
          } else {
            console.log('⚠️ 메시지 내용이 문자열이나 객체가 아님, API 호출 중단');
            return;
          }
        } catch (parseError) {
          console.error('메시지 파싱 실패, API 호출 중단:', parseError);
          return;
        }
        
        // contentObj가 null이나 undefined가 아닌지 확인
        if (!contentObj || !contentObj.content || !contentObj.type) {
          console.log('⚠️ 파싱된 콘텐츠 객체가 없거나 유효하지 않음, API 호출 중단');
          return;
        }
        
        // type이 user 또는 ai만 허용
        if (contentObj.type !== 'user' && contentObj.type !== 'ai') {
          console.log('⚠️ 지원하지 않는 메시지 타입:', contentObj.type);
          return;
        }
        
        console.log('📨 파싱된 메시지 타입:', contentObj.type);
        
        // 메시지 내용이 파싱되면 처리
        if (contentObj.type === 'user') {
          const channelId = message.channel_id;
          if (!channelId) {
            console.log('⚠️ 채널 ID가 없어 API 호출 중단');
            return;
          }
          
          // 자신이 보낸 메시지라도 응답은 처리
          const promptKey = apiState.sendPrompt_key || '';
          console.log('👤 사용자 메시지 수신, SendChat API 호출:', {
            content: contentObj.content,
            channel: channelId,
            chatKey: chatRoomState.chrBotChatKey,
            promptKey: promptKey,
            chatMode: chatRoomState.currentChatMode,
            nsfw: apiState.nsfw
          });
          
          // 저장된 채팅 키 사용
          if (chatRoomState.chrBotChatKey) {
            
            try {
              // 저장된 채팅 모드 사용
              const response = await chatApi.SendChat(
                chatRoomState.currentChatMode,
                apiState.nsfw,
                promptKey,
                chatRoomState.chrBotChatKey,
                false // stream 설정
              );
              console.log('🤖 AI 응답 수신:', response);
              
              // 응답 상태 확인
              if (response && response.data && response.data.result && response.data.result.err === 0) {
                // AI의 응답을 다시 채널에 전송
                const chatMessageResponse = response.data;

                // 코인 차감
                const coinResponse = await chatApi.UseChat(
                  chatRoomState.chrBotChatKey,
                  chatRoomState.currentChatMode,
                )

                if (coinResponse && coinResponse?.data && coinResponse?.data.result?.err === 0) {  
                  console.log('💰 코인 차감 성공:', coinResponse.data);
                  
                  updateAccountData(
                    coinResponse.data.coin_free,
                    coinResponse.data.coin_free_dt,
                    coinResponse.data.coin_register,
                    coinResponse.data.coin
                  );
                } else {
                  console.error('💰 코인 차감 실패:', coinResponse?.data);
                }

                if (socketRef.current) {
                  try {
                    // 응답 JSON 파싱 및 content 추출
                    const responseObj = JSON.parse(chatMessageResponse.response);

                    let messageContent = '';
                    
                    // Gemini AI 모델 응답인지 확인 (candidates 속성 존재)
                    if (responseObj.candidates) {
                      // Gemini AI 모델 응답 형식
                      messageContent = responseObj.candidates[0]?.content?.parts[0]?.text;
                    } else if (responseObj.content) {
                      // 다른 AI 모델 응답 형식
                      messageContent = responseObj.content[0].text;
                    } else {
                      console.error('알 수 없는 AI 응답 형식:', responseObj);
                      messageContent = "응답 형식이 잘못되었습니다. 다시 시도해주세요.";
                    }
                    
                    console.log('🤖 AI 응답 내용 (채널로 전송 중):', messageContent);
                    
                    // 단순화된 메시지 형식 - content와 type만 포함
                    const content = { 
                      content: messageContent, 
                      type: 'ai' 
                    };
                    
                    // AI 응답을 채널에 전송
                    await socketRef.current.writeChatMessage(channelId, content);
                    console.log('✅ AI 응답 채널 전송 완료');
                  } catch (parseError) {
                    console.error('AI 응답 파싱 오류:', parseError);
                    // 파싱 오류 시 원본 응답 전송
                    // 단순화된 메시지 형식
                    const content = { 
                      content: "응답 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 
                      type: 'ai' 
                    };
                    await socketRef.current.writeChatMessage(channelId, content);
                  }
                }
              } else {
                console.error('AI 응답 오류:', response?.data);
                // 오류 발생 시 사용자에게 알림
                if (socketRef.current) {
                  const errorContent = {
                    content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.',
                    type: 'ai'
                  };
                  await socketRef.current.writeChatMessage(channelId, errorContent);
                }
              }
            } catch (error) {
              console.error('SendChat API 호출 또는 응답 전송 오류:', error);
              // 오류 발생 시 클라이언트에게 오류 메시지 전송
              try {
                if (socketRef.current) {
                  const errorContent = {
                    content: '메시지 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
                    type: 'ai'
                  };
                  await socketRef.current.writeChatMessage(channelId, errorContent);
                }
              } catch (sendError) {
                console.error('오류 메시지 전송 실패:', sendError);
              }
            }
          } else {
            console.error('chrBotChatKey가 없습니다. API 호출 불가능.');
          }
        } else if (contentObj.type === 'ai') {
          // AI 메시지는 handleMessage에서 이미 처리됨
          console.log('🤖 AI 메시지 수신: 이미 처리됨', contentObj.content.substring(0, 50) + '...');
        }
      } catch (error) {
        console.error('채널 메시지 수신 중 오류:', error);
      }
    };
    
    return () => {
      // 컴포넌트 언마운트 시 리스너 복원
      if (socketRef.current) {
        socketRef.current.onchannelmessage = prevHandler;
      }
    };
  }, [socketRef.current, handleMessage, chatRoomState.currentChatMode, chatRoomState.chrBotChatKey, apiState.sendPrompt_key, apiState.nsfw]);

  // 메시지 전송 함수 (캡슐화)
  const sendChatMessage = async (messageText: string): Promise<boolean> => {
    console.log('sendChatMessage 호출됨 :: ', messageText);

    try {
      if (!chatRoomState.channelId) {
        throw new Error('채널 ID가 없습니다.');
      }

      if (!socketRef.current) {
        throw new Error('소켓이 초기화되지 않았습니다.');
      }
      
      // 고유한 임시 ID 생성
      const tempMessageId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // UI에 사용자 메시지 즉시 표시
      const userMessage: ChatMessage = {
        id: tempMessageId,
        sender: 'user',
        message: messageText,
        timestamp: new Date(),
      };
      
      console.log('📤 메시지 전송 준비:', {
        tempId: tempMessageId,
        content: messageText,
        channelId: chatRoomState.channelId
      });
      
      // 임시 메시지 저장
      setChatMessages(prev => [...prev, userMessage]);
      
      // 소켓을 통해 메시지 전송
      console.log('Nakama 메시지 전송 중...');
      // 단순화된 메시지 형식 - content와 type만 포함
      const content = { 
        content: messageText, 
        type: 'user' 
      };
      await socketRef.current.writeChatMessage(chatRoomState.channelId, content);
      console.log('✅ 메시지 전송 완료');
      
      return true;
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
      
      // 오류 메시지 표시
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: 'character',
        message: '메시지 전송에 실패했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      return false;
    }
  };

  // 마지막 AI 메시지 새로고침 함수
  const refreshLastAIMessage = async (): Promise<boolean> => {
    if (!connectionState.isConnected) {
      console.error('Nakama 서버에 연결되어 있지 않습니다.');
      throw new Error('채팅 서버에 연결되어 있지 않습니다.');
    }

    if (!chatRoomState.channelId) {
      console.error('채널 ID가 없습니다.');
      throw new Error('채팅 채널에 연결할 수 없습니다.');
    }
    
    if (!socketRef.current) {
      console.error('소켓 참조가 없습니다.');
      throw new Error('채팅 서버에 연결되어 있지 않습니다.');
    }
    
    // 마지막 AI 메시지 찾기
    const lastAIMessageIndex = [...chatMessages].reverse().findIndex(msg => msg.sender === 'character');

    if (lastAIMessageIndex === -1) {
      console.log('새로고침할 AI 메시지가 없습니다.');
      return false;
    }

    const actualIndex = chatMessages.length - 1 - lastAIMessageIndex;
    const lastMessage = chatMessages[actualIndex];

    try {
      if (!chatRoomState.chrBotChatKey) {
        console.error('chrBotChatKey가 없습니다:', chatRoomState.chrBotChatKey);
        throw new Error('채팅 데이터를 찾을 수 없습니다.');
      }

      // 마지막으로 받은 사용자 메시지 찾기
      const lastUserMessage = [...chatMessages].slice(0, actualIndex).reverse()
        .find(msg => msg.sender === 'user')?.message;

      if (!lastUserMessage) {
        console.error('새로고침할 사용자 메시지를 찾을 수 없습니다.');
        throw new Error('새로고침할 대화를 찾을 수 없습니다.');
      }

      console.log('메시지 새로고침 시도:', {
        chatMode: chatRoomState.currentChatMode,
        userMessage: lastUserMessage,
        chrBotChatKey: chatRoomState.chrBotChatKey
      });

      // API 호출하여 새로운 응답 생성
      const promptKey = apiState.sendPrompt_key || '';
      const response = await chatApi.SendChat(
        chatRoomState.currentChatMode,
        apiState.nsfw,
        promptKey,
        chatRoomState.chrBotChatKey,
        false // stream 설정
      );

      if (!response || !response.data) {
        console.error('API 응답이 없습니다:', response);
        throw new Error('서버 응답이 없습니다.');
      }

      console.log('새로운 AI 응답 받음:', response.data);

      // 응답 상태 확인
      if (!response.success || !response.data.result || response.data.result.err !== 0) {
        console.error('API 응답 오류:', response.data);
        throw new Error(response.data.result?.msg || '서버 응답 오류가 발생했습니다.');
      }

      // Nakama를 통해 AI 응답 전송
      try {
        // 응답 JSON 파싱 및 content 추출
        const responseObj = JSON.parse(response.data.response);
        let messageContent = '';
        
        // Gemini AI 모델 응답인지 확인 (candidates 속성 존재)
        if (responseObj.candidates) {
          // Gemini AI 모델 응답 형식
          messageContent = responseObj.candidates[0]?.content?.parts[0]?.text;
          console.log('🤖 Gemini AI 응답 감지');
        } else if (responseObj.content) {
          // 다른 AI 모델 응답 형식
          messageContent = responseObj.content[0].text;
          console.log('🤖 일반 AI 응답 감지');
        } else {
          console.error('알 수 없는 AI 응답 형식:', responseObj);
          messageContent = "응답 형식이 잘못되었습니다. 다시 시도해주세요.";
        }
        
        console.log('🤖 AI 응답 내용 (채널로 전송 중):', messageContent);
        
        // 단순화된 메시지 형식 - content와 type만 포함
        const content = { 
          content: messageContent, 
          type: 'ai' 
        };
        
        await socketRef.current.writeChatMessage(chatRoomState.channelId, content);
      } catch (parseError) {
        console.error('AI 응답 파싱 오류:', parseError);
        // 파싱 오류 시 기본 오류 메시지 전송
        const content = { 
          content: "응답을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.", 
          type: 'ai' 
        };
        await socketRef.current.writeChatMessage(chatRoomState.channelId, content);
      }
      console.log('새로운 메시지 전송 완료');
      
      // UI에서 기존 메시지 제거
      setChatMessages(prev => prev.filter(msg => msg.id !== lastMessage.id));
      
      return true;
    } catch (error) {
      console.error('메시지 새로고침 중 오류:', error);
      
      // 오류 메시지 표시
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'character',
        message: '메시지 새로고침에 실패했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      return false;
    }
  };

  // clearChatHistory 함수 재구현 - 메시지 보존 및 규칙 검사
  const clearChatHistory = (): void => {
    setChatMessages(prevMessages => {
      // 메시지가 없으면 빈 배열 반환
      if (prevMessages.length === 0) return [];
      
      // 대화 규칙 확인: user와 character가 번갈아 나타나야 함
      const cleanedMessages = prevMessages.reduce((result, currentMsg, index) => {
        // 첫 메시지는 항상 포함
        if (index === 0) {
          return [currentMsg];
        }
        
        const prevMsg = result[result.length - 1];
        
        // 같은 발신자의 연속된 메시지인 경우, 가장 최근 메시지만 유지
        if (prevMsg.sender === currentMsg.sender) {
          // 마지막 메시지를 최신 메시지로 교체
          return [...result.slice(0, -1), currentMsg];
        }
        
        // 규칙이 유지되는 메시지는 추가
        return [...result, currentMsg];
      }, [] as ChatMessage[]);
      
      console.log(`🧹 메시지 정리: ${prevMessages.length}개 → ${cleanedMessages.length}개`);
      return cleanedMessages;
    });
  };

  // 메시지 직접 추가
  const addChatMessage = (message: ChatMessage): void => {
    setChatMessages(prev => {
      // 이미 같은 ID의 메시지가 있는지 확인
      // const isDuplicate = prev.some(msg => msg.id === message.id);
      // if (isDuplicate) {
      //   console.log('⚠️ 중복 메시지 무시 (addChatMessage):', message.id);
      //   return prev;
      // }
      
      // 고유 ID 메시지만 추가
      return [...prev, message];
    });
  };

  const updateChatMode = (mode: number) => {
    updateChatRoomState({ currentChatMode: mode });
    console.log('🔄 채팅 모드 업데이트:', mode);
  };

  // 소켓 연결 함수
  const connectSocket = useCallback(async (currentSession: Session): Promise<boolean> => {
    try {
      if (!client) {
        console.error('클라이언트가 없어 소켓을 연결할 수 없습니다.');
        return false;
      }

      if (socketRef.current && connectionState.isConnected) {
        console.log('이미 연결된 소켓이 있습니다.');
        return true;
      }

      updateConnectionState({ isConnecting: true });
      
      const newSocket = client.createSocket(useSSL);
      socketRef.current = newSocket;
      
      // 소켓 이벤트 리스너 설정
      newSocket.ondisconnect = (evt) => {
        console.log('Nakama 소켓 연결 해제:', evt);
        updateConnectionState({ isConnected: false });
        
        // 연결 해제 리스너 호출
        disconnectionListenersRef.current.forEach(listener => {
          try {
            listener(evt);
          } catch (err) {
            console.error('연결 해제 리스너 오류:', err);
          }
        });
      };
      
      newSocket.onerror = (err) => {
        console.error('Nakama 소켓 오류:', err);
        updateConnectionState({ isConnecting: false });
      };
      
      await newSocket.connect(currentSession, false);
      setSocket(newSocket);
      updateConnectionState({ 
        isConnected: true,
        isConnecting: false 
      });
      
      // 연결 리스너 호출
      connectionListenersRef.current.forEach(listener => {
        try {
          listener();
        } catch (err) {
          console.error('연결 리스너 오류:', err);
        }
      });
      
      return true;
    } catch (error) {
      console.error('소켓 연결 실패:', error);
      updateConnectionState({ isConnecting: false });
      return false;
    }
  }, [client, connectionState.isConnected, useSSL, updateConnectionState]);

  // 채팅방 참여 함수
  const joinChat = useCallback(async (
    roomId: string, 
    persistence: boolean = true, 
    hidden: boolean = false
  ): Promise<any> => {
    try {
      if (!socketRef.current) {
        throw new Error('소켓이 초기화되지 않았습니다.');
      }
      
      console.log(`채팅방 참여: ${roomId} (persistence=${persistence}, hidden=${hidden})`);
      const response = await socketRef.current.joinChat(roomId, persistence ? 1 : 0, hidden, false);
      return response;
    } catch (error) {
      console.error('채팅방 참여 실패:', error);
      throw error;
    }
  }, []);

  // 채팅방 나가기 함수
  const leaveChat = useCallback(async (channelId: string): Promise<boolean> => {
    try {
      if (!socketRef.current) {
        console.error('소켓이 초기화되지 않았습니다.');
        return false;
      }
      
      console.log(`채팅방 나가기: ${channelId}`);
      await socketRef.current.leaveChat(channelId);
      
      // 채팅방 상태 초기화
      updateChatRoomState({
        channelId: null,
        roomName: null
      });
      
      updateConnectionState({
        isInitRoom: false
      });
      
      return true;
    } catch (error) {
      console.error('채팅방 나가기 실패:', error);
      return false;
    }
  }, [updateChatRoomState, updateConnectionState]);

  // 채널 메시지 리스너 관리 함수들
  const addChannelMessageListener = useCallback((channelId: string, listener: (message: any) => void): void => {
    if (!channelListenersRef.current.has(channelId)) {
      channelListenersRef.current.set(channelId, new Set());
    }
    
    const listeners = channelListenersRef.current.get(channelId);
    listeners?.add(listener);
    console.log(`채널 메시지 리스너 추가: ${channelId}`);
  }, []);

  const removeChannelMessageListener = useCallback((channelId: string, listener: (message: any) => void): void => {
    if (!channelListenersRef.current.has(channelId)) {
      return;
    }
    
    const listeners = channelListenersRef.current.get(channelId);
    listeners?.delete(listener);
    console.log(`채널 메시지 리스너 제거: ${channelId}`);
  }, []);

  // 연결 리스너 관리 함수들
  const addConnectionListener = useCallback((listener: () => void): void => {
    connectionListenersRef.current.add(listener);
    console.log('연결 리스너 추가');
  }, []);

  const removeConnectionListener = useCallback((listener: () => void): void => {
    connectionListenersRef.current.delete(listener);
    console.log('연결 리스너 제거');
  }, []);

  // 연결 해제 리스너 관리 함수들
  const addDisconnectionListener = useCallback((listener: (evt: any) => void): void => {
    disconnectionListenersRef.current.add(listener);
    console.log('연결 해제 리스너 추가');
  }, []);

  const removeDisconnectionListener = useCallback((listener: (evt: any) => void): void => {
    disconnectionListenersRef.current.delete(listener);
    console.log('연결 해제 리스너 제거');
  }, []);

  // 먼저 useMemo로 chatContextValue 객체 생성
  const contextValue: NakamaContextType = {
    client, 
    socket: socketRef.current,
    session,
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    currentChatMode: chatRoomState.currentChatMode,
    chrBotChatKey: chatRoomState.chrBotChatKey,
    channelId: chatRoomState.channelId,
    roomName: chatRoomState.roomName,
    isInitRoom: connectionState.isInitRoom,
    charbotData,
    chatMessages,
    
    // 메서드들
    setSession,
    chatRoomInit,
    
    // 필수 메서드들은 임시 구현하고 나중에 적절히 구현
    connectSocket,
    disconnectSocket,
    joinChat,
    leaveChat,
    sendMessage,
    addChannelMessageListener,
    removeChannelMessageListener,
    addConnectionListener,
    removeConnectionListener,
    addDisconnectionListener,
    removeDisconnectionListener,
    
    // 새로운 메시지 메서드들
    sendChatMessage,
    refreshLastAIMessage,
    clearChatHistory,
    addChatMessage,
    updateChatMode
  };

  // Provider 컴포넌트 간소화
  return (
    <NakamaContext.Provider value={contextValue}>
      {children}
    </NakamaContext.Provider>
  );
};

// Nakama 컨텍스트 훅
export const useNakama = (): NakamaContextType => {
  const context = useContext(NakamaContext);
  if (!context) {
    throw new Error('useNakama must be used within a NakamaProvider');
  }
  return context;
};