import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Building,
  User as UserIcon,
  Check,
  CheckCheck,
  ShieldCheck,
  Clock,
  Paperclip
} from 'lucide-react';
import { Conversation, Message } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ChatPageProps {
  initialBrokerId?: string | null;
  initialPropertyId?: string | null;
  onOpenAuth: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ initialBrokerId, initialPropertyId, onOpenAuth }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      initChat();
    } else {
      setLoading(false);
    }
  }, [user, initialBrokerId, initialPropertyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChat = async () => {
    try {
      setLoading(true);
      if (initialBrokerId) {
        // Start conversation if provided
        const startRes = await api.chat.start(initialBrokerId, initialPropertyId || undefined);
        if (startRes.success) {
          setActiveConversation(startRes.data);
        }
      }

      const res = await api.chat.getConversations();
      if (res.success) {
        setConversations(res.data);
        if (!initialBrokerId && res.data.length > 0) {
          setActiveConversation(res.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      const interval = setInterval(() => loadMessages(activeConversation.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeConversation?.id]);

  const loadMessages = async (convId: string) => {
    try {
      const res = await api.chat.getMessages(convId);
      if (res.success) {
        setMessages(res.data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const textToSend = inputText;
    setInputText('');
    setSending(true);

    try {
      const res = await api.chat.sendMessage(activeConversation.id, textToSend);
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (e: any) {
      alert(e.message || 'Xabar yuborilmadi');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <MessageSquare size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Chatdan foydalanish uchun tizimga kiring</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '24px' }}>
          Maklerlar bilan to‘g‘ridan-to‘g‘ri muloqot qilish uchun hisobingizga kiring.
        </p>
        <button onClick={onOpenAuth} className="btn btn-primary">
          Tizimga kirish
        </button>
      </div>
    );
  }

  const otherUser = activeConversation
    ? activeConversation.clientId === user.id
      ? activeConversation.broker
      : activeConversation.client
    : null;

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        height: 'calc(100vh - 180px)',
        minHeight: '520px'
      }} className="chat-layout">
        {/* CONVERSATION LIST */}
        <aside style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Xabarlar</h2>
          </div>

          <div style={{ overflowY: 'auto', flexGrow: 1 }}>
            {loading ? (
              <div style={{ padding: '16px' }}>
                <div className="skeleton" style={{ height: '60px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '60px' }} />
              </div>
            ) : conversations.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '30px 16px' }}>
                Hozircha suhbatlar yo‘q. E’lon sahifasidan maklerga yozing.
              </p>
            ) : (
              conversations.map((conv) => {
                const partner = conv.clientId === user.id ? conv.broker : conv.client;
                const lastMsg = conv.messages?.[0];
                const isActive = activeConversation?.id === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      gap: '12px',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                      <img
                        src={partner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        border: '2px solid #fff'
                      }} />
                    </div>

                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {partner?.firstName} {partner?.lastName}
                        </div>
                        {lastMsg && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>

                      {conv.property && (
                        <div style={{ fontSize: '11px', color: 'var(--color-primary-hover)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          🏠 {conv.property.title}
                        </div>
                      )}

                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {lastMsg ? lastMsg.text : 'Suhbat boshlandi'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* CHAT MESSAGES WINDOW */}
        <main style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {activeConversation ? (
            <>
              {/* Partner Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFFFFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt=""
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {otherUser?.firstName} {otherUser?.lastName}
                      {otherUser?.isVerified && (
                        <ShieldCheck size={16} color="var(--color-primary)" />
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                      ● Onlayn
                    </div>
                  </div>
                </div>

                {activeConversation.property && (
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{activeConversation.property.title}</div>
                    <div style={{ color: 'var(--color-primary-hover)', fontWeight: 700 }}>
                      {new Intl.NumberFormat('uz-UZ').format(activeConversation.property.price)} so‘m
                    </div>
                  </div>
                )}
              </div>

              {/* Messages feed */}
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#F8FAFC' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    Suhbatni boshlash uchun quyida xabar yozing.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user.id;

                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            backgroundColor: isMe ? 'var(--color-primary)' : '#FFFFFF',
                            color: isMe ? '#FFFFFF' : 'var(--color-text-main)',
                            boxShadow: 'var(--shadow-sm)',
                            border: isMe ? 'none' : '1px solid var(--color-border)',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            wordBreak: 'break-word'
                          }}
                        >
                          {m.text}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            m.isRead ? <CheckCheck size={14} color="var(--color-primary)" /> : <Check size={14} />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#FFFFFF',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  style={{ flexGrow: 1 }}
                  placeholder="Xabaringizni yozing..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="btn btn-primary"
                  style={{ height: '44px', width: '48px', padding: 0 }}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
              <MessageSquare size={48} color="var(--color-border)" style={{ margin: '0 auto 16px' }} />
              <h3>Suhbatni tanlang</h3>
              <p style={{ fontSize: '14px' }}>Chap tomondagi ro‘yxatdan suhbatdoshni tanlang.</p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
