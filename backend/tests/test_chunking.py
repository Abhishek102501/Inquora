import pytest

from app.services.chunking_service import chunk_pages
from app.services.pdf_service import PageText


def test_empty_pages_produce_no_chunks():
    pages = [PageText(page_number=1, text=""), PageText(page_number=2, text="   ")]
    chunks = chunk_pages(pages, chunk_size=500, chunk_overlap=50)
    assert chunks == []


def test_short_page_becomes_a_single_chunk():
    pages = [PageText(page_number=1, text="A short paragraph of text.")]
    chunks = chunk_pages(pages, chunk_size=500, chunk_overlap=50)
    assert len(chunks) == 1
    assert chunks[0].page_number == 1
    assert chunks[0].chunk_index == 0


def test_page_number_is_preserved_across_multiple_pages():
    pages = [
        PageText(page_number=1, text="Page one content."),
        PageText(page_number=2, text="Page two content."),
        PageText(page_number=5, text="Page five content (pages 3-4 had no text)."),
    ]
    chunks = chunk_pages(pages, chunk_size=500, chunk_overlap=50)
    page_numbers = [c.page_number for c in chunks]
    assert page_numbers == [1, 2, 5]


def test_long_page_is_split_into_multiple_chunks_within_size_limit():
    long_text = "\n\n".join(f"Paragraph {i}. " + ("word " * 40) for i in range(20))
    pages = [PageText(page_number=1, text=long_text)]
    chunks = chunk_pages(pages, chunk_size=300, chunk_overlap=50)

    assert len(chunks) > 1
    assert all(c.page_number == 1 for c in chunks)
    assert all(len(c.text) <= 300 + 50 for c in chunks)  # overlap can add a little back


def test_chunk_index_is_globally_sequential():
    pages = [
        PageText(page_number=1, text="word " * 200),
        PageText(page_number=2, text="word " * 200),
    ]
    chunks = chunk_pages(pages, chunk_size=200, chunk_overlap=20)
    indices = [c.chunk_index for c in chunks]
    assert indices == list(range(len(chunks)))


def test_overlap_carries_trailing_text_into_next_chunk():
    long_text = "\n\n".join(f"Paragraph {i} with some unique content here." for i in range(10))
    pages = [PageText(page_number=1, text=long_text)]
    chunks = chunk_pages(pages, chunk_size=120, chunk_overlap=30)

    assert len(chunks) > 1
    # The tail of each chunk should reappear at the start of the next one.
    for i in range(len(chunks) - 1):
        tail = chunks[i].text[-15:]
        assert tail[:8] in chunks[i + 1].text


def test_invalid_overlap_configuration_raises():
    pages = [PageText(page_number=1, text="some text")]
    with pytest.raises(ValueError):
        chunk_pages(pages, chunk_size=100, chunk_overlap=100)
    with pytest.raises(ValueError):
        chunk_pages(pages, chunk_size=0, chunk_overlap=0)
