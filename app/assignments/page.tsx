"use client";

import { useEffect, useState } from "react";
import { loadData, saveAssignment, deleteAssignment, loadSettings } from "@/lib/storage";
import { Assignment, Class, Priority, AssignmentType, TaskStatus, Subtask, StudySession } from "@/types";
import { getDueLabel, getDaysUntilDue } from "@/lib/planner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const TYPES: AssignmentType[] = ["assignment", "test", "quiz", "project", "reading"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

const emptyForm = {
  title: "",
  classId: "",
  type: "assignment" as AssignmentType,
  dueDate: "",
  priority: "medium" as Priority,
  estimatedMinutes: 30,
  notes: "",
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Assignment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subtaskInputs, setSubtaskInputs] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<{ title?: string; dueDate?: string }>({});

  // Session panel state (add-session form)
  const [sessionPanelId, setSessionPanelId] = useState<string | null>(null);
  const [newSessionDate, setNewSessionDate] = useState(todayStr());
  const [newSessionSubtaskIds, setNewSessionSubtaskIds] = useState<string[]>([]);
  const [newSessionMinutes, setNewSessionMinutes] = useState(30);
  // Sessions dropdown (view/mark-done existing sessions)
  const [sessionsDropdownId, setSessionsDropdownId] = useState<string | null>(null);
  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const data = loadData();
    setAssignments(data.assignments);
    setClasses(data.classes);
  }, []);

  const classMap = Object.fromEntries(classes.map((c) => [c.id, c]));

  function openAdd() {
    setEditTarget(null);
    setForm({ ...emptyForm, classId: classes[0]?.id ?? "" });
    setFormErrors({});
    setShowForm(true);
  }

  function openEdit(a: Assignment) {
    setEditTarget(a);
    setForm({
      title: a.title,
      classId: a.classId,
      type: a.type,
      dueDate: a.dueDate,
      priority: a.priority,
      estimatedMinutes: a.estimatedMinutes,
      notes: a.notes ?? "",
    });
    setShowForm(true);
  }

  function handleSave() {
    const errors: { title?: string; dueDate?: string } = {};
    if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.dueDate) errors.dueDate = "Due date is required.";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    const assignment: Assignment = {
      id: editTarget?.id ?? generateId(),
      classId: form.classId,
      title: form.title.trim(),
      type: form.type,
      dueDate: form.dueDate,
      priority: form.priority,
      estimatedMinutes: form.estimatedMinutes,
      status: editTarget?.status ?? "todo",
      notes: form.notes || undefined,
      subtasks: editTarget?.subtasks ?? [],
      studySessions: editTarget?.studySessions ?? [],
      createdAt: editTarget?.createdAt ?? new Date().toISOString(),
    };
    saveAssignment(assignment);
    setAssignments(loadData().assignments);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    deleteAssignment(id);
    setAssignments(loadData().assignments);
  }

  function handleStatusChange(a: Assignment, status: TaskStatus) {
    const completedAt = status === "done" ? new Date().toISOString() : undefined;
    saveAssignment({ ...a, status, completedAt });
    setAssignments(loadData().assignments);
  }

  function addSubtask(a: Assignment) {
    const text = (subtaskInputs[a.id] ?? "").trim();
    if (!text) return;
    const subtask: Subtask = { id: generateId(), title: text, done: false };
    saveAssignment({ ...a, subtasks: [...a.subtasks, subtask] });
    setAssignments(loadData().assignments);
    setSubtaskInputs((prev) => ({ ...prev, [a.id]: "" }));
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
    setAssignments(loadData().assignments);
  }

  function deleteSubtask(a: Assignment, subtaskId: string) {
    saveAssignment({ ...a, subtasks: a.subtasks.filter((s) => s.id !== subtaskId) });
    setAssignments(loadData().assignments);
  }

  function openSessionPanel(a: Assignment) {
    setSessionPanelId(a.id);
    setNewSessionDate(todayStr());
    setNewSessionSubtaskIds([]);
    const settings = loadSettings();
    const sessionCount = a.studySessions.filter((s) => !s.done).length + 1;
    const minutes = settings.autoSplitSessionTime
      ? Math.round(a.estimatedMinutes / sessionCount)
      : a.estimatedMinutes;
    setNewSessionMinutes(Math.max(5, minutes));
  }

  function addSession(a: Assignment) {
    if (!newSessionDate) return;
    const session: StudySession = {
      id: generateId(),
      date: newSessionDate,
      subtaskIds: newSessionSubtaskIds,
      durationMinutes: newSessionMinutes,
      done: false,
    };
    saveAssignment({ ...a, studySessions: [...a.studySessions, session] });
    setAssignments(loadData().assignments);
    setNewSessionDate(todayStr());
    setNewSessionSubtaskIds([]);
    setNewSessionMinutes(30);
  }

  function deleteSession(a: Assignment, sessionId: string) {
    saveAssignment({ ...a, studySessions: a.studySessions.filter((s) => s.id !== sessionId) });
    setAssignments(loadData().assignments);
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
    setAssignments(loadData().assignments);
  }

  function toggleNewSessionSubtask(subtaskId: string) {
    setNewSessionSubtaskIds((prev) =>
      prev.includes(subtaskId) ? prev.filter((id) => id !== subtaskId) : [...prev, subtaskId]
    );
  }

  const sorted = [...assignments].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    return getDaysUntilDue(a.dueDate) - getDaysUntilDue(b.dueDate);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <Button onClick={openAdd} disabled={classes.length === 0}>
          + Add assignment
        </Button>
      </div>

      {classes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          Add at least one class before creating assignments.
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editTarget ? "Edit assignment" : "New assignment"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.title ? "border-red-400" : "border-gray-300"}`}
                value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); setFormErrors((p) => ({ ...p, title: undefined })); }}
                placeholder="e.g. Chapter 5 essay"
                autoFocus
              />
              {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as AssignmentType })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date *</label>
              <input
                type="date"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.dueDate ? "border-red-400" : "border-gray-300"}`}
                value={form.dueDate}
                onChange={(e) => { setForm({ ...form, dueDate: e.target.value }); setFormErrors((p) => ({ ...p, dueDate: undefined })); }}
              />
              {formErrors.dueDate && <p className="text-xs text-red-500 mt-1">{formErrors.dueDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Study time needed <span className="font-normal text-gray-400">(minutes, e.g. 45)</span></label>
              <input
                type="number"
                min={5}
                step={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.estimatedMinutes}
                onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any extra context..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {assignments.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-3xl mb-3">📝</p>
          <p className="text-gray-500 text-sm">No assignments yet. Add one to start building your study plan.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((a) => {
            const cls = classMap[a.classId];
            const daysLeft = getDaysUntilDue(a.dueDate);
            const overdue = daysLeft < 0 && a.status !== "done";
            const expanded = expandedId === a.id;
            const sessionOpen = sessionPanelId === a.id;
            const doneCount = a.subtasks.filter((s) => s.done).length;
            const totalCount = a.subtasks.length;
            const sessionCount = a.studySessions.filter((s) => !s.done).length;
            const sessionsOpen = sessionsDropdownId === a.id;

            return (
              <li
                key={a.id}
                className={`bg-white rounded-xl border ${a.status === "done" ? "opacity-60 border-gray-100" : overdue ? "border-red-200" : "border-gray-200"}`}
              >
                {/* Main row */}
                <div className="flex items-start justify-between gap-4 p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={a.status === "done"}
                      onChange={(e) => handleStatusChange(a, e.target.checked ? "done" : "todo")}
                      className="mt-1 accent-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className={`text-sm font-medium ${a.status === "done" ? "line-through text-gray-400" : "text-gray-900"}`}>
                        {a.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {cls && <span className="text-xs text-gray-400">{cls.name}</span>}
                        <Badge label={a.priority} variant="priority" />
                        <Badge label={a.type} />
                        <span className={`text-xs font-medium ${overdue ? "text-red-600" : "text-gray-400"}`}>
                          {getDueLabel(a.dueDate)}
                        </span>
                        <span className="text-xs text-gray-400">{a.estimatedMinutes} min</span>
                      </div>

                      {/* Subtask progress pill */}
                      {totalCount > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${(doneCount / totalCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{doneCount}/{totalCount} steps</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 shrink-0 items-center justify-end">
                    {sessionCount > 0 && (
                      <button
                        onClick={() => setSessionsDropdownId(sessionsOpen ? null : a.id)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                      >
                        {sessionsOpen ? "▲" : "▼"} Sessions ({sessionCount})
                      </button>
                    )}
                    <button
                      onClick={() => setSessionPanelId(sessionOpen ? null : a.id)}
                      className="text-xs text-gray-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      {sessionOpen ? "▲ Plan" : "▼ Plan for..."}
                    </button>
                    <button
                      onClick={() => setExpandedId(expanded ? null : a.id)}
                      className="text-xs text-gray-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      {expanded ? "▲ Steps" : `▼ Steps${totalCount > 0 ? ` (${totalCount})` : ""}`}
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>Edit</Button>
                    {confirmDeleteId === a.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-600 font-medium">Delete?</span>
                        <button
                          onClick={() => { handleDelete(a.id); setConfirmDeleteId(null); }}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 px-1 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(a.id)}>
                        <span className="text-red-500">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sessions dropdown — view/mark-done existing sessions */}
                {sessionsOpen && (
                  <div className="border-t border-indigo-100 px-4 pb-3 pt-3">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
                      Planned Sessions
                    </p>
                    <ul className="space-y-2">
                      {[...a.studySessions]
                        .sort((x, y) => x.date.localeCompare(y.date))
                        .map((sess) => {
                          const plannedSubtasks = a.subtasks.filter((s) => sess.subtaskIds.includes(s.id));
                          return (
                            <li
                              key={sess.id}
                              className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 ${sess.done ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-200"}`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${sess.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                                  {new Date(sess.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                  {sess.done && <span className="ml-2 text-xs font-normal text-green-600 no-underline">Done</span>}
                                </p>
                                {plannedSubtasks.length > 0 && (
                                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                                    Steps: {plannedSubtasks.map((s) => s.title).join(", ")}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-0.5">{sess.durationMinutes} min</p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                {!sess.done && (
                                  <button
                                    onClick={() => markSessionDone(a, sess.id)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                                  >
                                    ✓ Done
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteSession(a, sess.id)}
                                  className="text-xs text-gray-300 hover:text-red-400 px-1.5 py-1 rounded transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}

                {/* Session panel */}
                {sessionOpen && (
                  <div className="border-t border-indigo-100 bg-indigo-50/40 px-4 pb-4 pt-3">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
                      Study Sessions
                    </p>

                    {/* Add session form */}
                    <div className="bg-white rounded-lg border border-indigo-100 p-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Add a study session</p>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="date"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={newSessionDate}
                          onChange={(e) => setNewSessionDate(e.target.value)}
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min={5}
                            step={5}
                            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newSessionMinutes}
                            onChange={(e) => setNewSessionMinutes(Number(e.target.value))}
                          />
                          <span className="text-xs text-gray-400">min</span>
                        </div>
                      </div>

                      {a.subtasks.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 mb-2">Which steps will you work on? (optional)</p>
                          <ul className="space-y-1.5">
                            {a.subtasks.map((s) => (
                              <li key={s.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`sess-sub-${s.id}`}
                                  checked={newSessionSubtaskIds.includes(s.id)}
                                  onChange={() => toggleNewSessionSubtask(s.id)}
                                  className="accent-indigo-600 w-4 h-4 cursor-pointer shrink-0"
                                />
                                <label
                                  htmlFor={`sess-sub-${s.id}`}
                                  className={`text-sm cursor-pointer ${s.done ? "line-through text-gray-400" : "text-gray-700"}`}
                                >
                                  {s.title}
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button size="sm" onClick={() => addSession(a)}>Add session</Button>
                    </div>
                  </div>
                )}

                {/* Subtask panel */}
                {expanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Steps
                    </p>

                    {a.subtasks.length === 0 && (
                      <p className="text-xs text-gray-400 mb-3">
                        Break this assignment into smaller steps to make it less overwhelming.
                      </p>
                    )}

                    <ul className="space-y-2 mb-3">
                      {a.subtasks.map((s) => (
                        <li key={s.id} className="flex items-center gap-3 group">
                          <input
                            type="checkbox"
                            checked={s.done}
                            onChange={() => toggleSubtask(a, s.id)}
                            className="accent-indigo-600 w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span className={`text-sm flex-1 ${s.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                            {s.title}
                          </span>
                          <button
                            onClick={() => deleteSubtask(a, s.id)}
                            className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Add subtask input */}
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Add a step..."
                        value={subtaskInputs[a.id] ?? ""}
                        onChange={(e) =>
                          setSubtaskInputs((prev) => ({ ...prev, [a.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && addSubtask(a)}
                      />
                      <Button size="sm" onClick={() => addSubtask(a)}>Add</Button>
                    </div>
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
