"use client";

import { useViewer } from "@/components/use-viewer";

/**
 * Shows its children only to a reader who is not signed in.
 *
 * For prompts that would be noise to someone who already is. It renders in the
 * cached HTML and removes itself if the client turns out to have a session,
 * which is the right way round: the prompt is correct for almost every reader,
 * and the one it is wrong for is the one who can watch it go.
 */
export function SignedOut({ children }: { children: React.ReactNode }) {
  return useViewer() ? null : <>{children}</>;
}
