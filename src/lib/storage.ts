import { Specialist, BookingRequest, Review } from '../types';
import { INITIAL_SPECIALISTS, INITIAL_BOOKINGS } from '../data/mockData';

const SPECIALISTS_STORAGE_KEY = 'xizmatchi_specialists_v2';
const BOOKINGS_STORAGE_KEY = 'xizmatchi_bookings_v1';
const FAVORITES_STORAGE_KEY = 'xizmatchi_favorites_v1';

export const isBrowser = typeof window !== 'undefined';

export function getStoredSpecialists(): Specialist[] {
  if (!isBrowser) return INITIAL_SPECIALISTS;
  try {
    const raw = localStorage.getItem(SPECIALISTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SPECIALISTS_STORAGE_KEY, JSON.stringify(INITIAL_SPECIALISTS));
      return INITIAL_SPECIALISTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(SPECIALISTS_STORAGE_KEY, JSON.stringify(INITIAL_SPECIALISTS));
      return INITIAL_SPECIALISTS;
    }

    // Map initial specialists to update static properties like portfolio and services
    const initialMap = new Map(INITIAL_SPECIALISTS.map((s) => [s.id, s]));
    const userAdded = parsed.filter((p: Specialist) => !initialMap.has(p.id));

    const updated = [...userAdded];
    for (const spec of INITIAL_SPECIALISTS) {
      // Find existing reviews added by user for this specialist
      const existing = parsed.find((p: Specialist) => p.id === spec.id);
      if (existing && existing.reviews && existing.reviews.length > spec.reviews.length) {
        // Keep user-submitted reviews
        updated.push({
          ...spec,
          reviews: existing.reviews,
          reviewsCount: existing.reviews.length,
        });
      } else {
        updated.push(spec);
      }
    }

    localStorage.setItem(SPECIALISTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to get specialists from localStorage:', error);
    return INITIAL_SPECIALISTS;
  }
}

export function resetSpecialistsToLatest(): Specialist[] {
  if (!isBrowser) return INITIAL_SPECIALISTS;
  try {
    // Keep user-created specialists (id starting with 'spec-' and not in initial)
    const raw = localStorage.getItem(SPECIALISTS_STORAGE_KEY);
    let userAdded: Specialist[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const initialIds = new Set(INITIAL_SPECIALISTS.map((s) => s.id));
        userAdded = parsed.filter((s: Specialist) => !initialIds.has(s.id));
      }
    }
    const updated = [...userAdded, ...INITIAL_SPECIALISTS];
    localStorage.setItem(SPECIALISTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to reset specialists:', error);
    return INITIAL_SPECIALISTS;
  }
}

export function saveStoredSpecialists(specialists: Specialist[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(SPECIALISTS_STORAGE_KEY, JSON.stringify(specialists));
  } catch (error) {
    console.error('Failed to save specialists to localStorage:', error);
  }
}

export function getStoredBookings(): BookingRequest[] {
  if (!isBrowser) return INITIAL_BOOKINGS;
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BOOKINGS;
  } catch (error) {
    console.error('Failed to get bookings from localStorage:', error);
    return INITIAL_BOOKINGS;
  }
}

export function saveStoredBookings(bookings: BookingRequest[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error('Failed to save bookings to localStorage:', error);
  }
}

export function getStoredFavorites(): string[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (error) {
    console.error('Failed to get favorites from localStorage:', error);
    return [];
  }
}

export function saveStoredFavorites(favorites: string[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites to localStorage:', error);
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
}

export function generateBookingId(): string {
  return 'REQ-' + Math.floor(1000 + Math.random() * 9000);
}
