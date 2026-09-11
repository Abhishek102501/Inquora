"""Text cleaning helpers used before chunking/embedding."""

import re

_WHITESPACE_RUN = re.compile(r"[ \t\f\v]+")
_BLANK_LINE_RUN = re.compile(r"\n{3,}")


def clean_extracted_text(text: str) -> str:
    """Normalizes whitespace produced by PDF text extraction without
    altering meaningful content."""
    text = text.replace("\x00", "")
    text = _WHITESPACE_RUN.sub(" ", text)
    text = _BLANK_LINE_RUN.sub("\n\n", text)
    return text.strip()
