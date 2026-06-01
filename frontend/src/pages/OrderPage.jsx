import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Container } from "../components/Container";
import { fetchOrder } from "../features/orders/ordersSlice";
import { resolveImageUrl } from "../lib/image";

export function OrderPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: order, status, error } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  return (
    <Container>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Commande</h1>
          <p className="mt-1 text-sm text-slate-600">ID: {id}</p>
        </div>
        <Link to="/" className="text-sm font-medium text-slate-900 hover:underline">
          Retour à l’accueil
        </Link>
      </div>

      {status === "loading" ? (
        <div className="mt-6 text-sm text-slate-600">Chargement…</div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {String(error)}
        </div>
      ) : !order ? null : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold">Livraison</div>
              <div className="mt-2 text-sm text-slate-700">
                <div className="font-medium">{order.shippingAddress?.fullName}</div>
                <div>
                  {order.shippingAddress?.address}, {order.shippingAddress?.postalCode} {order.shippingAddress?.city}
                </div>
                <div>{order.shippingAddress?.country}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold">Articles</div>
              <div className="mt-3 space-y-3">
                {order.orderItems?.map((it) => (
                  <div key={it.product} className="flex items-center gap-4">
                    <img
                      src={resolveImageUrl(it.image)}
                      alt={it.name}
                      className="h-14 w-20 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{it.name}</div>
                      <div className="text-sm text-slate-600">
                        {it.qty} × {Number(it.price).toFixed(2)} €
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{Number(it.qty * it.price).toFixed(2)} €</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold">Récap</div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">Articles</span>
              <span className="font-medium">{Number(order.itemsPrice).toFixed(2)} €</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">Livraison</span>
              <span className="font-medium">{Number(order.shippingPrice).toFixed(2)} €</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">Taxe</span>
              <span className="font-medium">{Number(order.taxPrice).toFixed(2)} €</span>
            </div>
            <div className="mt-3 h-px bg-slate-200" />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">Total</span>
              <span className="text-lg font-semibold">{Number(order.totalPrice).toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

