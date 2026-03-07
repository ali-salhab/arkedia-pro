import { useState, useEffect } from "react";

const initialFormState = {
  // Basic Information
  name: "",
  description: "",
  type: "hotel", // hotel, resort, boutique, hostel, motel, villa

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

  // Details
  stars: 3,
  checkInTime: "14:00",
  checkOutTime: "11:00",
  totalRooms: "",
  totalFloors: "",
  yearBuilt: "",
  lastRenovated: "",

  // Pricing
  priceRange: "mid", // budget, mid, luxury, ultra-luxury
  currency: "USD",
  minPrice: "",
  maxPrice: "",

  // Amenities
  amenities: {
    wifi: false,
    parking: false,
    pool: false,
    spa: false,
    gym: false,
    restaurant: false,
    bar: false,
    roomService: false,
    laundry: false,
    airConditioning: false,
    heating: false,
    elevator: false,
    wheelchairAccessible: false,
    petFriendly: false,
    businessCenter: false,
    conferenceRooms: false,
    airport_shuttle: false,
    concierge: false,
    safetyBox: false,
    childCare: false,
  },

  // Policies
  policies: {
    smokingAllowed: false,
    petsAllowed: false,
    partiesAllowed: false,
    cancellationPolicy: "flexible", // flexible, moderate, strict, non-refundable
    depositRequired: false,
    depositAmount: "",
    childrenPolicy: "allowed", // allowed, not-allowed, extra-charge
    extraBedAvailable: false,
  },

  // Media
  images: [],

  // Status
  status: "active", // active, inactive, under-maintenance
  featured: false,
};

const inputStyle = {
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#1e293b",
  width: "100%",
  fontSize: 14,
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 500,
  color: "#475569",
  fontSize: 13,
};

const sectionStyle = {
  marginBottom: 24,
  padding: 16,
  background: "#f8fafc",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
};

const sectionTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 16,
  color: "#1e293b",
  borderBottom: "1px solid #e2e8f0",
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

