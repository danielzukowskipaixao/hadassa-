"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VALID = "daniel";

export default function PasswordGate() {
  const [open, setOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const inCooldown = cooldownUntil !== null && now < cooldownUntil;
  const remaining = useMemo(() => (inCooldown && cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0), [now, inCooldown, cooldownUntil]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (inCooldown) return;
    if (password.trim().toLowerCase() === VALID) {
      setError(null);
      window.open("/memorias", "_blank", "noopener,noreferrer");
      setPassword("");
      setAttempts(0);
      return;
    }
    const next = attempts + 1;
    setAttempts(next);
    setError("Senha incorreta. Tente novamente.");
    if (next >= 3) {
      setCooldownUntil(Date.now() + 10_000);
    }
  }

  function onChange(v: string) {
    setPassword(v);
    if (error) setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby="password-desc" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Acesso protegido</DialogTitle>
          <DialogDescription id="password-desc">Digite a senha para continuar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 grid gap-3" aria-label="Formulário de senha">
          <label htmlFor="senha" className="text-sm font-medium">
            Senha
          </label>
          <Input
            id="senha"
            ref={inputRef}
            type="password"
            autoComplete="current-password"
            aria-invalid={!!error}
            aria-describedby={error ? "senha-erro" : undefined}
            value={password}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          {error && (
            <p id="senha-erro" role="alert" aria-live="assertive" className="text-sm text-red-600">
              {error}
            </p>
          )}
          {inCooldown ? (
            <Button type="button" disabled aria-live="polite" aria-label={`Aguarde ${remaining} segundos`}>
              Aguarde {remaining}s para tentar novamente
            </Button>
          ) : (
            <Button type="submit">Entrar</Button>
          )}
          <p className="text-xs text-slate-500">Dica: a senha é &quot;daniel&quot;.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
