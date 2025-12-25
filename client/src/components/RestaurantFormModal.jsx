import { useState, useEffect } from "react";

const initialFormState = {
  // Basic Information
  name: "",
  description: "",
  cuisineType: "international", // international, italian, asian, middle-eastern, american, french, indian, mexican, etc.
  restaurantType: "fine-dining", // fine-dining, casual, fast-food, cafe, buffet, food-truck, bar-restaurant

  // Location
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  latitude: "",
  longitude: "",

  // Contact
  phone: "",
  email: "",
  website: "",

  // Capacity & Details
  totalTables: "",
  totalSeats: "",
  privateRooms: "",
  outdoorSeating: false,
  outdoorSeats: "",
  floors: 1,

  // Operating Hours
  operatingHours: {
    monday: { open: "11:00", close: "22:00", closed: false },
    tuesday: { open: "11:00", close: "22:00", closed: false },
    wednesday: { open: "11:00", close: "22:00", closed: false },
    thursday: { open: "11:00", close: "22:00", closed: false },
    friday: { open: "11:00", close: "23:00", closed: false },
    saturday: { open: "11:00", close: "23:00", closed: false },
    sunday: { open: "12:00", close: "21:00", closed: false },
  },

  // Pricing
  priceRange: "mid", // budget, mid, upscale, fine-dining
  currency: "USD",
  averagePrice: "",
  minimumOrder: "",

  // Services
  services: {
    dineIn: true,
    takeaway: false,
    delivery: false,
    catering: false,
    privateEvents: false,
    liveMusic: false,
    happyHour: false,
    brunch: false,
    lateNight: false,
  },

  // Amenities
  amenities: {
    wifi: false,
    parking: false,
    valetParking: false,
    wheelchairAccessible: false,
    highChairs: false,
    kidsMenu: false,
    petsAllowed: false,
    smokingArea: false,
    airConditioning: false,
    heatedPatio: false,
    tvScreens: false,
    liveKitchenView: false,
  },

  // Dietary Options
  dietaryOptions: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    halal: false,
    kosher: false,
    organic: false,
    locallySourced: false,
  },

  // Reservation Settings
  reservationSettings: {
    acceptsReservations: true,
    reservationRequired: false,
    maxPartySize: 20,
    advanceBookingDays: 30,
    cancellationPolicy: "flexible", // flexible, moderate, strict
    depositRequired: false,
    depositAmount: "",
  },

  // Payment
  paymentMethods: {
    cash: true,
    creditCard: true,
    debitCard: true,
    applePay: false,
    googlePay: false,
    crypto: false,
  },

  // Rating & Awards
  rating: "",
  michelinStars: 0,
  awards: [],

  // Media
  images: [],
  menuImages: [],

  // Status
  status: "active", // active, inactive, temporarily-closed, permanently-closed
  featured: false,
  verified: false,
};

const inputStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#e5e7eb",
  width: "100%",
  fontSize: 14,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 500,
  color: "#9ca3af",
  fontSize: 13,
};

const sectionStyle = {
  marginBottom: 24,
  padding: 16,
  background: "#1e293b",
  borderRadius: 12,
};

const sectionTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 16,
  color: "#f1f5f9",
  borderBottom: "1px solid #334155",
  paddingBottom: 8,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 16,
};

const checkboxContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 0",
};

const cuisineTypes = [
  { value: "international", label: "International" },
  { value: "italian", label: "Italian" },
  { value: "french", label: "French" },
  { value: "asian", label: "Asian Fusion" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "thai", label: "Thai" },
  { value: "indian", label: "Indian" },
  { value: "middle-eastern", label: "Middle Eastern" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "mexican", label: "Mexican" },
  { value: "american", label: "American" },
  { value: "steakhouse", label: "Steakhouse" },
  { value: "seafood", label: "Seafood" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "pizza", label: "Pizza" },
  { value: "burger", label: "Burger" },
  { value: "sushi", label: "Sushi" },
  { value: "other", label: "Other" },
];

