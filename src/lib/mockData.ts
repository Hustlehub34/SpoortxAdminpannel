// Mock data for admin panel

export interface TurfOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  tempPassword?: string;
  totalBookings30d: number;
  revenue30d: number;
  pendingSettlements: number;
}

export interface Turf {
  id: string;
  ownerId: string;
  name: string;
  city: string;
  address: string;
  sports: string[];
  images: string[];
  status: 'pending' | 'active' | 'inactive';
  totalBookings30d: number;
  revenue30d: number;
  pendingSettlements: number;
  pricing: { sport: string; pricePerHour: number }[];
  availableSlots: string[];
  cancellationPolicy: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
  };
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  turfId: string;
  turfName: string;
  date: Date;
  time: string;
  sport: string;
  amount: number;
  status: 'confirmed' | 'cancelled' | 'refunded' | 'no-show';
  paymentMethod: string;
  transactionId: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  userId: string;
  turfId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: Date;
  gatewayTransactionId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'blocked';
  totalBookings: number;
  totalSpent: number;
  joinedAt: Date;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  timestamp: Date;
  details: string;
  ipAddress: string;
}

// Mock admin credentials
export const ADMIN_CREDENTIALS = {
  email: 'admin@turfbooking.com',
  password: 'admin123',
};

// Generate mock data
export const mockTurfOwners: TurfOwner[] = [
  {
    id: 'OWN001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    totalBookings30d: 145,
    revenue30d: 87500,
    pendingSettlements: 12500,
  },
  {
    id: 'OWN002',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43211',
    status: 'active',
    createdAt: new Date('2024-02-20'),
    totalBookings30d: 98,
    revenue30d: 52000,
    pendingSettlements: 8000,
  },
  {
    id: 'OWN003',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 98765 43212',
    status: 'pending',
    createdAt: new Date('2024-10-10'),
    totalBookings30d: 0,
    revenue30d: 0,
    pendingSettlements: 0,
  },
];

export const mockTurfs: Turf[] = [
  {
    id: 'TURF001',
    ownerId: 'OWN001',
    name: 'Elite Sports Arena',
    city: 'Mumbai',
    address: '123 Marine Drive, Mumbai 400001',
    sports: ['Football', 'Cricket', 'Badminton'],
    images: [
      'https://images.unsplash.com/photo-1459865264687-595d652de67e',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
      'https://images.unsplash.com/photo-1551958219-acbc608c6377',
    ],
    status: 'active',
    totalBookings30d: 145,
    revenue30d: 87500,
    pendingSettlements: 12500,
    pricing: [
      { sport: 'Football', pricePerHour: 800 },
      { sport: 'Cricket', pricePerHour: 1000 },
    ],
    availableSlots: ['06:00-08:00', '08:00-10:00', '18:00-20:00', '20:00-22:00'],
    cancellationPolicy: 'Free cancellation up to 24 hours before booking',
    bankDetails: {
      accountName: 'Rajesh Kumar',
      accountNumber: '1234567890',
      ifsc: 'HDFC0001234',
    },
  },
  {
    id: 'TURF002',
    ownerId: 'OWN002',
    name: 'Victory Sports Complex',
    city: 'Bangalore',
    address: '45 MG Road, Bangalore 560001',
    sports: ['Football', 'Basketball'],
    images: [
      'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68',
    ],
    status: 'active',
    totalBookings30d: 98,
    revenue30d: 52000,
    pendingSettlements: 8000,
    pricing: [{ sport: 'Football', pricePerHour: 700 }],
    availableSlots: ['07:00-09:00', '17:00-19:00', '19:00-21:00'],
    cancellationPolicy: 'Free cancellation up to 12 hours before booking',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'BKG001',
    userId: 'USR001',
    userName: 'Vikram Singh',
    turfId: 'TURF001',
    turfName: 'Elite Sports Arena',
    date: new Date('2025-10-20'),
    time: '18:00-20:00',
    sport: 'Football',
    amount: 1600,
    status: 'confirmed',
    paymentMethod: 'UPI',
    transactionId: 'TXN001',
  },
  {
    id: 'BKG002',
    userId: 'USR002',
    userName: 'Sneha Reddy',
    turfId: 'TURF002',
    turfName: 'Victory Sports Complex',
    date: new Date('2025-10-21'),
    time: '07:00-09:00',
    sport: 'Football',
    amount: 1400,
    status: 'confirmed',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN002',
  },
];

export const mockUsers: User[] = [
  {
    id: 'USR001',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91 98765 00001',
    status: 'active',
    totalBookings: 23,
    totalSpent: 45000,
    joinedAt: new Date('2024-06-01'),
  },
  {
    id: 'USR002',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    phone: '+91 98765 00002',
    status: 'active',
    totalBookings: 15,
    totalSpent: 28000,
    joinedAt: new Date('2024-07-15'),
  },
];

export const mockAuditLogs: AuditLog[] = [];

export const addAuditLog = (action: string, details: string) => {
  mockAuditLogs.unshift({
    id: `LOG${Date.now()}`,
    adminId: 'ADMIN001',
    action,
    timestamp: new Date(),
    details,
    ipAddress: '192.168.1.1',
  });
};
