import React from 'react';
import { Search, PhoneCall, CheckCircle2, Star, ShieldCheck, Sparkles } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: "Usta yoki xizmatni tanlang",
      description:
        "O'zingizga kerakli sohani (santexnika, elektr, ta'mir) tanlang va tumaningizdagi eng tajribali ustalarni ko'rib chiqing.",
      icon: Search,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      step: '02',
      title: "Narx va sharhlarni solishtiring",
      description:
        "Ustalarning portfolio rasmlari, narxlari va boshqa mijozlar qoldirgan haqiqiy sharhlar bilan batafsil tanishing.",
      icon: Star,
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      step: '03',
      title: "Bog'laning yoki ariza qoldiring",
      description:
        "To'g'ridan-to'g'ri telefon qiling, Telegram orqali yozing yoki platformada ariza qoldiring. Usta 15 daqiqada javob beradi.",
      icon: PhoneCall,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Oddiy va qulay jarayon
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Xizmatchi qanday ishlaydi?
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Endi tanish-bilishlardan usta surishtirishga hojat yo&apos;q. 3 ta oson qadamda muammongizga yechim toping:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-slate-200 font-mono">
                      {item.step}
                    </span>
                    <div className={`p-3 rounded-2xl ${item.badgeColor}`}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Vositachisiz & Halol narxlar</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
