import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Home,
  CheckCircle,
  Shield,
  ShieldCheck,
  FileCheck,
  Zap,
  ArrowRight,
  Star,
  Users,
  Building
} from 'lucide-react';
import { Property, Region, User } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';

interface HomePageProps {
  onNavigate: (tab: string, extra?: any) => void;
  onSelectProperty: (property: Property) => void;
  onOpenAuth: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProperty, onOpenAuth }) => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [topBrokers, setTopBrokers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick search form
  const [searchRegion, setSearchRegion] = useState('');
  const [propertyType, setPropertyType] = useState('ALL');
  const [rooms, setRooms] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [propRes, regRes, brokerRes] = await Promise.all([
        api.properties.getAll({ limit: 6, sort: 'views' }),
        api.regions.getAll(),
        api.brokers.getAll()
      ]);

      if (propRes.success) setFeaturedProperties(propRes.data);
      if (regRes.success) setRegions(regRes.data);
      if (brokerRes.success) setTopBrokers(brokerRes.data.slice(0, 4));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('properties', {
      regionId: searchRegion,
      propertyType,
      rooms,
      maxPrice
    });
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 70%, #10B981 180%)',
        color: '#FFFFFF',
        padding: '90px 0 110px',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34D399',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '24px'
            }}>
              <Shield size={16} /> O‘zbekistondagi 1-raqamli ishonchli ijara ekotizimi
            </div>

            <h1 style={{
              fontSize: '48px',
              lineHeight: 1.15,
              color: '#FFFFFF',
              marginBottom: '20px',
              fontFamily: 'var(--font-display)',
              fontWeight: 800
            }}>
              O‘zingizga mos uyni <span style={{ color: 'var(--color-primary)' }}>tez va ishonchli</span> toping.
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#94A3B8',
              lineHeight: 1.6,
              marginBottom: '40px',
              maxWidth: '680px',
              margin: '0 auto 40px'
            }}>
              Soxta e’lonlarsiz, faqat rasman tasdiqlangan maklerlar va davlat standartiga mos ikki tomonlama elektron shartnomalar bilan ijara qiling.
            </p>

            {/* Quick Search Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)',
              textAlign: 'left'
            }}>
              <form onSubmit={handleSearchSubmit} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                alignItems: 'flex-end'
              }}>
                {/* Region */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '13px' }}>Hudud / Viloyat</label>
                  <select
                    className="form-select"
                    value={searchRegion}
                    onChange={(e) => setSearchRegion(e.target.value)}
                  >
                    <option value="">Barcha hududlar</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.nameUz}</option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '13px' }}>Uy turi</label>
                  <select
                    className="form-select"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="ALL">Barchasi</option>
                    <option value="APARTMENT">Kvartira</option>
                    <option value="HOUSE">Hovli uy</option>
                    <option value="YARD">Uy / Dala hovli</option>
                    <option value="DORM">Yotoqxona</option>
                  </select>
                </div>

                {/* Rooms */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '13px' }}>Xonalar soni</label>
                  <select
                    className="form-select"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                  >
                    <option value="ALL">Barchasi</option>
                    <option value="1">1 xona</option>
                    <option value="2">2 xona</option>
                    <option value="3">3 xona</option>
                    <option value="4+">4+ xona</option>
                  </select>
                </div>

                {/* Max price */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '13px' }}>Maks. narx (so‘m)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Masalan: 5 000 000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', height: '46px', fontSize: '15px' }}
                  >
                    <Search size={18} /> Qidirish
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Eng sara takliflar
              </div>
              <h2 style={{ fontSize: '32px' }}>Ommabop va qulay ijara xonadonlari</h2>
            </div>
            <button
              onClick={() => onNavigate('properties')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Barcha uylarni ko‘rish <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="grid-cols-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card skeleton" style={{ height: '360px' }} />
              ))}
            </div>
          ) : (
            <div className="grid-cols-auto">
              {featuredProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onSelect={onSelectProperty}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY IJARA.UZ SECTION */}
      <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 60px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Ishonch va Xavfsizlik
            </div>
            <h2 style={{ fontSize: '34px', marginBottom: '14px' }}>Nima uchun aynan IJARA.UZ?</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>
              Biz oddiy e’lonlar taxtasi emasmiz. Biz O‘zbekistonda uy ijarasi jarayonini qonuniy, shaffof va qulay qilish uchun to‘liq texnologik infratuzilma yaratdik.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            <div className="card" style={{ padding: '32px 24px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Tasdiqlangan Maklerlar</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Platformadagi har bir makler shaxsini tasdiqlovchi hujjatlar bilan to‘liq tekshiruvdan o‘tadi. Soxta va firibgar profillar filtrlanadi.
              </p>
            </div>

            <div className="card" style={{ padding: '32px 24px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <FileCheck size={26} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Elektron Shartnoma Boshqaruvi</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Ijara shartnomasi va qabul qilish akti (Handover Act) onlayn tuziladi, ikki tomonlama tasdiqlanadi va huquqiy xavfsizlikni kafolatlaydi.
              </p>
            </div>

            <div className="card" style={{ padding: '32px 24px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Zap size={26} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Onlayn Uchrashuv & Chat</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Ortiqcha ovoragarchiliksiz to‘g‘ridan-to‘g‘ri sayt orqali ko‘rish uchrashuviga yoziling va makler bilan real vaqtda yozishing.
              </p>
            </div>

            <div className="card" style={{ padding: '32px 24px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Home size={26} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Real va Aniq Ma’lumotlar</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Har bir xonadonning haqiqiy narxi, aniq manzili, jihozlari va hisoblagich ko‘rsatkichlari aniq qayd etiladi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TOP VERIFIED BROKERS */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Professional Xizmat
              </div>
              <h2 style={{ fontSize: '32px' }}>Ishonchli va tasdiqlangan maklerlar</h2>
            </div>
            <button
              onClick={() => onNavigate('brokers')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Barcha maklerlar <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {topBrokers.map((broker) => (
              <div
                key={broker.id}
                onClick={() => onNavigate('brokers', { brokerId: broker.id })}
                className="card card-hover"
                style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}
              >
                <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 16px' }}>
                  <img
                    src={broker.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '4px'
                  }}>
                    <CheckCircle size={14} />
                  </div>
                </div>

                <h3 style={{ fontSize: '17px', marginBottom: '4px' }}>
                  {broker.firstName} {broker.lastName}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                  {broker.profile?.companyName || 'Ko‘chmas mulk mutaxassisi'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '12px', marginBottom: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#D97706' }}>
                    <Star size={14} fill="#D97706" /> {broker.profile?.ratingAvg || 5.0}
                  </span>
                  <span>•</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {broker.profile?.experienceYears || 5} yil tajriba
                  </span>
                </div>

                <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  Profilni ko‘rish
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #0B132B 0%, #10B981 120%)',
        color: '#FFFFFF'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <h2 style={{ fontSize: '38px', color: '#FFFFFF', marginBottom: '16px' }}>
            Uyingizni ijaraga bermoqchimisiz yoki qidiryapsizmi?
          </h2>
          <p style={{ fontSize: '17px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '36px' }}>
            Bugunoq IJARA.UZ platformasiga qo‘shiling va minglab tekshirilgan mijozlar hamda professional maklerlar bilan ishonchli hamkorlikni boshlang.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('properties')}
              className="btn btn-primary btn-lg"
              style={{ padding: '16px 36px', fontSize: '16px' }}
            >
              Uy qidirishni boshlash
            </button>
            <button
              onClick={onOpenAuth}
              className="btn btn-secondary btn-lg"
              style={{ padding: '16px 36px', fontSize: '16px', backgroundColor: 'transparent', color: '#FFFFFF', borderColor: '#FFFFFF' }}
            >
              Makler sifatida qo‘shilish
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
