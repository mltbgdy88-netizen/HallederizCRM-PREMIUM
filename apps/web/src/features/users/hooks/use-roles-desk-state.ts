"use client";

import type { RolePresetItem } from "@hallederiz/types";
import { defaultPlatformSettings } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { listRolePresetsApi } from "../../../services/api";

export function useRolesDeskState() {
  const [presets, setPresets] = useState<RolePresetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void listRolePresetsApi()
      .then((items) => {
        if (!active) return;
        if (items.length === 0 && dataSourceConfig.useDemoData) {
          setPresets(defaultPlatformSettings.rolePresets);
          setUsingDemoData(true);
        } else {
          setPresets(items);
          setUsingDemoData(false);
        }
      })
      .catch(() => {
        if (!active) return;
        setPresets(defaultPlatformSettings.rolePresets);
        setUsingDemoData(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [presets, search]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((p) => p.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = useMemo(() => filtered.find((p) => p.id === selectedId) ?? null, [filtered, selectedId]);

  const kpis = useMemo(
    () => ({
      total: presets.length,
      approvalEnabled: presets.filter((p) => p.approvalEnabled).length,
      shown: filtered.length
    }),
    [presets, filtered.length]
  );

  return {
    presets,
    loading,
    usingDemoData,
    search,
    setSearch,
    selectedId,
    setSelectedId,
    selected,
    filtered,
    kpis
  };
}
