import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  Star,
  ShieldCheck,
  Building,
  Phone,
  MessageSquare,
  Award
} from 'lucide-react';
import { User, Property } from '../types';
import { api } from '../services/api';
import { CallModal } from '../components/CallModal';

interface BrokersPageProps {
  onSelectProperty: (property: Property) => void;
  onStartChat: (brokerId: string) => void;
  onOpenAuth: () => void;
}

export const BrokersPage: React.FC<BrokersPageProps> = ({ onSelectProperty, onStartChat, onOpenAuth }) => {
  const [brokers, setBrokers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrokerForCall, setSelectedBrokerForCall] = useState<any | null>(null);

  useEffect(() => {
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    try {
      setLoading(true);
      const res = await api.brokers.getAll();
      if (res.success) {
        setBrokers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrokers = brokers.filter((b) => {
    const fullName = `${b.firstName} ${b.lastName} ${b.profile?.companyName || ''} ${b.profile?.specialization || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-hover)', fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>
          <ShieldCheck size={16} /> Faqat Hujjatlari Tekshirilgan Mutaxassislar
        </div>
        <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>Professional Maklerlar</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>
          O‘zbekiston bo‘yicha tajribali, mijozlar tomonidan yuqori baholangan va shartnoma xavfsizligini ta’minlovchi ishonchli agentlar.
        </p>

        {/* Search */}
        <div style={{ position: 'relative', marginTop: '24px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '44px' }}
            placeholder="Makler ismi, agentlik yoki ixtisoslashuv bo‘yicha qidiring..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid-cols-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton" style={{ height: '320px' }} />
          ))}
        </div>
      ) : filteredBrokers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <Users size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3>Maklerlar topilmadi</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Qidiruv so‘zini o‘zgartirib ko‘ring.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredBrokers.map((b) => (
            <div key={b.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                  <img
                    src={b.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                  />
                  {b.isVerified && (
                    <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: '50%', padding: '3px' }}>
                      <CheckCircle size={14} />
                    </div>
                  )}
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700 }}>
                      {b.firstName} {b.lastName}
                    </h3>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {b.profile?.companyName || 'Mustaqil makler'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#D97706' }}>
                      <Star size={13} fill="#D97706" /> {b.profile?.ratingAvg || 5.0}
                    </span>
                    <span>•</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {b.profile?.experienceYears || 3} yil tajriba
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio / Specialization */}
              <p style={{
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                marginBottom: '16px',
                flexGrow: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {b.profile?.bio || 'Kvartiralar, hovlilar va tijorat binolari ijarasida professional yordam.'}
              </p>

              {/* Stats badges */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Muvaffaqiyatli: </span>
                  <strong style={{ color: 'var(--color-navy)' }}>{b.profile?.totalDeals || 45}+</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Javob vaqti: </span>
                  <strong style={{ color: 'var(--color-navy)' }}>{b.profile?.responseTimeMin || 15} daq</strong>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onStartChat(b.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <MessageSquare size={14} color="var(--color-primary)" /> Chat
                </button>
                <button
                  onClick={() => setSelectedBrokerForCall(b)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Phone size={14} /> Bog‘lanish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBrokerForCall && (
        <CallModal
          broker={selectedBrokerForCall}
          onClose={() => setSelectedBrokerForCall(null)}
        />
      )}
    </div>
  );
};
