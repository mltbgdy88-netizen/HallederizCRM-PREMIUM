import type { ApiClient } from "../base";

export class OperatorClient {
  constructor(private readonly api: ApiClient) {}

  listTenants() {
    return this.api.get<{ items: unknown[]; total: number }>("/operator/tenants");
  }

  listAnnouncementVideos() {
    return this.api.get<{ items: unknown[]; total: number }>("/operator/announcement-videos");
  }

  createAnnouncementVideo(payload: unknown) {
    return this.api.post<{ item: unknown }>("/operator/announcement-videos", payload);
  }

  updateAnnouncementVideo(id: string, payload: unknown) {
    return this.api.patch<{ item: unknown }>(`/operator/announcement-videos/${id}`, payload);
  }

  deleteAnnouncementVideo(id: string) {
    return this.api.delete<{ ok: boolean }>(`/operator/announcement-videos/${id}`);
  }
}