export default function HotelFormModal({
  open,
  onClose,
  onSave,
  hotel = null,
}) {
  const [form, setForm] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hotel) {
      setForm({ ...initialFormState, ...hotel });
    } else {
      setForm(initialFormState);
    }
  }, [hotel, open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityChange = (key) => {
    setForm((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: !prev.amenities[key] },
    }));
  };

  const handlePolicyChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      policies: { ...prev.policies, [key]: value },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error("Error saving hotel:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "location", label: "Location" },
    { id: "details", label: "Details" },
    { id: "amenities", label: "Amenities" },
    { id: "policies", label: "Policies" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Basic Information</h4>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Hotel Name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter hotel name"
                />
              </div>
              <div>
                <label style={labelStyle}>Hotel Type</label>
                <select
                  style={inputStyle}
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="boutique">Boutique Hotel</option>
                  <option value="hostel">Hostel</option>
                  <option value="motel">Motel</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment Hotel</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe your hotel..."
              />
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Star Rating</label>
                <select
                  style={inputStyle}
                  value={form.stars}
                  onChange={(e) =>
                    handleChange("stars", parseInt(e.target.value))
                  }
                >
                  <option value={1}>⭐ 1 Star</option>
                  <option value={2}>⭐⭐ 2 Stars</option>
                  <option value={3}>⭐⭐⭐ 3 Stars</option>
                  <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  style={inputStyle}
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="under-maintenance">Under Maintenance</option>
                </select>
              </div>
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
                  placeholder="info@hotel.com"
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
                placeholder="https://www.hotel.com"
              />
            </div>
            <div style={{ marginTop: 16, ...checkboxContainerStyle }}>
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => handleChange("featured", e.target.checked)}
              />
              <label htmlFor="featured" style={{ color: "#334155" }}>
                Featured Hotel (Show in homepage)
              </label>
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
              GPS Coordinates (Optional)
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

      case "details":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Hotel Details</h4>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Total Rooms</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.totalRooms}
                  onChange={(e) => handleChange("totalRooms", e.target.value)}
                  placeholder="100"
                />
              </div>
              <div>
                <label style={labelStyle}>Total Floors</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.totalFloors}
                  onChange={(e) => handleChange("totalFloors", e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Check-in Time</label>
                <input
                  style={inputStyle}
                  type="time"
                  value={form.checkInTime}
                  onChange={(e) => handleChange("checkInTime", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Check-out Time</label>
                <input
                  style={inputStyle}
                  type="time"
                  value={form.checkOutTime}
                  onChange={(e) => handleChange("checkOutTime", e.target.value)}
                />
              </div>
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Year Built</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.yearBuilt}
                  onChange={(e) => handleChange("yearBuilt", e.target.value)}
                  placeholder="2010"
                />
              </div>
              <div>
                <label style={labelStyle}>Last Renovated</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.lastRenovated}
                  onChange={(e) =>
                    handleChange("lastRenovated", e.target.value)
                  }
                  placeholder="2023"
                />
              </div>
            </div>

            <h4 style={{ ...sectionTitleStyle, marginTop: 24 }}>Pricing</h4>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Price Range</label>
                <select
                  style={inputStyle}
                  value={form.priceRange}
                  onChange={(e) => handleChange("priceRange", e.target.value)}
                >
                  <option value="budget">Budget ($)</option>
                  <option value="mid">Mid-Range ($$)</option>
                  <option value="luxury">Luxury ($$$)</option>
                  <option value="ultra-luxury">Ultra Luxury ($$$$)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Currency</label>
                <select
                  style={inputStyle}
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="SAR">SAR (﷼)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Minimum Price / Night</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.minPrice}
                  onChange={(e) => handleChange("minPrice", e.target.value)}
                  placeholder="50"
                />
              </div>
              <div>
                <label style={labelStyle}>Maximum Price / Night</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.maxPrice}
                  onChange={(e) => handleChange("maxPrice", e.target.value)}
                  placeholder="500"
                />
              </div>
            </div>
          </div>
        );

      case "amenities":
        const amenityGroups = {
          General: [
            "wifi",
            "parking",
            "elevator",
            "airConditioning",
            "heating",
          ],
          Recreation: ["pool", "spa", "gym"],
          Dining: ["restaurant", "bar", "roomService"],
          Services: [
            "laundry",
            "concierge",
            "airport_shuttle",
            "businessCenter",
            "conferenceRooms",
          ],
          Accessibility: [
            "wheelchairAccessible",
            "petFriendly",
            "childCare",
            "safetyBox",
          ],
        };

        const amenityLabels = {
          wifi: "Free WiFi",
          parking: "Parking",
          pool: "Swimming Pool",
          spa: "Spa & Wellness",
          gym: "Fitness Center",
          restaurant: "Restaurant",
          bar: "Bar/Lounge",
          roomService: "Room Service",
          laundry: "Laundry Service",
          airConditioning: "Air Conditioning",
          heating: "Heating",
          elevator: "Elevator",
          wheelchairAccessible: "Wheelchair Accessible",
          petFriendly: "Pet Friendly",
          businessCenter: "Business Center",
          conferenceRooms: "Conference Rooms",
          airport_shuttle: "Airport Shuttle",
          concierge: "Concierge Service",
          safetyBox: "Safety Box",
          childCare: "Child Care",
        };

        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Hotel Amenities</h4>
            {Object.entries(amenityGroups).map(([group, keys]) => (
              <div key={group} style={{ marginBottom: 20 }}>
                <h5
                  style={{ color: "#2563eb", marginBottom: 12, fontSize: 14 }}
                >
                  {group}
                </h5>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 8,
                  }}
                >
                  {keys.map((key) => (
                    <div key={key} style={checkboxContainerStyle}>
                      <input
                        type="checkbox"
                        id={key}
                        checked={form.amenities[key] || false}
                        onChange={() => handleAmenityChange(key)}
                      />
                      <label
                        htmlFor={key}
                        style={{ color: "#334155", fontSize: 14 }}
                      >
                        {amenityLabels[key]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "policies":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Hotel Policies</h4>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Cancellation Policy</label>
                <select
                  style={inputStyle}
                  value={form.policies.cancellationPolicy}
                  onChange={(e) =>
                    handlePolicyChange("cancellationPolicy", e.target.value)
                  }
                >
                  <option value="flexible">Flexible (Free cancellation)</option>
                  <option value="moderate">Moderate (48 hours notice)</option>
                  <option value="strict">Strict (7 days notice)</option>
                  <option value="non-refundable">Non-refundable</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Children Policy</label>
                <select
                  style={inputStyle}
                  value={form.policies.childrenPolicy}
                  onChange={(e) =>
                    handlePolicyChange("childrenPolicy", e.target.value)
                  }
                >
                  <option value="allowed">Children Allowed (Free)</option>
                  <option value="extra-charge">
                    Children Allowed (Extra Charge)
                  </option>
                  <option value="not-allowed">No Children</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h5 style={{ color: "#2563eb", marginBottom: 12, fontSize: 14 }}>
                Rules
              </h5>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                }}
              >
                <div style={checkboxContainerStyle}>
                  <input
                    type="checkbox"
                    id="smokingAllowed"
                    checked={form.policies.smokingAllowed}
                    onChange={(e) =>
                      handlePolicyChange("smokingAllowed", e.target.checked)
                    }
                  />
                  <label htmlFor="smokingAllowed" style={{ color: "#334155" }}>
                    Smoking Allowed
                  </label>
                </div>
                <div style={checkboxContainerStyle}>
                  <input
                    type="checkbox"
                    id="petsAllowed"
                    checked={form.policies.petsAllowed}
                    onChange={(e) =>
                      handlePolicyChange("petsAllowed", e.target.checked)
                    }
                  />
                  <label htmlFor="petsAllowed" style={{ color: "#334155" }}>
                    Pets Allowed
                  </label>
                </div>
                <div style={checkboxContainerStyle}>
                  <input
                    type="checkbox"
                    id="partiesAllowed"
                    checked={form.policies.partiesAllowed}
                    onChange={(e) =>
                      handlePolicyChange("partiesAllowed", e.target.checked)
                    }
                  />
                  <label htmlFor="partiesAllowed" style={{ color: "#334155" }}>
                    Parties/Events Allowed
                  </label>
                </div>
                <div style={checkboxContainerStyle}>
                  <input
                    type="checkbox"
                    id="extraBedAvailable"
                    checked={form.policies.extraBedAvailable}
                    onChange={(e) =>
                      handlePolicyChange("extraBedAvailable", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="extraBedAvailable"
                    style={{ color: "#334155" }}
                  >
                    Extra Bed Available
                  </label>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h5 style={{ color: "#2563eb", marginBottom: 12, fontSize: 14 }}>
                Deposit
              </h5>
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="depositRequired"
                  checked={form.policies.depositRequired}
                  onChange={(e) =>
                    handlePolicyChange("depositRequired", e.target.checked)
                  }
                />
                <label htmlFor="depositRequired" style={{ color: "#334155" }}>
                  Deposit Required
                </label>
              </div>
              {form.policies.depositRequired && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>Deposit Amount</label>
                  <input
                    style={{ ...inputStyle, maxWidth: 200 }}
                    type="number"
                    value={form.policies.depositAmount}
                    onChange={(e) =>
                      handlePolicyChange("depositAmount", e.target.value)
                    }
                    placeholder="100"
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
          maxWidth: 800,
          maxHeight: "90vh",
          overflow: "auto",
          background: "#ffffff",
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
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2 style={{ margin: 0, color: "#1e293b" }}>
            {hotel ? "Edit Hotel" : "Add New Hotel"}
          </h2>
          <button
            className="btn"
            onClick={onClose}
            style={{ background: "#e2e8f0", color: "#475569" }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: 12,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px",
                background: activeTab === tab.id ? "#2563eb" : "#f1f5f9",
                border: "none",
                borderRadius: 8,
                color: activeTab === tab.id ? "#fff" : "#64748b",
                cursor: "pointer",
                fontWeight: 500,
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
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
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button
            className="btn"
            onClick={onClose}
            style={{ background: "#e2e8f0", color: "#475569" }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !form.name}
            style={{
              background: loading ? "#94a3b8" : "#2563eb",
              opacity: !form.name ? 0.5 : 1,
            }}
          >
            {loading ? "Saving..." : hotel ? "Update Hotel" : "Create Hotel"}
          </button>
        </div>
      </div>
    </div>
  );
}
