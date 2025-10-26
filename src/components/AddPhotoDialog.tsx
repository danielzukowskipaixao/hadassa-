"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ImagePlus } from "lucide-react";
import { addPhoto } from "@/lib/photos";

export default function AddPhotoDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSave() {
    if (!files || !files.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 5 * 1024 * 1024) {
        // Skip very large files for now (optionally compress in future)
        continue;
      }
      const dataUrl = await fileToDataUrl(f);
      await addPhoto({ dataUrl, description: desc.trim() });
    }
    setBusy(false);
    setOpen(false);
    setFiles(null);
    setDesc("");
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" aria-label="Adicionar foto"><ImagePlus className="w-5 h-5" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar foto(s)</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
          <Textarea placeholder="Escreva uma descrição (opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          {files && files.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from(files).map((f, i) => (
                <div key={i} className="h-24 w-full rounded-lg overflow-hidden bg-slate-200">
                  {/* Use object URL for preview only */}
                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancelar</Button>
          <Button onClick={handleSave} disabled={busy || !files || files.length === 0}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
