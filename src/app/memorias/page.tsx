"use client";
import GreetingHeader from "@/components/GreetingHeader";
import MonthSelector from "@/components/MonthSelector";
import MonthCalendar from "@/components/MonthCalendar";
import { useCalendarStore } from "@/store/useCalendarStore";
import GoalsPanel from "@/components/GoalsPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target } from "lucide-react";
import PhotosGallery from "@/components/PhotosGallery";

export default function MemoriasPage() {
  const { year, monthIndex } = useCalendarStore();
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <main className="mx-auto w-full py-4 sm:py-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] items-start">
          <section id="conteudo-principal" className="space-y-6">
          <div className="flowers-bg rounded-3xl p-4 sm:p-6">
            <GreetingHeader />
            <div className="mt-2">
              <MonthSelector />
            </div>
            <section
              aria-label="Calendário do mês"
              id={`month-panel-${monthIndex}`}
              className="mt-4 rounded-3xl border p-3 sm:p-4 bg-white/70 dark:bg-slate-900/50 shadow-sm"
            >
              <MonthCalendar year={year} monthIndex={monthIndex} />
            </section>
            <PhotosGallery />
          </div>
          </section>
          <aside id="painel-objetivos" className="hidden md:block">
            <div className="sticky top-6 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-md p-3 max-h-[calc(100vh-96px)] overflow-auto flowers-bg">
              <GoalsPanel />
            </div>
          </aside>
        </div>

        {/* FAB + Drawer/Sheet (Dialog) for mobile */}
        <div className="md:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-40 rounded-full shadow-lg bg-rose-500 text-white p-4 touch-target"
                aria-label="Abrir objetivos"
              >
                <Target className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="p-0 sm:max-w-lg">
              <DialogHeader className="px-4 pt-4">
                <DialogTitle>Nossos Objetivos</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <GoalsPanel />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
