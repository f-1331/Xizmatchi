import React from 'react';
import { ShieldCheck, UserCheck, Banknote, ThumbsUp } from 'lucide-react';

export function SafetyGuaranteeBanner() {
  const points = [
    {
      title: "100% Tekshirilgan profillar",
      desc: "Ustalarimiz shaxsi va telefon raqamlari xizmat moderatorlari tomonidan sinchkovlik bilan tekshiriladi.",
      icon: UserCheck,
    },
    {
      title: "Haqiqiy mijozlar sharhlari",
      desc: "Platformada faqat real chaqiruvlarni amalga oshirgan xonadon egalarining baho va fikrlari aks etadi.",
      icon: ThumbsUp,
    },
    {
      title: "Vositachilarsiz to'lov",
      desc: "Hech qanday yashirin komissiyalarsiz — usta bilan to'g'ridan-to'g'ri kelishasiz va ish qabul qilingach to'laysiz.",
      icon: Banknote,
    },
    {
      title: "Ish sifati va kafolat",
      desc: "Ko'pchilik ustalarimiz bajargan montaj va ta'mirlash ishlariga 1 oydan 1 yilgacha rasmiy kafolat taqdim etadi.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mb-8 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Xavfsizlik va Ishonch
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Nima uchun mijozlar Xizmatchi platformasini tanlaydi?
            </h2>
            <p className="text-sm text-slate-300">
              Biz sizning vaqtingiz va xonadoningiz xavfsizligini birinchi o&apos;ringa qo&apos;yamiz
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {points.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">{p.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
