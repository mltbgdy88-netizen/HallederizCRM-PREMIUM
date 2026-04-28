import type { FileSaveJob, PrintJob } from "@hallederiz/types";
export interface LocalQueueSnapshot { printJobs: PrintJob[]; fileSaveJobs: FileSaveJob[]; }
export async function pollQueue(): Promise<LocalQueueSnapshot> { return { printJobs: [], fileSaveJobs: [] }; }
export async function acknowledgeJob(jobId: string) { return { jobId, acknowledgedAt: new Date().toISOString() }; }
