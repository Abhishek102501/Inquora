import Link from "next/link";
import { FolderKanban, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Collection } from "@/types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link href={`/collections/${collection.id}`}>
      <Card className="group gap-3 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-signal/30 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-md bg-signal/10 text-signal transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <FolderKanban className="size-5" />
          </div>
          <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <FileText className="size-3" /> {collection.documentIds.length}
          </span>
        </div>
        <div>
          <p className="font-serif text-base font-semibold transition-colors duration-200 group-hover:text-signal">
            {collection.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
        </div>
      </Card>
    </Link>
  );
}
