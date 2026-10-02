import { createHash } from "node:crypto";
import { createClient, type RedisClientType } from "redis";
import type { LoginResponse, SessionModel } from "@hallederiz/types";

export interface RedisSessionRepositoryOptions {
  url: string;
  ttlSeconds?: number;
  prefix?: string;
}

export class RedisSessionRepository {
  private readonly client: RedisClientType;
  private readonly ttlSeconds: number;
  private readonly prefix: string;
  private connecting?: Promise<void>;

  constructor(options: RedisSessionRepositoryOptions) {
    if (!options.url.trim()) throw new Error("REDIS_URL is required for production sessions.");
    this.client = createClient({ url: options.url, disableOfflineQueue: true,
      socket: { connectTimeout: 3000, reconnectStrategy: false } });
    // Redis emits error events in addition to rejected commands. Never leak URLs
    // or let an unhandled EventEmitter error terminate the API.
    this.client.on("error", () => {});
    this.ttlSeconds = options.ttlSeconds ?? 8 * 60 * 60;
    this.prefix = options.prefix ?? "hallederiz:session";
  }

  private key(token: string): string {
    return `${this.prefix}:${createHash("sha256").update(token).digest("hex")}`;
  }

  async connect(): Promise<void> {
    if (this.client.isReady) return;
    if (!this.connecting) {
      this.connecting = this.client.connect().then(() => {}).finally(() => { this.connecting = undefined; });
    }
    await this.connecting;
  }

  async save(token: string, response: LoginResponse): Promise<void> {
    await this.connect();
    const remaining = Math.floor((Date.parse(response.session.expiresAt) - Date.now()) / 1000);
    if (!Number.isFinite(remaining) || remaining <= 0) throw new Error("Session expired.");
    await this.client.set(this.key(token), JSON.stringify(response), { EX: Math.min(this.ttlSeconds, remaining) });
  }

  async ping(): Promise<void> {
    await this.connect();
    await this.client.ping();
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
