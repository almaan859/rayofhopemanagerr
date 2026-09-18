import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Pencil, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass";
import EmptyState from "@/components/EmptyState";
import BeneficiaryForm from "@/components/beneficiaries/BeneficiaryForm";
import { formatDate } from "@/lib/format";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export default function BeneficiaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ben, setBen] = useState(null);
  const [school, setSchool] = useState(null);
  const [guardian, setGuardian] = useState(null);
  const [education, setEducation] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const b = await base44.entities.Beneficiary.get(id);
      setBen(b);
      const [schools, guardians, edu, att, asmt, rem] = await Promise.all([
        b.schoolId ? base44.entities.School.get(b.schoolId).catch(() => null) : Promise.resolve(null),
        b.guardianId ? base44.entities.Guardian.get(b.guardianId).catch(() => null) : Promise.resolve(null),
        base44.entities.EducationRecord.filter({ beneficiaryId: id }, "-academicYear", 50),
        base44.entities.AttendanceRecord.filter({ beneficiaryId: id }, "-date", 100),
        base44.entities.Assessment.filter({ beneficiaryId: id }, "-assessmentDate", 100),
        base44.entities.TeacherRemark.filter({ beneficiaryId: id }, "-created_date", 50),
      ]);
      setSchool(schools);
      setGuardian(guardians);
      setEducation(edu);
      setAttendance(att);
      setAssessments(asmt);
      setRemarks(rem);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return <div className="glass h-96 animate-pulse" />;
  }
  if (!ben) {
    return <EmptyState title="Beneficiary not found" description="This record may have been removed." action={<Button onClick={() => navigate("/beneficiaries")}>Back to list</Button>} />;
  }

  const attPct = attendance.length
    ? Math.round((attendance.filter((a) => a.status === "present").length / attendance.length) * 100)
    : null;

  const progressData = assessments
    .filter((a) => a.subject)
    .reduce((acc, a) => {
      const key = a.subject;
      if (!acc[key]) acc[key] = [];
      acc[key].push({ name: a.assessmentName, date: a.assessmentDate, pct: Math.round((a.score / a.maximumScore) * 100) });
      return acc;
    }, {});
  const subjectSeries = Object.entries(progressData).map(([subject, pts]) => ({
    subject,
    data: pts.sort((a, b) => new Date(a.date) - new Date(b.date)),
  }));

  const handleArchive = async () => {
    await base44.entities.Beneficiary.update(id, { status: "archived" });
    await load();
  };

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => navigate("/beneficiaries")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setFormOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          {ben.status !== "archived" && (
            <Button variant="outline" className="gap-2 text-amber-600" onClick={handleArchive}>
              <Archive className="h-4 w-4" /> Archive
            </Button>
          )}
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 grid place-items-center text-white text-xl font-semibold">
            {ben.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{ben.name}</h1>
            <p className="text-sm text-muted-foreground">{ben.beneficiaryCode || "No code"} · {ben.currentClass || "Class —"} · {school?.name || "School —"}</p>
          </div>
          <span className={`text-xs uppercase tracking-wider px-3 py-1 rounded-full ${ben.status === "active" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
            {ben.status}
          </span>
        </div>
      </GlassCard>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guardian">Guardian</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="remarks">Remarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GlassCard className="p-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Date of birth" value={formatDate(ben.dateOfBirth)} />
            <Field label="Gender" value={ben.gender} />
            <Field label="Phone" value={ben.phone} />
            <Field label="Emergency contact" value={ben.emergencyContact} />
            <Field label="Address" value={ben.address} />
            <Field label="Attendance" value={attPct != null ? `${attPct}%` : "—"} />
            {ben.notes && <div className="sm:col-span-2 lg:col-span-3"><Field label="Notes" value={ben.notes} /></div>}
          </GlassCard>
        </TabsContent>

        <TabsContent value="guardian">
          <GlassCard className="p-6">
            {guardian ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Name" value={guardian.name} />
                <Field label="Relationship" value={guardian.relationship} />
                <Field label="Phone" value={guardian.phone} />
                <div className="sm:col-span-2 lg:col-span-3"><Field label="Address" value={guardian.address} /></div>
              </div>
            ) : (
              <EmptyState title="No guardian linked" description="A guardian record has not been attached to this beneficiary." />
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="education">
          <GlassCard className="p-6">
            {education.length === 0 ? (
              <EmptyState title="No education records" description="Academic year records will appear here." />
            ) : (
              <div className="space-y-3">
                {education.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{e.academicYear} · {e.className}</p>
                      <p className="text-xs text-muted-foreground">{e.notes}</p>
                    </div>
                    <span className="text-sm font-semibold">{e.attendancePercentage != null ? `${e.attendancePercentage}%` : "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="attendance">
          <GlassCard className="p-6">
            {attendance.length === 0 ? (
              <EmptyState title="No attendance records" description="Attendance entries will appear here." />
            ) : (
              <div className="space-y-2">
                {attendance.slice(0, 20).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5">
                    <span className="text-sm">{formatDate(a.date)}</span>
                    <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${a.status === "present" ? "bg-emerald-500/15 text-emerald-600" : a.status === "absent" ? "bg-rose-500/15 text-rose-600" : "bg-amber-500/15 text-amber-600"}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="assessments">
          <GlassCard className="p-6 space-y-6">
            {assessments.length === 0 ? (
              <EmptyState title="No assessments recorded" description="Scores will appear here and power the progress chart." />
            ) : (
              <>
                {subjectSeries.map((s) => (
                  <div key={s.subject}>
                    <h4 className="text-sm font-semibold mb-2">{s.subject}</h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={s.data} margin={{ left: -20, right: 8, top: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(v) => `${v}%`} />
                        <Line type="monotone" dataKey="pct" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
                <div className="space-y-2">
                  {assessments.slice(0, 15).map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{a.assessmentName}</p>
                        <p className="text-xs text-muted-foreground">{a.subject} · {formatDate(a.assessmentDate)}</p>
                      </div>
                      <span className="text-sm font-semibold">{a.score}/{a.maximumScore}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="remarks">
          <GlassCard className="p-6">
            {remarks.length === 0 ? (
              <EmptyState title="No teacher remarks" description="Teacher observations will appear here." />
            ) : (
              <ul className="space-y-3">
                {remarks.map((r) => (
                  <li key={r.id} className="rounded-xl bg-muted/40 px-4 py-3">
                    <p className="text-sm">{r.remark}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.created_date)}</p>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>

      <BeneficiaryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={async (form) => {
          await base44.entities.Beneficiary.update(id, form);
          setFormOpen(false);
          await load();
        }}
        initial={ben}
        schools={school ? [school] : []}
      />
    </div>
  );
}