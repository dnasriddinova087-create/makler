import React, { useState } from 'react';
import { ShieldCheck, Lock, X, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminPassModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPassModal: React.FC<AdminPassModalProps> = ({ onClose, onSuccess }) => {
  const { login } = useAuth();
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminCode.trim() !== 'makler.2026') {
      setError('Noto‘g‘ri boshqaruv kodi! Faqat platforma egasi (Dilfuza Nasriddinova) ruxsatiga ega.');
      return;
    }

    try {
      setLoading(true);
      await login({
        email: 'dnasriddinova087@gmail.com',
        password: 'makler.2026'
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#0B132B',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <ShieldCheck size={36} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
          Platforma Boshqaruvchisi
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Tizim egasi: <strong>Dilfuza Nasriddinova</strong>
        </p>

        <div style={{
          padding: '8px 12px',
          backgroundColor: '#EFF6FF',
          borderRadius: '8px',
          border: '1px solid #BFDBFE',
          color: '#1D4ED8',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          🔒 Admin panelga kirish uchun maxsus boshqaruv kodini kiriting
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
            <label className="form-label">Admin Maxsus Paroli</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px', fontSize: '16px', letterSpacing: '0.1em' }}
                placeholder="••••••••"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Eslatma: Parol <code>makler.2026</code>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-navy"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {loading ? 'Tekshirilmoqda...' : (
              <>
                Admin Panelga Kirish <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
