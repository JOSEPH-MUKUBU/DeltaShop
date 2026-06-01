import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Truck, RefreshCcw, Star } from "lucide-react";
import { api } from "../../lib/api";

const trustPoints = [
  {
    icon: Truck,
    title: "Livraison rapide",
    text: "Expedition en 24h sur les commandes valides."
  },
  {
    icon: RefreshCcw,
    title: "Retours faciles",
    text: "14 jours pour changer d'avis."
  },
  {
    icon: ShieldCheck,
    title: "Paiement securise",
    text: "Transactions chiffrees et protegees."
  }
];

const fallbackReviews = [
  {
    _id: "fallback-1",
    authorName: "Sonia M.",
    rating: 5,
    comment: "Commande recue rapidement, produit conforme et bien emballe."
  },
  {
    _id: "fallback-2",
    authorName: "Karim B.",
    rating: 5,
    comment: "Navigation claire, paiement simple, tres bonne experience."
  },
  {
    _id: "fallback-3",
    authorName: "Julie T.",
    rating: 4,
    comment: "Support reactif et livraison dans les delais annonces."
  }
];

export function TrustAndReviews() {
  const [reviews, setReviews] = useState(fallbackReviews);
  const [averageRating, setAverageRating] = useState(4.7);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/reviews", { params: { limit: 3 } });
        if (!mounted) return;
        if (Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
        if (typeof data.averageRating === "number" && data.averageRating > 0) {
          setAverageRating(data.averageRating);
        }
      } catch {
        // Keep fallback values silently.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const ratingLabel = useMemo(() => Number(averageRating).toFixed(1), [averageRating]);

  return (
    <section className="mt-12">
      <div className="grid gap-4 lg:grid-cols-3">
        {trustPoints.map((point) => (
          <div key={point.title} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 inline-flex rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <point.icon className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">{point.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{point.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-800">Ils nous font confiance</h3>
          <div className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700">
            <Star className="h-4 w-4 fill-current" />
            {ratingLabel}/5
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review._id || review.authorName} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: Math.max(1, Math.min(5, Number(review.rating || 0))) }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-700">"{review.comment}"</p>
              <p className="mt-2 text-xs font-medium text-slate-500">{review.authorName}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
