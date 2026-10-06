import {
  User,
  Property,
  Region,
  Viewing,
  Contract,
  HandoverAct,
  Conversation,
  Message,
  NotificationItem,
  ReportItem
} from '../types';

const API_BASE = '/api';

// Initial Mock Database for static deployment / serverless fallback
const initialUsers: User[] = [
  {
    id: 'user_broker_1',
    email: 'dnasriddinova087@gmail.com',
    role: 'BROKER',
    firstName: 'Dilfuza',
    lastName: 'Nasriddinova',
    phone: '+998935551234',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    profile: {
      id: 'p1',
      userId: 'user_broker_1',
      bio: 'Toshkent shahri markaziy tumanlarida 6 yillik tajribaga ega sertifikatlangan makler. Xavfsiz shartnomalar va ishonchli xonadonlar.',
      experienceYears: 6,
      companyName: 'Grand Real Estate Tashkent',
      specialization: 'Premium kvartiralar, yangi binolar',
      telegram: '@dilfuza_makler',
      whatsapp: '+998935551234',
      ratingAvg: 4.95,
      totalDeals: 148,
      responseTimeMin: 10
    }
  },
  {
    id: 'user_broker_2',
    email: 'rustam@ijara.uz',
    role: 'BROKER',
    firstName: 'Rustam',
    lastName: 'Karimov',
    phone: '+998977778899',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    profile: {
      id: 'p2',
      userId: 'user_broker_2',
      bio: 'Chilonzor va Yunusobod bo‘yicha ixtisoslashgan makler. Talabalar va yosh oilalar uchun qulay xonadonlar.',
      experienceYears: 4,
      companyName: 'Oila Makler UZ',
      specialization: 'Arzon va qulay kvartiralar',
      telegram: '@rustam_ijara',
      ratingAvg: 4.8,
      totalDeals: 84,
      responseTimeMin: 15
    }
  },
  {
    id: 'user_admin_1',
    email: 'admin@ijara.uz',
    role: 'ADMIN',
    firstName: 'Alisher',
    lastName: 'Rahmonov',
    phone: '+998901234567',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isVerified: true
  },
  {
    id: 'user_client_1',
    email: 'client@ijara.uz',
    role: 'CLIENT',
    firstName: 'Jasurbek',
    lastName: 'Aliyev',
    phone: '+998991112233',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    isVerified: true
  }
];

const initialRegions: Region[] = [
  {
    id: 'reg_1',
    nameUz: 'Toshkent shahri',
    code: 'TAS_CITY',
    districts: [
      { id: 'dist_1', regionId: 'reg_1', nameUz: 'Chilonzor tumani' },
      { id: 'dist_2', regionId: 'reg_1', nameUz: 'Yunusobod tumani' },
      { id: 'dist_3', regionId: 'reg_1', nameUz: 'Mirzo Ulug‘bek tumani' },
      { id: 'dist_4', regionId: 'reg_1', nameUz: 'Yakkasaroy tumani' },
      { id: 'dist_5', regionId: 'reg_1', nameUz: 'Mirobod tumani' }
    ]
  },
  {
    id: 'reg_2',
    nameUz: 'Samarqand viloyati',
    code: 'SAM',
    districts: [
      { id: 'dist_6', regionId: 'reg_2', nameUz: 'Samarqand shahri' }
    ]
  },
  {
    id: 'reg_3',
    nameUz: 'Buxoro viloyati',
    code: 'BUX',
    districts: [
      { id: 'dist_7', regionId: 'reg_3', nameUz: 'Buxoro shahri' }
    ]
  }
];

