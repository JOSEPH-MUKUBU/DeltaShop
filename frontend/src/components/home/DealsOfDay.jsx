import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Loader2, Timer } from "lucide-react";
import { api } from "../../lib/api";
import { resolveImageUrl } from "../../lib/image";

function getTimeToMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const ms = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

function formatTime(left) {
  return [left.hours, left.minutes, left.seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

export function DealsOfDay() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [left, setLeft] = useState(getTimeToMidnight());

  useEffect(() => {
    const interval = setInterval(() => setLeft(getTimeToMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/products/deals", { params: { limit: 4 } });
        const deals = data.products || [];
        if (deals.length > 0) {
          if (mounted) setProducts(deals);
        } else {
          const fallback = await api.get("/api/products/trending", { params: { limit: 4 } });
          if (mounted) setProducts(fallback.data.products || []);
        }
      } catch {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const title = useMemo(() => formatTime(left), [left]);

  if (loading) {
    return (
      <section className="mt-10">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des offres...</span>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50">
        <div className="flex flex-col gap-3 border-b border-rose-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-rose-700">
            <Flame className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Offres du jour</h3>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-sm font-medium text-slate-700">
            <Timer className="h-4 w-4 text-rose-600" />
            Fin dans <span className="font-semibold text-rose-700">{title}</span>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product.slug || product._id}`}
              className="group overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={resolveImageUrl(product.images?.[0])}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-slate-800">{product.name}</p>
                <p className="mt-2 text-sm font-semibold text-rose-700">{Number(product.price).toFixed(2)} EUR</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
