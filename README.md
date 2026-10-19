# UstaTop — Local Home Services & Craftsmen Platform (O'zbekiston)

**UstaTop** — xonadonlar, kottejlar va ofislar uchun ishonchli, tekshirilgan va malakali ustalarni (santexnik, elektrik, maishiy texnika ta'miri, klining, mebel ustalari va boshqalar) 2 daqiqada topish imkonini beruvchi zamonaviy veb-platforma.

---

## 🚀 Texnologiyalar to'plami (Tech Stack)

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Til**: [TypeScript](https://www.typescriptlang.org/) (To'liq tip xavfsizligi)
- **UI & Stillar**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ikonkalar**: [Lucide React](https://lucide.dev/)
- **Ma'lumotlar va holat**: React Context API + LocalStorage to'liq CRUD sinxronizatsiyasi
- **Dizayn**: Mobile-first, zamonaviy neomorfik va shaffof kartalar, micro-animatsiyalar

---

## 🌟 Asosiy funksiyalar va imkoniyatlar

### 1. Hero & Qidiruv tizimi
- **Jonli qidiruv**: Usta ismi, xizmat turi yoki kalit so'zlar bo'yicha tezkor avtomatik filtr.
- **Kategoriya filtrlari**: Santexnika, Elektr, Maishiy texnika, Konditsioner & Sovutish, Uy ta'miri, Klining, Mebel ustalari, Eshik va qulflar.
- **Tuman / Shahar filtri**: Toshkent shahrining barcha 11 ta tumani va viloyatlar bo'yicha saralash.
- **Mashhur so'rovlar taglari**: Tezkor tanlov ("Smesitel almashtirish", "Elektroshchit", "Qulf ochish 24/7" va h.k.).
- **Ishonch ko'rsatkichlari**: 5,000+ bajarilgan ish, 4.9/5 o'rtacha reyting, 100% tekshirilgan profillar.

### 2. Ustalar katalogi va batafsil profil modal oynasi (Detail Modal)
- **Karta ma'lumotlari**: Profil surati, ism, kasb yorlig'i, tasdiqlanganlik nishoni (`Verified`), 24/7 xizmat ko'rsatish indikatori, reyting va sharhlar soni, boshlang'ich narx, tuman va tajriba yillari.
- **Tezkor aloqa**: To'g'ridan-to'g'ri telefon qilish (`tel:...`) va Telegram orqali bog'lanish tugmalari.
- **Profil modal oynasi**:
  - Usta biografiyasi va ish uslubi
  - Aniq xizmatlar va narxlar jadvali
  - Bajarilgan ishlar fotosuratlari (Portfolio galereyasi)
  - Haqiqiy mijozlar sharhlari

### 3. Fikr va baho qoldirish tizimi (Reviews & Ratings)
- Istalgan mutaxassis profilida 1 dan 5 yulduzgacha baho berish.
- Foydalanuvchi ismi, xizmat turi va sharh matnini yuborish.
- Yangi baho yuborilishi bilan mutaxassisning o'rtacha reytingi avtomatik qayta hisoblanadi va **LocalStorage**da saqlanadi.

### 4. "Ustani chaqirish" (Tezkor ariza berish va kuzatish)
- Muammo tavsifi va tayyor shablonlar ("Kran oqyapti", "Qisqa tutashuv", "Konditsioner sovutmayapti").
- Shoshilinchlik darajasini belgilash:
  - 🔥 **Shoshilinch** (~1 soatda yetib borish)
  - ⏱️ **Bugun** (kun davomida)
  - 📅 **Rejali** (aniq belgilangan kunda)
- Manzil va tuman kiritish, qulay sana va vaqt oralig'ini tanlash.
- Muammo fotosuratini yuklash yoki namunaviy rasmlarni biriktirish.
- Muvaffaqiyatli topshirilgach maxsus Buyurtma ID raqami (`#REQ-XXXX`) va kutilayotgan javob vaqti ko'rsatiladi.

### 5. "Buyurtmalarim" bo'limi (Client Bookings Tracker)
- Foydalanuvchi yuborgan barcha arizalar ro'yxati.
- Holat belgilari: `Kutilmoqda`, `Usta qabul qildi`, `Bajarildi`, `Bekor qilindi`.
- Buyurtmani tasdiqlash yoki bekor qilish imkoniyati.

### 6. "Saqlangan ustalar" (Favorites Drawer)
- Yoqqan ustalarni yurakcha belgisi orqali bir marta bosish bilan saqlab qo'yish.
- Yon tomondan ochiluvchi qulay panel orqali tezkor bog'lanish yoki chaqirish.

### 7. "Usta sifatida qo'shilish" (Add Specialist / Multi-Step Wizard)
- 3 bosqichli interaktiv forma:
  1. Shaxsiy ma'lumotlar (Ism, soha, lavozim, tajriba yillari, tuman)
  2. Narxlar va aloqa (Boshlang'ich narx, telefon, telegram, 24/7 xizmat imkoniyati, kafolat)
  3. Xizmatlar ro'yxati, bio va profil avatarini tanlash
- Jonli ko'rinish (Live preview) kartasi orqali profili qanday chiqishini kuzatish.
- Ro'yxatdan o'tgach darhol asosiy ro'yxatga qo'shiladi va LocalStorageda saqlanadi.

### 8. 24/7 Favqulodda avariya holatlari bloki (Emergency Banner)
- Tungi yoki favqulodda nosozliklar (suv toshishi, qisqa tutashuv, qulf buzilishi) uchun tezkor navbatchi ustalarni bir bosish bilan saralash.

---

## 📁 Loyiha tuzilishi (Project Structure)

```
c:\Users\hp\OneDrive\Desktop\muammo
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind v4 importlari, animatsiyalar va uslublar
│   │   ├── layout.tsx          # Root layout, shriftlar, SEO metadata (Uzbek)
│   │   └── page.tsx            # Asosiy sahifa va komponentlar integratsiyasi
│   ├── components/
│   │   ├── AddSpecialistModal.tsx    # Yangi usta qo'shish ko'p bosqichli formasi
│   │   ├── BookingModal.tsx          # Ustani chaqirish arizasi
│   │   ├── CategoryGrid.tsx          # Kategoriya kartalari paneli
│   │   ├── CategoryIcon.tsx          # Lucide ikonkalar mapper komponenti
│   │   ├── EmergencyBanner.tsx       # 24/7 shoshilinch xizmatlar chaqiruvi
│   │   ├── FavoritesDrawer.tsx       # Saqlangan ustalar yon paneli
│   │   ├── FilterBar.tsx             # Qidiruv, saralash va filtrlar paneli
│   │   ├── Footer.tsx                # To'liq ma'lumotli foter
│   │   ├── Header.tsx                # Brend logotipi, tuman tanlovchi va harakat tugmalari
│   │   ├── HeroSection.tsx           # Bosh qism, qidiruv paneli va metrikalar
│   │   ├── HowItWorksSection.tsx     # "Qanday ishlaydi?" 3 qadamli qo'llanma
│   │   ├── MyBookingsModal.tsx       # Buyurtmalar tarixi va holat nazorati
│   │   ├── SafetyGuaranteeBanner.tsx # Xavfsizlik va kafolat ko'rsatkichlari
│   │   ├── SpecialistCard.tsx        # Usta kartochkasi komponenti
│   │   ├── SpecialistDetailModal.tsx # To'liq profil, portfolio va sharhlar
│   │   └── ToastContainer.tsx        # Bildirishnomalar (Toast) tizimi
│   ├── context/
│   │   └── AppContext.tsx            # Global state boshqaruvi va filtrlash mantiqi
│   ├── data/
│   │   └── mockData.ts               # 10 ta boyitilgan usta, kategoriyalar va tumanlar
│   ├── lib/
│   │   └── storage.ts                # LocalStorage persistentsiyasi va yordamchi funksiyalar
│   └── types/
│       └── index.ts                  # TypeScript interfeyslari va turlari
├── next.config.ts                    # Next.js konfiguratsiyasi
├── package.json                      # Paketlar va buyruqlar
├── tsconfig.json                     # TypeScript sozlamalari
└── README.md                         # Loyiha hujjatlari
```

---

## 🛠️ Ishga tushirish (Getting Started)

### Talablar:
- Node.js: 18.17+ yoki undan yuqori (tizimda v26.10 mavjud)
- npm: 9+ yoki undan yuqori

### 1. Qaramliklarni o'rnatish:
```bash
npm install
```

### 2. Dasturni rivojlantirish rejimida ishga tushirish:
```bash
npm run dev
```
Brauzerda oching: [http://localhost:3000](http://localhost:3000)

### 3. Production yig'ilishi (Build):
```bash
npm run build
npm start
```
Loyiha Turbopack va TypeScript tekshiruvidan muvaffaqiyatli o'tgan.
