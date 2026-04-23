"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadData, saveData, saveAssignment, loadNotifications, markNotificationRead, clearAllNotifications, loadSettings } from "@/lib/storage";
import { getTodaysPlan, getDueLabel, getTodaySession } from "@/lib/planner";
import { buildSampleData } from "@/lib/sampleData";
import { Assignment, Class, AppNotification } from "@/types";
import Badge from "@/components/ui/Badge";

export default function DashboardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  function refresh() {
    const data = loadData();
    setAssignments(data.assignments);
    setClasses(data.classes);
    setNotifications(loadNotifications().filter((n) => !n.read));
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

  useEffect(() => { refresh(); }, []);

  function loadSample() {
    saveData(buildSampleData());
    refresh();
  }

  function clearData() {
    saveData({ classes: [], assignments: [] });
    refresh();
  }

  const todaysPlan = getTodaysPlan(assignments).slice(0, 5);
  const active = assignments.filter((a) => a.status !== "done");
  const overdue = active.filter((a) => {
    const [y, m, d] = a.dueDate.split("-").map(Number);
    const due = new Date(y, m - 1, d);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return due < t;
  });
  const completed = assignments.filter((a) => a.status === "done");
  const classMap = Object.fromEntries(classes.map((c) => [c.id, c]));
  const isEmpty = classes.length === 0 && assignments.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {!isEmpty && (
          confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">Delete everything?</span>
              <button
                onClick={() => { clearData(); setConfirmClear(false); }}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700"
              >
                Yes, clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="text-xs text-gray-400 hover:text-red-500">
              Clear all data
            </button>
          )
        )}
      </div>
      <p className="text-gray-500 text-sm mb-8">
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>

      {/* Notification box */}
      {notifications.length > 0 && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-indigo-800">
              📬 {notifications.length} new notification{notifications.length > 1 ? "s" : ""}
            </p>
            <button
              onClick={() => { clearAllNotifications(); setNotifications([]); }}
              className="text-xs text-indigo-400 hover:text-indigo-600"
            >
              Clear all
            </button>
          </div>
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-indigo-900">{n.message}</p>
                  {n.detail && <p className="text-xs text-indigo-600 mt-0.5">{n.detail}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {n.actionLabel && n.actionHref && (
                    <a href={n.actionHref} className="text-xs text-indigo-600 font-medium hover:underline">
                      {n.actionLabel}
                    </a>
                  )}
                  <button
                    onClick={() => { markNotificationRead(n.id); setNotifications(loadNotifications().filter((x) => !x.read)); }}
                    className="text-xs text-indigo-400 hover:text-indigo-600"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isEmpty ? (
        <div className="space-y-4">
          {/* Welcome card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-4xl mb-3">📚</p>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome to StudyFlow</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Add your classes and assignments, and StudyFlow will build your daily study plan automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/classes"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Add your first class
              </Link>
              <button
                onClick={loadSample}
                className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Load sample data
              </button>
            </div>
          </div>

          {/* Setup steps */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Add classes", desc: "Create a list of your courses.", href: "/classes" },
              { step: "2", title: "Log assignments", desc: "Add due dates, type, and priority.", href: "/assignments" },
              { step: "3", title: "Check Today", desc: "See what to study right now.", href: "/today" },
            ].map((s) => (
              <Link
                key={s.step}
                href={s.href}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mb-3">
                  {s.step}
                </div>
                <p className="font-medium text-gray-900 text-sm mb-1">{s.title}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard label="Classes" value={classes.length} href="/classes" />
            <StatCard label="Active tasks" value={active.length} href="/assignments" />
            <StatCard label="Overdue" value={overdue.length} href="/assignments" danger={overdue.length > 0} />
            <StatCard label="Completed" value={completed.length} href="/assignments" success />
          </div>

          {/* Up next */}
          {todaysPlan.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Up next</h2>
                <Link href="/today" className="text-indigo-600 text-sm hover:underline">
                  See full plan →
                </Link>
              </div>
              <ul className="divide-y divide-gray-100">
                {todaysPlan.map((a) => {
                  const cls = classMap[a.classId];
                  const todaySession = getTodaySession(a);
                  const sessionSubtasks = todaySession
                    ? a.subtasks.filter((s) => todaySession.subtaskIds.includes(s.id))
                    : [];
                  return (
                    <li key={a.id} className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{a.title}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            {cls && <span className="text-xs text-gray-400">{cls.name}</span>}
                            <Badge label={a.priority} variant="priority" />
                            <span className="text-xs text-gray-400">{getDueLabel(a.dueDate)}</span>
                            <span className="text-xs text-gray-400">{a.estimatedMinutes} min</span>
                          </div>
                          {todaySession && sessionSubtasks.length > 0 && (
                            <p className="text-xs text-indigo-500 mt-1">
                              Today: {sessionSubtasks.map((s) => s.title).join(", ")}
                            </p>
                          )}
                        </div>
                        {todaySession && (
                          <button
                            onClick={() => markSessionDone(a, todaySession.id)}
                            className="text-xs text-indigo-600 font-medium px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors shrink-0 whitespace-nowrap"
                          >
                            ✓ Session done
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label, value, href, danger, success,
}: {
  label: string; value: number; href: string; danger?: boolean; success?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-200 transition-colors"
    >
      <p className={`text-3xl font-bold ${danger && value > 0 ? "text-red-600" : success ? "text-green-600" : "text-gray-900"}`}>
        {value}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </Link>
  );
}