const restaurantTypes = [
  { value: "fine-dining", label: "Fine Dining" },
  { value: "casual", label: "Casual Dining" },
  { value: "fast-casual", label: "Fast Casual" },
  { value: "fast-food", label: "Fast Food" },
  { value: "cafe", label: "Café" },
  { value: "bistro", label: "Bistro" },
  { value: "buffet", label: "Buffet" },
  { value: "food-truck", label: "Food Truck" },
  { value: "bar-restaurant", label: "Bar & Restaurant" },
  { value: "rooftop", label: "Rooftop Restaurant" },
  { value: "family", label: "Family Restaurant" },
  { value: "themed", label: "Themed Restaurant" },
];

export default function RestaurantFormModal({
  open,
  onClose,
  onSave,
  restaurant = null,
}) {
  const [form, setForm] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setForm({ ...initialFormState, ...restaurant });
    } else {
      setForm(initialFormState);
    }
  }, [restaurant, open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, key, value) => {
    setForm((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value },
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: { ...prev.operatingHours[day], [field]: value },
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error("Error saving restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📋" },
    { id: "location", label: "Location", icon: "📍" },
    { id: "capacity", label: "Capacity", icon: "🪑" },
    { id: "hours", label: "Hours", icon: "🕐" },
    { id: "services", label: "Services", icon: "🍽️" },
    { id: "amenities", label: "Amenities", icon: "✨" },
    { id: "dietary", label: "Dietary", icon: "🥗" },
    { id: "reservations", label: "Reservations", icon: "📅" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Basic Information</h4>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Restaurant Name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter restaurant name"
                />
              </div>
              <div>
                <label style={labelStyle}>Cuisine Type</label>
                <select
                  style={inputStyle}
                  value={form.cuisineType}
                  onChange={(e) => handleChange("cuisineType", e.target.value)}
                >
                  {cuisineTypes.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Restaurant Type</label>
                <select
                  style={inputStyle}
                  value={form.restaurantType}
                  onChange={(e) =>
                    handleChange("restaurantType", e.target.value)
                  }
                >
                  {restaurantTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  style={inputStyle}
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">⏸️ Inactive</option>
                  <option value="temporarily-closed">
                    🔒 Temporarily Closed
                  </option>
                  <option value="permanently-closed">
                    ❌ Permanently Closed
                  </option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe your restaurant, ambiance, specialties..."
              />
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  style={inputStyle}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="info@restaurant.com"
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Website</label>
              <input
                style={inputStyle}
                type="url"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://www.restaurant.com"
              />
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Price Range</label>
                <select
                  style={inputStyle}
                  value={form.priceRange}
                  onChange={(e) => handleChange("priceRange", e.target.value)}
                >
                  <option value="budget">$ Budget</option>
                  <option value="mid">$$ Mid-Range</option>
                  <option value="upscale">$$$ Upscale</option>
                  <option value="fine-dining">$$$$ Fine Dining</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Michelin Stars</label>
                <select
                  style={inputStyle}
                  value={form.michelinStars}
                  onChange={(e) =>
                    handleChange("michelinStars", parseInt(e.target.value))
                  }
                >
                  <option value={0}>No Michelin Stars</option>
                  <option value={1}>⭐ 1 Star</option>
                  <option value={2}>⭐⭐ 2 Stars</option>
                  <option value={3}>⭐⭐⭐ 3 Stars</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 20 }}>
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => handleChange("featured", e.target.checked)}
                />
                <label htmlFor="featured" style={{ color: "#e5e7eb" }}>
                  Featured Restaurant
                </label>
              </div>
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="verified"
                  checked={form.verified}
                  onChange={(e) => handleChange("verified", e.target.checked)}
                />
                <label htmlFor="verified" style={{ color: "#e5e7eb" }}>
                  Verified ✓
                </label>
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Location Details</h4>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Street Address *</label>
              <input
                style={inputStyle}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>City *</label>
                <input
                  style={inputStyle}
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="New York"
                />
              </div>
              <div>
                <label style={labelStyle}>State/Province</label>
                <input
                  style={inputStyle}
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="NY"
                />
              </div>
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Country *</label>
                <input
                  style={inputStyle}
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="United States"
                />
              </div>
              <div>
                <label style={labelStyle}>ZIP/Postal Code</label>
                <input
                  style={inputStyle}
                  value={form.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>
            <h4 style={{ ...sectionTitleStyle, marginTop: 24 }}>
              GPS Coordinates
            </h4>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Latitude</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  placeholder="40.7128"
                />
              </div>
              <div>
                <label style={labelStyle}>Longitude</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  placeholder="-74.0060"
                />
              </div>
            </div>
          </div>
        );

      case "capacity":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Seating Capacity</h4>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Total Tables</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.totalTables}
                  onChange={(e) => handleChange("totalTables", e.target.value)}
                  placeholder="25"
                />
              </div>
              <div>
                <label style={labelStyle}>Total Seats</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.totalSeats}
                  onChange={(e) => handleChange("totalSeats", e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Private Dining Rooms</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.privateRooms}
                  onChange={(e) => handleChange("privateRooms", e.target.value)}
                  placeholder="2"
                />
              </div>
              <div>
                <label style={labelStyle}>Number of Floors</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.floors}
                  onChange={(e) =>
                    handleChange("floors", parseInt(e.target.value))
                  }
                  placeholder="1"
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="outdoorSeating"
                  checked={form.outdoorSeating}
                  onChange={(e) =>
                    handleChange("outdoorSeating", e.target.checked)
                  }
                />
                <label htmlFor="outdoorSeating" style={{ color: "#e5e7eb" }}>
                  Outdoor Seating Available
                </label>
              </div>
              {form.outdoorSeating && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>Outdoor Seats</label>
                  <input
                    style={{ ...inputStyle, maxWidth: 200 }}
                    type="number"
                    value={form.outdoorSeats}
                    onChange={(e) =>
                      handleChange("outdoorSeats", e.target.value)
                    }
                    placeholder="30"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "hours":
        const days = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Operating Hours</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {days.map((day) => (
                <div
                  key={day}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 12,
                    background: "#0f172a",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 100,
                      textTransform: "capitalize",
                      color: "#e5e7eb",
                    }}
                  >
                    {day}
                  </div>
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <input
                      type="checkbox"
                      checked={!form.operatingHours[day]?.closed}
                      onChange={(e) =>
                        handleHoursChange(day, "closed", !e.target.checked)
                      }
                    />
                    <span style={{ color: "#9ca3af", fontSize: 13 }}>Open</span>
                  </label>
                  {!form.operatingHours[day]?.closed && (
                    <>
                      <input
                        type="time"
                        style={{ ...inputStyle, width: 120 }}
                        value={form.operatingHours[day]?.open || "11:00"}
                        onChange={(e) =>
                          handleHoursChange(day, "open", e.target.value)
                        }
                      />
                      <span style={{ color: "#9ca3af" }}>to</span>
                      <input
                        type="time"
                        style={{ ...inputStyle, width: 120 }}
                        value={form.operatingHours[day]?.close || "22:00"}
                        onChange={(e) =>
                          handleHoursChange(day, "close", e.target.value)
                        }
                      />
                    </>
                  )}
                  {form.operatingHours[day]?.closed && (
                    <span style={{ color: "#ef4444", fontSize: 13 }}>
                      Closed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "services":
        const servicesList = [
          { key: "dineIn", label: "Dine-In", icon: "🍽️" },
          { key: "takeaway", label: "Takeaway", icon: "📦" },
          { key: "delivery", label: "Delivery", icon: "🚗" },
          { key: "catering", label: "Catering Services", icon: "🎉" },
          { key: "privateEvents", label: "Private Events", icon: "🎊" },
          { key: "liveMusic", label: "Live Music", icon: "🎵" },
          { key: "happyHour", label: "Happy Hour", icon: "🍸" },
          { key: "brunch", label: "Brunch Service", icon: "🥂" },
          { key: "lateNight", label: "Late Night Menu", icon: "🌙" },
        ];
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Services Offered</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              {servicesList.map((service) => (
                <label
                  key={service.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    background: form.services[service.key]
                      ? "#22c55e20"
                      : "#0f172a",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: form.services[service.key]
                      ? "1px solid #22c55e40"
                      : "1px solid transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.services[service.key] || false}
                    onChange={(e) =>
                      handleNestedChange(
                        "services",
                        service.key,
                        e.target.checked
                      )
                    }
                  />
                  <span style={{ fontSize: 20 }}>{service.icon}</span>
                  <span
                    style={{
                      color: form.services[service.key] ? "#22c55e" : "#9ca3af",
                    }}
                  >
                    {service.label}
                  </span>
                </label>
              ))}
            </div>
            <h4 style={{ ...sectionTitleStyle, marginTop: 24 }}>
              Payment Methods
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              {Object.entries({
                cash: "💵 Cash",
                creditCard: "💳 Credit Card",
                debitCard: "💳 Debit Card",
                applePay: "🍎 Apple Pay",
                googlePay: "📱 Google Pay",
                crypto: "₿ Crypto",
              }).map(([key, label]) => (
                <label
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    background: form.paymentMethods[key]
                      ? "#3b82f620"
                      : "#0f172a",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.paymentMethods[key] || false}
                    onChange={(e) =>
                      handleNestedChange(
                        "paymentMethods",
                        key,
                        e.target.checked
                      )
                    }
                  />
                  <span
                    style={{
                      color: form.paymentMethods[key] ? "#60a5fa" : "#9ca3af",
                      fontSize: 13,
                    }}
                  >
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case "amenities":
        const amenitiesList = [
          { key: "wifi", label: "Free WiFi", icon: "📶" },
          { key: "parking", label: "Parking", icon: "🅿️" },
          { key: "valetParking", label: "Valet Parking", icon: "🚗" },
          {
            key: "wheelchairAccessible",
            label: "Wheelchair Accessible",
            icon: "♿",
          },
          { key: "highChairs", label: "High Chairs", icon: "👶" },
          { key: "kidsMenu", label: "Kids Menu", icon: "🧒" },
          { key: "petsAllowed", label: "Pets Allowed", icon: "🐕" },
          { key: "smokingArea", label: "Smoking Area", icon: "🚬" },
          { key: "airConditioning", label: "Air Conditioning", icon: "❄️" },
          { key: "heatedPatio", label: "Heated Patio", icon: "🔥" },
          { key: "tvScreens", label: "TV Screens", icon: "📺" },
          { key: "liveKitchenView", label: "Live Kitchen View", icon: "👨‍🍳" },
        ];
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Amenities</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    background: form.amenities[amenity.key]
                      ? "#8b5cf620"
                      : "#0f172a",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: form.amenities[amenity.key]
                      ? "1px solid #8b5cf640"
                      : "1px solid transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.amenities[amenity.key] || false}
                    onChange={(e) =>
                      handleNestedChange(
                        "amenities",
                        amenity.key,
                        e.target.checked
                      )
                    }
                  />
                  <span style={{ fontSize: 18 }}>{amenity.icon}</span>
                  <span
                    style={{
                      color: form.amenities[amenity.key]
                        ? "#a78bfa"
                        : "#9ca3af",
                    }}
                  >
                    {amenity.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case "dietary":
        const dietaryList = [
          {
            key: "vegetarian",
            label: "Vegetarian Options",
            icon: "🥬",
            color: "#22c55e",
          },
          {
            key: "vegan",
            label: "Vegan Options",
            icon: "🌱",
            color: "#16a34a",
          },
          {
            key: "glutenFree",
            label: "Gluten-Free Options",
            icon: "🌾",
            color: "#f59e0b",
          },
          { key: "halal", label: "Halal", icon: "☪️", color: "#10b981" },
          { key: "kosher", label: "Kosher", icon: "✡️", color: "#3b82f6" },
          { key: "organic", label: "Organic", icon: "🍃", color: "#84cc16" },
          {
            key: "locallySourced",
            label: "Locally Sourced",
            icon: "🏡",
            color: "#a855f7",
          },
        ];
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Dietary Options</h4>
            <p style={{ color: "#9ca3af", marginBottom: 16, fontSize: 13 }}>
              Select the dietary options your restaurant offers
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              {dietaryList.map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px",
                    background: form.dietaryOptions[item.key]
                      ? `${item.color}20`
                      : "#0f172a",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: form.dietaryOptions[item.key]
                      ? `2px solid ${item.color}40`
                      : "2px solid transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.dietaryOptions[item.key] || false}
                    onChange={(e) =>
                      handleNestedChange(
                        "dietaryOptions",
                        item.key,
                        e.target.checked
                      )
                    }
                  />
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <span
                    style={{
                      color: form.dietaryOptions[item.key]
                        ? item.color
                        : "#9ca3af",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case "reservations":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Reservation Settings</h4>
            <div style={{ marginBottom: 16 }}>
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="acceptsReservations"
                  checked={form.reservationSettings.acceptsReservations}
                  onChange={(e) =>
                    handleNestedChange(
                      "reservationSettings",
                      "acceptsReservations",
                      e.target.checked
                    )
                  }
                />
                <label
                  htmlFor="acceptsReservations"
                  style={{ color: "#e5e7eb" }}
                >
                  Accept Reservations
                </label>
              </div>
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="reservationRequired"
                  checked={form.reservationSettings.reservationRequired}
                  onChange={(e) =>
                    handleNestedChange(
                      "reservationSettings",
                      "reservationRequired",
                      e.target.checked
                    )
                  }
                />
                <label
                  htmlFor="reservationRequired"
                  style={{ color: "#e5e7eb" }}
                >
                  Reservation Required
                </label>
              </div>
            </div>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Maximum Party Size</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.reservationSettings.maxPartySize}
                  onChange={(e) =>
                    handleNestedChange(
                      "reservationSettings",
                      "maxPartySize",
                      parseInt(e.target.value)
                    )
                  }
                  placeholder="20"
                />
              </div>
              <div>
                <label style={labelStyle}>Advance Booking (days)</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.reservationSettings.advanceBookingDays}
                  onChange={(e) =>
                    handleNestedChange(
                      "reservationSettings",
                      "advanceBookingDays",
                      parseInt(e.target.value)
                    )
                  }
                  placeholder="30"
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Cancellation Policy</label>
              <select
                style={inputStyle}
                value={form.reservationSettings.cancellationPolicy}
                onChange={(e) =>
                  handleNestedChange(
                    "reservationSettings",
                    "cancellationPolicy",
                    e.target.value
                  )
                }
              >
                <option value="flexible">Flexible - Free cancellation</option>
                <option value="moderate">Moderate - 24 hours notice</option>
                <option value="strict">Strict - 48 hours notice</option>
              </select>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="depositRequired"
                  checked={form.reservationSettings.depositRequired}
                  onChange={(e) =>
                    handleNestedChange(
                      "reservationSettings",
                      "depositRequired",
                      e.target.checked
                    )
                  }
                />
                <label htmlFor="depositRequired" style={{ color: "#e5e7eb" }}>
                  Deposit Required for Reservations
                </label>
              </div>
              {form.reservationSettings.depositRequired && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>Deposit Amount</label>
                  <input
                    style={{ ...inputStyle, maxWidth: 200 }}
                    type="number"
                    value={form.reservationSettings.depositAmount}
                    onChange={(e) =>
                      handleNestedChange(
                        "reservationSettings",
                        "depositAmount",
                        e.target.value
                      )
                    }
                    placeholder="50"
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        overflow: "auto",
        padding: "20px 0",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          width: "90%",
          maxWidth: 900,
          maxHeight: "90vh",
          overflow: "auto",
          background: "#0f172a",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            padding: "0 0 16px 0",
            borderBottom: "1px solid #334155",
          }}
        >
          <h2 style={{ margin: 0, color: "#f1f5f9" }}>
            🍽️ {restaurant ? "Edit Restaurant" : "Add New Restaurant"}
          </h2>
          <button
            className="btn"
            onClick={onClose}
            style={{ background: "#475569" }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 20,
            borderBottom: "1px solid #334155",
            paddingBottom: 12,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 14px",
                background: activeTab === tab.id ? "#3b82f6" : "#1e293b",
                border: "none",
                borderRadius: 8,
                color: activeTab === tab.id ? "#fff" : "#9ca3af",
                cursor: "pointer",
                fontWeight: 500,
                whiteSpace: "nowrap",
                fontSize: 13,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderTabContent()}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #334155",
          }}
        >
          <button
            className="btn"
            onClick={onClose}
            style={{ background: "#475569" }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !form.name}
            style={{
              background: loading ? "#475569" : "#3b82f6",
              opacity: !form.name ? 0.5 : 1,
            }}
          >
            {loading
              ? "Saving..."
              : restaurant
              ? "Update Restaurant"
              : "Create Restaurant"}
          </button>
        </div>
      </div>
    </div>
  );
}
