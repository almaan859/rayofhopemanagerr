import React, { useEffect, useState } from "react";
import { Bell, CheckCheck, Check } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/format";

const TYPE_COLORS = {
  task: "bg-sky-500/15 text-sky-600",
  campaign: "bg-violet-500/15 text-violet-600",
  inventory: "bg-amber-500/15 text-amber-600",
  donation: "bg-emerald-500/15 text-emerald-600",
  report: "bg-rose-500/15 text-rose-600",
  system: "bg-muted text-muted-foreground",
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setItems(await base44.entities.Notification.list("-created_date", 200)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id) => { await base44.entities.Notification.update(id, { isRead: true }); await load(); };
  const markAll = async () => {
    await Promise.all(items.filter((n) => !n.isRead).map((n) => base44.entities.Notification.update(n.id, { isRead: true })));
    await load();
  };
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description={`${unread} unread`}
        actions={unread > 0 && <Button variant="outline" className="gap-2" onClick={markAll}><CheckCheck className="h-4 w-4" /> Mark all read</Button>} />
      {loading ? <TableSkeleton /> : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <GlassCard className="p-2 divide-y divide-border/40">
          {items.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 px-3 py-3 rounded-xl ${n.isRead ? "" : "bg-muted/30"}`}>
              <span className={`mt-0.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${TYPE_COLORS[n.type] || TYPE_COLORS.system}`}>{n.type}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(n.created_date)}</p>
              </div>
              {!n.isRead && <Button variant="ghost" size="icon" onClick={() => markRead(n.id)} aria-label="Mark read"><Check className="h-4 w-4" /></Button>}
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}