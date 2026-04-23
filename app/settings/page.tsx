"use client";

import { useEffect, useState } from "react";
import { loadSettings, saveSettings } from "@/lib/storage";
import { AppSettings } from "@/types";
import Link from "next/link";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    autoCompleteOnAllSessionsDone: false,
    autoReplan: false,
    suggestedPlanning: false,
  });

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update(key: keyof AppSettings, value: boolean) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Customize how StudyFlow works for you.</p>

      {/* Free settings */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Study preferences
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <SettingRow
            title="Auto-complete when all sessions done"
            description="When all study sessions for an assignment are marked done, automatically mark the whole assignment as complete."
            checked={settings.autoCompleteOnAllSessionsDone}
            onChange={(v) => update("autoCompleteOnAllSessionsDone", v)}
          />
          <SettingRow
            title="Auto-complete when all steps done"
            description="When all steps (subtasks) for an assignment are checked off, automatically mark the whole assignment as complete."
            checked={settings.autoCompleteOnAllSubtasksDone}
            onChange={(v) => update("autoCompleteOnAllSubtasksDone", v)}
          />
        </div>
      </section>

      {/* Suggested planning — premium */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Planning assistance
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <SettingRow
            title="Suggested study scheduling"
            description="Let StudyFlow suggest when to study each assignment based on your due dates and workload. Review and approve each suggestion before it's applied."
            checked={settings.suggestedPlanning}
            onChange={(v) => update("suggestedPlanning", v)}
            premium
          />
        </div>
      </section>

      {/* Auto-replan — premium */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Auto-replan <span className="text-indigo-500 normal-case font-normal">Pro</span>
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <SettingRow
            title="Auto-replan missed sessions"
            description="When you miss a scheduled study session, StudyFlow automatically reschedules it to the next available day. A notification will appear on your dashboard so you always know what changed."
            checked={settings.autoReplan}
            onChange={(v) => update("autoReplan", v)}
            premium
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 ml-1">
          Auto-replan is a Pro feature.{" "}
          <Link href="/premium" className="text-indigo-500 hover:underline">
            Learn about StudyFlow Pro →
          </Link>
        </p>
      </section>
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  premium,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  premium?: boolean;
}) {
  return (
    <div className="p-5 flex items-start gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {premium && (
            <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full">
              Pro
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
      <div className="shrink-0 mt-0.5">
        {premium ? (
          <div className="relative">
            <button
              disabled
              className="w-10 h-6 rounded-full bg-gray-200 flex items-center cursor-not-allowed opacity-50"
              title="Upgrade to Pro to enable this setting"
            >
              <span className="w-5 h-5 bg-white rounded-full shadow ml-0.5 transition-transform" />
            </button>
            <span className="absolute -top-1 -right-1 text-xs">🔒</span>
          </div>
        ) : (
          <button
            onClick={() => onChange(!checked)}
            className={`w-10 h-6 rounded-full transition-colors flex items-center ${
              checked ? "bg-indigo-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                checked ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
