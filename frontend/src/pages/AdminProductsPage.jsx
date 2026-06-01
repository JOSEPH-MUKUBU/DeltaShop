import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { api } from "../lib/api";
import { resolveImageUrl } from "../lib/image";
import {
  Package,
  Image as ImageIcon,
  Star,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Edit2,
  CheckCircle2
} from "lucide-react";

export function AdminProductsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    inStock: "",
    isFeatured: ""
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("49.90");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState("5");
  const [image, setImage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState("0");

  useEffect(() => {
    if (!user) navigate("/login?next=/admin/products");
    else if (!user.isAdmin && !user.roles?.some((r) => ["admin", "product_manager"].includes(r))) {
      navigate("/");
    }
  }, [user, navigate]);

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/api/categories");
      setCategories(data.categories || []);
    } catch (e) {
      console.error("Erreur chargement categories", e);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", 20);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.inStock) params.set("inStock", filters.inStock);
      if (filters.isFeatured) params.set("isFeatured", filters.isFeatured);

      const { data } = await api.get(`/api/admin/products?${params.toString()}`);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setError(null);
    } catch (e) {
      setError(e?.message || "Erreur chargement produits");
    } finally {
      setLoading(false);
    }
  }, [filters, page, sortBy, sortOrder]);

  useEffect(() => {
    if (user?.isAdmin || user?.roles?.some((r) => ["admin", "product_manager"].includes(r))) {
      loadCategories();
      loadProducts();
    }
  }, [loadCategories, loadProducts, user]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("49.90");
    setCategory("");
    setCountInStock("5");
    setImage("");
    setIsFeatured(false);
    setFeaturedOrder("0");
  }

  function startEdit(p) {
    setEditingId(p._id);
    setName(p.name);
    setPrice(String(p.price));
    setCategory(p.category || "");
    setCountInStock(String(p.countInStock ?? 0));
    setImage(p.images?.[0] || "");
    setIsFeatured(Boolean(p.isFeatured));
    setFeaturedOrder(String(p.featuredOrder ?? 0));
  }

  async function onSave(e) {
    e.preventDefault();
    setMsg(null);
    const payload = {
      name,
      price: Number(price),
      category,
      countInStock: Number(countInStock),
      images: image ? [image] : [],
      isFeatured,
      featuredOrder: Number(featuredOrder)
    };
    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
        setMsg("Produit mis a jour");
      } else {
        const { data } = await api.post("/api/products", payload);
        setMsg(`Produit cree: ${data.product.name}`);
      }
      resetForm();
      loadProducts();
    } catch (e) {
      setError(e?.message || "Erreur");
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Supprimer ce produit ?")) return;
    setMsg(null);
    try {
      await api.delete(`/api/products/${id}`);
      setMsg("Produit supprime");
      if (editingId === id) resetForm();
      loadProducts();
    } catch (e) {
      setError(e?.message || "Erreur suppression");
    }
  }

  async function exportCSV() {
    try {
      const response = await api.get("/api/admin/products/export", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `produits_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Erreur export CSV");
    }
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-slate-300">↕</span>;
    return <span className="text-slate-600">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-3xl font-bold text-transparent">
              <Package className="h-8 w-8 text-indigo-600" />
              Produits
            </h1>
            <p className="mt-2 text-slate-500">Gerez votre catalogue produits en toute simplicite</p>
          </div>
          <Button variant="outline" onClick={exportCSV} className="border-slate-200 bg-white text-sm shadow-sm hover:bg-slate-50">
            Export CSV
          </Button>
        </div>

        {msg && (
          <div className="animate-in slide-in-from-top-2 mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800 backdrop-blur">
            <CheckCircle2 className="h-4 w-4" />
            {msg}
          </div>
        )}
        {error && (
          <div className="animate-in slide-in-from-top-2 mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 backdrop-blur">
            <X className="h-4 w-4" />
            {String(error)}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-700">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-semibold">Filtres</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Rechercher..."
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Toutes les categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                placeholder="Prix min"
                type="number"
              />
              <Input
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                placeholder="Prix max"
                type="number"
              />
            </div>
            <div>
              <select
                value={filters.inStock}
                onChange={(e) => setFilters((f) => ({ ...f, inStock: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Tous les stocks</option>
                <option value="true">En stock</option>
                <option value="false">Rupture</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ search: "", category: "", minPrice: "", maxPrice: "", inStock: "", isFeatured: "" });
                setPage(1);
              }}
              className="bg-white text-xs hover:bg-slate-50"
            >
              <X className="mr-1 h-3 w-3" />
              Reinitialiser
            </Button>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700 transition-colors hover:bg-amber-100">
              <input
                type="checkbox"
                checked={filters.isFeatured === "true"}
                onChange={(e) => setFilters((f) => ({ ...f, isFeatured: e.target.checked ? "true" : "" }))}
                className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <Star className="h-3.5 w-3.5" />
              Mis en avant uniquement
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={onSave}
            className="space-y-5 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-lg shadow-slate-200/50 lg:col-span-4"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className={`rounded-xl p-2 ${editingId ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`}>
                {editingId ? <Edit2 className="h-5 w-5" /> : <Package className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">{editingId ? "Modifier le produit" : "Nouveau produit"}</h2>
                <p className="text-xs text-slate-500">{editingId ? "Modifiez les informations" : "Ajoutez un nouveau produit"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label={<span className="font-medium text-slate-700">Nom du produit</span>}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: iPhone 16 Pro Max"
                className="focus:border-indigo-500 focus:ring-indigo-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={<span className="font-medium text-slate-700">Prix (EUR)</span>}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  step="0.01"
                  className="focus:border-indigo-500 focus:ring-indigo-500"
                />
                <Input
                  label={<span className="font-medium text-slate-700">Stock</span>}
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                  type="number"
                  className="focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Categorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Selectionner une categorie...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label={<span className="font-medium text-slate-700">Ordre de mise en avant</span>}
                value={featuredOrder}
                onChange={(e) => setFeaturedOrder(e.target.value)}
                type="number"
                className="focus:border-indigo-500 focus:ring-indigo-500"
              />

              <div>
                <Input
                  label={<span className="font-medium text-slate-700">URL image du produit</span>}
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://... ou /static/banner1.jpg"
                  className="focus:border-indigo-500 focus:ring-indigo-500"
                />
                {image ? (
                  <div className="relative mt-2">
                    <img src={resolveImageUrl(image, "")} alt="Apercu" className="h-32 w-full rounded-xl object-cover shadow-md" />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow-sm transition-colors hover:bg-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">Utilisez une URL complete ou un chemin relatif (`/static/...`).</p>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100">
                <div className={`rounded-lg p-1.5 ${isFeatured ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-500"}`}>
                  <Star className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">Mettre en avant sur la boutique</span>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="ml-auto h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800"
                type="submit"
                disabled={!name}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingId ? "Enregistrer" : "Creer"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={resetForm} className="px-4">
                  Annuler
                </Button>
              )}
            </div>
          </form>

          <div className="space-y-4 lg:col-span-8">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <span className="rounded-lg bg-indigo-100 p-1.5 text-indigo-600">
                  <Package className="h-4 w-4" />
                </span>
                Liste des produits
                <span className="text-sm font-normal text-slate-500">({products.length})</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50"
                >
                  Nom <SortIcon field="name" />
                </button>
                <button
                  onClick={() => toggleSort("price")}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50"
                >
                  Prix <SortIcon field="price" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
                <span className="mt-3 text-sm text-slate-500">Chargement des produits...</span>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {products.map((p, index) => (
                    <div
                      key={p._id}
                      className="group animate-in slide-in-from-bottom-2 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {p.images?.[0] ? (
                            <img src={resolveImageUrl(p.images[0])} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-slate-800">{p.name}</h3>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="text-lg font-bold text-indigo-600">{Number(p.price).toFixed(2)} EUR</span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {p.category || "Sans categorie"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className={`text-lg font-semibold ${p.countInStock > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                              {p.countInStock}
                            </div>
                            <div className="text-xs text-slate-400">en stock</div>
                          </div>

                          {p.isFeatured && (
                            <div className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-amber-700">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span className="text-xs font-medium">#{p.featuredOrder ?? 0}</span>
                            </div>
                          )}

                          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => startEdit(p)}
                              className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
                              title="Editer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDelete(p._id)}
                              className="rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-rose-100 hover:text-rose-600"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!loading && products.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <p className="font-medium text-slate-500">Aucun produit trouve</p>
                    <p className="mt-1 text-sm text-slate-400">Ajoutez un nouveau produit ou modifiez vos filtres</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="bg-white"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Precedent
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                            page === p ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="bg-white"
                    >
                      Suivant
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
