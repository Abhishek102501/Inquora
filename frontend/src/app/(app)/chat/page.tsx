import { listDocuments } from "@/lib/services/document-service";
import { ChatView } from "@/components/chat/chat-view";

export default async function NewChatPage({
  searchParams,
}: {
  searchParams: Promise<{ document?: string }>;
}) {
  const [documents, { document }] = await Promise.all([listDocuments(), searchParams]);

  return (
    <ChatView
      title="New chat"
      documents={documents}
      initialMessages={[]}
      initialDocumentIds={document ? [document] : []}
    />
  );
}
