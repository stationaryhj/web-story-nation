// @ts-nocheck
// NakamaContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { chatApi } from '@/services/api/storyNationApi';
import { ChatMessageResponse } from '@/types/api';

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
  
  // 새로운 채팅 메시지 관련 필드
  chatMessages: ChatMessage[]; // 채팅 메시지 배열
  
  // 메서드들
  setSession: (session: Session) => void;
  chatRoomInit: (userKey: string, chatBotId: string, chatMode: number) => Promise<{
    success: boolean;
    channelId?: string;
    roomName?: string;
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
}

// 채팅 메시지 인터페이스
export interface ChatMessage {
  id: string;
  sender: 'user' | 'character';
  message: string;
  timestamp: Date;
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
  chatMessages: [],    // 채팅 메시지 배열 추가
  
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
  addChatMessage: () => {}
};

// Nakama 컨텍스트 생성
const NakamaContext = createContext<NakamaContextType>(defaultContextValue);

interface NakamaProviderProps {
  children: React.ReactNode;
  serverUrl: string;
  serverPort: number;
  serverKey?: string;
  useSSL?: boolean;
  autoConnect?: boolean;
  defaultSession?: Session | null;
}

// Nakama Provider 컴포넌트
export const NakamaProvider: React.FC<NakamaProviderProps> = ({ 
  children, 
  serverUrl, 
  serverPort, 
  serverKey = 'defaultkey',
  useSSL = true,
  autoConnect = false,
  defaultSession = null
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<Session | null>(defaultSession);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [currentChatMode, setCurrentChatMode] = useState<number>(1);
  const [chrBotChatKey, setChrBotChatKey] = useState<number>(0);
  const [channelId, setChannelId] = useState<string | null>(null);  // 채널 ID 상태 추가
  const [roomName, setRoomName] = useState<string | null>(null);    // 룸 이름 상태 추가
  const [isInitRoom, setIsInitRoom] = useState<boolean>(false);     // 룸 초기화 상태 추가
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // 채팅 메시지 상태 추가
  const [sendPrompt_key, setSendPrompt_key] = useState<string>('');
  const [nsfw, setNsfw] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);
  const channelListenersRef = useRef<Map<string, Set<(message: any) => void>>>(new Map());
  const connectionListenersRef = useRef<Set<() => void>>(new Set());
  const disconnectionListenersRef = useRef<Set<(evt: any) => void>>(new Set());

  // 클라이언트 초기화
  useEffect(() => {
    const nakamaClient = new Client(serverKey, serverUrl, serverPort, useSSL);
    setClient(nakamaClient);
    
    // 컴포넌트 언마운트 시 소켓 정리
    return () => {
      disconnectSocket();
    };
  }, [serverUrl, serverPort, serverKey, useSSL]);


  useEffect(() => {
    console.log('🔌 연결 상태 변화 감지 => isConnected:', isConnected, 'isConnecting:', isConnecting);
  }, [isConnected, isConnecting])

  useEffect(() => {
    console.log('🔌 세션 변화 감지 => session:', session, 'socketRef.current:', socketRef.current); 
  }, [session, socketRef.current])

  // 자동 재연결 로직
  useEffect(() => {
    // 세션이 있고 소켓이 연결되지 않은 상태라면 재연결 시도
    if (session && !isConnected && !isConnecting && socketRef.current) {
      const attemptReconnect = async () => {
        // 이미 연결 시도 중이면 무시
        if (isConnecting) return;
        
        console.log('🔄 자동 재연결 시도 중...');
        setIsConnecting(true);
        
        try {
          // connectSocket 함수를 의존성 배열에서 제거하고 직접 client로 접근
          if (!client) {
            console.error('클라이언트가 없어 재연결할 수 없습니다.');
            setIsConnecting(false);
            return;
          }
          
          // 이미 연결된 상태라면 재연결하지 않음
          if (socketRef.current) {
            setSocket(socketRef.current);
            setIsConnected(true);
            setIsConnecting(false);
            return;
          }
          
          // 새 소켓 생성
          const newSocket = client.createSocket(useSSL);
          socketRef.current = newSocket;
          
          // 소켓 이벤트 리스너 설정
          newSocket.onconnect = () => {
            console.log('Nakama 소켓 재연결 성공');
            setIsConnected(true);
            setIsConnecting(false);
            notifyConnectionListeners();
          };
          
          newSocket.ondisconnect = (evt) => {
            console.log('Nakama 소켓 연결 해제:', evt);
            setIsConnected(false);
            notifyDisconnectionListeners(evt);
          };
          
          newSocket.onerror = (err) => {
            console.error('Nakama 소켓 오류:', err);
            setIsConnecting(false);
          };
          
          // 소켓 연결
          await newSocket.connect(session, true);
          setSocket(newSocket);
          console.log('🔌 소켓 재연결 성공!');
        } catch (error) {
          console.error('재연결 중 오류 발생:', error);
          setIsConnecting(false);
        }
      };
      
      // 3초 후 재연결 시도 (즉시 시도하지 않고 약간의 딜레이 후 시도)
      const timeoutId = setTimeout(attemptReconnect, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, isConnecting, session, client, useSSL]);

  // 자동 연결 처리
  useEffect(() => {
    console.log('client :: ', client);

    if (autoConnect && client && session && !socket && !isConnecting) {
      console.log('자동 연결 시작...');
      connectSocket(session);
    }
  }, [client, session, autoConnect]);

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
      let content = '';
      let type = '';
      
      try {
        // 메시지 내용이 문자열인지 객체인지 확인
        if (typeof message.content === 'string') {
          try {
            contentObj = JSON.parse(message.content);
          } catch (jsonError) {
            // JSON 파싱 실패 시 원본 내용 사용
            console.log('✉️ 메시지 파싱 실패, 원본 사용:', message.content);
            contentObj = { content: message.content, type: 'system' };
          }
        } else if (typeof message.content === 'object') {
          contentObj = message.content;
        } else {
          // 그 외의 경우 기본값 할당
          contentObj = { content: String(message.content || ''), type: 'system' };
        }
        
        // contentObj가 null이나 undefined가 아닌지 확인
        if (contentObj) {
          content = contentObj.content || '';
          type = contentObj.type || '';
          console.log('✉️ 파싱된 메시지 내용:', { content, type, raw: contentObj });
        } else {
          console.warn('메시지 내용이 없습니다');
          content = '내용 없음';
          type = 'system';
        }
      } catch (parseError) {
        console.warn('메시지 파싱 실패, 원본 사용:', parseError);
        content = String(message.content || '내용 없음');
        type = 'system';
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
        sender: type === 'user' ? 'user' : 'character',
        message: content,
        timestamp: timestamp
      };
      
      console.log('✉️ 채팅 히스토리에 추가될 메시지:', newMessage);
      
      // 채팅 메시지 배열에 추가
      setChatMessages(prev => {
        // 임시 메시지 대체 로직 (사용자가 보낸 메시지인 경우)
        if (type === 'user') {
          // 최근 10개 메시지 중에서 같은 내용과 타입을 가진 임시 메시지를 찾아 대체
          const tempMessage = prev.find(msg => 
            msg.sender === 'user' && 
            msg.message === content && 
            msg.id.startsWith('temp_')
          );
          
          if (tempMessage) {
            console.log('✅ 임시 메시지를 실제 메시지로 대체:', tempMessage.id, '->', messageId);
            // 임시 메시지만 대체하고 나머지는 유지
            return prev.map(msg => 
              msg.id === tempMessage.id ? newMessage : msg
            );
          }
        }
        
        // 중복 메시지 방지 (같은 ID의 메시지가 이미 있는지 확인)
        const isDuplicate = prev.some(msg => msg.id === messageId);
        if (isDuplicate) {
          console.log('⚠️ 중복 메시지 무시:', messageId);
          return prev;
        }
        
        // 기존 메시지에 추가
        const newMessages = [...prev, newMessage];
        console.log(`✅ 메시지 추가됨 (총 ${newMessages.length}개)`, { 
          메시지ID: newMessage.id, 
          보낸사람: newMessage.sender, 
          타입: type 
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
      // isMy가 true면 사용자 메시지, false면 AI 메시지로 구분하여 전송
      const content = { content: message, type: isMy ? 'user' : 'ai' };
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
    
    console.log('채널 메시지 리스너 설정...');
    
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
        if (!contentObj) {
          console.log('⚠️ 파싱된 콘텐츠 객체가 없음, API 호출 중단');
          return;
        }
        
        console.log('📨 파싱된 메시지 타입:', contentObj.type || '알 수 없음');
        
        // 메시지 내용이 파싱되면 처리
        if (contentObj.type === 'user') {
          const channelId = message.channel_id;
          if (!channelId) {
            console.log('⚠️ 채널 ID가 없어 API 호출 중단');
            return;
          }
          
          // 자신이 보낸 메시지라도 응답은 처리 (ACK를 통한 메시지 확인)
          console.log('👤 사용자 메시지 수신, SendChat API 호출:', {
            content: contentObj.content,
            channel: channelId,
            chatKey: chrBotChatKey
          });
          
          // 저장된 채팅 키 사용
          if (chrBotChatKey) {
            try {
              // 저장된 채팅 모드 사용
              const response = await chatApi.SendChat(
                currentChatMode,
                nsfw, // nsfw 설정
                sendPrompt_key || '',
                chrBotChatKey,
                false // stream 설정
              );
              console.log('🤖 AI 응답 수신:', response);
              
              // 응답 상태 확인
              if (response && response.success && response.data && response.data.result && response.data.result.err === 0) {
                // AI의 응답을 다시 채널에 전송
                const chatMessageResponse = response.data;

                if (socketRef.current) {
                  try {
                    // 응답 JSON 파싱 및 content 추출
                    const responseObj = JSON.parse(chatMessageResponse.response);
                    const messageContent = responseObj.content[0].text;
                    
                    console.log('🤖 AI 응답 내용 (채널로 전송 중):', messageContent);
                    const content = { content: messageContent, type: 'ai' };
                    
                    // AI 응답을 채널에 전송 - 이 메시지는 다시 소켓의 onchannelmessage 이벤트로 수신되어 UI에 표시됨
                    await socketRef.current.writeChatMessage(channelId, content);
                    console.log('✅ AI 응답 채널 전송 완료 - 소켓을 통해 수신될 예정');
                  } catch (parseError) {
                    console.error('AI 응답 파싱 오류:', parseError);
                    // 파싱 오류 시 원본 응답 전송
                    const content = { content: chatMessageResponse.response, type: 'ai' };
                    await socketRef.current.writeChatMessage(channelId, content);
                  }
                }
              } else {
                console.error('AI 응답 오류:', response?.data);
                // 오류 발생 시 사용자에게 알림
                if (socketRef.current) {
                  const errorContent = {
                    content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.',
                    type: 'system'
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
                    content: '*오류 발생* 메시지 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
                    type: 'system'
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
        } else {
          // 다른 타입의 메시지 처리
          console.log('ℹ️ 기타 메시지 타입:', contentObj.type);
        }

        // 등록된 채널별 리스너 호출
        const channelId = message.channel_id;
        if (channelId && channelListenersRef.current.has(channelId)) {
          const listeners = channelListenersRef.current.get(channelId);
          listeners?.forEach(listener => {
            try {
              listener(message);
            } catch (err) {
              console.error('채널 메시지 리스너 오류:', err);
            }
          });
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
  }, [socketRef.current, handleMessage, currentChatMode, chrBotChatKey]);

  // 메시지 전송 함수 (캡슐화)
  const sendChatMessage = async (messageText: string): Promise<boolean> => {
    try {
      if (!channelId) {
        throw new Error('채널 ID가 없습니다.');
      }

      if (!socketRef.current) {
        throw new Error('소켓이 초기화되지 않았습니다.');
      }
      
      // 고유한 임시 ID 생성 (현재 시간 + 난수)
      const tempMessageId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // UI에 사용자 메시지 즉시 표시 (낙관적 UI 업데이트)
      const userMessage: ChatMessage = {
        id: tempMessageId,
        sender: 'user',
        message: messageText,
        timestamp: new Date(),
      };
      
      console.log('📤 메시지 전송 준비:', {
        tempId: tempMessageId,
        content: messageText,
        channelId
      });
      
      // 임시 메시지 저장 (소켓에서 실제 메시지가 도착하면 대체될 예정)
      setChatMessages(prev => [...prev, userMessage]);
      
      // 소켓을 통해 메시지 전송 (이후 ACK로 수신되면 실제 메시지로 대체)
      console.log('Nakama 메시지 전송 중...');
      const content = { content: messageText, type: 'user' };
      await socketRef.current.writeChatMessage(channelId, content);
      console.log('✅ 메시지 전송 완료 - 소켓을 통해 응답이 수신될 예정');
      
      return true;
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
      
      // 오류 메시지 표시
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: 'character',
        message: '*오류 발생* 메시지 전송에 실패했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      return false;
    }
  };

  // 마지막 AI 메시지 새로고침 함수
  const refreshLastAIMessage = async (): Promise<boolean> => {
    if (!isConnected) {
      console.error('Nakama 서버에 연결되어 있지 않습니다.');
      throw new Error('채팅 서버에 연결되어 있지 않습니다.');
    }

    if (!channelId) {
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
      if (!chrBotChatKey) {
        console.error('chrBotChatKey가 없습니다:', chrBotChatKey);
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
        chatMode: currentChatMode,
        userMessage: lastUserMessage,
        chrBotChatKey
      });

      // API 호출하여 새로운 응답 생성
      const response = await chatApi.SendChat(
        currentChatMode,
        0, // nsfw 설정
        lastUserMessage,
        chrBotChatKey,
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

      // Nakama를 통해 AI 응답 전송 (sendMessage 대신 직접 writeChatMessage 사용)
      try {
        // 응답 JSON 파싱 및 content 추출
        const responseObj = JSON.parse(response.data.response);
        const messageContent = responseObj.content[0].text;
        
        const content = { content: messageContent, type: 'ai' };
        await socketRef.current.writeChatMessage(channelId, content);
      } catch (parseError) {
        console.error('AI 응답 파싱 오류:', parseError);
        // 파싱 오류 시 원본 응답 전송
        const content = { content: response.data.response, type: 'ai' };
        await socketRef.current.writeChatMessage(channelId, content);
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
        message: '*오류 발생* 메시지 새로고침에 실패했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      return false;
    }
  };

  // 채팅 기록 초기화
  const clearChatHistory = (): void => {
    setChatMessages([]);
  };

  // 메시지 직접 추가
  const addChatMessage = (message: ChatMessage): void => {
    setChatMessages(prev => [...prev, message]);
  };

  /**
   * 채팅 룸 초기화 함수
   * @param userKey 사용자 고유 키
   * @param chatBotId 챗봇/캐릭터 ID
   * @param chatMode 채팅 모드 (1: 가성비, 2: 스토리, 3: 짜릿1, 4: 짜릿2)
   */
  const chatRoomInit = async (userKey: string, chatBotId: string, chatMode: number): Promise<{
    success: boolean;
    channelId?: string;
    roomName?: string;
  }> => {
    try {
      console.log('채팅방 초기화 시작:', { userKey, chatBotId, chatMode });
      
      // 초기화 상태 리셋
      setIsInitRoom(false);
      setChannelId(null);
      setRoomName(null);
      
      // 채팅 모드 저장
      setCurrentChatMode(chatMode);
      
      // 1. 클라이언트 확인 또는 생성
      let _client = client;
      if (!_client) {
        console.log('Nakama 클라이언트 생성 중...');
        _client = await createClient();
        if (!_client) {
          throw new Error('Nakama 클라이언트 생성 실패');
        }
      }

      // 2. 디바이스 ID 생성 및 인증
      const deviceId = `chatbot_jackpot_${userKey}`;
      console.log('디바이스 인증 시작:', deviceId);
      
      const newSession = await _client.authenticateDevice(deviceId, false, userKey?.toString());
      console.log('인증 성공, 세션 생성됨');
      setSession(newSession);

      // 3. 소켓 연결
      console.log('소켓 연결 중...');
      const newSocket = _client.createSocket(useSSL);
      await newSocket.connect(newSession, false);
      setSocket(newSocket);
      setIsConnecting(true);
      socketRef.current = newSocket;

      // 4. 채팅방 이름 생성 및 참여
      const newRoomName = `chat_${userKey}_${chatBotId}`;
      console.log('채팅방 참여 중:', newRoomName);
      setRoomName(newRoomName);
      
      const persistence = true;
      const hidden = false;
      
      const channel = await newSocket.joinChat(newRoomName, 1, persistence, hidden).catch((error) => {
        console.error('채팅방 참여 실패:', error);
        throw error;
      });
      
      console.log('채팅방 참여 성공:', channel);
      setChannelId(channel.id);

      // 5. 채팅 키 추출
      let newChrBotChatKey = 0;
      const split = channel.room_name.split('|');
      
      if (split.length >= 2) {
        newChrBotChatKey = parseInt(split[1]);
        setChrBotChatKey(newChrBotChatKey);
      }
      
      console.log('채팅 키 추출:', newChrBotChatKey);

      // 6. 채팅 초기화 API 호출
      console.log('채팅 세션 초기화 API 호출:', { chrBotChatKey: newChrBotChatKey, chatMode });
      const response = await chatApi.OpenChat(newChrBotChatKey, chatMode, 1);
      console.log('채팅 초기화 완료:', response);
      
      // 7. 연결 상태 업데이트 및 결과 리턴
      // 응답 구조: { result: { err: 0, msg: "Success" }, ... }
      const isSuccess = response && 
                       response.status === 200 && 
                       response.data && 
                       response.data.result && 
                       response.data.result.err === 0;
      
      console.log('🔌 채팅 초기화 결과 => isSuccess:', isSuccess,
      'socketConnected:', newSocket.isConnected);

      console.log('@@@@ response :: ', response.data);

      if (isSuccess) {
        setIsConnected(true);
        setIsConnecting(false);
        setIsInitRoom(true); // 룸 초기화 상태 업데이트
        setSendPrompt_key(response.data.prompt_key);
        setNsfw(response.data.world_list_detail_chrbot.nsfw);
      } else {
        console.error('채팅 초기화 실패! 응답 데이터:', response?.data);
        // 소켓 연결은 성공했지만 API 응답이 실패인 경우
        if (newSocket.isConnected) {
          setIsConnected(true); // 소켓 자체는 연결되었으므로 연결 상태는 true로 설정
          setIsConnecting(false);
        }
      }
      
      if (!isSuccess) {
        console.warn('채팅 초기화 API 응답이 실패했습니다:', response?.data?.result?.msg || '알 수 없는 오류');
        return { success: false };
      }
      
      // 초기화 성공시 정보 반환
      return { 
        success: isSuccess,
        channelId: channel.id,
        roomName: newRoomName
      };
      
    } catch (error) {
      console.error('채팅방 초기화 중 오류 발생:', error);
      setIsConnecting(false);
      setIsConnected(false);
      setIsInitRoom(false);
      throw error;
    }
  };

  // 소켓 연결 함수
  const connectSocket = async (sessionData: Session): Promise<boolean> => {
    if (!client) return false;
    if (isConnecting) return false;
    
    // 이미 연결된 상태라면 재연결하지 않음
    if (socketRef.current) {
      setSocket(socketRef.current);
      setIsConnected(true);
      return true;
    }
    
    setIsConnecting(true);
    
    try {
      // 이전 소켓이 있다면 정리
      if (socketRef.current) {
        await disconnectSocket();
      }
      
      // 새 소켓 생성
      const newSocket = client.createSocket(useSSL);
      
      // 소켓 이벤트 리스너 설정
      newSocket.onconnect = () => {
        console.log('Nakama 소켓 연결됨');
        setIsConnected(true);
        setIsConnecting(false);
        notifyConnectionListeners();
      };
      
      newSocket.ondisconnect = (evt) => {
        console.log('Nakama 소켓 연결 해제:', evt);
        setIsConnected(false);
        notifyDisconnectionListeners(evt);
      };
      
      newSocket.onerror = (err) => {
        console.error('Nakama 소켓 오류:', err);
        setIsConnecting(false);
      };
      
      // 소켓 참조 업데이트 (채널 메시지 핸들러는 별도의 useEffect에서 설정)
      socketRef.current = newSocket;
      
      // 소켓 연결
      const currentSession = sessionData || session;
      if (!currentSession) {
        throw new Error('세션이 없습니다');
      }
      
      await newSocket.connect(currentSession, true);
      setSocket(newSocket);
      setSession(currentSession);
      return true;
    } catch (error) {
      console.error('Nakama 소켓 연결 실패:', error);
      setIsConnecting(false);
      return false;
    }
  };

  // 소켓 연결 해제 함수
  const disconnectSocket = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (!socketRef.current) {
        resolve();
        return;
      }

      // 연결 끊기 전 이벤트 처리를 위한 임시 핸들러
      const originalOnDisconnect = socketRef.current.ondisconnect;
      
      socketRef.current.ondisconnect = (evt) => {
        // 원래 이벤트 핸들러 호출
        if (originalOnDisconnect) {
          originalOnDisconnect(evt);
        }
        
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        resolve();
      };

      // 소켓 연결 종료 시도
      try {
        socketRef.current.disconnect();
      } catch (err) {
        console.error('Nakama 소켓 연결 해제 중 오류:', err);
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        resolve();
      }

      // 비동기 작업이 완료되지 않을 경우를 대비한 타임아웃
      setTimeout(() => {
        if (socketRef.current) {
          console.warn('소켓 연결 해제 타임아웃, 강제 정리');
          socketRef.current = null;
          setSocket(null);
          setIsConnected(false);
        }
        resolve();
      }, 1000);
    });
  };

  // 채널 참가 함수
  const joinChat = async (roomId: string, persistence = false, hidden = false): Promise<any> => {
    if (!socketRef.current) {
      throw new Error('소켓이 연결되지 않았습니다');
    }

    try {
      const channel = await socketRef.current.joinChat(roomId, 1, persistence, hidden);
      console.log('Nakama 채팅 채널 참여:', channel);
      return channel;
    } catch (error) {
      console.error('Nakama 채팅 참여 실패:', error);
      throw error;
    }
  };

  // 채널 나가기 함수
  const leaveChat = async (channelId: string): Promise<boolean> => {
    if (!socketRef.current) {
      return false;
    }

    try {
      await socketRef.current.leaveChat(channelId);
      return true;
    } catch (error) {
      console.error('Nakama 채팅 퇴장 실패:', error);
      return false;
    }
  };

  // 채널 메시지 리스너 추가
  const addChannelMessageListener = (channelId: string, listener: (message: any) => void): void => {
    if (!channelListenersRef.current.has(channelId)) {
      channelListenersRef.current.set(channelId, new Set());
    }
    channelListenersRef.current.get(channelId)?.add(listener);
  };

  // 채널 메시지 리스너 제거
  const removeChannelMessageListener = (channelId: string, listener: (message: any) => void): void => {
    if (channelListenersRef.current.has(channelId)) {
      channelListenersRef.current.get(channelId)?.delete(listener);
      // 리스너가 없으면 맵에서 제거
      if (channelListenersRef.current.get(channelId)?.size === 0) {
        channelListenersRef.current.delete(channelId);
      }
    }
  };

  // 연결 리스너 추가
  const addConnectionListener = (listener: () => void): void => {
    connectionListenersRef.current.add(listener);
  };

  // 연결 리스너 제거
  const removeConnectionListener = (listener: () => void): void => {
    connectionListenersRef.current.delete(listener);
  };

  // 연결 해제 리스너 추가
  const addDisconnectionListener = (listener: (evt: any) => void): void => {
    disconnectionListenersRef.current.add(listener);
  };

  // 연결 해제 리스너 제거
  const removeDisconnectionListener = (listener: (evt: any) => void): void => {
    disconnectionListenersRef.current.delete(listener);
  };

  // 연결 리스너 알림
  const notifyConnectionListeners = (): void => {
    connectionListenersRef.current.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('연결 리스너 오류:', err);
      }
    });
  };

  // 연결 해제 리스너 알림
  const notifyDisconnectionListeners = (evt: any): void => {
    disconnectionListenersRef.current.forEach(listener => {
      try {
        listener(evt);
      } catch (err) {
        console.error('연결 해제 리스너 오류:', err);
      }
    });
  };

  const contextValue: NakamaContextType = {
    client,
    socket: socketRef.current,
    session,
    isConnected,
    isConnecting,
    currentChatMode,
    chrBotChatKey,
    channelId,     // 채널 ID 추가
    roomName,      // 룸 이름 추가
    isInitRoom,    // 룸 초기화 상태 추가
    chatMessages,  // 채팅 메시지 배열 추가
    setSession,
    chatRoomInit,
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
    addChatMessage
  };

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