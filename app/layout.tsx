import type { Metadata, Viewport } from "next";
import { Archivo, Barlow_Semi_Condensed, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { LogoLoader } from "./_components/loader/LogoLoader";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const barlow = Barlow_Semi_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// The approved redesign's faces. Sections move to them one by one; Archivo and Barlow go when the last old section does.
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  // Where the site is served; Next resolves social and canonical URLs against it.
  metadataBase: new URL("https://hardware.silvavalley.co.ke"),
  title: "Kenstar Limited | Hardware & home showroom, Embu",
  description:
    "Hardware, electricals, bathroom, finishing, furniture and lighting at the Kenstar showroom on Market Road, Embu. Construction, civil works and roadworks too.",
};

export const viewport: Viewport = {
  themeColor: "#14283b",
};

// Decides before first paint how the logo loader covers this page load: the full intro on the
// first page of a session (or whenever the URL carries ?intro), the loading screen after that,
// nothing with reduced motion. Without JavaScript the CSS failsafe uncovers the page.
const loaderGate = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var force=/[?&]intro(=|&|$)/.test(location.search);d.setAttribute('data-ll',force||!sessionStorage.getItem('ks-intro')?'intro':'loader');d.classList.add('ll-on')}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${barlow.variable} ${manrope.variable} ${inter.variable}`}
      // Lets Next switch smooth scrolling off while it resets scroll on a route change.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: loaderGate }} />
      </head>
      <body>
        <LogoLoader />
        {children}
      </body>
    </html>
  );
}
