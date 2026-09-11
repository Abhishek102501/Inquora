"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";
import { getFavoriteIds } from "@/lib/favorites";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentLibrary } from "@/components/documents/document-library";

export default function FavoritesPage() {
  const { documents, state } = useDocuments();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage is only possible after mount
    setFavoriteIds(getFavoriteIds());
  }, []);

  const favoriteDocuments = documents
    .filter((d) => favoriteIds.has(d.id))
    .map((d) => ({ ...d, favorite: true }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title="Favorites"
        description={
          state === "loading"
            ? "Loading…"
            : `${favoriteDocuments.length} starred document${favoriteDocuments.length === 1 ? "" : "s"}`
        }
      />
      {state === "loading" ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <DocumentLibrary initialDocuments={favoriteDocuments} mode="favorites" />
      )}
    </div>
  );
}
