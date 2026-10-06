import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ReportModalProps {
  targetType: 'PROPERTY' | 'USER';
  targetId: string;
  targetTitle: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ targetType, targetId, targetTitle, onClose }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('FAKE_PROPERTY');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Shikoyat qoldirish uchun tizimga kirishingiz shart');
      return;
    }
    if (!description.trim()) {
      setError('Iltimos, batafsil sababni yozib qoldiring');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.reports.create({
        targetType,
        targetId,
        reason,
        description
      });
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)' }}>Shikoyat qilish</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={44} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '17px', marginBottom: '6px' }}>Shikoyatingiz qabul qilindi</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Moderatorlarimiz tez fursatda tekshiruv o‘tkazadi va zarur choralarni ko‘radi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Ob’yekt: <strong>{targetTitle}</strong>
            </div>

            {error && (
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Shikoyat sababi</label>
              <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="FAKE_PROPERTY">Soxta e’lon / uy mavjud emas</option>
                <option value="WRONG_PRICE">Narx noto‘g‘ri yoki aldov</option>
                <option value="WRONG_PHOTOS">Rasmlar boshqa uyga tegishli</option>
                <option value="FAKE_BROKER">Soxta makler / firibgarlik</option>
                <option value="SCAM">Firibgarlik xavfi (oldindan to‘lov talab qilish)</option>
                <option value="OFFENSIVE">Haqoratomuz yoki nojo‘ya ma’lumot</option>
                <option value="OTHER">Boshqa sabab</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Batafsil tushuntirish</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Vaziyatni qisqacha bayon qiling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Bekor qilish
              </button>
              <button type="submit" disabled={loading} className="btn btn-danger" style={{ flex: 1 }}>
                {loading ? 'Yuborilmoqda...' : 'Shikoyat yuborish'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
