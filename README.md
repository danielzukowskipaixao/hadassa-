## Memórias — Next.js 14 + TS

Aplicação web responsiva para registrar memórias com calendário, painel de objetivos e galeria de fotos.

### Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind + componentes shadcn/ui (Dialog, Tabs, Tooltip, etc.)
- dayjs (utc/timezone) — TZ America/Sao_Paulo
- Zustand + Zod
- Persistência: localStorage (memórias e objetivos) + IndexedDB via localforage (fotos)

### Como rodar

```powershell
npm install
npm run dev
```

Abra http://localhost:3000.

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

— Feito com carinho ❤️

