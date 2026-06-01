import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { resolveImageUrl } from "../lib/image";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { FolderTree, X, CheckCircle2, Edit2, Trash2, Save, Folder, FolderOpen, ChevronRight, ChevronDown, Upload, Image as ImageIcon } from "lucide-react";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parent, setParent] = useState("");
  const [order, setOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/api/categories");
      setCategories(data.categories || []);
      setError(null);
    } catch (e) {
      setError(e?.message || "Erreur chargement catégories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setParent("");
    setOrder("0");
    setIsActive(true);
    setImage("");
  }

  function startEdit(c) {
    setEditingId(c._id);
    setName(c.name);
    setDescription(c.description || "");
    setParent(c.parent?._id || "");
    setOrder(String(c.order ?? 0));
    setIsActive(c.isActive !== false);
    setImage(c.image || "");
  }

  async function onSave(e) {
    e.preventDefault();
    setMsg(null);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      parent: parent || null,
      order: Number(order),
      isActive,
      image: image || null
    };
    try {
      if (editingId) {
        await api.put(`/api/categories/${editingId}`, payload);
        setMsg("Catégorie mise à jour");
      } else {
        await api.post("/api/categories", payload);
        setMsg("Catégorie créée");
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Erreur");
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    setMsg(null);
    try {
      await api.delete(`/api/categories/${id}`);
      setMsg("Catégorie supprimée");
      if (editingId === id) resetForm();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Erreur");
    }
  }

  const parentOptions = categories.filter(c => c._id !== editingId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
              <FolderTree className="h-8 w-8 text-indigo-600" />
              Catégories
            </h1>
            <p className="mt-2 text-slate-500">Gérez les catégories et sous-catégories de produits</p>
          </div>
        </div>

        {msg && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 backdrop-blur p-4 text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {msg}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/80 backdrop-blur p-4 text-sm text-rose-800 flex items-center gap-2">
            <X className="h-4 w-4" />
            {String(error)}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          <form onSubmit={onSave} className="lg:col-span-4 space-y-5 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-lg shadow-slate-200/50">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className={`p-2 rounded-xl ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {editingId ? <Edit2 className="h-5 w-5" /> : <FolderTree className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">{editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
                <p className="text-xs text-slate-500">{editingId ? "Modifiez les informations" : "Ajoutez une catégorie"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input 
                label={<span className="text-slate-700 font-medium">Nom</span>}
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Nom de la catégorie"
                className="focus:ring-indigo-500 focus:border-indigo-500"
              />
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
                  rows={3}
                  placeholder="Description optionnelle..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Catégorie parente</label>
                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                >
                  <option value="">Aucune (racine)</option>
                  {parentOptions.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <Input 
                label={<span className="text-slate-700 font-medium">Ordre d'affichage</span>}
                value={order} 
                onChange={(e) => setOrder(e.target.value)} 
                type="number"
                className="focus:ring-indigo-500 focus:border-indigo-500"
              />

              {/* Image Upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Image de la catégorie</label>
                <div className="space-y-2">
                  {image && (
                    <div className="relative">
                      <img 
                        src={resolveImageUrl(image, "")} 
                        alt="Category preview" 
                        className="h-32 w-full rounded-xl object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="absolute right-2 top-2 p-1.5 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input 
                      value={image} 
                      onChange={(e) => setImage(e.target.value)} 
                      placeholder="URL de l'image (ex: /static/banner1.jpg)"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Entrez l'URL d'une image ou laissez vide pour utiliser l'image par défaut</p>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                  {isActive ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                </div>
                <span className="text-sm font-medium text-slate-700">Catégorie active</span>
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
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-200" 
                type="submit" 
                disabled={!name.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingId ? "Enregistrer" : "Créer"}
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
              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-slate-200 bg-white">
                <div className="h-10 w-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="mt-3 text-sm text-slate-500">Chargement des catégories...</span>
              </div>
            ) : (
              <div className="grid gap-3">
                {categories.map((c, index) => (
                  <div 
                    key={c._id} 
                    className="group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      {c.image ? (
                        <img 
                          src={resolveImageUrl(c.image)} 
                          alt={c.name}
                          className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.isActive !== false ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                          {c.parent ? <FolderOpen className="h-5 w-5" /> : <FolderTree className="h-5 w-5" />}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800">{c.name}</h3>
                          {c.parent && (
                            <>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-500">{c.parent.name}</span>
                            </>
                          )}
                        </div>
                        {c.description && (
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-400">Ordre: {c.order ?? 0}</span>
                          {c.isActive === false && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500">Inactive</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                          title="Éditer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(c._id)}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && categories.length === 0 && (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
                    <FolderTree className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">Aucune catégorie</p>
                    <p className="text-sm text-slate-400 mt-1">Créez votre première catégorie pour organiser vos produits</p>
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
