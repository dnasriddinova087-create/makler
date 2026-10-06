import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Heart,
  Share2,
  Calendar,
  MessageSquare,
  Phone,
  AlertTriangle,
  Star,
  CheckCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Layers,
  Building,
  Check,
  Send
} from 'lucide-react';
import { Property, Review } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ViewingModal } from '../components/ViewingModal';
import { ReportModal } from '../components/ReportModal';
import { CallModal } from '../components/CallModal';

interface PropertyDetailPageProps {
  propertyId: string;
  onBack: () => void;
  onStartChat: (brokerId: string, propertyId: string) => void;
  onOpenAuth: () => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  propertyId,
  onBack,
  onStartChat,
  onOpenAuth
}) => {
  const { user, isFavorite, toggleFavorite } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Modals
  const [viewingModalOpen, setViewingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);

  // Review submission
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [propertyId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await api.properties.getById(propertyId);
      if (res.success) {
        setProperty(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      await api.reviews.create({
        targetUserId: property?.brokerId,
        propertyId: property?.id,
        rating: reviewRating,
        comment: reviewComment,
        roleScope: 'PROPERTY'
      });
      setReviewComment('');
      loadDetails();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <div className="card skeleton" style={{ height: '400px', marginBottom: '24px' }} />
        <div className="card skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Mulk topilmadi</h2>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Ortga qaytish
        </button>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ id: '1', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', isPrimary: true, order: 0 }];

  const favorite = isFavorite(property.id);

  return (
    <div className="container" style={{ padding: '30px 20px 80px' }}>
      {/* Top back & actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronLeft size={16} /> Barcha uylarga qaytish
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => toggleFavorite(property.id)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Heart size={16} fill={favorite ? '#EF4444' : 'none'} color={favorite ? '#EF4444' : 'currentColor'} />
            {favorite ? 'Saqlangan' : 'Saqlash'}
          </button>
          <button
            onClick={() => setReportModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AlertTriangle size={16} /> Shikoyat qilish
          </button>
        </div>
      </div>

      {/* Main Title & Price Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{property.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            <MapPin size={16} color="var(--color-primary)" />
            <span>{property.address}, {property.district?.nameUz}, {property.region?.nameUz}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}>
            {new Intl.NumberFormat('uz-UZ').format(property.price)} {property.currency === 'USD' ? '$' : 'so‘m'}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            har {property.rentPeriod === 'DAILY' ? 'kun' : 'oy'} uchun
          </div>
        </div>
      </div>

      {/* Image Gallery Slider */}
      <div style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        height: '480px',
        backgroundColor: '#0B132B',
        marginBottom: '30px'
      }}>
        <img
          src={images[activeImageIdx]?.url}
          alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Thumbnails overlay */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          padding: '8px 12px',
          backgroundColor: 'rgba(11, 19, 43, 0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: '9999px'
        }}>
          {images.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setActiveImageIdx(idx)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: activeImageIdx === idx ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'flex-start' }} className="detail-layout">
        {/* Left Column: Specs, Description, Amenities, Map, Reviews */}
        <div>
          {/* Key Specs Card */}
          <div className="card" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Xonalar</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)' }}>{property.rooms} xona</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Maydon</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)' }}>{property.area} m²</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Qavat</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)' }}>{property.floor || 1}/{property.totalFloors || 9}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Jihozi</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: property.furnished ? 'var(--color-primary-hover)' : 'var(--color-navy)' }}>
                {property.furnished ? 'Mebelli' : 'Mebelsiz'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '14px' }}>Xonadon haqida batafsil</h3>
            <p style={{ fontSize: '15px', color: 'var(--color-text-main)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Qulayliklar va jihozlar</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {property.amenities?.map((a) => (
                <div
                  key={a.amenity.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px'
                  }}
                >
                  <Check size={16} color="var(--color-primary)" />
                  <span>{a.amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Preview */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '14px' }}>Xaritada joylashuvi</h3>
            <div style={{
              height: '240px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#E2E8F0',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, #CBD5E1 10%, #94A3B8 100%)'
            }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '16px 24px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                textAlign: 'center'
              }}>
                <MapPin size={32} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{property.address}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {property.district?.nameUz}, {property.region?.nameUz}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px' }}>Sharhlar va baholar ({property.reviews?.length || 0})</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: 700, color: '#D97706' }}>
                <Star size={18} fill="#D97706" /> {property.rating ? property.rating.toFixed(1) : '5.0'} / 5.0
              </div>
            </div>

            {/* Submit review */}
            {user ? (
              <form onSubmit={handleReviewSubmit} style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Sharh qoldirish</label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Star size={22} fill={reviewRating >= star ? '#F59E0B' : 'none'} color="#F59E0B" />
                    </button>
                  ))}
                </div>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Xonadon va xizmat sifati bo‘yicha o‘z fikringizni bildiring..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '10px' }}
                >
                  <Send size={14} /> Sharhni yuborish
                </button>
              </form>
            ) : (
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
                Sharh qoldirish uchun <button onClick={onOpenAuth} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>tizimga kiring</button>.
              </div>
            )}

            {/* Review items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {property.reviews && property.reviews.length > 0 ? (
                property.reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                          {rev.author?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700 }}>{rev.author?.firstName} {rev.author?.lastName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {new Date(rev.createdAt).toLocaleDateString('uz-UZ')}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-main)', marginTop: '6px' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Hozircha sharhlar yo‘q.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Broker Card & Sticky Action Buttons */}
        <div style={{ position: 'sticky', top: '96px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Broker Information */}
          <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 16px' }}>
              <img
                src={property.broker?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'}
                alt=""
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }}
              />
              {property.broker?.isVerified && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: '50%', padding: '4px' }}>
                  <ShieldCheck size={16} />
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>
              {property.broker?.firstName} {property.broker?.lastName}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
              {property.broker?.profile?.companyName || 'Sertifikatlangan ko‘chmas mulk mutaxassisi'}
            </p>

            {property.broker?.isVerified && (
              <span className="badge badge-green" style={{ marginBottom: '16px' }}>
                <ShieldCheck size={14} /> Shaxsi Tasdiqlangan Makler
              </span>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '12px 0',
              borderTop: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: '20px',
              fontSize: '12px'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-navy)' }}>
                  {property.broker?.profile?.ratingAvg || 5.0} ⭐
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>Reyting</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-navy)' }}>
                  {property.broker?.profile?.totalDeals || 120}+
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>Kelishuv</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-navy)' }}>
                  {property.broker?.profile?.responseTimeMin || 10} daq
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>Javob vaqti</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => setViewingModalOpen(true)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                <Calendar size={18} /> Uyni ko‘rishga yozilish
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    onOpenAuth();
                    return;
                  }
                  onStartChat(property.brokerId, property.id);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '12px' }}
              >
                <MessageSquare size={18} color="var(--color-primary)" /> Makler bilan chat
              </button>

              <button
                onClick={() => setCallModalOpen(true)}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '12px' }}
              >
                <Phone size={18} /> Telefon raqami
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewingModalOpen && (
        <ViewingModal
          property={property}
          onClose={() => setViewingModalOpen(false)}
          onSuccess={() => setViewingModalOpen(false)}
        />
      )}

      {reportModalOpen && (
        <ReportModal
          targetType="PROPERTY"
          targetId={property.id}
          targetTitle={property.title}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {callModalOpen && (
        <CallModal
          broker={property.broker}
          onClose={() => setCallModalOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
