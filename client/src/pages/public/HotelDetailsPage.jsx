import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, Star, ChevronDown, ChevronUp, X, Check,
  Heart, Share2, BedDouble, Users, CheckCircle2, Clock,
  PawPrint, CigaretteOff, CalendarDays, Bed,
} from "lucide-react";
import {
  useGetPublicHotelDetailsQuery,
  useGetPublicHotelRoomsQuery,
  useCreatePublicBookingMutation,
} from "../../store/services/api";
import PublicNavbar from "../../components/PublicNavbar";
import PublicFooter from "../../components/PublicFooter";
import PublicAuthModal from "../../components/PublicAuthModal";
import { usePublicClientSession } from "../../hooks/usePublicClientSession";
import "leaflet/dist/leaflet.css";

/* ── helpers ── */
const starsRow = (n) =>
  n ? Array.from({ length: n }, (_, i) => <Star key={i} size={13} fill="#f59e0b" stroke="#f59e0b" />) : null;

const VIEW_AR = { sea: "بحر", pool: "مسبح", city: "مدينة", garden: "حديقة", mountain: "جبل", none: "" };
const TYPE_AR = { room: "غرفة", table: "طاولة", suite: "جناح", studio: "ستوديو", villa: "فيلا", service: "خدمة" };
const CAT_AR  = { standard: "عادية", deluxe: "ديلوكس", superior: "سوبريور", executive: "تنفيذية", presidential: "رئاسية" };
const BED_AR  = { single: "فردي", double: "مزدوج", queen: "كوين", king: "كينج", twin: "توين", sofa: "أريكة" };

const ROOM_AMENITY_LABELS = {
  wifi: "واي فاي", ac: "تكييف", tv: "تلفاز", minibar: "ميني بار",
  safe: "خزنة", balcony: "شرفة", jacuzzi: "جاكوزي", kitchenette: "مطبخ صغير",
  coffeeMaker: "ماكينة قهوة", hairDryer: "مجفف شعر", bathrobe: "بُرنس", ironing: "مكواة",
};

const AMENITY_ICONS_MAP = {
  wifi: "📶", ac: "❄️", tv: "📺", minibar: "🥤", safe: "🔒",
  balcony: "🏗️", jacuzzi: "🛁", kitchenette: "🍳", coffeeMaker: "☕",
  hairDryer: "💇", bathrobe: "🧥", ironing: "👔",
};

/* ════════════════════════════════════════════════════════════════════ */

