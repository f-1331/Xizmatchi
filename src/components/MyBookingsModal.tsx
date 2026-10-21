'use client';

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ClipboardList,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Flame,
} from 'lucide-react';

export function MyBookingsModal() {
  const {
    isMyBookingsOpen,
    setIsMyBookingsOpen,
    bookings,
    updateBookingStatus,
    openBookingModal,
  } = useApp();

  // Lock body scroll when MyBookings modal is open
  useEffect(() => {
    if (!isMyBookingsOpen) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [isMyBookingsOpen]);

  if (!isMyBookingsOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" /> Usta qabul qildi
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Bajarildi
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3 text-slate-500" /> Bekor qilindi
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Kutilmoqda
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-fade-in overscroll-none">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - shrink-0 */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">Mening buyurtmalarim</h3>
              <p className="text-xs text-slate-400">
                Siz topshirgan arizalar va ularning holati
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMyBookingsOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4 flex-1 min-h-0">
          {bookings.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">
                Hozircha faol buyurtmalaringiz yo&apos;q
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Xonadoningizda ta&apos;mirlash yoki xizmat kerak bo&apos;lsa, mutaxassislarni topib chaqirishingiz mumkin.
              </p>
              <button
                onClick={() => {
                  setIsMyBookingsOpen(false);
                  openBookingModal();
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Yangi ariza qoldirish
              </button>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs space-y-3"
              >
                {/* Top Info */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-blue-600 text-sm">
                        #{booking.id}
                      </span>
                      {booking.urgency === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200 flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-rose-600" /> Shoshilinch
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mt-1">
                      {booking.specialistName
                        ? `Usta: ${booking.specialistName}`
                        : `Soha: ${booking.categoryId}`}
                    </h4>
                  </div>

                  <div>{getStatusBadge(booking.status)}</div>
                </div>

                {/* Problem description */}
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {booking.description}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      {booking.district}, {booking.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {booking.preferredDate} ({booking.preferredTime})
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Aloqa uchun: <strong className="text-slate-700">{booking.clientPhone}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'accepted')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
                      >
                        Qabul qilish
                      </button>
                    )}

                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors"
                      >
                        Bajarildi
                      </button>
                    )}

                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 font-medium text-xs transition-colors"
                      >
                        Bekor qilish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Jami buyurtmalar: {bookings.length} ta</span>
          <button
            onClick={() => setIsMyBookingsOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
