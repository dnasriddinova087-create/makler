import React, { useState } from 'react';
import { Calendar, Clock, X, CheckCircle } from 'lucide-react';
import { Property } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ViewingModalProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

export const ViewingModal: React.FC<ViewingModalProps> = ({ property, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Iltimos, avval tizimga kiring');
      return;
    }
    if (!date) {
      setError('Sana tanlanishi shart');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const scheduledTime = new Date(`${date}T${time}:00`).toISOString();
      await api.viewings.create({
        propertyId: property.id,
        scheduledTime,
        notes: notes || undefined
      });
      setDone(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Uyni ko‘rishga yozilish</h3>
          <button onClick={onClose} style={{ padding: '4px', borderRadius: '50%', color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>So‘rovingiz yuborildi!</h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              Makler tez orada ko‘rish vaqtini tasdiqlaydi va sizga bildirishnoma yuboriladi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)' }}>{property.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{property.address}</div>
            </div>

            {error && (
              <div style={{ padding: '10px', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Sana tanlang</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Qulay vaqt</label>
              <select className="form-select" value={time} onChange={(e) => setTime(e.target.value)}>
                <option value="10:00">10:00 - Ertalab</option>
                <option value="12:00">12:00 - Tushlik</option>
                <option value="14:00">14:00 - Peshin</option>
                <option value="16:00">16:00 - Tushdan keyin</option>
                <option value="18:00">18:00 - Kechki payt</option>
                <option value="19:30">19:30 - Kechki payt</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Qo‘shimcha izoh (ixtiyoriy)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Masalan: oilamiz bilan kelamiz yoki metrodan kutib olasizmi..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Bekor qilish
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                {loading ? 'Yuborilmoqda...' : 'Tasdiqlash'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
