import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../components/Container";
import { fetchMyOrders } from "../features/orders/ordersSlice";

export function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const orders = useSelector((s) => s.orders.mine);

  useEffect(() => {
    const isAdminUser = Boolean(user?.isAdmin || user?.roles?.some((r) => ["admin", "order_manager"].includes(r)));
    if (!user) {
      navigate("/login?next=/orders");
      return;
    }
    if (isAdminUser) {
      navigate("/admin/orders");
      return;
    }
    dispatch(fetchMyOrders());
  }, [user, navigate, dispatch]);

  return (
    <Container>
      <h1 className="text-2xl font-semibold tracking-tight">Mes commandes</h1>
      <p className="mt-1 text-sm text-slate-600">Retrouve l’historique de tes achats.</p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-mono text-xs">{o._id.slice(-8)}</td>
                <td className="px-4 py-3">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold">{Number(o.totalPrice).toFixed(2)} €</td>
                <td className="px-4 py-3 text-slate-700">{o.status || "created"}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/order/${o._id}`} className="font-medium text-slate-900 hover:underline">
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-600" colSpan={5}>
                  Aucune commande pour le moment.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

