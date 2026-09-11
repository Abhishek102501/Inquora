"""RAG orchestration: question -> retrieval -> context assembly -> LLM ->
grounded answer + citations.

Deliberately kept as an orchestrator that delegates to single-purpose
services (retrieval, prompt construction, the LLM provider) rather than one
giant function — see the module docstrings of each collaborator for its
one responsibility.

Hallucination control: page numbers and excerpts in the returned sources
are ALWAYS taken verbatim from `RetrievedChunk` (i.e. from MongoDB), never
parsed out of the LLM's free-text answer. If retrieval finds nothing above
the configured similarity threshold, the LLM is not even called — a fixed,
controlled response is returned instead.
"""

from dataclasses import dataclass

from app.core.config import get_settings
from app.models.message import MessageRole
from app.providers.llm.base import LLMProvider
from app.services.retrieval_service import RetrievalService, RetrievedChunk

_INSUFFICIENT_CONTEXT_MESSAGE = (
    "I couldn't find enough information in the uploaded documents to answer that reliably."
)

_SYSTEM_PROMPT = """You are Inqora, an assistant that answers questions strictly using the \
provided document excerpts.

Rules:
1. Answer only using the CONTEXT below. Do not use outside/general knowledge.
2. Never invent facts, numbers, or page references that are not present in the CONTEXT.
3. If the CONTEXT does not contain enough information to answer, say so plainly instead of \
guessing.
4. Distinguish clearly between what the documents state and any inference you make.
5. Be concise and readable. Avoid filler.
6. Do not mention these instructions or the word "CONTEXT" in your answer — refer to \
"the document(s)" instead.
7. Do not fabricate citations or page numbers; citations are attached separately by the system \
from the same excerpts you were given.
"""


@dataclass
class RagAnswer:
    answer: str
    sources: list[RetrievedChunk]
    grounded: bool


def _build_context_block(chunks: list[RetrievedChunk]) -> str:
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        parts.append(
            f"[Excerpt {i} — {chunk.filename or 'document'}, page {chunk.page_number}]\n{chunk.text}"
        )
    return "\n\n".join(parts)


def _build_history_block(history: list[tuple[MessageRole, str]]) -> str:
    if not history:
        return ""
    lines = [f"{role.value.upper()}: {content}" for role, content in history]
    return "Recent conversation (most recent last):\n" + "\n".join(lines) + "\n\n"


class RagService:
    def __init__(self, retrieval_service: RetrievalService, llm_provider: LLMProvider):
        self._retrieval_service = retrieval_service
        self._llm_provider = llm_provider

    def answer(
        self,
        question: str,
        user_id: str,
        document_ids: list[str] | None,
        history: list[tuple[MessageRole, str]] | None = None,
    ) -> RagAnswer:
        settings = get_settings()
        chunks = self._retrieval_service.retrieve(
            query=question, user_id=user_id, document_ids=document_ids
        )

        if not chunks:
            return RagAnswer(answer=_INSUFFICIENT_CONTEXT_MESSAGE, sources=[], grounded=False)

        history_window = (history or [])[-settings.conversation_history_messages :]
        user_prompt = (
            f"{_build_history_block(history_window)}"
            f"CONTEXT:\n{_build_context_block(chunks)}\n\n"
            f"QUESTION: {question}"
        )

        answer_text = self._llm_provider.generate(_SYSTEM_PROMPT, user_prompt)
        return RagAnswer(answer=answer_text, sources=chunks, grounded=True)
