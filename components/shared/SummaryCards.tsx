/* This file renders dashboard counts for goals and tasks. */
import type { WorkspaceSummary } from "@/types/models";
import { Target, CheckCircle2, ListTodo, Timer, CheckSquare } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

type SummaryCardsProps = {
  summary: WorkspaceSummary;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const items = [
    { 
      label: "Active Goals", 
      value: summary.activeGoals,
      icon: <Target className="h-5 w-5 text-blue-400" />,
      color: "from-blue-500/20 to-transparent"
    },
    { 
      label: "Completed", 
      value: summary.completedGoals,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      color: "from-emerald-500/20 to-transparent"
    },
    { 
      label: "To Do", 
      value: summary.todoTasks,
      icon: <ListTodo className="h-5 w-5 text-zinc-400" />,
      color: "from-zinc-500/20 to-transparent"
    },
    { 
      label: "In Progress", 
      value: summary.inProgressTasks,
      icon: <Timer className="h-5 w-5 text-amber-400" />,
      color: "from-amber-500/20 to-transparent"
    },
    { 
      label: "Done Tasks", 
      value: summary.doneTasks,
      icon: <CheckSquare className="h-5 w-5 text-indigo-400" />,
      color: "from-indigo-500/20 to-transparent"
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {items.map((item) => (
        <SpotlightCard key={item.label} className="p-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-20`} />
          <div className="relative p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 rounded-lg bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                {item.icon}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{item.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">{item.label}</p>
            </div>
          </div>
        </SpotlightCard>
      ))}
    </div>
  );
}