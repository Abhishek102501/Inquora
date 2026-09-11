"use client";

import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentLibrary } from "@/components/documents/document-library";

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const { documents, state, error, removeDocument } = useDocuments();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title="Documents"
        description={
          state === "loading"
            ? "Loading your library…"
            : `${documents.length} document${documents.length === 1 ? "" : "s"} in your library`
        }
      />
      {state === "loading" ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : state === "error" ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : (
        <DocumentLibrary
          initialDocuments={documents}
          initialQuery={q}
          onDeleteDocument={removeDocument}
        />
      )}
    </div>
  );
}
