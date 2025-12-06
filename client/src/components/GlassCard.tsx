import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-md overflow-hidden",
        "bg-white/70 dark:bg-gray-900/70",
        "backdrop-blur-xl",
        "border border-pink-100/50 dark:border-pink-900/30",
        "shadow-lg shadow-pink-100/20 dark:shadow-pink-950/30",
        hover && "transition-all duration-300",
        className
      )}
      whileHover={hover ? { 
        y: -2,
        boxShadow: "0 20px 40px -15px rgba(236, 72, 153, 0.15)",
      } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function GlassPanel({ children, className, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-md overflow-hidden",
        "bg-white/50 dark:bg-gray-900/50",
        "backdrop-blur-lg",
        "border border-pink-50/30 dark:border-pink-900/20",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
