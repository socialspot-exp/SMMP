import { DesktopHome } from "@/components/home/desktop-home";
import { MobileHome } from "@/components/home/mobile-home";

export default function Home() {
  return (
    <>
      <div className="min-h-[max(884px,100dvh)] bg-background lg:hidden">
        <MobileHome />
      </div>
      <div className="hidden lg:block">
        <DesktopHome />
      </div>
    </>
  );
}
