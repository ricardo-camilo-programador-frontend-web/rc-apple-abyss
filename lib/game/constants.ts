import { Language, LocalizationData, WormUpgrade } from './types';

export const INITIAL_STATE = {
  gold: 0,
  stage: 1,
  appleHP: 50,
  maxAppleHP: 50,
  clickDamage: 1,
  totalClicks: 0,
  totalApplesEaten: 0,
  gardenersSouls: 0,
  highestStage: 1,
  lastSaveTimestamp: Date.now(),
  worms: {
    small_worm: 0,
    hungry_worm: 0,
    fat_worm: 0,
    queen_worm: 0,
    acid_worm: 0,
  },
  settings: {
    language: 'en' as Language,
    muted: false,
    volume: 0.5,
  },
};

export const WORM_UPGRADES: WormUpgrade[] = [
  { id: 'small_worm', nameKey: 'upgrade_small_worm', baseCost: 15, baseDPS: 1, count: 0 },
  { id: 'hungry_worm', nameKey: 'upgrade_hungry_worm', baseCost: 100, baseDPS: 5, count: 0 },
  { id: 'fat_worm', nameKey: 'upgrade_fat_worm', baseCost: 1100, baseDPS: 25, count: 0 },
  { id: 'queen_worm', nameKey: 'upgrade_queen_worm', baseCost: 12000, baseDPS: 150, count: 0 },
  { id: 'acid_worm', nameKey: 'upgrade_acid_worm', baseCost: 130000, baseDPS: 1000, count: 0 },
];

