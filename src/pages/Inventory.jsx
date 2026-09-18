import React, { useState } from "react";
import { Plus, Boxes, ArrowDownUp } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { TableSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass";
import SimpleFormDialog from "@/components/SimpleFormDialog";
import { useEntityList } from "@/hooks/useEntityList";
import { base44 } from "@/api/base44Client";

const ITEM_FIELDS = [
  { name: "name", label: "Item name", required: true },
  { name: "category", label: "Category" },
  { name: "unit", label: "Unit", placeholder: "pcs, kg, box…" },
  { name: "currentQuantity", label: "Current quantity", type: "number", default: 0 },
  { name: "minimumQuantity", label: "Minimum quantity", type: "number", default: 0 },
];
const TX_FIELDS = [
  { name: "itemId", label: "Item", type: "select", optionsKey: "items", required: true },
  { name: "type", label: "Transaction type", type: "select", optionsKey: "txtype" },
  { name: "quantity", label: "Quantity", type: "number", required: true },
  { name: "notes", label: "Notes", type: "textarea" },
];
const TX_TYPES = ["in", "out", "adjustment"];

export default function Inventory() {
  const { items, loading, create, reload } = useEntityList("InventoryItem");
  const [itemOpen, setItemOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);

  const lowStock = items.filter((i) => Number(i.currentQuantity) <= Number(i.minimumQuantity));

  const recordTx = async (f) => {
    const item = items.find((i) => i.id === f.itemId);
    const qty = Number(f.quantity) || 0;
    let newQty = Number(item.currentQuantity) || 0;
    if (f.type === "in") newQty += qty;
    else if (f.type === "out") newQty = Math.max(0, newQty - qty);
    else newQty = qty;
    await base44.entities.InventoryTransaction.create({
      itemId: item.id, itemName: item.name, type: f.type, quantity: qty, notes: f.notes,
    });
    await base44.entities.InventoryItem.update(item.id, { currentQuantity: newQty });
    await reload();
    setTxOpen(false);
  };

  const Bar = ({ item }) => {
    const max = Math.max(Number(item.minimumQuantity) * 3, Number(item.currentQuantity), 10);
    const pct = Math.min(100, Math.round((Number(item.currentQuantity) / max) * 100));
    const low = Number(item.currentQuantity) <= Number(item.minimumQuantity);
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
          <div className={`h-full ${low ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-medium">{item.currentQuantity} {item.unit}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Track stock levels and transaction history"
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={() => setTxOpen(true)}><ArrowDownUp className="h-4 w-4" /> Record transaction</Button>
            <Button className="gap-2" onClick={() => setItemOpen(true)}><Plus className="h-4 w-4" /> Add item</Button>
          </>
        } />

      {lowStock.length > 0 && (
        <GlassCard className="p-4 border-amber-500/30 bg-amber-500/5">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{lowStock.length} item(s) below minimum stock</p>
        </GlassCard>
      )}

      {loading ? <TableSkeleton /> : items.length === 0 ? (
        <EmptyState icon={Boxes} title="No inventory items" description="Add items to start tracking stock and transactions."
          action={<Button className="gap-2" onClick={() => setItemOpen(true)}><Plus className="h-4 w-4" /> Add item</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <GlassCard key={i.id} className="p-5">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold">{i.name}</p><p className="text-xs text-muted-foreground">{i.category || "Uncategorised"}</p></div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{i.unit}</span>
              </div>
              <div className="mt-4"><Bar item={i} /></div>
              <p className="mt-2 text-xs text-muted-foreground">Minimum: {i.minimumQuantity} {i.unit}</p>
            </GlassCard>
          ))}
        </div>
      )}

      <SimpleFormDialog open={itemOpen} onClose={() => setItemOpen(false)} title="Add inventory item" fields={ITEM_FIELDS}
        onSubmit={async (f) => { await create({ ...f, currentQuantity: Number(f.currentQuantity) || 0, minimumQuantity: Number(f.minimumQuantity) || 0 }); setItemOpen(false); }} />
      <SimpleFormDialog open={txOpen} onClose={() => setTxOpen(false)} title="Record transaction" fields={TX_FIELDS}
        options={{ items: items.map((i) => ({ value: i.id, label: i.name })), txtype: TX_TYPES.map((t) => ({ value: t, label: t })) }}
        onSubmit={recordTx} />
    </div>
  );
}