import { createQueryExecutor } from "@hallederiz/database";
import type { QueryExecutor } from "@hallederiz/database";
import type { RequestContext } from "./request-context";
import { buildPersistenceUnavailableError, getPersistencePolicy, type PersistencePolicy } from "./persistence-policy";

export interface RepositoryRuntime {
  dbEnabled: boolean;
  executor: QueryExecutor;
  fallbackAllowed: boolean;
  policy: PersistencePolicy;
  handleDbFailure: (error: unknown) => void;
}

export function buildRepositoryRuntime(context: RequestContext): RepositoryRuntime {
  const mode = context.persistenceMode;
  const postgresUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  const policy = getPersistencePolicy();

  const executor = createQueryExecutor({
    mode,
    postgresUrl
  });

  return {
    dbEnabled: mode === "postgres",
    executor,
    fallbackAllowed: policy.dbFallbackAllowed,
    policy,
    handleDbFailure: (error: unknown) => {
      if (policy.shouldThrowOnDbFailure) {
        throw buildPersistenceUnavailableError(error, {
          persistenceMode: mode,
          hasPostgresUrl: Boolean(postgresUrl)
        });
      }
    }
  };
}
