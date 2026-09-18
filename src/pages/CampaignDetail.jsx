import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Users, Boxes, HeartHandshake, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass";
import EmptyState from "@/components/EmptyState";
import { formatDate, formatINR } from "@/lib/format";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const c = await base44.entities.Campaign.get(id);
        setCampaign(c);
        const [vols, tks, dons, reps] = await Promise.all([
          base44.entities.Volunteer.list("-created_date", 200),
          base44.entities.Task.filter({ campaignId: id }, "-due_date", 100),
          base44.entities.Donation.filter({ campaignId: id }, "-donationDate", 100),
          base44.entities.ImpactReport.filter({ campaignId: id }, "-reportDate", 20),
        ]);
        setVolunteers(vols.filter((v) => (c.volunteerIds || []).includes(v.id)));
        setTasks(tks);
        setDonations(dons);
        setReports(reps);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="glass h-96 animate-pulse" />;
  if (!campaign) return <EmptyState title="Campaign not found" action={<Button onClick={() => navigate("/campaigns")}>Back</Button>} />;

  const totalDonations = donations.reduce((s, d) => s + Number(d.amount || 0), 0);

  const Stat = ({ icon: Icon, label, value }) => (
    <div className="glass p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-muted/60 grid place-items-center"><Icon className="h-5 w-5 text-muted-foreground" /></div>
      <div><p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p><p className="text-lg font-semibold">{value}</p></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2" onClick={() => navigate("/campaigns")}><ArrowLeft className="h-4 w-4" /> Back</Button>
      <GlassCard className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">{campaign.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{campaign.type} · {campaign.location} · {formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}</p>
          </div>
          <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-muted text-muted-foreground capitalize">{campaign.status}</span>
        </div>
        {campaign.description && <p className="mt-4 text-sm text-muted-foreground">{campaign.description}</p>}
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Volunteers" value={volunteers.length} />
        <Stat icon={FileBarChart} label="Tasks" value={tasks.length} />
        <Stat icon={HeartHandshake} label="Donations" value={formatINR(totalDonations)} />
        <Stat icon={Boxes} label="Target" value={campaign.targetBeneficiaries ?? "—"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold mb-3">Assigned volunteers</h3>
          {volunteers.length === 0 ? <EmptyState title="No volunteers assigned" /> : (
            <ul className="space-y-2">{volunteers.map((v) => (
              <li key={v.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                <span className="text-sm font-medium">{v.name}</span><span className="text-xs text-muted-foreground capitalize">{v.availability}</span>
              </li>
            ))}</ul>
          )}
        </GlassCard>
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold mb-3">Tasks</h3>
          {tasks.length === 0 ? <EmptyState title="No tasks" /> : (
            <ul className="space-y-2">{tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                <span className="text-sm font-medium">{t.title}</span>
                <span className="text-xs capitalize text-muted-foreground">{t.status}</span>
              </li>
            ))}</ul>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold mb-3">Impact reports</h3>
        {reports.length === 0 ? <EmptyState title="No impact reports yet" description="Generate a report once the campaign concludes." /> : (
          <ul className="space-y-2">{reports.map((r) => (
            <li key={r.id} className="rounded-xl bg-muted/40 px-4 py-3">
              <p className="text-sm font-medium">{r.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(r.reportDate)} · {r.beneficiariesReached} reached · {formatINR(r.fundsUsed)} used</p>
            </li>
          ))}</ul>
        )}
      </GlassCard>
    </div>
  );
}