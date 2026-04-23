import { StudyFlowData, Class, Assignment, AppSettings, AppNotification } from "@/types";

const STORAGE_KEY = "studyflow_data";
const SETTINGS_KEY = "studyflow_settings";
const NOTIFICATIONS_KEY = "studyflow_notifications";

const defaultData: StudyFlowData = {
  classes: [],
  assignments: [],
};

const defaultSettings: AppSettings = {
  autoCompleteOnAllSessionsDone: false,
  autoCompleteOnAllSubtasksDone: false,
  autoReplan: false,
  suggestedPlanning: false,
};

// Migrate old scheduledDate field to studySessions array
function migrate(data: StudyFlowData): StudyFlowData {
  data.assignments = data.assignments.map((a) => {
    const raw = a as Assignment & { scheduledDate?: string };
    if (!a.studySessions) {
      const sessions = raw.scheduledDate
        ? [{ id: Math.random().toString(36).slice(2, 10), date: raw.scheduledDate, subtaskIds: [], done: false }]
        : [];
      const { scheduledDate: _removed, ...rest } = raw;
      void _removed;
      return { ...rest, studySessions: sessions };
    }
    return a;
  });
  return data;
}

// ── Main data ──────────────────────────────────────────────

export function loadData(): StudyFlowData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return migrate(JSON.parse(raw) as StudyFlowData);
  } catch {
    return defaultData;
  }
}

export function saveData(data: StudyFlowData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveClass(cls: Class): void {
  const data = loadData();
  const idx = data.classes.findIndex((c) => c.id === cls.id);
  if (idx >= 0) data.classes[idx] = cls;
  else data.classes.push(cls);
  saveData(data);
}

export function deleteClass(classId: string): void {
  const data = loadData();
  data.classes = data.classes.filter((c) => c.id !== classId);
  data.assignments = data.assignments.filter((a) => a.classId !== classId);
  saveData(data);
}

export function saveAssignment(assignment: Assignment): void {
  const data = loadData();
  const idx = data.assignments.findIndex((a) => a.id === assignment.id);
  if (idx >= 0) data.assignments[idx] = assignment;
  else data.assignments.push(assignment);
  saveData(data);
}

export function deleteAssignment(assignmentId: string): void {
  const data = loadData();
  data.assignments = data.assignments.filter((a) => a.id !== assignmentId);
  saveData(data);
}

// ── Settings ───────────────────────────────────────────────

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ── Notifications ──────────────────────────────────────────

export function loadNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

export function addNotification(n: Omit<AppNotification, "id" | "createdAt" | "read">): void {
  const notifications = loadNotifications();
  notifications.unshift({
    ...n,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 20)));
}

export function markNotificationRead(id: string): void {
  const notifications = loadNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function clearAllNotifications(): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
}
