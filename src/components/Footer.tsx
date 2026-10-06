import React from 'react';
import { Building, ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer style={{
      backgroundColor: 'var(--color-navy)',
      color: '#F8FAFC',
      paddingTop: '60px',
      paddingBottom: '30px',
      marginTop: '80px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Building size={22} />
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                IJARA<span style={{ color: 'var(--color-primary)' }}>.UZ</span>
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '20px' }}>
              O‘zbekiston bo‘ylab uy ijarasi, tasdiqlangan maklerlar va ijarachilarni birlashtiruvchi zamonaviy hamda xavfsiz platforma.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontSize: '13px', fontWeight: 600 }}>
              <ShieldCheck size={16} /> 100% Rasmiy Shartnomalar
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '18px' }}>Platforma</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#94A3B8' }}>
              <li>
                <button onClick={() => onNavigate('home')} style={{ color: 'inherit', textAlign: 'left' }}>Bosh sahifa</button>
              </li>
              <li>
                <button onClick={() => onNavigate('properties')} style={{ color: 'inherit', textAlign: 'left' }}>Barcha Uylar</button>
              </li>
              <li>
                <button onClick={() => onNavigate('brokers')} style={{ color: 'inherit', textAlign: 'left' }}>Tasdiqlangan Maklerlar</button>
              </li>
              <li>
                <button onClick={() => onNavigate('contracts')} style={{ color: 'inherit', textAlign: 'left' }}>Elektron Shartnomalar</button>
              </li>
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '18px' }}>Mashhur Hududlar</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#94A3B8' }}>
              <li>Toshkent shahri (Chilonzor, Yunusobod, Mirzo Ulug‘bek)</li>
              <li>Samarqand shahri</li>
              <li>Buxoro shahri</li>
              <li>Farg‘ona va Andijon</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '18px' }}>Bog‘lanish</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#94A3B8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} color="var(--color-primary)" /> Toshkent shahri, O‘zbekiston
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="var(--color-primary)" /> +998 (71) 200-00-00
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="var(--color-primary)" /> info@ijara.uz
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px',
          color: '#64748B'
        }}>
          <div>© {new Date().getFullYear()} IJARA.UZ — Barcha huquqlar himoyalangan.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            O‘zbekistonda mehr bilan yaratilgan <Heart size={14} color="#EF4444" fill="#EF4444" />
          </div>
        </div>
      </div>
    </footer>
  );
};
