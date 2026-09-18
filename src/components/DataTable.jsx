import React from "react";
import { cn } from "@/lib/utils";

function Badge({ status, map }) {
  const cfg = map[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

export default function DataTable({ columns, rows, emptyState, onRowClick }) {
  return (
    <div className="glass overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              {columns.map((c) => (
                <th key={c.key} className={cn("px-5 py-3 font-medium", c.align === "right" && "text-right", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12">
                  {emptyState}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id || i}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-border/40 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/40"
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-5 py-3 align-middle", c.align === "right" && "text-right", c.cellClassName)}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border/40">
        {rows.length === 0 ? (
          <div className="p-6">{emptyState}</div>
        ) : (
          rows.map((row, i) => (
            <div key={row.id || i} onClick={() => onRowClick?.(row)} className={cn("p-4", onRowClick && "cursor-pointer")}>
              {columns
                .filter((c) => c.mobile !== false)
                .slice(0, 3)
                .map((c) => (
                  <div key={c.key} className="flex justify-between gap-3 py-0.5">
                    <span className="text-xs text-muted-foreground">{c.header}</span>
                    <span className="text-sm font-medium text-right">{c.render ? c.render(row) : row[c.key]}</span>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export { Badge };