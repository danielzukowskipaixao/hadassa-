"use client";
import { getMonthMatrix } from "@/lib/date";
import DayMessageDialog from "@/components/DayMessageDialog";
import DayCell from "@/components/DayCell";
import dayjs from "@/lib/date";
import { useState } from "react";
import { useCalendarStore } from "@/store/useCalendarStore";
import { motion } from "framer-motion";

export default function MonthCalendar({ year, monthIndex }: { year: number; monthIndex: number }) {
  const { selectedDateISO, setSelectedDateISO } = useCalendarStore();
  const weeks = getMonthMatrix(year, monthIndex, true);
  const [open, setOpen] = useState(false);

  function onOpen(iso: string) {
    setSelectedDateISO(iso);
    setOpen(true);
  }

  return (
    <motion.div key={`${year}-${monthIndex}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="flex flex-col gap-2 text-white">
  <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 text-xs text-white/90">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => (
          <div key={d} className="h-6 flex items-center justify-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 auto-rows-[1fr] items-start content-auto">
        {weeks.flat().map((d, idx) => (
          <div key={idx} className="w-full">
            {d ? <DayCell date={d.toDate()} onOpen={onOpen} /> : <div />}
          </div>
        ))}
      </div>
      <DayMessageDialog dateISO={selectedDateISO} open={open} onOpenChange={(v) => setOpen(v)} />
      <p className="text-xs text-white/80 mt-2 capitalize">{dayjs().month(monthIndex).format("MMMM")} de {year}</p>
    </motion.div>
  );
}
