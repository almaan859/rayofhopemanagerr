import React from "react";
import { cn } from "@/lib/utils";

export function GlassCard({ className, children, strong = false, ...props }) {
  return (
    <div className={cn(strong ? "glass-strong" : "glass", className)} {...props}>
      {children}
    </div>
  );
}

export default GlassCard;