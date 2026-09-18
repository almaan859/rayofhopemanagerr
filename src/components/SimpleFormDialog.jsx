import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

export default function SimpleFormDialog({ open, onClose, onSubmit, title, fields, initial, options = {} }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const blank = fields.reduce((acc, f) => {
      acc[f.name] = f.type === "multiselect" ? [] : f.default ?? "";
      return acc;
    }, {});
    setForm({ ...blank, ...initial });
  }, [initial, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-strong max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>{f.label}{f.required ? " *" : ""}</Label>
              {f.type === "select" ? (
                <Select value={form[f.name] || ""} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger><SelectValue placeholder={f.placeholder || "Select"} /></SelectTrigger>
                  <SelectContent>
                    {(options[f.optionsKey] || f.options || []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === "textarea" ? (
                <Textarea id={f.name} rows={3} value={form[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} required={f.required} />
              ) : (
                <Input id={f.name} type={f.type || "text"} value={form[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} required={f.required} />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}