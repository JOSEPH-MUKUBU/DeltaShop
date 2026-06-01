import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Loader2, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { resolveImageUrl } from "../../lib/image";

export function SmartSearch() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  useEffect(() => {
    function onClickOutside(e) {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setLoading(false);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/products", {
          params: { q: q.trim(), limit: 6 }
        });
        setResults(data.products || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [canSearch, q]);

  return (
    <section className="mt-8" ref={wrapperRef}>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-slate-700">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold">Recherche intelligente</h3>
        </div>

        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            const next = q.trim();
            navigate(next ? `/?q=${encodeURIComponent(next)}` : "/");
            setOpen(false);
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setOpen(true);
            }}
            placeholder="Tape 2 lettres ou plus pour trouver un produit"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
          )}
        </form>

        {open && canSearch && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
            {results.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {results.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product.slug || product._id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 bg-white p-3 transition-colors hover:bg-slate-50"
                  >
                    <img
                      src={resolveImageUrl(product.images?.[0])}
                      alt={product.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-800">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.category || "Produit"}</div>
                    </div>
                    <div className="text-sm font-semibold text-indigo-600">{Number(product.price).toFixed(2)} EUR</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-3 text-sm text-slate-500">Aucun produit trouve pour "{q.trim()}".</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
