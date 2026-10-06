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
  Eye,
  Check,
  Trash2
} from 'lucide-react';
import { User, Property, ReportItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'properties' | 'reports' | 'logs'>('stats');

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, propsRes, repsRes, logsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getProperties(),
        api.admin.getReports(),
        api.admin.getAuditLogs()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
      if (propsRes.success) setPropertiesList(propsRes.data);
      if (repsRes.success) setReportsList(repsRes.data);
      if (logsRes.success) setAuditLogs(logsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBroker = async (userId: string, status: string) => {
    try {
      await api.admin.verifyUser(userId, status, status === 'VERIFIED' ? 'Hujjatlar tekshirildi' : 'Rad etildi');
      alert(`Makler holati yangilandi: ${status}`);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  };

  const handleUpdatePropertyStatus = async (propId: string, status: string) => {
    try {
      await api.admin.updatePropertyStatus(propId, status);
      alert(`E’lon holati yangilandi: ${status}`);
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      await api.admin.resolveReport(reportId, status);
      alert('Shikoyat ko‘rib chiqildi');
      loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <ShieldCheck size={48} color="var(--color-danger)" style={{ margin: '0 auto 16px' }} />
        <h2>Ruxsat yo‘q</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Ushbu sahifa faqat platforma administratorlari uchun.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
            <ShieldCheck size={14} /> Tizim Administratori
          </div>
          <h1 style={{ fontSize: '32px' }}>IJARA.UZ Boshqaruv Paneli</h1>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('stats')}
          className={`btn btn-sm ${activeTab === 'stats' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Activity size={16} /> Tizim statistikasi
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Users size={16} /> Foydalanuvchilar & Maklerlar ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`btn btn-sm ${activeTab === 'properties' ? 'btn-navy' : 'btn-secondary'}`}
        >
          <Building size={16} /> E’lonlar moderatsiyasi ({propertiesList.length})
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

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Foydalanuvchilar</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)' }}>{stats?.totalUsers || 0}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Maklerlar</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>{stats?.totalBrokers || 0}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>E’lonlar soni</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)' }}>{stats?.totalProperties || 0}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Faol shartnomalar</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563EB' }}>{stats?.activeContracts || 0}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Kutilayotgan shikoyatlar</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-danger)' }}>{stats?.pendingReports || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* USERS & BROKERS TAB */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Foydalanuvchilar va Verifikatsiya holati</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '10px' }}>Foydalanuvchi</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Rol</th>
                  <th style={{ padding: '10px' }}>Verifikatsiya</th>
                  <th style={{ padding: '10px' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-blue' : u.role === 'BROKER' ? 'badge-green' : 'badge-navy'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {u.isVerified ? (
                        <span className="badge badge-green">Tasdiqlangan</span>
                      ) : (
                        <span className="badge badge-yellow">Tasdiqlanmagan</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {u.role === 'BROKER' && !u.isVerified && (
                        <button
                          onClick={() => handleVerifyBroker(u.id, 'VERIFIED')}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Tasdiqlash
                        </button>
                      )}
                      {u.role === 'BROKER' && u.isVerified && (
                        <button
                          onClick={() => handleVerifyBroker(u.id, 'REJECTED')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--color-danger)' }}
                        >
                          Bekor qilish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROPERTIES MODERATION TAB */}
      {activeTab === 'properties' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>E’lonlar ro‘yxati va Moderatsiya</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {propertiesList.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{p.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {p.address} • {new Intl.NumberFormat('uz-UZ').format(p.price)} {p.currency}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${p.status === 'APPROVED' ? 'badge-green' : p.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}`}>
                    {p.status}
                  </span>
                  {p.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdatePropertyStatus(p.id, 'APPROVED')}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      Tasdiqlash
                    </button>
                  )}
                  {p.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdatePropertyStatus(p.id, 'REJECTED')}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-danger)' }}
                    >
                      Rad etish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Kelib tushgan shikoyatlar</h3>
          {reportsList.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Hozircha shikoyatlar yo‘q.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reportsList.map((rep) => (
                <div key={rep.id} style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-red">{rep.reason}</span>
                    <span className={`badge ${rep.status === 'RESOLVED' ? 'badge-green' : 'badge-yellow'}`}>{rep.status}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-main)', marginBottom: '8px' }}>{rep.description}</p>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Yuboruvchi: {rep.reporter?.firstName} {rep.reporter?.lastName} ({rep.reporter?.email})
                  </div>
                  {rep.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button onClick={() => handleResolveReport(rep.id, 'RESOLVED')} className="btn btn-primary btn-sm">
                        Hal qilindi deb belgilash
                      </button>
                      <button onClick={() => handleResolveReport(rep.id, 'DISMISSED')} className="btn btn-secondary btn-sm">
                        Rad qilish
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Tizim Audit Jurnali</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{log.action}</strong>: {log.details}
                  {log.user && <span style={{ color: 'var(--color-text-muted)' }}> (Foydalanuvchi: {log.user.email})</span>}
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>
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
