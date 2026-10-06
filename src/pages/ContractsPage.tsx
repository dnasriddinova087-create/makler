import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  Printer,
  ShieldCheck,
  Building,
  User as UserIcon,
  Calendar,
  DollarSign,
  AlertCircle,
  Eye,
  Check,
  ClipboardList
} from 'lucide-react';
import { Contract, HandoverAct } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ContractsPageProps {
  onOpenAuth: () => void;
}

export const ContractsPage: React.FC<ContractsPageProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contract' | 'handover'>('contract');

  // Handover form state
  const [meterGas, setMeterGas] = useState('');
  const [meterElectricity, setMeterElectricity] = useState('');
  const [meterWater, setMeterWater] = useState('');
  const [condition, setCondition] = useState('');
  const [furnitureNotes, setFurnitureNotes] = useState('');
  const [savingHandover, setSavingHandover] = useState(false);

  useEffect(() => {
    if (user) {
      loadContracts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await api.contracts.getAll();
      if (res.success) {
        setContracts(res.data);
        if (res.data.length > 0) {
          selectContractDetails(res.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectContractDetails = (c: Contract) => {
    setSelectedContract(c);
    if (c.handoverAct) {
      setMeterGas(c.handoverAct.meterGas || '');
      setMeterElectricity(c.handoverAct.meterElectricity || '');
      setMeterWater(c.handoverAct.meterWater || '');
      setCondition(c.handoverAct.propertyCondition || '');
      setFurnitureNotes(c.handoverAct.furnitureNotes || '');
    } else {
      setMeterGas('');
      setMeterElectricity('');
      setMeterWater('');
      setCondition('');
      setFurnitureNotes('');
    }
  };

  const handleApprove = async () => {
    if (!selectedContract) return;
    try {
      const res = await api.contracts.approve(selectedContract.id);
      if (res.success) {
        alert('Shartnoma muvaffaqiyatli tasdiqlandi!');
        loadContracts();
      }
    } catch (e: any) {
      alert(e.message || 'Xatolik yuz berdi');
    }
  };

  const handleSaveHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    try {
      setSavingHandover(true);
      await api.contracts.saveHandover(selectedContract.id, {
        meterGas,
        meterElectricity,
        meterWater,
        propertyCondition: condition,
        furnitureNotes
      });
      alert('Qabul qilish akti yangilandi va tasdiqlandi!');
      loadContracts();
    } catch (e: any) {
      alert(e.message || 'Xatolik');
    } finally {
      setSavingHandover(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <FileText size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Shartnomalarni ko‘rish uchun tizimga kiring</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '24px' }}>
          Ijara shartnomalari, qabul qilish dalolatnomalari va hisoblagich ko‘rsatkichlarini boshqarish uchun shaxsiy hisobingizga kiring.
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-hover)', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
          <ShieldCheck size={14} /> O‘zbekiston Qonunchiligiga Mos Rasmiy Shartnomalar
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '6px' }}>Elektron Ijara Shartnomalari</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Ikki tomonlama tasdiqlanadigan ijara shartnomalari va topshirish dalolatnomalari (Handover Act)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', alignItems: 'flex-start' }} className="contracts-layout">
        {/* CONTRACTS LIST */}
        <aside style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Mening shartnomalarim ({contracts.length})</h3>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="skeleton" style={{ height: '70px' }} />
              <div className="skeleton" style={{ height: '70px' }} />
            </div>
          ) : contracts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Hozircha rasmiylashtirilgan shartnomalar mavjud emas.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contracts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectContractDetails(c)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${selectedContract?.id === c.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selectedContract?.id === c.id ? 'var(--color-primary-light)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-navy)' }}>{c.contractNumber}</span>
                    <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {c.status === 'ACTIVE' ? 'Faol' : 'Kutilmoqda'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.address}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-navy)', marginTop: '4px' }}>
                    {new Intl.NumberFormat('uz-UZ').format(c.rentAmount)} so‘m / oy
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* SELECTED CONTRACT DETAILS / PREVIEW */}
        <main>
          {selectedContract ? (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              {/* Header and Print action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    O‘zbekiston Respublikasi Fuqarolik Kodeksi 535-557-moddalari asosida
                  </div>
                  <h2 style={{ fontSize: '22px', marginTop: '4px' }}>
                    Uy-joy Ijarasi Shartnomasi № {selectedContract.contractNumber}
                  </h2>
                </div>

                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={16} /> Chop etish / PDF
                </button>
              </div>

              {/* Sub-tabs: Shartnoma vs Qabul qilish akti */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <button
                  onClick={() => setActiveTab('contract')}
                  className={`btn btn-sm ${activeTab === 'contract' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <FileText size={15} /> Asosiy Shartnoma
                </button>
                <button
                  onClick={() => setActiveTab('handover')}
                  className={`btn btn-sm ${activeTab === 'handover' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <ClipboardList size={15} /> Topshirish Akti (Handover Act)
                </button>
              </div>

              {activeTab === 'contract' ? (
                <div>
                  {/* Parties Box */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '13px' }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--color-navy)', marginBottom: '4px' }}>1-Tomon (Ijaraga Beruvchi / Makler):</strong>
                      <div>Ism: {selectedContract.broker?.firstName} {selectedContract.broker?.lastName}</div>
                      <div>Tel: {selectedContract.broker?.phone || selectedContract.landlordPhone}</div>
                      <div>Tasdiqlash holati: {selectedContract.brokerApproved ? '✅ Tasdiqlangan' : '⏳ Kutilmoqda'}</div>
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--color-navy)', marginBottom: '4px' }}>2-Tomon (Ijaraga Oluvchi / Ijarachi):</strong>
                      <div>Ism: {selectedContract.tenant?.firstName} {selectedContract.tenant?.lastName}</div>
                      <div>Tel: {selectedContract.tenant?.phone || 'Mavjud emas'}</div>
                      <div>Tasdiqlash holati: {selectedContract.tenantApproved ? '✅ Tasdiqlangan' : '⏳ Kutilmoqda'}</div>
                    </div>
                  </div>

                  {/* Contract Clauses */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-main)' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', color: 'var(--color-navy)', marginBottom: '4px' }}>1. Shartnoma Predmeti</h4>
                      <p>
                        Ijaraga beruvchi Toshkent shahri / {selectedContract.regionName}, {selectedContract.districtName}, {selectedContract.address} manzilida joylashgan turar-joy xonadonini Ijarachiga vaqtincha yashash uchun foydalanishga topshiradi.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '15px', color: 'var(--color-navy)', marginBottom: '4px' }}>2. Ijara Muddati va To‘lov Miqdori</h4>
                      <p>
                        Ijara muddati: <strong>{new Date(selectedContract.startDate).toLocaleDateString('uz-UZ')}</strong> dan <strong>{new Date(selectedContract.endDate).toLocaleDateString('uz-UZ')}</strong> gacha.
                        <br />
                        Oylik ijara haqi: <strong>{new Intl.NumberFormat('uz-UZ').format(selectedContract.rentAmount)} so‘m</strong>.
                        To‘lov har oyning <strong>{selectedContract.paymentDate}-sanasiga</strong> qadar to‘lanadi.
                        Xavfsizlik depoziti: <strong>{new Intl.NumberFormat('uz-UZ').format(selectedContract.depositAmount)} so‘m</strong>.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '15px', color: 'var(--color-navy)', marginBottom: '4px' }}>3. Kommunal Xizmatlar va Jihozlar</h4>
                      <p>
                        Kommunal to‘lovlar: {selectedContract.utilitiesIncluded || 'Hisoblagichlar bo‘yicha ijarachi tomonidan alohida to‘lanadi'}.
                        <br />
                        Xonadondagi asosiy jihozlar: {selectedContract.furnitureList || 'Topshirish dalolatnomasida qayd etilgan'}.
                      </p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '15px', color: 'var(--color-navy)', marginBottom: '4px' }}>4. Qo‘shimcha Shartlar</h4>
                      <p>{selectedContract.additionalTerms || 'Tomonlar o‘zaro kelishuv asosida platforma qoidalariga rioya qiladi.'}</p>
                    </div>
                  </div>

                  {/* Approve action */}
                  {selectedContract.status !== 'ACTIVE' && (
                    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h4 style={{ color: 'var(--color-primary-hover)', fontSize: '15px', marginBottom: '2px' }}>
                          Shartnomani tasdiqlash
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>
                          Ikki tomon ham rozilik bildirganidan so‘ng shartnoma faol maqomga o‘tadi.
                        </p>
                      </div>
                      <button onClick={handleApprove} className="btn btn-primary">
                        <Check size={16} /> Shartnomani tasdiqlayman
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* HANDOVER ACT TAB */
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Xonadonni qabul qilish dalolatnomasi (Handover Act)</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                    Ijara boshlanishida hisoblagichlar ko‘rsatkichi va xonadon holati qayd qilinadi.
                  </p>

                  <form onSubmit={handleSaveHandover}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Elektr hisoblagich (kW)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Masalan: 08420.5 kW"
                          value={meterElectricity}
                          onChange={(e) => setMeterElectricity(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Gaz hisoblagich (m³)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Masalan: 12104.2 m³"
                          value={meterGas}
                          onChange={(e) => setMeterGas(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Sovuq/Issiq suv (m³)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Masalan: 04512.0 m³"
                          value={meterWater}
                          onChange={(e) => setMeterWater(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Xonadon va ta’mir holati</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="Masalan: Devorlar toza, santexnika butun, oyna va eshiklar soz holatda..."
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Jihozlar va maishiy texnika ro‘yxati</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        placeholder="Muzlatkich, televizor, kir yuvish mashinasi, mebellar to‘liq butun holatda..."
                        value={furnitureNotes}
                        onChange={(e) => setFurnitureNotes(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingHandover}
                      className="btn btn-primary"
                    >
                      {savingHandover ? 'Saqlanmoqda...' : 'Topshirish aktini saqlash va tasdiqlash'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <FileText size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3>Shartnoma tanlanmagan</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                Chap tomondagi ro‘yxatdan shartnomani tanlang.
              </p>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .contracts-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
