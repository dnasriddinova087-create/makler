import React, { useState, useEffect } from 'react';
import {
  Home,
  Building,
  Users,
  FileText,
  MessageSquare,
  Heart,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  PlusCircle,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, logout, favoritesIds } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Polling every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    await api.notifications.markAllRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* Logo */}
        <div
          onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981',
            boxShadow: '0 4px 10px rgba(11, 19, 43, 0.2)'
          }}>
            <Building size={24} />
          </div>
          <div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              color: 'var(--color-navy)',
              lineHeight: 1
            }}>
              IJARA<span style={{ color: 'var(--color-primary)' }}>.UZ</span>
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}>
              Ishonchli Uy Ijarasi
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', gap: '8px', alignItems: 'center' }} className="desktop-nav">
          <button
            onClick={() => setCurrentTab('home')}
            className={`btn btn-sm ${currentTab === 'home' ? 'btn-navy' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Home size={16} /> Bosh sahifa
          </button>
          <button
            onClick={() => setCurrentTab('properties')}
            className={`btn btn-sm ${currentTab === 'properties' ? 'btn-navy' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Building size={16} /> Uylar
          </button>
          <button
            onClick={() => setCurrentTab('brokers')}
            className={`btn btn-sm ${currentTab === 'brokers' ? 'btn-navy' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Users size={16} /> Maklerlar
          </button>
          <button
            onClick={() => setCurrentTab('contracts')}
            className={`btn btn-sm ${currentTab === 'contracts' ? 'btn-navy' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <FileText size={16} /> Shartnomalar
          </button>

          {user && (
            <button
              onClick={() => setCurrentTab('chat')}
              className={`btn btn-sm ${currentTab === 'chat' ? 'btn-navy' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              <MessageSquare size={16} /> Chat
            </button>
          )}

          {user?.role === 'BROKER' && (
            <button
              onClick={() => setCurrentTab('broker-dashboard')}
              className="btn btn-sm btn-primary"
              style={{ marginLeft: '6px' }}
            >
              <LayoutDashboard size={16} /> Makler Kabineti
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setCurrentTab('admin')}
              className="btn btn-sm badge-blue"
              style={{ padding: '6px 12px', cursor: 'pointer' }}
            >
              <ShieldCheck size={16} /> Admin Panel
            </button>
          )}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Favorites */}
          <button
            onClick={() => setCurrentTab('favorites')}
            title="Sevimlilar"
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: currentTab === 'favorites' ? 'var(--color-primary-light)' : '#F1F5F9',
              color: currentTab === 'favorites' ? 'var(--color-primary)' : 'var(--color-navy)',
              transition: 'var(--transition)'
            }}
          >
            <Heart size={20} fill={favoritesIds.length > 0 ? '#EF4444' : 'none'} color={favoritesIds.length > 0 ? '#EF4444' : 'currentColor'} />
            {favoritesIds.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--color-danger)',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '10px',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {favoritesIds.length}
              </span>
            )}
          </button>

          {/* Notifications */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Bildirishnomalar"
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: notificationsOpen ? '#E2E8F0' : '#F1F5F9',
                  color: 'var(--color-navy)',
                  transition: 'var(--transition)'
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '50px',
                  width: '320px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '16px',
                  zIndex: 200
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Bildirishnomalar</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                        Barchasini o‘qish
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                        Hozircha xabarlar yo‘q
                      </p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: n.isRead ? '#F8FAFC' : 'var(--color-primary-light)',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{n.title}</div>
                          <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User auth badge / Login */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => user.role === 'BROKER' ? setCurrentTab('broker-dashboard') : setCurrentTab('contracts')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#F1F5F9',
                  cursor: 'pointer'
                }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                    {user.firstName[0]}
                  </div>
                )}
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)' }}>
                  {user.firstName}
                </span>
                <span className={`badge ${user.role === 'ADMIN' ? 'badge-blue' : user.role === 'BROKER' ? 'badge-green' : 'badge-navy'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Chiqish"
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  color: 'var(--color-text-muted)'
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={onOpenAuth} className="btn btn-secondary btn-sm">
                Kirish
              </button>
              <button onClick={onOpenAuth} className="btn btn-primary btn-sm">
                Ro‘yxatdan o‘tish
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', color: 'var(--color-navy)' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
            <Home size={16} /> Bosh sahifa
          </button>
          <button onClick={() => { setCurrentTab('properties'); setMobileMenuOpen(false); }} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
            <Building size={16} /> Uylar (Katalog)
          </button>
          <button onClick={() => { setCurrentTab('brokers'); setMobileMenuOpen(false); }} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
            <Users size={16} /> Maklerlar
          </button>
          <button onClick={() => { setCurrentTab('contracts'); setMobileMenuOpen(false); }} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
            <FileText size={16} /> Shartnomalar
          </button>
          {user && (
            <button onClick={() => { setCurrentTab('chat'); setMobileMenuOpen(false); }} className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
              <MessageSquare size={16} /> Chat
            </button>
          )}
          {user?.role === 'BROKER' && (
            <button onClick={() => { setCurrentTab('broker-dashboard'); setMobileMenuOpen(false); }} className="btn btn-primary btn-sm" style={{ justifyContent: 'flex-start' }}>
              <LayoutDashboard size={16} /> Makler Kabineti
            </button>
          )}
          {user?.role === 'ADMIN' && (
            <button onClick={() => { setCurrentTab('admin'); setMobileMenuOpen(false); }} className="btn btn-navy btn-sm" style={{ justifyContent: 'flex-start' }}>
              <ShieldCheck size={16} /> Admin Panel
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
