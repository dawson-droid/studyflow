"use client";

import { useEffect, useState } from "react";
import { loadData, saveClass, deleteClass } from "@/lib/storage";
import { Class, Assignment } from "@/types";
import { getDueLabel, getDaysUntilDue } from "@/lib/planner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

const CLASS_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-pink-500", "bg-teal-500",
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Class | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [nameError, setNameError] = useState("");
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [color, setColor] = useState(CLASS_COLORS[0]);

  useEffect(() => {
    const data = loadData();
    setClasses(data.classes);
    setAssignments(data.assignments);
  }, []);

  function openAdd() {
    setEditTarget(null);
    setName("");
    setTeacher("");
    setColor(CLASS_COLORS[0]);
    setNameError("");
    setJustSaved(false);
    setShowForm(true);
  }

  function openEdit(cls: Class) {
    setEditTarget(cls);
    setName(cls.name);
    setTeacher(cls.teacher ?? "");
    setColor(cls.color);
    setNameError("");
    setJustSaved(false);
    setShowForm(true);
  }

  function handleSave() {
    if (!name.trim()) {
      setNameError("Class name is required.");
      return;
    }
    const isNew = !editTarget;
    const cls: Class = {
      id: editTarget?.id ?? generateId(),
      name: name.trim(),
      teacher: teacher.trim() || undefined,
      color,
      createdAt: editTarget?.createdAt ?? new Date().toISOString(),
    };
    saveClass(cls);
    setClasses(loadData().classes);
    setShowForm(false);
    if (isNew) setJustSaved(true);
  }

  function handleDelete(id: string) {
    deleteClass(id);
    const data = loadData();
    setClasses(data.classes);
    setAssignments(data.assignments);
    setConfirmDeleteId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        <Button onClick={openAdd}>+ Add class</Button>
      </div>

      {/* Fix #5 — next-step prompt after adding first class */}
      {justSaved && classes.length >= 1 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-indigo-800">
            Class added! Now add your assignments and tests so StudyFlow can build your plan.
          </p>
          <Link
            href="/assignments"
            className="shrink-0 bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add assignments →
          </Link>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editTarget ? "Edit class" : "New class"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class name *</label>
              <input
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${nameError ? "border-red-400" : "border-gray-300"}`}
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                placeholder="e.g. AP Biology"
                autoFocus
              />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher (optional)</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Ms. Johnson"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {CLASS_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full ${c} ${color === c ? "ring-2 ring-offset-2 ring-indigo-500" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {classes.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-3xl mb-3">🎒</p>
          <p className="text-gray-500 text-sm">No classes yet. Add your first class to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {classes.map((cls) => {
            const classAssignments = assignments.filter((a) => a.classId === cls.id);
            const active = classAssignments.filter((a) => a.status !== "done");
            const completed = classAssignments.filter((a) => a.status === "done");
            const isExpanded = expandedId === cls.id;
            const showHistory = showHistoryFor === cls.id;
            const isConfirmingDelete = confirmDeleteId === cls.id;

            return (
              <li key={cls.id} className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${cls.color}`} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cls.name}</p>
                      {cls.teacher && <p className="text-xs text-gray-400">{cls.teacher}</p>}
                    </div>
                    <span className="text-xs text-gray-400 ml-1">
                      {active.length} active · {completed.length} done
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : cls.id)}
                      className="text-xs text-gray-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      {isExpanded ? "▲ Assignments" : `▼ Assignments${active.length > 0 ? ` (${active.length})` : ""}`}
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(cls)}>Edit</Button>

                    {/* Fix #1 — inline delete confirmation */}
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-600 font-medium">Delete all data?</span>
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(cls.id)}>
                        <span className="text-red-500">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                    {active.length === 0 && completed.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">No assignments for this class yet.</p>
                    ) : (
                      <>
                        {active.length > 0 && (
                          <>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Active</p>
                            <ul className="space-y-2 mb-4">
                              {active
                                .sort((a, b) => getDaysUntilDue(a.dueDate) - getDaysUntilDue(b.dueDate))
                                .map((a) => {
                                  const overdue = getDaysUntilDue(a.dueDate) < 0;
                                  return (
                                    <li key={a.id}>
                                      <Link
                                        href="/assignments"
                                        className="flex items-center justify-between gap-3 py-1 rounded-lg hover:bg-indigo-50 -mx-1 px-1 transition-colors group"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${overdue ? "bg-red-400" : "bg-indigo-400"}`} />
                                          <span className="text-sm text-gray-800 truncate group-hover:text-indigo-700">{a.title}</span>
                                          <Badge label={a.type} />
                                        </div>
                                        <span className={`text-xs shrink-0 font-medium ${overdue ? "text-red-500" : "text-gray-400"}`}>
                                          {getDueLabel(a.dueDate)}
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                })}
                            </ul>
                          </>
                        )}
                        {completed.length > 0 && (
                          <>
                            <button
                              onClick={() => setShowHistoryFor(showHistory ? null : cls.id)}
                              className="text-xs text-gray-400 hover:text-indigo-600 font-medium mb-2 flex items-center gap-1"
                            >
                              {showHistory ? "▲" : "▼"} History ({completed.length} completed)
                            </button>
                            {showHistory && (
                              <ul className="space-y-2">
                                {completed
                                  .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
                                  .map((a) => (
                                    <li key={a.id} className="flex items-center justify-between gap-3 py-1 opacity-60">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-green-500 text-xs">✓</span>
                                        <span className="text-sm text-gray-500 line-through truncate">{a.title}</span>
                                      </div>
                                      <span className="text-xs text-gray-400 shrink-0">
                                        {a.completedAt
                                          ? new Date(a.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                          : "Completed"}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
