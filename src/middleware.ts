import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export default convexAuthNextjsMiddleware();

const ALLOWED_IPS = ["203.160.80.12", "203.160.80.13"]; // Example static IPs
const ALLOWED_RANGE = "203.160.80."; // Example prefix for school subnet

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip || "unknown";

  // Allow if IP matches the exact or prefix pattern
  if (ALLOWED_IPS.includes(ip) || ip.startsWith(ALLOWED_RANGE)) {
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
