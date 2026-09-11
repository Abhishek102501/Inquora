import { FolderKanban } from "lucide-react";
import { listCollections } from "@/lib/services/collection-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CollectionCard } from "@/components/collections/collection-card";
import { StaggerGroup, StaggerItem } from "@/components/visual/fade-in";

export default async function CollectionsPage() {
  const collections = await listCollections();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title="Collections"
        description={`${collections.length} collection${collections.length === 1 ? "" : "s"}`}
      />
      {collections.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No collections yet"
          description="Group related documents together to keep your library organized."
        />
      ) : (
        <StaggerGroup viewport={false} stagger={0.06} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <StaggerItem key={collection.id}>
              <CollectionCard collection={collection} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
