"use client";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DayMessage, DayMessageSchema } from "@/lib/schema";
import { fetchNotes, subscribeNotes, upsertNote, flushNotesQueue } from "@/lib/sync/notes";
import { formatLongDatePtBR, getToday, isPast, isToday } from "@/lib/date";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

export default function DayMessageDialog({
  dateISO,
  open,
  onOpenChange,
}: {
  dateISO: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isOpen = open && !!dateISO;
  const readOnly = !!dateISO && isPast(dateISO);
  const editableToday = !!dateISO && isToday(dateISO);
  const [text, setText] = useState("");
  // Meta exibida apenas no modo antigo; com Supabase, os timestamps são geridos no servidor
  // Mantemos apenas o texto por simplicidade
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    async function load() {
      if (!dateISO || !isOpen) return;
      const all = await fetchNotes();
      if (all[dateISO]) setText(all[dateISO]); else setText("");
      try { await flushNotesQueue(); } catch {}
      unsub = subscribeNotes((dISO, t) => {
        if (dateISO && dISO === dateISO) setText(t);
      });
    }
    load();
    return () => {
      if (unsub) unsub();
    };
  }, [dateISO, isOpen]);

  function handleSave() {
    if (!dateISO) return;
    try {
      const now = getToday().toISOString();
      const draft: DayMessage = {
        dateISO,
        text: text.trim(),
        createdAt: now,
        updatedAt: now,
      };
      DayMessageSchema.parse(draft);
      // Supabase upsert (with offline queue fallback inside)
      upsertNote(dateISO, draft.text);
      onOpenChange(false);
      setError(null);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError("A mensagem deve ter entre 1 e 1500 caracteres.");
        return;
      }
      setError("Erro ao salvar a mensagem.");
    }
  }

  const title = useMemo(() => (dateISO ? formatLongDatePtBR(dateISO) : ""), [dateISO]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            {editableToday && <Badge>Hoje</Badge>}
            {readOnly && <Badge className="bg-slate-200 dark:bg-slate-800">Somente leitura</Badge>}
          </DialogTitle>
          <DialogDescription>Mensagem do dia</DialogDescription>
        </DialogHeader>
        {readOnly ? (
          <Textarea value={text} readOnly className="min-h-48 cursor-not-allowed" aria-label="Mensagem do dia (somente leitura)" />
        ) : (
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Escreva sua mensagem aqui..."
            aria-label="Mensagem do dia"
          />
        )}
        {error && (
          <p role="alert" aria-live="assertive" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
          <div />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            {readOnly && text && (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(text);
                    alert("Mensagem copiada!");
                  } catch {
                    // ignore
                  }
                }}
              >
                Copiar mensagem
              </Button>
            )}
            {editableToday && (
              <Button type="button" onClick={handleSave}>
                Salvar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
