'use client'

// NakamaContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Session, Socket, ChannelMessage, ChannelPresenceEvent } from '@heroiclabs/nakama-js';
import { chatApi } from '@/services/api/storyNationApi';

import { useRouter } from 'next/navigation';

// Nakama 설정
const NAKAMA_SERVER_KEY = 'defaultkey';
const NAKAMA_HOST = 'qauschat.storynation.io'; // 또는 서버 주소
const NAKAMA_PORT = '443';
const NAKAMA_USE_SSL = true; // 프로덕션에서는 true 권장




// 채팅 메시지 타입 정의
export interface ChatMessage {
  content: string;
  senderId: string;
  senderUsername: string;
  createTime: Date;
  channelId: string;
  isMy: boolean;
}

// Nakama 컨텍스트 타입 정의
interface NakamaContextType {
  client: Client | null;
  session: Session | null;
  socket: Socket | null;
  isAuthenticated: boolean;
  isConnected: boolean;
  currentChannelId: string | null;
  messagesList: ChatMessage[];
  logout: () => void;
  sendMessage: (message: string, isMy: boolean) => Promise<void>;
  closeChat: () => Promise<void>;
  exitChat: () => Promise<void>;
}

// 기본값으로 컨텍스트 생성
export const NakamaContext = createContext<NakamaContextType>({
  client: null,
  session: null,
  socket: null,
  isAuthenticated: false,
  isConnected: false,
  currentChannelId: null,
  messagesList: [],
  logout: () => {},
  sendMessage: async () => {},
  closeChat: async () => {},
  exitChat: async () => {},
});

// Nakama 컨텍스트 후크
export const useNakama = () => useContext(NakamaContext);

// Nakama 프로바이더 컴포넌트
interface NakamaProviderProps {
  children: ReactNode;
  chatId: string;  // 추가
  chat_mode: number;
}

export const NakamaProvider: React.FC<NakamaProviderProps> = ({ children, chatId, chat_mode }) => {
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);
  const [chrbot_chat_key, setChrbotChatKey] = useState<number>(0);
  const [chatRoomInfo, setChatRoomInfo] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);

  // const [sendPrompt_key, setSendPrompt_key] = useState<string>('');
  // const [sendNsfw, setSendNsfw] = useState<number>(0);

  console.log('chatId :: ', chatId);
  console.log('chat_mode :: ', chat_mode);

  const chatBotId = chatId;
  const currentChatMode = chat_mode;
  let isListenerRegistered = false;
  // let chrbot_chat_key = 0;


  let sendPrompt_key = '';
  let sendNsfw = 0;

  const handleCreate = () => {
    console.log('handleCreate');
    chatInit();
    
  }

  const handleDisconnect = () => {
    console.log('handleDisconnect');
    logout();
  }


  useEffect(() => {
    return () => {
      console.log('@@@@ UnMount NakamaContext @@@@');
      logout();
    };
  }, []);


  // useEffect(() => {
  //   console.log('chatRoomInfo :: ', chatRoomInfo);
  //   if(chatRoomInfo) {
  //     setSendPrompt_key(chatRoomInfo.prompt_key);
  //     setSendNsfw(chatRoomInfo.world_list_detail_chrbot.nsfw);

  //     console.log('chatRoomInfo :: ', chatRoomInfo.prompt_key);
  //     console.log('chatRoomInfo :: ', chatRoomInfo.world_list_detail_chrbot.nsfw);
  //   }
    
  // }, [chatRoomInfo]);

  useEffect(() => {
    console.log('@@@@@@ sendPrompt_key :: ', sendPrompt_key);
    console.log('@@@@@@ sendNsfw :: ', sendNsfw);
  }, [sendPrompt_key, sendNsfw]);


  // 클라이언트 초기화
  useEffect(() => {
    console.log('Initializing Nakama client...');
    // chatInit();
  }, [chatBotId]);


  useEffect(() => {
    if (!client) {
      return;
    }

    chatRoomInit();
  }, [client])


  const chatInit = () => {
    if(chatBotId > 0) {
      const newClient = new Client(
        NAKAMA_SERVER_KEY,
        NAKAMA_HOST,
        NAKAMA_PORT,
        NAKAMA_USE_SSL,
        7000,
        true
      );
  
      setClient(newClient);
    }
  }

  const chatRoomInit = async () => {
    console.log('Attempting authentication...');
  
    let user_key = localStorage.getItem('deviceId');
    let deviceId = 'chatbot_jackpot_' + localStorage.getItem('deviceId');
    console.log('>> deviceId :: ', deviceId);

  // cros Error >>
    const newSession = await client.authenticateDevice(deviceId, false, localStorage.getItem('deviceId')?.toString());
    // console.log('newSession :: ', newSession, socket);
    
    // 웹소켓 연결
    console.log('Creating socket connection...');
    const newSocket = client.createSocket(NAKAMA_USE_SSL);

    
    await newSocket.connect(newSession, false);
    
    console.log('1111 socket.onchannelmessage :: ' , newSocket.onchannelmessage.length);

    if(newSocket.onchannelmessage.length > 0) {
      newSocket.onchannelmessage = null;
    }



    // chat_{user_key}_{world_list_detail_chrbot_key}_{chat_mode}

    // 성인용 >
    // default : 4

    // 아니면 >
    // default : 2



    // jsoinChat Type
    // 1: Room ( 룸채널 )
    // 2: Direct ( 1:1 개인 메시지 )
    // 3: Group ( 특정 사용자 그룹 메시지 )
    // 스네에서 사용하는 채팅 타입 : 1

    const roomName = 'chat_' + user_key + '_' + chatBotId;
    console.log('@@@@ roomName  :: ', roomName);

    var persistence = true;
    var hidden = false;
    const channel = await newSocket.joinChat(roomName, 1, persistence, hidden).catch((res) => {
      console.error('joinChat error :: ', res);
    });
    console.log('channel :: ', channel);

    if(!channel) {
      return;
    }

    let _chrbot_chat_key = 0;

    let split = channel['room_name'].split('|');

    console.log('split :: ', split);
    if(split.length >= 2) {
      _chrbot_chat_key = parseInt(split[1]);
    }

    console.log('@@@@ End ChatRoomInit @@@@ :: ', _chrbot_chat_key);

    setSocket(newSocket);
    setChannelId(channel.id);
    setCurrentChannelId(channel.id);
    setChrbotChatKey(_chrbot_chat_key);

    // if(chrbot_chat_key > 0) {
    //   await openChat(chrbot_chat_key);
    // }
    // setChrbotChatKey(chrbot_chat_key);

    
  }


  useEffect(() => {
    if(chrbot_chat_key > 0) {
      openChat(chrbot_chat_key);
    }
  }, [chrbot_chat_key])


  useEffect(() => {
    if(socket) {
      if(isListenerRegistered) {
        console.log('이미 등록되어있음');
        return;
      }

      console.log('111111');


      // Listener
      socket.onchannelpresence = (channelPresence: ChannelPresenceEvent) => {
        console.log('socket.onchannelmessage :: ', channelPresence);
      }

      socket.onchannelmessage = async (message: ChannelMessage) => {
        console.log('chrbot_chat_key :::: ', chrbot_chat_key);
        console.log("새 메시지 수신:", message);
        console.log('>>>>>> chatRoomInfo :: ', chatRoomInfo);
        console.log('>>>>>> sendNsfw :: ', sendNsfw);
        console.log('>>>>>> prompt_key :: ', sendPrompt_key);

        const chatmode = currentChatMode;
        const nsfw = sendNsfw;
        const prompt_key = sendPrompt_key;
        const _chrbot_chat_key = chrbot_chat_key;
        const stream = false;
        const ai_message = '';
        const user_message = message.content.content;



        // save message
        setMessagesList((prevMessages) => [...prevMessages, {
          content: message.content.message,
          senderId: message.sender_id,
          senderUsername: message.username,
          createTime: new Date(message.update_time),
          channelId: message.channel_id,
          isMy: message.content.type === 'user' ? true : false
        }]);

        // 메시지 처리
        if(message.content.type === 'user') {
          const response = await chatApi.SendChat(chatmode, nsfw, prompt_key, _chrbot_chat_key, stream, ai_message, user_message);
          console.log('response :: ', response);

          await sendMessage("ai test!!!!!", false);
        }
      }

      socket.ondisconnect = () => {
        console.log('socket.onpartyclose');
      }
      isListenerRegistered = true;
    }
  }, [socket]);


  const openChat = async (chrbot_chat_key: number) => {
    let response = await chatApi.OpenChat(chrbot_chat_key, currentChatMode, 1);
    console.log('openChat response');

    setMessagesList([]); // 메시지 목록 초기화

    setChatRoomInfo(response.data);
    sendPrompt_key = response.data.prompt_key;
    sendNsfw = response.data.world_list_detail_chrbot.nsfw;
    setIsConnected(true);
  }
  

