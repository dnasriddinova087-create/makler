import React, { useState, useEffect } from 'react';
import { Heart, Building, ArrowRight } from 'lucide-react';
import { Property } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';

interface FavoritesPageProps {
  onSelectProperty: (property: Property) => void;
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onSelectProperty, onNavigate, onOpenAuth }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.favorites.getAll();
      if (res.success) {
        setFavorites(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Heart size={48} color="var(--color-danger)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Sevimlilarni ko‘rish uchun tizimga kiring</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '24px' }}>
          O‘zingizga yoqqan xonadonlarni saqlab qo‘yish va keyinroq ko‘rish uchun hisobingizga kiring.
        </p>
        <button onClick={onOpenAuth} className="btn btn-primary">
          Tizimga kirish
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Saqlangan uylar</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Siz saqlab qo‘ygan xonadonlar ({favorites.length} ta)
        </p>
      </div>

      {loading ? (
        <div className="grid-cols-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton" style={{ height: '360px' }} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)'
        }}>
          <Building size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Hozircha saqlangan uylar yo‘q</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            Katalogdan o‘zingizga yoqqan e’lonlardagi yurakcha tugmasini bosib saqlab qo‘yishingiz mumkin.
          </p>
          <button onClick={() => onNavigate('properties')} className="btn btn-primary">
            Uylarni ko‘rish <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="grid-cols-auto">
          {favorites.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      )}
    </div>
  );
};
