import Link from "next/link";

const steps = [
  {
    step: "1",
    title: "Add your classes",
    description: "Create a list of your courses in seconds.",
  },
  {
    step: "2",
    title: "Log assignments and tests",
    description: "Add due dates, priority, and estimated time for each task.",
  },
  {
    step: "3",
    title: "Get a daily plan",
    description: "StudyFlow tells you exactly what to work on today.",
  },
];

const premiumFeatures = [
  {
    title: "AI Flashcards",
    description: "Generate flashcards from your notes automatically.",
  },
  {
    title: "AI Study Guides",
    description: "Turn your assignments into structured study guides.",
  },
  {
    title: "Auto-Replanning",
    description: "Missed a day? The plan adjusts itself.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-indigo-600 text-xl tracking-tight">StudyFlow</span>
          <Link
            href="/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center px-6 pt-20 pb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-snug">
          Know exactly what to study today.
        </h1>
        <p className="mt-5 text-base text-gray-500 leading-relaxed">
          Add your classes, assignments, and tests. StudyFlow builds a clear daily plan so you
          always know where to start — no more guessing.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium text-base hover:bg-indigo-700 transition-colors"
          >
            Start planning for free
          </Link>
          <a
            href="#how-it-works"
            className="text-gray-600 border border-gray-200 px-6 py-3 rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
          >
            See how it works
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-400">No account needed. Free to use.</p>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center mb-4">
                  {f.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium teaser */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">More powerful tools, coming soon</h2>
            <p className="text-gray-500 mt-2 text-sm">The free planner is just the start.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {premiumFeatures.map((f) => (
              <div key={f.title} className="rounded-xl p-5 border border-dashed border-gray-200 bg-white overflow-hidden">
                <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full mb-3">
                  Coming soon
                </span>
                <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Stop guessing. Start studying.</h2>
        <p className="text-indigo-200 text-sm mb-6">Free to use. No sign-up required.</p>
        <Link
          href="/dashboard"
          className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg text-base hover:bg-indigo-50 transition-colors"
        >
          Start planning now
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
        StudyFlow — built to help students focus.
      </footer>
    </div>
  );
}
