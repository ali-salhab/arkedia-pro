import { useState, useEffect } from "react";

const initialFormState = {
  name: "",
  description: "",
  type: "tour",
  category: "outdoor",

  // Location
  address: "",
  city: "",
  state: "",
  country: "",
  latitude: "",
  longitude: "",

  // Contact
  phone: "",
  email: "",
  website: "",

  // Details
  duration: "",
  durationUnit: "hours",
  groupSize: "",
  minAge: "",
  difficulty: "easy",
  language: "english",

  // Pricing
  currency: "USD",
  pricePerPerson: "",
  priceGroup: "",
  pricingModel: "per-person",
  depositRequired: false,
  depositAmount: "",

  // Features
  features: {
    guideIncluded: false,
    transportIncluded: false,
    mealIncluded: false,
    equipmentIncluded: false,
    insuranceIncluded: false,
    photoIncluded: false,
    hotelPickup: false,
    wheelchairAccessible: false,
    childFriendly: false,
    petFriendly: false,
  },

  // Requirements
  requirements: {
    fitnessLevel: "none",
    minimumAge: "",
    whatToBring: "",
    dressCode: "",
  },

  // Schedule
  schedule: {
    availableDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    startTimes: ["09:00"],
    advanceBookingDays: 1,
    cancellationPolicy: "flexible",
  },

  // Status
  status: "active",
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
  padding: "6px 0",
};

