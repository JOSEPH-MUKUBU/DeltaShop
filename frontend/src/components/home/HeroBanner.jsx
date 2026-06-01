import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { resolveImageUrl } from "../../lib/image";

export function HeroBanner({ sliders = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-play carousel
  useEffect(() => {
    if (sliders.length <= 1 || isPaused) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, sliders.length]);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % sliders.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, sliders.length]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + sliders.length) % sliders.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, sliders.length]);

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Fallback static content when no sliders
  if (sliders.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src={resolveImageUrl("/static/slideBanner1.jpg")}
                alt="Banner"
                className="h-56 w-full bg-slate-100 object-contain sm:h-72 lg:h-[360px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
                <div className="flex items-center gap-2 text-white/80 mb-3">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Nouveautés</span>
                </div>
                <h2 className="max-w-md text-2xl font-bold text-white sm:text-3xl lg:text-4xl leading-tight">
                  Trouve tes essentiels tech au meilleur prix
                </h2>
                <p className="mt-3 max-w-sm text-sm text-white/80 sm:text-base">
                  Livraison rapide. Paiement simple. Panier instantané.
                </p>
                <a 
                  href="/products" 
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:bg-indigo-50 hover:scale-105"
                >
                  Découvrir
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img src={resolveImageUrl("/static/slideBanner2.jpg")} alt="Promo" className="h-32 w-full object-cover sm:h-40" />
              <div className="p-4">
                <div className="text-sm font-semibold text-slate-800">Promos de la semaine</div>
                <div className="mt-1 text-sm text-slate-500">Ajoute au panier, passe commande, c'est fait.</div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <img src={resolveImageUrl("/static/coupon.png")} alt="Coupon" className="h-12 w-12 rounded-2xl object-cover" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">Coupon</div>
                  <div className="text-sm text-slate-500">10% sur ta première commande</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSlide = sliders[currentIndex];

  return (
    <div 
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Carousel */}
      <div className="relative h-56 sm:h-72 lg:h-[360px]">
        {/* Slides */}
        {sliders.map((slide, index) => (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 translate-x-0' 
                : index < currentIndex 
                  ? 'opacity-0 -translate-x-full' 
                  : 'opacity-0 translate-x-full'
            }`}
          >
            <img
              src={resolveImageUrl(slide.image)}
              alt={slide.title}
              className="h-full w-full bg-slate-100 object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10 lg:p-12">
              <div 
                className={`transition-all duration-500 delay-100 ${
                  index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex items-center gap-2 text-white/80 mb-3">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Offre spéciale</span>
                </div>
                <h2 className="max-w-lg text-2xl font-bold text-white sm:text-3xl lg:text-5xl leading-tight">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="mt-3 max-w-md text-sm text-white/80 sm:text-base lg:text-lg">
                    {slide.subtitle}
                  </p>
                )}
                <a 
                  href={slide.link || "/products"} 
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:bg-indigo-50 hover:scale-105"
                >
                  Découvrir
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {sliders.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 opacity-0 transition-all hover:bg-white hover:scale-110 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              style={{ opacity: isPaused ? 1 : undefined }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 opacity-0 transition-all hover:bg-white hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100"
              style={{ opacity: isPaused ? 1 : undefined }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots Navigation */}
        {sliders.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {sliders.length > 1 && !isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-white transition-all duration-[5000ms] ease-linear"
              style={{ width: '100%' }}
              key={currentIndex}
            />
          </div>
        )}
      </div>

      {/* Secondary Cards */}
      {sliders.length > 1 && (
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {sliders.slice(0, 3).map((slide, index) => (
            <button
              key={slide._id}
              onClick={() => goToSlide(index)}
              className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                index === currentIndex 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3 p-3">
                <img 
                  src={resolveImageUrl(slide.image)} 
                  alt={slide.title}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-800">
                    {slide.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {index === currentIndex ? 'En cours' : 'Cliquez pour voir'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
