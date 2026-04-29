"use client";

import { useEffect, useState } from "react";
import type { RolePresetItem } from "@hallederiz/types";
import { PageHeader } from "@hallederiz/ui";
import { listRolePresetsApi } from "../../../../src/services/api";

export default function RolesPage() {
  const [presets, setPresets] = useState<RolePresetItem[]>([]);

  useEffect(() => {
    void listRolePresetsApi().then(setPresets).catch(() => setPresets([]));
  }, []);

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Roller"
        description="Yonetici, satis, muhasebe, depo ve pazarlama icin önerilen permission presetleri."
      />

      <section className="hz-content-card">
        <div className="table-wrap hz-table-wrap">
          <table className="table hz-table">
            <thead>
              <tr>
                <th>Rol</th>
                <th>Kod</th>
                <th>Aciklama</th>
                <th>Modul Erisimi</th>
                <th>Approval</th>
              </tr>
            </thead>
            <tbody>
              {presets.length === 0 ? (
                <tr>
                  <td className="table-empty" colSpan={5}>Preset bulunamadi.</td>
                </tr>
              ) : (
                presets.map((preset) => (
                  <tr key={preset.id}>
                    <td>{preset.name}</td>
                    <td>{preset.code}</td>
                    <td>{preset.description}</td>
                    <td>{preset.moduleAccess.join(", ")}</td>
                    <td>{preset.approvalEnabled ? "Evet" : "Hayir"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

