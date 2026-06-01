import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { resolveImageUrl } from "../lib/image";
import {
  TrendingUp,
  Search,
  Filter,
  Star,
  Flame,
  Eye,
  ShoppingCart,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarDays
} from "lucide-react";

export function AdminTrendingProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featuredOrder");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/admin/products", { params: { limit: 200, page: 1 } });
        if (mounted) {
          setProducts(data.products || []);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e?.response?.data?.message || "Erreur chargement produits");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const patchProduct = (id, patch) => {
    setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, ...patch } : p)));
  };

  const persistToggle = async (productId, nextPatch, rollbackPatch, successText) => {
    setSavingId(productId);
    try {
      await api.put(`/api/products/${productId}`, nextPatch);
      setSuccess(successText);
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      patchProduct(productId, rollbackPatch);
      setError(e?.response?.data?.message || "Erreur sauvegarde");
      setTimeout(() => setError(null), 3000);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleFeatured = (product) => {
    const nextIsFeatured = !Boolean(product.isFeatured);
    const nextPatch = { isFeatured: nextIsFeatured };
    const rollbackPatch = { isFeatured: Boolean(product.isFeatured) };
    patchProduct(product._id, nextPatch);
    persistToggle(
      product._id,
      nextPatch,
      rollbackPatch,
      nextIsFeatured ? `Produit "${product.name}" passe en vedette` : `Produit "${product.name}" retire des vedettes`
    );
  };

  const handleToggleDeal = (product) => {
    const nextIsDeal = !Boolean(product.isDealOfDay);
    const nextPatch = {
      isDealOfDay: nextIsDeal,
      dealOrder: nextIsDeal ? Number(product.dealOrder || 1) : Number(product.dealOrder || 0)
    };
    const rollbackPatch = {
      isDealOfDay: Boolean(product.isDealOfDay),
      dealOrder: Number(product.dealOrder || 0)
    };
    patchProduct(product._id, nextPatch);
    persistToggle(
      product._id,
      nextPatch,
      rollbackPatch,
      nextIsDeal ? `Produit "${product.name}" active pour les offres du jour` : `Produit "${product.name}" retire des offres du jour`
    );
  };

  const handleUpdateNumber = (productId, key, value) => {
    patchProduct(productId, { [key]: parseInt(value, 10) || 0 });
  };

  const handleSave = async (product) => {
    setSavingId(product._id);
    try {
      await api.put(`/api/products/${product._id}`, {
        isFeatured: product.isFeatured,
        featuredOrder: product.featuredOrder,
        isDealOfDay: product.isDealOfDay,
        dealOrder: product.dealOrder,
        viewCount: product.viewCount,
        soldCount: product.soldCount
      });
      setSuccess(`Produit "${product.name}" mis a jour`);
      setTimeout(() => setSuccess(null), 2500);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur sauvegarde");
      setTimeout(() => setError(null), 3000);
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "featuredOrder") {
        if (b.isFeatured !== a.isFeatured) return Number(b.isFeatured) - Number(a.isFeatured);
        return (b.featuredOrder || 0) - (a.featuredOrder || 0);
      }
      if (sortBy === "dealOrder") {
        if (b.isDealOfDay !== a.isDealOfDay) return Number(b.isDealOfDay) - Number(a.isDealOfDay);
        return (b.dealOrder || 0) - (a.dealOrder || 0);
      }
      if (sortBy === "viewCount") return (b.viewCount || 0) - (a.viewCount || 0);
      if (sortBy === "soldCount") return (b.soldCount || 0) - (a.soldCount || 0);
      return 0;
    });

  const featuredCount = products.filter((p) => p.isFeatured).length;
  const dealsCount = products.filter((p) => p.isDealOfDay).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des produits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Produits Home</h1>
              <p className="text-slate-500">Choisissez les produits tendance et les produits du jour</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-2 text-slate-500">
              <Star className="h-4 w-4" />
              <span className="text-sm">Produits en vedette</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{featuredCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-2 text-slate-500">
              <CalendarDays className="h-4 w-4" />
              <span className="text-sm">Produits du jour</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{dealsCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-2 text-slate-500">
              <Eye className="h-4 w-4" />
              <span className="text-sm">Vues totales</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {products.reduce((sum, p) => sum + (p.viewCount || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-2 text-slate-500">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Ventes</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {products.reduce((sum, p) => sum + (p.soldCount || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="featuredOrder">Par ordre vedette</option>
              <option value="dealOrder">Par ordre produit du jour</option>
              <option value="viewCount">Par nombre de vues</option>
              <option value="soldCount">Par nombre de ventes</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Produit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">En vedette</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Ordre vedette</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Produit du jour</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Ordre jour</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Vues</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Ventes</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-slate-50 ${
                      product.isDealOfDay ? "bg-rose-50/30" : product.isFeatured ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={resolveImageUrl(product.images?.[0])} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                        <div>
                          <div className="font-medium text-slate-800">{product.name}</div>
                          <div className="text-sm text-slate-500">{product.category?.name || "Sans categorie"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        disabled={savingId === product._id}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                          product.isFeatured ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        } disabled:opacity-50`}
                      >
                        {product.isFeatured ? (
                          <>
                            <Flame className="h-3 w-3" /> Vedette
                          </>
                        ) : (
                          <>
                            <Star className="h-3 w-3" /> Standard
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={product.featuredOrder || 0}
                        onChange={(e) => handleUpdateNumber(product._id, "featuredOrder", e.target.value)}
                        disabled={!product.isFeatured}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleDeal(product)}
                        disabled={savingId === product._id}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                          product.isDealOfDay ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        } disabled:opacity-50`}
                      >
                        {product.isDealOfDay ? (
                          <>
                            <CalendarDays className="h-3 w-3" /> Actif
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" /> Inactif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={product.dealOrder || 0}
                        onChange={(e) => handleUpdateNumber(product._id, "dealOrder", e.target.value)}
                        disabled={!product.isDealOfDay}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={product.viewCount || 0}
                        onChange={(e) => handleUpdateNumber(product._id, "viewCount", e.target.value)}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={product.soldCount || 0}
                        onChange={(e) => handleUpdateNumber(product._id, "soldCount", e.target.value)}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSave(product)}
                        disabled={savingId === product._id}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {savingId === product._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Sauver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && <div className="p-8 text-center text-slate-500">Aucun produit trouve</div>}
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-medium">Comment cela fonctionne :</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-blue-600">
                <li>Les produits "En vedette" alimentent la section Produits tendance.</li>
                <li>Les "Produits du jour" alimentent la section Offres du jour.</li>
                <li>L'ordre le plus eleve passe en premier dans chaque section.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
