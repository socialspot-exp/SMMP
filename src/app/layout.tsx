import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import { GlobalClerkHeader } from "@/components/layout/global-clerk-header";
import { getSiteSettingsServer } from "@/lib/site-settings";
import { Providers } from "./providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettingsServer();
  const title = s.site_title;
  const description =
    s.meta_description ??
    "High-end SMM services and elite digital accounts. Verified growth, instant delivery, and boutique quality.";
  const ogTitle = s.og_title?.trim() || title;
  const ogDesc = s.og_description?.trim() || description;
  const icons = s.favicon_url?.trim()
    ? { icon: s.favicon_url.trim(), shortcut: s.favicon_url.trim() }
    : undefined;

  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    keywords: s.meta_keywords?.trim() ? s.meta_keywords.split(",").map((k) => k.trim()) : undefined,
    icons,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      ...(s.og_image_url?.trim() ? { images: [{ url: s.og_image_url.trim() }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      ...(s.twitter_site?.trim() ? { site: s.twitter_site.trim() } : {}),
      ...(s.og_image_url?.trim() ? { images: [s.og_image_url.trim()] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettingsServer();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${beVietnamPro.variable} light h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background font-body text-on-surface selection:bg-primary/20 selection:text-on-surface"
      >
        <ClerkProvider signInUrl="/login" signUpUrl="/signup">
          <GlobalClerkHeader />
          <Providers siteSettings={siteSettings}>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
