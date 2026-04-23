export default function PremiumPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">StudyFlow Pro</h1>
        <p className="text-gray-500 text-sm">
          Powerful AI tools to help you study smarter, not just harder.
        </p>
      </div>

      <div className="space-y-6">
        {/* AI Flashcards */}
        <FeatureCard
          emoji="🃏"
          title="AI Flashcards"
          description="Turn any assignment or set of notes into a ready-to-study flashcard deck. StudyFlow reads your material and generates questions and answers automatically."
          bullets={[
            "Generate flashcards from your own notes",
            "Study with spaced repetition",
            "Save decks per class or assignment",
            "Quiz yourself before a test",
          ]}
        />

        {/* AI Study Guides */}
        <FeatureCard
          emoji="📖"
          title="AI Study Guides"
          description="Get a structured summary of any topic in minutes. Paste in your reading or assignment details and StudyFlow builds a clean, scannable study guide."
          bullets={[
            "Key concepts broken down clearly",
            "Organized by topic and subtopic",
            "Saved automatically to your assignment",
            "Great for test prep and review",
          ]}
        />

        {/* Auto-Replanning */}
        <FeatureCard
          emoji="🔄"
          title="Auto-Replanning"
          description="Life happens. When you miss a study day or a deadline shifts, StudyFlow automatically rebuilds your plan so nothing falls through the cracks."
          bullets={[
            "Detects missed work and reschedules it",
            "Adjusts your plan when due dates change",
            "Keeps your daily view clean and realistic",
            "Never fall behind without knowing it",
          ]}
        />
      </div>

      {/* CTA */}
      <div className="mt-10 bg-indigo-600 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Coming soon</h2>
        <p className="text-indigo-200 text-sm max-w-md mx-auto">
          These features are in development. The free planner is fully usable right now — Pro features will layer on top when they&apos;re ready.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
  bullets,
}: {
  emoji: string;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <span className="text-3xl">{emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
              Coming soon
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">{description}</p>
          <ul className="space-y-1.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-indigo-400 text-xs">✦</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
