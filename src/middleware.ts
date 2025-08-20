import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/"],
  // Clerk v6 requires these configurations
  beforeAuth: (req) => {
    // Optional: Add any pre-auth logic here
  },
  afterAuth: (auth, req) => {
    // Optional: Add any post-auth logic here
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
