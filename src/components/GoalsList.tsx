"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import { X } from "lucide-react";
import type { Goal } from "@/lib/goals";
import { getGoals, toggleGoal, removeGoal } from "@/lib/goals";

export default function GoalsList({ category }: { category: Goal["category"] }) {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    setGoals(getGoals(category));
  }, [category]);

  function handleToggle(id: string) {
    setGoals(toggleGoal(category, id));
  }

  function handleRemove(id: string) {
    setGoals(removeGoal(category, id));
  }

  return (
    <div className="mt-2 space-y-2.5">
      <AnimatePresence initial={false}>
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`group flex items-start gap-2 p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm hover:shadow-md transition ${
              goal.done ? "opacity-70 line-through" : ""
            }`}
          >
            <Checkbox
              checked={goal.done}
              onCheckedChange={() => handleToggle(goal.id)}
              aria-label={goal.description}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 dark:text-slate-100 truncate">{goal.description}</p>
              {goal.target && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{goal.target}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition"
              aria-label="Remover objetivo"
              onClick={() => handleRemove(goal.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
