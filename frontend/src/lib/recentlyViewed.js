const STORAGE_KEY = "delta_recently_viewed";
const MAX_ITEMS = 8;

function safeRead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getRecentlyViewed(limit = MAX_ITEMS) {
  return safeRead().slice(0, Math.max(1, limit));
}

export function pushRecentlyViewed(product) {
  if (!product?._id) return;

  const normalized = {
    _id: String(product._id),
    slug: product.slug || "",
    name: product.name || "Produit",
    price: Number(product.price || 0),
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category || "",
    countInStock: Number(product.countInStock || 0)
  };

  const current = safeRead().filter((p) => String(p?._id) !== normalized._id);
  current.unshift(normalized);
  safeWrite(current.slice(0, MAX_ITEMS));
}
