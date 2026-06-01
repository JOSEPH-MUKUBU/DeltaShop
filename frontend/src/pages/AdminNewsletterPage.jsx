import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { 
  Mail, Users, Search, Download, Trash2, CheckCircle2, 
  AlertCircle, Loader2, ArrowLeft, RefreshCw, Filter,
  Calendar, UserCheck, UserX
} from "lucide-react";

export function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Fetch subscribers
  useEffect(() => {
    loadSubscribers();
  }, [filter]);

  async function loadSubscribers() {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?active=${filter === "active"}` : "";
      const { data } = await api.get(`/api/newsletter/subscribers${params}`);
      setSubscribers(data.subscribers || []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur chargement abonnés");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (email) => {
    if (!confirm(`Supprimer l'abonné ${email} ?`)) return;
    
    try {
      await api.post("/api/newsletter/unsubscribe", { email });
      setSuccess(`Abonné ${email} supprimé`);
      loadSubscribers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur suppression");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Email", "Date d'inscription", "Statut", "Source"],
      ...subscribers.map(s => [
        s.email,
        new Date(s.subscribedAt).toLocaleDateString("fr-FR"),
        s.isActive ? "Actif" : "Désinscrit",
        s.source || "website"
      ])
    ].map(row => row.join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = subscribers.filter(s => s.isActive).length;
  const inactiveCount = subscribers.filter(s => !s.isActive).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des abonnés...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Newsletter</h1>
              <p className="text-slate-500">Gérez les abonnés à la newsletter</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total abonnés</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{subscribers.length}</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm">Actifs</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">{activeCount}</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <UserX className="h-4 w-4" />
              <span className="text-sm">Désinscrits</span>
            </div>
            <div className="text-2xl font-bold text-rose-600">{inactiveCount}</div>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </button>
            <button
              onClick={loadSubscribers}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Tous les abonnés</option>
              <option value="active">Actifs uniquement</option>
              <option value="inactive">Désinscrits</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Subscribers List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date d'inscription</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Source</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-800">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(subscriber.subscribedAt).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        {subscriber.source || "website"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
                        subscriber.isActive 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {subscriber.isActive ? (
                          <><UserCheck className="h-3 w-3" /> Actif</>
                        ) : (
                          <><UserX className="h-3 w-3" /> Inactif</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(subscriber.email)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200"
                        title="Désinscrire"
                      >
                        <Trash2 className="h-3 w-3" />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSubscribers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Mail className="mx-auto h-12 w-12 text-slate-300 mb-2" />
              <p>Aucun abonné trouvé</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              <p className="font-medium">Gestion des abonnés :</p>
              <ul className="mt-1 list-disc list-inside space-y-1 text-blue-600">
                <li>Les abonnés actifs recevront vos campagnes email</li>
                <li>La suppression désinscrit définitivement l'email</li>
                <li>Exportez la liste au format CSV pour vos outils de mailing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
