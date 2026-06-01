import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { ProductCard } from "../ProductCard";
import { getRecentlyViewed } from "../../lib/recentlyViewed";

export function RecentlyViewed() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(getRecentlyViewed(4));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2 text-slate-800">
        <History className="h-4 w-4 text-indigo-600" />
        <h3 className="text-lg font-semibold">Recemment vus</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
