import React, { useEffect, useState } from "react";
import { Plus, GraduationCap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass";
import SimpleFormDialog from "@/components/SimpleFormDialog";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/format";

const ATT_FIELDS = [
  { name: "beneficiaryId", label: "Student", type: "select", optionsKey: "ben", required: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "status", label: "Status", type: "select", optionsKey: "att" },
];
const ASMT_FIELDS = [
  { name: "beneficiaryId", label: "Student", type: "select", optionsKey: "ben", required: true },
  { name: "subject", label: "Subject", required: true },
  { name: "assessmentName", label: "Assessment name", required: true },
  { name: "score", label: "Score", type: "number", required: true },
  { name: "maximumScore", label: "Maximum score", type: "number", required: true },
  { name: "assessmentDate", label: "Date", type: "date" },
  { name: "academicYear", label: "Academic year" },
];
const ATT_STATUSES = ["present", "absent", "leave"];

export default function Education() {
  const [ben, setBen] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attOpen, setAttOpen] = useState(false);
  const [asmtOpen, setAsmtOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [b, a, asmt] = await Promise.all([
        base44.entities.Beneficiary.list("-created_date", 200),
        base44.entities.AttendanceRecord.list("-date", 200),
        base44.entities.Assessment.list("-assessmentDate", 200),
      ]);
      setBen(b); setAttendance(a); setAssessments(asmt);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const benName = (id) => ben.find((x) => x.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <PageHeader title="Education" description="Attendance, assessments and academic progress" />
      <Tabs defaultValue="attendance">
        <TabsList className="glass">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setAttOpen(true)}><Plus className="h-4 w-4" /> Record attendance</Button>
          </div>
          {loading ? <TableSkeleton /> : attendance.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No attendance recorded" description="Record daily attendance to track student engagement." />
          ) : (
            <GlassCard className="p-4 space-y-2">
              {attendance.slice(0, 30).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5">
                  <span className="text-sm font-medium">{benName(a.beneficiaryId)}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{formatDate(a.date)}</span>
                    <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${a.status === "present" ? "bg-emerald-500/15 text-emerald-600" : a.status === "absent" ? "bg-rose-500/15 text-rose-600" : "bg-amber-500/15 text-amber-600"}`}>{a.status}</span>
                  </div>
                </div>
              ))}
            </GlassCard>
          )}
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => setAsmtOpen(true)}><Plus className="h-4 w-4" /> Add assessment</Button>
          </div>
          {loading ? <TableSkeleton /> : assessments.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No assessments recorded" description="Add scores to visualise academic progress." />
          ) : (
            <GlassCard className="p-4 space-y-2">
              {assessments.slice(0, 30).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5">
                  <div><p className="text-sm font-medium">{benName(a.beneficiaryId)}</p><p className="text-xs text-muted-foreground">{a.subject} · {a.assessmentName}</p></div>
                  <span className="text-sm font-semibold">{a.score}/{a.maximumScore}</span>
                </div>
              ))}
            </GlassCard>
          )}
        </TabsContent>
      </Tabs>

      <SimpleFormDialog open={attOpen} onClose={() => setAttOpen(false)} title="Record attendance" fields={ATT_FIELDS}
        options={{ ben: ben.map((b) => ({ value: b.id, label: b.name })), att: ATT_STATUSES.map((s) => ({ value: s, label: s })) }}
        onSubmit={async (f) => { await base44.entities.AttendanceRecord.create(f); setAttOpen(false); await load(); }} />
      <SimpleFormDialog open={asmtOpen} onClose={() => setAsmtOpen(false)} title="Add assessment" fields={ASMT_FIELDS}
        options={{ ben: ben.map((b) => ({ value: b.id, label: b.name })) }}
        onSubmit={async (f) => { await base44.entities.Assessment.create({ ...f, score: Number(f.score) || 0, maximumScore: Number(f.maximumScore) || 0 }); setAsmtOpen(false); await load(); }} />
    </div>
  );
}