export const LOCALIZATION: LocalizationData = {
  game_title: {
    en: 'Apple of the Infinite Abyss', zh: '无尽深渊之苹果', hi: 'अनंत रसातल का सेब', es: 'Manzana del Abismo Infinito', fr: 'Pomme de l\'Abîme Infini',
    ar: 'تفاحة الهاوية اللانهائية', bn: 'অনন্ত অতল গহ্বরের আপেল', pt: 'Maçã do Abismo Infinito', ru: 'Яблоко бесконечной бездны', ur: 'لامتناہی پاتال کا سیب',
    id: 'Apel dari Jurang Tak Terbatas', de: 'Apfel des unendlichen Abgrunds', ja: '無限の深淵のリンゴ', sw: 'Tofaa la Shimo Lisilo na Mwisho', mr: 'अनंत अथांग डोहातील सफरचंद',
    te: 'అనంతమైన అగాధపు ఆపిల్', tr: 'Sonsuz Uçurumun Elması', ta: 'முடிவிலா படுகுழியின் ஆப்பிள்', vi: 'Quả táo của vực thẳm vô tận', ko: '무한한 심연의 사과'
  },
  gold: {
    en: 'Gold', zh: '金币', hi: 'सोना', es: 'Oro', fr: 'Or', ar: 'ذهب', bn: 'সোনা', pt: 'Ouro', ru: 'Золото', ur: 'سونا',
    id: 'Emas', de: 'Gold', ja: 'ゴールド', sw: 'Dhahabu', mr: 'सोने', te: 'బంగారం', tr: 'Altın', ta: 'தங்கம்', vi: 'Vàng', ko: '골드'
  },
  stage: {
    en: 'Stage', zh: '关卡', hi: 'चरण', es: 'Etapa', fr: 'Étape', ar: 'مرحلة', bn: 'পর্যায়', pt: 'Estágio', ru: 'Этап', ur: 'مرحلہ',
    id: 'Tahap', de: 'Stufe', ja: 'ステージ', sw: 'Hatua', mr: 'टप्पा', te: 'దశ', tr: 'Aşama', ta: 'நிலை', vi: 'Giai đoạn', ko: '스테이지'
  },
  souls: {
    en: 'Souls', zh: '灵魂', hi: 'आत्माएं', es: 'Almas', fr: 'Âmes', ar: 'أرواح', bn: 'আত্মা', pt: 'Almas', ru: 'Души', ur: 'روحیں',
    id: 'Jiwa', de: 'Seelen', ja: 'ソウル', sw: 'Nafsi', mr: 'आत्मे', te: 'ఆత్మలు', tr: 'Ruhlar', ta: 'ஆன்மாக்கள்', vi: 'Linh hồn', ko: '소울'
  },
  ascend: {
    en: 'Ascend', zh: '飞升', hi: 'आरोहण', es: 'Ascender', fr: 'Ascension', ar: 'صعود', bn: 'আরোহণ', pt: 'Ascender', ru: 'Вознестись', ur: 'عروج',
    id: 'Naik', de: 'Aufsteigen', ja: '昇天', sw: 'Panda', mr: 'वर जाणे', te: 'ఆరోహణ', tr: 'Yüksel', ta: 'ஏறுதல்', vi: 'Thăng hoa', ko: '승천'
  },
  upgrade_small_worm: {
    en: 'Small Worm', zh: '小虫子', hi: 'छोटा कीड़ा', es: 'Gusano Pequeño', fr: 'Petit Ver', ar: 'دودة صغيرة', bn: 'ছোট পোকা', pt: 'Minhoca Pequena', ru: 'Маленький червь', ur: 'چھوٹا کیڑا',
    id: 'Cacing Kecil', de: 'Kleiner Wurm', ja: '小さな虫', sw: 'Minyoo Mdogo', mr: 'लहान कीडा', te: 'చిన్న పురుగు', tr: 'Küçük Solucan', ta: 'சிறிய புழு', vi: 'Sâu nhỏ', ko: '작은 벌레'
  },
  upgrade_hungry_worm: {
    en: 'Hungry Worm', zh: '饥饿的虫子', hi: 'भूखा कीड़ा', es: 'Gusano Hambriento', fr: 'Ver Affamé', ar: 'دودة جائعة', bn: 'ক্ষুধার্ত পোকা', pt: 'Minhoca Faminta', ru: 'Голодный червь', ur: 'بھوکا کیڑا',
    id: 'Cacing Lapar', de: 'Hungriger Wurm', ja: 'お腹を空かせた虫', sw: 'Minyoo Mwenye Njaa', mr: 'भुकेलेला कीडा', te: 'ఆకలితో ఉన్న పురుగు', tr: 'Aç Solucan', ta: 'பசியுள்ள புழு', vi: 'Sâu đói', ko: '배고픈 벌레'
  },
  upgrade_fat_worm: {
    en: 'Fat Worm', zh: '肥虫子', hi: 'मोटा कीड़ा', es: 'Gusano Gordo', fr: 'Gros Ver', ar: 'دودة سمينة', bn: 'মোটা পোকা', pt: 'Minhoca Gorda', ru: 'Толстый червь', ur: 'موٹا کیڑا',
    id: 'Cacing Gemuk', de: 'Fetter Wurm', ja: '太った虫', sw: 'Minyoo Mnono', mr: 'जाड कीडा', te: 'లావు పురుగు', tr: 'Şişman Solucan', ta: 'குண்டான புழு', vi: 'Sâu béo', ko: '뚱뚱한 벌레'
  },
  upgrade_queen_worm: {
    en: 'Queen Worm', zh: '虫后', hi: 'रानी कीड़ा', es: 'Gusano Reina', fr: 'Ver Reine', ar: 'دودة الملكة', bn: 'রানী পোকা', pt: 'Minhoca Rainha', ru: 'Королевский червь', ur: 'ملکہ کیڑا',
    id: 'Cacing Ratu', de: 'Wurmkönigin', ja: '女王の虫', sw: 'Minyoo Malkia', mr: 'राणी कीडा', te: 'రాణి పురుగు', tr: 'Kraliçe Solucan', ta: 'ராணி புழு', vi: 'Sâu chúa', ko: '여왕 벌레'
  },
  upgrade_acid_worm: {
    en: 'Acid Worm', zh: '酸性虫子', hi: 'एसिड कीड़ा', es: 'Gusano Ácido', fr: 'Ver Acide', ar: 'دودة حمضية', bn: 'অ্যাসিড পোকা', pt: 'Minhoca Ácida', ru: 'Кислотный червь', ur: 'تیزاب کیڑا',
    id: 'Cacing Asam', de: 'Säurewurm', ja: '酸の虫', sw: 'Minyoo ya Asidi', mr: 'ऍसिड कीडा', te: 'యాసిడ్ పురుగు', tr: 'Asit Solucanı', ta: 'அமில புழு', vi: 'Sâu axit', ko: '산성 벌레'
  },
  stats_click_damage: {
    en: 'Click Damage', zh: '点击伤害', hi: 'क्लिक क्षति', es: 'Daño por Clic', fr: 'Dégâts de Clic', ar: 'ضرر النقرة', bn: 'ক্লিক ক্ষতি', pt: 'Dano por Clique', ru: 'Урон от клика', ur: 'کلک نقصان',
    id: 'Kerusakan Klik', de: 'Klick-Schaden', ja: 'クリックダメージ', sw: 'Uharibifu wa Kubofya', mr: 'क्लिक डॅमेज', te: 'క్లిక్ డ్యామేజ్', tr: 'Tıklama Hasarı', ta: 'கிளிக் சேதம்', vi: 'Sát thương click', ko: '클릭 데미지'
  },
  stats_idle_dps: {
    en: 'Idle DPS', zh: '挂机伤害', hi: 'आइडल डीपीएस', es: 'DPS Inactivo', fr: 'DPS Passif', ar: 'ضرر في الثانية', bn: 'আইডল ডিপিএস', pt: 'DPS Inativo', ru: 'Урон в секунду', ur: 'آئیڈل ڈی پی ایس',
    id: 'DPS Diam', de: 'Idle-DPS', ja: '放置DPS', sw: 'DPS ya Kutofanya Kitu', mr: 'आयडल डीपीएस', te: 'ఐడల్ డీపీఎస్', tr: 'Boşta HAS', ta: 'ஐடல் டிபிஎஸ்', vi: 'DPS nhàn rỗi', ko: '방치 DPS'
  },
  upgrades: {
    en: 'Upgrades', zh: '升级', hi: 'अपग्रेड', es: 'Mejoras', fr: 'Améliorations', ar: 'ترقيات', bn: 'আপগ্রেড', pt: 'Melhorias', ru: 'Улучшения', ur: 'اپ گریڈ',
    id: 'Peningkatan', de: 'Upgrades', ja: 'アップグレード', sw: 'Maboresho', mr: 'सुधारणा', te: 'అప్‌గ్రేడ్‌లు', tr: 'Yükseltmeler', ta: 'மேம்படுத்தல்கள்', vi: 'Nâng cấp', ko: '업그레이드'
  },
  ascension: {
    en: 'Ascension', zh: '飞升', hi: 'आरोहण', es: 'Ascensión', fr: 'Ascension', ar: 'صعود', bn: 'আরোহণ', pt: 'Ascensão', ru: 'Вознесение', ur: 'عروج',
    id: 'Kenaikan', de: 'Aufstieg', ja: '昇天', sw: 'Kupanda', mr: 'आरोहण', te: 'ఆరోహణ', tr: 'Yükseliş', ta: 'ஏறுதல்', vi: 'Thăng hoa', ko: '승천'
  },
  pending_souls: {
    en: 'Pending Souls', zh: '待领取的灵魂', hi: 'लंबित आत्माएं', es: 'Almas Pendientes', fr: 'Âmes en attente', ar: 'الأرواح المعلقة', bn: 'মুলতুবি আত্মা', pt: 'Almas Pendentes', ru: 'Ожидающие души', ur: 'باقی روحیں',
    id: 'Jiwa Tertunda', de: 'Ausstehende Seelen', ja: '保留中のソウル', sw: 'Nafsi Zinazosubiri', mr: 'प्रलंबित आत्मे', te: 'పెండింగ్ ఆత్మలు', tr: 'Bekleyen Ruhlar', ta: 'நிலுவையில் உள்ள ஆன்மாக்கள்', vi: 'Linh hồn chờ xử lý', ko: '대기 중인 소울'
  },
  ascension_desc: {
    en: 'Ascending resets your progress but grants Gardeners Souls. Each soul increases your damage and gold earnings.',
    zh: '飞升会重置你的进度，但会授予园丁灵魂。每个灵魂都会增加你的伤害和金币收入。',
    hi: 'आरोहण आपकी प्रगति को रीसेट करता है लेकिन गार्डनर्स सोल्स प्रदान करता है। प्रत्येक आत्मा आपकी क्षति और सोने की कमाई को बढ़ाती है।',
    es: 'Ascender reinicia tu progreso pero otorga Almas de Jardinero. Cada alma aumenta tu daño y ganancias de oro.',
    fr: 'L\'ascension réinitialise votre progression mais accorde des Âmes de Jardinier. Chaque âme augmente vos dégâts et vos gains d\'or.',
    ar: 'الصعود يعيد ضبط تقدمك ولكنه يمنح أرواح البستانيين. كل روح تزيد من ضررك ومكاسبك من الذهب.',
    bn: 'আরোহণ আপনার অগ্রগতি রিসেট করে কিন্তু গার্ডেনার্স সোলস প্রদান করে। প্রতিটি আত্মা আপনার ক্ষতি এবং সোনা উপার্জন বৃদ্ধি করে।',
    pt: 'Ascender redefine seu progresso, mas concede Almas de Jardineiro. Cada alma aumenta seu dano e ganhos de ouro.',
    ru: 'Вознесение сбрасывает ваш прогресс, но дает Души Садовника. Каждая душа увеличивает ваш урон и заработок золота.',
    ur: 'عروج آپ کی پیش رفت کو دوبارہ ترتیب دیتا ہے لیکن گارڈنرز کی روحیں دیتا ہے۔ ہر روح آپ کے نقصان اور سونے کی کمائی میں اضافہ کرتی ہے۔',
    id: 'Kenaikan mengatur ulang kemajuan Anda tetapi memberikan Jiwa Tukang Kebun. Setiap jiwa meningkatkan kerusakan dan penghasilan emas Anda.',
    de: 'Der Aufstieg setzt deinen Fortschritt zurück, gewährt aber Gärtnerseelen. Jede Seele erhöht deinen Schaden und deine Goldeinnahmen.',
    ja: '昇天すると進行状況がリセットされますが、庭師のソウルが付与されます。各ソウルはダメージとゴールドの獲得量を増加させます。',
    sw: 'Kupanda upya kunaweka upya maendeleo yako lakini kunatoa Nafsi za Watunza Bustani. Kila nafsi huongeza uharibifu wako na mapato ya dhahabu.',
    mr: 'आरोहण तुमची प्रगती रीसेट करते परंतु गार्डनर्स सोल्स प्रदान करते. प्रत्येक आत्मा तुमचे नुकसान आणि सोन्याची कमाई वाढवते.',
    te: 'ఆరోహణ మీ పురోగతిని రీసెట్ చేస్తుంది కానీ గార్డెనర్స్ సోల్స్‌ను మంజూరు చేస్తుంది. ప్రతి ఆత్మ మీ నష్టాన్ని మరియు బంగారు సంపాదనను పెంచుతుంది.',
    tr: 'Yükseliş ilerlemenizi sıfırlar ancak Bahçıvan Ruhları verir. Her ruh hasarınızı ve altın kazancınızı artırır.',
    ta: 'ஏறுதல் உங்கள் முன்னேற்றத்தை மீட்டமைக்கிறது ஆனால் தோட்டக்காரர்களின் ஆன்மாக்களை வழங்குகிறது. ஒவ்வொரு ஆன்மாவும் உங்கள் சேதத்தையும் தங்க வருவாயையும் அதிகரிக்கிறது.',
    vi: 'Thăng hoa đặt lại tiến trình của bạn nhưng ban tặng Linh hồn người làm vườn. Mỗi linh hồn làm tăng sát thương và thu nhập vàng của bạn.',
    ko: '승천은 진행 상황을 초기화하지만 정원사의 소울을 부여합니다. 각 소울은 데미지와 골드 수입을 증가시킵니다.'
  },
  ascend_requirement: {
    en: 'Reach stage 50 to ascend', zh: '达到 50 关即可飞升', hi: 'आरोहण के लिए चरण 50 तक पहुँचें', es: 'Llega a la etapa 50 para ascender', fr: 'Atteignez l\'étape 50 pour l\'ascension', ar: 'صل إلى المرحلة 50 للصعود', bn: 'আরোহণের জন্য ৫০ পর্যায়ে পৌঁছান', pt: 'Alcance o estágio 50 para ascender', ru: 'Достигните 50 этапа, чтобы вознестись', ur: 'عروج کے لیے مرحلہ 50 تک پہنچیں',
    id: 'Capai tahap 50 untuk naik', de: 'Erreiche Stufe 50, um aufzusteigen', ja: '昇天するにはステージ50に到達してください', sw: 'Fika hatua ya 50 ili upande', mr: 'आरोहण करण्यासाठी टप्पा ५० गाठा', te: 'ఆరోహణకు 50వ దశకు చేరుకోండి', tr: 'Yükselmek için 50. aşamaya ulaşın', ta: 'ஏறுவதற்கு நிலை 50 ஐ அடையுங்கள்', vi: 'Đạt đến giai đoạn 50 để thăng hoa', ko: '승천하려면 50단계에 도달하세요'
  },
  stats: {
    en: 'Stats', zh: '统计', hi: 'आंकड़े', es: 'Estadísticas', fr: 'Stats', ar: 'إحصائيات', bn: 'পরিসংখ্যান', pt: 'Estatísticas', ru: 'Статистика', ur: 'اعداد و شمار',
    id: 'Statistik', de: 'Statistiken', ja: '統計', sw: 'Takwimu', mr: 'आकडेवारी', te: 'గణాంకాలు', tr: 'İstatistikler', ta: 'புள்ளிவிவரங்கள்', vi: 'Thống kê', ko: '통계'
  },
  total_eaten: {
    en: 'Total Eaten', zh: '总食用量', hi: 'कुल खाया गया', es: 'Total Comido', fr: 'Total Mangé', ar: 'إجمالي المأكول', bn: 'মোট খাওয়া হয়েছে', pt: 'Total Comido', ru: 'Всего съедено', ur: 'کل کھایا گیا',
    id: 'Total Dimakan', de: 'Insgesamt gegessen', ja: '合計捕食数', sw: 'Jumla ya Vilivyoliwa', mr: 'एकूण खाल्ले', te: 'మొత్తం తిన్నది', tr: 'Toplam Yenilen', ta: 'மொத்தம் சாப்பிட்டது', vi: 'Tổng cộng đã ăn', ko: '총 섭취량'
  },
  settings: {
    en: 'Settings', zh: '设置', hi: 'सेटिंग्स', es: 'Ajustes', fr: 'Paramètres', ar: 'إعدادات', bn: 'সেটিংস', pt: 'Configurações', ru: 'Настройки', ur: 'ترتیبات',
    id: 'Pengaturan', de: 'Einstellungen', ja: '設定', sw: 'Mipangilio', mr: 'सेटिंग्ज', te: 'సెట్టింగ్‌లు', tr: 'Ayarlar', ta: 'அமைப்புகள்', vi: 'Cài đặt', ko: '설정'
  },
  awesome: {
    en: 'Awesome!', zh: '太棒了！', hi: 'बहुत बढ़िया!', es: '¡Increíble!', fr: 'Génial !', ar: 'رائع!', bn: 'অসাধারণ!', pt: 'Incrível!', ru: 'Здорово!', ur: 'زبردست!',
    id: 'Luar biasa!', de: 'Großartig!', ja: '素晴らしい！', sw: 'Safi sana!', mr: 'छान!', te: 'అద్భుతం!', tr: 'Harika!', ta: 'அற்புதம்!', vi: 'Tuyệt vời!', ko: '멋져요!'
  },
  ascend_confirm: {
    en: 'Are you sure you want to ascend? You will lose all current progress but gain permanent bonuses.',
    zh: '你确定要飞升吗？你将失去所有当前进度，但会获得永久奖励。',
    hi: 'क्या आप वाकई आरोहण करना चाहते हैं? आप सभी वर्तमान प्रगति खो देंगे लेकिन स्थायी बोनस प्राप्त करेंगे।',
    es: '¿Estás seguro de que quieres ascender? Perderás todo el progreso actual pero ganarás bonificaciones permanentes.',
    fr: 'Êtes-vour sûr de vouloir faire l\'ascension ? Vous perdrez toute votre progression actuelle mais gagnerez des bonus permanents.',
    ar: 'هل أنت متأكد أنك تريد الصعود؟ ستفقد كل تقدمك الحالي ولكنك ستحصل على مكافآت دائمة.',
    bn: 'আপনি কি নিশ্চিত যে আপনি আরোহণ করতে চান? আপনি বর্তমান সমস্ত অগ্রগতি হারাবেন কিন্তু স্থায়ী বোনাস পাবেন।',
    pt: 'Tem certeza de que deseja ascender? Você perderá todo o progresso atual, mas ganhará bônus permanentes.',
    ru: 'Вы уверены, что хотите вознестись? Вы потеряете весь текущий прогресс, но получите постоянные бонусы.',
    ur: 'کیا آپ واقعی عروج حاصل کرنا چاہتے ہیں؟ آپ تمام موجودہ پیش رفت کھو دیں گے لیکن مستقل بونس حاصل کریں گے۔',
    id: 'Apakah Anda yakin ingin naik? Anda akan kehilangan semua kemajuan saat ini tetapi mendapatkan bonus permanen.',
    de: 'Bist du sicher, dass du aufsteigen möchtest? Du verlierst deinen gesamten aktuellen Fortschritt, erhältst aber dauerhafte Boni.',
    ja: '本当に昇天しますか？現在の進行状況はすべて失われますが、永続的なボーナスが得られます。',
    sw: 'Je, una uhakika unataka kupanda? Utapoteza maendeleo yote ya sasa lakini utapata bonasi za kudumu.',
    mr: 'तुम्हाला खात्री आहे की तुम्हाला आरोहण करायचे आहे? तुम्ही सर्व वर्तमान प्रगती गमावाल परंतु कायमस्वरूपी बोनस मिळवाल.',
    te: 'మీరు ఖచ్చితంగా ఆరోహణ చేయాలనుకుంటున్నారా? మీరు ప్రస్తుత పురోగతిని కోల్పోతారు కానీ శాశ్వత బోనస్‌లను పొందుతారు.',
    tr: 'Yükselmek istediğinizden emin misiniz? Mevcut tüm ilerlemenizi kaybedeceksiniz ancak kalıcı bonuslar kazanacaksınız.',
    ta: 'நீங்கள் நிச்சயமாக ஏற விரும்புகிறீர்களா? தற்போதைய அனைத்து முன்னேற்றத்தையும் இழப்பீர்கள் ஆனால் நிரந்தர போனஸைப் பெறுவீர்கள்.',
    vi: 'Bạn có chắc chắn muốn thăng hoa không? Bạn sẽ mất tất cả tiến trình hiện tại nhưng nhận được tiền thưởng vĩnh viễn.',
    ko: '정말로 승천하시겠습니까? 현재의 모든 진행 상황을 잃게 되지만 영구적인 보너스를 얻게 됩니다.'
  },
  settings_language: {
    en: 'Language', zh: '语言', hi: 'भाषा', es: 'Idioma', fr: 'Langue', ar: 'لغة', bn: 'ভাষা', pt: 'Idioma', ru: 'Язык', ur: 'زبان',
    id: 'Bahasa', de: 'Sprache', ja: '言語', sw: 'Lugha', mr: 'भाषा', te: 'భాష', tr: 'Dil', ta: 'மொழி', vi: 'Ngôn ngữ', ko: '언어'
  },
  settings_sound: {
    en: 'Sound', zh: '声音', hi: 'ध्वनि', es: 'Sonido', fr: 'Son', ar: 'صوت', bn: 'শব্দ', pt: 'Som', ru: 'Звук', ur: 'آواز',
    id: 'Suara', de: 'Ton', ja: 'サウンド', sw: 'Sauti', mr: 'आवाज', te: 'శబ్దం', tr: 'Ses', ta: 'ஒலி', vi: 'Âm thanh', ko: '사운드'
  },
  offline_welcome: {
    en: 'Welcome back!', zh: '欢迎回来！', hi: 'वापसी पर स्वागत है!', es: '¡Bienvenido de nuevo!', fr: 'Bon retour !', ar: 'مرحباً بعودتك!', bn: 'আবার স্বাগতম!', pt: 'Bem-vindo de volta!', ru: 'С возвращением!', ur: 'خوش آمدید!',
    id: 'Selamat datang kembali!', de: 'Willkommen zurück!', ja: 'おかえりなさい！', sw: 'Karibu tena!', mr: 'पुन्हा स्वागत आहे!', te: 'తిరిగి స్వాగతం!', tr: 'Tekrar hoş geldiniz!', ta: 'மீண்டும் வருக!', vi: 'Chào mừng trở lại!', ko: '다시 오신 것을 환영합니다!'
  },
  offline_earnings: {
    en: 'While you were away, your worms ate {n} apples and earned {g} gold.',
    zh: '在你离开期间，你的虫子吃了 {n} 个苹果，赚了 {g} 金币。',
    hi: 'जब आप दूर थे, आपके कीड़ों ने {n} सेब खाए और {g} सोना कमाया।',
    es: 'Mientras no estabas, tus gusanos comieron {n} manzanas y ganaron {g} de oro.',
    fr: 'Pendant votre absence, vos vers ont mangé {n} pommes et gagné {g} pièces d\'or.',
    ar: 'بينما كنت بعيداً، أكلت ديدانك {n} تفاحة وكسبت {g} ذهباً.',
    bn: 'আপনি যখন দূরে ছিলেন, আপনার পোকাগুলো {n}টি আপেল খেয়েছে এবং {g} সোনা অর্জন করেছে।',
    pt: 'Enquanto você estava fora, suas minhocas comeram {n} maçãs e ganharam {g} de ouro.',
    ru: 'Пока вас не было, ваши черви съели {n} яблок и заработали {g} золота.',
    ur: 'جب آپ دور تھے، آپ کے کیڑوں نے {n} سیب کھائے اور {g} سونا کمایا۔',
    id: 'Saat Anda pergi, cacing Anda memakan {n} apel dan menghasilkan {g} emas.',
    de: 'Während du weg warst, haben deine Würmer {n} Äpfel gefressen und {g} Gold verdient.',
    ja: 'あなたがいない間に、虫たちは {n} 個のリンゴを食べ、 {g} ゴールドを獲得しました。',
    sw: 'Wakati ukiwa mbali, minyoo yako ilikula tofaa {n} na kupata dhahabu {g}.',
    mr: 'तुम्ही नसताना तुमच्या कीड्यांनी {n} सफरचंद खाल्ले आणि {g} सोने मिळवले.',
    te: 'మీరు లేనప్పుడు, మీ పురుగులు {n} ఆపిల్‌లను తిని {g} బంగారాన్ని సంపాదించాయి.',
    tr: 'Siz yokken solucanlarınız {n} elma yedi ve {g} altın kazandı.',
    ta: 'நீங்கள் இல்லாதபோது, உங்கள் புழுக்கள் {n} ஆப்பிள்களை சாப்பிட்டு {g} தங்கத்தை ஈட்டின.',
    vi: 'Trong khi bạn đi vắng, lũ sâu của bạn đã ăn {n} quả táo và kiếm được {g} vàng.',
    ko: '자리를 비운 동안 벌레들이 {n}개의 사과를 먹고 {g} 골드를 벌었습니다.'
  },
  apple_guide_footer_link: {
    en: 'Apple Varieties Guide', zh: '苹果品种指南', hi: 'सेब की किस्मों का गाइड', es: 'Guía de Variedades de Manzana', fr: 'Guide des Variétés de Pommes', ar: 'دليل أصناف التفاح', bn: 'আপেল জাতের নির্দেশিকা', pt: 'Guia de Variedades de Maçã', ru: 'Гид по сортам яблок', ur: 'سیب کی اقسام کا گائیڈ',
    id: 'Panduan Varietas Apel', de: 'Leitfaden für Apfelsorten', ja: 'リンゴ品種ガイド', sw: 'Mwongozo wa Aina za Tofaa', mr: 'सफरचंद जातींचे मार्गदर्शक', te: 'ఆపిల్ రకాల గైడ్', tr: 'Elma Çeşitleri Rehberi', ta: 'ஆப்பிள் வகைகள் வழிகாட்டி', vi: 'Hướng dẫn các loại táo', ko: '사과 품종 가이드'
  },
  apple_guide_title: {
    en: 'The Origins of Apple Names', zh: '苹果名称的起源', hi: 'सेब के नामों की उत्पत्ति', es: 'Los Orígenes de los Nombres de las Manzanas', fr: 'L\'Origine des Noms de Pommes', ar: 'أصول أسماء التفاح', bn: 'আপেলের নামের উৎপত্তি', pt: 'As Origens dos Nomes das Maçãs', ru: 'Происхождение названий яблок', ur: 'سیب کے ناموں کا آغاز',
    id: 'Asal Usul Nama Apel', de: 'Die Ursprünge der Apfelnamen', ja: 'リンゴの名前の由来', sw: 'Asili ya Majina ya Tofaa', mr: 'सफरचंदांच्या नावांची उत्पत्ती', te: 'ఆపిల్ పేర్ల మూలాలు', tr: 'Elma İsimlerinin Kökenleri', ta: 'ஆப்பிள் பெயர்களின் தோற்றம்', vi: 'Nguồn gốc tên các loại táo', ko: '사과 이름의 기원'
  },
  apple_guide_intro: {
    en: 'Apples around the world have interesting historical and linguistic origins. This guide summarizes the etymology of several popular apple cultivars.',
    zh: '世界各地的苹果都有有趣的历史和语言起源。本指南总结了几种流行苹果品种的词源。',
    hi: 'दुनिया भर के सेबों के दिलचस्प ऐतिहासिक और भाषाई मूल हैं। यह गाइड कई लोकप्रिय सेब किस्मों की व्युत्पत्ति का सारांश प्रस्तुत करता है।',
    es: 'Las manzanas de todo el mundo tienen orígenes históricos y lingüísticos interesantes. Esta guía resume la etimología de varios cultivares de manzana populares.',
    fr: 'Les pommes du monde entier ont des origines historiques et linguistiques intéressantes. Ce guide résume l\'étymologie de plusieurs variétés de pommes populaires.',
    ar: 'للتفاح حول العالم أصول تاريخية ولغوية مثيرة للاهتمام. يلخص هذا الدليل أصل الكلمة للعديد من أصناف التفاح الشائعة.',
    bn: 'সারা বিশ্বের আপেলের আকর্ষণীয় ঐতিহাসিক এবং ভাষাগত উৎপত্তি রয়েছে। এই নির্দেশিকাটি বেশ কয়েকটি জনপ্রিয় আপেল জাতের ব্যুৎপত্তি সংক্ষেপে তুলে ধরেছে।',
    pt: 'As maçãs em todo o mundo têm origens históricas e linguísticas interessantes. Este guia resume a etimologia de várias cultivares de maçã populares.',
    ru: 'Яблоки по всему миру имеют интересное историческое и лингвистическое происхождение. Этот гид обобщает этимологию нескольких популярных сортов яблок.',
    ur: 'دنیا بھر میں سیبوں کے دلچسپ تاریخی اور لسانی آغاز ہیں۔ یہ گائیڈ سیب کی کئی مقبول اقسام کی ایٹیمولوجی کا خلاصہ پیش کرتا ہے۔',
    id: 'Apel di seluruh dunia memiliki asal-usul sejarah dan linguistik yang menarik. Panduan ini merangkum etimologi dari beberapa kultivar apel populer.',
    de: 'Äpfel auf der ganzen Welt haben interessante historische und linguistische Ursprünge. Dieser Leitfaden fasst die Etymologie mehrerer beliebter Apfelsorten zusammen.',
    ja: '世界中のリンゴには、興味深い歴史的および言語的な由来があります。このガイドでは、いくつかの人気のあるリンゴ品種の語源をまとめています。',
    sw: 'Tofaa ulimwenguni kote zina asili ya kuvutia ya kihistoria na kilugha. Mwongozo huu unatoa muhtasari wa etimolojia ya aina kadhaa maarufu za tofaa.',
    mr: 'जगभरातील सफरचंदांचे मनोरंजक ऐतिहासिक आणि भाषिक मूळ आहे. हे मार्गदर्शक अनेक लोकप्रिय सफरचंद जातींच्या व्युत्पत्तीचा सारांश देते.',
    te: 'ప్రపంచవ్యాప్తంగా ఉన్న ఆపిల్‌లు ఆసక్తికరమైన చారిత్రక మరియు భాషా మూలాలను కలిగి ఉన్నాయి. ఈ గైడ్ అనేక ప్రసిద్ధ ఆపిల్ రకాల వ్యుత్పత్తిని సంగ్రహిస్తుంది.',
    tr: 'Dünyanın dört bir yanındaki elmalar ilginç tarihi ve dilsel kökenlere sahiptir. Bu rehber, birkaç popüler elma çeşidinin etimolojisini özetlemektedir.',
    ta: 'உலகெங்கிலும் உள்ள ஆப்பிள்கள் சுவாரஸ்யமான வரலாற்று மற்றும் மொழியியல் தோற்றங்களைக் கொண்டுள்ளன. இந்த வழிகாட்டி பல பிரபலமான ஆப்பிள் வகைகளின் சொற்பிறப்பியல் சுருக்கத்தை வழங்குகிறது.',
    vi: 'Táo trên khắp thế giới có nguồn gốc lịch sử và ngôn ngữ thú vị. Hướng dẫn này tóm tắt từ nguyên của một số giống táo phổ biến.',
    ko: '전 세계의 사과는 흥미로운 역사적, 언어적 기원을 가지고 있습니다. 이 가이드는 여러 인기 있는 사과 품종의 어원을 요약합니다.'
  },
  apple_guide_source_title: {
    en: 'Infographic Source', zh: '信息图来源', hi: 'इन्फोग्राफिक स्रोत', es: 'Fuente de la Infografía', fr: 'Source de l\'Infographie', ar: 'مصدر الإنفوجرافيك', bn: 'ইনফোগ্রাফিক উৎস', pt: 'Fonte da Infografia', ru: 'Источник инфографики', ur: 'انفوگرافک ذریعہ',
    id: 'Sumber Infografis', de: 'Quelle der Infografik', ja: 'インフォグラフィックのソース', sw: 'Chanzo cha Infografia', mr: 'इन्फोग्राफिक स्रोत', te: 'ఇన్ఫోగ్రాఫిక్ మూలం', tr: 'İnfografik Kaynağı', ta: 'தகவல் வரைபட ஆதாரம்', vi: 'Nguồn đồ họa thông tin', ko: '인포그래픽 출처'
  },
  apple_guide_source_credit: {
    en: 'Original post on Reddit CoolGuides community', zh: 'Reddit CoolGuides 社区的原始帖子', hi: 'Reddit CoolGuides समुदाय पर मूल पोस्ट', es: 'Publicación original en la comunidad Reddit CoolGuides', fr: 'Message original sur la communauté Reddit CoolGuides', ar: 'المنشور الأصلي على مجتمع Reddit CoolGuides', bn: 'Reddit CoolGuides কমিউনিটিতে মূল পোস্ট', pt: 'Post original na comunidade Reddit CoolGuides', ru: 'Оригинальный пост в сообществе Reddit CoolGuides', ur: 'Reddit CoolGuides کمیونٹی پر اصل پوسٹ',
    id: 'Postingan asli di komunitas Reddit CoolGuides', de: 'Originalbeitrag in der Reddit CoolGuides-Community', ja: 'Reddit CoolGuidesコミュニティの元の投稿', sw: 'Chapisho asili kwenye jumuiya ya Reddit CoolGuides', mr: 'Reddit CoolGuides समुदायावरील मूळ पोस्ट', te: 'Reddit CoolGuides కమ్యూనిటీలో అసలు పోస్ట్', tr: 'Reddit CoolGuides topluluğundaki orijinal gönderi', ta: 'Reddit CoolGuides சமூகத்தில் அசல் இடுகை', vi: 'Bài đăng gốc trên cộng đồng Reddit CoolGuides', ko: 'Reddit CoolGuides 커뮤니티의 원본 게시물'
  },
  apple_guide_varieties_title: {
    en: 'Apple Varieties & Their Origins', zh: '苹果品种及其起源', hi: 'सेब की किस्में और उनकी उत्पत्ति', es: 'Variedades de Manzana y sus Orígenes', fr: 'Variétés de Pommes et leurs Origines', ar: 'أصناف التفاح وأصولها', bn: 'আপেল জাত এবং তাদের উৎপত্তি', pt: 'Variedades de Maçã e suas Origens', ru: 'Сорта яблок и их происхождение', ur: 'سیب کی اقسام اور ان کا آغاز',
    id: 'Varietas Apel & Asal Usulnya', de: 'Apfelsorten und ihre Ursprünge', ja: 'リンゴの品種とその由来', sw: 'Aina za Tofaa na Asili Zake', mr: 'सफरचंद जाती आणि त्यांची उत्पत्ती', te: 'ఆపిల్ రకాలు & వాటి మూలాలు', tr: 'Elma Çeşitleri ve Kökenleri', ta: 'ஆப்பிள் வகைகள் மற்றும் அவற்றின் தோற்றம்', vi: 'Các loại táo & Nguồn gốc của chúng', ko: '사과 품종 및 기원'
  },
  apple_guide_meta_description: {
    en: 'Discover the origin and meaning behind popular apple varieties like Fuji, Honeycrisp, Granny Smith and more.',
    zh: '发现富士、Honeycrisp、Granny Smith 等流行苹果品种背后的起源和含义。',
    hi: 'फूजी, हनीक्रिस्प, ग्रैनी स्मिथ और अन्य जैसी लोकप्रिय सेब किस्मों के पीछे की उत्पत्ति और अर्थ की खोज करें।',
    es: 'Descubre el origen y el significado detrás de las variedades de manzana populares como Fuji, Honeycrisp, Granny Smith y más.',
    fr: 'Découvrez l\'origine et la signification des variétés de pommes populaires telles que Fuji, Honeycrisp, Granny Smith et plus encore.',
    ar: 'اكتشف أصل ومعنى أصناف التفاح الشهيرة مثل فوجي وهاني كريسب وجراني سميث والمزيد.',
    bn: 'ফুজি, হানিক্রিস্প, গ্র্যানি স্মিথ এবং আরও অনেক কিছুর মতো জনপ্রিয় আপেল জাতের পিছনের উৎপত্তি এবং অর্থ আবিষ্কার করুন।',
    pt: 'Descubra a origem e o significado por trás de variedades de maçã populares como Fuji, Honeycrisp, Granny Smith e muito mais.',
    ru: 'Узнайте о происхождении и значении популярных сортов яблок, таких как Фуджи, Ханикрисп, Гренни Смит и других.',
    ur: 'فوجی، ہنی کرسپ، گرینی سمتھ اور مزید جیسی مقبول سیب کی اقسام کے پیچھے چھپے آغاز اور معنی دریافت کریں۔',
    id: 'Temukan asal-usul dan makna di balik varietas apel populer seperti Fuji, Honeycrisp, Granny Smith, dan banyak lagi.',
    de: 'Entdecken Sie den Ursprung und die Bedeutung beliebter Apfelsorten wie Fuji, Honeycrisp, Granny Smith und mehr.',
    ja: 'ふじ、ハニークリスプ、グラニースミスなどの人気のあるリンゴ品種の背後にある由来と意味を発見してください。',
    sw: 'Gundua asili na maana ya aina maarufu za tofaa kama Fuji, Honeycrisp, Granny Smith na nyinginezo.',
    mr: 'फुजी, हनीक्रिस्प, ग्रॅनी स्मिथ आणि बरेच काही यांसारख्या लोकप्रिय सफरचंद जातींमागील मूळ आणि अर्थ शोधा.',
    te: 'ఫుజి, హనీక్రిస్ప్, గ్రానీ స్మిత్ మరియు మరిన్ని వంటి ప్రసిద్ధ ఆపిల్ రకాల వెనుక ఉన్న మూలం మరియు అర్థాన్ని కనుగొనండి.',
    tr: 'Fuji, Honeycrisp, Granny Smith ve daha fazlası gibi popüler elma çeşitlerinin arkasındaki kökeni ve anlamı keşfedin.',
    ta: 'ஃபுஜி, ஹனிகிரிஸ்ப், கிரானி ஸ்மித் மற்றும் பல பிரபலமான ஆப்பிள் வகைகளின் பின்னணியில் உள்ள தோற்றம் மற்றும் பொருளைக் கண்டறியவும்.',
    vi: 'Khám phá nguồn gốc và ý nghĩa đằng sau các loại táo phổ biến như Fuji, Honeycrisp, Granny Smith và hơn thế nữa.',
    ko: '후지, 허니크리스프, 그래니 스미스 등 인기 있는 사과 품종의 기원과 의미를 알아보세요.'
  },
  apple_variety_ambrosia: { en: 'Ambrosia' },
  apple_variety_ambrosia_desc: { en: 'Discovered as a chance seedling in British Columbia, named for the "food of the gods" in Greek mythology.' },
  apple_variety_baldwin: { en: 'Baldwin' },
  apple_variety_baldwin_desc: { en: 'Named after Loammi Baldwin, who popularized it in Massachusetts in the late 18th century.' },
  apple_variety_braeburn: { en: 'Braeburn' },
  apple_variety_braeburn_desc: { en: 'Discovered as a chance seedling in New Zealand in 1952, named after Braeburn Orchard.' },
  apple_variety_cameo: { en: 'Cameo' },
  apple_variety_cameo_desc: { en: 'Discovered as a chance seedling in Washington state in 1987, possibly a cross between Red and Golden Delicious.' },
  apple_variety_cortland: { en: 'Cortland' },
  apple_variety_cortland_desc: { en: 'Developed at the New York State Agricultural Experiment Station in 1898, named after Cortland County.' },
  apple_variety_coxs_orange_pippin: { en: "Cox's Orange Pippin" },
  apple_variety_coxs_orange_pippin_desc: { en: 'Raised by Richard Cox in Buckinghamshire, England, in 1825.' },
  apple_variety_crabapple: { en: 'Crabapple' },
  apple_variety_crabapple_desc: { en: 'A generic name for wild apples, from the Middle English "crabbe" meaning sour or sharp.' },
  apple_variety_empire: { en: 'Empire' },
  apple_variety_empire_desc: { en: 'A cross between McIntosh and Red Delicious, developed in New York (the Empire State) in 1945.' },
  apple_variety_envy: { en: 'Envy' },
  apple_variety_envy_desc: { en: 'A trademarked brand for the Scilate variety, developed in New Zealand in 2008.' },
  apple_variety_fuji: { en: 'Fuji' },
  apple_variety_fuji_desc: { en: 'Developed in Japan in the 1930s, named after the town of Fujisaki and Mount Fuji.' },
  apple_variety_golden_delicious: { en: 'Golden Delicious' },
  apple_variety_golden_delicious_desc: { en: 'Discovered as a chance seedling in West Virginia in 1890, unrelated to Red Delicious.' },
  apple_variety_granny_smith: { en: 'Granny Smith' },
  apple_variety_granny_smith_desc: { en: 'Discovered by Maria Ann Smith in Australia in 1868, who found it growing in a compost pile.' },
  apple_variety_honeycrisp: { en: 'Honeycrisp' },
  apple_variety_honeycrisp_desc: { en: 'Developed at the University of Minnesota in the 1960s, prized for its crisp texture.' },
  apple_variety_idared: { en: 'Idared' },
  apple_variety_idared_desc: { en: 'Developed in Idaho in 1942, a cross between Jonathan and Wagener.' },
  apple_variety_jazz: { en: 'Jazz' },
  apple_variety_jazz_desc: { en: 'A cross between Royal Gala and Braeburn, developed in New Zealand in 1999.' },
  apple_variety_jonagold: { en: 'Jonagold' },
  apple_variety_jonagold_desc: { en: 'A cross between Jonathan and Golden Delicious, developed in New York in 1953.' },
  apple_variety_jonathan: { en: 'Jonathan' },
  apple_variety_jonathan_desc: { en: 'Named after Jonathan Hasbrouck, who discovered it in New York in the early 19th century.' },
  apple_variety_macoun: { en: 'Macoun' },
  apple_variety_macoun_desc: { en: 'Named after W.T. Macoun, a Canadian pomologist, developed in New York in 1909.' },
  apple_variety_mcintosh: { en: 'McIntosh' },
  apple_variety_mcintosh_desc: { en: 'Discovered by John McIntosh in Ontario, Canada, in 1811.' },
  apple_variety_mutsu: { en: 'Mutsu' },
  apple_variety_mutsu_desc: { en: 'Developed in Japan in 1948, named after the Mutsu Province.' },
  apple_variety_northern_spy: { en: 'Northern Spy' },
  apple_variety_northern_spy_desc: { en: 'Discovered in Connecticut in 1800, possibly named after a character in a popular book of the time.' },
  apple_variety_opal: { en: 'Opal' },
  apple_variety_opal_desc: { en: 'A cross between Golden Delicious and Topaz, developed in the Czech Republic in 1999.' },
  apple_variety_pacific_rose: { en: 'Pacific Rose' },
  apple_variety_pacific_rose_desc: { en: 'A cross between Gala and Splendour, developed in New Zealand in 1990.' },
  apple_variety_pink_lady: { en: 'Pink Lady' },
  apple_variety_pink_lady_desc: { en: 'A brand name for the Cripps Pink variety, developed by John Cripps in Australia in 1973.' },
  apple_variety_red_delicious: { en: 'Red Delicious' },
  apple_variety_red_delicious_desc: { en: 'Discovered in Iowa in 1872, originally named "Hawkeye".' },
  apple_variety_rome: { en: 'Rome' },
  apple_variety_rome_desc: { en: 'Named after Rome Township, Ohio, where it was discovered in 1817.' },
  apple_variety_royal_gala: { en: 'Royal Gala' },
  apple_variety_royal_gala_desc: { en: 'A mutation of the Gala variety, named in honor of Queen Elizabeth II during a visit to New Zealand.' },
  apple_variety_snapdragon: { en: 'SnapDragon' },
  apple_variety_snapdragon_desc: { en: 'Developed at Cornell University in 2011, a cross between Honeycrisp and an unnamed variety.' },
  apple_variety_sonya: { en: 'Sonya' },
  apple_variety_sonya_desc: { en: 'A cross between Gala and Red Delicious, developed in New Zealand in 2002.' },
  apple_variety_sugarbee: { en: 'SugarBee' },
  apple_variety_sugarbee_desc: { en: 'A cross between Honeycrisp and an unknown variety, discovered in Minnesota.' },
  apple_variety_sweetango: { en: 'SweeTango' },
  apple_variety_sweetango_desc: { en: 'A cross between Honeycrisp and Zestar, developed in Minnesota in 2009.' },
  apple_variety_winter_banana: { en: 'Winter Banana' },
  apple_variety_winter_banana_desc: { en: 'Discovered in Indiana in 1876, named for its distinct banana-like aroma.' }
};
