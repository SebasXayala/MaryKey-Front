import Link from "next/link";

import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizes = {
  sm: "text-sm",
  md: "text-xl",
  lg: "text-3xl",
};

export function Logo({ className, size = "md", href = "/" }: LogoProps) {
  const content = (
    <span className={cn("wordmark text-primary-500", sizes[size], className)}>
      Mary&nbsp;Kay
    </span>
  );

  return href ? (
    <Link href={href} aria-label="Mary Kay — inicio">
      {content}
    </Link>
  ) : (
    content
  );
}
