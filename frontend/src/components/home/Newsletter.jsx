import { useState } from "react";
import { api } from "../../lib/api";
import { Mail, Send, CheckCircle2, X, Loader2, Sparkles, Bell } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    if (!consent) {
      setError("Veuillez accepter la politique de confidentialité");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/api/newsletter/subscribe", { email });
      setSuccess(true);
      setEmail("");
      setConsent(false);
    } catch (e) {
      setError(e?.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-white shadow-xl shadow-emerald-200">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">Inscription réussie !</h3>
          <p className="mt-2 text-emerald-100">
            Merci de votre inscription. Vous recevrez bientôt nos offres exclusives et nouveautés.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
          >
            S'inscrire avec un autre email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-800 shadow-xl shadow-slate-200">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Bell className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Restez informé des offres exclusives</h3>
          <p className="mt-2 text-slate-500">
            Inscrivez-vous à notre newsletter et recevez en avant-première nos promotions, 
            nouveautés et conseils personnalisés.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="Votre adresse email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-12 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-700 hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Inscription...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>S'inscrire</span>
                </>
              )}
            </button>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setError(null);
              }}
              className="mt-0.5 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600">
              J'accepte de recevoir les newsletters de DeltaShop et j'ai lu la{" "}
              <a href="/privacy" className="text-indigo-600 underline hover:text-indigo-700">
                politique de confidentialité
              </a>
              . Je peux me désinscrire à tout moment.
            </span>
          </label>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <X className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Offres exclusives</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Nouveautés en avant-première</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>-10% sur votre première commande</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
