from bson import ObjectId

from app.db.repositories.chunks import ChunksRepository
from app.services.retrieval_service import RetrievalService
from app.services.vector_search_service import VectorSearchService
from tests.fakes import FakeEmbeddingProvider


def _fake_hit(score: float, page: int, text: str, document_id: str, user_id: str) -> dict:
    return {
        "_id": ObjectId(),
        "documentId": document_id,
        "userId": user_id,
        "text": text,
        "pageNumber": page,
        "chunkIndex": 0,
        "metadata": {"filename": "paper.pdf"},
        "score": score,
    }


def test_vector_search_pipeline_structure(db, monkeypatch):
    """The $vectorSearch stage itself carries no filter (this deployment's
    index declares no filter fields) — user/document scoping happens via a
    $match stage immediately after, which this test asserts."""
    captured_pipeline = {}

    def fake_aggregate(pipeline, *args, **kwargs):
        captured_pipeline["pipeline"] = pipeline
        return iter([])

    monkeypatch.setattr(db.chunks, "aggregate", fake_aggregate)

    repo = ChunksRepository(db)
    repo.vector_search(
        query_embedding=[0.1, 0.2, 0.3],
        user_id="user-1",
        document_ids=["doc-1", "doc-2"],
        top_k=5,
    )

    pipeline = captured_pipeline["pipeline"]
    vector_stage = pipeline[0]["$vectorSearch"]
    assert vector_stage["queryVector"] == [0.1, 0.2, 0.3]
    assert "filter" not in vector_stage
    assert vector_stage["limit"] > 5  # over-fetched candidates before post-filtering

    match_stages = [s["$match"] for s in pipeline if "$match" in s]
    assert len(match_stages) == 1
    assert match_stages[0]["userId"] == "user-1"
    assert match_stages[0]["documentId"] == {"$in": ["doc-1", "doc-2"]}

    assert pipeline[-1] == {"$limit": 5}


def test_vector_search_omits_document_filter_when_not_scoped(db, monkeypatch):
    captured_pipeline = {}

    def fake_aggregate(pipeline, *args, **kwargs):
        captured_pipeline["pipeline"] = pipeline
        return iter([])

    monkeypatch.setattr(db.chunks, "aggregate", fake_aggregate)

    repo = ChunksRepository(db)
    repo.vector_search(query_embedding=[0.1], user_id="user-1", document_ids=None, top_k=5)

    match_stage = next(s["$match"] for s in captured_pipeline["pipeline"] if "$match" in s)
    assert match_stage["userId"] == "user-1"
    assert "documentId" not in match_stage


def test_retrieval_service_filters_below_threshold(monkeypatch):
    from app.core.config import get_settings

    settings = get_settings()
    settings.retrieval_similarity_threshold = 0.5
    settings.retrieval_max_context_chunks = 10

    hits = [
        _fake_hit(0.9, 1, "highly relevant text", "doc-1", "user-1"),
        _fake_hit(0.2, 2, "not relevant text", "doc-1", "user-1"),
    ]

    class FakeVectorSearchService(VectorSearchService):
        def __init__(self):
            pass

        def search(self, query, user_id, document_ids, top_k):
            return hits

    service = RetrievalService(FakeVectorSearchService())
    results = service.retrieve("a question", "user-1")

    assert len(results) == 1
    assert results[0].score == 0.9
    assert results[0].page_number == 1


def test_retrieval_service_deduplicates_near_identical_chunks(monkeypatch):
    from app.core.config import get_settings

    settings = get_settings()
    settings.retrieval_similarity_threshold = 0.0
    settings.retrieval_max_context_chunks = 10

    text = "The Transformer relies entirely on self-attention mechanisms."
    hits = [
        _fake_hit(0.95, 1, text, "doc-1", "user-1"),
        _fake_hit(0.94, 1, text, "doc-1", "user-1"),  # near-duplicate, same page re-chunked
        _fake_hit(0.80, 2, "A completely different sentence about datasets.", "doc-1", "user-1"),
    ]

    class FakeVectorSearchService(VectorSearchService):
        def __init__(self):
            pass

        def search(self, query, user_id, document_ids, top_k):
            return hits

    service = RetrievalService(FakeVectorSearchService())
    results = service.retrieve("a question", "user-1")

    assert len(results) == 2
    assert results[0].text == text


def test_retrieval_service_respects_max_context_chunks(monkeypatch):
    from app.core.config import get_settings

    settings = get_settings()
    settings.retrieval_similarity_threshold = 0.0
    settings.retrieval_max_context_chunks = 2

    distinct_texts = [
        "The Transformer relies on self-attention.",
        "Datasets included WMT 2014 English-German.",
        "Training took twelve hours on eight GPUs.",
        "The model achieved a new state of the art BLEU score.",
        "Ablation studies varied the number of attention heads.",
    ]
    hits = [
        _fake_hit(0.9 - i * 0.01, i, text, "doc-1", "user-1")
        for i, text in enumerate(distinct_texts)
    ]

    class FakeVectorSearchService(VectorSearchService):
        def __init__(self):
            pass

        def search(self, query, user_id, document_ids, top_k):
            return hits

    service = RetrievalService(FakeVectorSearchService())
    results = service.retrieve("a question", "user-1")
    assert len(results) == 2


def test_embedding_provider_dimensions_are_consistent():
    provider = FakeEmbeddingProvider()
    vectors = provider.embed_texts(["a", "b", "c"])
    assert all(len(v) == provider.dimensions for v in vectors)
    assert len(provider.embed_query("a question")) == provider.dimensions
