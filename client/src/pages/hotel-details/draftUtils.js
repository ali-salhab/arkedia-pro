export const HOTEL_STORAGE_KEYS = {
  main: "hotel_details_main",
  description: "hotel_details_description",
  icons: "hotel_details_icons",
  policy: "hotel_details_policy",
  photos: "hotel_details_photos",
  savedId: "hotel_saved_id",
};

const DEFAULT_POLICY = {
  checkIn: "14:00",
  checkOut: "12:00",
  petPolicy: "no",
  smokingPolicy: "no",
  additionalDetails: "",
};

const safeParse = (rawValue, fallback = null) => {
  try {
    return JSON.parse(rawValue || "null") ?? fallback;
  } catch {
    return fallback;
  }
};

const normalizeIconId = (icon) => {
  if (!icon) return null;
  if (typeof icon === "string") return icon;
  if (typeof icon === "object" && icon._id) return String(icon._id);
  return String(icon);
};

export function getStoredHotelId() {
  return sessionStorage.getItem(HOTEL_STORAGE_KEYS.savedId) || null;
}

export function setStoredHotelId(id) {
  if (!id) return;
  sessionStorage.setItem(HOTEL_STORAGE_KEYS.savedId, id);
}

export function readHotelDraftFromSession() {
  return {
    main: safeParse(sessionStorage.getItem(HOTEL_STORAGE_KEYS.main)),
    description: safeParse(
      sessionStorage.getItem(HOTEL_STORAGE_KEYS.description),
    ),
    icons: safeParse(sessionStorage.getItem(HOTEL_STORAGE_KEYS.icons)),
    policy: safeParse(sessionStorage.getItem(HOTEL_STORAGE_KEYS.policy)),
    photos: safeParse(sessionStorage.getItem(HOTEL_STORAGE_KEYS.photos)),
  };
}

export function persistHotelDraftToSession(draft) {
  if (!draft) return;

  if (draft.main) {
    sessionStorage.setItem(
      HOTEL_STORAGE_KEYS.main,
      JSON.stringify(draft.main),
    );
  }

  if (draft.description) {
    sessionStorage.setItem(
      HOTEL_STORAGE_KEYS.description,
      JSON.stringify(draft.description),
    );
  }

  if (draft.icons) {
    sessionStorage.setItem(
      HOTEL_STORAGE_KEYS.icons,
      JSON.stringify(draft.icons),
    );
  }

  if (draft.policy) {
    sessionStorage.setItem(
      HOTEL_STORAGE_KEYS.policy,
      JSON.stringify(draft.policy),
    );
  }

  if (draft.photos) {
    sessionStorage.setItem(
      HOTEL_STORAGE_KEYS.photos,
      JSON.stringify(draft.photos),
    );
  }
}

export function normalizeHotelPolicy(policy) {
  if (!policy || typeof policy !== "object") {
    return { ...DEFAULT_POLICY };
  }

  return {
    ...DEFAULT_POLICY,
    ...policy,
  };
}

const PET_POLICY_LABELS = {
  en: {
    no: "Not allowed",
    yes: "Allowed",
    request: "Upon request",
  },
  ar: {
    no: "غير مسموح",
    yes: "مسموح",
    request: "بناءً على طلب",
  },
};

const SMOKING_POLICY_LABELS = {
  en: {
    no: "Non-smoking",
    yes: "Smoking allowed",
    designated: "Designated areas only",
  },
  ar: {
    no: "غير مسموح بالتدخين",
    yes: "مسموح بالتدخين",
    designated: "مناطق مخصصة فقط",
  },
};

export function buildPolicyText(policy, lang = "en") {
  if (!policy) return "";

  if (typeof policy === "string") {
    return policy;
  }

  if (lang === "en" && policy.policyEn) {
    return policy.policyEn;
  }

  if (lang === "ar" && policy.policyAr) {
    return policy.policyAr;
  }

  const normalized = normalizeHotelPolicy(policy);
  const labels =
    lang === "ar"
      ? {
          checkIn: "تسجيل الدخول",
          checkOut: "تسجيل الخروج",
          petPolicy: "سياسة الحيوانات الأليفة",
          smokingPolicy: "سياسة التدخين",
        }
      : {
          checkIn: "Check-in",
          checkOut: "Check-out",
          petPolicy: "Pet Policy",
          smokingPolicy: "Smoking Policy",
        };

  const rows = [
    `${labels.checkIn}: ${normalized.checkIn || "—"}`,
    `${labels.checkOut}: ${normalized.checkOut || "—"}`,
    `${labels.petPolicy}: ${(PET_POLICY_LABELS[lang]?.[normalized.petPolicy] || normalized.petPolicy || "—")}`,
    `${labels.smokingPolicy}: ${(SMOKING_POLICY_LABELS[lang]?.[normalized.smokingPolicy] || normalized.smokingPolicy || "—")}`,
  ];

  if (normalized.additionalDetails?.trim()) {
    rows.push(normalized.additionalDetails.trim());
  }

  return rows.join("\n");
}

export function buildHotelDraftFromRecord(hotel) {
  if (!hotel) {
    return readHotelDraftFromSession();
  }

  const storedIcons = safeParse(
    sessionStorage.getItem(HOTEL_STORAGE_KEYS.icons),
    {},
  );
  const normalizedPolicy =
    hotel.policyDetails && Object.keys(hotel.policyDetails).length
      ? normalizeHotelPolicy(hotel.policyDetails)
      : normalizeHotelPolicy({
          additionalDetails: hotel.policyAr || hotel.policy || "",
        });

  return {
    main: {
      logoDataUrl: hotel.logo || null,
      nameEn: hotel.name || "",
      nameAr: hotel.nameAr || "",
      category: hotel.category || "Hotel",
      stars: hotel.stars || 0,
      country: hotel.country || "Egypt",
      city: hotel.city || "",
      location: hotel.location || "",
      postCode: hotel.postCode || "",
      lat: hotel.lat ?? null,
      lng: hotel.lng ?? null,
    },
    description: {
      descriptionEn: hotel.description || "",
      descriptionAr: hotel.descriptionAr || "",
    },
    icons: {
      selectedIcons: (hotel.selectedIcons || [])
        .map(normalizeIconId)
        .filter(Boolean),
      requestedItems: storedIcons?.requestedItems || [],
    },
    policy: normalizedPolicy,
    photos: {
      mainPhotoDataUrl: hotel.thumbnail || hotel.gallery?.[0] || "",
      galleryDataUrls: hotel.gallery || [],
    },
  };
}

export function buildHotelPayload({
  main,
  description,
  icons,
  policy,
  photos,
}) {
  const normalizedPolicy = normalizeHotelPolicy(policy);

  return {
    name: main?.nameEn || main?.nameAr || "",
    nameAr: main?.nameAr || "",
    description: description?.descriptionEn || "",
    descriptionAr: description?.descriptionAr || "",
    location: main?.location || "",
    city: main?.city || "",
    country: main?.country || "",
    postCode: main?.postCode || "",
    lat: main?.lat ?? undefined,
    lng: main?.lng ?? undefined,
    stars: main?.stars || 3,
    category: main?.category || "",
    thumbnail: photos?.mainPhotoDataUrl || "",
    logo: main?.logoDataUrl || "",
    gallery: photos?.galleryDataUrls || [],
    policy: buildPolicyText(normalizedPolicy, "en"),
    policyAr: buildPolicyText(normalizedPolicy, "ar"),
    policyDetails: normalizedPolicy,
    selectedIcons: icons?.selectedIcons || [],
  };
}
