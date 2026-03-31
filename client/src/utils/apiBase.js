const DEFAULT_SERVER_ORIGIN = "http://localhost:5001";

function stripApiSuffix(url) {
  return url.replace(/\/api\/?$/, "");
}

const configuredUrl = (import.meta.env.VITE_API_URL || "").trim();

export const SERVER_ORIGIN = stripApiSuffix(
  configuredUrl || DEFAULT_SERVER_ORIGIN,
);

export const API_BASE_URL = `${SERVER_ORIGIN}/api`;