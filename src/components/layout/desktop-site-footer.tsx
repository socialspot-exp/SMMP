import Link from "next/link";
import { BadgeCheck, Globe, Languages, Mail } from "lucide-react";

export function DesktopSiteFooter() {
  return (
    <footer className="w-full border-t border-[#abadb1]/15 bg-[#ffffff]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-8 py-16 md:grid-cols-4">
        <div className="space-y-6">
          <span className="text-lg font-bold text-[#2c2f32]">Curator Market</span>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            The premium marketplace for elite social media services and high-end digital assets.
            Grow your legacy today.
          </p>
          <div className="flex gap-4">
            <Globe
              className="h-6 w-6 cursor-pointer text-on-surface-variant transition-colors hover:text-primary"
              strokeWidth={2}
              aria-hidden
            />
            <Mail
              className="h-6 w-6 cursor-pointer text-on-surface-variant transition-colors hover:text-primary"
              strokeWidth={2}
              aria-hidden
            />
          </div>
        </div>
        <div>
          <h4 className="mb-6 font-headline text-sm font-bold tracking-widest uppercase">
            Platform
          </h4>
          <ul className="space-y-3 text-sm leading-relaxed">
            <li>
              <Link
                href="/"
                className="block text-on-surface-variant transition-transform duration-200 hover:translate-x-1 hover:text-primary"
              >
                Marketplace
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="block text-on-surface-variant transition-transform duration-200 hover:translate-x-1 hover:text-primary"
              >
                Services
              </Link>
            </li>
            <li>
              <a
                className="block text-on-surface-variant transition-transform duration-200 hover:translate-x-1 hover:text-primary"
                href="#"
              >
                API Documentation
              </a>
            </li>
            <li>
              <a
                className="block text-on-surface-variant transition-transform duration-200 hover:translate-x-1 hover:text-primary"
                href="#"
              >
                Affiliate Program
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 font-headline text-sm font-bold tracking-widest uppercase">
            Support
          </h4>
          <ul className="space-y-3 text-sm leading-relaxed">
            {["Contact Support", "Privacy Policy", "Terms of Service", "Refunds"].map((l) => (
              <li key={l}>
                <a
                  className="block text-on-surface-variant transition-transform duration-200 hover:translate-x-1 hover:text-primary"
                  href="#"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="mb-6 font-headline text-sm font-bold tracking-widest uppercase">
            Stay Updated
          </h4>
          <div className="flex rounded-lg bg-surface-container-low p-2">
            <input
              className="w-full border-none bg-transparent px-4 text-sm focus:ring-0"
              placeholder="Email Address"
              type="email"
              aria-label="Email for newsletter"
            />
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary"
            >
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto flex flex-col items-center justify-between gap-4 border-t border-[#abadb1]/15 px-8 py-8 md:flex-row">
        <span className="text-sm text-on-surface-variant">
          © 2024 Curator Market. High-end SMM &amp; Premium Assets.
        </span>
        <div className="flex gap-6">
          <Languages className="h-5 w-5 text-on-surface-variant" strokeWidth={2} aria-hidden />
          <BadgeCheck className="h-5 w-5 text-on-surface-variant" strokeWidth={2} aria-hidden />
        </div>
      </div>
    </footer>
  );
}
