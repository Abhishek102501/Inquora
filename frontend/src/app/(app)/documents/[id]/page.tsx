import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, MessageSquarePlus, Plus, ArrowLeft, Calendar, Layers, HardDrive } from "lucide-react";
import { getDocument } from "@/lib/services/document-service";
import { StatusBadge } from "@/components/documents/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatBytes, formatDate } from "@/lib/format";
import { FadeIn } from "@/components/visual/fade-in";

export default async function DocumentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await getDocument(id);
  if (!document) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:p-8">
      <Link
        href="/documents"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to documents
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <FadeIn viewport={false}>
          <Card className="glow-border relative flex min-h-[560px] items-center justify-center overflow-hidden bg-muted/30 py-0">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-fine-grid opacity-[0.25]" />
            <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-lg bg-card shadow-sm ring-1 ring-border">
                <FileText className="size-7 text-signal" />
              </div>
              <p className="font-serif text-base font-medium">PDF preview</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                A rendered page-by-page preview will appear here once the backend PDF viewer is
                connected.
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn viewport={false} delay={0.1} className="flex flex-col gap-4">
          <Card className="gap-4 p-5">
            <div>
              <p className="break-words font-serif text-lg font-semibold leading-snug">
                {document.name}
              </p>
              <div className="mt-2">
                <StatusBadge status={document.status} />
              </div>
            </div>

            {document.summary && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground">{document.summary}</p>
              </>
            )}

            {document.status === "error" && document.errorMessage && (
              <>
                <Separator />
                <p className="text-sm text-destructive">{document.errorMessage}</p>
              </>
            )}

            <Separator />

            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="size-3.5" /> Pages
                </dt>
                <dd className="font-mono tabular-nums">{document.pages}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="size-3.5" /> File size
                </dt>
                <dd className="font-mono tabular-nums">{formatBytes(document.sizeBytes)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-3.5" /> Uploaded
                </dt>
                <dd className="font-mono tabular-nums">{formatDate(document.uploadedAt)}</dd>
              </div>
            </dl>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-signal text-signal-foreground hover:bg-signal/90"
              disabled={document.status !== "ready"}
              asChild={document.status === "ready"}
            >
              {document.status === "ready" ? (
                <Link href={`/chat?document=${document.id}`}>
                  <MessageSquarePlus className="size-4" /> Ask about this document
                </Link>
              ) : (
                <span>
                  <MessageSquarePlus className="size-4" /> Ask about this document
                </span>
              )}
            </Button>
            <Button variant="outline" className="w-full" disabled={document.status !== "ready"} asChild={document.status === "ready"}>
              {document.status === "ready" ? (
                <Link href={`/chat?document=${document.id}`}>
                  <Plus className="size-4" /> Start new conversation
                </Link>
              ) : (
                <span>
                  <Plus className="size-4" /> Start new conversation
                </span>
              )}
            </Button>
            {document.status !== "ready" && (
              <p className="text-center text-xs text-muted-foreground">
                Available once processing finishes.
              </p>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
