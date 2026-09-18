import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable, { Badge } from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import BeneficiaryForm from "@/components/beneficiaries/BeneficiaryForm";
import { formatDate } from "@/lib/format";

const STATUS_MAP = {
  active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  inactive: { label: "Inactive", cls: "bg-muted text-muted-foreground" },
  archived: { label: "Archived", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
};
const PAGE_SIZE = 10;

export default function Beneficiaries() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [schools, setSchools] = useState([]);
  const [query, setQuery] = useState(params.get("q") || "");
  const [status, setStatus] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([
        base44.entities.Beneficiary.list("-created_date", 500),
        base44.entities.School.list("-created_date", 200),
      ]);
      setItems(b);
      setSchools(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (schoolFilter !== "all" && b.schoolId !== schoolFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!(`${b.name} ${b.beneficiaryCode} ${b.currentClass}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [items, status, schoolFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const schoolName = (id) => schools.find((s) => s.id === id)?.name || "—";

  const columns = [
    { key: "name", header: "Name", render: (r) => (
      <div>
        <p className="font-medium">{r.name}</p>
        <p className="text-xs text-muted-foreground">{r.beneficiaryCode || "—"}</p>
      </div>
    )},
    { key: "currentClass", header: "Class", render: (r) => r.currentClass || "—" },
    { key: "school", header: "School", render: (r) => schoolName(r.schoolId) },
    { key: "dateOfBirth", header: "DOB", render: (r) => formatDate(r.dateOfBirth) },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} map={STATUS_MAP} /> },
  ];

  const handleSubmit = async (form) => {
    if (editing?.id) {
      await base44.entities.Beneficiary.update(editing.id, form);
    } else {
      await base44.entities.Beneficiary.create(form);
    }
    setFormOpen(false);
    setEditing(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beneficiaries"
        description="Manage beneficiary records and their support history"
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add beneficiary
          </Button>
        }
      />

      <div className="glass p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, class…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="pl-9 bg-background/50"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40 bg-background/50"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={schoolFilter} onValueChange={(v) => { setSchoolFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44 bg-background/50"><SelectValue placeholder="School" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All schools</SelectItem>
            {schools.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No beneficiaries found"
          description="Add your first beneficiary to begin tracking support and education progress."
          action={<Button onClick={() => setFormOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add beneficiary</Button>}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={paged}
            onRowClick={(row) => navigate(`/beneficiaries/${row.id}`)}
          />
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={current <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-muted-foreground">Page {current} / {totalPages}</span>
              <Button variant="outline" size="icon" disabled={current >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </>
      )}

      <BeneficiaryForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
        schools={schools}
      />
    </div>
  );
}