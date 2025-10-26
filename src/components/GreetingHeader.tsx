"use client";
import { useRef } from "react";
import { greetingForHour, formatLongDatePtBR, getToday } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { exportAll, importAll } from "@/lib/storage";
import { Upload, Download, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Dancing_Script, Poppins } from "next/font/google";

const dancing = Dancing_Script({ subsets: ["latin"], weight: "700" });
const poppins = Poppins({ subsets: ["latin"], weight: "500" });

export default function GreetingHeader() {
  const today = getToday();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memorias-backup-${today.format("YYYY-MM-DD")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const res = importAll(text);
        alert(`Importados ${res.imported}/${res.total}.`);
      } catch {
        alert("Arquivo inválido.");
      }
    };
    reader.readAsText(file);
    ev.target.value = "";
  }

  return (
    <header className="w-full flex flex-col items-center text-center mt-8 space-y-2">
      <motion.h1
        className={`${dancing.className} text-4xl sm:text-5xl text-rose-500 drop-shadow-md text-shadow-white flex items-center gap-2`}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        <Heart className="w-8 h-8 text-pink-400" aria-hidden />
        Memórias de Radassa e Daniel
      </motion.h1>

      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-xl px-4 py-2 shadow-sm">
        <p className={`${poppins.className} text-gray-700 dark:text-gray-100 text-base sm:text-lg leading-relaxed`}>
          {greetingForHour(today)}, <span className="font-semibold text-pink-500">Radassa e Daniel</span> — {formatLongDatePtBR(today)}
        </p>
      </div>

      <Separator className="my-2 w-2/3 opacity-40" />
      <p className={`${poppins.className} italic text-sm text-pink-500`}>
        🌷 Um diário de lembranças compartilhadas 🌷
      </p>

      <div className="flex gap-2 mt-2">
        <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
        <Button variant="ghost" onClick={() => fileRef.current?.click()} aria-label="Importar JSON" className="hover:bg-pink-50 dark:hover:bg-pink-900/20">
          <Upload className="h-4 w-4 mr-2" /> Importar
        </Button>
        <Button variant="ghost" onClick={handleExport} aria-label="Exportar JSON" className="hover:bg-pink-50 dark:hover:bg-pink-900/20">
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </div>
    </header>
  );
}
