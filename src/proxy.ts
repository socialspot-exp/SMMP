import { clerkMiddleware } from "@clerk/nextjs/server";

/** Webhook is verified via `verifyWebhook` + CLERK_WEBHOOK_SIGNING_SECRET (no session). */
export default clerkMiddleware({
  signInUrl: "/login",
  signUpUrl: "/signup",
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
