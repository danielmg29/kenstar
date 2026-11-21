import { SiteHeader } from "./_components/SiteHeader";
import { ShowroomCarousel } from "./_components/ShowroomCarousel";
import { Journey } from "./_components/journey/Journey";
import { Showroom } from "./_components/Showroom";
import { Services } from "./_components/Services";
import { Enquiry } from "./_components/Enquiry";
import { SiteFooter } from "./_components/SiteFooter";
import { MobileActionBar } from "./_components/MobileActionBar";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <ShowroomCarousel />
        <Journey />
        <Showroom />
        <Services />
        <Enquiry />
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
