import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ArrowRight, Loader2, FolderTree } from "lucide-react";
import { resolveImageUrl } from "../../lib/image";

export function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/categories");
        const rootCategories = (data.categories || [])
          .filter((c) => c.isActive !== false && !c.parent)
          .slice(0, 6);
        if (mounted) setCategories(rootCategories);
      } catch {
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fallbackCategories = [
    {
      _id: "audio",
      name: "Audio",
      image: "/static/slideBanner1.jpg",
      description: "Tous vos essentiels son"
    },
    {
      _id: "accessoires",
      name: "Accessoires",
      image: "/static/slideBanner2.jpg",
      description: "Claviers, souris, gadgets"
    },
    {
      _id: "wearables",
      name: "Wearables",
      image: "/static/banner1.jpg",
      description: "Montres et objets connectes"
    }
  ];

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-800">Explorer par categorie</h2>
            <p className="text-sm text-slate-500">Trouvez ce que vous cherchez par univers</p>
          </div>
        </div>
        <Link to="/" className="hidden items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 sm:flex">
          Toutes les categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayCategories.map((category, index) => (
          <Link
            key={category._id}
            to={`/?category=${encodeURIComponent(category.name || category._id)}`}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={resolveImageUrl(category.image)}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <h3 className="text-lg font-bold text-white">{category.name}</h3>
                {category.description && <p className="mt-1 line-clamp-1 text-sm text-white/80">{category.description}</p>}
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-white/90 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <span>Explorer</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
          Toutes les categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
