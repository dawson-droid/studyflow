"use client";

import { useEffect, useState } from "react";
import { loadData } from "@/lib/storage";
import { Assignment, Class } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [today] = useState(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    const data = loadData();
    setAssignments(data.assignments);
    setClasses(data.classes);
  }, []);

  const classMap = Object.fromEntries(classes.map((c) => [c.id, c]));

  // Due dates
  const byDueDate: Record<string, Assignment[]> = {};
  for (const a of assignments) {
    if (!byDueDate[a.dueDate]) byDueDate[a.dueDate] = [];
    byDueDate[a.dueDate].push(a);
  }

  // Study session dates from studySessions array
  const byStudyDate: Record<string, Assignment[]> = {};
  for (const a of assignments) {
    if (a.status === "done") continue;
    for (const sess of a.studySessions) {
      if (!sess.done && sess.date !== a.dueDate) {
        if (!byStudyDate[sess.date]) byStudyDate[sess.date] = [];
        if (!byStudyDate[sess.date].includes(a)) byStudyDate[sess.date].push(a);
      }
    }
  }

  function prevMonth() {
    setExpandedDay(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    setExpandedDay(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function dateKey(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function isToday(day: number) {
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  }

  const PREVIEW_LIMIT = 2;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-gray-800 w-36 text-center">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
          >
            ›
          </button>
          <button
            onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
            className="text-xs text-indigo-600 hover:underline ml-2"
          >
            Today
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-xs font-semibold text-gray-400 text-center py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="bg-gray-50 min-h-24" />;
          }

          const key = dateKey(day);
          const dueAssignments = (byDueDate[key] ?? []).filter((a) => a.status !== "done");
          const studyAssignments = byStudyDate[key] ?? [];
          const allItems = [
            ...dueAssignments.map((a) => ({ a, type: "due" as const })),
            ...studyAssignments.map((a) => ({ a, type: "study" as const })),
          ];
          const isExpanded = expandedDay === key;
          const shown = isExpanded ? allItems : allItems.slice(0, PREVIEW_LIMIT);
          const hidden = allItems.length - PREVIEW_LIMIT;

          return (
            <div
              key={key}
              className={`bg-white p-2 min-h-24 ${isToday(day) ? "bg-indigo-50" : ""}`}
            >
              {/* Day number */}
              <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                isToday(day) ? "bg-indigo-600 text-white" : "text-gray-500"
              }`}>
                {day}
              </div>

              {/* Assignment chips */}
              <div className="space-y-1">
                {shown.map(({ a, type }) => {
                  const cls = classMap[a.classId];
                  const colorDot = cls?.color ?? "bg-gray-400";
                  const isStudy = type === "study";
                  return (
                    <div
                      key={`${a.id}-${type}`}
                      title={`${isStudy ? "Study session: " : "Due: "}${a.title}${cls ? ` · ${cls.name}` : ""}`}
                      className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 truncate ${
                        isStudy
                          ? "bg-amber-50 text-amber-800 border border-amber-300"
                          : "bg-indigo-50 text-indigo-800 border border-indigo-100"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isStudy ? "bg-amber-400" : colorDot}`} />
                      <span className="truncate">
                        {isStudy ? "Study · " : ""}{a.title}{!isStudy ? " (Due)" : ""}
                      </span>
                    </div>
                  );
                })}

                {/* Expand / collapse */}
                {!isExpanded && hidden > 0 && (
                  <button
                    onClick={() => setExpandedDay(key)}
                    className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                  >
                    +{hidden} more
                  </button>
                )}
                {isExpanded && allItems.length > PREVIEW_LIMIT && (
                  <button
                    onClick={() => setExpandedDay(null)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-indigo-50 border border-indigo-100 inline-block" />
          Due date
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block" />
          Study session
        </div>
        {classes.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}
