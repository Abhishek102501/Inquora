import io

import fitz


def make_pdf_bytes(text: str = "Hello Inqora. This is a real test PDF page.") -> bytes:
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), text)
    buffer = io.BytesIO(document.tobytes())
    document.close()
    return buffer.getvalue()


def test_upload_valid_pdf_is_accepted_and_processed(client, auth_headers):
    headers = auth_headers(email="uploader@example.com")
    response = client.post(
        "/api/v1/documents/upload",
        headers=headers,
        files={"file": ("paper.pdf", make_pdf_bytes(), "application/pdf")},
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["original_filename"] == "paper.pdf"
    assert body["status"] in {"uploaded", "processing", "ready"}

    status_response = client.get(f"/api/v1/documents/{body['id']}/status", headers=headers)
    assert status_response.status_code == 200
    # The TestClient runs BackgroundTasks synchronously, so processing has
    # already completed with the fake embedding provider by this point.
    assert status_response.json()["status"] == "ready"
    assert status_response.json()["page_count"] == 1


def test_upload_rejects_non_pdf_file(client, auth_headers):
    headers = auth_headers(email="rejecter@example.com")
    response = client.post(
        "/api/v1/documents/upload",
        headers=headers,
        files={"file": ("notes.txt", b"just some text", "text/plain")},
    )
    assert response.status_code == 400


def test_upload_rejects_pdf_extension_with_fake_content(client, auth_headers):
    """A .pdf extension with a spoofed MIME type but non-PDF bytes must
    still be rejected by the magic-byte content sniff."""
    headers = auth_headers(email="spoofer@example.com")
    response = client.post(
        "/api/v1/documents/upload",
        headers=headers,
        files={"file": ("fake.pdf", b"not really a pdf", "application/pdf")},
    )
    assert response.status_code == 400


def test_upload_requires_authentication(client):
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("paper.pdf", make_pdf_bytes(), "application/pdf")},
    )
    assert response.status_code == 401


def test_oversized_file_rejected():
    """Unit-tests the size guard directly rather than uploading a real
    25MB+ payload in the test suite."""
    from app.core.config import get_settings
    from app.core.exceptions import FileTooLargeError
    from app.services.document_service import DocumentService

    settings = get_settings()
    settings.max_upload_size_mb = 1

    service = DocumentService.__new__(DocumentService)  # validate_upload needs no collaborators
    oversized = b"%PDF-" + (b"0" * (2 * 1024 * 1024))
    try:
        service.validate_upload("big.pdf", "application/pdf", oversized)
        raise AssertionError("Expected FileTooLargeError")
    except FileTooLargeError:
        pass


def test_user_cannot_access_another_users_document(client, auth_headers):
    owner_headers = auth_headers(email="owner@example.com")
    upload = client.post(
        "/api/v1/documents/upload",
        headers=owner_headers,
        files={"file": ("owner.pdf", make_pdf_bytes(), "application/pdf")},
    )
    document_id = upload.json()["id"]

    other_headers = auth_headers(email="intruder@example.com")
    response = client.get(f"/api/v1/documents/{document_id}", headers=other_headers)
    assert response.status_code == 404


def test_list_documents_only_returns_own_documents(client, auth_headers):
    headers_a = auth_headers(email="a@example.com")
    headers_b = auth_headers(email="b@example.com")
    client.post(
        "/api/v1/documents/upload",
        headers=headers_a,
        files={"file": ("a.pdf", make_pdf_bytes(), "application/pdf")},
    )
    response = client.get("/api/v1/documents", headers=headers_b)
    assert response.status_code == 200
    assert response.json()["items"] == []
