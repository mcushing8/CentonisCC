/* This file renders dashboard counts for goals and tasks. */
import type { WorkspaceSummary } from "@/types/models";

type SummaryCardsProps = {
  summary: WorkspaceSummary;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const items = [
    { label: "Active Goals", value: summary.activeGoals },
    { label: "Completed Goals", value: summary.completedGoals },
    { label: "To Do Tasks", value: summary.todoTasks },
    { label: "In Progress Tasks", value: summary.inProgressTasks },
    { label: "Done Tasks", value: summary.doneTasks },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <article key={item.label} className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold">{item.value}</p>
        </article>
      ))}
    </section>
  );
}
