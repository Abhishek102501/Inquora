import type { ChatMessage, Conversation } from "@/types";

export const mockConversations: Conversation[] = [
  {
    id: "conv_1",
    title: "Transformer architecture questions",
    documentIds: ["doc_1"],
    lastMessage: "The model relies entirely on self-attention, with no recurrence or convolution.",
    updatedAt: "2026-09-10T09:14:00Z",
    createdAt: "2026-09-09T20:00:00Z",
    messageCount: 8,
  },
  {
    id: "conv_2",
    title: "Board deck: revenue drivers",
    documentIds: ["doc_2"],
    lastMessage: "Net revenue retention improved to 118% driven by expansion in enterprise.",
    updatedAt: "2026-09-09T19:40:00Z",
    createdAt: "2026-09-09T18:00:00Z",
    messageCount: 5,
  },
  {
    id: "conv_3",
    title: "Handbook — remote work policy",
    documentIds: ["doc_4"],
    lastMessage: "Employees may work remotely up to 3 days per week with manager approval.",
    updatedAt: "2026-09-08T15:22:00Z",
    createdAt: "2026-09-08T15:00:00Z",
    messageCount: 3,
  },
  {
    id: "conv_4",
    title: "Phase II trial: adverse events",
    documentIds: ["doc_6"],
    lastMessage: "Grade 3 adverse events occurred in 4.2% of the treatment arm vs 1.8% placebo.",
    updatedAt: "2026-09-06T11:05:00Z",
    createdAt: "2026-09-06T10:40:00Z",
    messageCount: 11,
  },
  {
    id: "conv_5",
    title: "Lease — renewal terms",
    documentIds: ["doc_7"],
    lastMessage: "The lease auto-renews for 2 years unless notice is given 180 days prior.",
    updatedAt: "2026-08-29T13:12:00Z",
    createdAt: "2026-08-29T13:00:00Z",
    messageCount: 4,
  },
];

export const mockMessagesByConversation: Record<string, ChatMessage[]> = {
  conv_1: [
    {
      id: "msg_1",
      role: "user",
      content: "What is the main conclusion of this paper?",
      createdAt: "2026-09-09T20:00:00Z",
      status: "complete",
    },
    {
      id: "msg_2",
      role: "assistant",
      content:
        "The paper concludes that the Transformer, a model based entirely on attention mechanisms, outperforms existing encoder-decoder architectures on translation tasks while being more parallelizable and requiring significantly less training time than recurrent or convolutional models.",
      createdAt: "2026-09-09T20:00:12Z",
      status: "complete",
      sources: [
        {
          id: "src_1",
          documentId: "doc_1",
          documentName: "Attention Is All You Need.pdf",
          page: 1,
          snippet:
            "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
        },
        {
          id: "src_2",
          documentId: "doc_1",
          documentName: "Attention Is All You Need.pdf",
          page: 8,
          snippet:
            "On the WMT 2014 English-to-German translation task, the Transformer establishes a new state of the art BLEU score of 28.4.",
        },
      ],
    },
    {
      id: "msg_3",
      role: "user",
      content: "How many attention heads does the base model use?",
      createdAt: "2026-09-10T09:13:20Z",
      status: "complete",
    },
    {
      id: "msg_4",
      role: "assistant",
      content:
        "The base model uses 8 parallel attention heads, each operating on a 64-dimensional projection of queries, keys, and values.",
      createdAt: "2026-09-10T09:14:00Z",
      status: "complete",
      sources: [
        {
          id: "src_3",
          documentId: "doc_1",
          documentName: "Attention Is All You Need.pdf",
          page: 5,
          snippet:
            "In this work we employ h = 8 parallel attention layers, or heads. For each of these we use dk = dv = 64.",
        },
      ],
    },
  ],
};
