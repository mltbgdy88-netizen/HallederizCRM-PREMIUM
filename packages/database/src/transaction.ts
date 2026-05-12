import type { QueryExecutor } from "./types";

export interface DatabaseTransactionContext {
  executor: QueryExecutor;
}

export interface DatabaseTransactionRunner {
  withTransaction: <T>(operation: (context: DatabaseTransactionContext) => Promise<T>) => Promise<T>;
}

export function createDatabaseTransactionRunner(executor: QueryExecutor): DatabaseTransactionRunner {
  return {
    withTransaction: (operation) => withDatabaseTransaction(executor, operation)
  };
}

export async function withDatabaseTransaction<T>(
  executor: QueryExecutor,
  operation: (context: DatabaseTransactionContext) => Promise<T>
): Promise<T> {
  return executor.transaction(async (txExecutor) => operation({ executor: txExecutor }));
}

export interface TransactionalApprovalExecutionWriteInput<TExecutionLog, TAuditEvent, TTimelineEvent> {
  executionLog: TExecutionLog;
  auditEvent?: TAuditEvent;
  timelineEvent?: TTimelineEvent;
}

export interface TransactionalApprovalExecutionWriter<TExecutionLog, TAuditEvent, TTimelineEvent> {
  saveExecutionLog: (entry: TExecutionLog) => Promise<TExecutionLog>;
  saveAuditEventDraft: (event: TAuditEvent) => Promise<TAuditEvent>;
  saveTimelineEventDraft: (event: TTimelineEvent) => Promise<TTimelineEvent>;
}

export async function writeApprovalExecutionInTransaction<TExecutionLog, TAuditEvent, TTimelineEvent>(
  runner: DatabaseTransactionRunner,
  writer: TransactionalApprovalExecutionWriter<TExecutionLog, TAuditEvent, TTimelineEvent>,
  input: TransactionalApprovalExecutionWriteInput<TExecutionLog, TAuditEvent, TTimelineEvent>
): Promise<{
  executionLog: TExecutionLog;
  auditEvent?: TAuditEvent;
  timelineEvent?: TTimelineEvent;
}> {
  return runner.withTransaction(async () => {
    const executionLog = await writer.saveExecutionLog(input.executionLog);
    const auditEvent = input.auditEvent ? await writer.saveAuditEventDraft(input.auditEvent) : undefined;
    const timelineEvent = input.timelineEvent ? await writer.saveTimelineEventDraft(input.timelineEvent) : undefined;
    return {
      executionLog,
      auditEvent,
      timelineEvent
    };
  });
}
