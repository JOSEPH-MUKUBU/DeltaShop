import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../components/Container";
import { Button } from "../components/Button";
import { removeFromCart, setQty } from "../features/cart/cartSlice";
import { resolveImageUrl } from "../lib/image";

export function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const { user } = useSelector((s) => s.auth);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  return (
    <Container>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panier</h1>
          <p className="mt-1 text-sm text-slate-600">Gère tes articles avant de passer commande.</p>
        </div>
        <Link to="/" className="text-sm font-medium text-slate-900 hover:underline">
          Continuer les achats
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          Ton panier est vide.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.productId} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-4">
                  <img
                    src={resolveImageUrl(it.image)}
                    alt={it.name}
                    className="h-20 w-28 rounded-2xl object-cover"
                  />
                  <div className="flex flex-1 items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">{it.name}</div>
                      <div className="mt-1 text-sm text-slate-600">{Number(it.price).toFixed(2)} €</div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-slate-600">Qté</span>
                        <select
                          value={it.qty}
                          onChange={(e) => dispatch(setQty({ productId: it.productId, qty: Number(e.target.value) }))}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          {Array.from({ length: 10 }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold">{Number(it.price * it.qty).toFixed(2)} €</div>
                      <button
                        onClick={() => dispatch(removeFromCart(it.productId))}
                        className="mt-2 text-sm font-medium text-rose-700 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold">Récap</div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">Sous-total</span>
              <span className="font-medium">{subtotal.toFixed(2)} €</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">Livraison</span>
              <span className="font-medium">{subtotal >= 50 ? "Offerte" : "5.99 €"}</span>
            </div>
            <div className="mt-3 h-px bg-slate-200" />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">Total estimé</span>
              <span className="text-lg font-semibold">{(subtotal + (subtotal >= 50 ? 0 : 5.99)).toFixed(2)} €</span>
            </div>

            <Button
              className="mt-4 w-full"
              onClick={() => {
                if (!user) navigate("/login?next=/checkout");
                else navigate("/checkout");
              }}
            >
              Passer commande
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}

