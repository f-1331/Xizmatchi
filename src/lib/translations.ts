export type Language = 'uz' | 'ru' | 'en';

export interface TranslationDictionary {
  [key: string]: {
    uz: string;
    ru: string;
    en: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // Brand & Slogans
  'brand.name': {
    uz: 'Xizmatchi',
    ru: 'Xizmatchi',
    en: 'Xizmatchi',
  },
  'brand.tagline': {
    uz: "O'zbekiston bo'ylab usta va maishiy xizmatlar portali",
    ru: 'Портал мастеров и бытовых услуг по Узбекистану',
    en: 'Master and home services portal across Uzbekistan',
  },
  'brand.badge': {
    uz: "O'zbekiston №1 Usta Portali",
    ru: '№1 Портал мастеров в Узбекистане',
    en: '#1 Home Services Portal in Uzbekistan',
  },

  // Navigation Links
  'nav.home': {
    uz: 'Asosiy',
    ru: 'Главная',
    en: 'Home',
  },
  'nav.categories': {
    uz: 'Kategoriyalar',
    ru: 'Категории',
    en: 'Categories',
  },
  'nav.services': {
    uz: 'Xizmatlar (38)',
    ru: 'Услуги (38)',
    en: 'Services (38)',
  },
  'nav.services_short': {
    uz: 'Xizmatlar',
    ru: 'Услуги',
    en: 'Services',
  },
  'nav.specialists': {
    uz: 'Barcha ustalar',
    ru: 'Все мастера',
    en: 'All specialists',
  },
  'nav.specialists_short': {
    uz: 'Ustalar',
    ru: 'Мастера',
    en: 'Specialists',
  },
  'nav.emergency_24_7': {
    uz: '24/7 Shoshilinch',
    ru: 'Срочно 24/7',
    en: '24/7 Urgent',
  },
  'nav.how_it_works': {
    uz: 'Qanday ishlaydi?',
    ru: 'Как это работает?',
    en: 'How it works?',
  },
  'nav.become_specialist': {
    uz: "Usta bo'lish",
    ru: 'Стать мастером',
    en: 'Join as pro',
  },
  'nav.become_specialist_short': {
    uz: 'Usta',
    ru: 'Мастер',
    en: 'Pro',
  },
  'nav.login': {
    uz: 'Kirish',
    ru: 'Войти',
    en: 'Login',
  },
  'nav.logout': {
    uz: 'Chiqish',
    ru: 'Выйти',
    en: 'Logout',
  },
  'nav.my_account': {
    uz: 'Mening hisobim',
    ru: 'Мой профиль',
    en: 'My account',
  },
  'nav.my_bookings': {
    uz: 'Buyurtmalarim',
    ru: 'Мои заказы',
    en: 'My bookings',
  },
  'nav.my_bookings_short': {
    uz: 'Buyurtma',
    ru: 'Заказы',
    en: 'Bookings',
  },
  'nav.favorites': {
    uz: 'Sevimlilar',
    ru: 'Избранное',
    en: 'Favorites',
  },
  'nav.theme': {
    uz: 'Dizayn',
    ru: 'Тема',
    en: 'Theme',
  },
  'nav.qrcode': {
    uz: 'QR Kod',
    ru: 'QR-код',
    en: 'QR Code',
  },
  'qrcode.title': {
    uz: 'Platformaga tezkor kirish',
    ru: 'Быстрый доступ к платформе',
    en: 'Quick Access to Platform',
  },
  'qrcode.subtitle': {
    uz: 'Telefon kamerasi yoki Telegram orqali QR kodni skanerlang va platformaga bir zumda kiring!',
    ru: 'Отсканируйте QR-код камерой телефона или через Telegram для быстрого перехода на платформу!',
    en: 'Scan the QR code with your phone camera or Telegram to access the platform instantly!',
  },
  'qrcode.scan_hint': {
    uz: 'Kamerani QR kodga qarating',
    ru: 'Наведите камеру на QR-код',
    en: 'Point camera at the QR code',
  },
  'qrcode.copy': {
    uz: 'Havolani nusxalash',
    ru: 'Скопировать ссылку',
    en: 'Copy link',
  },
  'qrcode.copied': {
    uz: 'Havola nusxalandi!',
    ru: 'Ссылка скопирована!',
    en: 'Link copied!',
  },
  'qrcode.open_site': {
    uz: 'Saytni ochish',
    ru: 'Открыть сайт',
    en: 'Open website',
  },
  'qrcode.share': {
    uz: 'Ulashish',
    ru: 'Поделиться',
    en: 'Share',
  },
  'nav.menu': {
    uz: 'Menyu',
    ru: 'Меню',
    en: 'Menu',
  },
  'nav.refresh': {
    uz: 'Yangilash',
    ru: 'Обновить',
    en: 'Refresh',
  },
  'nav.region': {
    uz: 'Hudud',
    ru: 'Регион',
    en: 'Region',
  },
  'nav.all_districts': {
    uz: 'Barcha tumanlar',
    ru: 'Все районы',
    en: 'All districts',
  },

  // Hero Section
  'hero.title_part1': {
    uz: "O'zbekistondagi ishonchli va",
    ru: 'Найдите надежных и',
    en: 'Find trusted and',
  },
  'hero.title_part2': {
    uz: 'tajribali ustalarni',
    ru: 'опытных мастеров',
    en: 'expert specialists',
  },
  'hero.title_part3': {
    uz: 'bir necha daqiqada toping',
    ru: 'за считанные минуты',
    en: 'in minutes across Uzbekistan',
  },
  'hero.description': {
    uz: "Santexnika, elektr, maishiy texnika ta'miri, mebel yig'ish va klining. 32 dan ortiq tasdiqlangan mutaxassislar xizmatingizda.",
    ru: 'Сантехника, электрика, ремонт техники, сборка мебели и клининг. Более 32 проверенных специалистов готовы вам помочь.',
    en: 'Plumbing, electrical, appliance repair, furniture assembly and cleaning. Over 32 verified professionals ready to assist you.',
  },
  'hero.search_placeholder': {
    uz: "Usta ismi, kasbi (santexnik, elektrik...) yoki xizmat turi...",
    ru: 'Имя мастера, профессия (сантехник, электрик...) или услуга...',
    en: 'Specialist name, profession (plumber, electrician...) or service...',
  },
  'hero.find_button': {
    uz: 'Usta topish',
    ru: 'Найти мастера',
    en: 'Find specialist',
  },
  'hero.quick_order': {
    uz: 'Tezkor ariza qoldirish',
    ru: 'Быстрая заявка',
    en: 'Quick request',
  },
  'hero.quick_tags_label': {
    uz: 'Ommabop qidiruvlar:',
    ru: 'Популярные запросы:',
    en: 'Popular searches:',
  },
  'hero.stat_specialists': {
    uz: 'Sara ustalar',
    ru: 'Лучших мастеров',
    en: 'Pro specialists',
  },
  'hero.stat_reviews': {
    uz: 'Mamnun mijozlar',
    ru: 'Довольных клиентов',
    en: 'Happy clients',
  },
  'hero.stat_service_24_7': {
    uz: '24/7 Xizmat',
    ru: 'Служба 24/7',
    en: '24/7 Service',
  },
  'hero.stat_guarantee': {
    uz: 'Kafolat beriladi',
    ru: 'Гарантия качества',
    en: 'Quality guarantee',
  },

  // Category Grid
  'categories.section_badge': {
    uz: "Xizmat yo'nalishlari",
    ru: 'Направления услуг',
    en: 'Service directions',
  },
  'categories.section_title': {
    uz: 'Ommabop xizmat toifalari',
    ru: 'Популярные категории услуг',
    en: 'Popular service categories',
  },
  'categories.section_subtitle': {
    uz: "O'zingizga kerakli sohani tanlang va tajribali mutaxassislar bilan bog'laning",
    ru: 'Выберите нужную сферу и свяжитесь с опытными специалистами',
    en: 'Choose the service you need and connect with experienced masters',
  },
  'categories.all_button': {
    uz: 'Barcha toifalar',
    ru: 'Все категории',
    en: 'All categories',
  },
  'categories.specialists_count': {
    uz: 'ta usta',
    ru: 'мастеров',
    en: 'pros',
  },

  // Category Names
  'cat.santexnika': {
    uz: 'Santexnika',
    ru: 'Сантехника',
    en: 'Plumbing',
  },
  'cat.santexnika_desc': {
    uz: "Kran, quvur, unitaz, vanna va dush kabinalari ta'miri hamda o'rnatish",
    ru: 'Ремонт и монтаж смесителей, труб, унитазов, ванн и душевых кабин',
    en: 'Repair and installation of faucets, pipes, toilets, baths and showers',
  },
  'cat.elektr': {
    uz: 'Elektr montaj',
    ru: 'Электромонтаж',
    en: 'Electrical work',
  },
  'cat.elektr_desc': {
    uz: "Lyustra, rozetka, avtomat va simlarni almashtirish, qisqa tutashuvni bartaraf etish",
    ru: 'Замена люстр, розеток, автоматов, проводки и устранение замыканий',
    en: 'Chandelier, socket, circuit breaker wiring and short-circuit repair',
  },
  'cat.maishiy-texnika': {
    uz: "Maishiy texnika ta'miri",
    ru: 'Ремонт бытовой техники',
    en: 'Appliance repair',
  },
  'cat.maishiy-texnika_desc': {
    uz: "Muzlatgich, kir yuvish mashinasi, gaz plita va boshqa texnikalar diagnostikasi",
    ru: 'Диагностика и ремонт холодильников, стиральных машин, плит',
    en: 'Diagnostics and repair of refrigerators, washing machines, stoves',
  },
  'cat.mebel': {
    uz: 'Mebel ustasi',
    ru: 'Сборка и ремонт мебели',
    en: 'Furniture assembly & repair',
  },
  'cat.mebel_desc': {
    uz: "Shkaf, stol, kravat yig'ish, mebel qismlarini ta'mirlash va restavratsiya",
    ru: 'Сборка шкафов, столов, кроватей, ремонт и реставрация мебели',
    en: 'Assembly of wardrobes, tables, beds, furniture repair and restoration',
  },
  'cat.klining': {
    uz: 'Uy tozalash (Klining)',
    ru: 'Клининг и уборка',
    en: 'Cleaning service',
  },
  'cat.klining_desc': {
    uz: "Ta'mirdan keyingi tozalash, general tozalash, gilam va derazalarni yuvish",
    ru: 'Генеральная уборка, уборка после ремонта, мойка окон и ковров',
    en: 'Deep cleaning, post-renovation cleanup, window and carpet washing',
  },
  'cat.dezinfeksiya': {
    uz: 'Dezinfeksiya & Dezinseksiya',
    ru: 'Дезинфекция и дезинсекция',
    en: 'Disinfection & Pest Control',
  },
  'cat.dezinfeksiya_desc': {
    uz: "Klop, tarakan, kemiruvchilar va mikroblarga qarshi kafolatli professional ishlov",
    ru: 'Профессиональная обработка от клопов, тараканов, грызунов и бактерий',
    en: 'Guaranteed professional treatment against bedbugs, roaches, rodents',
  },
  'cat.qulf-eshik': {
    uz: 'Qulf va eshik ochish',
    ru: 'Вскрытие замков и дверей',
    en: 'Locksmith & Door Opening',
  },
  'cat.qulf-eshik_desc': {
    uz: "Eshik qulfini zararsiz ochish, yangi zamok o'rnatish, kodli qulflar",
    ru: 'Аккуратное вскрытие замков без повреждений, замена замков, умные замки',
    en: 'Damage-free lock opening, lock replacement, smart digital locks',
  },
  'cat.pardozlash': {
    uz: "Pardozlash va ta'mirlash",
    ru: 'Отделка и мелкий ремонт',
    en: 'Interior finishing & repair',
  },
  'cat.pardozlash_desc': {
    uz: "Kafel yotqizish, oboy yopishtirish, gipsokarton, bo'yash va laminat",
    ru: 'Укладка плитки, поклейка обоев, гипсокартон, покраска, ламинат',
    en: 'Tiling, wallpaper installation, drywall, painting and laminate flooring',
  },
  'cat.konditsioner': {
    uz: 'Konditsioner ustasi',
    ru: 'Кондиционеры и вентиляция',
    en: 'HVAC & AC Service',
  },
  'cat.konditsioner_desc': {
    uz: "Konditsioner o'rnatish, freon quyish, yuvish, diagnostika va ta'mirlash",
    ru: 'Монтаж, заправка фреоном, чистка, диагностика и ремонт кондиционеров',
    en: 'AC installation, freon refill, chemical cleaning, diagnostics & repair',
  },
  'cat.payvandlash': {
    uz: 'Payvandlash (Svarka)',
    ru: 'Сварочные работы',
    en: 'Welding services',
  },
  'cat.payvandlash_desc': {
    uz: "Reshyotka, darvoza, metall karkas, sovuq-issiq quvurlarni payvandlash",
    ru: 'Сварка решеток, ворот, металлоконструкций, водопроводных труб',
    en: 'Welding window bars, gates, metal frames, and plumbing pipes',
  },
  'cat.gruzoperevozka': {
    uz: 'Gruzoperevozka va yuk tashish',
    ru: 'Грузоперевозки и грузчики',
    en: 'Moving & Cargo transportation',
  },
  'cat.gruzoperevozka_desc': {
    uz: "Kvartira va ofis ko'chirish, Labo/Gazel xizmati, baquvvat yukchilar jamoasi",
    ru: 'Переезд квартир и офисов, аренда авто (Labo, Gazel), аккуратные грузчики',
    en: 'Apartment and office relocation, Labo/Gazel truck rental, reliable movers',
  },
  'cat.qurilish': {
    uz: "Qurilish va g'isht terish",
    ru: 'Строительные работы',
    en: 'Construction & Masonry',
  },
  'cat.qurilish_desc': {
    uz: "G'isht terish, beton quyish, suvoq, tom yopish va poydevor qurish",
    ru: 'Кладка кирпича, заливка бетона, штукатурка, кровля и фундамент',
    en: 'Bricklaying, concrete pouring, plastering, roofing and foundation',
  },

  // Specialists Section
  'specialists.section_badge': {
    uz: 'Malakali mutaxassislar (32 ta)',
    ru: 'Квалифицированные специалисты (32)',
    en: 'Qualified specialists (32)',
  },
  'specialists.section_title': {
    uz: "Toshkent va viloyatlar bo'yicha sara ustalar",
    ru: 'Лучшие мастера по Ташкенту и регионам',
    en: 'Top masters across Tashkent & regions',
  },
  'specialists.section_subtitle': {
    uz: "Har bir mutaxassis sinovdan o'tgan va mijozlar tomonidan baholangan",
    ru: 'Каждый специалист прошел верификацию и оценен клиентами',
    en: 'Each specialist is verified and rated by real clients',
  },
  'specialists.add_profile_btn': {
    uz: "Usta anketasini qo'shish",
    ru: 'Добавить анкету мастера',
    en: 'Add specialist profile',
  },
  'specialists.not_found_title': {
    uz: 'Mos keladigan usta topilmadi',
    ru: 'Подходящих мастеров не найдено',
    en: 'No matching specialist found',
  },
  'specialists.not_found_desc': {
    uz: "Qidiruv so'rovingiz yoki filtrlarni o'zgartirib ko'ring. Yoki filtrlarni qayta tiklang.",
    ru: 'Попробуйте изменить поисковый запрос или фильтры. Или сбросьте фильтры.',
    en: 'Try changing your search query or filters. Or reset all filters.',
  },
  'specialists.reset_filters': {
    uz: 'Filtrlarni tozalash',
    ru: 'Сбросить фильтры',
    en: 'Reset filters',
  },

  // Specialist Card
  'card.experience': {
    uz: 'yil tajriba',
    ru: 'лет опыта',
    en: 'yrs experience',
  },
  'card.reviews_count': {
    uz: 'ta fikr',
    ru: 'отзывов',
    en: 'reviews',
  },
  'card.from_price': {
    uz: 'Boshlang\'ich narx:',
    ru: 'Цена от:',
    en: 'Starting from:',
  },
  'card.results_title': {
    uz: 'Ish natijalari',
    ru: 'Результаты работ',
    en: 'Work portfolio',
  },
  'card.view_all_portfolio': {
    uz: "Barchasini ko'rish →",
    ru: 'Смотреть все →',
    en: 'View all →',
  },
  'card.call_btn': {
    uz: "Qo'ng'iroq",
    ru: 'Позвонить',
    en: 'Call',
  },
  'card.telegram_btn': {
    uz: 'Telegram',
    ru: 'Telegram',
    en: 'Telegram',
  },
  'card.profile_btn': {
    uz: 'Profil',
    ru: 'Профиль',
    en: 'Profile',
  },
  'card.portfolio_reviews_btn': {
    uz: 'Portfolio & Sharhlar',
    ru: 'Портфолио и отзывы',
    en: 'Portfolio & Reviews',
  },
  'card.book_btn': {
    uz: 'Chaqirish',
    ru: 'Вызвать',
    en: 'Book',
  },
  'card.verified_tooltip': {
    uz: 'Tasdiqlangan mutaxassis',
    ru: 'Проверенный специалист',
    en: 'Verified specialist',
  },
  'card.urgent_badge': {
    uz: '24/7 Shoshilinch',
    ru: '24/7 Срочно',
    en: '24/7 Urgent',
  },

  // Filter Bar
  'filter.search_label': {
    uz: 'Qidiruv:',
    ru: 'Поиск:',
    en: 'Search:',
  },
  'filter.category_label': {
    uz: 'Kategoriya:',
    ru: 'Категория:',
    en: 'Category:',
  },
  'filter.district_label': {
    uz: 'Tuman:',
    ru: 'Район:',
    en: 'District:',
  },
  'filter.sort_label': {
    uz: 'Saralash:',
    ru: 'Сортировка:',
    en: 'Sort by:',
  },
  'filter.sort_recommended': {
    uz: 'Tavsiya etilgan',
    ru: 'Рекомендуемые',
    en: 'Recommended',
  },
  'filter.sort_price_asc': {
    uz: 'Arzonroq narx',
    ru: 'Сначала дешевые',
    en: 'Price: Low to High',
  },
  'filter.sort_price_desc': {
    uz: 'Qimmatroq narx',
    ru: 'Сначала дорогие',
    en: 'Price: High to Low',
  },
  'filter.sort_rating': {
    uz: 'Yuqori reyting',
    ru: 'Высокий рейтинг',
    en: 'Highest rated',
  },
  'filter.sort_experience': {
    uz: 'Katta tajriba',
    ru: 'Большой стаж',
    en: 'Experience',
  },
  'filter.only_24_7': {
    uz: 'Faqat 24/7 shoshilinch',
    ru: 'Только 24/7 срочные',
    en: '24/7 urgent only',
  },
  'filter.only_verified': {
    uz: 'Faqat tasdiqlanganlar',
    ru: 'Только проверенные',
    en: 'Verified only',
  },
  'filter.found_count': {
    uz: 'ta mutaxassis topildi',
    ru: 'специалистов найдено',
    en: 'specialists found',
  },

  // Specialist Detail Modal
  'detail.about_title': {
    uz: 'Usta haqida',
    ru: 'О мастере',
    en: 'About specialist',
  },
  'detail.tab_services': {
    uz: 'Xizmatlar va narxlar',
    ru: 'Услуги и цены',
    en: 'Services & Prices',
  },
  'detail.tab_portfolio': {
    uz: 'Portfolio',
    ru: 'Портфолио',
    en: 'Portfolio',
  },
  'detail.tab_reviews': {
    uz: 'Fikrlar',
    ru: 'Отзывы',
    en: 'Reviews',
  },
  'detail.portfolio_subtitle': {
    uz: 'Ushbu mutaxassis tomonidan ilgari bajarilgan haqiqiy ishlar fotosuratlari',
    ru: 'Фотографии реальных работ, выполненных данным мастером',
    en: 'Photos of real works completed by this specialist',
  },
  'detail.portfolio_empty': {
    uz: 'Hozircha portfolio rasmlari joylanmagan',
    ru: 'Пока нет фотографий портфолио',
    en: 'No portfolio photos added yet',
  },
  'detail.leave_review_title': {
    uz: 'Usta haqida fikr va baho qoldiring',
    ru: 'Оставьте отзыв и оценку мастеру',
    en: 'Leave a review and rating for this pro',
  },
  'detail.leave_review_desc': {
    uz: "Sizning xolis fikringiz boshqa mijozlarga to'g'ri tanlov qilishda yordam beradi.",
    ru: 'Ваш честный отзыв поможет другим клиентам сделать правильный выбор.',
    en: 'Your honest feedback helps other clients make the right choice.',
  },
  'detail.name_field': {
    uz: 'Ismingiz:',
    ru: 'Ваше имя:',
    en: 'Your name:',
  },
  'detail.name_placeholder': {
    uz: 'Masalan: Sardor Aliyev',
    ru: 'Например: Сардор Алиев',
    en: 'E.g.: Alex Smith',
  },
  'detail.service_field': {
    uz: "Ko'rsatilgan xizmat turi (ixtiyoriy):",
    ru: 'Тип оказанной услуги (необязательно):',
    en: 'Service provided (optional):',
  },
  'detail.rating_field': {
    uz: 'Bahoyingiz:',
    ru: 'Ваша оценка:',
    en: 'Your rating:',
  },
  'detail.stars_label': {
    uz: 'yulduz',
    ru: 'звезд',
    en: 'stars',
  },
  'detail.comment_field': {
    uz: 'Fikringiz:',
    ru: 'Ваш отзыв:',
    en: 'Your comment:',
  },
  'detail.comment_placeholder': {
    uz: "Usta ishni qanday bajardi? O'z vaqtida keldimi? Narxi qanday bo'ldi?..",
    ru: 'Как мастер выполнил работу? Пришел вовремя? Каковы впечатления?..',
    en: 'How was the work done? On time? Quality and pricing impressions?..',
  },
  'detail.submit_review': {
    uz: 'Fikrni yuborish',
    ru: 'Отправить отзыв',
    en: 'Submit review',
  },
  'detail.all_reviews': {
    uz: 'Barcha sharhlar',
    ru: 'Все отзывы',
    en: 'All reviews',
  },
  'detail.price_starts': {
    uz: 'Xizmat narxi boshlanadi:',
    ru: 'Стоимость услуги от:',
    en: 'Starting price from:',
  },
  'detail.close': {
    uz: 'Yopish',
    ru: 'Закрыть',
    en: 'Close',
  },
  'detail.book_specialist': {
    uz: 'Ustani chaqirish',
    ru: 'Вызвать мастера',
    en: 'Book specialist',
  },
  'detail.link_copied': {
    uz: 'Profil havolasi nusxalandi!',
    ru: 'Ссылка на профиль скопирована!',
    en: 'Profile link copied!',
  },

  // Booking Modal
  'booking.quick_order': {
    uz: 'Tezkor buyurtma',
    ru: 'Быстрый заказ',
    en: 'Quick booking',
  },
  'booking.title_specialist': {
    uz: 'ni chaqirish',
    ru: '— вызов мастера',
    en: '— book master',
  },
  'booking.title_general': {
    uz: 'Ustani chaqirish (Ariza qoldirish)',
    ru: 'Вызов мастера (Оставить заявку)',
    en: 'Book a specialist (Submit request)',
  },
  'booking.category_label': {
    uz: 'Kerakli xizmat toifasi:',
    ru: 'Категория услуги:',
    en: 'Service category:',
  },
  'booking.district_label': {
    uz: 'Tumaningiz:',
    ru: 'Ваш район:',
    en: 'Your district:',
  },
  'booking.address_label': {
    uz: "Aniq manzil (ko'cha, uy, xonadon):",
    ru: 'Точный адрес (улица, дом, квартира):',
    en: 'Exact address (street, house, apt):',
  },
  'booking.address_placeholder': {
    uz: "Masalan: Qatortol ko'chasi 14-uy, 28-xonadon",
    ru: 'Например: ул. Катартал, дом 14, кв. 28',
    en: 'E.g.: Chilanzar 14, apt 28',
  },
  'booking.description_label': {
    uz: 'Muammoni qisqacha yozing:',
    ru: 'Кратко опишите проблему:',
    en: 'Briefly describe the issue:',
  },
  'booking.description_placeholder': {
    uz: "Masalan: Kran tagidan suv sizib chiqmoqda, yangi aralashtirgich o'rnatish kerak...",
    ru: 'Например: Течет кран под раковиной, нужно заменить смеситель...',
    en: 'E.g.: Water leaking under the faucet, need a replacement...',
  },
  'booking.urgency_label': {
    uz: 'Qachon kerak (Shoshilinchlik darajasi):',
    ru: 'Срочность вызова:',
    en: 'Urgency level:',
  },
  'booking.urgency_urgent': {
    uz: 'Tezkor (1 soat ichida)',
    ru: 'Срочно (в течение 1 часа)',
    en: 'Urgent (within 1 hour)',
  },
  'booking.urgency_today': {
    uz: 'Bugun kun davomida',
    ru: 'Сегодня в течение дня',
    en: 'Today during the day',
  },
  'booking.urgency_scheduled': {
    uz: 'Belgilangan sanada',
    ru: 'В назначенный день',
    en: 'On scheduled date',
  },
  'booking.client_name_label': {
    uz: 'Ismingiz:',
    ru: 'Ваше имя:',
    en: 'Your name:',
  },
  'booking.client_phone_label': {
    uz: 'Telefon raqamingiz:',
    ru: 'Ваш номер телефона:',
    en: 'Your phone number:',
  },
  'booking.photo_label': {
    uz: "Muammo fotosurati (ixtiyoriy):",
    ru: 'Фото проблемы (необязательно):',
    en: 'Photo of the problem (optional):',
  },
  'booking.photo_hint': {
    uz: "Rasm usta holatni aniq baholashiga yordam beradi",
    ru: 'Фото помогает мастеру точнее оценить поломку',
    en: 'Photos help the master evaluate accurately',
  },
  'booking.submit_btn': {
    uz: 'Arizani tasdiqlash va yuborish',
    ru: 'Подтвердить и отправить заявку',
    en: 'Confirm and submit booking',
  },
  'booking.success_badge': {
    uz: 'Buyurtma muvaffaqiyatli qabul qilindi!',
    ru: 'Заказ успешно принят!',
    en: 'Order successfully placed!',
  },
  'booking.success_title': {
    uz: "Tez orada siz bilan bog'lanishadi",
    ru: 'Скоро с вами свяжутся',
    en: 'You will be contacted shortly',
  },
  'booking.success_desc': {
    uz: "Buyurtmangiz tizimda ro'yxatdan o'tkazildi va Telegram orqali mutaxassisga yo'llandi.",
    ru: 'Ваш заказ зарегистрирован в системе и направлен мастеру через Telegram.',
    en: 'Your order is recorded and forwarded to the specialist via Telegram.',
  },
  'booking.tg_notif_title': {
    uz: 'Telegram botga yuborildi',
    ru: 'Отправлено в Telegram бот',
    en: 'Sent to Telegram bot',
  },
  'booking.open_bot': {
    uz: 'Botni ochish',
    ru: 'Открыть бота',
    en: 'Open bot',
  },
  'booking.go_to_bookings': {
    uz: "Buyurtmalarim bo'limiga o'tish",
    ru: 'Перейти в мои заказы',
    en: 'Go to my bookings',
  },

  // Emergency Banner
  'emergency.title': {
    uz: "24/7 Shoshilinch avariya xizmati",
    ru: 'Круглосуточная аварийная служба 24/7',
    en: '24/7 Emergency Repair Service',
  },
  'emergency.desc': {
    uz: "Kutilmagan quvur yorilishi, qisqa tutashuv, muzlatgich o'chishi yoki eshik qulflanib qolishida tezkor mutaxassislar 30-45 daqiqada yetib boradi.",
    ru: 'Прорыв трубы, короткое замыкание, поломка холодильника или заклинивший замок — мастер прибудет за 30–45 минут.',
    en: 'Burst pipes, power outages, broken appliances or locked doors — expert specialists arrive in 30–45 minutes.',
  },
  'emergency.call_now': {
    uz: "Shoshilinch chaqirish",
    ru: 'Срочный вызов',
    en: 'Call urgently',
  },

  // How It Works
  'how.title': {
    uz: 'Xizmatchi qanday ishlaydi?',
    ru: 'Как работает Xizmatchi?',
    en: 'How does Xizmatchi work?',
  },
  'how.subtitle': {
    uz: "Atigi 3 oddiy qadamda uyingizdagi har qanday maishiy muammoni hal eting",
    ru: 'Всего 3 простых шага для решения любой домашней проблемы',
    en: 'Solve any household issue in just 3 simple steps',
  },
  'how.step1_title': {
    uz: '1. Xizmatni tanlang',
    ru: '1. Выберите услугу',
    en: '1. Choose service',
  },
  'how.step1_desc': {
    uz: "Katalogdan kerakli yo'nalishni toping yoki to'g'ridan-to'g'ri qidiruvdan foydalaning.",
    ru: 'Найдите нужную сферу в каталоге или воспользуйтесь поиском.',
    en: 'Find the service you need in the catalog or use the instant search.',
  },
  'how.step2_title': {
    uz: '2. Ustani tanlang',
    ru: '2. Выберите мастера',
    en: '2. Pick a specialist',
  },
  'how.step2_desc': {
    uz: "Reyting, haqiqiy mijozlar fikrlari va ish natijalari (portfolio) bilan tanishing.",
    ru: 'Ознакомьтесь с рейтингом, отзывами клиентов и портфолио работ.',
    en: 'Check ratings, real client reviews, and portfolio photo results.',
  },
  'how.step3_title': {
    uz: '3. Aloqaga chiqing',
    ru: '3. Свяжитесь и закажите',
    en: '3. Contact and book',
  },
  'how.step3_desc': {
    uz: "Qo'ng'iroq qiling, Telegram orqali yozing yoki saytdan bir zumda buyurtma bering.",
    ru: 'Позвоните, напишите в Telegram или оставьте заявку прямо на сайте.',
    en: 'Call directly, chat on Telegram, or submit a booking instantly.',
  },

  // Safety & Guarantee
  'safety.title': {
    uz: 'Xavfsizlik va sifat kafolati',
    ru: 'Гарантия безопасности и качества',
    en: 'Safety & Quality Guarantee',
  },
  'safety.desc': {
    uz: "Platformadagi mutaxassislar pasport va kasbiy ko'nikmalari bo'yicha tekshiriladi. Siz har doim xavfsiz va ishonchli xizmat olasiz.",
    ru: 'Специалисты на платформе проходят проверку документов и квалификации. Вы всегда получаете надежный сервис.',
    en: 'Specialists undergo identity and skills verification. You always receive secure and reliable service.',
  },

  // Services Catalog
  'catalog.badge': {
    uz: 'Katalog va narxlar',
    ru: 'Каталог и цены',
    en: 'Catalog & Prices',
  },
  'catalog.title': {
    uz: "Ommabop xizmatlar va taxminiy narxlar",
    ru: 'Популярные услуги и прайс-лист',
    en: 'Popular services & price guide',
  },
  'catalog.subtitle': {
    uz: "O'zbekistondagi bozor narxlari bo'yicha eng ko'p talab qilinadigan maishiy va ta'mirlash xizmatlari",
    ru: 'Самые востребованные бытовые и ремонтные услуги по рыночным ценам в Узбекистане',
    en: 'Most in-demand home repair services at transparent market prices in Uzbekistan',
  },

  // Footer
  'footer.about': {
    uz: "Xizmatchi — O'zbekiston bo'ylab maishiy va ta'mirlash xizmatlarini qidirish va buyurtma qilish uchun zamonaviy onlayn platforma.",
    ru: 'Xizmatchi — современная онлайн-платформа для поиска и заказа бытовых и ремонтных услуг по всему Узбекистану.',
    en: 'Xizmatchi is a modern online platform for finding and booking home repair services across Uzbekistan.',
  },
  'footer.quick_links': {
    uz: "Tezkor havolalar",
    ru: 'Быстрые ссылки',
    en: 'Quick links',
  },
  'footer.popular_cats': {
    uz: 'Ommabop sohalar',
    ru: 'Популярные сферы',
    en: 'Popular areas',
  },
  'footer.contacts': {
    uz: 'Aloqa va yordam',
    ru: 'Контакты и поддержка',
    en: 'Contacts & Support',
  },
  'footer.copyright': {
    uz: 'Barcha huquqlar himoyalangan.',
    ru: 'Все права защищены.',
    en: 'All rights reserved.',
  },
};
