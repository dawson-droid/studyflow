export type Priority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in-progress" | "done";
export type AssignmentType = "assignment" | "test" | "quiz" | "project" | "reading";

export interface Class {
  id: string;
  name: string;
  color: string;
  teacher?: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface StudySession {
  id: string;
  date: string;           // "YYYY-MM-DD"
  subtaskIds: string[];   // which subtasks are planned for this session
  done: boolean;
  completedAt?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  type: AssignmentType;
  dueDate: string;
  priority: Priority;
  estimatedMinutes: number;
  status: TaskStatus;
  notes?: string;
  subtasks: Subtask[];
  studySessions: StudySession[];
  completedAt?: string;
  createdAt: string;
}

export interface AppSettings {
  autoCompleteOnAllSessionsDone: boolean;
  autoCompleteOnAllSubtasksDone: boolean;
  autoReplan: boolean;        // premium
  suggestedPlanning: boolean; // premium
}

export interface AppNotification {
  id: string;
  message: string;
  detail?: string;
  type: "replan" | "suggestion" | "info";
  createdAt: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

export interface StudyFlowData {
  classes: Class[];
  assignments: Assignment[];
}
