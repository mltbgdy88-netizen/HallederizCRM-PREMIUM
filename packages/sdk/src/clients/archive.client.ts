import type { ArchiveDetailResponse, ArchiveDownloadLink, ArchiveListResponse, ArchiveRecord, ArchiveSourceType } from "@hallederiz/types";
import type { ItemResponse } from "../base";
import { ApiClient } from "../base";

export type ArchiveListParams = {
  page?: number;
  pageSize?: number;
  customerId?: string;
  sourceType?: ArchiveSourceType;
  status?: ArchiveRecord["status"];
};

export type ArchiveDownloadUrlResult = {
  status: number;
  item?: ArchiveDownloadLink;
};

export class ArchiveClient {
  constructor(private readonly api: ApiClient) {}

  list(params?: ArchiveListParams) {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.pageSize) search.set("pageSize", String(params.pageSize));
    if (params?.customerId) search.set("customerId", params.customerId);
    if (params?.sourceType) search.set("sourceType", params.sourceType);
    if (params?.status) search.set("status", params.status);
    const query = search.toString();
    return this.api.get<ArchiveListResponse>(`/archive${query ? `?${query}` : ""}`);
  }

  detail(id: string) {
    return this.api.get<ArchiveDetailResponse>(`/archive/${id}`);
  }

  getDownloadUrl(id: string) {
    return this.api
      .getWithStatus<ItemResponse<ArchiveDownloadLink>>(`/archive/${id}/download-url`)
      .then((response) => ({
        status: response.status,
        item: response.data.item
      }) satisfies ArchiveDownloadUrlResult);
  }
}
