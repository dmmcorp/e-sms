import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip || "unknown";
  return NextResponse.json({ detected_ip: ip });
}
