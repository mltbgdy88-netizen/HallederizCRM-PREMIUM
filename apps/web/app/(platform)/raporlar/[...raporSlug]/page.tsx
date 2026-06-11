import { ReportDetailPage } from "../../../../src/features/reports/components/ReportDetailPage";

type PageProps = {
  params: Promise<{ raporSlug: string[] }>;
};

export default async function RaporlarDeepPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ReportDetailPage slugSegments={resolvedParams.raporSlug ?? []} />;
}
