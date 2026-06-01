const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

function toApiOrigin() {
  if (!API_BASE_URL) return "";
  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return "";
  }
}

const API_ORIGIN = toApiOrigin();

export function resolveImageUrl(value, fallback = "/static/coupon.png") {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return fallback;

  // Already absolute or browser-local scheme.
  if (/^(?:https?:)?\/\//i.test(raw) || /^(?:data|blob):/i.test(raw)) {
    return raw;
  }

  if (raw.startsWith("/")) {
    if (!API_ORIGIN) return raw;
    if (raw.startsWith("/static/") || raw.startsWith("/images/")) {
      return `${API_ORIGIN}${raw}`;
    }
    return raw;
  }

  const normalized = raw.replace(/^\.?\//, "");
  if (!normalized) return fallback;
  return API_ORIGIN ? `${API_ORIGIN}/${normalized}` : `/${normalized}`;
}
