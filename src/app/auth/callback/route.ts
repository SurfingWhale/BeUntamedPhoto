import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const raw = searchParams.get("next") ?? "/work";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/work";

  if (!code) {
    return NextResponse.redirect(`${origin}/enter?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/enter?error=exchange_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
