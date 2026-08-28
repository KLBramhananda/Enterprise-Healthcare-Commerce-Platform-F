/**
 * ServiceCard
 *
 * Reusable card for displaying healthcare services with icon, title, and description.
 */

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type ServiceCardColor = "blue" | "purple" | "emerald" | "amber";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: ServiceCardColor;
  className?: string;
}

const colorStyles: Record<ServiceCardColor, { card: string; iconBg: string }> = {
  blue: {
    card: "bg-blue-50 text-blue-600 border-blue-200",
    iconBg: "bg-white",
  },
  purple: {
    card: "bg-purple-50 text-purple-600 border-purple-200",
    iconBg: "bg-white",
  },
  emerald: {
    card: "bg-emerald-50 text-emerald-600 border-emerald-200",
    iconBg: "bg-white",
  },
  amber: {
    card: "bg-amber-50 text-amber-600 border-amber-200",
    iconBg: "bg-white",
  },
};

export default function ServiceCard({
  icon,
  title,
  description,
  color = "emerald",
  className,
}: ServiceCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={cn(
        "group rounded-xl border p-6 text-left transition-all duration-normal ease-smooth hover:shadow-md",
        styles.card,
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm",
          styles.iconBg,
        )}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-surface-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-surface-600">{description}</p>
    </div>
  );
}
