"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GoalsList from "@/components/GoalsList";
import AddGoalDialog from "@/components/AddGoalDialog";
import type { Goal } from "@/lib/goals";

export default function GoalsPanel() {
  const [currentTab, setCurrentTab] = useState<Goal["category"]>("daily");
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function triggerRefresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-md p-3">
      <h2 className="text-lg font-semibold text-rose-500 text-center">Nossos Objetivos</h2>
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as Goal["category"]) } className="mt-2">
        <div className="flex items-center justify-between px-1">
          <TabsList className="grid grid-cols-2 w-full max-w-[220px]">
            <TabsTrigger value="daily">Diários</TabsTrigger>
            <TabsTrigger value="lifetime">Para a vida</TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Adicionar objetivo ${currentTab === "daily" ? "Diários" : "Para a vida"}`}
            onClick={() => setOpen(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <TabsContent value="daily" className="mt-2">
          <GoalsList key={`daily-${refreshKey}`} category="daily" />
        </TabsContent>
        <TabsContent value="lifetime" className="mt-2">
          <GoalsList key={`lifetime-${refreshKey}`} category="lifetime" />
        </TabsContent>
      </Tabs>
      <AddGoalDialog
        category={currentTab}
        open={open}
        onOpenChange={setOpen}
        onCreated={triggerRefresh}
      />
    </div>
  );
}