export default function ActivityFormModal({
  open,
  onClose,
  onSave,
  activity = null,
}) {
  const [form, setForm] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      setForm({ ...initialFormState, ...activity });
    } else {
      setForm(initialFormState);
    }
    setActiveTab("basic");
  }, [activity, open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (key) => {
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] },
    }));
  };

  const handleScheduleDayChange = (day) => {
    setForm((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        availableDays: {
          ...prev.schedule.availableDays,
          [day]: !prev.schedule.availableDays[day],
        },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "basic", label: "🎯 Basic" },
    { id: "location", label: "📍 Location" },
    { id: "details", label: "📋 Details" },
    { id: "features", label: "✅ Features" },
    { id: "schedule", label: "� Schedule" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Basic Information</h4>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Activity Name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Desert Safari, City Tour"
                />
              </div>
              <div>
                <label style={labelStyle}>Activity Type</label>
                <select
                  style={inputStyle}
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  <option value="tour">Tour</option>
                  <option value="adventure">Adventure</option>
                  <option value="cultural">Cultural</option>
                  <option value="water-sports">Water Sports</option>
                  <option value="sightseeing">Sightseeing</option>
                  <option value="food-tour">Food Tour</option>
                  <option value="workshop">Workshop</option>
                  <option value="sport">Sport</option>
                  <option value="wellness">Wellness & Spa</option>
                  <option value="nightlife">Nightlife</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ ...gridStyle, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  style={inputStyle}
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                >
                  <option value="outdoor">Outdoor</option>
                  <option value="indoor">Indoor</option>
                  <option value="virtual">Virtual</option>
                  <option value="mixed">Mixed</option>
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
                  <option value="seasonal">Seasonal</option>
                  <option value="sold-out">Sold Out</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the activity..."
              />
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 24 }}>
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="actFeatured"
                  checked={form.featured}
                  onChange={(e) => handleChange("featured", e.target.checked)}
                />
                <label
                  htmlFor="actFeatured"
                  style={{ color: "#334155", fontWeight: 500 }}
                >
                  Mark as Featured
                </label>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h5
                style={{
                  color: "#2563eb",
                  marginBottom: 12,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Pricing
              </h5>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Pricing Model</label>
                  <select
                    style={inputStyle}
                    value={form.pricingModel}
                    onChange={(e) =>
                      handleChange("pricingModel", e.target.value)
                    }
                  >
                    <option value="per-person">Per Person</option>
                    <option value="per-group">Per Group</option>
                    <option value="per-hour">Per Hour</option>
                    <option value="flat-rate">Flat Rate</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select
                    style={inputStyle}
                    value={form.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AED">AED</option>
                    <option value="SAR">SAR</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Price per Person</label>
                  <input
                    style={inputStyle}
                    type="number"
                    value={form.pricePerPerson}
                    onChange={(e) =>
                      handleChange("pricePerPerson", e.target.value)
                    }
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Group Price (optional)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    value={form.priceGroup}
                    onChange={(e) => handleChange("priceGroup", e.target.value)}
                    placeholder="e.g. 300"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "location":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Location</h4>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Street Address</label>
              <input
                style={inputStyle}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Meeting point / pickup address"
              />
            </div>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>City</label>
                <input
                  style={inputStyle}
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <label style={labelStyle}>State / Region</label>
                <input
                  style={inputStyle}
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="State or region"
                />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <input
                  style={inputStyle}
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <h5
                style={{
                  color: "#2563eb",
                  marginBottom: 12,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Contact Information
              </h5>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    style={inputStyle}
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="activity@example.com"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input
                    style={inputStyle}
                    value={form.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "details":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Activity Details</h4>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Duration</label>
                <input
                  style={inputStyle}
                  value={form.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  placeholder="e.g. 2, 3.5"
                  type="number"
                />
              </div>
              <div>
                <label style={labelStyle}>Duration Unit</label>
                <select
                  style={inputStyle}
                  value={form.durationUnit}
                  onChange={(e) => handleChange("durationUnit", e.target.value)}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Max Group Size</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.groupSize}
                  onChange={(e) => handleChange("groupSize", e.target.value)}
                  placeholder="e.g. 15"
                />
              </div>
              <div>
                <label style={labelStyle}>Minimum Age</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.minAge}
                  onChange={(e) => handleChange("minAge", e.target.value)}
                  placeholder="e.g. 12"
                />
              </div>
              <div>
                <label style={labelStyle}>Difficulty Level</label>
                <select
                  style={inputStyle}
                  value={form.difficulty}
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Language</label>
                <select
                  style={inputStyle}
                  value={form.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="arabic">Arabic</option>
                  <option value="french">French</option>
                  <option value="spanish">Spanish</option>
                  <option value="multilingual">Multilingual</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <h5
                style={{
                  color: "#2563eb",
                  marginBottom: 12,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Requirements
              </h5>
              <div style={gridStyle}>
                <div>
                  <label style={labelStyle}>Fitness Level Required</label>
                  <select
                    style={inputStyle}
                    value={form.requirements.fitnessLevel}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        requirements: {
                          ...p.requirements,
                          fitnessLevel: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="none">None</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>What to Bring</label>
                  <input
                    style={inputStyle}
                    value={form.requirements.whatToBring}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        requirements: {
                          ...p.requirements,
                          whatToBring: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. Sunscreen, water"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Dress Code</label>
                  <input
                    style={inputStyle}
                    value={form.requirements.dressCode}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        requirements: {
                          ...p.requirements,
                          dressCode: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. Comfortable shoes"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "features":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Included Features</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 4,
              }}
            >
              {[
                { key: "guideIncluded", label: "Professional Guide" },
                { key: "transportIncluded", label: "Transport Included" },
                { key: "mealIncluded", label: "Meal Included" },
                { key: "equipmentIncluded", label: "Equipment Provided" },
                { key: "insuranceIncluded", label: "Insurance Included" },
                { key: "photoIncluded", label: "Photos/Video Included" },
                { key: "hotelPickup", label: "Hotel Pickup" },
                { key: "wheelchairAccessible", label: "Wheelchair Accessible" },
                { key: "childFriendly", label: "Child Friendly" },
                { key: "petFriendly", label: "Pet Friendly" },
              ].map(({ key, label }) => (
                <div key={key} style={checkboxContainerStyle}>
                  <input
                    type="checkbox"
                    id={key}
                    checked={form.features[key]}
                    onChange={() => handleFeatureChange(key)}
                  />
                  <label
                    htmlFor={key}
                    style={{ color: "#334155", fontSize: 14 }}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case "schedule":
        return (
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Schedule & Booking</h4>
            <h5
              style={{
                color: "#2563eb",
                marginBottom: 12,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Available Days
            </h5>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleScheduleDayChange(day)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: form.schedule.availableDays[day]
                      ? "#2563eb"
                      : "#cbd5e1",
                    background: form.schedule.availableDays[day]
                      ? "#eff6ff"
                      : "#f8fafc",
                    color: form.schedule.availableDays[day]
                      ? "#2563eb"
                      : "#64748b",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: 13,
                    textTransform: "capitalize",
                  }}
                >
                  {day.slice(0, 3).toUpperCase()}
                </button>
              ))}
            </div>

            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Advance Booking (days)</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={form.schedule.advanceBookingDays}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      schedule: {
                        ...p.schedule,
                        advanceBookingDays: e.target.value,
                      },
                    }))
                  }
                  placeholder="1"
                />
              </div>
              <div>
                <label style={labelStyle}>Cancellation Policy</label>
                <select
                  style={inputStyle}
                  value={form.schedule.cancellationPolicy}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      schedule: {
                        ...p.schedule,
                        cancellationPolicy: e.target.value,
                      },
                    }))
                  }
                >
                  <option value="flexible">Flexible (24h)</option>
                  <option value="moderate">Moderate (48h)</option>
                  <option value="strict">Strict (7 days)</option>
                  <option value="non-refundable">Non-Refundable</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="actDeposit"
                  checked={form.depositRequired}
                  onChange={(e) =>
                    handleChange("depositRequired", e.target.checked)
                  }
                />
                <label
                  htmlFor="actDeposit"
                  style={{ color: "#334155", fontWeight: 500 }}
                >
                  Deposit Required
                </label>
              </div>
              {form.depositRequired && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>Deposit Amount</label>
                  <input
                    style={{ ...inputStyle, maxWidth: 200 }}
                    type="number"
                    value={form.depositAmount}
                    onChange={(e) =>
                      handleChange("depositAmount", e.target.value)
                    }
                    placeholder="e.g. 20"
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
        background: "rgba(0,0,0,0.5)",
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
            {activity ? "Edit Activity" : "Add New Activity"}
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
                padding: "10px 18px",
                background: activeTab === tab.id ? "#2563eb" : "#f1f5f9",
                border: "none",
                borderRadius: 8,
                color: activeTab === tab.id ? "#fff" : "#64748b",
                cursor: "pointer",
                fontWeight: 500,
                whiteSpace: "nowrap",
                fontSize: 13,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

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
            style={{ background: "#2563eb", opacity: !form.name ? 0.5 : 1 }}
          >
            {loading
              ? "Saving..."
              : activity
                ? "Update Activity"
                : "Create Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}
