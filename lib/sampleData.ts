import { StudyFlowData } from "@/types";

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function id() {
  return Math.random().toString(36).slice(2, 10);
}

export function buildSampleData(): StudyFlowData {
  const bioId = id();
  const engId = id();
  const mathId = id();
  const histId = id();

  return {
    classes: [
      { id: bioId, name: "AP Biology", color: "bg-emerald-500", teacher: "Ms. Carter", createdAt: new Date().toISOString() },
      { id: engId, name: "English 11", color: "bg-indigo-500", teacher: "Mr. Patel", createdAt: new Date().toISOString() },
      { id: mathId, name: "Pre-Calculus", color: "bg-amber-500", teacher: "Ms. Nguyen", createdAt: new Date().toISOString() },
      { id: histId, name: "US History", color: "bg-rose-500", teacher: "Mr. Thompson", createdAt: new Date().toISOString() },
    ],
    assignments: [
      {
        id: id(), classId: bioId, title: "Cell Division Lab Report",
        type: "assignment", dueDate: daysFromNow(1), priority: "high",
        estimatedMinutes: 90, status: "in-progress", subtasks: [
          { id: id(), title: "Write introduction", done: true },
          { id: id(), title: "Analyze microscope data", done: true },
          { id: id(), title: "Write conclusion", done: false },
        ], studySessions: [], createdAt: new Date().toISOString(),
      },
      {
        id: id(), classId: mathId, title: "Chapter 8 Quiz",
        type: "quiz", dueDate: daysFromNow(1), priority: "high",
        estimatedMinutes: 45, status: "todo", subtasks: [], studySessions: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: id(), classId: engId, title: "The Great Gatsby Essay",
        type: "assignment", dueDate: daysFromNow(3), priority: "high",
        estimatedMinutes: 120, status: "todo", subtasks: [
          { id: id(), title: "Choose a theme", done: false },
          { id: id(), title: "Find 3 quotes", done: false },
          { id: id(), title: "Write outline", done: false },
          { id: id(), title: "Write draft", done: false },
        ], studySessions: [], createdAt: new Date().toISOString(),
      },
      {
        id: id(), classId: histId, title: "WWI Causes Reading",
        type: "reading", dueDate: daysFromNow(2), priority: "medium",
        estimatedMinutes: 40, status: "todo", subtasks: [], studySessions: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: id(), classId: bioId, title: "Unit 4 Test — Genetics",
        type: "test", dueDate: daysFromNow(5), priority: "high",
        estimatedMinutes: 180, status: "todo", subtasks: [
          { id: id(), title: "Review Punnett squares", done: false },
          { id: id(), title: "Study vocab flashcards", done: false },
          { id: id(), title: "Practice problems", done: false },
        ], studySessions: [], createdAt: new Date().toISOString(),
      },
      {
        id: id(), classId: mathId, title: "Problem Set 8.3",
        type: "assignment", dueDate: daysFromNow(4), priority: "medium",
        estimatedMinutes: 60, status: "todo", subtasks: [], studySessions: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: id(), classId: histId, title: "WWII Research Project",
        type: "project", dueDate: daysFromNow(10), priority: "high",
        estimatedMinutes: 240, status: "todo", subtasks: [
          { id: id(), title: "Pick a topic", done: false },
          { id: id(), title: "Find 5 sources", done: false },
          { id: id(), title: "Write outline", done: false },
          { id: id(), title: "Write first draft", done: false },
          { id: id(), title: "Revise and submit", done: false },
        ], studySessions: [], createdAt: new Date().toISOString(),
      },
      {
        id: id(), classId: engId, title: "Vocabulary Quiz — Unit 9",
        type: "quiz", dueDate: daysFromNow(6), priority: "medium",
        estimatedMinutes: 30, status: "todo", subtasks: [], studySessions: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: id(), classId: bioId, title: "Photosynthesis Worksheet",
        type: "assignment", dueDate: daysFromNow(-1), priority: "medium",
        estimatedMinutes: 30, status: "todo", subtasks: [], studySessions: [],
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
