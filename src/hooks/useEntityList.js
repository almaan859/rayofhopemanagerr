import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";

export function useEntityList(entityName, { sort = "-created_date", limit = 500, deps = [] } = {}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.entities[entityName].list(sort, limit);
      setItems(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, deps);

  const create = async (data) => { await base44.entities[entityName].create(data); await load(); };
  const update = async (id, data) => { await base44.entities[entityName].update(id, data); await load(); };
  const remove = async (id) => { await base44.entities[entityName].delete(id); await load(); };

  return { items, loading, error, reload: load, create, update, remove };
}

export function useSearch(items, predicate, query) {
  return useMemo(() => (query ? items.filter((i) => predicate(i, query.toLowerCase())) : items), [items, query, predicate]);
}