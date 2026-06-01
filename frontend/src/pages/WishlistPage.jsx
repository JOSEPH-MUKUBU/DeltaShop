import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Container } from "../components/Container";
import { ProductCard } from "../components/ProductCard";
import { 
  Heart, Trash2, ShoppingBag, ArrowRight, Loader2,
  AlertCircle, HeartCrack
} from "lucide-react";

export function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login?next=/wishlist");
      return;
    }
    loadWishlist();
  }, [user, navigate]);

  async function loadWishlist() {
    try {
      setLoading(true);
      const { data } = await api.get("/api/wishlist");
      const items = Array.isArray(data.wishlist) ? data.wishlist.filter((item) => item?.product?._id) : [];
      setWishlist(items);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur chargement wishlist");
    } finally {
      setLoading(false);
    }
  }

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      await api.delete(`/api/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item?.product?._id !== productId));
    } catch (e) {
      setError("Erreur suppression");
    } finally {
      setRemoving(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Vider toute votre liste de souhaits ?")) return;
    try {
      await api.delete("/api/wishlist");
      setWishlist([]);
    } catch (e) {
      setError("Erreur lors du vidage");
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
          <p className="mt-4 text-slate-500">Chargement de votre wishlist...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Ma Wishlist</h1>
              <p className="text-slate-500">
                {wishlist.length} produit{wishlist.length !== 1 ? "s" : ""} sauvegardé
                {wishlist.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <HeartCrack className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              Votre wishlist est vide
            </h3>
            <p className="mt-2 text-slate-500">
              Ajoutez des produits à votre liste de souhaits en cliquant sur le cœur ❤️
            </p>
            <a
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Découvrir les produits
            </a>
          </div>
        ) : (
          <>
            {/* Actions */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {wishlist.length} article{wishlist.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="h-4 w-4" />
                Vider la liste
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlist.filter((item) => item?.product?._id).map((item) => (
                <div key={item._id} className="relative group">
                  <ProductCard product={item.product} />
                  <button
                    onClick={() => handleRemove(item.product._id)}
                    disabled={removing === item.product._id}
                    className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                    title="Retirer de la wishlist"
                  >
                    {removing === item.product._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-10 text-center">
              <a
                href="/products"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Continuer les achats
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
