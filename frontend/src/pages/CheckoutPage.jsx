import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { clearCart, setShippingAddress } from "../features/cart/cartSlice";
import { createOrder } from "../features/orders/ordersSlice";

export function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const cart = useSelector((s) => s.cart);
  const { status, error, current } = useSelector((s) => s.orders);

  const [fullName, setFullName] = useState(cart.shippingAddress?.fullName || user?.name || "");
  const [address, setAddress] = useState(cart.shippingAddress?.address || "");
  const [city, setCity] = useState(cart.shippingAddress?.city || "");
  const [postalCode, setPostalCode] = useState(cart.shippingAddress?.postalCode || "");
  const [country, setCountry] = useState(cart.shippingAddress?.country || "France");
  const [phone, setPhone] = useState(cart.shippingAddress?.phone || "");

  useEffect(() => {
    if (!user) navigate("/login?next=/checkout");
  }, [user, navigate]);

  useEffect(() => {
    if (current?._id) {
      dispatch(clearCart());
      navigate(`/order/${current._id}`);
    }
  }, [current, dispatch, navigate]);

  const subtotal = useMemo(() => cart.items.reduce((sum, i) => sum + i.price * i.qty, 0), [cart.items]);

  return (
    <Container>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-1 text-sm text-slate-600">Adresse de livraison et validation de commande.</p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {String(error)}
            </div>
          ) : null}

          <form
            className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const shippingAddress = { fullName, address, city, postalCode, country, phone };
              dispatch(setShippingAddress(shippingAddress));
              dispatch(
                createOrder({
                  orderItems: cart.items.map((i) => ({ product: i.productId, qty: i.qty })),
                  shippingAddress,
                  paymentMethod: cart.paymentMethod
                })
              );
            }}
          >
            <Input label="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Téléphone (optionnel)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <Input label="Ville" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="Code postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
            <Input label="Pays" value={country} onChange={(e) => setCountry(e.target.value)} required />

            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="submit" disabled={status === "loading" || cart.items.length === 0} className="flex-1">
                {status === "loading" ? "Commande…" : "Confirmer la commande"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate("/cart")}>
                Retour panier
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Résumé</div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-600">Articles</span>
            <span className="font-medium">{subtotal.toFixed(2)} €</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-slate-600">Livraison</span>
            <span className="font-medium">{subtotal >= 50 ? "0.00 €" : "5.99 €"}</span>
          </div>
          <div className="mt-3 h-px bg-slate-200" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-slate-600">Total</span>
            <span className="text-lg font-semibold">{(subtotal + (subtotal >= 50 ? 0 : 5.99)).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </Container>
  );
}

