const brands = [
  { name: "NVIDIA", logoUrl: "https://cdn.simpleicons.org/nvidia/76B900" },
  { name: "Logitech", logoUrl: "https://cdn.simpleicons.org/logitech/FFFFFF" },
  { name: "AMD", logoUrl: "https://cdn.simpleicons.org/amd/00FF9C" },
  { name: "ASUS", logoUrl: "https://cdn.simpleicons.org/asus/4EA5FF" },
  { name: "Lenovo", logoUrl: "https://cdn.simpleicons.org/lenovo/EA5E87" },
  { name: "Samsung", logoUrl: "https://cdn.simpleicons.org/samsung/8DA2FF" },
  { name: "Razer", logoUrl: "https://cdn.simpleicons.org/razer/44FF7A" },
  { name: "Intel", logoUrl: "https://cdn.simpleicons.org/intel/6BCBFF" }
];

export function PopularBrandsBar() {
  const loop = [...brands, ...brands];

  return (
    <section className="mt-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-900 px-5 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">Magasinez par</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Marques populaires</h3>
          </div>
          <span className="rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
            Defilement auto
          </span>
        </div>

        <div className="relative overflow-hidden">
          <div className="brands-marquee-track">
            {loop.map((brand, idx) => (
              <div
                key={`${brand.name}-${idx}`}
                className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-800/50 px-5 py-4"
              >
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  loading="lazy"
                  className="h-10 w-auto object-contain opacity-95"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
