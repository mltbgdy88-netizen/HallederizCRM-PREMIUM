import { ReportDetailPage } from "../../../../src/features/reports/components/ReportDetailPage";

type PageProps = {
  params: { raporSlug: string[] };
};

export default function RaporlarDeepPage({ params }: PageProps) {
  return <ReportDetailPage slugSegments={params.raporSlug ?? []} />;
}
