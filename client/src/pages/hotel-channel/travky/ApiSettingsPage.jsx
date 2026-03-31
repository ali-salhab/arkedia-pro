import { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Plus,
  Trash2,
  ShieldOff,
  Globe,
  BedDouble,
  BarChart2,
  DollarSign,
  Key,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import {
  useGetApiConfigQuery,
  useCreateDevTokenMutation,
  useRevokeDevTokenMutation,
  useDeleteDevTokenMutation,
  useToggleApiEndpointMutation,
} from "../../../store/services/api";
import { API_BASE_URL } from "../../../utils/apiBase";

const BASE_URL = `${API_BASE_URL}/developer`;

const ENDPOINT_CATALOG = [
  {
    key: "rooms",
    Icon: BedDouble,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    method: "GET",
    path: "/rooms",
    descEn: "List all rooms with pricing, capacity and availability status.",
    descAr: "قائمة بجميع الغرف مع الأسعار والطاقة الاستيعابية وحالة التوفر.",
  },
  {
    key: "availability",
    Icon: BarChart2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    method: "GET",
    path: "/availability",
    descEn: "Query room availability by date range. (Coming soon)",
    descAr: "استعلام عن توفر الغرف حسب نطاق التاريخ. (قريبًا)",
    comingSoon: true,
  },
  {
    key: "rates",
    Icon: DollarSign,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    method: "GET",
    path: "/rates",
    descEn: "Retrieve pricing rates per room type and season. (Coming soon)",
    descAr: "استرجاع أسعار الغرف حسب النوع والموسم. (قريبًا)",
    comingSoon: true,
  },
];

const COPY = {
  en: {
    title: "Developer API",
    subtitle:
      "Provide secure, controlled API access to your hotel data for developers and external systems.",
    tabTokens: "Access Tokens",
    tabEndpoints: "Endpoints",
    tabDocs: "How to Use",
    tokensSectionTitle: "Developer Access Tokens",
    tokensSectionDesc:
      "Generate a token and share it with a developer. They will use it to authenticate their API requests to your hotel data.",
    addToken: "New Token",
    tokenName: "App / Developer name",
    tokenEmail: "Contact email (optional)",
    create: "Create Token",
    cancel: "Cancel",
    nameRequired: "Name is required",
    active: "Active",
    revoked: "Revoked",
    noTokens: "No tokens yet. Create one to get started.",
    endpointTitle: "API Endpoints",
    endpointDesc:
      "Toggle which endpoints developers can access using your tokens.",
    enabled: "Enabled",
    disabled: "Disabled",
    comingSoon: "Coming soon",
    docsTitle: "Integration Guide",
    docsStep1: "1. Create an Access Token above and copy it.",
    docsStep2:
      "2. Make HTTP requests to the base URL below, including the token in the Authorization header.",
    docsStep3:
      "3. You can revoke a token at any time to immediately block developer access.",
    baseUrl: "API Base URL",
    exampleRequest: "Example request",
    exampleResponse: "Example response (rooms)",
    tokenWarning:
      "This token is shown once. Copy it now — you cannot see it again.",
    confirmRevoke:
      "Revoke this token? The developer will immediately lose API access.",
    confirmDelete: "Delete this token entry?",
    revoke: "Revoke",
    delete: "Delete",
  },
  ar: {
    title: "واجهة برمجة التطبيقات للمطورين",
    subtitle:
      "قدم وصولًا آمنًا ومتحكمًا لبيانات الفندق للمطورين والأنظمة الخارجية.",
    tabTokens: "رموز الوصول",
    tabEndpoints: "نقاط الوصول",
    tabDocs: "كيفية الاستخدام",
    tokensSectionTitle: "رموز وصول المطورين",
    tokensSectionDesc:
      "أنشئ رمزًا وشاركه مع المطور. سيستخدمه للمصادقة على طلبات API الخاصة ببيانات فندقك.",
    addToken: "رمز جديد",
    tokenName: "اسم التطبيق / المطور",
    tokenEmail: "البريد الإلكتروني للتواصل (اختياري)",
    create: "إنشاء الرمز",
    cancel: "إلغاء",
    nameRequired: "الاسم مطلوب",
    active: "نشط",
    revoked: "ملغى",
    noTokens: "لا توجد رموز بعد. أنشئ واحدًا للبدء.",
    endpointTitle: "نقاط وصول API",
    endpointDesc:
      "تحكم في نقاط الوصول التي يستطيع المطورون الوصول إليها باستخدام رموزهم.",
    enabled: "مفعّل",
    disabled: "معطّل",
    comingSoon: "قريبًا",
    docsTitle: "دليل التكامل",
    docsStep1: "١. أنشئ رمز وصول أعلاه وانسخه.",
    docsStep2:
      "٢. أرسل طلبات HTTP إلى عنوان URL الأساسي أدناه، متضمنًا الرمز في رأس التفويض.",
    docsStep3: "٣. يمكنك إلغاء صلاحية الرمز في أي وقت لحجب وصول المطور فورًا.",
    baseUrl: "عنوان URL الأساسي",
    exampleRequest: "مثال على الطلب",
    exampleResponse: "مثال على الاستجابة (الغرف)",
    tokenWarning:
      "هذا الرمز يُعرض مرة واحدة فقط. انسخه الآن — لن تتمكن من رؤيته مجددًا.",
    confirmRevoke: "إلغاء صلاحية هذا الرمز؟ سيفقد المطور وصوله إلى API فورًا.",
    confirmDelete: "حذف هذا الرمز نهائيًا؟",
    revoke: "إلغاء الصلاحية",
    delete: "حذف",
  },
};

const EXAMPLE_RESPONSE = `{
  "total": 3,
  "rooms": [
    {
      "_id": "abc123",
      "number": "101",
      "name": "Deluxe Double Room",
      "type": "room",
      "category": "deluxe",
      "capacity": 2,
      "beds": 1,
      "bedType": "king",
      "pricePerNight": 120,
      "currency": "USD",
      "status": "available"
    }
  ]
}`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shrink-0"
    >
      {copied ? (
        <Check size={12} strokeWidth={3} className="text-emerald-500" />
      ) : (
        <Copy size={12} />
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function ApiSettingsPage() {
  const { lang } = useLanguage();
  const c = COPY[lang] || COPY.en;
  const isRtl = lang === "ar";

  const [tab, setTab] = useState("tokens");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [newlyCreatedToken, setNewlyCreatedToken] = useState(null);

  const { data: config, isLoading, refetch } = useGetApiConfigQuery();
  const [createDevToken, { isLoading: creating }] = useCreateDevTokenMutation();
  const [revokeDevToken] = useRevokeDevTokenMutation();
  const [deleteDevToken] = useDeleteDevTokenMutation();
  const [toggleApiEndpoint] = useToggleApiEndpointMutation();

  const handleCreate = async () => {
    if (!newName.trim()) {
      setFormError(c.nameRequired);
      return;
    }
    setFormError("");
    try {
      const result = await createDevToken({
        name: newName,
        email: newEmail,
      }).unwrap();
      const created = result.developerTokens[result.developerTokens.length - 1];
      setNewlyCreatedToken(created.token);
      setNewName("");
      setNewEmail("");
      setShowForm(false);
    } catch (_) {}
  };

  const handleRevoke = async (tokenId) => {
    if (!window.confirm(c.confirmRevoke)) return;
    await revokeDevToken(tokenId)
      .unwrap()
      .catch(() => {});
  };

  const handleDelete = async (tokenId) => {
    if (!window.confirm(c.confirmDelete)) return;
    setNewlyCreatedToken(null);
    await deleteDevToken(tokenId)
      .unwrap()
      .catch(() => {});
  };

  const handleToggleEndpoint = async (key, currentlyEnabled) => {
    await toggleApiEndpoint({ endpoint: key, enabled: !currentlyEnabled })
      .unwrap()
      .catch(() => {});
  };

  const tokens = config?.developerTokens || [];
  const enabledEndpoints = config?.enabledEndpoints || [];

  const tabs = [
    { key: "tokens", label: c.tabTokens },
    { key: "endpoints", label: c.tabEndpoints },
    { key: "docs", label: c.tabDocs },
  ];

  return (
    <div className={`page-shell ${isRtl ? "text-right" : "text-left"}`}>
      {/* Header */}
      <div
        className={`flex items-start gap-4 ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <div className="w-11 h-11 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center shrink-0 shadow">
          <Code2 size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {c.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {c.subtitle}
          </p>
        </div>
        <button
          onClick={refetch}
          className="shrink-0 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Newly created token warning */}
      {newlyCreatedToken && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          <AlertCircle
            size={18}
            className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
              {c.tokenWarning}
            </p>
            <div
              className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <code className="flex-1 min-w-0 text-xs font-mono bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 truncate text-slate-700 dark:text-slate-300">
                {newlyCreatedToken}
              </code>
              <CopyButton text={newlyCreatedToken} />
            </div>
          </div>
          <button
            onClick={() => setNewlyCreatedToken(null)}
            className="shrink-0 text-amber-400 hover:text-amber-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: TOKENS */}
      {tab === "tokens" && (
        <div className="space-y-4">
          <div
            className={`flex items-start justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {c.tokensSectionTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg leading-relaxed">
                {c.tokensSectionDesc}
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setFormError("");
              }}
              className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              <Plus size={15} strokeWidth={2.5} />
              {c.addToken}
            </button>
          </div>

          {showForm && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {c.tokenName}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "مثال: تطبيق الحجز، موقع الفندق..."
                      : "e.g. Booking App, Hotel Website..."
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir={isRtl ? "rtl" : "ltr"}
                />
                {formError && (
                  <p className="text-xs text-red-500 mt-1">{formError}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {c.tokenEmail}
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
              </div>
              <div className={`flex gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? "..." : c.create}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormError("");
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {c.cancel}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                {lang === "ar" ? "جارٍ التحميل..." : "Loading..."}
              </div>
            ) : tokens.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Key
                  size={32}
                  className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
                />
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {c.noTokens}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {tokens.map((tok) => (
                  <div
                    key={tok._id}
                    className={`flex items-center gap-3 px-5 py-4 ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex items-center gap-2.5 flex-1 min-w-0 ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          tok.status === "active"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Key size={14} strokeWidth={2} />
                      </div>
                      <div
                        className={`min-w-0 ${isRtl ? "text-right" : "text-left"}`}
                      >
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                          {tok.name}
                        </p>
                        {tok.email && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            {tok.email}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(tok.createdAt).toLocaleDateString(
                            lang === "ar" ? "ar-EG" : "en-GB",
                          )}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          tok.status === "active"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 line-through"
                        }`}
                      >
                        {tok.status === "active" ? c.active : c.revoked}
                      </span>
                      {tok.status === "active" && (
                        <button
                          onClick={() => handleRevoke(tok._id)}
                          title={c.revoke}
                          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          <ShieldOff size={15} strokeWidth={2} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(tok._id)}
                        title={c.delete}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ENDPOINTS */}
      {tab === "endpoints" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {c.endpointTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {c.endpointDesc}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {ENDPOINT_CATALOG.map((ep) => {
                const isEnabled = enabledEndpoints.includes(ep.key);
                return (
                  <div
                    key={ep.key}
                    className={`flex items-center gap-4 px-5 py-4 ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${ep.bg} flex items-center justify-center shrink-0`}
                    >
                      <ep.Icon size={17} className={ep.color} strokeWidth={2} />
                    </div>
                    <div
                      className={`flex-1 min-w-0 ${isRtl ? "text-right" : "text-left"}`}
                    >
                      <div
                        className={`flex items-center gap-2 flex-wrap ${isRtl ? "flex-row-reverse justify-end" : ""}`}
                      >
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-100">
                          {ep.path}
                        </code>
                        {ep.comingSoon && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                            {c.comingSoon}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {lang === "ar" ? ep.descAr : ep.descEn}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {ep.comingSoon ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {c.comingSoon}
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleToggleEndpoint(ep.key, isEnabled)
                          }
                          aria-label={isEnabled ? c.enabled : c.disabled}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isEnabled
                              ? "bg-emerald-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              isEnabled
                                ? isRtl
                                  ? "-translate-x-6"
                                  : "translate-x-6"
                                : isRtl
                                  ? "-translate-x-1"
                                  : "translate-x-1"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DOCS */}
      {tab === "docs" && (
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {c.docsTitle}
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3 shadow-sm">
            {[c.docsStep1, c.docsStep2, c.docsStep3].map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div
              className={`flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <Globe size={15} className="text-blue-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex-1">
                {c.baseUrl}
              </span>
              <CopyButton text={BASE_URL} />
            </div>
            <div className="px-4 py-3">
              <code className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                {BASE_URL}
              </code>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl overflow-hidden shadow-sm">
            <div
              className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <span className="text-xs font-semibold text-slate-400">
                {c.exampleRequest}
              </span>
              <CopyButton
                text={`curl -H "Authorization: Bearer <your_token>" \\\n  ${BASE_URL}/rooms`}
              />
            </div>
            <pre className="px-4 py-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed whitespace-pre">
              {`curl -H "Authorization: Bearer <your_token>" \\\n  ${BASE_URL}/rooms`}
            </pre>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl overflow-hidden shadow-sm">
            <div
              className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-700 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <span className="text-xs font-semibold text-slate-400">
                {c.exampleResponse}
              </span>
              <CopyButton text={EXAMPLE_RESPONSE} />
            </div>
            <pre className="px-4 py-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
              {EXAMPLE_RESPONSE}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
