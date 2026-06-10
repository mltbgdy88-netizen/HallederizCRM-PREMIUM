import type { ArchiveRecord as ApiArchiveRecord } from "@hallederiz/types";
import { isOfflineLikeError } from "../../../lib/user-facing-data-error";
import { mapApiArchiveRecordToUi } from "../utils/map-api-archive-record";
import type { ArchiveRecord } from "../types";

export type ArchiveLiveLoadResult = {
  records: ArchiveRecord[];
  liveReady: boolean;
  message?: string;
};

export async function getArchiveLiveRecords(): Promise<ArchiveLiveLoadResult> {
  try {
    const { sdk } = await import("../../../lib/data-source");
    const response = await sdk.archive.list({ page: 1, pageSize: 100 });
    if (!response.liveReady) {
      return {
        records: [],
        liveReady: false,
        message: "Arşiv kayıtları şu anda alınamıyor."
      };
    }
    const records = (response.items ?? []).map((item: ApiArchiveRecord) => mapApiArchiveRecordToUi(item));
    return {
      records,
      liveReady: true,
      message: records.length === 0 ? "Arşiv kaydı bulunamadı." : undefined
    };
  } catch (error) {
    if (isOfflineLikeError(error)) {
      return {
        records: [],
        liveReady: false,
        message: "Arşiv kayıtları şu anda alınamıyor."
      };
    }
    return {
      records: [],
      liveReady: false,
      message: "Arşiv kayıtları şu anda alınamıyor."
    };
  }
}

