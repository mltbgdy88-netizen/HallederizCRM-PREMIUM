import { createQueryExecutor } from "@hallederiz/database";
import type { QueryExecutor } from "@hallederiz/database";
import type { RequestContext } from "./request-context";

export interface RepositoryRuntime {
  dbEnabled: boolean;
  executor: QueryExecutor;
}

export function buildRepositoryRuntime(context: RequestContext): RepositoryRuntime {
  const mode = context.persistenceMode;
  const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

  const executor = createQueryExecutor({
    mode,
    postgresUrl
  });

  return {
    dbEnabled: mode === "postgres" && Boolean(postgresUrl),
    executor
  };
}
