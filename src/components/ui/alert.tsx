import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Tone = "error" | "success" | "info";

const tones: Record<Tone, { wrapper: string; icon: React.ReactNode }> = {
  error: {
    wrapper: "border-danger/20 bg-danger/5 text-danger",
    icon: <AlertCircle className="size-4 shrink-0" />,
  },
  success: {
    wrapper: "border-success/20 bg-success/5 text-success",
    icon: <CheckCircle2 className="size-4 shrink-0" />,
  },
  info: {
    wrapper: "border-primary-200 bg-primary-50 text-primary-700",
    icon: <Info className="size-4 shrink-0" />,
  },
};

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-field border px-4 py-3 text-xs leading-relaxed",
        tones[tone].wrapper,
        className,
      )}
    >
      {tones[tone].icon}
      <span>{children}</span>
    </div>
  );
}
