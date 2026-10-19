export interface ServiceItem {
  name: string;
  price: number;
  unit: string;
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  serviceType?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  category?: string;
}

export interface Specialist {
  id: string;
  name: string;
  profession: string;
  categoryId: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  startingPrice: number;
  priceUnit: string;
  phone: string;
  telegram: string;
  district: string;
  address?: string;
  avatar: string;
  bio: string;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  reviews: Review[];
  isVerified: boolean;
  isAvailable24_7: boolean;
  badges: string[];
  completedOrdersCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  count: number;
  color: string;
  bgColor: string;
}

export interface District {
  id: string;
  name: string;
  region: string;
}

export type UrgencyType = 'urgent' | 'today' | 'scheduled';
export type BookingStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface BookingRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  specialistId?: string;
  specialistName?: string;
  categoryId: string;
  district: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  urgency: UrgencyType;
  description: string;
  photoUrl?: string;
  status: BookingStatus;
  createdAt: string;
  estimatedResponseTime: string;
}

export interface FilterState {
  searchQuery: string;
  categoryId: string;
  district: string;
  minRating: number;
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'experience';
  only24_7: boolean;
  onlyVerified: boolean;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
}

export interface CatalogService {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  averagePrice: string;
  duration: string;
  description: string;
  popular?: boolean;
}

export type ThemeId =
  | 'eye-comfort'
  | 'dark-night'
  | 'nature-emerald'
  | 'minimal-slate'
  | 'modern-blue';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  badge: string;
  iconName: string;
  previewBg: string;
  previewCard: string;
  previewAccent: string;
  description: string;
}

export interface UserProfile {
  id: string;
  phone: string; // E.g. "+998901234567"
  name: string;
  role: 'client' | 'specialist';
  isPhoneVerified: boolean;
  district?: string;
  telegramChatId?: number;
  telegramUsername?: string;
  specialistId?: string;
  createdAt: string;
}

export interface SmsVerificationSession {
  phone: string;
  code: string;
  expiresAt: number;
  purpose: 'login' | 'register_specialist' | 'verify';
}

