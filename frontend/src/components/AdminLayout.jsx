import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container } from "./Container";

const tabs = [
  { to: "/admin", label: "Tableau de bord", end: true },
  { to: "/admin/products", label: "Produits" },
  { to: "/admin/categories", label: "Catégories" },
  { to: "/admin/trending", label: "Tendance" },
  { to: "/admin/sliders", label: "Bannières" },
  { to: "/admin/newsletter", label: "Newsletter" },
  { to: "/admin/users", label: "Utilisateurs" },
  { to: "/admin/orders", label: "Commandes" }
];

export function AdminLayout() {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!user.isAdmin && !user.roles?.some(r => ["admin", "product_manager", "order_manager", "user_manager"].includes(r))) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container>
      <div className="mb-4 mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 text-sm">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              [
                "rounded-xl px-3 py-2 font-medium transition",
                isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white/70"
              ].join(" ")
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </Container>
  );
}

