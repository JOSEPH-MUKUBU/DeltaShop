import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProduct } from "../features/products/productsSlice";
import { Container } from "../components/Container";
import { Button } from "../components/Button";
import { addToCart } from "../features/cart/cartSlice";
import { resolveImageUrl } from "../lib/image";
import { pushRecentlyViewed } from "../lib/recentlyViewed";

export function ProductPage() {
  const { idOrSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: product, status, error } = useSelector((s) => s.products);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    dispatch(fetchProduct(idOrSlug));
  }, [dispatch, idOrSlug]);

  useEffect(() => {
    setQty(1);
  }, [idOrSlug]);

  useEffect(() => {
    if (product?._id) pushRecentlyViewed(product);
  }, [product]);

  const img = useMemo(() => resolveImageUrl(product?.images?.[0]), [product]);
  const inStock = (product?.countInStock || 0) > 0;

  return (
    <Container>
      {status === "loading" ? (
        <div className="text-sm text-slate-600">Chargement…</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{String(error)}</div>
      ) : !product ? null : (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <img src={img} alt={product.name} className="h-full w-full object-cover" />
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-500">{product.category || "Produit"}</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{product.name}</h1>
            <div className="mt-4 text-2xl font-semibold">{Number(product.price).toFixed(2)} €</div>

            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              {product.description || "Aucune description pour le moment."}
            </p>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Stock</span>
                <span className={inStock ? "font-medium text-emerald-700" : "font-medium text-rose-700"}>
                  {inStock ? `${product.countInStock} dispo` : "Rupture"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <label className="text-sm text-slate-600">Quantité</label>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  disabled={!inStock}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {Array.from({ length: Math.max(1, Math.min(10, product.countInStock || 1)) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  disabled={!inStock}
                  onClick={() => {
                    dispatch(
                      addToCart({
                        productId: product._id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        image: resolveImageUrl(product.images?.[0], ""),
                        qty
                      })
                    );
                    navigate("/cart");
                  }}
                  className="w-full"
                >
                  Ajouter au panier
                </Button>
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  Retour
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

