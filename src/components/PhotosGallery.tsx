"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ImagePlus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddPhotoDialog from "@/components/AddPhotoDialog";
import type { PhotoItem } from "@/lib/photos";
import { listPhotos, deletePhoto, subscribePhotos } from "@/lib/sync/photos";

export default function PhotosGallery() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const timerRef = useRef<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const stopAuto = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAuto = () => {
    stopAuto();
    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced && photos.length > 1 && emblaApi) {
      timerRef.current = window.setInterval(() => emblaApi.scrollNext(), 5000);
    }
  };

  const refresh = useCallback(async () => {
    const data = await listPhotos();
    setPhotos(data);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    startAuto();
    return () => {
      emblaApi.off("select", onSelect);
      stopAuto();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaApi, photos.length]);

  useEffect(() => {
    const unsub = subscribePhotos(() => refresh());
    return () => { unsub(); };
  }, [refresh]);

  const onPrev = () => emblaApi?.scrollPrev();
  const onNext = () => emblaApi?.scrollNext();

  if (!photos.length) {
    return (
      <section className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-rose-500">📸 Nossas Fotos</h3>
          <AddPhotoDialog onCreated={refresh} />
        </div>
        <div className="rounded-3xl bg-white/60 dark:bg-slate-900/50 backdrop-blur p-8 text-center text-slate-600 dark:text-slate-300 shadow">
          <ImagePlus className="mx-auto mb-2" />
          <p>Ainda não há fotos. Clique no + para adicionar.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-3" role="region" aria-label="Carrossel de fotos">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-rose-500">📸 Nossas Fotos</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Foto anterior" className="hidden sm:inline-flex">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext} aria-label="Próxima foto" className="hidden sm:inline-flex">
            <ChevronRight className="w-5 h-5" />
          </Button>
          <AddPhotoDialog onCreated={refresh} />
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
        onFocusCapture={stopAuto}
        onBlurCapture={startAuto}
      >
        <div className="overflow-hidden rounded-3xl shadow-md bg-black/5 h-[240px] sm:h-[300px] md:h-[360px] lg:h-[380px]">
          <div className="h-full" ref={emblaRef}>
            <div className="flex h-full">
              {photos.map((p) => (
                <div className="flex-[0_0_100%] h-full relative group" key={p.id}>
                  <img
                    src={p.dataUrl}
                    alt={p.description || "Foto sem descrição"}
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                    loading="lazy"
                  />
                  {p.description && (
                    <div className="absolute bottom-3 left-3 max-w-[85%] bg-black/45 text-white backdrop-blur-sm rounded-tl-2xl rounded-br-2xl px-3 py-1.5 text-sm sm:text-base">
                      {p.description}
                    </div>
                  )}
                  <button
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-white/85 rounded-full p-1.5 shadow transition"
                    onClick={async () => {
                      if (confirm("Remover esta foto?")) {
                        await deletePhoto(p.id);
                        await refresh();
                      }
                    }}
                    aria-label="Remover foto"
                  >
                    <Trash className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 flex justify-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={"h-2.5 w-2.5 rounded-full transition-colors " + (selectedIndex === i ? "bg-rose-500" : "bg-slate-300 hover:bg-rose-400")}
              aria-label={`Ir para foto ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
