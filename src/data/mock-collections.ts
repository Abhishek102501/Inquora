import type { Collection } from "@/types";

export const mockCollections: Collection[] = [
  {
    id: "col_1",
    name: "Research papers",
    description: "Academic papers and technical references.",
    documentIds: ["doc_1", "doc_6"],
  },
  {
    id: "col_2",
    name: "Company & legal",
    description: "Contracts, policies, and board materials.",
    documentIds: ["doc_2", "doc_4", "doc_5", "doc_7"],
  },
  {
    id: "col_3",
    name: "Fundraising",
    description: "Term sheets and investor-facing documents.",
    documentIds: ["doc_3", "doc_8"],
  },
];
