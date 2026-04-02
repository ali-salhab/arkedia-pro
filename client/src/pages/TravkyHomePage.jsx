import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePublicClientSession } from "../hooks/usePublicClientSession";
import {
  Search, MapPin, Hotel, UtensilsCrossed, Compass, Package, Calendar, Users,
} from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import PublicAuthModal from "../components/PublicAuthModal";
import SearchDatePicker from "../components/SearchDatePicker";
import SearchGuestsPicker from "../components/SearchGuestsPicker";
import SearchDestinationPanel from "../components/SearchDestinationPanel";
import { useGetPublicAppSettingQuery } from "../store/services/api";

const TABS = [
  { key: "hotels",      ar: "فنادق",  Icon: Hotel },
  { key: "activities",  ar: "أنشطة",  Icon: Compass },
  { key: "packages",    ar: "باكدج",  Icon: Package },
  { key: "restaurants", ar: "مطاعم",  Icon: UtensilsCrossed },
];

export default function TravkyHomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState("hotels");
  const [destination, setDestination] = useState("");
  const [clientSession, setClientSession] = usePublicClientSession();
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const pageRef = useRef(null);

  // Search state
  const [destPanelOpen, setDestPanelOpen] = useState(false);
  const [datePanelOpen, setDatePanelOpen] = useState(false);
  const [guestPanelOpen, setGuestPanelOpen] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState({ rooms: 1, adults: 2, children: 0 });
  const [selectedDest, setSelectedDest] = useState(null);

  // Pull live data from DB via the public endpoint — no stale localStorage
  const { data: mainPhotos = {} }  = useGetPublicAppSettingQuery("main_page_photos");
  const { data: countriesRaw = [] } = useGetPublicAppSettingQuery("countries_list");
  const { data: cPhotos = {} }     = useGetPublicAppSettingQuery("countries_photos");

  // Keep legacy localStorage keys in sync so other pages (if any) still read them
  const [, setLSPhotos]    = useLocalStorage("travky_main_page_photos", {});
  const [, setLSCountries] = useLocalStorage("travky_countries_list", []);
  const [, setLSCPhotos]   = useLocalStorage("travky_countries_photos", {});
  useEffect(() => { if (mainPhotos && Object.keys(mainPhotos).length)  setLSPhotos(mainPhotos); },    [mainPhotos]);    // eslint-disable-line
  useEffect(() => { if (countriesRaw && countriesRaw.length)           setLSCountries(countriesRaw); }, [countriesRaw]); // eslint-disable-line
  useEffect(() => { if (cPhotos && Object.keys(cPhotos).length)        setLSCPhotos(cPhotos); },       [cPhotos]);       // eslint-disable-line

  const countries = Array.isArray(countriesRaw) ? countriesRaw : [];

  const heroBg = mainPhotos[activeTab]?.src || null;

  const countryCards = countries
    .filter((c) => cPhotos[c.code]?.src)
    .slice(0, 8);

  const cityCards = countries
    .flatMap((c) =>
      (c.cities || [])
        .filter((city) => cPhotos[c.code]?.cities?.[city.en]?.src)
        .map((city) => ({
          en:      city.en,
          ar:      city.ar,
          country: c.nameAr,
          src:     cPhotos[c.code].cities[city.en].src,
        }))
    )
    .slice(0, 6);

  const hasCategoryPhotos = Object.values(mainPhotos).some((v) => v?.src);
  const hasDestinations   = countryCards.length > 0 || cityCards.length > 0;
  const authUser = useSelector((s) => s.auth.user);
  const isSuperAdmin = authUser?.role === "super_admin" || authUser?.role === "superadminuser";

  const openAuthModal = (mode = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // inject scrollbar-hide style once
  const scrollHideCSS = `
    .cities-scroll::-webkit-scrollbar { display: none; }
    .cities-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    .img-zoom img { transition: transform 0.4s ease; }
    .img-zoom:hover img { transform: scale(1.08); }
    .travky-home-hero-tabs button { transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease; }
    .travky-home-hero-tabs button:hover { transform: translateY(-1px); }
    @media (max-width: 1024px) {
      .travky-home-title { font-size: 2rem !important; }
      .travky-home-subtitle { font-size: 0.95rem !important; }
      .travky-home-hero-tabs button { padding: 0.8rem 1.2rem !important; font-size: 0.9rem !important; }
    }
    @media (max-width: 768px) {
      .travky-home-hero-content { padding: 5rem 1rem 7rem !important; min-height: 460px !important; }
      .travky-home-title { font-size: 1.55rem !important; line-height: 1.18 !important; }
      .travky-home-subtitle { font-size: 0.88rem !important; }
      .travky-home-hero-tabs { gap: 0.35rem !important; width: 100% !important; padding: 0 0.3rem !important; }
      .travky-home-hero-tabs button { flex: 1 !important; padding: 0.7rem 0.2rem !important; font-size: 0.8rem !important; min-width: auto !important; border-radius: 1rem !important; }
      .travky-home-search-wrap { margin-top: -36px !important; padding: 0 0.75rem !important; }
      .hero-search { flex-direction: column !important; gap: 0 !important; padding: 1.1rem 1rem !important; border-radius: 1.6rem !important; align-items: stretch !important; }
      .hero-search .hero-dest { flex: 0 0 auto !important; }
      .hero-search > div { padding: 0.65rem 0.4rem !important; border-left: none !important; border-bottom: 1px solid #edf0f4 !important; }
      .hero-search > div:last-of-type { border-bottom: none !important; }
      .hero-search-dates { display: flex !important; border-bottom: 1px solid #edf0f4 !important; padding: 0 !important; }
      .hero-search-dates > div { flex: 1 !important; border-bottom: none !important; padding: 0.55rem 0.4rem !important; }
      .hero-search-dates > div:first-child { border-left: 1px solid #edf0f4 !important; }
      .hero-search-btn { width: 100% !important; min-width: auto !important; font-size: 1rem !important; padding: 0.85rem !important; border-radius: 0.85rem !important; margin-top: 0.3rem !important; }
    }
    @media (max-width: 480px) {
      .travky-home-hero-content { padding: 4.5rem 0.8rem 6.5rem !important; min-height: 420px !important; }
      .travky-home-title { font-size: 1.35rem !important; }
      .travky-home-subtitle { font-size: 0.82rem !important; }
      .travky-home-hero-tabs button { font-size: 0.72rem !important; padding: 0.6rem 0.15rem !important; }
    }
    .sa { opacity: 0; transform: translateY(34px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .sa.sa-visible { opacity: 1; transform: none; }
  `;

  useEffect(() => {
    if (!pageRef.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("sa-visible");
          observer.unobserve(entry.target);
        }
      }),
      { root: pageRef.current, threshold: 0.06, rootMargin: "0px 0px -40px 0px" }
    );
    pageRef.current.querySelectorAll(".sa").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [countryCards.length, cityCards.length]);

  return (
    <div ref={pageRef} dir="rtl" style={{ height: "100vh", overflowY: "auto", backgroundColor: "#f5f6fa", fontFamily: "'Cairo','Tajawal',Arial,sans-serif" }}
      onScroll={(e) => setNavScrolled(e.currentTarget.scrollTop > 40)}
    >
      <style>{scrollHideCSS}</style>

      <PublicNavbar
        clientSession={clientSession}
        onLogout={() => setClientSession(null)}
        onOpenAuthModal={openAuthModal}
        scrolled={navScrolled}
      />

      {/* ══════════════════ HERO ══════════════════ */}
      <section style={{ position: "relative", paddingTop: "56px" }}>
        {/* Full-bleed background */}
        <div style={{ position: "absolute", top: "56px", left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
          {heroBg ? (
            <img src={heroBg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1e3a5f 0%,#0f2043 100%)" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(18,24,38,.12) 0%,rgba(18,24,38,.34) 34%,rgba(18,24,38,.58) 100%)" }} />
        </div>

        {/* Hero content */}
        <div className="travky-home-hero-content" style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center",
          padding: "7rem 1.5rem 9rem", color: "white",
          minHeight: "596px",
          maxWidth: "1440px", margin: "0 auto",
        }}>
          <h1 className="travky-home-title" style={{ fontSize: "clamp(1.4rem,3.2vw,2rem)", fontWeight: 900, marginBottom: "0.8rem", lineHeight: 1.15, maxWidth: "760px", letterSpacing: "-0.015em", textShadow: "0 4px 24px rgba(0,0,0,.45)", color: "#ffffff" }}>
            اكتشف أفضل التجارب السياحية
          </h1>
          <p className="travky-home-subtitle" style={{ fontSize: "clamp(0.85rem,1.2vw,0.95rem)", marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.7, color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,.35)" }}>
            احجز الفنادق، المطاعم، والأنشطة في مكان واحد
          </p>

          {/* Tabs — glassmorphism */}
          <div className="travky-home-hero-tabs" style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", justifyContent: "center" }}>
            {TABS.map(({ key, ar, Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem",
                minWidth: "95px",
                padding: "0.8rem 1.25rem", borderRadius: "1.4rem",
                border: activeTab === key ? "none" : "1px solid rgba(255,255,255,.14)",
                cursor: "pointer",
                backgroundColor: activeTab === key ? "rgba(255,255,255,.96)" : "rgba(255,255,255,.18)",
                color: activeTab === key ? "#173f78" : "white",
                fontWeight: 800, fontSize: "0.9rem",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                boxShadow: activeTab === key ? "0 16px 32px rgba(0,0,0,.16)" : "inset 0 0 0 1px rgba(255,255,255,.08)",
                fontFamily: "inherit",
              }}>
                <Icon size={18} />
                {ar}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* Search card — overlaps hero image bottom */}
      <div className="travky-home-search-wrap sa" style={{ position: "relative", zIndex: 10, marginTop: "-48px", padding: "0 1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          <div className="hero-search" style={{
            backgroundColor: "white", borderRadius: "2rem",
            padding: "1.45rem 1.55rem",
            boxShadow: "0 28px 70px rgba(15, 23, 42, .12)",
            display: "flex", alignItems: "stretch", gap: "0",
            border: "1px solid rgba(15,23,42,.04)",
          }}>
            {/* Destination */}
            <div className="hero-dest" onClick={() => setDestPanelOpen(true)} style={{ flex: "1 1 360px", display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.35rem 1.15rem", borderLeft: "1px solid #edf0f4", cursor: "pointer" }}>
              <MapPin size={20} style={{ color: "#173f78", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 700, marginBottom: "0.15rem" }}>الوجهة</div>
                <div style={{ fontSize: "0.9rem", color: selectedDest ? "#111827" : "#9ca3af", fontWeight: selectedDest ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedDest ? selectedDest.label : "اكتب اسم الدولة، المدينة أو الفندق"}
                </div>
              </div>
            </div>

            <div className="hero-search-dates" style={{ display: "contents" }}>
              {/* From date */}
              <div onClick={() => setDatePanelOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.35rem 1.15rem", borderLeft: "1px solid #edf0f4", whiteSpace: "nowrap", cursor: "pointer" }}>
                <Calendar size={16} style={{ color: "#173f78" }} />
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 700 }}>من</div>
                  <div style={{ fontSize: "0.85rem", color: checkIn ? "#111827" : "#9ca3af", fontWeight: checkIn ? 700 : 400 }}>
                    {checkIn ? `${checkIn.getDate()}/${checkIn.getMonth() + 1}` : "---"}
                  </div>
                </div>
              </div>

              {/* To date */}
              <div onClick={() => setDatePanelOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.35rem 1.15rem", borderLeft: "1px solid #edf0f4", whiteSpace: "nowrap", cursor: "pointer" }}>
                <Calendar size={16} style={{ color: "#173f78" }} />
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 700 }}>إلى</div>
                  <div style={{ fontSize: "0.85rem", color: checkOut ? "#111827" : "#9ca3af", fontWeight: checkOut ? 700 : 400 }}>
                    {checkOut ? `${checkOut.getDate()}/${checkOut.getMonth() + 1}` : "---"}
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div onClick={() => setGuestPanelOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.35rem 1.15rem", borderLeft: "1px solid #edf0f4", whiteSpace: "nowrap", cursor: "pointer" }}>
              <Users size={16} style={{ color: "#173f78" }} />
              <div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 700 }}>الغرف والضيوف</div>
                <div style={{ fontSize: "0.85rem", color: "#111827", fontWeight: 700 }}>
                  {guests.rooms} غرفة، {guests.adults} بالغ{guests.children > 0 ? `، ${guests.children} طفل` : ""}
                </div>
              </div>
            </div>

            {/* Search button */}
            <button className="hero-search-btn" onClick={() => {
              const p = new URLSearchParams();
              if (checkIn) p.set("checkIn", checkIn.toISOString());
              if (checkOut) p.set("checkOut", checkOut.toISOString());
              p.set("rooms", guests.rooms);
              p.set("adults", guests.adults);
              p.set("children", guests.children);

              if (selectedDest) {
                if (selectedDest.type === "hotel") {
                  p.set("type", "hotel");
                  p.set("hotelId", selectedDest.id);
                  p.set("q", selectedDest.label);
                } else if (selectedDest.type === "city") {
                  p.set("type", "city");
                  p.set("city", selectedDest.city || selectedDest.label);
                  p.set("country", selectedDest.country || "");
                  p.set("q", selectedDest.label);
                } else if (selectedDest.type === "country") {
                  p.set("type", "country");
                  p.set("country", selectedDest.country || selectedDest.label);
                  p.set("q", selectedDest.label);
                } else {
                  p.set("type", "query");
                  p.set("q", selectedDest.label);
                }
              } else if (destination.trim()) {
                p.set("type", "query");
                p.set("q", destination.trim());
              }
              navigate(`/search?${p}`);
            }} style={{
              margin: "0rem",
              minWidth: "140px",
              justifyContent: "center",
              padding: "0 1.5rem", borderRadius: "1rem", border: "none", cursor: "pointer",
              backgroundColor: "#173f78", color: "white", fontWeight: 800, fontSize: "0.95rem",
              display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "inherit",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              <Search size={16} />
              بحث
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════ POPULAR DESTINATIONS ══════════════════ */}
      {countryCards.length > 0 && (
        <section className="sa" style={{ padding: "3rem 1.5rem", backgroundColor: "white" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ marginBottom: "1.5rem", textAlign: "right" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", marginBottom: "0.3rem" }}>وجهات شائعة</h2>
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>استكشف أشهر الوجهات السياحية حول العالم</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.9rem" }}>
              {countryCards.map((c, i) => (
                <div key={c.code} className="img-zoom sa" style={{ position: "relative", height: "200px", borderRadius: "1.25rem", overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,.1)", transitionDelay: `${i * 0.08}s` }}>
                  <img src={cPhotos[c.code].src} alt={c.nameAr}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.72) 0%,transparent 55%)" }} />
                  <div style={{ position: "absolute", bottom: "0.9rem", right: "0.9rem", color: "white" }}>
                    <p style={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2 }}>{c.nameAr}</p>
                    <p style={{ fontSize: "0.75rem", opacity: 0.85 }}>{c.cities.length} مدينة</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════ TRENDING CITIES ══════════════════ */}
      {cityCards.length > 0 && (
        <section className="sa" style={{ padding: "3rem 1.5rem", backgroundColor: "#f5f6fa" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ marginBottom: "1.5rem", textAlign: "right" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", marginBottom: "0.3rem" }}>مدن رائجة</h2>
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>أكثر المدن بحثاً من قبل المسافرين</p>
            </div>
            {/* horizontal scroll row */}
            <div className="cities-scroll" style={{ display: "flex", gap: "0.9rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
              {cityCards.map((city, i) => (
                <div key={i} className="img-zoom sa" style={{ position: "relative", width: "175px", minWidth: "175px", height: "240px", borderRadius: "1.25rem", overflow: "hidden", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,.1)", transitionDelay: `${i * 0.08}s` }}>
                  <img src={city.src} alt={city.ar}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.72) 0%,transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: "0.9rem", right: "0.9rem", color: "white" }}>
                    <p style={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2,color:"white" }}>{city.ar}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.2rem" }}>
                     
                      <p style={{ fontSize: "0.78rem", opacity: 0.88 ,color:"white"}}>{city.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════ EMPTY STATE ══════════════════ */}
      {!hasCategoryPhotos && !hasDestinations && (
        <section className="sa" style={{ padding: "5rem 2rem", textAlign: "center", backgroundColor: "white" }}>
          <p style={{ fontSize: "1.1rem", color: "#6b7280", marginBottom: isSuperAdmin ? "1.5rem" : 0 }}>
            {isSuperAdmin
              ? "لم يتم رفع صور بعد — قم بإضافة الصور من لوحة تحكم السوبر أدمن"
              : "لا تتوفر محتويات حالياً. يرجى المحاولة لاحقاً."}
          </p>
          {isSuperAdmin && (
            <Link to="/super-admin" style={{
              padding: "0.75rem 2.5rem", backgroundColor: "#1e3a5f", color: "white",
              borderRadius: "0.875rem", textDecoration: "none", fontWeight: 700, fontSize: "0.95rem",
            }}>
              الدخول إلى لوحة التحكم
            </Link>
          )}
        </section>
      )}

      {/* ══════════════════ FOOTER ══════════════════ */}
      <PublicFooter />

      <PublicAuthModal
        open={authModalOpen}
        mode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onModeChange={setAuthModalMode}
        onAuthenticated={setClientSession}
      />

      <SearchDestinationPanel
        open={destPanelOpen}
        onClose={() => setDestPanelOpen(false)}
        onSelect={(dest) => {
          if (dest.type === "hotel") {
            setDestPanelOpen(false);
            navigate(`/hotel/${dest.id}`);
          } else {
            setSelectedDest(dest);
            setDestPanelOpen(false);
          }
        }}
      />

      <SearchDatePicker
        open={datePanelOpen}
        onClose={() => setDatePanelOpen(false)}
        checkIn={checkIn}
        checkOut={checkOut}
        onConfirm={(ci, co) => { setCheckIn(ci); setCheckOut(co); setDatePanelOpen(false); }}
      />

      <SearchGuestsPicker
        open={guestPanelOpen}
        onClose={() => setGuestPanelOpen(false)}
        initial={guests}
        onConfirm={(g) => { setGuests(g); setGuestPanelOpen(false); }}
      />
    </div>
  );
}
