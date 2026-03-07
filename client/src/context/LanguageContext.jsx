import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    dir: "ltr",
    // Login page
    welcomeBack: "Welcome back",
    loginSubtext: "Manage bookings across hotels, restaurants, and activities.",
    signInToContinue: "Sign in to continue",
    unifiedPlatform: "Unified Booking Platform",
    controlBooking: "Control every booking",
    inOnePlace: " in one place",
    fiveDesc: "Five dashboards for super admin, admin company, hotels, restaurants, and activities. Role-based access, permissions-aware sidebar, and real-time data.",
    security: "Security",
    dashboards: "Dashboards",
    tailoredViews: "5 tailored views",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    loginBtn: "Login",
    signingIn: "Signing in...",
    sampleAccounts: "Sample accounts",
    loginFailed: "Login Failed",
    invalidCredentials: "Invalid credentials. Please check your email and password.",
    tryAgain: "Try Again",
    // Nav / General
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Logout",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    noData: "No data found",
    featured: "FEATURED",
    actions: "Actions",
    exportCsv: "Export CSV",
    // Hotels
    hotelsManagement: "Hotels Management",
    addHotel: "+ Add Hotel",
    editHotel: "Edit Hotel",
    createHotel: "Create Hotel",
    updateHotel: "Update Hotel",
    deleteHotelConfirm: "Are you sure you want to delete this hotel?",
    errorLoadingHotels: "Error loading hotels. Please check your connection.",
    perNight: "/ night",
    // Restaurants
    restaurantsManagement: "Restaurants Management",
    addRestaurant: "+ Add Restaurant",
    editRestaurant: "Edit Restaurant",
    createRestaurant: "Create Restaurant",
    updateRestaurant: "Update Restaurant",
    deleteRestaurantConfirm: "Are you sure you want to delete this restaurant?",
    errorLoadingRestaurants: "Error loading restaurants.",
    avgPrice: "Avg price",
    // Activities
    activitiesManagement: "Activities Management",
    addActivity: "+ Add Activity",
    editActivity: "Edit Activity",
    createActivity: "Create Activity",
    updateActivity: "Update Activity",
    deleteActivityConfirm: "Are you sure you want to delete this activity?",
    errorLoadingActivities: "Error loading activities.",
    duration: "Duration",
    price: "Price",
    // Settings
    settingsTitle: "Settings",
    settingsSubtitle: "Manage your account and preferences.",
    theme: "Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    emailNotificationsLabel: "Email Notifications",
    comingSoonLabel: "Coming soon",
    profile: "Profile",
    name: "Name",
    email: "Email",
    role: "Role",
    preferences: "Preferences",
    language: "Language",
    emailNotifications: "Email Notifications",
    comingSoon: "Coming soon",
    permissions: "Permissions",
    noPermissions: "No explicit permissions (inherited from role)",
    // Form fields
    basicInfo: "Basic Information",
    location: "Location",
    contact: "Contact",
    details: "Details",
    amenities: "Amenities",
    policies: "Policies",
    pricing: "Pricing",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    description: "Description",
    address: "Address",
    city: "City",
    country: "Country",
    phone: "Phone",
    website: "Website",
    type: "Type",
    stars: "Stars",
    saving: "Saving...",
  },
  ar: {
    dir: "rtl",
    // Login page
    welcomeBack: "مرحباً بك",
    loginSubtext: "إدارة الحجوزات عبر الفنادق والمطاعم والأنشطة.",
    signInToContinue: "سجّل دخولك للمتابعة",
    unifiedPlatform: "منصة الحجز الموحّدة",
    controlBooking: "تحكّم في كل حجز",
    inOnePlace: " في مكان واحد",
    fiveDesc: "خمس لوحات تحكم للمسؤول الرئيسي وشركة الإدارة والفنادق والمطاعم والأنشطة. وصول قائم على الأدوار وشريط جانبي وبيانات فورية.",
    security: "الأمان",
    dashboards: "لوحات التحكم",
    tailoredViews: "5 طرق عرض مخصصة",
    emailPlaceholder: "البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    signingIn: "جاري تسجيل الدخول...",
    sampleAccounts: "حسابات تجريبية",
    loginFailed: "فشل تسجيل الدخول",
    invalidCredentials: "بيانات غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.",
    tryAgain: "حاول مرة أخرى",
    // Nav / General
    dashboard: "لوحة التحكم",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    search: "بحث",
    close: "إغلاق",
    loading: "جاري التحميل...",
    error: "خطأ",
    noData: "لا توجد بيانات",
    featured: "مميز",
    actions: "إجراءات",
    exportCsv: "تصدير CSV",
    // Hotels
    hotelsManagement: "إدارة الفنادق",
    addHotel: "+ إضافة فندق",
    editHotel: "تعديل الفندق",
    createHotel: "إنشاء فندق",
    updateHotel: "تحديث الفندق",
    deleteHotelConfirm: "هل أنت متأكد من حذف هذا الفندق؟",
    errorLoadingHotels: "خطأ في تحميل الفنادق. يرجى التحقق من الاتصال.",
    perNight: "/ ليلة",
    // Restaurants
    restaurantsManagement: "إدارة المطاعم",
    addRestaurant: "+ إضافة مطعم",
    editRestaurant: "تعديل المطعم",
    createRestaurant: "إنشاء مطعم",
    updateRestaurant: "تحديث المطعم",
    deleteRestaurantConfirm: "هل أنت متأكد من حذف هذا المطعم؟",
    errorLoadingRestaurants: "خطأ في تحميل المطاعم.",
    avgPrice: "متوسط السعر",
    // Activities
    activitiesManagement: "إدارة الأنشطة",
    addActivity: "+ إضافة نشاط",
    editActivity: "تعديل النشاط",
    createActivity: "إنشاء نشاط",
    updateActivity: "تحديث النشاط",
    deleteActivityConfirm: "هل أنت متأكد من حذف هذا النشاط؟",
    errorLoadingActivities: "خطأ في تحميل الأنشطة.",
    duration: "المدة",
    price: "السعر",
    // Settings
    settingsTitle: "الإعدادات",
    settingsSubtitle: "إدارة حسابك وتفضيلاتك.",
    theme: "المظهر",
    lightMode: "وضع نهاري",
    darkMode: "وضع ليلي",
    emailNotificationsLabel: "إشعارات البريد الإلكتروني",
    comingSoonLabel: "قريباً",
    profile: "الملف الشخصي",
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    preferences: "التفضيلات",
    language: "اللغة",
    emailNotifications: "إشعارات البريد الإلكتروني",
    comingSoon: "قريباً",
    permissions: "الصلاحيات",
    noPermissions: "لا توجد صلاحيات محددة (موروثة من الدور)",
    // Form fields
    basicInfo: "المعلومات الأساسية",
    location: "الموقع",
    contact: "التواصل",
    details: "التفاصيل",
    amenities: "المرافق",
    policies: "السياسات",
    pricing: "التسعير",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    description: "الوصف",
    address: "العنوان",
    city: "المدينة",
    country: "الدولة",
    phone: "الهاتف",
    website: "الموقع الإلكتروني",
    type: "النوع",
    stars: "النجوم",
    saving: "جاري الحفظ...",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = translations[lang].dir;
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider
      value={{ lang, toggleLang, t, dir: translations[lang].dir, theme, toggleTheme }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
