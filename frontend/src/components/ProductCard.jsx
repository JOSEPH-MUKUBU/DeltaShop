import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Heart, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import { resolveImageUrl } from "../lib/image";

export function ProductCard({ product, trending = false }) {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const img = resolveImageUrl(product.images?.[0]);
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await api.delete(`/api/wishlist/${product._id}`);
        setIsInWishlist(false);
      } else {
        await api.post("/api/wishlist", { productId: product._id });
        setIsInWishlist(true);
      }
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:border-indigo-200 ${
        trending ? 'hover:-translate-y-1' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img 
          src={img} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {trending && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              <TrendingUp className="h-3 w-3" />
              Tendance
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              -{discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              Nouveau
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
            isInWishlist 
              ? 'bg-rose-500 text-white shadow-md' 
              : 'bg-white/90 text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500'
          }`}
          title={isInWishlist ? "Retirer de la liste" : "Ajouter aux favoris"}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-slate-900/80 to-transparent p-4 pt-12 transition-transform duration-300 group-hover:translate-y-0">
          <button 
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-indigo-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add to cart logic here
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Rating */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {product.category?.name || product.category || "Produit"}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-medium text-slate-700">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewCount || 0})</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto pt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-600">
            {Number(product.price).toFixed(2)} €
          </span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">
              {Number(product.oldPrice).toFixed(2)} €
            </span>
          )}
        </div>

        {/* Stats for trending */}
        {trending && product.soldCount > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <ShoppingCart className="h-3 w-3" />
            <span>{product.soldCount} vendus récemment</span>
          </div>
        )}
      </div>
    </Link>
  );
}

