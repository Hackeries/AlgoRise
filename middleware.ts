export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/dashboard/:path*", "/problems/:path*", "/contests/:path*", "/leaderboard/:path*", "/me/:path*"],
};
