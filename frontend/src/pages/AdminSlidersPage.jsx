import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { resolveImageUrl } from "../lib/image";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Images, X, Edit2, Trash2, Save, Link2, Eye, EyeOff } from "lucide-react";

export function AdminSlidersPage() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/api/sliders/admin");
      setSliders(data.sliders || []);
      setError(null);
    } catch (e) {
      setError(e?.message || "Erreur chargement sliders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setTitle("");
    setSubtitle("");
    setImage("");
    setLink("");
    setOrder("0");
    setIsActive(true);
    setEditingId(null);
  }

  function startEdit(s) {
    setEditingId(s._id);
    setTitle(s.title);
    setSubtitle(s.subtitle || "");
    setImage(s.image || "");
    setLink(s.link || "");
    setOrder(String(s.order ?? 0));
    setIsActive(Boolean(s.isActive));
  }

  async function onSave(e) {
    e.preventDefault();
    const payload = {
      title,
      subtitle,
      image,
      link,
      order: Number(order),
      isActive
    };
    if (editingId) {
      await api.put(`/api/sliders/${editingId}`, payload);
    } else {
      await api.post("/api/sliders", payload);
    }
    resetForm();
    await load();
  }

  async function onDelete(id) {
    if (!window.confirm("Supprimer ce slider ?")) return;
    await api.delete(`/api/sliders/${id}`);
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-3xl font-bold text-transparent">
              <Images className="h-8 w-8 text-indigo-600" />
              Sliders
            </h1>
            <p className="mt-2 text-slate-500">Gerez les bannieres (image, texte, lien cliquable)</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 backdrop-blur">
            <X className="h-4 w-4" />
            {String(error)}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={onSave}
            className="space-y-5 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-lg shadow-slate-200/50 lg:col-span-4"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className={`rounded-xl p-2 ${editingId ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`}>
                {editingId ? <Edit2 className="h-5 w-5" /> : <Images className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">{editingId ? "Modifier le slider" : "Nouveau slider"}</h2>
                <p className="text-xs text-slate-500">{editingId ? "Modifiez les informations" : "Ajoutez une banniere"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label={<span className="font-medium text-slate-700">Titre</span>}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre principal"
                className="focus:border-indigo-500 focus:ring-indigo-500"
                required
              />

              <Input
                label={<span className="font-medium text-slate-700">Sous-titre</span>}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Texte secondaire"
                className="focus:border-indigo-500 focus:ring-indigo-500"
              />

              <Input
                label={<span className="font-medium text-slate-700">Lien (optionnel)</span>}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/product/slug ou URL complete"
                className="focus:border-indigo-500 focus:ring-indigo-500"
              />

              <Input
                label={<span className="font-medium text-slate-700">Ordre d'affichage</span>}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                type="number"
                className="focus:border-indigo-500 focus:ring-indigo-500"
              />

              <div>
                <Input
                  label={<span className="font-medium text-slate-700">URL image de la banniere</span>}
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://... ou /static/banner1.jpg"
                  className="focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                {image ? (
                  <div className="relative mt-2">
                    <img
                      src={resolveImageUrl(image, "")}
                      alt="Apercu"
                      className="h-32 w-full rounded-xl object-cover shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow-sm transition-colors hover:bg-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">Utilisez une URL complete ou un chemin relatif (`/static/...`).</p>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100">
                <div className={`rounded-lg p-1.5 ${isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                  {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium text-slate-700">Slider actif</span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="ml-auto h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800"
                type="submit"
                disabled={!title || !image}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingId ? "Enregistrer" : "Creer"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={resetForm} className="px-4">
                  Annuler
                </Button>
              )}
            </div>
          </form>

          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
                <span className="mt-3 text-sm text-slate-500">Chargement des sliders...</span>
              </div>
            ) : (
              <div className="grid gap-4">
                {sliders.map((s, index) => (
                  <div
                    key={s._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex">
                      <div className="h-32 w-48 flex-shrink-0">
                        <img src={resolveImageUrl(s.image)} alt={s.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-800">{s.title}</h3>
                              {s.subtitle && <p className="mt-1 text-sm text-slate-500">{s.subtitle}</p>}
                            </div>
                            {!s.isActive && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">Inactif</span>}
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                            <span>Ordre: {s.order ?? 0}</span>
                            {s.link && (
                              <span className="flex items-center gap-1">
                                <Link2 className="h-3 w-3" /> {s.link}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => startEdit(s)}
                            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Editer
                          </button>
                          <button
                            onClick={() => onDelete(s._id)}
                            className="flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1.5 text-sm text-rose-600 transition-colors hover:bg-rose-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && sliders.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
                    <Images className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <p className="font-medium text-slate-500">Aucun slider</p>
                    <p className="mt-1 text-sm text-slate-400">Creez votre premiere banniere pour animer la page d'accueil</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