// event 처리 함수 - sendMessage
  const sendMessage = async (message: string, isMy: boolean) => {
    if (!socket || !channelId) {
      throw new Error('채팅방에 연결되어 있지 않습니다.');
    }

    console.log('chatRoomInfo 2222 : ', chatRoomInfo);
    console.log('sendMessage :: ', message, isMy);

    try {
      const content = { content: message, type: isMy? 'user' : 'ai' };
      const ack = await socket.writeChatMessage(channelId, content);
      console.log("메시지 전송 성공:", ack);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw error;
    }
  };


  const closeChat = async () => {
    console.log('closeChat');
    logout();
  }


  const exitChat = async () => {
    let response = await chatApi.CloseChat(chrbot_chat_key);
    logout();
    console.log('closeChat response :: ', response);

    router.back();
  }

  // 로그아웃 함수
  const logout = async () => {
    console.log('logout');

    if (socket) {
      console.log('@@@@ close channel channelId :: ', channelId);

      socket.onchannelmessage = null;
      socket.leaveChat(channelId);
      socket.disconnect(true);
    }
    setSocket(null);
    setSession(null);
    setIsAuthenticated(false);
    setIsConnected(false);
    setCurrentChannelId(null);
    setMessagesList([]);
    localStorage.removeItem('nakamaAuthToken');

    console.log('@@@@ logoutEND @@@@'); 
  };


  // 컨텍스트 값
  const contextValue: NakamaContextType = {
    client,
    session,
    socket,
    isAuthenticated,
    isConnected,
    currentChannelId,
    messagesList,
    logout,
    sendMessage,
    closeChat,
    exitChat,
  };

  return (
    <NakamaContext.Provider value={contextValue}>
      <div className='grid'>
        <button className='font-bold text-red-500 white' onClick={handleCreate}>Create</button>
        <button className='font-bold text-white' onClick={handleDisconnect}>Disconnect</button>
        <button className='font-bold text-white' onClick={exitChat}>Exit</button>
      </div>
      {children}
    </NakamaContext.Provider>
  );
};