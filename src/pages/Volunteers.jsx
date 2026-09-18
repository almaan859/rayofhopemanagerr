import React, { useState } from "react";
import { Plus, Search, HandHeart } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable, { Badge } from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SimpleFormDialog from "@/components/SimpleFormDialog";
import { useEntityList } from "@/hooks/useEntityList";

const STATUS = {
  active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-600" },
  inactive: { label: "Inactive", cls: "bg-muted text-muted-foreground" },
};
const AVAIL = ["weekdays", "weekends", "flexible", "unavailable"];
const FIELDS = [
  { name: "name", label: "Full name", required: true },
  { name: "email", label: "Email", type: "email" },
  { name: "skills", label: "Skills (comma separated)", type: "textarea" },
  { name: "availability", label: "Availability", type: "select", optionsKey: "avail" },
  { name: "emergencyContact", label: "Emergency contact" },
  { name: "status", label: "Status", type: "select", optionsKey: "status" },
];

export default function Volunteers() {
  const { items, loading, create } = useEntityList("Volunteer");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = items.filter((v) => !query || `${v.name} ${(v.skills || []).join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  const columns = [
    { key: "name", header: "Name", render: (r) => <p className="font-medium">{r.name}</p> },
    { key: "skills", header: "Skills", render: (r) => <p className="text-sm text-muted-foreground">{(r.skills || []).join(", ") || "—"}</p> },
    { key: "availability", header: "Availability", render: (r) => <span className="capitalize text-sm">{r.availability}</span> },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} map={STATUS} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Volunteers" description="Manage volunteer directory, skills and availability"
        actions={<Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add volunteer</Button>} />
      <div className="glass p-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or skill…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 bg-background/50" />
      </div>
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={HandHeart} title="No volunteers yet" description="Add volunteers to assign them to campaigns and tasks."
          action={<Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add volunteer</Button>} />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}
      <SimpleFormDialog open={open} onClose={() => setOpen(false)} title="Add volunteer" fields={FIELDS}
        options={{ avail: AVAIL.map((a) => ({ value: a, label: a })), status: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] }}
        onSubmit={async (f) => { await create({ ...f, skills: f.skills ? f.skills.split(",").map((s) => s.trim()).filter(Boolean) : [] }); setOpen(false); }} />
    </div>
  );
}