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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `So‘rov bajarilmadi (${response.status})`);
  }

  return data;
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
