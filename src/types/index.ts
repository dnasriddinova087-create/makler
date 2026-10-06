export interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'BROKER' | 'ADMIN';
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  profile?: Profile | null;
  verification?: Verification | null;
  unreadNotificationsCount?: number;
  favoritesCount?: number;
  propertiesCount?: number;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string | null;
  experienceYears?: number;
  companyName?: string | null;
  specialization?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;
  ratingAvg: number;
  totalDeals: number;
  responseTimeMin: number;
}

export interface Verification {
  id: string;
  userId: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  idDocumentType?: string | null;
  documentNumber?: string | null;
  verifiedAt?: string | null;
  reviewerNote?: string | null;
}

export interface Region {
  id: string;
  nameUz: string;
  nameRu?: string | null;
  code: string;
  districts?: District[];
}

export interface District {
  id: string;
  regionId: string;
  nameUz: string;
  nameRu?: string | null;
  mahallas?: Mahalla[];
}

export interface Mahalla {
  id: string;
  districtId: string;
  nameUz: string;
}

export interface Amenity {
  id: string;
  name: string;
  iconKey: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  caption?: string | null;
  order: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'UZS' | 'USD';
  rentPeriod: 'MONTHLY' | 'DAILY' | 'SHORT_TERM' | 'LONG_TERM';
  propertyType: 'APARTMENT' | 'HOUSE' | 'YARD' | 'DORM' | 'OTHER';
  rooms: number;
  area: number;
  floor?: number | null;
  totalFloors?: number | null;
  furnished: boolean;
  address: string;
  regionId: string;
  region: Region;
  districtId: string;
  district: District;
  mahallaId?: string | null;
  mahalla?: Mahalla | null;
  latitude?: number | null;
  longitude?: number | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'RENTED' | 'ARCHIVED';
  views: number;
  rating: number;
  brokerId: string;
  broker: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    avatarUrl?: string | null;
    isVerified: boolean;
    profile?: Profile | null;
  };
  images: PropertyImage[];
  amenities: { amenity: Amenity }[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  rating: number;
  comment: string;
  roleScope: string;
  createdAt: string;
}

export interface Viewing {
  id: string;
  propertyId: string;
  property: Property;
  clientId: string;
  client: User;
  brokerId: string;
  broker: User;
  scheduledTime: string;
  notes?: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  createdAt: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  landlordName: string;
  landlordPhone: string;
  tenantId: string;
  tenant: User;
  brokerId: string;
  broker: User;
  propertyId: string;
  property: Property;
  regionName: string;
  districtName: string;
  mahallaName?: string | null;
  address: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  paymentDate: number;
  depositAmount: number;
  utilitiesIncluded?: string | null;
  furnitureList?: string | null;
  additionalTerms?: string | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  tenantApproved: boolean;
  brokerApproved: boolean;
  createdAt: string;
  handoverAct?: HandoverAct | null;
}

export interface HandoverAct {
  id: string;
  contractId: string;
  meterGas?: string | null;
  meterElectricity?: string | null;
  meterWater?: string | null;
  propertyCondition?: string | null;
  furnitureNotes?: string | null;
  photosJson?: string | null;
  tenantApproved: boolean;
  brokerApproved: boolean;
  signedDate?: string | null;
}

export interface Conversation {
  id: string;
  clientId: string;
  client: User;
  brokerId: string;
  broker: User;
  propertyId?: string | null;
  property?: Property | null;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  text: string;
  imageUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporter: { firstName: string; lastName: string; email: string };
  targetType: string;
  targetId: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}
