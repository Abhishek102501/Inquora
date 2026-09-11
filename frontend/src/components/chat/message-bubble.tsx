import { AlertTriangle, SearchX } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SourceCitationChip } from "@/components/chat/source-citation";
import { formatDateTime } from "@/lib/format";
import type { ChatMessage } from "@/types";
import { cn } from "cn";

export function MessageBubble({
  message,
  activeSourceId,
  onHoverSource,
}: {
  message: ChatMessage;
  activeSourceId?: string | null;
  onHoverSource?: (id: string | null) => void;
}) {
  const isUser = message.role === "user";

  if (message.status === "error") {
    return (
      <div className="flex items-start gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div className="max-w-[85%] rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.status === "no-answer") {
    return (
      <div className="flex items-start gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <SearchX className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div className="max-w-[85%] rounded-xl border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm text-foreground">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <Avatar className="size-8 shrink-0">
        <AvatarFallback
          className={isUser ? "bg-muted text-foreground" : "bg-signal/10 text-signal"}
        >
          {isUser ? "AS" : "IQ"}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex max-w-[85%] flex-col gap-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-[15px] leading-relaxed",
            isUser ? "bg-signal text-signal-foreground" : "bg-muted text-foreground",
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="px-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Sources
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((source, i) => (
                <SourceCitationChip
                  key={source.id}
                  source={source}
                  index={i + 1}
                  isActive={activeSourceId === source.id}
                  onHoverChange={(hovered) => onHoverSource?.(hovered ? source.id : null)}
                />
              ))}
            </div>
          </div>
        )}

        <span className="px-0.5 text-[11px] text-muted-foreground">
          {formatDateTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
