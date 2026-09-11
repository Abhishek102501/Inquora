import { listDocuments } from "@/lib/services/document-service";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentLibrary } from "@/components/documents/document-library";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const documents = await listDocuments();
  const { q } = await searchParams;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title="Documents"
        description={`${documents.length} document${documents.length === 1 ? "" : "s"} in your library`}
      />
      <DocumentLibrary initialDocuments={documents} initialQuery={q} />
    </div>
  );
}
