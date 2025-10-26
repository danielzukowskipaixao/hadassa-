"use client";
import { useCalendarStore } from "@/store/useCalendarStore";

const MONTHS_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export default function MonthSelector() {
  const { monthIndex, setMonthIndex } = useCalendarStore();
  const months = MONTHS_PT.map((label, idx) => ({ label, value: idx }));

  return (
    <div
      role="tablist"
      aria-label="Selecionar mês"
      className="no-scrollbar mx-auto mt-2 flex max-w-3xl flex-wrap justify-center gap-2 md:gap-3 overflow-visible"
    >
      {months.map((m, idx) => {
        const active = idx === monthIndex;
        return (
          <button
            key={m.value}
            role="tab"
            aria-selected={active}
            aria-controls={`month-panel-${m.value}`}
            onClick={() => setMonthIndex(idx)}
            className={[
              "min-w-[64px] sm:min-w-[80px] px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-sm sm:text-base font-medium tracking-wide transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2",
              active
                ? "bg-rose-600 text-white shadow-md dark:bg-rose-500"
                : "bg-slate-100/80 text-slate-800 hover:bg-slate-200/80 hover:text-slate-900 dark:bg-slate-800/40 dark:text-slate-100 dark:hover:bg-slate-700/60",
            ].join(" ")}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
