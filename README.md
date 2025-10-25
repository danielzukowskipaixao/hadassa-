# HADASSAH • MEMÓRIAS

Um site fofo, minimalista e profissional para a Hadassah — com galeria de fotos, recadinhos e um calendário de "recado do dia". Projeto completo em Next.js 14 + TypeScript, Tailwind, shadcn-style, Supabase (Auth + Postgres + Storage) e Prisma.

## Tecnologias

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + micro-componentes estilo shadcn (Button, Card, Dialog, Badge)
- Framer Motion (animações suaves) + lucide-react (ícones)
- React Hook Form + Zod (validação)
- Supabase: Auth (Magic Link), Postgres, Storage, Edge Functions (thumbnail)
- Prisma ORM
- ESLint + Prettier + Husky + lint-staged + GitHub Actions (build)

## Requisitos

- Node.js 20+
- Conta no Supabase (free tier)

## Setup — Supabase

1) Crie um novo projeto no Supabase e copie:
	- SUPABASE_URL (Project Settings > API)
	- SUPABASE_ANON_KEY
	- SERVICE_ROLE (para Edge Functions, se necessário)

2) Postgres (Database URL)
	- Em Project Settings > Database, copie a connection string (DATABASE_URL).

3) Storage
	- Crie um bucket chamado `photos`.
	- Política: leitura pública apenas quando permitido (use RLS + tabela `Photo.isPublic`). Recomendação: usar URLs públicas para fotos públicas e URLs assinadas para privadas.

4) Auth (Magic Link)
	- Ative Email auth (Magic Link).
	- Whitelist de e-mails: defina em `NEXT_PUBLIC_ALLOWED_EMAILS` os e-mails autorizados a escrever (ex.: `hadassah@exemplo.com,admin@exemplo.com`).

5) Edge Function (thumbnail)
	- Crie uma edge function `thumbgen` (exemplo em `supabase/functions/thumbgen`).
	- Ela deve receber o caminho do arquivo, gerar uma miniatura (ex.: 512px) e salvar no mesmo bucket. Associe a `thumbUrl` na tabela `Photo`.

## Variáveis de Ambiente (`.env`)

Copie `.env.example` para `.env` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
NEXT_PUBLIC_ALLOWED_EMAILS=hadassah@example.com,admin@example.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

## Banco de Dados (Prisma)

Schema em `prisma/schema.prisma`:

```
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      String   @default("user") // "user" | "admin"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  photos    Photo[]
  phrases   Phrase[]
}

model Photo {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  url       String
  thumbUrl  String?
  caption   String?
  createdAt DateTime @default(now())
  isPublic  Boolean  @default(true)
}

model Phrase {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  text      String
  createdAt DateTime @default(now())
  isPublic  Boolean  @default(true)
}

model DailyNote {
  id        String   @id @default(cuid())
  dayKey    String   @unique // YYYY-MM-DD na tz America/Sao_Paulo
  title     String?
  content   String?
  isPublic  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Comandos:

```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## Scripts

```powershell
npm run dev      # iniciar em desenvolvimento
npm run build    # build de produção
npm run start    # iniciar build
npm run lint     # lint
npm run test     # testes
```

## Fluxos e Regras

- Boas-vindas: a Home mostra “Olá, como você está, Hadassah?” com microanimação.
- Recadinho do Dia: abre automaticamente o cartão/modal do dia atual (se houver). Dias futuros são bloqueados no front e no back. Timezone: America/Sao_Paulo.
- Galeria: grid com paginação (carregar mais) e FAB “+” para upload (até 10 arquivos, 10MB cada). Após upload (Supabase Storage), cria registro em `Photo` via API.
- Frases: criar/listar; apenas usuários autorizados podem escrever. Zod valida inputs.
- Acesso: whitelist por e-mail para escrita; leitura pública somente do que for `isPublic=true`.

## RLS — Exemplo de Políticas

No Supabase SQL Editor, ajuste conforme seu schema (exemplo):

```sql
-- Habilitar RLS
alter table "Photo" enable row level security;
alter table "Phrase" enable row level security;
alter table "DailyNote" enable row level security;

-- Foto: leitura pública apenas quando isPublic = true
create policy "public_read_photos" on "Photo"
for select using ( isPublic = true );

-- Frases: leitura pública apenas quando isPublic = true
create policy "public_read_phrases" on "Phrase"
for select using ( isPublic = true );

-- DailyNote: leitura condicionada pelo backend (recomendado via API); evite selects diretos do cliente

-- Escrita: apenas usuários autenticados e autorizados (validação adicional por e-mail no backend)
create policy "auth_write_photos" on "Photo"
for insert with check ( auth.role() = 'authenticated' );
create policy "auth_write_phrases" on "Phrase"
for insert with check ( auth.role() = 'authenticated' );
create policy "auth_write_notes" on "DailyNote"
for insert with check ( auth.role() = 'authenticated' );
```

> Observação: O backend (route handlers em `app/api/*`) já reforça a autorização por e-mail e bloqueia dias futuros.

## Design

- Paleta pastel (lilás, azul-claro, verde-água); flores em SVG sutis (tulipas e “flor-dragão”), microinterações com Framer Motion, glassmorphism suave.
- Acessível: HTML semântico, foco visível, contraste adequado.

## Deploy (Vercel)

1) Crie o projeto na Vercel e conecte este repositório.
2) Configure as variáveis de ambiente (mesmas do `.env`).
3) Build Command: `npm run build` | Output: `.next` (padrão do Next).

## Personalização

- Ajuste a paleta e o estilo em `styles/globals.css` e `tailwind.config.ts`.
- Altere mensagens/branding nos componentes em `components/*`.

---

Com amor, para a Hadassah. 💙
