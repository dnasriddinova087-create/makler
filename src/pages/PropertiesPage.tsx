import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Layers,
  ArrowUpDown,
  Home
} from 'lucide-react';
import { Property, Region, District } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';

interface PropertiesPageProps {
  initialFilters?: any;
  onSelectProperty: (property: Property) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ initialFilters = {}, onSelectProperty }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<{ id: string; name: string; iconKey: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(initialFilters.regionId || '');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState(initialFilters.propertyType || 'ALL');
  const [selectedRooms, setSelectedRooms] = useState(initialFilters.rooms || 'ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [furnished, setFurnished] = useState('ALL');
  const [rentPeriod, setRentPeriod] = useState('ALL');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  // Mobile filters open
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Available districts for chosen region
  const currentDistricts: District[] = React.useMemo(() => {
    if (!selectedRegion) return [];
    const reg = regions.find((r) => r.id === selectedRegion);
    return reg?.districts || [];
  }, [selectedRegion, regions]);

  useEffect(() => {
    loadRegionsAndAmenities();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProperties();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    selectedRegion,
    selectedDistrict,
    selectedType,
    selectedRooms,
    minPrice,
    maxPrice,
    furnished,
    rentPeriod,
    selectedAmenities,
    sortBy,
    currentPage
  ]);

  const loadRegionsAndAmenities = async () => {
    try {
      const [regRes, amRes] = await Promise.all([
        api.regions.getAll(),
        api.properties.getAmenities()
      ]);
      if (regRes.success) setRegions(regRes.data);
      if (amRes.success) setAmenitiesList(amRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.properties.getAll({
        search: searchTerm || undefined,
        regionId: selectedRegion || undefined,
        districtId: selectedDistrict || undefined,
        propertyType: selectedType !== 'ALL' ? selectedType : undefined,
        rooms: selectedRooms !== 'ALL' ? selectedRooms : undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        furnished: furnished !== 'ALL' ? furnished : undefined,
        rentPeriod: rentPeriod !== 'ALL' ? rentPeriod : undefined,
        amenityIds: selectedAmenities.length > 0 ? selectedAmenities.join(',') : undefined,
        sort: sortBy,
        page: currentPage,
        limit: 9
      });

      if (res.success) {
        setProperties(res.data);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityToggle = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedType('ALL');
    setSelectedRooms('ALL');
    setMinPrice('');
    setMaxPrice('');
    setFurnished('ALL');
    setRentPeriod('ALL');
    setSelectedAmenities([]);
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Search Header Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Main search box */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '44px' }}
              placeholder="Shahar, tuman, mahalla yoki manzil bo‘yicha qidiring..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '14px', top: '14px', color: 'var(--color-text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={16} color="var(--color-text-muted)" />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '170px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Eng yangilari</option>
              <option value="price_asc">Eng arzon narx</option>
              <option value="price_desc">Eng qimmat narx</option>
              <option value="views">Eng ko‘p ko‘rilgan</option>
              <option value="rating">Yuqori reyting</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="btn btn-secondary mobile-filter-btn"
          >
            <SlidersHorizontal size={16} /> Filtrlar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', alignItems: 'flex-start' }} className="catalog-layout">
        {/* FILTERS SIDEBAR */}
        <aside className={`filters-sidebar ${filtersOpen ? 'open' : ''}`} style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} color="var(--color-primary)" /> Filtrlar
            </h3>
            <button onClick={handleClearFilters} style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
              Tozalash
            </button>
          </div>

          {/* Region */}
          <div className="form-group">
            <label className="form-label">Viloyat / Shahar</label>
            <select
              className="form-select"
              value={selectedRegion}
              onChange={(e) => { setSelectedRegion(e.target.value); setSelectedDistrict(''); }}
            >
              <option value="">Barchasi</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.nameUz}</option>
              ))}
            </select>
          </div>

          {/* District */}
          {currentDistricts.length > 0 && (
            <div className="form-group">
              <label className="form-label">Tuman / Hudud</label>
              <select
                className="form-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <option value="">Barcha tumanlar</option>
                {currentDistricts.map((d) => (
                  <option key={d.id} value={d.id}>{d.nameUz}</option>
                ))}
              </select>
            </div>
          )}

          {/* Property Type */}
          <div className="form-group">
            <label className="form-label">Uy turi</label>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">Barchasi</option>
              <option value="APARTMENT">Kvartira</option>
              <option value="HOUSE">Hovli uy</option>
              <option value="YARD">Dala hovli / Uy</option>
              <option value="DORM">Yotoqxona</option>
              <option value="OTHER">Boshqa</option>
            </select>
          </div>

          {/* Rooms */}
          <div className="form-group">
            <label className="form-label">Xonalar</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {['ALL', '1', '2', '3', '4+'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRooms(r)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: `1.5px solid ${selectedRooms === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selectedRooms === r ? 'var(--color-primary-light)' : '#FFFFFF',
                    color: selectedRooms === r ? 'var(--color-primary-hover)' : 'var(--color-text-main)',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}
                >
                  {r === 'ALL' ? 'Hammasi' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="form-group">
            <label className="form-label">Oylik narx (so‘m)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="number"
                className="form-input"
                placeholder="Dan"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                className="form-input"
                placeholder="Gacha"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Furnished */}
          <div className="form-group">
            <label className="form-label">Mebel holati</label>
            <select className="form-select" value={furnished} onChange={(e) => setFurnished(e.target.value)}>
              <option value="ALL">Farqi yo‘q</option>
              <option value="true">Mebelli</option>
              <option value="false">Mebelsiz</option>
            </select>
          </div>

          {/* Rent Period */}
          <div className="form-group">
            <label className="form-label">Ijara muddati</label>
            <select className="form-select" value={rentPeriod} onChange={(e) => setRentPeriod(e.target.value)}>
              <option value="ALL">Barchasi</option>
              <option value="MONTHLY">Oylik ijara</option>
              <option value="DAILY">Kunlik ijara</option>
              <option value="LONG_TERM">Uzoq muddatli</option>
              <option value="SHORT_TERM">Qisqa muddatli</option>
            </select>
          </div>

          {/* Amenities checklist */}
          <div style={{ marginTop: '20px' }}>
            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Qulayliklar</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {amenitiesList.map((item) => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(item.id)}
                    onChange={() => handleAmenityToggle(item.id)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>{item.name}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* PROPERTIES GRID & PAGINATION */}
        <main>
          {/* Result summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>
              Topildi: <strong style={{ color: 'var(--color-navy)' }}>{totalCount}</strong> ta xonadon
            </span>
          </div>

          {loading ? (
            <div className="grid-cols-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card skeleton" style={{ height: '380px' }} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '60px 20px',
              textAlign: 'center',
              border: '1px solid var(--color-border)'
            }}>
              <Home size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Hech qanday e’lon topilmadi</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Kiritilgan filtrlarga mos mulk mavjud emas. Filtrlarni o‘zgartirib ko‘ring.
              </p>
              <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
                Barcha filtrlarni tozalash
              </button>
            </div>
          ) : (
            <>
              <div className="grid-cols-auto">
                {properties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onSelect={onSelectProperty}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        backgroundColor: currentPage === page ? 'var(--color-primary)' : '#FFFFFF',
                        color: currentPage === page ? '#FFFFFF' : 'var(--color-navy)',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer'
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
          .filters-sidebar {
            display: none;
          }
          .filters-sidebar.open {
            display: block !important;
            margin-bottom: 24px;
          }
        }
        @media (min-width: 901px) {
          .mobile-filter-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
