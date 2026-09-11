import { listFavoriteDocuments } from "@/lib/services/document-service";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentLibrary } from "@/components/documents/document-library";

export default async function FavoritesPage() {
  const documents = await listFavoriteDocuments();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title="Favorites"
        description={`${documents.length} starred document${documents.length === 1 ? "" : "s"}`}
      />
      <DocumentLibrary initialDocuments={documents} mode="favorites" />
    </div>
  );
}
