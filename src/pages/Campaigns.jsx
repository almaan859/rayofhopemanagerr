import React, { useState } from "react";
import { Plus, Search, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import DataTable, { Badge } from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SimpleFormDialog from "@/components/SimpleFormDialog";
import { useEntityList } from "@/hooks/useEntityList";
import { formatDate } from "@/lib/format";

const STATUS = {
  planning: { label: "Planning", cls: "bg-sky-500/15 text-sky-600" },
  active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-600" },
  completed: { label: "Completed", cls: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", cls: "bg-rose-500/15 text-rose-600" },
};
const TYPES = ["education", "food", "clothing", "medical", "fundraising", "community", "other"];
const STATUSES = ["planning", "active", "completed", "cancelled"];
const FIELDS = [
  { name: "name", label: "Campaign name", required: true },
  { name: "type", label: "Type", type: "select", optionsKey: "types" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "endDate", label: "End date", type: "date" },
  { name: "location", label: "Location" },
  { name: "targetBeneficiaries", label: "Target beneficiaries", type: "number", default: 0 },
  { name: "status", label: "Status", type: "select", optionsKey: "statuses" },
];

export default function Campaigns() {
  const navigate = useNavigate();
  const { items, loading, create } = useEntityList("Campaign", { sort: "-startDate" });
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = items.filter((c) => !query || `${c.name} ${c.type} ${c.location}`.toLowerCase().includes(query.toLowerCase()));

  const columns = [
    { key: "name", header: "Campaign", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground capitalize">{r.type}</p></div> },
    { key: "location", header: "Location", render: (r) => r.location || "—" },
    { key: "startDate", header: "Period", render: (r) => `${formatDate(r.startDate)} → ${formatDate(r.endDate)}` },
    { key: "target", header: "Target", render: (r) => r.targetBeneficiaries ?? "—" },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} map={STATUS} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Campaigns" description="Plan, execute and report on programmes"
        actions={<Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create campaign</Button>} />
      <div className="glass p-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search campaigns…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 bg-background/50" />
      </div>
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns yet" description="Create your first campaign to coordinate volunteers and track impact."
          action={<Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create campaign</Button>} />
      ) : (
        <DataTable columns={columns} rows={filtered} onRowClick={(r) => navigate(`/campaigns/${r.id}`)} />
      )}
      <SimpleFormDialog open={open} onClose={() => setOpen(false)} title="Create campaign" fields={FIELDS}
        options={{ types: TYPES.map((t) => ({ value: t, label: t })), statuses: STATUSES.map((s) => ({ value: s, label: s })) }}
        onSubmit={async (f) => { await create({ ...f, targetBeneficiaries: Number(f.targetBeneficiaries) || 0, volunteerIds: [] }); setOpen(false); }} />
    </div>
  );
}