export default function HotelDetailsPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [clientSession, setClientSession] = usePublicClientSession();
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const checkIn   = params.get("checkIn") || "";
  const checkOut  = params.get("checkOut") || "";
  const roomCount = params.get("rooms") || "1";
  const adults    = params.get("adults") || "2";
  const children  = params.get("children") || "0";

  /* Allow scrolling — overrides the dashboard's html/body/#root overflow:hidden */
  useEffect(() => {
    const els = [document.documentElement, document.body, document.getElementById("root")];
    els.forEach((el) => { if (el) el.style.overflow = "auto"; });
    return () => { els.forEach((el) => { if (el) el.style.overflow = ""; }); };
  }, []);

  const { data: hotel, isLoading: hl } = useGetPublicHotelDetailsQuery(id);
  const { data: rooms = [], isLoading: rl } = useGetPublicHotelRoomsQuery(id);

  const [activeTab, setActiveTab] = useState("overview"); // overview | rooms
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [imgIdx, setImgIdx] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingForm, setBookingForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", nationality: "", specialRequests: "" });
  const [createBooking, { isLoading: bl }] = useCreatePublicBookingMutation();
  const [bookingResult, setBookingResult] = useState(null);
  const roomsRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1;

  const minPrice = useMemo(() => {
    if (rooms.length === 0) return null;
    return Math.min(...rooms.map((r) => r.pricePerNight * (1 - (r.discount || 0) / 100)));
  }, [rooms]);

  const currency = rooms[0]?.currency || "USD";

  /* Derive policies from rooms */
  const policies = useMemo(() => {
    const hasSmoking = rooms.some((r) => r.smokingAllowed);
    const hasPets = rooms.some((r) => r.petsAllowed);
    return { smoking: hasSmoking, pets: hasPets };
  }, [rooms]);

  /* Leaflet map */
  useEffect(() => {
    if (activeTab !== "overview" || !hotel || mapInstanceRef.current) return;
    const el = mapRef.current;
    if (!el) return;
    import("leaflet").then((L) => {
      const map = L.map(el, { scrollWheelZoom: false }).setView([24.7136, 46.6753], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      L.marker([24.7136, 46.6753]).addTo(map);
      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    });
  }, [activeTab, hotel]);

  const handleBook = async () => {
    if (!selectedRoom || !bookingForm.customerName.trim()) return;
    try {
      const res = await createBooking({
        hotelId: id, roomId: selectedRoom._id,
        customerName: bookingForm.customerName.trim(),
        customerEmail: bookingForm.customerEmail.trim() || undefined,
        customerPhone: bookingForm.customerPhone.trim() || undefined,
        nationality: bookingForm.nationality.trim() || undefined,
        specialRequests: bookingForm.specialRequests.trim() || undefined,
        checkIn: checkIn || new Date().toISOString(),
        checkOut: checkOut || new Date(Date.now() + 86400000).toISOString(),
        adultsCount: Number(adults), childrenCount: Number(children),
        roomCount: Number(roomCount),
      }).unwrap();
      setBookingResult(res);
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  const scrollToRooms = () => { setActiveTab("rooms"); setTimeout(() => roomsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); };
  const icons = hotel?.selectedIcons || [];
  const isLoading = hl || rl;

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo','Tajawal',Arial,sans-serif", background: "#f3f6fb", minHeight: "100vh", paddingBottom: "80px" }}>
      <PublicNavbar
        clientSession={clientSession}
        onLogout={() => { localStorage.removeItem("public_client_session"); setClientSession(null); }}
        onOpenAuthModal={(m) => { setAuthModalMode(m || "login"); setAuthModalOpen(true); }}
      />

      {isLoading && <div style={{ paddingTop: 120, textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>جارٍ التحميل...</div>}

      {!isLoading && hotel && (
        <>
          {/* ─── Hero Image ─── */}
          <div style={{
            position: "relative", width: "100%", height: 320, overflow: "hidden",
            background: hotel.thumbnail
              ? `url(${hotel.thumbnail}) center/cover no-repeat`
              : "linear-gradient(135deg,#173f78,#1e5aad)",
            marginTop: 60,
          }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.45))" }} />
            <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", gap: "0.4rem" }}>
              {[Heart, Share2].map((Icon, i) => (
                <button key={i} style={floatBtnStyle}><Icon size={i === 0 ? 18 : 16} /></button>
              ))}
            </div>
            <div style={{
              position: "absolute", top: "1rem", right: "1rem",
              background: "rgba(23,63,120,.85)", backdropFilter: "blur(6px)",
              borderRadius: "0.6rem", padding: "0.3rem 0.7rem",
              display: "flex", alignItems: "center", gap: "0.3rem",
              color: "white", fontSize: "0.75rem", fontWeight: 700,
            }}>
              <BedDouble size={14} /> Hotel
            </div>
          </div>

          {/* ─── Hotel Name / Stars / Location ─── */}
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.2rem 1rem 0" }}>
            {hotel.stars > 0 && <div style={{ display: "flex", gap: 2, marginBottom: "0.35rem" }}>{starsRow(hotel.stars)}</div>}
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#111827", margin: "0 0 0.4rem" }}>{hotel.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#64748b", fontSize: "0.85rem" }}>
              <MapPin size={15} /> <span>{[hotel.city, hotel.country].filter(Boolean).join(", ")}</span>
            </div>

            {/* Icons row */}
            {icons.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "0.8rem" }}>
                {icons.map((ic) => (
                  <span key={ic._id} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem", color: "#475569" }}>
                    {ic.imageUrl ? <img src={ic.imageUrl} alt="" style={{ width: 18, height: 18, objectFit: "contain" }} /> : <span>•</span>}
                    {ic.labelAr || ic.label}
                  </span>
                ))}
              </div>
            )}

            {/* Feature badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.6rem" }}>
              <FBadge color="#059669" text="إلغاء مجاني" />
              <FBadge color="#475569" text="ادفع في الفندق" muted />
              <FBadge color="#475569" text="Book @ Travky.com" muted />
            </div>

            {/* ─── Tabs ─── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "1.2rem" }}>
              {["overview", "rooms"].map((t) => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: "0.8rem", borderRadius: "1rem", fontFamily: "inherit",
                  fontSize: "0.95rem", fontWeight: 800, cursor: "pointer",
                  background: activeTab === t ? "#173f78" : "#f1f5f9",
                  color: activeTab === t ? "white" : "#475569",
                  border: "none", transition: "all 0.2s",
                }}>
                  {t === "overview" ? "نظرة عامة" : "الغرف"}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Tab Content ─── */}
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.2rem 1rem 0" }}>

            {/* ══ OVERVIEW TAB ══ */}
            {activeTab === "overview" && (
              <>
                {/* About */}
                {hotel.description && (
                  <Section title="عن الفندق">
                    <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.8, margin: 0 }}>{hotel.description}</p>
                  </Section>
                )}

                {/* Amenities */}
                {icons.length > 0 && (
                  <Section title="أبرز المرافق">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                      {icons.map((ic) => (
                        <div key={ic._id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: "120px" }}>
                          {ic.imageUrl
                            ? <img src={ic.imageUrl} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
                            : <span style={{ fontSize: "1.2rem" }}>•</span>}
                          <span style={{ fontSize: "0.88rem", color: "#374151", fontWeight: 600 }}>{ic.labelAr || ic.label}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Map */}
                <Section title="الموقع">
                  <div ref={mapRef} id="hotel-map"
                    style={{ width: "100%", height: 260, borderRadius: "1rem", overflow: "hidden", background: "#e2e8f0" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.6rem", color: "#64748b", fontSize: "0.82rem" }}>
                    <MapPin size={14} />
                    <span>{[hotel.city, hotel.country].filter(Boolean).join(", ")}</span>
                  </div>
                </Section>

                {/* Hotel info / policies */}
                <Section title="معلومات الفندق">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                    <PolicyRow icon={<Clock size={18} style={{ color: "#173f78" }} />} text="الدخول: 14:00 • الخروج: 12:00" />
                    <PolicyRow icon={<PawPrint size={18} style={{ color: "#173f78" }} />} text={policies.pets ? "مسموح بالحيوانات" : "غير مسموح بالحيوانات"} />
                    <PolicyRow icon={<CigaretteOff size={18} style={{ color: "#173f78" }} />} text={policies.smoking ? "يوجد غرف مدخنين" : "ممنوع التدخين"} />
                  </div>
                </Section>
              </>
            )}

            {/* ══ ROOMS TAB ══ */}
            {activeTab === "rooms" && (
              <div ref={roomsRef}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#173f78", margin: "0 0 0.3rem" }}>اختر غرفتك</h2>
                <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "0 0 1rem" }}>اضغط على الغرفة لعرض تفاصيلها واختياراتها</p>

                {rooms.length === 0 && (
                  <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb", color: "#94a3b8" }}>
                    <BedDouble size={40} style={{ margin: "0 auto 0.8rem", opacity: 0.3 }} />
                    <p style={{ fontWeight: 700, color: "#64748b" }}>لا توجد غرف متاحة حالياً</p>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {rooms.map((room) => {
                    const isOpen = expandedRoom === room._id;
                    const imgs = room.images?.length ? room.images : room.thumbnail ? [room.thumbnail] : [];
                    const ci = imgIdx[room._id] || 0;
                    const activeAm = room.amenities ? Object.entries(room.amenities).filter(([, v]) => v) : [];
                    const price = room.pricePerNight * (1 - (room.discount || 0) / 100);
                    const viewLabel = room.view && room.view !== "none" ? VIEW_AR[room.view] : null;
                    const typeLabel = TYPE_AR[room.type] || room.type;

                    return (
                      <div key={room._id} style={{ background: "white", borderRadius: "1rem", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                        {/* Collapsed header */}
                        <button
                          onClick={() => setExpandedRoom(isOpen ? null : room._id)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: "0.8rem",
                            padding: "0.8rem 1rem", border: "none", background: "none",
                            cursor: "pointer", fontFamily: "inherit", textAlign: "right",
                          }}
                        >
                          {room.thumbnail ? (
                            <img src={room.thumbnail} alt="" style={{ width: 70, height: 70, borderRadius: "0.7rem", objectFit: "cover", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 70, height: 70, borderRadius: "0.7rem", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <BedDouble size={24} style={{ color: "#94a3b8" }} />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111827" }}>{room.name || room.number}</div>
                            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
                              <span style={tagStyle("#eff6ff", "#173f78")}>{typeLabel}</span>
                              {viewLabel && <span style={tagStyle("#ecfdf5", "#059669")}>{viewLabel} View</span>}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0, color: "#64748b" }}>
                            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111827" }}>{room.capacity || 1}</span>
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </button>

                        {/* Expanded content */}
                        {isOpen && (
                          <div style={{ borderTop: "1px solid #f1f5f9" }}>
                            {/* Image carousel */}
                            {imgs.length > 0 && (
                              <div style={{ position: "relative", height: 280, overflow: "hidden", background: "#e2e8f0" }}>
                                <img src={imgs[ci]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                {/* Type badge */}
                                <div style={{
                                  position: "absolute", top: "0.8rem", right: "0.8rem",
                                  background: "rgba(0,0,0,.6)", borderRadius: "0.5rem",
                                  padding: "0.25rem 0.6rem", color: "white", fontSize: "0.72rem", fontWeight: 700,
                                }}>{typeLabel}</div>
                                {/* Dots */}
                                {imgs.length > 1 && (
                                  <div style={{ position: "absolute", bottom: "0.8rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
                                    {imgs.map((_, idx) => (
                                      <button key={idx} onClick={() => setImgIdx((p) => ({ ...p, [room._id]: idx }))}
                                        style={{ width: idx === ci ? 20 : 8, height: 8, borderRadius: 4, border: "none", background: idx === ci ? "white" : "rgba(255,255,255,.5)", cursor: "pointer", transition: "width .2s" }} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Room detail rows */}
                            <div style={{ padding: "1rem 1.2rem" }}>
                              {/* Capacity badges */}
                              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
                                <span style={{ ...capBadge, background: "#173f78", color: "white" }}>
                                  <Users size={14} /> {room.capacity || 2} <span style={{ fontSize: "0.7rem" }}>👶</span> {room.beds || 1}
                                </span>
                                {room.beds > 1 && (
                                  <span style={{ ...capBadge, background: "#f1f5f9", color: "#475569" }}>
                                    <Bed size={14} /> extra <span style={{ fontSize: "0.7rem" }}>🧳</span> {room.beds - 1}
                                  </span>
                                )}
                              </div>

                              {/* Amenities */}
                              {activeAm.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.8rem" }}>
                                  {activeAm.map(([key]) => (
                                    <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.78rem", color: "#475569" }}>
                                      {AMENITY_ICONS_MAP[key] || "•"} {ROOM_AMENITY_LABELS[key] || key}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Rate card */}
                              <div style={{
                                display: "flex", gap: "0.8rem", overflowX: "auto",
                                paddingBottom: "0.5rem",
                                scrollSnapType: "x mandatory",
                              }}>
                                <RateCard
                                  room={room}
                                  price={price}
                                  nights={nights}
                                  roomCount={Number(roomCount)}
                                  onBook={() => setSelectedRoom(room)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Sticky Footer ─── */}
      {!isLoading && hotel && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: "white", borderTop: "1px solid #e5e7eb",
          boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0.7rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ textAlign: "right" }}>
              {minPrice != null && (
                <>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>ابتداءً من</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#111827" }}>
                    {currency} {Math.round(minPrice)}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>شامل الضرائب والرسوم</div>
                </>
              )}
            </div>
            <button onClick={scrollToRooms} style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.7rem 1.5rem", background: "#173f78", color: "white",
              border: "none", borderRadius: "1rem", fontWeight: 800,
              fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit",
            }}>
              <CalendarDays size={16} /> اختر غرفة
            </button>
          </div>
        </div>
      )}

      <PublicFooter />

      {/* ─── Booking Modal ─── */}
      {selectedRoom && !bookingResult && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelectedRoom(null)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
          <div dir="rtl" onClick={(e) => e.stopPropagation()} style={{
            position: "relative", background: "white", borderRadius: "1.5rem", width: "100%", maxWidth: 480,
            maxHeight: "90vh", overflowY: "auto", padding: "1.5rem",
            fontFamily: "'Cairo','Tajawal',Arial,sans-serif", animation: "bm-in .3s ease", margin: "0 1rem",
          }}>
            <style>{`@keyframes bm-in{from{transform:scale(.95) translateY(20px);opacity:0}to{transform:none;opacity:1}}`}</style>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#111827", margin: 0 }}>تأكيد الحجز</h2>
              <button onClick={() => setSelectedRoom(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} style={{ color: "#94a3b8" }} /></button>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: "1rem", padding: "0.8rem 1rem", marginBottom: "1rem", border: "1px solid #e5e7eb" }}>
              <div style={{ fontWeight: 800, color: "#111827", fontSize: "0.95rem" }}>{selectedRoom.name || selectedRoom.number}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>
                {nights} ليلة • {Math.round(selectedRoom.pricePerNight * (1 - (selectedRoom.discount || 0) / 100) * nights * Number(roomCount))} {selectedRoom.currency}
              </div>
            </div>
            {[
              { k: "customerName", l: "الاسم الكامل *", t: "text" },
              { k: "customerEmail", l: "البريد الإلكتروني", t: "email" },
              { k: "customerPhone", l: "رقم الهاتف", t: "tel" },
              { k: "nationality", l: "الجنسية", t: "text" },
            ].map(({ k, l, t }) => (
              <div key={k} style={{ marginBottom: "0.8rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "0.3rem" }}>{l}</label>
                <input type={t} value={bookingForm[k]} onChange={(e) => setBookingForm({ ...bookingForm, [k]: e.target.value })}
                  style={modalInputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "0.3rem" }}>طلبات خاصة</label>
              <textarea value={bookingForm.specialRequests} onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                rows={3} style={{ ...modalInputStyle, resize: "vertical" }} />
            </div>
            <button onClick={handleBook} disabled={!bookingForm.customerName.trim() || bl}
              style={{
                width: "100%", padding: "0.75rem",
                background: bookingForm.customerName.trim() ? "#173f78" : "#94a3b8",
                color: "white", border: "none", borderRadius: "1rem", fontWeight: 800,
                fontSize: "0.95rem", cursor: bookingForm.customerName.trim() ? "pointer" : "not-allowed",
                fontFamily: "inherit", opacity: bl ? 0.7 : 1,
              }}>{bl ? "جارٍ الحجز..." : "تأكيد الحجز"}</button>
          </div>
        </div>
      )}

      {/* ─── Booking Success ─── */}
      {bookingResult && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
          <div dir="rtl" style={{
            position: "relative", background: "white", borderRadius: "1.5rem", width: "100%", maxWidth: 420,
            padding: "2rem 1.5rem", textAlign: "center", fontFamily: "'Cairo','Tajawal',Arial,sans-serif",
            animation: "bm-in .3s ease", margin: "0 1rem",
          }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Check size={30} style={{ color: "#16a34a" }} />
            </div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#111827", margin: "0 0 0.5rem" }}>تم الحجز بنجاح!</h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1rem" }}>رقم الحجز الخاص بك</p>
            <div style={{ background: "#f8fafc", borderRadius: "1rem", padding: "1rem", border: "2px dashed #173f78", marginBottom: "1.2rem" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#173f78", letterSpacing: "0.1em" }}>{bookingResult.reference}</div>
            </div>
            <div style={{ textAlign: "right", background: "#f8fafc", borderRadius: "0.8rem", padding: "0.8rem 1rem", marginBottom: "1.2rem", fontSize: "0.82rem", color: "#374151", lineHeight: 2 }}>
              <div><strong>الفندق:</strong> {bookingResult.hotelName}</div>
              <div><strong>الغرفة:</strong> {bookingResult.roomName}</div>
              <div><strong>الوصول:</strong> {new Date(bookingResult.checkIn).toLocaleDateString("ar-EG")}</div>
              <div><strong>المغادرة:</strong> {new Date(bookingResult.checkOut).toLocaleDateString("ar-EG")}</div>
              <div><strong>عدد الليالي:</strong> {bookingResult.nights}</div>
              <div><strong>الإجمالي:</strong> {bookingResult.total} {bookingResult.currency}</div>
            </div>
            <Link to="/" style={{
              display: "block", padding: "0.7rem", background: "#173f78", color: "white",
              borderRadius: "1rem", fontWeight: 800, fontSize: "0.9rem", textDecoration: "none", fontFamily: "inherit",
            }}>العودة للرئيسية</Link>
          </div>
        </div>
      )}

      <PublicAuthModal
        open={authModalOpen}
        mode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onModeChange={(m) => setAuthModalMode(m)}
        onAuthenticated={(s) => { setClientSession(s); setAuthModalOpen(false); }}
      />

      <style>{`@media(max-width:640px){.hotel-room-card-inner{flex-direction:column!important}}`}</style>
    </div>
  );
}

/* ═══════════════════ Sub-components ═══════════════════ */

function Section({ title, children }) {
  return (
    <div style={{ background: "white", borderRadius: "1rem", padding: "1.2rem 1.3rem", marginBottom: "1rem", border: "1px solid #e5e7eb" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 900, color: "#111827", margin: "0 0 0.8rem" }}>{title}</h3>
      {children}
    </div>
  );
}

function PolicyRow({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.88rem", color: "#374151" }}>
      {icon} <span>{text}</span>
    </div>
  );
}

function FBadge({ color, text, muted }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.78rem", fontWeight: muted ? 600 : 700, color }}>
      <CheckCircle2 size={14} style={muted ? { color: "#94a3b8" } : undefined} /> {text}
    </span>
  );
}

function RateCard({ room, price, nights, roomCount, onBook }) {
  const total = Math.round(price * nights * roomCount);
  return (
    <div style={{
      minWidth: 220, flexShrink: 0, scrollSnapAlign: "start",
      border: "1.5px solid #e5e7eb", borderRadius: "1rem", padding: "1rem",
      display: "flex", flexDirection: "column", gap: "0.5rem",
    }}>
      <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#111827" }}>
        Bed &amp; Breakfast
      </div>
      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>• Bed &amp; Breakfast (BB)</div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
        <CheckCircle2 size={13} /> إلغاء مجاني
      </div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#111827" }}>
            {room.currency} {Math.round(price)}
          </div>
          <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>لكل ليلة</div>
        </div>
        <button onClick={onBook} style={{
          display: "flex", alignItems: "center", gap: "0.3rem",
          padding: "0.5rem 1rem", background: "#173f78", color: "white",
          border: "none", borderRadius: "0.7rem", fontWeight: 800,
          fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit",
        }}>احجز</button>
      </div>
    </div>
  );
}

/* ═══════════════════ Styles ═══════════════════ */

const floatBtnStyle = {
  width: 36, height: 36, borderRadius: "50%", border: "none",
  background: "rgba(255,255,255,.9)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "#64748b",
};

const tagStyle = (bg, color) => ({
  fontSize: "0.72rem", fontWeight: 700, background: bg,
  color, padding: "0.15rem 0.5rem", borderRadius: "0.4rem",
});

const capBadge = {
  display: "inline-flex", alignItems: "center", gap: "0.3rem",
  padding: "0.35rem 0.7rem", borderRadius: "2rem",
  fontSize: "0.78rem", fontWeight: 700,
};

const modalInputStyle = {
  width: "100%", padding: "0.6rem 0.8rem",
  border: "1.5px solid #e2e8f0", borderRadius: "0.7rem",
  fontSize: "0.88rem", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box",
};
