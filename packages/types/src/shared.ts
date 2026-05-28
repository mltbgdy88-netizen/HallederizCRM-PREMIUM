import type { UserId } from "./identifiers";

export interface AuditInfo {
  createdAt: string;
  updatedAt: string;
  createdBy: UserId;
  updatedBy: UserId;
}
