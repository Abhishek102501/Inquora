import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { getCollection } from "@/lib/services/collection-service";
import { listDocuments } from "@/lib/services/document-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentCard } from "@/components/documents/document-card";
import { StaggerGroup, StaggerItem } from "@/components/visual/fade-in";

export default async function CollectionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collection, documents] = await Promise.all([getCollection(id), listDocuments()]);
  if (!collection) notFound();

  const members = documents.filter((doc) => collection.documentIds.includes(doc.id));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:p-8">
      <Link
        href="/collections"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to collections
      </Link>

      <PageHeader
        title={collection.name}
        description={`${collection.description} · ${members.length} document${members.length === 1 ? "" : "s"}`}
      />

      {members.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="This collection is empty"
          description="Documents added to this collection will appear here."
        />
      ) : (
        <StaggerGroup viewport={false} stagger={0.05} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((doc) => (
            <StaggerItem key={doc.id}>
              <DocumentCard document={doc} view="grid" />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
