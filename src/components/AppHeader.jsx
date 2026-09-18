import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/AuthContext";

export default function AppHeader({ onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="glass-nav sticky top-0 z-20 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-border/50">
      <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search beneficiaries, campaigns, donors…"
          className="pl-9 bg-background/50 border-border/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              navigate(`/beneficiaries?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
            }
          }}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="rounded-full relative" onClick={() => navigate("/notifications")} aria-label="Notifications">
          <Bell className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
        </Button>
        <ThemeToggle />
        <div className="relative">
          <Button variant="ghost" className="gap-2 rounded-full pl-1.5 pr-3" onClick={() => setMenuOpen((v) => !v)}>
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 grid place-items-center text-white text-xs font-semibold">
              {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
              {user?.full_name || user?.email}
            </span>
          </Button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="glass-strong absolute right-0 mt-2 w-56 rounded-2xl p-1.5 z-40 animate-scale-in origin-top-right">
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-sm font-medium truncate">{user?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <span className="mt-1 inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {user?.role || "user"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}