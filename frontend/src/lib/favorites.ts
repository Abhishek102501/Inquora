/**
 * "Favorite" is a client-only convenience overlay on real documents — the
 * backend has no favorites concept. Favorite document ids are kept in
 * localStorage so the feature is honest (it operates on real document
 * data, just with local-only persistence) rather than backed by fake data.
 */

const STORAGE_KEY = "inqora_favorite_document_ids";

function readIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore — favorites just won't persist
  }
}

export function getFavoriteIds(): Set<string> {
  return readIds();
}

export function toggleFavoriteId(id: string): Set<string> {
  const ids = readIds();
  if (ids.has(id)) ids.delete(id);
  else ids.add(id);
  writeIds(ids);
  return ids;
}
