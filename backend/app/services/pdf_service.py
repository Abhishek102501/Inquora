"""PDF parsing via PyMuPDF.

Extracts page-aware text, tolerating empty pages, image-only pages, and
unusual Unicode. Does NOT perform OCR — an image-only PDF with zero
extractable text across every page is reported as such so the caller can
surface a clear "this PDF needs OCR" processing error instead of silently
producing an empty, useless document.
"""

from dataclasses import dataclass

import fitz  # PyMuPDF

from app.core.exceptions import InvalidFileError
from app.core.logging import get_logger
from app.utils.text import clean_extracted_text

logger = get_logger(__name__)


@dataclass
class PageText:
    page_number: int  # 1-indexed
    text: str


@dataclass
class ParsedPdf:
    page_count: int
    pages: list[PageText]

    @property
    def has_extractable_text(self) -> bool:
        return any(page.text.strip() for page in self.pages)


def parse_pdf(content: bytes) -> ParsedPdf:
    try:
        document = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:  # noqa: BLE001 — PyMuPDF raises various internal error types
        logger.warning("Failed to open PDF: %s", exc)
        raise InvalidFileError("The file could not be read as a valid PDF.") from exc

    try:
        if document.is_encrypted:
            raise InvalidFileError("This PDF is password-protected and cannot be processed.")

        pages: list[PageText] = []
        for index in range(document.page_count):
            try:
                page = document.load_page(index)
                raw_text = page.get_text("text")
            except Exception as exc:  # noqa: BLE001 — a single bad page shouldn't fail the whole doc
                logger.warning("Failed to extract text from page %s: %s", index + 1, exc)
                raw_text = ""
            pages.append(PageText(page_number=index + 1, text=clean_extracted_text(raw_text)))

        return ParsedPdf(page_count=document.page_count, pages=pages)
    finally:
        document.close()
