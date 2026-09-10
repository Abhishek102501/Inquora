import Link from "next/link";
import { FileStack, MessagesSquare, FileText, Layers, Upload, Plus, ArrowRight } from "lucide-react";
import { listDocuments } from "@/lib/services/document-service";
import { listConversations } from "@/lib/services/conversation-service";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/documents/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/visual/fade-in";

export default async function DashboardPage() {
  const [documents, conversations] = await Promise.all([listDocuments(), listConversations()]);
  const totalPages = documents.reduce((sum, d) => sum + (d.status === "ready" ? d.pages : 0), 0);
  const recentDocuments = documents.slice(0, 5);
  const recentConversations = conversations.slice(0, 5);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 md:p-8">
      <PageHeader
        title="Dashboard"
        description="An overview of your documents and conversations."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/documents/upload">
                <Upload className="size-4" /> Upload PDF
              </Link>
            </Button>
            <Button className="bg-signal text-signal-foreground hover:bg-signal/90" asChild>
              <Link href="/chat">
                <Plus className="size-4" /> New chat
              </Link>
            </Button>
          </>
        }
      />

      <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4" viewport={false} stagger={0.06}>
        <StaggerItem>
          <StatCard label="Total documents" value={documents.length} icon={FileStack} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Total conversations" value={conversations.length} icon={MessagesSquare} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Pages indexed" value={totalPages} icon={Layers} />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Processing now"
            value={documents.filter((d) => d.status === "processing" || d.status === "queued").length}
            icon={FileText}
          />
        </StaggerItem>
      </StaggerGroup>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold">Recent documents</h3>
            <Link
              href="/documents"
              className="group flex items-center gap-1 text-sm text-signal hover:underline"
            >
              View all{" "}
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          {recentDocuments.length === 0 ? (
            <EmptyState
              illustration="documents"
              icon={FileStack}
              title="No documents yet"
              description="Upload your first PDF to start asking questions."
              action={
                <Button className="bg-signal text-signal-foreground hover:bg-signal/90" asChild>
                  <Link href="/documents/upload">
                    <Upload className="size-4" /> Upload a PDF
                  </Link>
                </Button>
              }
            />
          ) : (
            <Card className="divide-y divide-border py-0">
              {recentDocuments.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-signal/10 text-signal transition-transform duration-200 group-hover:scale-105">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.pages} pages &middot; {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                </Link>
              ))}
            </Card>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold">Recent chats</h3>
            <Link
              href="/conversations"
              className="group flex items-center gap-1 text-sm text-signal hover:underline"
            >
              View all{" "}
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          {recentConversations.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="No conversations yet"
              description="Start a conversation to ask questions about your documents."
              action={
                <Button className="bg-signal text-signal-foreground hover:bg-signal/90" asChild>
                  <Link href="/chat">
                    <Plus className="size-4" /> New chat
                  </Link>
                </Button>
              }
            />
          ) : (
            <Card className="divide-y divide-border py-0">
              {recentConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-muted/50"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-transform duration-200 group-hover:scale-105">
                    <MessagesSquare className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{conv.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{conv.lastMessage}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(conv.updatedAt)}
                  </span>
                </Link>
              ))}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
