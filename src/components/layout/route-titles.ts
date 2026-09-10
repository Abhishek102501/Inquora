const staticTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/documents": "Documents",
  "/documents/upload": "Upload documents",
  "/collections": "Collections",
  "/conversations": "Conversations",
  "/favorites": "Favorites",
  "/settings": "Settings",
  "/chat": "New chat",
};

export function routeTitle(pathname: string): string {
  if (staticTitles[pathname]) return staticTitles[pathname];
  if (pathname.startsWith("/documents/")) return "Document details";
  if (pathname.startsWith("/collections/")) return "Collection";
  if (pathname.startsWith("/chat/")) return "Conversation";
  return "Inqora";
}
