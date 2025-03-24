// @ts-nocheck
// NakamaContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client } from '@heroiclabs/nakama-js';
import { chatApi } from '@/services/api/storyNationApi';

// Nakama 컨텍스트 생성
const NakamaContext = createContext(null);

// Nakama Provider 컴포넌트
export const NakamaProvider = ({ 
  children, 
  serverUrl, 
  serverPort, 
  serverKey = 'defaultkey',
  useSSL = true,
  autoConnect = false,
  defaultSession = null
}) => {
  const [client, setClient] = useState(null);
  const [socket, setSocket] = useState(null);
  const [session, setSession] = useState(defaultSession);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef(null);
  const channelListenersRef = useRef(new Map());
  const connectionListenersRef = useRef(new Set());
  const disconnectionListenersRef = useRef(new Set());

  let isInitRoom = false;

  // 클라이언트 초기화
  useEffect(() => {
    console.log('@@@@@@@@@@@@@@@@@@@@@@@ useEffect :: ');   
    const nakamaClient = new Client(serverKey, serverUrl, serverPort, useSSL);
    setClient(nakamaClient);
    
    // 컴포넌트 언마운트 시 소켓 정리
    return () => {
      disconnectSocket();
    };
  }, [serverUrl, serverPort, useSSL]);

  // 자동 연결 처리
  useEffect(() => {
    console.log('client :: ', client);

    if (autoConnect && client && session && !socket && !isConnecting) {
      connectSocket(session);
    }
  }, [client, session, autoConnect]);


  const createClient = async () => {
    const nakamaClient = new Client(serverKey, serverUrl, serverPort, useSSL);
    setClient(nakamaClient);

    return nakamaClient;
  }


  // 채팅 룸 초기화 
  const chatRoomInit = async (_user_key: string, _chatBotId: string, _chat_mode: number) => {
    let _client = client;
    if(!_client) {
        _client = await createClient();
    }

    if(!_client) {
      return;
    }


    isInitRoom = true;
    console.log('Attempting authentication...');

    const user_key = _user_key;

    let deviceId = 'chatbot_jackpot_' + user_key;
    console.log('>> deviceId :: ', deviceId);

    const newSession = await _client.authenticateDevice(deviceId, false, user_key?.toString());
    console.log('Creating socket connection...');
    setSession(newSession);

    const newSocket = _client.createSocket(useSSL);
    await newSocket.connect(newSession, false);
    setSocket(newSocket);
    setIsConnecting(true);
    socketRef.current = newSocket;

    console.log('1111 socket.onchannelmessage :: ' , newSocket.onchannelmessage.length);

    const roomName = 'chat_' + user_key + '_' + _chatBotId;
    console.log('@@@@ roomName  :: ', roomName);

    var persistence = true;
    var hidden = false;
    const channel = await newSocket.joinChat(roomName, 1, persistence, hidden).catch((res) => {
      console.error('joinChat error :: ', res);
    });
    console.log('channel :: ', channel);



    let _chrbot_chat_key = 0;

    let split = channel['room_name'].split('|');

    console.log('split :: ', split);
    if(split.length >= 2) {
      _chrbot_chat_key = parseInt(split[1]);
    }

    console.log('@@@@ End ChatRoomInit @@@@ :: ', _chrbot_chat_key);

    // openChat
    let response = await chatApi.OpenChat(_chrbot_chat_key, _chat_mode, 1);
    console.log('openChat response :: ', response);
  }





  // 소켓 연결 함수
  const connectSocket = async (sessionData) => {
    if (!client) return false;
    if (isConnecting) return false;
    
    // 이미 연결된 상태라면 재연결하지 않음
    if (socketRef.current && socketRef.current.isConnected) {
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
      socketRef.current = newSocket;
      
      // 소켓 이벤트 리스너 설정
      newSocket.onconnect = () => {
        console.log('Nakama socket connected');
        setIsConnected(true);
        setIsConnecting(false);
        notifyConnectionListeners();
      };
      
      newSocket.ondisconnect = (evt) => {
        console.log('Nakama socket disconnected:', evt);
        setIsConnected(false);
        notifyDisconnectionListeners(evt);
      };
      
      newSocket.onerror = (err) => {
        console.error('Nakama socket error:', err);
        setIsConnecting(false);
      };
      
      // 채널 메시지 리스너
      newSocket.onchannelmessage = (message) => {
        const channelId = message.channel_id;
        if (channelListenersRef.current.has(channelId)) {
          const listeners = channelListenersRef.current.get(channelId);
          listeners.forEach(listener => {
            try {
              listener(message);
            } catch (err) {
              console.error('Error in channel message listener:', err);
            }
          });
        }
      };
      
      // 소켓 연결
      const currentSession = sessionData || session;
      await newSocket.connect(currentSession, true);
      setSocket(newSocket);
      setSession(currentSession);
      return true;
    } catch (error) {
      console.error('Failed to connect Nakama socket:', error);
      setIsConnecting(false);
      return false;
    }
  };

  // 소켓 연결 해제 함수
  const disconnectSocket = () => {
    console.log('@@@ disconnectSocket :: ');

    return new Promise((resolve) => {
      console.log('@@@ socketRef.current :: ', socketRef.current);

      if (!socketRef.current) {
        resolve();
        return;
      }

      console.log('@@@ socketRef.current.isConnected :: ', socketRef.current.isConnected);

      // 이미 연결이 끊겼는지 확인
      if (!socketRef.current.isConnected) {
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        resolve();
        return;
      }


      console.log('@@@ 1' );

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

        console.log('@@@ 2' );
      };

      // 소켓 연결 종료 시도
      try {
        socketRef.current.disconnect();
        console.log('@@@ 3' );
      } catch (err) {
        console.error('Error during Nakama socket disconnect:', err);
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        resolve();
      }

      // 비동기 작업이 완료되지 않을 경우를 대비한 타임아웃
      setTimeout(() => {
        console.log('@@@ 4' );
        if (socketRef.current) {
          console.warn('Socket disconnect timed out, forcing cleanup');
          socketRef.current = null;
          setSocket(null);
          setIsConnected(false);
        }
        resolve();
        console.log('@@@ 5' );
      }, 1000);
    });
  };

  // 채널 참가 함수
  const joinChat = async (roomId, persistence = false, hidden = false) => {
    if (!socketRef.current || !socketRef.current.isConnected) {
      throw new Error('Socket not connected');
    }

    try {
      const channel = await socketRef.current.joinChat(roomId, 1, persistence, hidden);
      console.log('Joined Nakama chat channel:', channel);
      return channel;
    } catch (error) {
      console.error('Failed to join Nakama chat:', error);
      throw error;
    }
  };

  // 채널 나가기 함수
  const leaveChat = async (channelId) => {
    if (!socketRef.current || !socketRef.current.isConnected) {
      return false;
    }

    try {
      await socketRef.current.leaveChat(channelId);
      return true;
    } catch (error) {
      console.error('Failed to leave Nakama chat:', error);
      return false;
    }
  };

  // 메시지 전송 함수
  const sendMessage = async (channelId, content) => {
    if (!socketRef.current || !socketRef.current.isConnected) {
      throw new Error('Socket not connected');
    }

    try {
      await socketRef.current.writeChatMessage(channelId, content);
      return true;
    } catch (error) {
      console.error('Failed to send Nakama message:', error);
      throw error;
    }
  };

  // 채널 메시지 리스너 추가
  const addChannelMessageListener = (channelId, listener) => {
    if (!channelListenersRef.current.has(channelId)) {
      channelListenersRef.current.set(channelId, new Set());
    }
    channelListenersRef.current.get(channelId).add(listener);
  };

  // 채널 메시지 리스너 제거
  const removeChannelMessageListener = (channelId, listener) => {
    if (channelListenersRef.current.has(channelId)) {
      channelListenersRef.current.get(channelId).delete(listener);
      // 리스너가 없으면 맵에서 제거
      if (channelListenersRef.current.get(channelId).size === 0) {
        channelListenersRef.current.delete(channelId);
      }
    }
  };

  // 연결 리스너 추가
  const addConnectionListener = (listener) => {
    connectionListenersRef.current.add(listener);
  };

  // 연결 리스너 제거
  const removeConnectionListener = (listener) => {
    connectionListenersRef.current.delete(listener);
  };

  // 연결 해제 리스너 추가
  const addDisconnectionListener = (listener) => {
    disconnectionListenersRef.current.add(listener);
  };

  // 연결 해제 리스너 제거
  const removeDisconnectionListener = (listener) => {
    disconnectionListenersRef.current.delete(listener);
  };

  // 연결 리스너 알림
  const notifyConnectionListeners = () => {
    connectionListenersRef.current.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('Error in connection listener:', err);
      }
    });
  };

  // 연결 해제 리스너 알림
  const notifyDisconnectionListeners = (evt) => {
    disconnectionListenersRef.current.forEach(listener => {
      try {
        listener(evt);
      } catch (err) {
        console.error('Error in disconnection listener:', err);
      }
    });
  };

  const contextValue = {
    client,
    socket: socketRef.current,
    session,
    isConnected,
    isConnecting,
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
    removeDisconnectionListener
  };

  return (
    <NakamaContext.Provider value={contextValue}>
      {children}
    </NakamaContext.Provider>
  );
};

// Nakama 컨텍스트 훅
export const useNakama = () => {
  const context = useContext(NakamaContext);
  if (!context) {
    throw new Error('useNakama must be used within a NakamaProvider');
  }
  return context;
};