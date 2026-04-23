import Link from "next/link";

const freeFeatures = [
  "Add unlimited classes",
  "Log assignments, tests, and quizzes",
  "Daily study plan (Today view)",
  "Task breakdown into steps",
  "Plan for a specific study day",
  "Monthly calendar view",
  "Completion tracking",
  "Works instantly — no account needed",
];

const proFeatures = [
  "Everything in Free",
  "AI Flashcard generator",
  "AI Study Guide builder",
  "Auto-replanning when you miss a day",
  "Smart study-time estimates",
  "Priority support",
];

export default function PricingPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Simple, honest pricing</h1>
        <p className="text-gray-500 text-sm">
          The free planner is fully usable on its own. Pro adds AI tools when you need them.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Free */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Free</p>
            <p className="text-4xl font-bold text-gray-900">$0</p>
            <p className="text-sm text-gray-400 mt-1">No account required. Always free.</p>
          </div>

          <ul className="space-y-3 flex-1 mb-8">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/dashboard"
            className="block text-center bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Start planning now
          </Link>
        </div>

        {/* Pro */}
        <div className="bg-indigo-600 rounded-2xl p-7 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Coming soon
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wide mb-1">Pro</p>
            <p className="text-4xl font-bold text-white">$5<span className="text-xl font-normal text-indigo-200">/mo</span></p>
            <p className="text-sm text-indigo-200 mt-1">For students who want AI-powered tools.</p>
          </div>

          <ul className="space-y-3 flex-1 mb-8">
            {proFeatures.map((f, i) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-white">
                <span className={`mt-0.5 shrink-0 ${i === 0 ? "text-indigo-300" : "text-indigo-300"}`}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <button
            disabled
            className="block w-full text-center bg-white text-indigo-600 py-2.5 rounded-lg text-sm font-medium opacity-80 cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Common questions</h2>
        {[
          {
            q: "Do I need an account to use StudyFlow?",
            a: "No. The free version works entirely in your browser with no sign-up required. Your data saves locally on your device.",
          },
          {
            q: "Will my data be saved if I close the browser?",
            a: "Yes. The free version saves everything to your browser's local storage, so it persists across sessions on the same device.",
          },
          {
            q: "When will Pro launch?",
            a: "Pro features are in development. The free planner is the foundation — AI tools will be added on top once the core experience is solid.",
          },
          {
            q: "Is $5/month the final price?",
            a: "The price shown is a placeholder. The real price will be announced when Pro launches.",
          },
        ].map(({ q, a }) => (
          <div key={q} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="font-medium text-gray-900 text-sm mb-1">{q}</p>
            <p className="text-sm text-gray-500">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
