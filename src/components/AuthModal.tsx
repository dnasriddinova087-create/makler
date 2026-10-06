import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register, quickLogin } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'CLIENT' | 'BROKER'>('CLIENT');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login({ email, password });
      } else {
        await register({
          email,
          password,
          firstName,
          lastName,
          phone: phone || undefined,
          role,
          companyName: role === 'BROKER' ? companyName : undefined,
          specialization: role === 'BROKER' ? specialization : undefined
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (targetRole: 'CLIENT' | 'BROKER' | 'ADMIN') => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(targetRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Tezkor kirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          backgroundColor: '#F1F5F9',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              backgroundColor: tab === 'login' ? '#FFFFFF' : 'transparent',
              color: tab === 'login' ? 'var(--color-navy)' : 'var(--color-text-muted)',
              boxShadow: tab === 'login' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Kirish
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              backgroundColor: tab === 'register' ? '#FFFFFF' : 'transparent',
              color: tab === 'register' ? 'var(--color-navy)' : 'var(--color-text-muted)',
              boxShadow: tab === 'register' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Ro‘yxatdan o‘tish
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Quick Demo Login Bar */}
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.04em' }}>
            ⚡ Tezkor sinov (1-bosishda kirish):
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handleQuick('CLIENT')}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '11px', padding: '6px 4px' }}
            >
              Mijoz
            </button>
            <button
              onClick={() => handleQuick('BROKER')}
              type="button"
              className="btn btn-primary btn-sm"
              style={{ flex: 1, fontSize: '11px', padding: '6px 4px' }}
            >
              Makler
            </button>
            <button
              onClick={() => handleQuick('ADMIN')}
              type="button"
              className="btn btn-navy btn-sm"
              style={{ flex: 1, fontSize: '11px', padding: '6px 4px' }}
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              {/* Role selection */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Siz kimsiz?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <div
                    onClick={() => setRole('CLIENT')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${role === 'CLIENT' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: role === 'CLIENT' ? 'var(--color-primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    Ijarachi (Mijoz)
                  </div>
                  <div
                    onClick={() => setRole('BROKER')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${role === 'BROKER' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: role === 'BROKER' ? 'var(--color-primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    Makler (Agent)
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Ism</label>
                  <input
                    type="text"
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ali"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Familiya</label>
                  <input
                    type="text"
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Valiyev"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Telefon raqam</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                />
              </div>

              {role === 'BROKER' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Agentlik yoki Kompaniya nomi</label>
                    <input
                      type="text"
                      className="form-input"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Grand Estate UZ"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ixtisoslashuv</label>
                    <input
                      type="text"
                      className="form-input"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Kvartiralar, yangi binolar"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="form-group">
            <label className="form-label">Elektron pochta</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.uz"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '12px' }}
          >
            {loading ? 'Bajarilmoqda...' : tab === 'login' ? 'Tizimga kirish' : 'Ro‘yxatdan o‘tish'}
          </button>
        </form>
      </div>
    </div>
  );
};
