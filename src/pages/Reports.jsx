import React, { useEffect, useState } from "react";
import { Plus, FileBarChart } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass";
import SimpleFormDialog from "@/components/SimpleFormDialog";
import { base44 } from "@/api/base44Client";
import { formatDate, formatINR } from "@/lib/format";

const FIELDS = [
  { name: "campaignId", label: "Campaign", type: "select", optionsKey: "camp" },
  { name: "title", label: "Report title", required: true },
  { name: "summary", label: "Summary", type: "textarea" },
  { name: "beneficiariesReached", label: "Beneficiaries reached", type: "number", default: 0 },
  { name: "fundsUsed", label: "Funds used", type: "number", default: 0 },
  { name: "outcomes", label: "Outcomes", type: "textarea" },
  { name: "reportDate", label: "Report date", type: "date", required: true },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        base44.entities.ImpactReport.list("-reportDate", 200),
        base44.entities.Campaign.list("-created_date", 200),
      ]);
      setReports(r); setCampaigns(c);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const campName = (id) => campaigns.find((c) => c.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Impact and campaign reports for management and donors"
        actions={<Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Generate report</Button>} />
      {loading ? <TableSkeleton /> : reports.length === 0 ? (
        <EmptyState icon={FileBarChart} title="No reports yet" description="Generate impact reports to share outcomes with stakeholders."
          action={<Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Generate report</Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reports.map((r) => (
            <GlassCard key={r.id} className="p-5">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold">{r.title}</p><p className="text-xs text-muted-foreground">{campName(r.campaignId)} · {formatDate(r.reportDate)}</p></div>
              </div>
              {r.summary && <p className="mt-3 text-sm text-muted-foreground">{r.summary}</p>}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted/40 px-3 py-2"><p className="text-xs text-muted-foreground">Beneficiaries reached</p><p className="font-semibold">{r.beneficiariesReached}</p></div>
                <div className="rounded-xl bg-muted/40 px-3 py-2"><p className="text-xs text-muted-foreground">Funds used</p><p className="font-semibold">{formatINR(r.fundsUsed)}</p></div>
              </div>
              {r.outcomes && <p className="mt-3 text-sm"><span className="text-muted-foreground">Outcomes: </span>{r.outcomes}</p>}
            </GlassCard>
          ))}
        </div>
      )}
      <SimpleFormDialog open={open} onClose={() => setOpen(false)} title="Generate impact report" fields={FIELDS}
        options={{ camp: campaigns.map((c) => ({ value: c.id, label: c.name })) }}
        onSubmit={async (f) => { await base44.entities.ImpactReport.create({ ...f, beneficiariesReached: Number(f.beneficiariesReached) || 0, fundsUsed: Number(f.fundsUsed) || 0, campaignName: campName(f.campaignId) }); setOpen(false); await load(); }} />
    </div>
  );
}