import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
const isPublicApiRoute = createRouteMatcher(["/api/videos(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // If a signed-in user opens the landing or authentication pages, send them to the dashboard.
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  if (!userId && isApiRequest && !isPublicApiRoute(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!userId && !isPublicRoute(req) && !isPublicApiRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
