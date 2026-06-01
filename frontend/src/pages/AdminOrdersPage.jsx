import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ShoppingCart, Filter, X, ChevronLeft, ChevronRight, CheckCircle2, Package, Truck, CheckCheck, Ban, Clock, Calendar, Euro, User } from "lucide-react";

const STATUS_LABELS = {
  created: "Créée",
  processing: "En cours",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée"
};

const STATUS_COLORS = {
  created: "bg-slate-100 text-slate-600",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700"
};

const STATUS_ICONS = {
  created: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCheck,
  cancelled: Ban
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    minPrice: "",
    maxPrice: "",
    dateFrom: "",
    dateTo: ""
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", 20);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      if (filters.status) params.set("status", filters.status);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const { data } = await api.get(`/api/admin/orders?${params.toString()}`);
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
      setError(null);
    } catch (e) {
      setError(e?.message || "Erreur chargement commandes");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(orderId, status) {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status });
      await load();
    } catch (e) {
      setError(e?.message || "Erreur mise à jour statut");
    }
  }

  async function exportCSV() {
    try {
      const response = await api.get("/api/admin/orders/export", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `commandes_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-emerald-50 text-emerald-700";
      case "shipped": return "bg-blue-50 text-blue-700";
      case "processing": return "bg-amber-50 text-amber-700";
      case "cancelled": return "bg-rose-50 text-rose-700";
      default: return "bg-slate-50 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-indigo-600" />
              Commandes
            </h1>
            <p className="mt-2 text-slate-500">Suivez et mettez à jour le statut des commandes</p>
          </div>
          <Button variant="outline" onClick={exportCSV} className="text-sm bg-white hover:bg-slate-50 border-slate-200 shadow-sm">
            Export CSV
          </Button>
        </div>

        {msg && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 backdrop-blur p-4 text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {msg}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/80 backdrop-blur p-4 text-sm text-rose-800 flex items-center gap-2">
            <X className="h-4 w-4" />
            {String(error)}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-700">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-semibold">Filtres</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={filters.minPrice}
                onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                placeholder="Min €"
                type="number"
              />
              <Input
                value={filters.maxPrice}
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                placeholder="Max €"
                type="number"
              />
            </div>
            <Input
              value={filters.dateFrom}
              onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              type="date"
              className="text-sm"
            />
            <Input
              value={filters.dateTo}
              onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
              type="date"
              className="text-sm"
            />
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => { setFilters({ status: "", minPrice: "", maxPrice: "", dateFrom: "", dateTo: "" }); setPage(1); }} 
                className="text-xs w-full bg-white hover:bg-slate-50"
              >
                <X className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="mt-3 text-sm text-slate-500">Chargement des commandes...</span>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {orders.map((o, index) => {
                const StatusIcon = STATUS_ICONS[o.status] || Clock;
                return (
                  <div 
                    key={o._id} 
                    className="group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${STATUS_COLORS[o.status]}`}>
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-slate-400">#{o._id.slice(-8)}</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-sm text-slate-700">
                            <User className="h-4 w-4 text-slate-400" />
                            {o.user?.name || "—"}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">{Number(o.totalPrice).toFixed(2)} €</div>
                          <div className="text-xs text-slate-400">{o.items?.length || 0} article(s)</div>
                        </div>

                        <div className="flex gap-1.5">
                          {['processing', 'shipped', 'delivered'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(o._id, status)}
                              disabled={o.status === status}
                              className={`p-2 rounded-lg transition-all ${
                                o.status === status 
                                  ? STATUS_COLORS[status] + ' opacity-50 cursor-not-allowed'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title={STATUS_LABELS[status]}
                            >
                              {status === 'processing' && <Package className="h-4 w-4" />}
                              {status === 'shipped' && <Truck className="h-4 w-4" />}
                              {status === 'delivered' && <CheckCheck className="h-4 w-4" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!loading && orders.length === 0 && (
              <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
                <ShoppingCart className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Aucune commande trouvée</p>
                <p className="text-sm text-slate-400 mt-1">Modifiez vos filtres pour voir plus de résultats</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6">
                <Button 
                  variant="outline" 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="bg-white"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === p 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="bg-white"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

