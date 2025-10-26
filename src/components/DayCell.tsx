"use client";
import { isFuture, isPast, isToday, toISODate } from "@/lib/date";
import { cn } from "@/lib/ui";
import { Lock, Pencil, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getMessage } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function DayCell({ date, onOpen }: { date: Date; onOpen: (dateISO: string) => void }) {
  const iso = toISODate(date);
  const past = isPast(iso);
  const today = isToday(iso);
  const future = isFuture(iso);

  // Avoid hydration mismatch: don't read localStorage during SSR/initial render
  const [preview, setPreview] = useState<string>("");
  useEffect(() => {
    const msg = getMessage(iso);
    setPreview(msg?.text?.trim() || "");
  }, [iso]);

  const content = (
    <div
      className={cn(
        // Mobile-first sizing with breakpoints
        "relative w-full aspect-square min-w-[44px] min-h-[44px] sm:min-w-[56px] sm:min-h-[56px] md:min-w-[72px] md:min-h-[72px]",
        "rounded-2xl border text-sm select-none shadow-sm overflow-hidden",
        "bg-slate-900/60 text-slate-100 dark:bg-slate-900/60",
        // Use ring-inset so the highlight stays inside the tile and keeps a clear gap to neighbors
        today && "ring-inset ring-2 ring-pink-300 shadow-md",
        past && "opacity-80"
      )}
    >
      {/* Header: day number + icons */}
      <div className="flex items-center justify-between p-2 pt-2 text-[11px] sm:text-xs">
        <span className="font-semibold">{new Date(iso).getDate()}</span>
        <span className="inline-flex items-center gap-1">
          {today && <Pencil className="h-3.5 w-3.5 text-pink-400" aria-hidden />}
          {past && !today && <Eye className="h-3.5 w-3.5 text-white/85" aria-hidden />}
          {future && <Lock className="h-3.5 w-3.5 text-white/80" aria-hidden />}
        </span>
      </div>
      {/* Preview with fixed height to avoid stretching */}
      <div className="px-2 mt-1 text-[11px] sm:text-xs text-white/90 leading-tight line-clamp-2 h-[2.6em]">
        {preview || <span className="text-white/60">(vazio)</span>}
      </div>
      {/* Today badge absolute to avoid layout shift */}
      {today && (
        <span className="absolute -left-2 -top-2 z-10 rounded-full px-2 py-0.5 text-[10px] bg-pink-400 text-white shadow">Hoje</span>
      )}
      {/* Future overlay absolute, not affecting layout */}
      {future && <div className="pointer-events-none absolute inset-0 bg-white/55 backdrop-blur-[1px]" />}
    </div>
  );

  const label = `${new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} – ${future ? "bloqueado" : past ? "somente leitura" : "editar"}`;

  if (future) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div aria-disabled className="cursor-not-allowed" aria-label={label} role="button">
              {content}
            </div>
          </TooltipTrigger>
          <TooltipContent>Disponível em {new Date(iso).toLocaleDateString("pt-BR")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(iso)}
      aria-label={label}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-2xl"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          {preview && <TooltipContent>{preview.slice(0, 80)}{preview.length > 80 ? "…" : ""}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </button>
  );
}
