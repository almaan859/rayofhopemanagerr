import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Users, HandHeart, Megaphone, HeartHandshake, Boxes, ArrowRight, AlertTriangle, Clock,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/ui/glass";
import { TableSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { formatINR, formatDate } from "@/lib/format";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

const TYPE_COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#64748b", "#ec4899"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [beneficiaries, volunteers, campaigns, donations, inventory, tasks, attendance] = await Promise.all([
          base44.entities.Beneficiary.list("-created_date", 500),
          base44.entities.Volunteer.list("-created_date", 500),
          base44.entities.Campaign.list("-created_date", 500),
          base44.entities.Donation.list("-created_date", 500),
          base44.entities.InventoryItem.list("-created_date", 500),
          base44.entities.Task.list("-due_date", 200),
          base44.entities.AttendanceRecord.list("-date", 500),
        ]);
        setData({ beneficiaries, volunteers, campaigns, donations, inventory, tasks, attendance });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Programme overview and recent activity" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass h-28 animate-pulse" />
          ))}
        </div>
        <TableSkeleton />
      </div>
    );
  }

  const { beneficiaries, volunteers, campaigns, donations, inventory, tasks, attendance } = data;
  const activeVolunteers = volunteers.filter((v) => v.status === "active");
  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const receivedDonations = donations.filter((d) => d.status === "received");
  const totalDonations = receivedDonations.reduce((s, d) => s + Number(d.amount || 0), 0);
  const lowStock = inventory.filter((i) => Number(i.currentQuantity) <= Number(i.minimumQuantity));

  const byType = campaigns.reduce((acc, c) => {
    const t = c.type || "other";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.entries(byType).map(([name, value]) => ({ name, value }));

  const monthMap = {};
  receivedDonations.forEach((d) => {
    const m = new Date(d.donationDate).toLocaleDateString("en-IN", { month: "short" });
    monthMap[m] = (monthMap[m] || 0) + Number(d.amount || 0);
  });
  const donationTrend = MONTHS.filter((m) => monthMap[m]).map((m) => ({ month: m, amount: monthMap[m] }));

  const attMap = {};
  attendance.forEach((r) => {
    const m = new Date(r.date).toLocaleDateString("en-IN", { month: "short" });
    if (!attMap[m]) attMap[m] = { present: 0, total: 0 };
    attMap[m].total++;
    if (r.status === "present") attMap[m].present++;
  });
  const attendanceTrend = MONTHS.filter((m) => attMap[m]).map((m) => ({
    month: m,
    rate: Math.round((attMap[m].present / attMap[m].total) * 100),
  }));

  const openTasks = tasks.filter((t) => t.status !== "completed").slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Programme overview and recent activity across Ray of Hope Foundation"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard index={0} icon={Users} label="Beneficiaries" value={beneficiaries.length} accent="blue" sub={`${beneficiaries.filter((b) => b.status === "active").length} active`} />
        <StatCard index={1} icon={HandHeart} label="Active Volunteers" value={activeVolunteers.length} accent="green" sub={`${volunteers.length} total`} />
        <StatCard index={2} icon={Megaphone} label="Active Campaigns" value={activeCampaigns.length} accent="violet" sub={`${campaigns.length} total`} />
        <StatCard index={3} icon={HeartHandshake} label="Donations" value={formatINR(totalDonations)} accent="rose" sub={`${receivedDonations.length} received`} />
        <StatCard index={4} icon={Boxes} label="Inventory Alerts" value={lowStock.length} accent="amber" sub="low stock items" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Donation trend</h3>
          {donationTrend.length === 0 ? (
            <EmptyState title="No donations yet" description="Donations will appear here once recorded." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={donationTrend} margin={{ left: -10, right: 8, top: 5 }}>
                <defs>
                  <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(v) => formatINR(v)} />
                <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} fill="url(#donGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold mb-4">Beneficiaries by programme</h3>
          {typeData.length === 0 ? (
            <EmptyState title="No campaigns" description="Campaign breakdown appears here." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold mb-4">Attendance trend</h3>
          {attendanceTrend.length === 0 ? (
            <EmptyState title="No attendance records" description="Attendance rates appear here once recorded." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceTrend} margin={{ left: -18, right: 8, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Tasks requiring attention</h3>
            <button onClick={() => navigate("/campaigns")} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {openTasks.length === 0 ? (
            <EmptyState icon={Clock} title="All caught up" description="No pending tasks right now." />
          ) : (
            <ul className="space-y-2.5">
              {openTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">Due {formatDate(t.dueDate)}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${t.priority === "urgent" ? "bg-rose-500/15 text-rose-600" : t.priority === "high" ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                    {t.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent campaigns</h3>
            <button onClick={() => navigate("/campaigns")} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <ul className="space-y-2.5">
            {campaigns.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{c.type} · {formatDate(c.startDate)}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{c.status}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Low inventory</h3>
            <button onClick={() => navigate("/inventory")} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {lowStock.length === 0 ? (
            <EmptyState icon={Boxes} title="Stock levels healthy" description="No items below minimum quantity." />
          ) : (
            <ul className="space-y-2.5">
              {lowStock.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 rounded-xl bg-amber-500/5 border border-amber-500/20 px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{i.name}</p>
                      <p className="text-xs text-muted-foreground">Min {i.minimumQuantity} {i.unit}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">{i.currentQuantity} {i.unit}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}