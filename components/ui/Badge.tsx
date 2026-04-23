interface BadgeProps {
  label: string;
  color?: string;
  variant?: "priority" | "status" | "type" | "custom";
}

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export default function Badge({ label, color, variant }: BadgeProps) {
  let classes = "bg-gray-100 text-gray-600";

  if (variant === "priority") classes = priorityColors[label] ?? classes;
  else if (variant === "status") classes = statusColors[label] ?? classes;
  else if (color) classes = color;

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${classes}`}>
      {label.replace("-", " ")}
    </span>
  );
}
