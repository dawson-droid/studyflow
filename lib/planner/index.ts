import { Assignment, Priority, AssignmentType } from "@/types";

const PRIORITY_SCORE: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const TYPE_BONUS: Partial<Record<AssignmentType, number>> = {
  test: 1,
  quiz: 1,
};

export function getDaysUntilDue(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = date.split("-").map(Number);
  const due = new Date(y, m - 1, d); // local time — avoids UTC-shift bug
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function itemScore(a: Assignment): number {
  return PRIORITY_SCORE[a.priority] + (TYPE_BONUS[a.type] ?? 0) + (a.status === "in-progress" ? 2 : 0);
}

function byScore(a: Assignment, b: Assignment): number {
  return itemScore(b) - itemScore(a);
}

// Returns the date to use for planning grouping
function planningDate(a: Assignment): string {
  const today = todayStr();

  // If there's a session today (undone), treat as today
  const hasToday = a.studySessions.some((s) => s.date === today && !s.done);
  if (hasToday) return today;

  // Use earliest upcoming undone session
  const upcoming = a.studySessions
    .filter((s) => !s.done && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (upcoming.length > 0) return upcoming[0].date;

  // Fall back to due date
  return a.dueDate;
}

export interface PlanGroups {
  overdue: Assignment[];
  today: Assignment[];
  thisWeek: Assignment[];
  upcoming: Assignment[];
}

export function getPlanGroups(assignments: Assignment[]): PlanGroups {
  const active = assignments.filter((a) => a.status !== "done");

  const overdue: Assignment[] = [];
  const today: Assignment[] = [];
  const thisWeek: Assignment[] = [];
  const upcoming: Assignment[] = [];

  for (const a of active) {
    const days = getDaysUntilDue(planningDate(a));
    if (days < 0) overdue.push(a);
    else if (days === 0) today.push(a);
    else if (days <= 7) thisWeek.push(a);
    else upcoming.push(a);
  }

  return {
    overdue: overdue.sort(byScore),
    today: today.sort(byScore),
    thisWeek: thisWeek.sort(byScore),
    upcoming: upcoming.sort(byScore),
  };
}

export function getTodaysPlan(assignments: Assignment[]): Assignment[] {
  const { overdue, today, thisWeek, upcoming } = getPlanGroups(assignments);
  return [...overdue, ...today, ...thisWeek, ...upcoming];
}

export function getDueLabel(dueDate: string): string {
  const days = getDaysUntilDue(dueDate);
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days} days`;
  return `Due ${new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

// Returns the undone session scheduled for today, if any
export function getTodaySession(a: Assignment) {
  const today = todayStr();
  return a.studySessions.find((s) => s.date === today && !s.done) ?? null;
}
