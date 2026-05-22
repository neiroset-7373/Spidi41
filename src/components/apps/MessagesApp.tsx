import React, { useState, useEffect } from 'react';
import './styles/MessagesApp.css';

interface MessagesAppProps {
  onClose: () => void;
  theme: string;
}

interface Message {
  id: number;
  text: string;
  time: string;
  type: 'sent' | 'received';
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  messages: Message[];
  unread: boolean;
}

const defaultChats: Chat[] = [
  { id: 1, name: 'Анна', avatar: '👩', messages: [
    { id: 1, text: 'Привет! Как дела?', time: '14:30', type: 'received' }
  ], unread: true },
  { id: 2, name: 'Максим', avatar: '👨', messages: [
    { id: 2, text: 'Встреча переносится на завтра', time: '13:15', type: 'received' }
  ], unread: true },
  { id: 3, name: 'Мама', avatar: '👩‍🦳', messages: [
    { id: 3, text: 'Купи хлеб по дороге домой', time: '12:00', type: 'received' }
  ], unread: false },
];

const MessagesApp: React.FC<MessagesAppProps> = ({ onClose, theme }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const savedChats = localStorage.getItem('wintophone_chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    } else {
      setChats(defaultChats);
    }
  }, []);

  const saveChats = (updatedChats: Chat[]) => {
    setChats(updatedChats);
    localStorage.setItem('wintophone_chats', JSON.stringify(updatedChats));
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      
      const updatedChats = chats.map(chat => {
        if (chat.id === selectedChat) {
          return {
            ...chat,
            messages: [
              ...chat.messages,
              { id: Date.now(), text: messageText, time: timeStr, type: 'sent' as const }
            ],
            unread: false
          };
        }
        return chat;
      });
      
      saveChats(updatedChats);
      setMessageText('');
    }
  };

  const getLastMessage = (chat: Chat) => {
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg ? lastMsg.text : '';
  };

  if (selectedChat) {
    const chat = chats.find(c => c.id === selectedChat);
    if (!chat) return null;

    return (
      <div className={`messages-app theme-${theme}`}>
        <div className="chat-header">
          <button className="back-button" onClick={() => setSelectedChat(null)}>←</button>
          <div className="chat-avatar">{chat.avatar}</div>
          <span className="chat-name">{chat.name}</span>
          <div className="header-spacer" />
        </div>
        <div className="chat-messages">
          {chat.messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <span className="message-text">{msg.text}</span>
              <span className="message-time">{msg.time}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Сообщение..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="send-button" onClick={handleSendMessage}>➤</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`messages-app theme-${theme}`}>
      <div className="app-header">
        <button className="back-button" onClick={onClose}>←</button>
        <span className="app-title">Сообщения</span>
        <button className="header-button">✏️</button>
      </div>

      <div className="messages-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="message-item"
            onClick={() => setSelectedChat(chat.id)}
          >
            <div className="message-avatar">{chat.avatar}</div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-name">{chat.name}</span>
                <span className="message-time">{chat.messages[chat.messages.length - 1]?.time}</span>
              </div>
              <div className="message-preview">
                {chat.unread && <div className="unread-dot" />}
                <span className={chat.unread ? 'unread-text' : ''}>{getLastMessage(chat)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesApp;
