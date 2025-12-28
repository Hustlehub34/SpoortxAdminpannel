const BASE_URL = 'https://spoortx.onrender.com/api';

export interface TurfOwnerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  turfs?: any[];
}

export interface State {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  stateId: number;
}

export interface Sport {
  id: number;
  name: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

export interface CreateTurfDto {
  turfName: string;
  city: string;
  pricePerHour: number;
  description: string;
  sportIds: number[];
  amenityIds: number[];
  isActive: boolean;
}

export interface TurfResponse {
  id: string;
  turfName: string;
  ownerId: string;
  city: string;
  pricePerHour: number;
  description: string;
  sports: Sport[];
  amenities: Amenity[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTurf {
  turfId: number;
  turfName: string;
  ownerId: number;
  ownerName: string;
  city: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  images: string[];
  sports: ApiSport[];
  amenities: ApiAmenity[];
}

export interface ApiSport {
  sportId: number;
  sportName: string;
  description: string;
}

export interface ApiAmenity {
  amenityId: number;
  amenityName: string;
  description: string;
}

export interface TurfsApiResponse {
  code: number;
  status: boolean;
  message: string;
  data: {
    turfs: ApiTurf[];
    totalTurfs: number;
  };
}

export interface TurfOwner {
  userId: number;
  name: string;
  email: string;
  mobile: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  totalTurfs: number;
  ownedTurfs: any[];
}

export interface TurfOwnersApiResponse {
  code: number;
  status: boolean;
  message: string;
  data: {
    turfOwners: TurfOwner[];
    totalOwners: number;
  };
}

export interface SportsApiResponse {
  success: boolean;
  message: string;
  data: Array<{
    sportId: number;
    sportName: string;
    description: string;
  }>;
}

export interface AmenitiesApiResponse {
  success: boolean;
  message: string;
  data: Array<{
    amenityId: number;
    amenityName: string;
    description: string;
  }>;
}

export interface ApiBooking {
  bookingId: number;
  bookingNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  userMobile: string;
  turfId: number;
  turfName: string;
  turfCity: string;
  sportId: number;
  sportName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  numberOfPlayers: number;
  basePrice: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  specialRequests: string | null;
  createdAt: string;
}

export interface BookingsApiResponse {
  code: number;
  status: boolean;
  message: string;
  data: {
    bookings: ApiBooking[];
    totalBookings: number;
  };
}

export interface DashboardMetric {
  value: number;
  percentageChange: number;
  comparisonPeriod: string;
}

export interface RecentBooking {
  bookingId: number;
  customerName: string;
  customerInitial: string;
  turfName: string;
  amount: number;
  timeSlot: string;
  bookingDate: string;
  createdAt: string;
}

export interface TopPerformingTurf {
  turfId: number;
  turfName: string;
  totalBookings: number;
  totalRevenue: number;
}

export interface DashboardData {
  todaysBookings: DashboardMetric;
  revenueToday: DashboardMetric;
  activeTurfs: DashboardMetric;
  pendingSettlements: DashboardMetric;
  recentBookings: RecentBooking[];
  topPerformingTurfs: TopPerformingTurf[];
}

export interface DashboardApiResponse {
  code: number;
  status: boolean;
  message: string;
  data: DashboardData;
}

class TurfService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Get all turfs (admin view)
  async getTurfs(): Promise<ApiTurf[]> {
    try {
      const response = await fetch(`${BASE_URL}/admin/turfs/all`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TurfsApiResponse = await response.json();
      return data.data.turfs;
    } catch (error) {
      console.error('Error fetching turfs:', error);
      throw error;
    }
  }

  // Get turf owner profile
  async getTurfOwnerProfile(): Promise<TurfOwnerProfile> {
    try {
      const response = await fetch(`${BASE_URL}/TurfOwner/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching turf owner profile:', error);
      throw error;
    }
  }

  // Create new turf
  async createTurf(ownerId: string, turfData: CreateTurfDto): Promise<TurfResponse> {
    try {
      const response = await fetch(`${BASE_URL}/admin/turfs?ownerId=${ownerId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(turfData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating turf:', error);
      throw error;
    }
  }

  // Get all states
  async getStates(): Promise<State[]> {
    try {
      const response = await fetch(`${BASE_URL}/Location/states`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  }

  // Get cities by state
  async getCitiesByState(stateId: number): Promise<City[]> {
    try {
      const response = await fetch(`${BASE_URL}/Location/states/${stateId}/cities`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }

  // Get available sports from API
  async getSports(): Promise<Sport[]> {
    try {
      const response = await fetch(`${BASE_URL}/Sports`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: SportsApiResponse = await response.json();
      // Transform API response to Sport[] format
      return apiResponse.data.map(sport => ({
        id: sport.sportId,
        name: sport.sportName
      }));
    } catch (error) {
      console.error('Error fetching sports:', error);
      // Return fallback data if API fails
      return [
        { id: 1, name: 'Football' },
        { id: 2, name: 'Cricket' },
        { id: 3, name: 'Basketball' },
        { id: 4, name: 'Badminton' },
        { id: 5, name: 'Tennis' },
        { id: 6, name: 'Volleyball' }
      ];
    }
  }

  // Get available amenities from API
  async getAmenities(): Promise<Amenity[]> {
    try {
      const response = await fetch(`${BASE_URL}/Amenities`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: AmenitiesApiResponse = await response.json();
      // Transform API response to Amenity[] format
      return apiResponse.data.map(amenity => ({
        id: amenity.amenityId,
        name: amenity.amenityName
      }));
    } catch (error) {
      console.error('Error fetching amenities:', error);
      // Return fallback data if API fails
      return [
        { id: 1, name: 'Parking', icon: 'parking' },
        { id: 2, name: 'Changing Room', icon: 'door' },
        { id: 3, name: 'Floodlights', icon: 'lightbulb' },
        { id: 4, name: 'Water Facility', icon: 'droplet' },
        { id: 5, name: 'First Aid', icon: 'heart' },
        { id: 6, name: 'Washroom', icon: 'toilet' },
        { id: 7, name: 'Cafeteria', icon: 'coffee' },
        { id: 8, name: 'Equipment Rental', icon: 'box' }
      ];
    }
  }

  // Get all turf owners (admin view)
  async getTurfOwners(): Promise<TurfOwner[]> {
    try {
      const response = await fetch(`${BASE_URL}/Admin/turf-owners`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: TurfOwnersApiResponse = await response.json();
      return apiResponse.data.turfOwners;
    } catch (error) {
      console.error('Error fetching turf owners:', error);
      throw error;
    }
  }

  // Get all bookings (admin view)
  async getBookings(): Promise<ApiBooking[]> {
    try {
      const response = await fetch(`${BASE_URL}/Admin/bookings/history`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: BookingsApiResponse = await response.json();
      return apiResponse.data.bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  // Get dashboard data (admin view)
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await fetch(`${BASE_URL}/Admin/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: DashboardApiResponse = await response.json();
      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export const turfService = new TurfService();