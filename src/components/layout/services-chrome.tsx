import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileFab } from "@/components/layout/mobile-fab";
import { DesktopSiteFooter } from "@/components/layout/desktop-site-footer";
import { HomeFloatingHeader } from "@/components/layout/home-floating-header";
import { cn } from "@/lib/utils";

type ServicesChromeProps = {
  children: React.ReactNode;
  /** Extra bottom padding on mobile (e.g. sticky CTA above tab bar) */
  mobileMainPb?: string;
  /** Override default top padding under floating header (matches home: pt-28 / lg:pt-[7.2rem]) */
  mainPt?: string;
  showFab?: boolean;
};

export function ServicesChrome({
  children,
  mobileMainPb,
  mainPt,
  showFab = true,
}: ServicesChromeProps) {
  return (
    <div className="min-h-screen bg-background">
      <HomeFloatingHeader />
      <main
        className={cn(
          // Mobile header is not fixed; keep content tight.
          mainPt ?? "pt-8 md:pt-28 lg:pt-[7.2rem]",
          mobileMainPb ? cn(mobileMainPb, "lg:pb-0") : "pb-32 lg:pb-0"
        )}
      >
        {children}
      </main>
      <div className="lg:hidden">
        <MobileBottomNav />
        {showFab ? <MobileFab /> : null}
      </div>
      <div className="hidden lg:block">
        <DesktopSiteFooter />
      </div>
    </div>
  );
}
