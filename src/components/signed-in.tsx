"use client";

import { useViewer } from "@/components/use-viewer";

/** The mirror of SignedOut. Neither belongs in a server decision when the
 *  markup is shared by every reader. */
export function SignedIn({ children }: { children: React.ReactNode }) {
  return useViewer() ? <>{children}</> : null;
}
