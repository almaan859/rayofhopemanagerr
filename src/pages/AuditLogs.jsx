import React, { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { GlassCard } from "@/components/ui/glass";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/format";

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    base44.entities.AuditLog.list("-created_date", 200).then((r) => setItems(r)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Security-sensitive action history" />
      {loading ? <TableSkeleton /> : items.length === 0 ? (
        <EmptyState icon={ScrollText} title="No audit events" description="Security-sensitive actions will be recorded here." />
      ) : (
        <GlassCard className="p-2 divide-y divide-border/40">
          {items.map((n) => (
            <div key={n.id} className="flex items-center gap-3 px-3 py-3">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm"><span className="font-medium">{n.action}</span> <span className="text-muted-foreground">on {n.entityType || "—"}</span></p>
                <p className="text-xs text-muted-foreground">{n.actorName || n.actorId || "System"} · {formatDate(n.created_date)}{n.ipAddress ? ` · ${n.ipAddress}` : ""}</p>
              </div>
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}