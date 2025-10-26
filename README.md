## Memórias — Next.js 14 + TS

Aplicação web responsiva para registrar memórias com calendário, painel de objetivos e galeria de fotos.

### Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind + componentes shadcn/ui (Dialog, Tabs, Tooltip, etc.)
- dayjs (utc/timezone) — TZ America/Sao_Paulo
- Zustand + Zod
- Persistência: Supabase (Postgres + Realtime + Storage)
- Fallback offline: localStorage (mensagens/objetivos) + IndexedDB (fotos)

### Como rodar

```powershell
npm install
npm run dev
```

Abra http://localhost:3000.

### Variáveis de ambiente

Crie `.env.local` (ou defina na Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Build de produção

```powershell
npm run build
npm start
```

### Funcionalidades

- Calendário com regras Passado/Hoje/Futuro; preview seguro e acessível
- Seletor de meses tocável e responsivo
- Painel “Nossos Objetivos” (diários e para a vida), com tabs e botão “+”
- Galeria “Nossas Fotos” com carrossel (autoplay 5s), upload e descrição
- Mobile-first: FAB abre objetivos como drawer; desktop mantém painel lateral

### Sincronização em tempo real (Supabase)

- Mensagens do dia, objetivos e fotos sincronizam entre dispositivos (≤ 1–2s)
- Indicador de status de conexão no topo (verde online / cinza offline)
- Fallback offline: alterações são enfileiradas e aplicadas após reconexão

Bucket: `memorias-photos` (public). Tabelas: `daily_notes`, `goals`, `photos`. Canal lógico: `memorias-hadassa`.

— Feito com carinho ❤️

