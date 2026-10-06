import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  Calendar,
  FileText,
  Eye,
  Heart,
  Phone,
  CheckCircle,
  Clock,
  X,
  Trash2,
  Edit,
  Upload,
  ArrowRight
} from 'lucide-react';
import { Property, Region, District, Viewing } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const BrokerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'listings' | 'create' | 'viewings'>('stats');

  const [stats, setStats] = useState<any>(null);
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [myViewings, setMyViewings] = useState<Viewing[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // WIZARD FORM STATE
  const [wizardStep, setWizardStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'UZS' | 'USD'>('UZS');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [rooms, setRooms] = useState('2');
  const [area, setArea] = useState('60');
  const [floor, setFloor] = useState('3');
  const [totalFloors, setTotalFloors] = useState('9');
  const [furnished, setFurnished] = useState(true);
  const [address, setAddress] = useState('');
  const [regionId, setRegionId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, listRes, viewRes, regRes, amRes] = await Promise.all([
        api.brokers.getMyStats(),
        api.properties.getMyListings(),
        api.viewings.getAll(),
        api.regions.getAll(),
        api.properties.getAmenities()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (listRes.success) setMyListings(listRes.data);
      if (viewRes.success) setMyViewings(viewRes.data);
      if (regRes.success) {
        setRegions(regRes.data);
        if (regRes.data.length > 0) setRegionId(regRes.data[0].id);
      }
      if (amRes.success) setAmenitiesList(amRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentDistricts = React.useMemo(() => {
    const reg = regions.find((r) => r.id === regionId);
    return reg?.districts || [];
  }, [regionId, regions]);

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePublishProperty = async (status: 'APPROVED' | 'DRAFT') => {
    setFormError('');
    if (!title || !description || !price || !address || !regionId || !districtId) {
      setFormError('Barcha majburiy maydonlarni to‘ldiring');
      return;
    }

    try {
      setSubmitting(true);
      await api.properties.create({
        title,
        description,
        price: Number(price),
        currency,
        propertyType,
        rooms: Number(rooms),
        area: Number(area),
        floor: Number(floor),
        totalFloors: Number(totalFloors),
        furnished,
        address,
        regionId,
        districtId,
        images,
        amenityIds: selectedAmenities,
        status
      });

      alert(status === 'APPROVED' ? 'E’lon muvaffaqiyatli chop etildi!' : 'E’lon qoralama (draft) sifatida saqlandi!');
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setAddress('');
      setWizardStep(1);
      setActiveTab('listings');
      loadDashboardData();
    } catch (e: any) {
      setFormError(e.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Haqiqatan ham ushbu e’lonni o‘chirmoqchimisiz?')) return;
    try {
      await api.properties.delete(id);
      loadDashboardData();
    } catch (e: any) {
      alert(e.message || 'O‘chirib bo‘lmadi');
    }
  };

  const handleUpdateViewing = async (id: string, status: string) => {
    try {
      await api.viewings.updateStatus(id, status);
      loadDashboardData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Broker Profile Header Banner */}
      <div style={{
        backgroundColor: 'var(--color-navy)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '30px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
            alt=""
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', color: '#FFFFFF' }}>{user?.firstName} {user?.lastName}</h1>
              <span className="badge badge-green" style={{ fontSize: '11px' }}>
                <CheckCircle size={13} /> Tasdiqlangan Makler
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
              {user?.profile?.companyName || 'Sertifikatlangan ko‘chmas mulk agentligi'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('create')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PlusCircle size={18} /> Yangi e’lon qo‘shish
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('stats')}
          className={`btn btn-sm ${activeTab === 'stats' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <LayoutDashboard size={16} /> Statistika
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`btn btn-sm ${activeTab === 'listings' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Building size={16} /> Mening e’lonlarim ({myListings.length})
        </button>
        <button
          onClick={() => setActiveTab('viewings')}
          className={`btn btn-sm ${activeTab === 'viewings' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Calendar size={16} /> Uchrashuvlar ({myViewings.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`btn btn-sm ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <PlusCircle size={16} /> E’lon yaratish (Wizard)
        </button>
      </div>

      {/* 1. STATS TAB */}
      {activeTab === 'stats' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Ko‘rishlar soni</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={24} color="var(--color-primary)" /> {stats?.totalViews || 0}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Saqlashlar</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={24} color="#EF4444" /> {stats?.savedCount || 0}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Ko‘rish so‘rovlari</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={24} color="#3B82F6" /> {stats?.viewingsCount || 0}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Faol shartnomalar</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={24} color="#10B981" /> {stats?.activeContractsCount || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <Building size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3>Sizda hali e’lonlar yo‘q</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Yangi kvartira yoki uy e’lonini qo‘shing.
              </p>
              <button onClick={() => setActiveTab('create')} className="btn btn-primary">
                Yangi e’lon yaratish
              </button>
            </div>
          ) : (
            myListings.map((prop) => (
              <div key={prop.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{prop.title}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {prop.address} • {new Intl.NumberFormat('uz-UZ').format(prop.price)} {prop.currency}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge ${prop.status === 'APPROVED' ? 'badge-green' : 'badge-yellow'}`}>
                    {prop.status}
                  </span>
                  <button
                    onClick={() => handleDeleteListing(prop.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={16} /> O‘chirish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. VIEWINGS TAB */}
      {activeTab === 'viewings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {myViewings.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
              Uchrashuv so‘rovlari mavjud emas.
            </p>
          ) : (
            myViewings.map((v) => (
              <div key={v.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{v.property?.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Mijoz: {v.client?.firstName} {v.client?.lastName} ({v.client?.phone || 'Telefon kiritilmagan'})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-navy)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {new Date(v.scheduledTime).toLocaleString('uz-UZ')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${v.status === 'CONFIRMED' ? 'badge-green' : v.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}`}>
                    {v.status}
                  </span>
                  {v.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateViewing(v.id, 'CONFIRMED')}
                        className="btn btn-primary btn-sm"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => handleUpdateViewing(v.id, 'CANCELLED')}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        Rad etish
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. CREATE PROPERTY WIZARD TAB */}
      {activeTab === 'create' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
          {/* Step tracker */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
            {['Asosiy ma’lumotlar', 'Joylashuv & Parametrlar', 'Rasmlar & Qulayliklar'].map((label, idx) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: wizardStep >= idx + 1 ? 'var(--color-primary)' : '#E2E8F0',
                  color: wizardStep >= idx + 1 ? '#FFFFFF' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  {idx + 1}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: wizardStep >= idx + 1 ? 'var(--color-navy)' : 'var(--color-text-muted)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {formError && (
            <div style={{ padding: '12px', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
              {formError}
            </div>
          )}

          {/* STEP 1 */}
          {wizardStep === 1 && (
            <div>
              <div className="form-group">
                <label className="form-label">E’lon sarlavhasi</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masalan: Chilonzorda metroga yaqin 2 xonali shinam kvartira"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Ijara narxi</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Masalan: 4500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Valyuta</label>
                  <select className="form-select" value={currency} onChange={(e: any) => setCurrency(e.target.value)}>
                    <option value="UZS">UZS (so‘m)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Batafsil tavsif</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Xonadonning holati, qo‘shnilar, atrofidagi infratuzilma haqida batafsil yozing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setWizardStep(2)} className="btn btn-primary">
                  Keyingisi <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {wizardStep === 2 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Viloyat / Shahar</label>
                  <select
                    className="form-select"
                    value={regionId}
                    onChange={(e) => { setRegionId(e.target.value); setDistrictId(''); }}
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.nameUz}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tuman</label>
                  <select
                    className="form-select"
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                  >
                    <option value="">Tanlang</option>
                    {currentDistricts.map((d) => (
                      <option key={d.id} value={d.id}>{d.nameUz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Aniq ko‘cha va uy manzili</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Masalan: Chilonzor 2-mavze, 15-uy, 42-xonadon"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Uy turi</label>
                  <select className="form-select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                    <option value="APARTMENT">Kvartira</option>
                    <option value="HOUSE">Hovli</option>
                    <option value="YARD">Dala hovli</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Xonalar</label>
                  <input type="number" className="form-input" value={rooms} onChange={(e) => setRooms(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Maydon (m²)</label>
                  <input type="number" className="form-input" value={area} onChange={(e) => setArea(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Qavat</label>
                  <input type="number" className="form-input" value={floor} onChange={(e) => setFloor(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" onClick={() => setWizardStep(1)} className="btn btn-secondary">
                  Ortga
                </button>
                <button type="button" onClick={() => setWizardStep(3)} className="btn btn-primary">
                  Keyingisi <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {wizardStep === 3 && (
            <div>
              {/* Image urls input */}
              <div className="form-group">
                <label className="form-label">Xonadon rasmlari (URL)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <button type="button" onClick={handleAddImage} className="btn btn-secondary">
                    Qo‘shish
                  </button>
                </div>
              </div>

              {/* Added images list */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '100px', height: '70px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: '2px'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Amenities checkboxes */}
              <div className="form-group">
                <label className="form-label">Qulayliklar</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                  {amenitiesList.map((a) => (
                    <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(a.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedAmenities([...selectedAmenities, a.id]);
                          else setSelectedAmenities(selectedAmenities.filter((id) => id !== a.id));
                        }}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span>{a.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', gap: '10px' }}>
                <button type="button" onClick={() => setWizardStep(2)} className="btn btn-secondary">
                  Ortga
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handlePublishProperty('DRAFT')}
                    className="btn btn-secondary"
                  >
                    Qoralama saqlash
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handlePublishProperty('APPROVED')}
                    className="btn btn-primary"
                  >
                    {submitting ? 'Saqlanmoqda...' : 'Chop etish'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
