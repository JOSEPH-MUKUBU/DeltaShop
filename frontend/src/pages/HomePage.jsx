import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../features/products/productsSlice";
import { Container } from "../components/Container";
import { ProductCard } from "../components/ProductCard";
import { TrendingProducts } from "../components/home/TrendingProducts";
import { HeroBanner } from "../components/home/HeroBanner";
import { Newsletter } from "../components/home/Newsletter";
import { CategorySection } from "../components/home/CategorySection";
import { DealsOfDay } from "../components/home/DealsOfDay";
import { RecentlyViewed } from "../components/home/RecentlyViewed";
import { TrustAndReviews } from "../components/home/TrustAndReviews";
import { PopularBrandsBar } from "../components/home/PopularBrandsBar";
import { api } from "../lib/api";

export function HomePage() {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const isFiltering = q.trim().length > 0 || category.trim().length > 0;

  const { list, status, error } = useSelector((s) => s.products);
  const [sliders, setSliders] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/sliders");
        if (mounted) setSliders(data.sliders || []);
      } catch {
        // fallback silencieux
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    dispatch(fetchProducts({ q, category }));
  }, [dispatch, q, category]);

  return (
    <div>
      <Container>
        <HeroBanner sliders={sliders} />
        {!isFiltering && <PopularBrandsBar />}

        {!isFiltering && (
          <>
            <DealsOfDay />
            <TrendingProducts />
            <CategorySection />
          </>
        )}

        <div className={`${isFiltering ? "mt-8" : "mt-10"} flex items-end justify-between gap-4`}>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Produits</h2>
            <p className="mt-1 text-sm text-slate-600">
              {q ? (
                <>
                  Resultats pour <span className="font-medium">"{q}"</span>
                </>
              ) : category ? (
                <>
                  Produits de la categorie <span className="font-medium">"{category}"</span>
                </>
              ) : (
                "Derniers produits ajoutes"
              )}
            </p>
          </div>
        </div>

        {status === "loading" ? (
          <div className="mt-6 text-sm text-slate-600">Chargement...</div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{String(error)}</div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {!isFiltering && <RecentlyViewed />}

        <TrustAndReviews />

        <div className="mb-8 mt-16">
          <Newsletter />
        </div>
      </Container>
    </div>
  );
}
