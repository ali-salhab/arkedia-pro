import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    dir: "ltr",
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

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.dir = translations[lang].dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider
      value={{ lang, toggleLang, t, dir: translations[lang].dir }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
