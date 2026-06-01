import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { 
  LayoutDashboard, Users, Package, FolderTree, ShoppingCart, 
  TrendingUp, Clock, CheckCircle2, X, ArrowUpRight, 
  DollarSign, Activity, Calendar, AlertCircle
} from "lucide-react";

const STATUS_COLORS = {
  created: "bg-slate-100 text-slate-600",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700"
};

const STATUS_LABELS = {
  created: "Créée",
  processing: "En cours",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée"
};

export function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/admin/summary");
        if (mounted) {
          setSummary(data);
          setError(null);
        }
      } catch (e) {
        if (mounted) setError(e?.message || "Erreur chargement dashboard");
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="mt-4 text-sm text-slate-500">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 backdrop-blur p-6 text-sm text-rose-800 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            {String(error)}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "Utilisateurs", 
      value: summary?.usersCount ?? 0, 
      icon: Users, 
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      label: "Produits", 
      value: summary?.productsCount ?? 0, 
      icon: Package, 
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600"
    },
    { 
      label: "Catégories", 
      value: summary?.categoriesCount ?? 0, 
      icon: FolderTree, 
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600"
    },
    { 
      label: "Commandes", 
      value: summary?.ordersCount ?? 0, 
      icon: ShoppingCart, 
      color: "bg-amber-500",
      gradient: "from-amber-500 to-amber-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-indigo-600" />
              Tableau de bord
            </h1>
            <p className="mt-2 text-slate-500">Vue d'ensemble des indicateurs clés de votre boutique</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="group rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Dernières commandes</h2>
                  <p className="text-sm text-slate-500">Les 5 commandes les plus récentes</p>
                </div>
              </div>
              <a 
                href="/admin/orders" 
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Voir tout
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            
            {summary?.recentOrders?.length > 0 ? (
              <div className="space-y-3">
                {summary.recentOrders.map((o, index) => (
                  <div 
                    key={o._id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">#{o._id.slice(-8)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </div>
                      <p className="font-medium text-slate-800 mt-0.5">{o.user?.name || "Client anonyme"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-indigo-600">{Number(o.totalPrice).toFixed(2)} €</p>
                      <p className="text-xs text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <ShoppingCart className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Aucune commande pour le moment</p>
                <p className="text-sm text-slate-400 mt-1">Les commandes apparaîtront ici dès que vos clients passeront des commandes</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Chiffre d'affaires</h2>
                  <p className="text-sm text-slate-500">Total des ventes</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-slate-800">
                {Number(summary?.revenue || 0).toFixed(2)} €
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>Sur {summary?.ordersCount || 0} commande(s)</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                  <Activity className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-slate-800">Astuces admin</h2>
              </div>
              <ul className="space-y-3">
                {[
                  "Utilisez les filtres et le tri sur les listes pour retrouver rapidement les données",
                  "Exportez les données en CSV pour vos rapports ou analyses externes",
                  "Gérez les catégories dédiées pour organiser votre catalogue produit",
                  "Attribuez des rôles spécifiques à votre équipe (produits, commandes, utilisateurs)"
                ].map((tip, index) => (
                  <li key={index} className="flex gap-3 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
