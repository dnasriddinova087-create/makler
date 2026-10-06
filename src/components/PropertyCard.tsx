import React from 'react';
import { Heart, Star, MapPin, Maximize, Layers, ShieldCheck } from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const { isFavorite, toggleFavorite, user } = useAuth();
  const favorite = isFavorite(property.id);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ` ${currency === 'USD' ? '$' : 'so‘m'}`;
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(property.id);
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const primaryImage =
    property.images?.find((img) => img.isPrimary)?.url ||
    property.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={() => onSelect(property)}
      className="card card-hover"
      style={{
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%'
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: '#E2E8F0' }}>
        <img
          src={primaryImage}
          alt={property.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          title={favorite ? 'Sevimlilardan o‘chirish' : 'Sevimlilarga qo‘shish'}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition)'
          }}
        >
          <Heart
            size={18}
            fill={favorite ? '#EF4444' : 'none'}
            color={favorite ? '#EF4444' : '#1E293B'}
          />
        </button>

        {/* Badge: Rent period & Property type */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          <span className="badge badge-navy" style={{ fontSize: '11px', backdropFilter: 'blur(4px)' }}>
            {property.propertyType === 'APARTMENT' ? 'Kvartira' : property.propertyType === 'HOUSE' ? 'Hovli' : 'Uy'}
          </span>
          {property.furnished && (
            <span className="badge badge-green" style={{ fontSize: '11px', backgroundColor: 'rgba(236, 253, 245, 0.95)' }}>
              Mebelli
            </span>
          )}
        </div>

        {/* Rating badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'rgba(11, 19, 43, 0.85)',
          color: '#F59E0B',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 700
        }}>
          <Star size={13} fill="#F59E0B" />
          <span>{property.rating ? property.rating.toFixed(1) : '5.0'}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Price */}
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}>
            {formatPrice(property.price, property.currency)}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            / {property.rentPeriod === 'DAILY' ? 'kun' : 'oy'}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--color-navy)',
          marginBottom: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.35
        }}>
          {property.title}
        </h3>

        {/* Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          marginBottom: '14px'
        }}>
          <MapPin size={15} color="var(--color-primary)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {property.district?.nameUz || 'Toshkent'}, {property.region?.nameUz || ''}
          </span>
        </div>

        {/* Key Features row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '12px',
          color: 'var(--color-text-main)',
          fontWeight: 600,
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={14} color="var(--color-text-muted)" />
            <span>{property.rooms} xona</span>
          </div>
          <div>•</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Maximize size={14} color="var(--color-text-muted)" />
            <span>{property.area} m²</span>
          </div>
          <div>•</div>
          <div>
            <span>{property.floor || 1}/{property.totalFloors || 9}-qavat</span>
          </div>
        </div>

        {/* Broker mini badge */}
        {property.broker && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px dashed var(--color-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={property.broker.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt=""
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {property.broker.firstName} {property.broker.lastName}
              </span>
            </div>
            {property.broker.isVerified && (
              <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 6px' }}>
                <ShieldCheck size={12} /> Tasdiqlangan
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
