"""Page-aware, recursive-ish text chunking.

Chunks never span across page boundaries — each chunk's `page_number` is
therefore always exact, which matters because it is the single source of
truth for every citation the user sees later. Within a page, text is split
recursively on paragraph -> sentence -> hard-width boundaries so chunks
stay semantically coherent rather than being cut mid-sentence whenever
avoidable.

CHUNK_SIZE / CHUNK_OVERLAP are read from configuration, not hardcoded.
"""

import re
from dataclasses import dataclass

from app.services.pdf_service import PageText

_PARAGRAPH_SPLIT = re.compile(r"\n\s*\n")
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


@dataclass
class TextChunk:
    text: str
    page_number: int
    chunk_index: int


def _split_recursive(text: str, chunk_size: int) -> list[str]:
    """Splits `text` into pieces no longer than `chunk_size`, preferring
    paragraph boundaries, then sentence boundaries, then a hard cut."""
    if len(text) <= chunk_size:
        return [text] if text.strip() else []

    for splitter in (_PARAGRAPH_SPLIT, _SENTENCE_SPLIT):
        pieces = [p for p in splitter.split(text) if p.strip()]
        if len(pieces) > 1:
            break
    else:
        pieces = None

    if not pieces or len(pieces) == 1:
        # No natural boundary found — hard-cut on whitespace nearest chunk_size.
        pieces = []
        remaining = text
        while remaining:
            if len(remaining) <= chunk_size:
                pieces.append(remaining)
                break
            cut = remaining.rfind(" ", 0, chunk_size)
            cut = cut if cut > 0 else chunk_size
            pieces.append(remaining[:cut])
            remaining = remaining[cut:].lstrip()

    # Greedily pack pieces back together up to chunk_size.
    chunks: list[str] = []
    current = ""
    for piece in pieces:
        candidate = f"{current} {piece}".strip() if current else piece
        if len(candidate) <= chunk_size:
            current = candidate
        else:
            if current:
                chunks.append(current)
            if len(piece) > chunk_size:
                chunks.extend(_split_recursive(piece, chunk_size))
                current = ""
            else:
                current = piece
    if current:
        chunks.append(current)
    return chunks


def _apply_overlap(pieces: list[str], overlap: int) -> list[str]:
    if overlap <= 0 or len(pieces) <= 1:
        return pieces
    result = [pieces[0]]
    for i in range(1, len(pieces)):
        previous_tail = pieces[i - 1][-overlap:]
        result.append(f"{previous_tail} {pieces[i]}".strip())
    return result


def chunk_pages(pages: list[PageText], chunk_size: int, chunk_overlap: int) -> list[TextChunk]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be non-negative and smaller than chunk_size")

    chunks: list[TextChunk] = []
    chunk_index = 0
    for page in pages:
        if not page.text.strip():
            continue
        pieces = _split_recursive(page.text, chunk_size)
        pieces = _apply_overlap(pieces, chunk_overlap)
        for piece in pieces:
            if not piece.strip():
                continue
            chunks.append(TextChunk(text=piece, page_number=page.page_number, chunk_index=chunk_index))
            chunk_index += 1
    return chunks
