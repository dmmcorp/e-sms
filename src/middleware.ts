import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default convexAuthNextjsMiddleware();

const allowedIPs =
  process.env.ALLOWED_IPS?.split(",").map((ip) => ip.trim()) || [];
const allowedPrefix = process.env.ALLOWED_PREFIX || "";

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip || "unknown";

  // Allow if IP matches the exact or prefix pattern
  if (allowedIPs.includes(ip) || ip.startsWith(allowedPrefix)) {
    return NextResponse.next();
  }

  // Otherwise deny access
  return new NextResponse("Access restricted to school network only.", {
    status: 403,
  });
}
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.

  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
