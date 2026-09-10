"use client";

import { useViewer } from "@/components/use-viewer";

/**
 * Shows the guestbook section when there is something in it, or when the
 * reader is signed in and could add something.
 *
 * The rule is the server's from before: an empty comment box under every
 * gallery reads as an abandoned site, which costs more trust than the feature
 * earns. Half of it is still a server fact — whether notes exist — and half is
 * now the client's, because a shared prerender cannot know who is reading.
 */
export function NotesGate({
  hasNotes,
  children,
}: {
  hasNotes: boolean;
  children: React.ReactNode;
}) {
  const viewer = useViewer();
  if (!hasNotes && !viewer) return null;
  return <>{children}</>;
}
