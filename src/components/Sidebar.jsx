import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navForRole } from "@/lib/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar({ role, open, onClose }) {
  const items = navForRole(role || "staff");
  const location = useLocation();
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "glass-nav fixed z-40 inset-y-0 left-0 w-64 flex flex-col transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border/50">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center shadow-md">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Ray of Hope</p>
            <p className="text-[11px] text-muted-foreground">NGO Management</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-border/50 text-[11px] text-muted-foreground">
          © 2026 Ray of Hope Foundation, Pune
        </div>
      </aside>
    </>
  );
}