import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Building,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Phone,
  Mail,
  Star,
  Award,
  Check,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { User, Property, ReportItem, Contract } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'brokers' | 'clients' | 'properties' | 'contracts' | 'reports' | 'logs'>('stats');

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [contractsList, setContractsList] = useState<Contract[]>([]);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [brokerSearch, setBrokerSearch] = useState('');
  const [brokerFilter, setBrokerFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  const [clientSearch, setClientSearch] = useState('');

  const [propertySearch, setPropertySearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  // Gate password input state
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, propsRes, contractsRes, repsRes, logsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getProperties(),
        api.contracts.getAll().catch(() => ({ success: true, data: [] })),
        api.admin.getReports(),
        api.admin.getAuditLogs()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
      if (propsRes.success) setPropertiesList(propsRes.data);
      if (contractsRes.success) setContractsList(contractsRes.data);
      if (repsRes.success) setReportsList(repsRes.data);
      if (logsRes.success) setAuditLogs(logsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError('');

    if (gatePassword.trim() !== 'makler.2026') {
      setGateError('Noto‘g‘ri boshqaruv paroli! Faqat platforma egasi (Dilfuza Nasriddinova) ruxsatiga ega.');
      return;
    }

    try {
      setGateLoading(true);
      await login({
        email: 'dnasriddinova087@gmail.com',
        password: 'makler.2026'
      });
      loadAdminData();
    } catch (err: any) {
      setGateError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setGateLoading(false);
    }
  };

  // Brokers list & filtering
  const allBrokers = usersList.filter((u) => u.role === 'BROKER');
  const filteredBrokers = allBrokers.filter((b) => {
    const matchesSearch =
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(brokerSearch.toLowerCase()) ||
      (b.phone && b.phone.includes(brokerSearch)) ||
      (b.email && b.email.toLowerCase().includes(brokerSearch.toLowerCase())) ||
      (b.profile?.companyName && b.profile.companyName.toLowerCase().includes(brokerSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (brokerFilter === 'VERIFIED') return b.isVerified;
    if (brokerFilter === 'PENDING') return !b.isVerified;
    return true;
  });

  // Clients list & filtering
  const allClients = usersList.filter((u) => u.role === 'CLIENT');
  const filteredClients = allClients.filter((c) => {
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(clientSearch)) ||
      (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))
    );
  });

  // Properties list & filtering
  const filteredProperties = propertiesList.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.address.toLowerCase().includes(propertySearch.toLowerCase()) ||
      (p.district?.nameUz && p.district.nameUz.toLowerCase().includes(propertySearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (propertyFilter !== 'ALL') return p.status === propertyFilter;
    return true;
  });

  // Verify Broker
  const handleVerifyBroker = async (userId: string, status: string) => {
    try {
      await api.admin.verifyUser(userId, status, status === 'VERIFIED' ? 'Hujjatlar tekshirildi va tasdiqlandi' : 'Rad etildi');
      alert(`Makler holati yangilandi: ${status === 'VERIFIED' ? 'Tasdiqlandi (Verified Badge berildi)' : 'Tasdiq bekor qilindi'}`);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  };

  // Delete User (Broker or Client)
  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Haqiqatan ham foydalanuvchi "${name}" ni tizimdan butunlay o‘chirmoqchimisiz?`)) return;
    try {
      await api.admin.deleteUser(userId);
      alert('Foydalanuvchi muvaffaqiyatli o‘chirildi!');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'O‘chirib bo‘lmadi');
    }
  };

  // Update Property Status
  const handleUpdatePropertyStatus = async (propId: string, status: string) => {
    try {
      await api.admin.updatePropertyStatus(propId, status);
      alert(`E’lon holati yangilandi: ${status === 'APPROVED' ? 'Tasdiqlandi va chop etildi' : 'Rad etildi'}`);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  };

  // Delete Property
  const handleDeleteProperty = async (propId: string, title: string) => {
    if (!window.confirm(`Haqiqatan ham "${title}" e’lonini butunlay o‘chirmoqchimisiz?`)) return;
    try {
      await api.admin.deleteProperty(propId);
      alert('E’lon muvaffaqiyatli o‘chirildi!');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'O‘chirib bo‘lmadi');
    }
  };

  // Resolve Report
  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      await api.admin.resolveReport(reportId, status);
      alert('Shikoyat ko‘rib chiqildi va maqomi yangilandi!');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  };

  // ACCESS GATE IF NOT ADMIN
  if (user?.role !== 'ADMIN') {
    return (
      <div className="container" style={{ padding: '70px 20px', display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '36px 28px', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#0B132B',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <ShieldCheck size={38} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
            Himoyalangan Boshqaruv Paneli
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Platforma egasi: <strong>Nasriddinova Dilfuza</strong>
          </p>

          <div style={{
            padding: '10px 14px',
            backgroundColor: '#EFF6FF',
            borderRadius: '8px',
            border: '1px solid #BFDBFE',
            color: '#1D4ED8',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            🔒 Admin panelga kirish uchun maxsus boshqaruv parolini kiriting
          </div>

          {gateError && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleGateLogin}>
            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Boshqaruv kodi / Parol:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input"
                  placeholder="Masalan: makler.2026"
                  value={gatePassword}
                  onChange={(e) => setGatePassword(e.target.value)}
                  style={{ paddingLeft: '38px', width: '100%' }}
                  autoFocus
                  required
                />
                <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-navy"
              style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              disabled={gateLoading}
            >
              {gateLoading ? 'Tekshirilmoqda...' : 'Admin Panelga Kirish'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Super Admin: Nasriddinova Dilfuza (Parol: <code>makler.2026</code>)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 20px 80px' }}>
      {/* Super Admin Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 60%, #10B981 160%)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
              alt="Dilfuza Nasriddinova"
              style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10B981', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            />
            <span style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              backgroundColor: '#10B981',
              border: '2px solid #0B132B',
              borderRadius: '50%'
            }} title="Onlayn" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '26px', color: '#FFFFFF', fontFamily: 'var(--font-display)', margin: 0, fontWeight: 800 }}>
                Nasriddinova Dilfuza
              </h1>
              <span className="badge badge-green" style={{ fontSize: '11px', padding: '4px 10px' }}>
                <ShieldCheck size={14} /> Platforma Egasi & Super Admin
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', marginBottom: '4px' }}>
              IJARA.UZ tizimining to‘liq boshqaruv, maklerlar, mijozlar va e’lonlar moderatsiya markazi
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#CBD5E1', flexWrap: 'wrap' }}>
              <span>📞 +998 (50) 744-51-39</span>
              <span>✉️ dnasriddinova087@gmail.com</span>
              <span>🔒 Parol: <strong>makler.2026</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)' }}
        >
          <RefreshCw size={15} /> Ma’lumotlarni yangilash
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '28px',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('stats')}
          className={`btn btn-sm ${activeTab === 'stats' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Activity size={16} /> Statistika
        </button>
        <button
          onClick={() => setActiveTab('brokers')}
          className={`btn btn-sm ${activeTab === 'brokers' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Award size={16} /> Maklerlar ({allBrokers.length})
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`btn btn-sm ${activeTab === 'clients' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Users size={16} /> Mijozlar ({allClients.length})
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`btn btn-sm ${activeTab === 'properties' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Building size={16} /> E’lonlar ({propertiesList.length})
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`btn btn-sm ${activeTab === 'contracts' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <FileText size={16} /> Shartnomalar ({contractsList.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`btn btn-sm ${activeTab === 'reports' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <AlertTriangle size={16} /> Shikoyatlar ({reportsList.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`btn btn-sm ${activeTab === 'logs' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Clock size={16} /> Audit Jurnali
        </button>
      </div>

      {/* 1. STATS TAB */}
      {activeTab === 'stats' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => setActiveTab('brokers')}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Maklerlar (Agentlar)</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>
                {allBrokers.length} nafar
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-primary-hover)', marginTop: '4px', fontWeight: 600 }}>
                {allBrokers.filter((b) => b.isVerified).length} tasi tasdiqlangan (Ko‘rish →)
              </div>
            </div>

            <div className="card" style={{ cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => setActiveTab('clients')}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Ijarachilar (Mijozlar)</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#3B82F6' }}>
                {allClients.length} nafar
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Faol uy qidiruvchilar (Ko‘rish →)
              </div>
            </div>

            <div className="card" style={{ cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => setActiveTab('properties')}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Jami E’lonlar (Uylar)</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)' }}>
                {propertiesList.length} ta
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {propertiesList.filter((p) => p.status === 'APPROVED').length} tasi chop etilgan (Ko‘rish →)
              </div>
            </div>

            <div className="card" style={{ cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => setActiveTab('contracts')}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Faol Shartnomalar</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#10B981' }}>
                {contractsList.length} ta
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Rasmiy elektron tuzilgan (Ko‘rish →)
              </div>
            </div>

            <div className="card" style={{ cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => setActiveTab('reports')}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Shikoyatlar (Reports)</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: reportsList.length > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                {reportsList.length} ta
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Nazorat qilinmoqda (Ko‘rish →)
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Jami Foydalanuvchilar</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)' }}>
                {usersList.length} ta
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-primary-hover)', marginTop: '4px', fontWeight: 600 }}>
                ● Tizimda to‘liq qayd etilgan
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BROKERS MANAGEMENT TAB */}
      {activeTab === 'brokers' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Maklerlar Boshqaruvi va Verifikatsiya Nazorati ({allBrokers.length})
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                Maklerlarga ishonch belgisi (Verified Badge) berish yoki tizimdan o‘chirish
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', width: '240px' }}>
                <input
                  type="text"
                  placeholder="Maklerni qidirish..."
                  value={brokerSearch}
                  onChange={(e) => setBrokerSearch(e.target.value)}
                  className="input input-sm"
                  style={{ paddingLeft: '32px', width: '100%' }}
                />
                <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* Status filter */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setBrokerFilter('ALL')}
                  className={`btn btn-sm ${brokerFilter === 'ALL' ? 'btn-navy' : 'btn-secondary'}`}
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  Barchasi ({allBrokers.length})
                </button>
                <button
                  onClick={() => setBrokerFilter('VERIFIED')}
                  className={`btn btn-sm ${brokerFilter === 'VERIFIED' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  Tasdiqlangan ({allBrokers.filter((b) => b.isVerified).length})
                </button>
                <button
                  onClick={() => setBrokerFilter('PENDING')}
                  className={`btn btn-sm ${brokerFilter === 'PENDING' ? 'btn-navy' : 'btn-secondary'}`}
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  Kutilmoqda ({allBrokers.filter((b) => !b.isVerified).length})
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredBrokers.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '30px' }}>
                Hech qanday makler topilmadi.
              </p>
            ) : (
              filteredBrokers.map((broker) => (
                <div
                  key={broker.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                      src={broker.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
                      alt=""
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)' }}>
                          {broker.firstName} {broker.lastName}
                        </span>
                        {broker.isVerified ? (
                          <span className="badge badge-green" style={{ fontSize: '11px' }}>
                            <CheckCircle size={12} /> Tasdiqlangan (Verified)
                          </span>
                        ) : (
                          <span className="badge badge-yellow" style={{ fontSize: '11px' }}>
                            Kutilmoqda (Tekshirilmagan)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {broker.profile?.companyName || 'Mustaqil makler'} • {broker.phone || 'Telefon yo‘q'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Email: <strong>{broker.email}</strong> • Reyting: <strong>{broker.profile?.ratingAvg || 5.0} ⭐</strong> • Muvaffaqiyatli bitimlar: <strong>{broker.profile?.totalDeals || 0}+</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!broker.isVerified ? (
                      <button
                        onClick={() => handleVerifyBroker(broker.id, 'VERIFIED')}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={14} /> Tasdiqlash (Badge berish)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerifyBroker(broker.id, 'REJECTED')}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        Tasdiqni bekor qilish
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteUser(broker.id, `${broker.firstName} ${broker.lastName}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      title="Maklerni tizimdan o‘chirish"
                    >
                      <Trash2 size={15} /> O‘chirish
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. CLIENTS MANAGEMENT TAB */}
      {activeTab === 'clients' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Ijarachilar (Mijozlar) Boshqaruvi ({allClients.length})
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                Platformadagi barcha mijozlarni ko‘rish va hisoblarini boshqarish
              </p>
            </div>

            <div style={{ position: 'relative', width: '260px' }}>
              <input
                type="text"
                placeholder="Mijozni qidirish (ism, tel, email)..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="input input-sm"
                style={{ paddingLeft: '32px', width: '100%' }}
              />
              <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredClients.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '30px' }}>
                Mijoz topilmadi.
              </p>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)' }}>
                      {client.firstName} {client.lastName}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Tel: <strong>{client.phone || '+998 90 000 00 00'}</strong> • Email: <strong>{client.email}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-navy" style={{ fontSize: '11px' }}>
                      Mijoz / Ijarachi
                    </span>
                    <button
                      onClick={() => handleDeleteUser(client.id, `${client.firstName} ${client.lastName}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      title="Mijozni o‘chirish"
                    >
                      <Trash2 size={15} /> O‘chirish
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. PROPERTIES MODERATION TAB */}
      {activeTab === 'properties' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                E’lonlar Moderatsiyasi va Nazorati ({propertiesList.length})
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                Platformaga joylangan uylarni tasdiqlash, rad etish yoki o‘chirish
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <input
                  type="text"
                  placeholder="E’lonni qidirish..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="input input-sm"
                  style={{ paddingLeft: '32px', width: '100%' }}
                />
                <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setPropertyFilter('ALL')}
                  className={`btn btn-sm ${propertyFilter === 'ALL' ? 'btn-navy' : 'btn-secondary'}`}
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  Hammasi
                </button>
                <button
                  onClick={() => setPropertyFilter('APPROVED')}
                  className={`btn btn-sm ${propertyFilter === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  Chop etilgan
                </button>
                <button
                  onClick={() => setPropertyFilter('PENDING')}
                  className={`btn btn-sm ${propertyFilter === 'PENDING' ? 'btn-navy' : 'btn-secondary'}`}
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                >
                  Kutilmoqda
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredProperties.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '30px' }}>
                E’lonlar topilmadi.
              </p>
            ) : (
              filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    flexWrap: 'wrap',
                    gap: '14px',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <img
                      src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '16px', color: 'var(--color-navy)', marginBottom: '4px' }}>
                        {prop.title}
                      </h4>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {prop.address} • <strong>{new Intl.NumberFormat('uz-UZ').format(prop.price)} {prop.currency}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${prop.status === 'APPROVED' ? 'badge-green' : prop.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}`}>
                      {prop.status === 'APPROVED' ? 'Chop etilgan' : prop.status === 'PENDING' ? 'Kutilmoqda' : 'Rad etilgan'}
                    </span>

                    {prop.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdatePropertyStatus(prop.id, 'APPROVED')}
                        className="btn btn-primary btn-sm"
                      >
                        <Check size={14} /> Chop etish
                      </button>
                    )}

                    {prop.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdatePropertyStatus(prop.id, 'REJECTED')}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-warning)' }}
                      >
                        Rad etish
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteProperty(prop.id, prop.title)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      title="E’lonni butunlay o‘chirish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. CONTRACTS TAB */}
      {activeTab === 'contracts' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
            Ijara Shartnomalari Nazorati ({contractsList.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {contractsList.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-navy)', fontSize: '15px' }}>
                      {c.contractNumber}
                    </span>
                    <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Manzil: {c.address}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-main)', marginTop: '2px' }}>
                    Ijara haqi: <strong>{new Intl.NumberFormat('uz-UZ').format(c.rentAmount)} so‘m / oy</strong>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Sana: {new Date(c.startDate).toLocaleDateString('uz-UZ')} — {new Date(c.endDate).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
            Kelib Tushgan Shikoyatlar ({reportsList.length})
          </h3>

          {reportsList.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '30px' }}>
              Hozircha hech qanday shikoyatlar kelib tushmagan.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reportsList.map((rep) => (
                <div key={rep.id} style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-red">{rep.reason}</span>
                    <span className={`badge ${rep.status === 'RESOLVED' ? 'badge-green' : 'badge-yellow'}`}>
                      {rep.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', marginBottom: '8px' }}>{rep.description}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button onClick={() => handleResolveReport(rep.id, 'RESOLVED')} className="btn btn-primary btn-sm">
                      Hal qilindi deb belgilash
                    </button>
                    <button onClick={() => handleResolveReport(rep.id, 'DISMISSED')} className="btn btn-secondary btn-sm">
                      Rad etish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
            Tizim Xavfsizlik Audit Jurnali
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: 'var(--color-navy)' }}>{log.action}: </strong>
                  <span>{log.details}</span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                  {new Date(log.createdAt).toLocaleString('uz-UZ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
