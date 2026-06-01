import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Users, Search, Filter, X, ChevronLeft, ChevronRight, Shield, User, CheckCircle2, Trash2, Edit2, UserCheck, UserX } from "lucide-react";

const ROLE_LABELS = {
  admin: "Admin",
  product_manager: "Produits",
  order_manager: "Commandes",
  user_manager: "Utilisateurs",
  viewer: "Lecteur"
};

const ROLE_COLORS = {
  admin: "bg-amber-100 text-amber-700",
  product_manager: "bg-blue-100 text-blue-700",
  order_manager: "bg-emerald-100 text-emerald-700",
  user_manager: "bg-purple-100 text-purple-700",
  viewer: "bg-slate-100 text-slate-600"
};

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    isActive: "",
    hasRole: ""
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
      if (filters.search) params.set("search", filters.search);
      if (filters.isActive) params.set("isActive", filters.isActive);
      if (filters.hasRole) params.set("hasRole", filters.hasRole);

      const { data } = await api.get(`/api/admin/users?${params.toString()}`);
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
      setError(null);
    } catch (e) {
      setError(e?.message || "Erreur chargement utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleAdmin(u) {
    try {
      await api.put(`/api/admin/users/${u._id}`, { isAdmin: !u.isAdmin });
      await load();
    } catch (e) {
      setError(e?.message || "Erreur");
    }
  }

  async function toggleActive(u) {
    try {
      await api.put(`/api/admin/users/${u._id}`, { isActive: !u.isActive });
      await load();
    } catch (e) {
      setError(e?.message || "Erreur");
    }
  }

  async function remove(u) {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/api/admin/users/${u._id}`);
      setMsg("Utilisateur supprimé");
      await load();
    } catch (e) {
      setError(e?.message || "Erreur suppression");
    }
  }

  async function exportCSV() {
    try {
      const response = await api.get("/api/admin/users/export", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `utilisateurs_${new Date().toISOString().split("T")[0]}.csv`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
              <Users className="h-8 w-8 text-indigo-600" />
              Utilisateurs
            </h1>
            <p className="mt-2 text-slate-500">Gérez les comptes clients et les droits administrateur</p>
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
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                placeholder="Rechercher..."
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters(f => ({ ...f, isActive: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              >
                <option value="">Tous les statuts</option>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
            <div>
              <select
                value={filters.hasRole}
                onChange={(e) => setFilters(f => ({ ...f, hasRole: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              >
                <option value="">Tous les rôles</option>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => { setFilters({ search: "", isActive: "", hasRole: "" }); setPage(1); }} 
              className="text-xs bg-white hover:bg-slate-50"
            >
              <X className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="mt-3 text-sm text-slate-500">Chargement des utilisateurs...</span>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {users.map((u, index) => (
                <div 
                  key={u._id} 
                  className="group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${u.isActive !== false ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                      {u.isAdmin ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800">{u.name}</h3>
                        {u.isActive === false && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500">Inactif</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{u.email}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {u.isAdmin && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                        {u.roles?.map(role => (
                          <span key={role} className={`rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[role] || 'bg-slate-100 text-slate-600'}`}>
                            {ROLE_LABELS[role] || role}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={u.email === "admin@delta.com"}
                        className={`p-2 rounded-lg transition-colors ${u.isActive !== false ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        title={u.isActive !== false ? "Désactiver" : "Activer"}
                      >
                        {u.isActive !== false ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => toggleAdmin(u)}
                        disabled={u.email === "admin@delta.com"}
                        className={`p-2 rounded-lg transition-colors ${u.isAdmin ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        title={u.isAdmin ? "Retirer admin" : "Passer admin"}
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      {u.email !== "admin@delta.com" && (
                        <button
                          onClick={() => remove(u)}
                          className="p-2 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!loading && users.length === 0 && (
              <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
                <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Aucun utilisateur trouvé</p>
                <p className="text-sm text-slate-400 mt-1">Modifiez vos filtres ou ajoutez de nouveaux utilisateurs</p>
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

