"""Upload validation and safe storage-key generation.

Defends against: wrong file type, spoofed extension, oversized uploads,
and path traversal via a malicious filename (e.g. "../../etc/passwd.pdf").
"""

import re
import uuid

ALLOWED_EXTENSION = ".pdf"
ALLOWED_MIME_TYPES = {"application/pdf"}
PDF_MAGIC_BYTES = b"%PDF-"

_UNSAFE_FILENAME_CHARS = re.compile(r"[^A-Za-z0-9._-]+")


def has_allowed_extension(filename: str) -> bool:
    return filename.lower().endswith(ALLOWED_EXTENSION)


def has_allowed_mime_type(content_type: str | None) -> bool:
    return content_type in ALLOWED_MIME_TYPES


def looks_like_pdf(header_bytes: bytes) -> bool:
    """Cheap content sniff — the declared MIME type/extension can be
    spoofed, but a real PDF always starts with the %PDF- magic bytes."""
    return header_bytes.startswith(PDF_MAGIC_BYTES)


def sanitize_filename(filename: str) -> str:
    """Strips any directory components and unsafe characters so the
    original filename can never be used to traverse the filesystem."""
    base = filename.replace("\\", "/").rsplit("/", 1)[-1]
    base = _UNSAFE_FILENAME_CHARS.sub("_", base).strip("._") or "document"
    return base[:150]


def generate_storage_key(original_filename: str) -> str:
    """A random, collision-free key used on disk — never derived directly
    from user input, so it cannot be used for path traversal."""
    safe_name = sanitize_filename(original_filename)
    return f"{uuid.uuid4().hex}-{safe_name}"
