import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { ProductCard } from "../ProductCard";
import { TrendingUp, Loader2, Flame } from "lucide-react";

export function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/products/trending", { params: { limit: 8 } });
        if (mounted) {
          setProducts(data.products || []);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e?.response?.data?.message || e?.message || "Erreur chargement produits tendance");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des produits tendance...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {String(error)}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-800">Produits tendance</h2>
            <p className="text-sm text-slate-500">Les articles les plus populaires du moment</p>
          </div>
        </div>
        <a
          href="/products?sort=popular"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Voir tout
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <div key={product._id} className="relative">
            {index < 3 && (
              <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-semibold text-white shadow-md">
                <Flame className="h-3 w-3" />
                Top {index + 1}
              </div>
            )}
            <ProductCard product={product} trending />
          </div>
        ))}
      </div>
    </div>
  );
}
