export interface ApiClientOptions {
  baseUrl: string;
  tenantId?: string;
  userId?: string;
  sessionToken?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface ItemResponse<T> {
  item: T;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  private resolveSessionToken(): string | undefined {
    return this.options.sessionToken;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body });
  }

  private async request<T>(path: string, init: { method: string; body?: unknown }): Promise<T> {
    const sessionToken = this.resolveSessionToken();
    const response = await fetch(`${this.options.baseUrl}${path}`, {
      method: init.method,
      headers: {
        "content-type": "application/json",
        ...(this.options.tenantId ? { "x-tenant-id": this.options.tenantId } : {}),
        ...(this.options.userId ? { "x-user-id": this.options.userId } : {}),
        ...(sessionToken ? { "x-session-token": sessionToken } : {}),
        ...(sessionToken ? { authorization: `Bearer ${sessionToken}` } : {})
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      credentials: "include"
    });

    if (!response.ok) {
      let message = `${response.status} request failed`;
      try {
        const payload = (await response.json()) as { message?: string };
        if (payload.message) {
          message = payload.message;
        }
      } catch {
        // no-op
      }
      throw new ApiError(message, response.status);
    }

    return (await response.json()) as T;
  }
}
