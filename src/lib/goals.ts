export type Goal = {
  id: string;
  description: string;
  target?: string; // optional: date/age/target
  done: boolean;
  createdAt: string;
  category: "daily" | "lifetime";
};

type Category = Goal["category"];

const KEY_DAILY = "memorias:v1:goals:daily";
const KEY_LIFE = "memorias:v1:goals:lifetime";

const seedDaily: Goal[] = [
  {
    id: "d1",
    description: "Orar juntos hoje à noite.",
    target: "diário",
    done: false,
    createdAt: new Date().toISOString(),
    category: "daily",
  },
  {
    id: "d2",
    description: "Ler um versículo juntos.",
    target: "diário",
    done: false,
    createdAt: new Date().toISOString(),
    category: "daily",
  },
];

const seedLife: Goal[] = [
  {
    id: "l1",
    description: "Com 20 anos, queremos visitar a Groenlândia.",
    target: "20 anos",
    done: false,
    createdAt: new Date().toISOString(),
    category: "lifetime",
  },
  {
    id: "l2",
    description: "Com 25 anos de casados, teremos nosso primeiro filho.",
    target: "25 anos",
    done: false,
    createdAt: new Date().toISOString(),
    category: "lifetime",
  },
  {
    id: "l3",
    description: "Com 30 anos, queremos passar o aniversário nas Maldivas.",
    target: "30 anos",
    done: false,
    createdAt: new Date().toISOString(),
    category: "lifetime",
  },
  {
    id: "l4",
    description: "Fazer um bolo juntos no dia 12/06/2026.",
    target: "12/06/2026",
    done: false,
    createdAt: new Date().toISOString(),
    category: "lifetime",
  },
];

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function keyFor(category: Category) {
  return category === "daily" ? KEY_DAILY : KEY_LIFE;
}

export function getGoals(category: Category): Goal[] {
  if (!isBrowser()) return category === "daily" ? seedDaily : seedLife;
  const KEY = keyFor(category);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seeded = category === "daily" ? seedDaily : seedLife;
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const arr = parsed as unknown[];
      const prefix = category === "daily" ? "d" : "l";
      const safe: Goal[] = [];
      for (const g of arr) {
        if (g && typeof g === "object") {
          const o = g as Record<string, unknown>;
          const desc = typeof o.description === "string" ? o.description : "";
          if (!desc.trim()) continue;
          safe.push({
            id: typeof o.id === "string" ? o.id : newId(prefix),
            description: desc,
            target: typeof o.target === "string" ? o.target : undefined,
            done: typeof o.done === "boolean" ? o.done : Boolean(o.done),
            createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString(),
            category,
          });
        }
      }
      return safe.length ? safe : category === "daily" ? seedDaily : seedLife;
    }
  } catch (e) {
    console.warn("getGoals parse error", e);
  }
  return category === "daily" ? seedDaily : seedLife;
}

export function saveGoals(category: Category, goals: Goal[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(keyFor(category), JSON.stringify(goals));
  } catch (e) {
    console.warn("saveGoals error", e);
  }
}

export function toggleGoal(category: Category, id: string): Goal[] {
  const curr = getGoals(category);
  const updated = curr.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
  saveGoals(category, updated);
  return updated;
}

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function addGoal(category: Category, data: { description: string; target?: string }): Goal[] {
  const curr = getGoals(category);
  const next: Goal = {
    id: newId(category === "daily" ? "d" : "l"),
    description: data.description,
    target: data.target,
    done: false,
    createdAt: new Date().toISOString(),
    category,
  };
  const updated = [next, ...curr];
  saveGoals(category, updated);
  return updated;
}

export function removeGoal(category: Category, id: string): Goal[] {
  const curr = getGoals(category);
  const updated = curr.filter((g) => g.id !== id);
  saveGoals(category, updated);
  return updated;
}
