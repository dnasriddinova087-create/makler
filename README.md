# 🏢 IJARA.UZ / MAKLER — O‘zbekiston Bo‘ylab Professional Uy-Joy Ijara Platformasi

[![Version](https://img.shields.io/badge/version-1.0.0-emerald.svg)](https://ijara.uz)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**IJARA.UZ** — O‘zbekiston ko‘chmas mulk bozorida ijarachilar, tasdiqlangan professional maklerlar va mulk egalarini yagona xavfsiz ekotizimda birlashtiruvchi zamonaviy full-stack platforma.

---

## 🌟 Asosiy Imkoniyatlar va Funksiyalar

### 1. 🔍 Qidiruv va Filtrlash Tizimi
- **O‘zbekiston hududlari**: Toshkent shahri, Toshkent viloyati, Samarqand, Buxoro, Farg‘ona va boshqa viloyatlar bo‘yicha ko‘p bosqichli `Region -> District -> Mahalla` arxitekturasi.
- **Ko‘p mezonli parametrlar**: Uy turi (kvartira, hovli, dala hovli, yotoqxona), xonalar soni (1, 2, 3, 4+), maydon, narx chegaralari, mebel holati, qulayliklar (Wi-Fi, konditsioner, lift, kir yuvish mashinasi va h.k.).
- **Debounced qidiruv & Paginatsiya**: Real vaqt rejimida tezkor qidiruv, saralash (eng yangi, arzon, qimmat, ommabop, yuqori reyting).

### 2. 🛡️ Ishonch va Verifikatsiya (Trust & Safety)
- **Tasdiqlangan Maklerlar (Verified Badges)**: Maklerlar shaxsiy hujjatlari asosida moderatorlar tomonidan tekshiriladi.
- **Haqiqiy Sharhlar va Reyting**: Faqat haqiqiy tranzaksiyalar va ijara shartnomasi qatnashchilari baho beradi.
- **Shikoyat Tizimi (Reports)**: Soxta e’lonlar, firibgarlik yoki noto‘g‘ri ma’lumotlar bo‘yicha moderatorlarga darhol xabar berish.

### 3. 📝 Elektron Shartnomalar va Qabul Qilish Akti (Handover Act)
- **Ikki tomonlama tasdiqlash**: Ijaraga beruvchi/makler va ijarachi tomonidan onlayn tasdiqlanadigan rasmiy ijara shartnomalari.
- **Topshirish dalolatnomasi**: Gaz, elektr, suv hisoblagich ko‘rsatkichlari, mebel va mulk holatini qabul qilib olish vaqtidagi aniq qaydlar.
- **PDF / Chop etish**: Huquqiy standartlarga mos matn formatida chop etish imkoniyati.

### 4. 📅 Uchrashuvga Yozilish (Viewing Booking)
- Xonadonni borib ko‘rish uchun onlayn qulay sana va vaqtni tanlash.
- Holatlar: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`.
- Ikkala tomonga avtomatik bildirishnomalar yuborilishi.

### 5. 💬 Xabar Almashish (Chat Tizimi)
- Ijarachi va makler o‘rtasida to‘g‘ridan-to‘g‘ri muloqot.
- Chat aynan ko‘rib chiqilayotgan xonadonga bog‘langan holatda ishlaydi.
- O‘qilganlik maqomi va xabarnomalar.

### 6. ❤️ Sevimlilar (Favorites)
- Yoqqan uylarni shaxsiy hisobda saqlab qo‘yish va keyinroq qayta ko‘rish.

### 7. 💼 Makler Shaxsiy Kabineti (Broker Dashboard)
- Ko‘rishlar, saqlashlar, ko‘rish so‘rovlari va shartnomalar statistikasi.
- **Yangi e’lon yaratish (Wizard)**: Bosqichma-bosqich rasm yuklash, parametrlar, narx va qulayliklarni kiritish, qoralama (draft) yoki chop etish.

### 8. 👑 Administrator Paneli (Admin Panel)
- Foydalanuvchilar va maklerlar nazorati.
- Maklerlarni hujjat asosida verifikatsiya qilish / rad etish.
- E’lonlar moderatsiyasi (`APPROVED`, `REJECTED`, `DRAFT`).
- Shikoyatlarni hal qilish va tizim audit jurnallari (Audit Logs).

---

## 🛠️ Texnologiyalar Staki

- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - Lucide Icons
  - Maxsus Zamonaviy Responsive Dizayn Tizimi (Design Tokens, Glassmorphism, Micro-animations)
- **Backend**:
  - Node.js (v24 LTS)
  - Express
  - TypeScript
  - Prisma ORM
  - SQLite / PostgreSQL moslashuvchan arxitektura
  - JWT (JSON Web Tokens) & Bcrypt
  - Zod Validatsiya
- **Xavfsizlik**:
  - Rolga asoslangan avtorizatsiya (RBAC: `CLIENT`, `BROKER`, `ADMIN`)
  - Parollarni tuzlangan heshlash (Bcrypt)
  - Sensitive ma’lumotlarni yashirish
  - Audit loglar

---

## 🚀 O‘rnatish va Ishga Tushirish

### 1. Repository'ni klonlash
```bash
git clone https://github.com/dnasriddinova087-create/makler.git
cd makler
```

### 2. Bog‘liqliklarni o‘rnatish
```bash
npm install
```

### 3. Konfiguratsiya (.env)
`.env.example` asosida `.env` faylini shakllantiring:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="ijara-uz-super-secret-jwt-key-2026"
API_URL="http://localhost:5000/api"
STORAGE_URL="http://localhost:5000/uploads"
```

### 4. Ma’lumotlar bazasini yaratish va to‘ldirish (Prisma)
```bash
# Ma'lumotlar bazasi jadvallarini generatsiya qilish
npm run db:push

# Baza uchun O'zbekiston hududlari, namunaviy uylar va foydalanuvchilar ma'lumotlarini yuklash
npm run db:seed
```

### 5. Dasturni ishga tushirish (Development)
Frontend va Backend bir vaqtda ishga tushadi:
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

---

## 🔑 Sinov Hisoblari (Demo Accounts)

Platformaga kirishda «1-bosishda tezkor sinov» tugmalari orqali yoki quyidagi hisoblar bilan kirish mumkin:

| Rol | Email | Parol | Tavsif |
|---|---|---|---|
| **Administrator** | `admin@ijara.uz` | `admin123` | Barcha foydalanuvchilar, moderatsiya va auditni boshqaradi |
| **Makler (Broker)** | `dnasriddinova087@gmail.com` | `ijara123` | Dilfuza Nasriddinova (Tasdiqlangan top makler) |
| **Makler 2** | `rustam@ijara.uz` | `ijara123` | Rustam Karimov |
| **Mijoz (Client)** | `client@ijara.uz` | `ijara123` | Jasurbek Aliyev (Ijarachi) |

---

## 📦 Production Build

```bash
npm run build
```
Build natijasi `dist/` katalogida to‘liq optimallashtirilgan holda hosil bo‘ladi.

---

## 📄 Litsenziya

Ushbu loyiha MIT litsenziyasi ostida taqdim etiladi.
Mulkdor: [Dilfuza Nasriddinova](https://github.com/dnasriddinova087-create) • [IJARA.UZ](https://ijara.uz)
