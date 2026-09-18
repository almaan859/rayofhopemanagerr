import React from "react";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/ui/glass";
import { useAuth } from "@/lib/AuthContext";
import { Shield, User as UserIcon, Palette } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const Row = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Account and system configuration" />
      <GlassCard className="p-6 space-y-3 max-w-lg">
        <h3 className="text-sm font-semibold">Account</h3>
        <Row icon={UserIcon} label="Name" value={user?.full_name || "—"} />
        <Row icon={UserIcon} label="Email" value={user?.email || "—"} />
        <Row icon={Shield} label="Role" value={user?.role || "—"} />
      </GlassCard>
      <GlassCard className="p-6 space-y-3 max-w-lg">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4" /> Appearance</h3>
        <p className="text-sm text-muted-foreground">Toggle light or dark mode from the header. The Liquid Glass theme adapts automatically.</p>
      </GlassCard>
      <GlassCard className="p-6 max-w-lg">
        <h3 className="text-sm font-semibold mb-2">About</h3>
        <p className="text-sm text-muted-foreground">Ray of Hope Foundation, Pune — NGO Management System. Built as a college project on the Base44 platform.</p>
      </GlassCard>
    </div>
  );
}