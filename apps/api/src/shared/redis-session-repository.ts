import { createHash } from "node:crypto";
import { createClient } from "redis";
import type { LoginResponse, SessionModel } from "@hallederiz/types";

export interface RedisSessionRepositoryOptions {
  url: string;
  ttlSeconds?: number;
  prefix?: string;
}

export class RedisSessionRepository {
  private readonly client: ReturnType<typeof createClient>;
  private readonly ttlSeconds: number;
  private readonly prefix: string;

  constructor(options: RedisSessionRepositoryOptions) {
    if (!options.url.trim()) throw new Error("REDIS_URL is required for production sessions.");
    this.client = createClient({ url: options.url });
    this.ttlSeconds = options.ttlSeconds ?? 8 * 60 * 60;
    this.prefix = options.prefix ?? "hallederiz:session";
  }

  private key(token: string): string {
    return `${this.prefix}:${createHash("sha256").update(token).digest("hex")}`;
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) await this.client.connect();
  }

  async save(token: string, response: LoginResponse): Promise<void> {
    await this.connect();
    await this.client.set(this.key(token), JSON.stringify(response), { EX: this.ttlSeconds });
  }

  async get(token: string): Promise<SessionModel | null> {
    await this.connect();
    const raw = await this.client.get(this.key(token));
    if (!raw) return null;
    const response = JSON.parse(raw) as LoginResponse;
    return response.session;
  }

  async revoke(token: string): Promise<void> {
    await this.connect();
    await this.client.del(this.key(token));
  }

  async close(): Promise<void> {
    if (this.client.isOpen) await this.client.quit();
  }
}

export function isProductionRedisSessionConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === "production" && Boolean((env.REDIS_URL ?? env.VALKEY_URL)?.trim());
}
