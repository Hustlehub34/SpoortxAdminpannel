const BASE_URL = 'https://spoortx.onrender.com/api';

export interface ApiUser {
  userId: number;
  name: string;
  email: string;
  mobile: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  userType: string;
  teamName: string | null;
  title: string | null;
  playingRole: string | null;
  description: string | null;
  gamePreferences: string | null;
  profilePhotoUrl: string | null;
  profilePhotoFileName: string | null;
  latitude: number | null;
  longitude: number | null;
  walletBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface UsersResponse {
  code: number;
  status: boolean;
  message: string;
  data: {
    users: ApiUser[];
    totalUsers: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'blocked';
  joinedAt: Date;
  totalBookings: number;
  city?: string;
  walletBalance?: number;
  userType?: string;
}

class UserService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${BASE_URL}/admin/users`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UsersResponse = await response.json();

      // Transform API data to match frontend User interface
      return data.data.users.map((apiUser) => ({
        id: `user_${apiUser.userId}`,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.mobile,
        status: apiUser.isActive ? 'active' : 'blocked',
        joinedAt: new Date(apiUser.createdAt),
        totalBookings: 0, // This field is not in API, so default to 0
        city: apiUser.city || undefined,
        walletBalance: apiUser.walletBalance,
        userType: apiUser.userType
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      // Extract numeric ID from string format "user_123"
      const numericId = userId.replace('user_', '');

      const response = await fetch(`${BASE_URL}/admin/users/${numericId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
}

export const userService = new UserService();