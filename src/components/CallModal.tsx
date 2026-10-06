import React from 'react';
import { Phone, Send, ShieldAlert, X, Copy, Check } from 'lucide-react';
import { User } from '../types';

interface CallModalProps {
  broker: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    avatarUrl?: string | null;
    profile?: any;
  };
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ broker, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const phoneNumber = broker.phone || '+998 90 123 45 67';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        <img
          src={broker.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
          alt=""
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '3px solid var(--color-primary)' }}
        />

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '4px' }}>
          {broker.firstName} {broker.lastName}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          {broker.profile?.companyName || 'Sertifikatlangan ko‘chmas mulk mutaxassisi'}
        </p>

        {/* Phone box */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={20} color="var(--color-primary)" />
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--color-navy)' }}>
              {phoneNumber}
            </span>
          </div>
          <button
            onClick={copyToClipboard}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 10px' }}
          >
            {copied ? <Check size={16} color="var(--color-primary)" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <a
            href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
            className="btn btn-primary"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            <Phone size={16} /> Qo‘ng‘iroq qilish
          </a>
          {broker.profile?.telegram && (
            <a
              href={`https://t.me/${broker.profile.telegram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ flex: 1, textDecoration: 'none' }}
            >
              <Send size={16} color="#0284C7" /> Telegram
            </a>
          )}
        </div>

        {/* Safety Warning */}
        <div style={{
          backgroundColor: 'var(--color-warning-bg)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          gap: '10px',
          textAlign: 'left',
          fontSize: '12px',
          color: '#92400E'
        }}>
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Xavfsizlik eslatmasi:</strong> Uyni shaxsan ko‘rib, shartnoma imzolamasdan oldin hech qanday oldindan to‘lov qilmang.
          </span>
        </div>
      </div>
    </div>
  );
};
