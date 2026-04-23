"use client";

import { useEffect, useState } from "react";
import { loadData, saveAssignment, loadSettings } from "@/lib/storage";
import { getPlanGroups, getDueLabel, getTodaySession } from "@/lib/planner";
import { Assignment, Class } from "@/types";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

export default function TodayPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [expandedSubtasksId, setExpandedSubtasksId] = useState<string | null>(null);
  const [sessionsDropdownId, setSessionsDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const data = loadData();
    setAssignments(data.assignments);
    setClasses(data.classes);
  }, []);

  const groups = getPlanGroups(assignments);
  const classMap = Object.fromEntries(classes.map((c) => [c.id, c]));
  const totalActive =
    groups.overdue.length + groups.today.length + groups.thisWeek.length + groups.upcoming.length;
  const done = assignments.filter((a) => a.status === "done");
  const isEmpty = assignments.length === 0;

  function refresh() {
    setAssignments(loadData().assignments);
  }

  function markDone(a: Assignment) {
    saveAssignment({ ...a, status: "done", completedAt: new Date().toISOString() });
    refresh();
  }

  function markTodo(a: Assignment) {
    saveAssignment({ ...a, status: "todo", completedAt: undefined });
    refresh();
  }

  function markSessionDone(a: Assignment, sessionId: string) {
    const updatedSessions = a.studySessions.map((s) =>
      s.id === sessionId ? { ...s, done: true, completedAt: new Date().toISOString() } : s
    );
    const settings = loadSettings();
    const allDone = updatedSessions.every((s) => s.done);
    const newStatus = settings.autoCompleteOnAllSessionsDone && allDone ? "done" : a.status;
    const completedAt = newStatus === "done" ? new Date().toISOString() : a.completedAt;
    saveAssignment({ ...a, studySessions: updatedSessions, status: newStatus, completedAt });
    refresh();
  }

  function toggleSubtask(a: Assignment, subtaskId: string) {
    const updated = a.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, done: !s.done } : s
    );
    const settings = loadSettings();
    const allDone = updated.every((s) => s.done) && updated.length > 0;
    const newStatus = settings.autoCompleteOnAllSubtasksDone && allDone ? "done" : a.status;
    const completedAt = newStatus === "done" ? new Date().toISOString() : a.completedAt;
    saveAssignment({ ...a, subtasks: updated, status: newStatus, completedAt });
    refresh();
  }

  const sharedProps = {
    classMap,
    onDone: markDone,
    onMarkSessionDone: markSessionDone,
    expandedSubtasksId,
    onToggleSubtasks: (id: string) => setExpandedSubtasksId(expandedSubtasksId === id ? null : id),
    onToggleSubtask: toggleSubtask,
    sessionsDropdownId,
    onToggleSessions: (id: string) => setSessionsDropdownId(sessionsDropdownId === id ? null : id),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Today&apos;s Plan</h1>
      <p className="text-gray-500 text-sm mb-8">
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>

      {isEmpty ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-3xl mb-3">🎯</p>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Nothing to plan yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Add some assignments and this page will tell you what to work on today.
          </p>
          <Link
            href="/assignments"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Add assignments
          </Link>
        </div>
      ) : totalActive === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
          <p className="text-3xl mb-3">✅</p>
          <h2 className="text-lg font-semibold text-green-800 mb-1">All caught up!</h2>
          <p className="text-green-700 text-sm">You&apos;ve completed everything. Great work.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <PlanSection title="Overdue" items={groups.overdue} style="overdue" {...sharedProps} />
          <PlanSection title="Due Today" items={groups.today} style="today" {...sharedProps} />
          <PlanSection title="This Week" items={groups.thisWeek} style="normal" {...sharedProps} />
          <PlanSection title="Upcoming" items={groups.upcoming} style="muted" {...sharedProps} />
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Completed
          </h2>
          <ul className="space-y-2">
            {done.map((a) => (
              <li
                key={a.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-sm">✓</span>
                  <p className="text-sm text-gray-500 line-through">{a.title}</p>
                </div>
                <button onClick={() => markTodo(a)} className="text-xs text-gray-400 hover:text-gray-600">
                  Undo
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const sectionStyles = {
  overdue: { header: "text-red-600", card: "bg-red-50 border-red-200", doneBtn: "bg-red-100 text-red-700 hover:bg-red-200" },
  today:   { header: "text-indigo-700", card: "bg-white border-indigo-200", doneBtn: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  normal:  { header: "text-gray-700", card: "bg-white border-gray-200", doneBtn: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  muted:   { header: "text-gray-400", card: "bg-white border-gray-100", doneBtn: "bg-gray-100 text-gray-500 hover:bg-gray-200" },
};

interface SectionProps {
  title: string;
  items: Assignment[];
  classMap: Record<string, Class>;
  onDone: (a: Assignment) => void;
  onMarkSessionDone: (a: Assignment, sessionId: string) => void;
  expandedSubtasksId: string | null;
  onToggleSubtasks: (id: string) => void;
  onToggleSubtask: (a: Assignment, subtaskId: string) => void;
  sessionsDropdownId: string | null;
  onToggleSessions: (id: string) => void;
  style: keyof typeof sectionStyles;
}

function PlanSection({
  title, items, classMap, onDone, onMarkSessionDone,
  expandedSubtasksId, onToggleSubtasks, onToggleSubtask,
  sessionsDropdownId, onToggleSessions, style,
}: SectionProps) {
  if (items.length === 0) return null;
  const s = sectionStyles[style];

  return (
    <div>
      <h2 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${s.header}`}>
        {title} <span className="font-normal opacity-60">({items.length})</span>
      </h2>
      <ul className="space-y-3">
        {items.map((a) => {
          const cls = classMap[a.classId];
          const doneSubtasks = a.subtasks.filter((s) => s.done).length;
          const totalSubtasks = a.subtasks.length;
          const subtasksExpanded = expandedSubtasksId === a.id;
          const sessionsExpanded = sessionsDropdownId === a.id;
          const todaySession = getTodaySession(a);
          const undoneSessions = a.studySessions.filter((s) => !s.done);
          const sessionCount = undoneSessions.length;

          // Subtasks planned for today's session
          const todaySessionSubtasks = todaySession
            ? a.subtasks.filter((s) => todaySession.subtaskIds.includes(s.id))
            : [];

          return (
            <li key={a.id} className={`rounded-xl border ${s.card}`}>
              {/* Main card */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {cls && <span className="text-xs text-gray-400">{cls.name}</span>}
                    <Badge label={a.priority} variant="priority" />
                    <Badge label={a.type} />
                    <span className={`text-xs font-medium ${style === "overdue" ? "text-red-600" : "text-gray-400"}`}>
                      {getDueLabel(a.dueDate)}
                    </span>
                    <span className="text-xs text-gray-400">{a.estimatedMinutes} min</span>
                  </div>

                  {/* Today's session planned steps preview */}
                  {todaySession && todaySessionSubtasks.length > 0 && (
                    <p className="text-xs text-indigo-500 mt-1.5">
                      Today: {todaySessionSubtasks.map((s) => s.title).join(", ")}
                    </p>
                  )}

                  {/* Subtask progress bar */}
                  {totalSubtasks > 0 && (
                    <button
                      onClick={() => onToggleSubtasks(a.id)}
                      className="flex items-center gap-2 mt-2 group"
                    >
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${(doneSubtasks / totalSubtasks) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-indigo-600">
                        {doneSubtasks}/{totalSubtasks} steps {subtasksExpanded ? "▲" : "▼"}
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0 items-end">
                  {/* Sessions dropdown toggle */}
                  {sessionCount > 0 && (
                    <button
                      onClick={() => onToggleSessions(a.id)}
                      className="text-xs text-indigo-500 font-medium px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors whitespace-nowrap"
                    >
                      {sessionsExpanded ? "▲" : "▼"} Sessions ({sessionCount})
                    </button>
                  )}
                  {/* Mark whole assignment done */}
                  <button
                    onClick={() => onDone(a)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${s.doneBtn}`}
                  >
                    Mark done
                  </button>
                </div>
              </div>

              {/* Sessions dropdown */}
              {sessionsExpanded && (
                <div className="border-t border-indigo-100 px-5 py-3">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
                    Study Sessions
                  </p>
                  <ul className="space-y-2">
                    {[...a.studySessions]
                      .sort((x, y) => x.date.localeCompare(y.date))
                      .map((sess) => {
                        const plannedSubtasks = a.subtasks.filter((s) => sess.subtaskIds.includes(s.id));
                        const isToday = sess.date === new Date().toISOString().slice(0, 10);
                        return (
                          <li
                            key={sess.id}
                            className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 ${
                              sess.done
                                ? "bg-gray-50 border-gray-100 opacity-60"
                                : isToday
                                ? "bg-indigo-50 border-indigo-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${sess.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                                {new Date(sess.date + "T12:00:00").toLocaleDateString("en-US", {
                                  weekday: "short", month: "short", day: "numeric",
                                })}
                                {isToday && !sess.done && (
                                  <span className="ml-2 text-xs font-normal text-indigo-600">Today</span>
                                )}
                                {sess.done && (
                                  <span className="ml-2 text-xs font-normal text-green-600">Done</span>
                                )}
                              </p>
                              {plannedSubtasks.length > 0 && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Steps: {plannedSubtasks.map((s) => s.title).join(", ")}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">{a.estimatedMinutes} min</p>
                            </div>
                            {!sess.done && (
                              <button
                                onClick={() => onMarkSessionDone(a, sess.id)}
                                className="text-xs text-indigo-600 font-medium px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors whitespace-nowrap shrink-0"
                              >
                                ✓ Done
                              </button>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}

              {/* Subtask checklist */}
              {subtasksExpanded && totalSubtasks > 0 && (
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 rounded-b-xl space-y-2">
                  {a.subtasks.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sub.done}
                        onChange={() => onToggleSubtask(a, sub.id)}
                        className="accent-indigo-600 w-4 h-4 shrink-0"
                      />
                      <span className={`text-sm ${sub.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {sub.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
