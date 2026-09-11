from bson import ObjectId

from app.db.repositories.chunks import ChunksRepository


def _patch_vector_search(monkeypatch, hits: list[dict]):
    def fake_vector_search(self, query_embedding, user_id, document_ids, top_k):
        return hits

    monkeypatch.setattr(ChunksRepository, "vector_search", fake_vector_search)


def test_chat_requires_authentication(client):
    response = client.post("/api/v1/chat", json={"question": "What is this about?"})
    assert response.status_code == 401


def test_chat_rejects_empty_question(client, auth_headers):
    headers = auth_headers(email="asker@example.com")
    response = client.post("/api/v1/chat", headers=headers, json={"question": ""})
    assert response.status_code == 422


def test_chat_with_no_matching_chunks_returns_controlled_response(client, auth_headers, monkeypatch):
    _patch_vector_search(monkeypatch, hits=[])
    headers = auth_headers(email="noinfo@example.com")

    response = client.post(
        "/api/v1/chat", headers=headers, json={"question": "What dataset was used?"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["grounded"] is False
    assert body["sources"] == []
    assert "couldn't find enough information" in body["answer"].lower()


def test_chat_with_relevant_chunks_returns_grounded_answer_with_citations(
    client, auth_headers, monkeypatch, fake_llm
):
    hits = [
        {
            "_id": ObjectId(),
            "documentId": "doc-1",
            "userId": "irrelevant-since-mocked",
            "text": "The Transformer relies on self-attention.",
            "pageNumber": 5,
            "chunkIndex": 0,
            "metadata": {"filename": "paper.pdf"},
            "score": 0.95,
        }
    ]
    _patch_vector_search(monkeypatch, hits=hits)
    headers = auth_headers(email="grounded@example.com")

    response = client.post(
        "/api/v1/chat",
        headers=headers,
        json={"question": "What does the Transformer rely on?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["grounded"] is True
    assert body["answer"] == fake_llm.canned_response
    assert len(body["sources"]) == 1
    assert body["sources"][0]["page_number"] == 5
    assert body["sources"][0]["document_id"] == "doc-1"
    assert body["conversation_id"]

    # Page numbers/citations came from the retrieved chunk metadata, never
    # parsed from the LLM's free-text answer.
    assert "5" not in fake_llm.canned_response

    # A conversation and both messages were persisted.
    conv_response = client.get(
        f"/api/v1/conversations/{body['conversation_id']}/messages", headers=headers
    )
    assert conv_response.status_code == 200
    messages = conv_response.json()["items"]
    assert [m["role"] for m in messages] == ["user", "assistant"]
    assert messages[1]["sources"][0]["page_number"] == 5


def test_chat_cannot_use_another_users_document(client, auth_headers):
    owner_headers = auth_headers(email="docowner@example.com")
    intruder_headers = auth_headers(email="docintruder@example.com")

    import io

    import fitz

    document = fitz.open()
    document.new_page()
    pdf_bytes = document.tobytes()
    document.close()

    upload = client.post(
        "/api/v1/documents/upload",
        headers=owner_headers,
        files={"file": ("owner.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    document_id = upload.json()["id"]

    response = client.post(
        "/api/v1/chat",
        headers=intruder_headers,
        json={"question": "Summarize this.", "document_ids": [document_id]},
    )
    assert response.status_code == 404


def test_followup_question_reuses_conversation(client, auth_headers, monkeypatch):
    hits = [
        {
            "_id": ObjectId(),
            "documentId": "doc-1",
            "userId": "x",
            "text": "Relevant text.",
            "pageNumber": 1,
            "chunkIndex": 0,
            "metadata": {"filename": "paper.pdf"},
            "score": 0.9,
        }
    ]
    _patch_vector_search(monkeypatch, hits=hits)
    headers = auth_headers(email="followup@example.com")

    first = client.post("/api/v1/chat", headers=headers, json={"question": "First question?"})
    conversation_id = first.json()["conversation_id"]

    second = client.post(
        f"/api/v1/chat/{conversation_id}/messages",
        headers=headers,
        json={"question": "A follow-up question?"},
    )
    assert second.status_code == 200
    assert second.json()["conversation_id"] == conversation_id

    messages = client.get(
        f"/api/v1/conversations/{conversation_id}/messages", headers=headers
    ).json()["items"]
    assert len(messages) == 4  # 2 user + 2 assistant
