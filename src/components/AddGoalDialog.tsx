"use client";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Goal } from "@/lib/goals";
import { addGoal as addGoalSync } from "@/lib/sync/goals";

const schema = z.object({
  description: z.string().min(1, "Descreva o objetivo").max(200, "Máx. 200 caracteres"),
  target: z.string().max(60, "Máx. 60 caracteres").optional().or(z.literal("")),
});

export default function AddGoalDialog({
  category,
  open,
  onOpenChange,
  onCreated,
}: {
  category: Goal["category"];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
}) {
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setDescription("");
    setTarget("");
    setError(null);
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    const parsed = schema.safeParse({ description, target: target || undefined });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Dados inválidos";
      setError(msg);
      setBusy(false);
      return;
    }
  await addGoalSync({ category, description: parsed.data.description, target: parsed.data.target || undefined, done: false });
    onCreated?.();
    setBusy(false);
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (onOpenChange(v), v || reset())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo objetivo</DialogTitle>
          <DialogDescription>Adicione um objetivo {category === "daily" ? "diário" : "para a vida"}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-sm font-medium">Descrição</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escreva algo fofo e específico..."
          />
          <label className="block text-sm font-medium">Meta/Data (opcional)</label>
          <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Ex.: 12/06/2026, 30 anos, diário" />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={busy || description.trim().length === 0}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
