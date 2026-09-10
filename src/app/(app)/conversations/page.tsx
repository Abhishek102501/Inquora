import { listConversations } from "@/lib/services/conversation-service";
import { listDocuments } from "@/lib/services/document-service";
import { PageHeader } from "@/components/shared/page-header";
import { ConversationList } from "@/components/conversations/conversation-list";

export default async function ConversationsPage() {
  const [conversations, documents] = await Promise.all([listConversations(), listDocuments()]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-8">
      <PageHeader
        title="Conversations"
        description={`${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`}
      />
      <ConversationList initialConversations={conversations} documents={documents} />
    </div>
  );
}
