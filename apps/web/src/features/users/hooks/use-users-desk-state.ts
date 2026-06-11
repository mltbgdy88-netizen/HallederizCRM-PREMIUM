"use client";

import type { User } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { listUsersApi } from "../../../services/api";
import { USERS_DESK_DEMO_ROWS } from "../data/users-demo-rows";

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  disabled: "Pasif",
  invited: "Davetli"
};

export function formatUserStatus(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function userStatusBadgeClass(status: string): string {
  if (status === "active") return "admf-badge admf-badge--success";
  if (status === "invited") return "admf-badge admf-badge--warning";
  if (status === "disabled") return "admf-badge admf-badge--danger";
  return "admf-badge admf-badge--neutral";
}

export function useUsersDeskState() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void listUsersApi()
      .then((items) => {
        if (!active) return;
        if (items.length === 0 && dataSourceConfig.useDemoData) {
          setUsers(USERS_DESK_DEMO_ROWS);
          setUsingDemoData(true);
        } else {
          setUsers(items);
          setUsingDemoData(false);
        }
      })
      .catch(() => {
        if (!active) return;
        setUsers(USERS_DESK_DEMO_ROWS);
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
    return users.filter((user) => {
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${user.fullName} ${user.email} ${user.title ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, search, statusFilter]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((u) => u.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = useMemo(() => filtered.find((u) => u.id === selectedId) ?? null, [filtered, selectedId]);

  const kpis = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      invited: users.filter((u) => u.status === "invited").length,
      shown: filtered.length
    }),
    [users, filtered.length]
  );

  return {
    users,
    loading,
    usingDemoData,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    selectedId,
    setSelectedId,
    selected,
    filtered,
    kpis
  };
}
