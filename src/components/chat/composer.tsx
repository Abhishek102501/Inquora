"use client";

import { useRef, type KeyboardEvent } from "react";
import { ArrowUp, Check, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppDocument } from "@/types";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  documents: AppDocument[];
  selectedDocumentIds: string[];
  onToggleDocument: (id: string) => void;
  disabled?: boolean;
}

export function Composer({
  value,
  onChange,
  onSend,
  documents,
  selectedDocumentIds,
  onToggleDocument,
  disabled,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  }

  return (
    <div className="glow-border rounded-xl border border-border bg-card p-2.5 shadow-sm transition-shadow duration-300 focus-within:shadow-md">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents…"
        rows={1}
        className="max-h-40 min-h-10 resize-none border-none bg-transparent px-1.5 shadow-none focus-visible:ring-0"
        disabled={disabled}
      />
      <div className="flex items-center justify-between px-1 pt-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Paperclip className="size-3.5" />
              {selectedDocumentIds.length === 0
                ? "All documents"
                : `${selectedDocumentIds.length} selected`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Scope this question to</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {documents.map((doc) => (
              <DropdownMenuItem
                key={doc.id}
                onSelect={(e) => {
                  e.preventDefault();
                  onToggleDocument(doc.id);
                }}
                className="justify-between"
              >
                <span className="truncate">{doc.name}</span>
                {selectedDocumentIds.includes(doc.id) && <Check className="size-3.5 text-signal" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">Enter</kbd>{" "}
            to send
          </span>
          <motion.div whileHover={value.trim() && !disabled ? { scale: 1.06 } : undefined} whileTap={{ scale: 0.94 }}>
            <Button
              size="icon"
              className="size-8 rounded-full bg-signal text-signal-foreground shadow-sm hover:bg-signal/90 hover:shadow-md disabled:opacity-40"
              onClick={onSend}
              disabled={!value.trim() || disabled}
              aria-label="Send message"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={disabled ? "loading" : "idle"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <ArrowUp className="size-4" />
                </motion.span>
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
