"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalendarStore } from "@/store/useCalendarStore";
import { cn } from "@/lib/ui";

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

export default function YearNavigator() {
  const { monthIndex, setMonthIndex, year, setYear } = useCalendarStore();

  const years = [] as number[];
  for (let y = year - 5; y <= year + 5; y++) years.push(y);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium" htmlFor="year-select">
          Ano
        </label>
        <select
          id="year-select"
          className={cn(
            "h-10 rounded-md border border-slate-300 bg-white px-3 text-sm dark:bg-slate-900 dark:border-slate-700"
          )}
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          aria-label="Selecionar ano"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
  <Tabs value={String(monthIndex)} onValueChange={(v) => setMonthIndex(parseInt(v))}>
        <TabsList className="w-full overflow-auto">
          <div className="flex gap-1 w-full min-w-full">
            {MONTHS_PT.map((m, idx) => (
              <TabsTrigger key={m} value={String(idx)} className="flex-1">
                {m}
              </TabsTrigger>
            ))}
          </div>
        </TabsList>
      </Tabs>
    </div>
  );
}
