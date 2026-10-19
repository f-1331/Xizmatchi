'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Specialist, BookingRequest, FilterState, ToastNotification, Review, BookingStatus, ThemeId, UserProfile } from '../types';
import {
  getStoredSpecialists,
  saveStoredSpecialists,
  getStoredBookings,
  saveStoredBookings,
  getStoredFavorites,
  saveStoredFavorites,
  generateBookingId,
  resetSpecialistsToLatest,
} from '../lib/storage';

export function normalizeDistrict(val?: string | null): string {
  if (!val) return '';
  return val
    .toLowerCase()
    .replace(/[’‘ʻʼ'`\-]/g, '')
    .replace(/\s+/g, '')
    .replace(/tumani|shahri|tuman|shahar|viloyati|viloyat/g, '')
    .trim();
}

interface AppContextType {
  specialists: Specialist[];
  filteredSpecialists: Specialist[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  refreshData: (targetDistrict?: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Auth & User Profile
  currentUser: UserProfile | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (user: UserProfile) => void;
  logout: () => void;

  // Theme
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;

  // Modals & Drawers
  selectedSpecialist: Specialist | null;
  setSelectedSpecialist: (specialist: Specialist | null) => void;
  selectedSpecialistTab: 'services' | 'portfolio' | 'reviews';
  setSelectedSpecialistTab: (tab: 'services' | 'portfolio' | 'reviews') => void;
  openSpecialistDetail: (specialist: Specialist, tab?: 'services' | 'portfolio' | 'reviews') => void;

  isBookingModalOpen: boolean;
  bookingSpecialist: Specialist | null;
  bookingCategory: string | null;
  openBookingModal: (specialist?: Specialist | null, categoryId?: string | null) => void;
  closeBookingModal: () => void;

  isAddSpecialistModalOpen: boolean;
  setIsAddSpecialistModalOpen: (open: boolean) => void;

  isMyBookingsOpen: boolean;
  setIsMyBookingsOpen: (open: boolean) => void;

  isFavoritesOpen: boolean;
  setIsFavoritesOpen: (open: boolean) => void;

  // Bookings
  bookings: BookingRequest[];
  createBooking: (
    data: Omit<BookingRequest, 'id' | 'createdAt' | 'status' | 'estimatedResponseTime'>
  ) => BookingRequest;
  updateBookingStatus: (id: string, status: BookingStatus) => void;

  // Specialist Actions
  addSpecialist: (
    data: Omit<Specialist, 'id' | 'createdAt' | 'rating' | 'reviewsCount' | 'completedOrdersCount' | 'reviews'>
  ) => Specialist;
  addReview: (
    specialistId: string,
    review: { authorName: string; rating: number; comment: string; serviceType?: string }
  ) => void;

  // Toast
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', title?: string) => void;
  removeToast: (id: string) => void;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  categoryId: 'all',
  district: 'all',
  minRating: 0,
  sortBy: 'recommended',
  only24_7: false,
  onlyVerified: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // User Profile & Auth
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals state
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedSpecialistTab, setSelectedSpecialistTab] = useState<'services' | 'portfolio' | 'reviews'>('services');

  const openSpecialistDetail = (specialist: Specialist, tab: 'services' | 'portfolio' | 'reviews' = 'services') => {
    setSelectedSpecialist(specialist);
    setSelectedSpecialistTab(tab);
  };
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSpecialist, setBookingSpecialist] = useState<Specialist | null>(null);
  const [bookingCategory, setBookingCategory] = useState<string | null>(null);
  const [isAddSpecialistModalOpen, setIsAddSpecialistModalOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Theme state
  const [theme, setThemeState] = useState<ThemeId>('eye-comfort');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Initialize from LocalStorage
  useEffect(() => {
    setSpecialists(getStoredSpecialists());
    setBookings(getStoredBookings());
    setFavorites(getStoredFavorites());

    try {
      const savedUser = localStorage.getItem('xizmatchi_current_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error loading current user:', e);
    }

    try {
      const savedTheme = localStorage.getItem('xizmatchi_theme_v2') as ThemeId;
      if (savedTheme) {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'eye-comfort');
        document.body.setAttribute('data-theme', 'eye-comfort');
      }
    } catch (e) {
      console.error('Error loading theme:', e);
    }

    setIsLoaded(true);
  }, []);

  const login = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('xizmatchi_current_user', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving current user:', e);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('xizmatchi_current_user');
      showToast("Tizimdan chiqdingiz.", 'info', "Xayr!");
    } catch (e) {
      console.error('Error removing current user:', e);
    }
  };

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('xizmatchi_theme_v2', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
      showToast("Dizayn mavzusi muvaffaqiyatli almashtirildi!", 'success', "Yangi ko'rinish");
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  };

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
    title?: string
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const newToast: ToastNotification = { id, message, type, title };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const refreshData = (targetDistrict?: string) => {
    const updatedSpecialists = resetSpecialistsToLatest();
    setSpecialists(updatedSpecialists);

    if (targetDistrict && targetDistrict !== 'all') {
      setFilters((prev) => ({
        ...prev,
        district: targetDistrict,
        searchQuery: '',
      }));
    }

    const distLabel =
      targetDistrict && targetDistrict !== 'all' ? targetDistrict : "Barcha hududlar";
    showToast(
      `${distLabel} bo'yicha ma'lumotlar va xizmatlar yangilandi!`,
      'success',
      "Sayt yangilandi"
    );

    if (typeof window !== 'undefined') {
      const el = document.getElementById('specialists-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      saveStoredFavorites(next);
      if (exists) {
        showToast("Tanlanganlardan olib tashlandi", 'info');
      } else {
        showToast("Saqlangan ustalarga qo'shildi!", 'success');
      }
      return next;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const openBookingModal = (specialist?: Specialist | null, categoryId?: string | null) => {
    setBookingSpecialist(specialist || null);
    setBookingCategory(categoryId || specialist?.categoryId || null);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingSpecialist(null);
    setBookingCategory(null);
  };

  const createBooking = (
    data: Omit<BookingRequest, 'id' | 'createdAt' | 'status' | 'estimatedResponseTime'>
  ): BookingRequest => {
    const newBooking: BookingRequest = {
      ...data,
      id: generateBookingId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedResponseTime:
        data.urgency === 'urgent'
          ? "10-15 daqiqa ichida qo'ng'iroq"
          : data.urgency === 'today'
          ? "30-60 daqiqa ichida qo'ng'iroq"
          : "2 soat ichida bog'laniladi",
    };

    const nextBookings = [newBooking, ...bookings];
    setBookings(nextBookings);
    saveStoredBookings(nextBookings);
    showToast(
      `Buyurtma qabul qilindi! ID: #${newBooking.id}`,
      'success',
      "Muvaffaqiyatli topshirildi"
    );
    return newBooking;
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    const nextBookings = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    setBookings(nextBookings);
    saveStoredBookings(nextBookings);
    showToast("Buyurtma holati yangilandi", 'info');
  };

  const addSpecialist = (
    data: Omit<Specialist, 'id' | 'createdAt' | 'rating' | 'reviewsCount' | 'completedOrdersCount' | 'reviews'>
  ): Specialist => {
    const newSpecialist: Specialist = {
      ...data,
      id: `spec-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      completedOrdersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isVerified: true,
      reviews: [
        {
          id: `rev-${Date.now()}`,
          authorName: "Xizmatchi Xavfsizlik Nazorati",
          rating: 5,
          date: new Date().toISOString().split('T')[0],
          comment: "Usta telefon raqami SMS kod orqali 100% muvaffaqiyatli tasdiqlandi va qabul qilindi.",
          serviceType: "SMS Verifikatsiya",
        },
      ],
    };

    const nextSpecialists = [newSpecialist, ...specialists];
    setSpecialists(nextSpecialists);
    saveStoredSpecialists(nextSpecialists);

    // If currentUser is set, update their role to specialist and link specialistId
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        role: 'specialist',
        specialistId: newSpecialist.id,
      };
      login(updatedUser);
      // Sync to backend users store
      fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      }).catch(console.error);
    }

    showToast("Yangi usta profili muvaffaqiyatli yaratildi!", 'success', "Xush kelibsiz!");
    return newSpecialist;
  };

  const addReview = (
    specialistId: string,
    reviewData: { authorName: string; rating: number; comment: string; serviceType?: string }
  ) => {
    const nextSpecialists = specialists.map((spec) => {
      if (spec.id === specialistId) {
        const newReview: Review = {
          id: `rev-${Date.now()}`,
          authorName: reviewData.authorName,
          rating: reviewData.rating,
          date: new Date().toISOString().split('T')[0],
          comment: reviewData.comment,
          serviceType: reviewData.serviceType || 'Xizmat',
        };

        const totalRating = spec.reviews.reduce((acc, r) => acc + r.rating, 0) + reviewData.rating;
        const newCount = spec.reviews.length + 1;
        const newRating = Number((totalRating / newCount).toFixed(2));

        const updatedSpec: Specialist = {
          ...spec,
          rating: newRating,
          reviewsCount: newCount,
          reviews: [newReview, ...spec.reviews],
        };

        if (selectedSpecialist?.id === specialistId) {
          setSelectedSpecialist(updatedSpec);
        }

        return updatedSpec;
      }
      return spec;
    });

    setSpecialists(nextSpecialists);
    saveStoredSpecialists(nextSpecialists);
    showToast("Fikringiz va bahongiz saqlandi! Rahmat.", 'success');
  };

  // Filtered specialists logic
  const filteredSpecialists = specialists.filter((spec) => {
    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = spec.name.toLowerCase().includes(q);
      const matchProf = spec.profession.toLowerCase().includes(q);
      const matchBio = spec.bio.toLowerCase().includes(q);
      const matchDistrict = spec.district.toLowerCase().includes(q);
      const matchServices = spec.services.some((s) => s.name.toLowerCase().includes(q));

      if (!matchName && !matchProf && !matchBio && !matchDistrict && !matchServices) {
        return false;
      }
    }

    // Category
    if (filters.categoryId !== 'all' && spec.categoryId !== filters.categoryId) {
      return false;
    }

    // District matching with robust normalization
    if (filters.district && filters.district !== 'all') {
      const targetNorm = normalizeDistrict(filters.district);
      const specNorm = normalizeDistrict(spec.district);
      const specAddressNorm = normalizeDistrict(spec.address);
      const specBioNorm = normalizeDistrict(spec.bio);

      const matches =
        targetNorm === '' ||
        specNorm === targetNorm ||
        specNorm.includes(targetNorm) ||
        targetNorm.includes(specNorm) ||
        specAddressNorm.includes(targetNorm) ||
        specBioNorm.includes(targetNorm);

      if (!matches) {
        return false;
      }
    }

    // Min rating
    if (filters.minRating > 0 && spec.rating < filters.minRating) {
      return false;
    }

    // 24/7 filter
    if (filters.only24_7 && !spec.isAvailable24_7) {
      return false;
    }

    // Verified filter
    if (filters.onlyVerified && !spec.isVerified) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price_asc') {
      return a.startingPrice - b.startingPrice;
    }
    if (filters.sortBy === 'price_desc') {
      return b.startingPrice - a.startingPrice;
    }
    if (filters.sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (filters.sortBy === 'experience') {
      return b.experienceYears - a.experienceYears;
    }
    // 'recommended' default: rating * reviewsCount weight + verified boost
    const scoreA = a.rating * Math.log10(a.reviewsCount + 10) + (a.isVerified ? 1.5 : 0);
    const scoreB = b.rating * Math.log10(b.reviewsCount + 10) + (b.isVerified ? 1.5 : 0);
    return scoreB - scoreA;
  });

  return (
    <AppContext.Provider
      value={{
        specialists,
        filteredSpecialists,
        filters,
        setFilters,
        resetFilters,
        refreshData,
        favorites,
        toggleFavorite,
        isFavorite,

        // Auth & User Profile
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        logout,

        theme,
        setTheme,
        isThemeModalOpen,
        setIsThemeModalOpen,

        selectedSpecialist,
        setSelectedSpecialist,
        selectedSpecialistTab,
        setSelectedSpecialistTab,
        openSpecialistDetail,

        isBookingModalOpen,
        bookingSpecialist,
        bookingCategory,
        openBookingModal,
        closeBookingModal,

        isAddSpecialistModalOpen,
        setIsAddSpecialistModalOpen,

        isMyBookingsOpen,
        setIsMyBookingsOpen,

        isFavoritesOpen,
        setIsFavoritesOpen,

        bookings,
        createBooking,
        updateBookingStatus,

        addSpecialist,
        addReview,

        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