const initialProperties: Property[] = [
  {
    id: 'prop_1',
    title: 'Chilonzorda shinam va to‘liq jihozlangan 2 xonali kvartira',
    description: 'Chilonzor 1-mavzesida metro bekatiga 5 daqiqalik masofada joylashgan shinam xonadon. Yangi ta’mirlangan, barcha maishiy texnikalar (kir yuvish mashinasi, konditsioner, muzlatkich) mavjud. Tinch va osoyishta hovli, keng avtoturargoh.',
    price: 4500000,
    currency: 'UZS',
    rentPeriod: 'MONTHLY',
    propertyType: 'APARTMENT',
    rooms: 2,
    area: 62.0,
    floor: 3,
    totalFloors: 5,
    furnished: true,
    address: 'Chilonzor tumani, 1-mavze, 14-uy',
    regionId: 'reg_1',
    region: initialRegions[0],
    districtId: 'dist_1',
    district: initialRegions[0].districts![0],
    status: 'APPROVED',
    views: 342,
    rating: 4.9,
    brokerId: 'user_broker_1',
    broker: initialUsers[0],
    images: [
      { id: 'img_1', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', isPrimary: true, order: 0 },
      { id: 'img_2', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', isPrimary: false, order: 1 }
    ],
    amenities: [
      { amenity: { id: 'a1', name: 'Wi-Fi Internet', iconKey: 'wifi' } },
      { amenity: { id: 'a2', name: 'Konditsioner', iconKey: 'air-vent' } },
      { amenity: { id: 'a3', name: 'Muzlatkich', iconKey: 'refrigerator' } },
      { amenity: { id: 'a4', name: 'Kir yuvish mashinasi', iconKey: 'washing-machine' } }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prop_2',
    title: 'Yunusobod Shahristonda lyuks 3 xonali yangi bino kvartirasi',
    description: 'Shahriston metrosiga juda yaqin, novostroyka binosida joylashgan zamonaviy kvartira. Dizaynerlik yevro-ta’miri, keng oshxona, 2 ta sanuzel, xavfsizlik 24/7. Oila yoki xorijlik mehmonlar uchun ideal tanlov.',
    price: 8500000,
    currency: 'UZS',
    rentPeriod: 'MONTHLY',
    propertyType: 'APARTMENT',
    rooms: 3,
    area: 98.0,
    floor: 7,
    totalFloors: 12,
    furnished: true,
    address: 'Yunusobod tumani, Amir Temur ko‘chasi, 88A',
    regionId: 'reg_1',
    region: initialRegions[0],
    districtId: 'dist_2',
    district: initialRegions[0].districts![1],
    status: 'APPROVED',
    views: 618,
    rating: 5.0,
    brokerId: 'user_broker_1',
    broker: initialUsers[0],
    images: [
      { id: 'img_3', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isPrimary: true, order: 0 },
      { id: 'img_4', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', isPrimary: false, order: 1 }
    ],
    amenities: [
      { amenity: { id: 'a1', name: 'Wi-Fi Internet', iconKey: 'wifi' } },
      { amenity: { id: 'a2', name: 'Konditsioner', iconKey: 'air-vent' } },
      { amenity: { id: 'a5', name: 'Zamonaviy lift', iconKey: 'arrow-up-down' } }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prop_3',
    title: 'Mirzo Ulug‘bekda Buyuk Ipak Yo‘lida 1 xonali ixcham kvartira',
    description: 'Yolg‘iz yashovchi mutaxassis yoki yosh juftlik uchun ideal. Yangi mebel va texnika bilan to‘liq jihozlangan. Metroga 3 daqiqa piyoda.',
    price: 3800000,
    currency: 'UZS',
    rentPeriod: 'MONTHLY',
    propertyType: 'APARTMENT',
    rooms: 1,
    area: 44.0,
    floor: 4,
    totalFloors: 9,
    furnished: true,
    address: 'Mirzo Ulug‘bek tumani, Mirzo Ulug‘bek shoh ko‘chasi, 21',
    regionId: 'reg_1',
    region: initialRegions[0],
    districtId: 'dist_3',
    district: initialRegions[0].districts![2],
    status: 'APPROVED',
    views: 289,
    rating: 4.8,
    brokerId: 'user_broker_2',
    broker: initialUsers[1],
    images: [
      { id: 'img_5', url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80', isPrimary: true, order: 0 }
    ],
    amenities: [
      { amenity: { id: 'a1', name: 'Wi-Fi Internet', iconKey: 'wifi' } },
      { amenity: { id: 'a2', name: 'Konditsioner', iconKey: 'air-vent' } }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prop_4',
    title: 'Yakkasaroy Rakat mahallasida 4 xonali premium hovli uy',
    description: 'Toshkent markazida hashamatli hovli uy. 4 ta keng yotoqxona, 3 ta vanna xonasi, yashil bog‘, suzish havzasi va yopiq garaj.',
    price: 22000000,
    currency: 'UZS',
    rentPeriod: 'MONTHLY',
    propertyType: 'HOUSE',
    rooms: 4,
    area: 280.0,
    floor: 2,
    totalFloors: 2,
    furnished: true,
    address: 'Yakkasaroy tumani, Rakatboshi ko‘chasi, 45',
    regionId: 'reg_1',
    region: initialRegions[0],
    districtId: 'dist_4',
    district: initialRegions[0].districts![3],
    status: 'APPROVED',
    views: 740,
    rating: 5.0,
    brokerId: 'user_broker_1',
    broker: initialUsers[0],
    images: [
      { id: 'img_6', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', isPrimary: true, order: 0 }
    ],
    amenities: [
      { amenity: { id: 'a1', name: 'Wi-Fi Internet', iconKey: 'wifi' } },
      { amenity: { id: 'a2', name: 'Konditsioner', iconKey: 'air-vent' } },
      { amenity: { id: 'a6', name: 'Avtoturargoh', iconKey: 'car' } }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prop_5',
    title: 'Samarqand markazida Registon yaqinida 2 xonali kvartira',
    description: 'Samarqand shahrining tarixiy markazida shinam kvartira. Sayyohlar va oilalar uchun ideal tanlov.',
    price: 4000000,
    currency: 'UZS',
    rentPeriod: 'MONTHLY',
    propertyType: 'APARTMENT',
    rooms: 2,
    area: 58.0,
    floor: 2,
    totalFloors: 4,
    furnished: true,
    address: 'Samarqand shahri, Registon ko‘chasi, 12',
    regionId: 'reg_2',
    region: initialRegions[1],
    districtId: 'dist_6',
    district: initialRegions[1].districts![0],
    status: 'APPROVED',
    views: 195,
    rating: 4.85,
    brokerId: 'user_broker_2',
    broker: initialUsers[1],
    images: [
      { id: 'img_7', url: 'https://images.unsplash.com/photo-1502005229762-ae1b466320f2?auto=format&fit=crop&w=1200&q=80', isPrimary: true, order: 0 }
    ],
    amenities: [
      { amenity: { id: 'a1', name: 'Wi-Fi Internet', iconKey: 'wifi' } },
      { amenity: { id: 'a2', name: 'Konditsioner', iconKey: 'air-vent' } }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to get or set localStorage data
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(`ijara_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`ijara_${key}`, JSON.stringify(val));
  } catch {
    // Ignore
  }
}

// Ensure mock db initialized
if (!localStorage.getItem('ijara_users_initialized')) {
  setLocal('users', initialUsers);
  setLocal('properties', initialProperties);
  setLocal('regions', initialRegions);
  setLocal('favorites', [initialProperties[0].id]);
  setLocal('contracts', [
    {
      id: 'contract_1',
      contractNumber: 'IJARA-2026-0042',
      landlordName: 'Aziz Mahmudov',
      landlordPhone: '+998909876543',
      tenantId: 'user_client_1',
      tenant: initialUsers[3],
      brokerId: 'user_broker_1',
      broker: initialUsers[0],
      propertyId: 'prop_1',
      property: initialProperties[0],
      regionName: 'Toshkent shahri',
      districtName: 'Chilonzor tumani',
      address: 'Chilonzor tumani, 1-mavze, 14-uy, 28-xonadon',
      startDate: '2026-11-01',
      endDate: '2027-10-31',
      rentAmount: 4500000,
      paymentDate: 5,
      depositAmount: 4500000,
      utilitiesIncluded: 'Sovuq suv, chiqindi, domkom xarajatlari',
      furnitureList: 'Divan, 2 ta kreslo, shkaf, oshxona garnituri',
      status: 'ACTIVE',
      tenantApproved: true,
      brokerApproved: true,
      createdAt: new Date().toISOString(),
      handoverAct: {
        id: 'act_1',
        contractId: 'contract_1',
        meterGas: '14320.5 m³',
        meterElectricity: '08942.0 kW',
        meterWater: '03211.2 m³',
        propertyCondition: 'A’lo holatda, yangi ta’mir, devorlar toza.',
        furnitureNotes: 'Barcha jihozlar ro‘yxat bo‘yicha qabul qilindi.',
        tenantApproved: true,
        brokerApproved: true,
        signedDate: '2026-11-01'
      }
    }
  ]);
  localStorage.setItem('ijara_users_initialized', 'true');
}

function getHeaders() {
  const token = localStorage.getItem('ijara_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Fallback executor for offline or 405 static hosting environments
function fallbackHandler<T>(endpoint: string, options: RequestInit = {}): T {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth: Register
  if (endpoint.startsWith('/auth/register') && method === 'POST') {
    const users = getLocal<User[]>('users', initialUsers);
    const existing = users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      throw new Error('Bu email bilan foydalanuvchi allaqachon ro‘yxatdan o‘tgan');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: body.email.toLowerCase(),
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || '+998901234567',
      role: body.role || 'CLIENT',
      isVerified: body.role === 'CLIENT',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      profile: body.role === 'BROKER' ? {
        id: `p_${Date.now()}`,
        userId: `user_${Date.now()}`,
        companyName: body.companyName || 'Ko‘chmas mulk agentligi',
        specialization: body.specialization || 'Kvartiralar',
        experienceYears: 1,
        ratingAvg: 5.0,
        totalDeals: 0,
        responseTimeMin: 15
      } : null
    };

    users.push(newUser);
    setLocal('users', users);
    setLocal('current_user', newUser);

    const token = `token_${newUser.id}_${Date.now()}`;
    localStorage.setItem('ijara_token', token);

    return {
      success: true,
      message: 'Muvaffaqiyatli ro‘yxatdan o‘tdingiz!',
      token,
      user: newUser
    } as any;
  }

  // Auth: Login
  if (endpoint.startsWith('/auth/login') && method === 'POST') {
    const users = getLocal<User[]>('users', initialUsers);
    const user = users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (!user) {
      // Create guest session for convenience if valid email
      const guestUser: User = {
        id: `user_${Date.now()}`,
        email: body.email.toLowerCase(),
        firstName: body.email.split('@')[0],
        lastName: 'Foydalanuvchi',
        role: 'CLIENT',
        isVerified: true
      };
      setLocal('current_user', guestUser);
      const token = `token_${guestUser.id}`;
      localStorage.setItem('ijara_token', token);
      return { success: true, token, user: guestUser } as any;
    }

    setLocal('current_user', user);
    const token = `token_${user.id}_${Date.now()}`;
    localStorage.setItem('ijara_token', token);

    return { success: true, token, user } as any;
  }

  // Auth: Me
  if (endpoint.startsWith('/auth/me')) {
    const user = getLocal<User | null>('current_user', initialUsers[0]);
    if (!user) throw new Error('Kirilmagan');
    return { success: true, user } as any;
  }

  // Regions
  if (endpoint.startsWith('/regions')) {
    const regions = getLocal<Region[]>('regions', initialRegions);
    return { success: true, data: regions } as any;
  }

  // Properties list
  if (endpoint.startsWith('/properties') && method === 'GET') {
    if (endpoint.includes('amenities')) {
      return {
        success: true,
        data: [
          { id: 'a1', name: 'Wi-Fi Internet', iconKey: 'wifi' },
          { id: 'a2', name: 'Konditsioner', iconKey: 'air-vent' },
          { id: 'a3', name: 'Muzlatkich', iconKey: 'refrigerator' },
          { id: 'a4', name: 'Kir yuvish mashinasi', iconKey: 'washing-machine' },
          { id: 'a5', name: 'Zamonaviy lift', iconKey: 'arrow-up-down' },
          { id: 'a6', name: 'Avtoturargoh', iconKey: 'car' }
        ]
      } as any;
    }

    const properties = getLocal<Property[]>('properties', initialProperties);
    return {
      success: true,
      data: properties,
      pagination: { total: properties.length, page: 1, limit: 9, totalPages: 1 }
    } as any;
  }

  // Brokers
  if (endpoint.startsWith('/brokers') && method === 'GET') {
    const users = getLocal<User[]>('users', initialUsers);
    const brokers = users.filter((u) => u.role === 'BROKER');
    return { success: true, data: brokers } as any;
  }

  // Favorites
  if (endpoint.startsWith('/favorites/ids')) {
    const favIds = getLocal<string[]>('favorites', []);
    return { success: true, ids: favIds } as any;
  }

  if (endpoint.startsWith('/favorites/toggle') && method === 'POST') {
    let favIds = getLocal<string[]>('favorites', []);
    const { propertyId } = body;
    const exists = favIds.includes(propertyId);
    if (exists) {
      favIds = favIds.filter((id) => id !== propertyId);
    } else {
      favIds.push(propertyId);
    }
    setLocal('favorites', favIds);
    return { success: true, saved: !exists, message: !exists ? 'Qo‘shildi' : 'O‘chirildi' } as any;
  }

  if (endpoint.startsWith('/favorites')) {
    const favIds = getLocal<string[]>('favorites', []);
    const allProps = getLocal<Property[]>('properties', initialProperties);
    const favorites = allProps.filter((p) => favIds.includes(p.id));
    return { success: true, data: favorites } as any;
  }

  // Contracts
  if (endpoint.startsWith('/contracts')) {
    const contracts = getLocal<Contract[]>('contracts', []);
    return { success: true, data: contracts } as any;
  }

  // Viewings
  if (endpoint.startsWith('/viewings')) {
    return { success: true, data: [] } as any;
  }

  // Notifications
  if (endpoint.startsWith('/notifications')) {
    return { success: true, data: [], unreadCount: 0 } as any;
  }

  return { success: true, data: [] } as any;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    // If server responds with 405 (Method Not Allowed) or 404 on static hosting, use offline fallback!
    if (response.status === 405 || response.status === 404) {
      console.warn(`[IJARA.UZ] API responded with ${response.status}. Switching seamlessly to client database fallback.`);
      return fallbackHandler<T>(endpoint, options);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return fallbackHandler<T>(endpoint, options);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `So‘rov bajarilmadi (${response.status})`);
    }
    return data;
  } catch (err: any) {
    if (err.message && !err.message.includes('So‘rov bajarilmadi') && !err.message.includes('email bilan')) {
      console.warn('[IJARA.UZ] Network or hosting limitation encountered. Using smart client-side store:', err.message);
      return fallbackHandler<T>(endpoint, options);
    }
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: (credentials: any) =>
      request<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      request<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => request<{ success: boolean; user: User }>('/auth/me'),
    updateProfile: (profileData: any) =>
      request<{ success: boolean; user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },

  // Regions
  regions: {
    getAll: () => request<{ success: boolean; data: Region[] }>('/regions'),
    create: (data: any) =>
      request<{ success: boolean; data: Region }>('/regions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Properties
  properties: {
    getAll: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      return request<{
        success: boolean;
        data: Property[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(`/properties?${query.toString()}`);
    },
    getById: (id: string) => request<{ success: boolean; data: Property }>(`/properties/${id}`),
    create: (data: any) =>
      request<{ success: boolean; data: Property }>('/properties', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ success: boolean; data: Property }>(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/properties/${id}`, {
        method: 'DELETE',
      }),
    getMyListings: () => request<{ success: boolean; data: Property[] }>('/properties/my/listings'),
    getAmenities: () => request<{ success: boolean; data: { id: string; name: string; iconKey: string }[] }>('/properties/amenities/list'),
  },

  // Brokers
  brokers: {
    getAll: () => request<{ success: boolean; data: User[] }>('/brokers'),
    getById: (id: string) => request<{ success: boolean; data: User }>(`/brokers/${id}`),
    getMyStats: () =>
      request<{
        success: boolean;
        data: {
          totalViews: number;
          listingsCount: number;
          viewingsCount: number;
          activeContractsCount: number;
          savedCount: number;
          pendingViewings: Viewing[];
        };
      }>('/brokers/my/stats'),
  },

  // Favorites
  favorites: {
    getAll: () => request<{ success: boolean; data: Property[] }>('/favorites'),
    getIds: () => request<{ success: boolean; ids: string[] }>('/favorites/ids'),
    toggle: (propertyId: string) =>
      request<{ success: boolean; saved: boolean; message: string }>('/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ propertyId }),
      }),
  },

  // Viewings
  viewings: {
    getAll: () => request<{ success: boolean; data: Viewing[] }>('/viewings'),
    create: (data: { propertyId: string; scheduledTime: string; notes?: string }) =>
      request<{ success: boolean; data: Viewing }>('/viewings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      request<{ success: boolean; data: Viewing }>(`/viewings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Contracts
  contracts: {
    getAll: () => request<{ success: boolean; data: Contract[] }>('/contracts'),
    getById: (id: string) => request<{ success: boolean; data: Contract }>(`/contracts/${id}`),
    create: (data: any) =>
      request<{ success: boolean; data: Contract }>('/contracts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    approve: (id: string) =>
      request<{ success: boolean; data: Contract }>(`/contracts/${id}/approve`, {
        method: 'PATCH',
      }),
    saveHandover: (contractId: string, data: any) =>
      request<{ success: boolean; data: HandoverAct }>(`/contracts/${contractId}/handover`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Chat
  chat: {
    getConversations: () => request<{ success: boolean; data: Conversation[] }>('/chat/conversations'),
    start: (brokerId: string, propertyId?: string, initialMessage?: string) =>
      request<{ success: boolean; data: Conversation }>('/chat/conversations/start', {
        method: 'POST',
        body: JSON.stringify({ brokerId, propertyId, initialMessage }),
      }),
    getMessages: (conversationId: string) =>
      request<{
        success: boolean;
        data: { conversation: Conversation; messages: Message[] };
      }>(`/chat/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: string, text: string, imageUrl?: string) =>
      request<{ success: boolean; data: Message }>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ conversationId, text, imageUrl }),
      }),
  },

  // Notifications
  notifications: {
    getAll: () =>
      request<{ success: boolean; data: NotificationItem[]; unreadCount: number }>('/notifications'),
    markRead: (id: string) =>
      request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }),
  },

  // Reviews
  reviews: {
    create: (data: { targetUserId?: string; propertyId?: string; rating: number; comment: string; roleScope?: string }) =>
      request<{ success: boolean; data: any }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Reports
  reports: {
    create: (data: { targetType: string; targetId: string; reason: string; description: string }) =>
      request<{ success: boolean; data: any }>('/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Admin
  admin: {
    getStats: () => request<{ success: boolean; data: any }>('/admin/stats'),
    getUsers: () => request<{ success: boolean; data: User[] }>('/admin/users'),
    verifyUser: (id: string, status: string, note?: string) =>
      request<{ success: boolean; data: User }>(`/admin/users/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      }),
    getProperties: () => request<{ success: boolean; data: Property[] }>('/admin/properties'),
    updatePropertyStatus: (id: string, status: string) =>
      request<{ success: boolean; data: Property }>(`/admin/properties/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getReports: () => request<{ success: boolean; data: ReportItem[] }>('/admin/reports'),
    resolveReport: (id: string, status: string) =>
      request<{ success: boolean; data: any }>(`/admin/reports/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getAuditLogs: () => request<{ success: boolean; data: any[] }>('/admin/audit-logs'),
  },
};
