import { notFound } from "next/navigation";
import { listDocuments } from "@/lib/services/document-service";
import { getConversation } from "@/lib/services/conversation-service";
import { getMessages } from "@/lib/services/chat-service";
import { ChatView } from "@/components/chat/chat-view";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [conversation, documents, messages] = await Promise.all([
    getConversation(id),
    listDocuments(),
    getMessages(id),
  ]);

  if (!conversation) notFound();

  return (
    <ChatView
      conversationId={conversation.id}
      title={conversation.title}
      documents={documents}
      initialMessages={messages}
      initialDocumentIds={conversation.documentIds}
    />
  );
}
