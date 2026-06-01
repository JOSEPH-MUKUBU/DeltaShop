import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart, LogOut, UserRound, Shield, Heart } from "lucide-react";
import { Container } from "./Container";
import { logout } from "../features/auth/authSlice";
import { useEffect, useMemo, useState } from "react";

export function Header() {
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) => s.cart.items.reduce((sum, i) => sum + i.qty, 0));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  const isAdmin = useMemo(
    () => Boolean(user?.isAdmin || user?.roles?.some((r) => ["admin", "order_manager"].includes(r))),
    [user]
  );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <Container className="flex items-center gap-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <img src="/static/logo.png" alt="Delta" className="h-8 w-8 rounded-lg object-cover" />
          <span>DeltaShop</span>
        </Link>

        <form
          className="flex flex-1 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
          />
        </form>

        <nav className="flex items-center gap-2">
          {user && (
            <NavLink
              to="/wishlist"
              className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favoris</span>
            </NavLink>
          )}
          <NavLink
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Panier</span>
            {cartCount ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-xs text-white">
                {cartCount}
              </span>
            ) : null}
          </NavLink>

          {user ? (
            <>
              <NavLink
                to={isAdmin ? "/admin/orders" : "/orders"}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
              >
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">Mes commandes</span>
              </NavLink>

              {isAdmin ? (
                <NavLink
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </NavLink>
              ) : null}

              <button
                onClick={() => {
                  dispatch(logout());
                  navigate("/");
                }}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100">
              Connexion
            </NavLink>
          )}
        </nav>
      </Container>
    </header>
  );
}

