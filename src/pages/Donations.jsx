import React, { useEffect, useState } from "react";
import { Plus, Search, HeartHandshake } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import DataTable, { Badge } from "@/components/DataTable";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SimpleFormDialog from "@/components/SimpleFormDialog";
import { useEntityList } from "@/hooks/useEntityList";
import { formatINR, formatDate } from "@/lib/format";

const STATUS = {
  pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-600" },
  received: { label: "Received", cls: "bg-emerald-500/15 text-emerald-600" },
  allocated: { label: "Allocated", cls: "bg-sky-500/15 text-sky-600" },
  refunded: { label: "Refunded", cls: "bg-rose-500/15 text-rose-600" },
};
const TYPES = ["one_time", "recurring", "sponsorship"];
const STATUSES = ["pending", "received", "allocated", "refunded"];
const FIELDS = [
  { name: "donorId", label: "Donor", type: "select", optionsKey: "donors", required: true },
  { name: "amount", label: "Amount", type: "number", required: true },
  { name: "donationDate", label: "Donation date", type: "date", required: true },
  { name: "donationType", label: "Type", type: "select", optionsKey: "types" },
  { name: "campaignId", label: "Campaign", type: "select", optionsKey: "campaigns" },
  { name: "paymentReference", label: "Payment reference" },
  { name: "status", label: "Status", type: "select", optionsKey: "statuses" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export default function Donations() {
  const { items, loading, create } = useEntityList("Donation", { sort: "-donationDate" });
  const [donors, setDonors] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.all([base44.entities.Donor.list("-created_date", 200), base44.entities.Campaign.list("-created_date", 200)])
      .then(([d, c]) => { setDonors(d); setCampaigns(c); });
  }, []);

  const donorName = (id) => donors.find((d) => d.id === id)?.name || "—";
  const campaignName = (id) => campaigns.find((c) => c.id === id)?.name || "—";
  const filtered = items.filter((d) => !query || `${donorName(d.donorId)} ${d.paymentReference}`.toLowerCase().includes(query.toLowerCase()));
  const total = items.filter((d) => d.status === "received").reduce((s, d) => s + Number(d.amount || 0), 0);

  const columns = [
    { key: "donor", header: "Donor", render: (r) => donorName(r.donorId) },
    { key: "amount", header: "Amount", render: (r) => <span className="font-semibold">{formatINR(r.amount)}</span> },
    { key: "date", header: "Date", render: (r) => formatDate(r.donationDate) },
    { key: "campaign", header: "Campaign", render: (r) => campaignName(r.campaignId) },
    { key: "type", header: "Type", render: (r) => <span className="capitalize text-sm">{r.donationType}</span> },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status} map={STATUS} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Donations" description="Track donations, allocations and sponsorships"
        actions={<Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Record donation</Button>} />
      <div className="glass p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search donations…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 bg-background/50" />
        </div>
        <div className="text-sm text-muted-foreground">Total received: <span className="font-semibold text-foreground">{formatINR(total)}</span></div>
      </div>
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={HeartHandshake} title="No donations recorded" description="Record donations to track funding and campaign allocation."
          action={<Button className="gap-2" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Record donation</Button>} />
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}
      <SimpleFormDialog open={open} onClose={() => setOpen(false)} title="Record donation" fields={FIELDS}
        options={{
          donors: donors.map((d) => ({ value: d.id, label: d.name })),
          campaigns: campaigns.map((c) => ({ value: c.id, label: c.name })),
          types: TYPES.map((t) => ({ value: t, label: t })),
          statuses: STATUSES.map((s) => ({ value: s, label: s })),
        }}
        onSubmit={async (f) => {
          await create({
            ...f, amount: Number(f.amount) || 0,
            donorName: donorName(f.donorId), campaignName: campaignName(f.campaignId), currency: "INR",
          });
          setOpen(false);
        }} />
    </div>
  );
}